import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import knexFactory from 'knex'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { hash } from '@node-rs/argon2'
import { authenticateAdmin, createAdminSession, requireAdminSession, revokeAdminSession } from '../../server/utils/admin-auth.js'
import { createDemoRequest } from '../../server/utils/demo-requests.js'
import { consumeRateLimit } from '../../server/utils/rate-limit.js'
import { updateLeadStatus } from '../../server/utils/lead-workflow.js'
import { createFollowUp } from '../../server/utils/lead-follow-ups.js'
import { configureUtcConnection } from '../../server/utils/database.js'
import { getAdminDashboard } from '../../server/utils/admin-dashboard.js'
import { changeAdminPassword } from '../../server/utils/admin-account.js'
import { verifyAdminPassword } from '../../server/utils/admin-credentials.js'
import { scheduleLeadDemo } from '../../server/utils/lead-demo.js'
import { countUnreadLeads, markLeadRead } from '../../server/utils/lead-read-state.js'

const databaseUrl = process.env.TEST_DATABASE_URL
const suite = databaseUrl ? describe : describe.skip
const migrationsDirectory = fileURLToPath(new URL('../../migrations', import.meta.url))

suite('MariaDB integration', () => {
  let db
  let admin
  const secret = 'integration-secret-'.padEnd(48, 's')

  beforeAll(async () => {
    db = knexFactory({ client: 'mysql2', connection: databaseUrl, pool: { min: 0, max: 6, afterCreate: configureUtcConnection } })
    await db.migrate.latest({ directory: migrationsDirectory })
    await db.migrate.latest({ directory: migrationsDirectory })
    await db('admin_lead_read_state').del()
    await db('lead_follow_ups').del()
    await db('admin_sessions').del()
    await db('lead_audit').del()
    await db('leads').del()
    await db('admin_users').del()
    await db('rate_limits').del()
    const passwordHash = await hash('Stage2-Test-Password!')
    admin = { id: randomUUID(), username: 'stage2-admin', credentialVersion: 1 }
    await db('admin_users').insert({ id: admin.id, username: admin.username, password_hash: passwordHash, enabled: true, credential_version: 1, created_at: new Date(), updated_at: new Date() })

    globalThis.getRequestIP = event => event.address || '127.0.0.1'
    globalThis.getCookie = (event, name) => event.cookies?.[name]
    globalThis.setCookie = (event, name, value) => { event.cookies ||= {}; event.cookies[name] = value }
    globalThis.deleteCookie = (event, name) => { if (event.cookies) delete event.cookies[name] }
    globalThis.getRequestHeader = (event, name) => event.headers?.[name.toLowerCase()]
    globalThis.getRequestURL = event => new URL(event.url || 'http://127.0.0.1:3212')
  })

  afterAll(async () => db?.destroy())

  it('uses utf8mb4 and a non-root application account', async () => {
    const [userRows] = await db.raw('SELECT CURRENT_USER() AS currentUser')
    expect(userRows[0].currentUser.toLowerCase().startsWith('root@')).toBe(false)
    const [charsetRows] = await db.raw("SELECT CCSA.character_set_name AS charset FROM information_schema.TABLES T JOIN information_schema.COLLATION_CHARACTER_SET_APPLICABILITY CCSA ON CCSA.collation_name = T.table_collation WHERE T.table_schema = DATABASE() AND T.table_name = 'leads'")
    expect(charsetRows[0].charset).toBe('utf8mb4')
    const [timeZoneRows] = await db.raw('SELECT @@session.time_zone AS timeZone')
    expect(timeZoneRows[0].timeZone).toBe('+00:00')
  })

  it('creates the required indexes, enum constraint and audit foreign key', async () => {
    const [indexRows] = await db.raw('SHOW INDEX FROM leads')
    const indexNames = new Set(indexRows.map(row => row.Key_name))
    for (const indexName of ['PRIMARY', 'leads_status_created_idx', 'leads_phone_idx', 'leads_name_idx', 'idx_leads_updated_at']) {
      expect(indexNames).toContain(indexName)
    }
    expect(indexRows.some(row => row.Column_name === 'idempotency_key' && Number(row.Non_unique) === 0)).toBe(true)

    const [statusRows] = await db.raw("SELECT COLUMN_TYPE AS columnType FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads' AND COLUMN_NAME = 'status'")
    expect(statusRows[0].columnType).toContain("enum('PENDING','CONTACTED','DEMO_SCHEDULED','DEMO_COMPLETED','WON','ON_HOLD','INVALID','CLOSED')")

    const [foreignKeyRows] = await db.raw("SELECT CONSTRAINT_NAME AS constraintName FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'lead_audit'")
    expect(foreignKeyRows.map(row => row.constraintName)).toContain('lead_audit_lead_fk')
    const [sessionIndexRows] = await db.raw('SHOW INDEX FROM admin_sessions')
    expect(new Set(sessionIndexRows.map(row => row.Key_name))).toContain('idx_admin_sessions_revoked_at')
    expect(await db.schema.hasTable('admin_lead_read_state')).toBe(true)
    expect(await db.schema.hasColumn('leads', 'demo_scheduled_at')).toBe(true)
    expect(await db.schema.hasColumn('leads', 'reference_code')).toBe(true)
    expect(await db.schema.hasColumn('leads', 'idempotency_digest')).toBe(true)
    expect(await db.schema.hasColumn('lead_follow_ups', 'result')).toBe(true)
    expect(await db.schema.hasColumn('lead_follow_ups', 'next_plan')).toBe(true)
    expect(indexNames).toContain('leads_demo_scheduled_idx')
    expect(indexNames).toContain('leads_status_next_follow_idx')
  })

  it('rolls back failed transactions', async () => {
    await expect(db.transaction(async (trx) => { await trx('leads').insert({ id: '00000000-0000-4000-8000-000000000001', reference_code: 'KW-TEST-ROLLBACK', idempotency_digest: '1'.repeat(64), name: '回滚测试', phone: '+8613800000001', park_count: 1, status: 'PENDING', source_page: '/demo', remark: '', privacy_consent_at: new Date(), privacy_version: 'test', idempotency_key: 'rollback-test-key-000000000000', version: 1, created_at: new Date(), updated_at: new Date() }); throw new Error('rollback') })).rejects.toThrow('rollback')
    expect(Number((await db('leads').where({ name: '回滚测试' }).count({ count: '*' }).first()).count)).toBe(0)
  })

  it('rolls back the lead when the initial audit insert fails', async () => {
    const idempotencyKey = 'forced-audit-failure-key-00000001'
    const auditCountBefore = Number((await db('lead_audit').count({ count: '*' }).first()).count)
    await db.raw('DROP TRIGGER IF EXISTS kwzg_test_fail_initial_audit')
    await db.raw("CREATE TRIGGER kwzg_test_fail_initial_audit BEFORE INSERT ON lead_audit FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'forced audit failure'")
    try {
      await expect(createDemoRequest(db, { name: '自动化事务测试', phone: '+8613700000001', parkCount: 2 }, {
        secret,
        clientAddress: '127.0.0.31',
        idempotencyKey,
        now: new Date(),
      })).rejects.toThrow()
    } finally {
      await db.raw('DROP TRIGGER IF EXISTS kwzg_test_fail_initial_audit')
    }
    expect(Number((await db('leads').where({ idempotency_key: idempotencyKey }).count({ count: '*' }).first()).count)).toBe(0)
    expect(Number((await db('lead_audit').count({ count: '*' }).first()).count)).toBe(auditCountBefore)
  })

  it('suppresses concurrent idempotent submissions and writes audit once', async () => {
    const input = { name: '演示联系人', phone: '+8613800000000', parkCount: 2 }
    const context = { secret, clientAddress: '127.0.0.10', idempotencyKey: 'concurrent-request-key-00000000001', now: new Date() }
    const results = await Promise.all([createDemoRequest(db, input, context), createDemoRequest(db, input, context)])
    expect(results.filter(result => !result.duplicate)).toHaveLength(1)
    expect(Number((await db('leads').where({ idempotency_key: context.idempotencyKey }).count({ count: '*' }).first()).count)).toBe(1)
    expect(Number((await db('lead_audit').count({ count: '*' }).first()).count)).toBe(1)
  })

  it('enforces persisted rate limits', async () => {
    const options = { bucketKey: 'f'.repeat(64), action: 'test', maxHits: 2, windowMs: 60000, now: new Date() }
    expect((await consumeRateLimit(db, options)).allowed).toBe(true)
    expect((await consumeRateLimit(db, options)).allowed).toBe(true)
    expect((await consumeRateLimit(db, options)).allowed).toBe(false)
  })

  it('rejects concurrent lead overwrites and rolls audit into the same transaction', async () => {
    const lead = await db('leads').where({ idempotency_key: 'concurrent-request-key-00000000001' }).first()
    const context = { admin, requestId: 'integration-status', sourceIp: '127.0.0.1' }
    const result = await updateLeadStatus(db, lead.id, { status: 'CONTACTED', note: '已电话沟通', version: 1 }, context)
    expect(result.version).toBe(2)
    await expect(updateLeadStatus(db, lead.id, { status: 'DEMO_COMPLETED', note: '并发旧版本', version: 1 }, context)).rejects.toMatchObject({ code: 'VERSION_CONFLICT' })
    const followUp = await createFollowUp(db, lead.id, { contactMethod: 'PHONE', content: '已确认演示需求', result: '客户确认继续了解', nextPlan: '安排线上演示', nextFollowUpAt: null, version: 2 }, context)
    expect(followUp.version).toBe(3)
    expect(Number((await db('lead_follow_ups').where({ lead_id: lead.id }).count({ count: '*' }).first()).count)).toBe(1)
  })

  it('authenticates, rate limits, rotates, expires, validates CSRF and revokes server sessions', async () => {
    const config = { sessionPassword: secret, trustedProxyAddresses: '', trustedOrigins: '', public: { siteUrl: 'http://127.0.0.1:3212' } }
    const event = { address: '127.0.0.20', cookies: {}, headers: {}, url: 'http://127.0.0.1:3212', context: { requestId: 'integration-auth' } }
    await expect(authenticateAdmin(db, config, event, 'stage2-admin', 'wrong')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    await expect(authenticateAdmin(db, config, { ...event, address: '127.0.0.21' }, 'wrong-admin', 'Stage2-Test-Password!')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    const bruteEvent = { ...event, address: '127.0.0.22' }
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await expect(authenticateAdmin(db, config, bruteEvent, 'brute-admin', 'Stage2-Test-Password!')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    }
    await expect(authenticateAdmin(db, config, bruteEvent, 'brute-admin', 'Stage2-Test-Password!')).rejects.toMatchObject({ code: 'RATE_LIMITED' })
    const authenticatedAdmin = await authenticateAdmin(db, config, event, 'stage2-admin', 'Stage2-Test-Password!')
    await createAdminSession(db, config, event, authenticatedAdmin)
    const firstCookie = event.cookies.kwzg_admin_session
    await createAdminSession(db, config, event, authenticatedAdmin)
    expect(event.cookies.kwzg_admin_session).not.toBe(firstCookie)
    const session = await requireAdminSession(db, config, event)
    expect(session.revoked_at).toBeNull()
    event.headers = { origin: 'http://127.0.0.1:3212', 'x-csrf-token': 'wrong-csrf-token' }
    await expect(requireAdminSession(db, config, event, { csrf: true })).rejects.toMatchObject({ code: 'CSRF_REJECTED' })
    event.headers = {}
    await db('admin_sessions').where({ token_hash: session.tokenHash }).update({ expires_at: new Date(Date.now() - 1000) })
    await expect(requireAdminSession(db, config, event)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect((await db('admin_sessions').where({ token_hash: session.tokenHash }).first()).revoked_at).not.toBeNull()
    await createAdminSession(db, config, event, authenticatedAdmin)
    await revokeAdminSession(db, config, event)
    await expect(requireAdminSession(db, config, event)).rejects.toMatchObject({ code: 'AUTHENTICATION_REQUIRED' })
  })

  it('computes real workbench metrics, per-admin unread state and transactional demo scheduling', async () => {
    await db('admin_lead_read_state').del()
    await db('lead_follow_ups').del()
    await db('lead_audit').whereNotNull('lead_id').del()
    await db('leads').del()
    const now = new Date('2026-08-25T04:00:00.000Z')
    const base = { phone: '+8613900000000', park_count: 2, source_page: '/demo', remark: '', privacy_consent_at: now, privacy_version: 'test', version: 1, updated_at: now }
    const ids = {
      pending: randomUUID(), today: randomUUID(), overdue: randomUUID(), demo: randomUUID(), won: randomUUID(),
    }
    await db('leads').insert([
      { ...base, id: ids.pending, reference_code: 'KW-TEST-PENDING', idempotency_digest: '2'.repeat(64), name: 'TEST-STAGE22-PENDING', status: 'PENDING', idempotency_key: 'TEST-STAGE22-PENDING', created_at: new Date(now.getTime() - 60 * 60 * 1000), next_follow_up_at: null },
      { ...base, id: ids.today, reference_code: 'KW-TEST-TODAY', idempotency_digest: '3'.repeat(64), name: 'TEST-STAGE22-TODAY', status: 'CONTACTED', idempotency_key: 'TEST-STAGE22-TODAY', created_at: new Date(now.getTime() - 2 * 86400000), next_follow_up_at: new Date(now.getTime() + 60 * 60 * 1000) },
      { ...base, id: ids.overdue, reference_code: 'KW-TEST-OVERDUE', idempotency_digest: '4'.repeat(64), name: 'TEST-STAGE22-OVERDUE', status: 'CONTACTED', idempotency_key: 'TEST-STAGE22-OVERDUE', created_at: new Date(now.getTime() - 3 * 86400000), next_follow_up_at: new Date(now.getTime() - 60 * 60 * 1000) },
      { ...base, id: ids.demo, reference_code: 'KW-TEST-DEMO', idempotency_digest: '5'.repeat(64), name: 'TEST-STAGE22-DEMO', status: 'DEMO_SCHEDULED', idempotency_key: 'TEST-STAGE22-DEMO', created_at: new Date(now.getTime() - 4 * 86400000), demo_scheduled_at: new Date(now.getTime() + 2 * 86400000), demo_method: 'ONLINE', demo_note: 'TEST-STAGE22-DEMO', next_follow_up_at: null },
      { ...base, id: ids.won, reference_code: 'KW-TEST-WON', idempotency_digest: '6'.repeat(64), name: 'TEST-STAGE22-WON', status: 'WON', idempotency_key: 'TEST-STAGE22-WON', created_at: new Date(now.getTime() - 5 * 86400000), next_follow_up_at: null },
    ])
    await db('lead_audit').insert({ lead_id: ids.won, admin_user_id: admin.id, operation_type: 'STATUS_CHANGED', old_status: 'DEMO_COMPLETED', new_status: 'WON', remark_changed: false, before_summary: '已完成演示', after_summary: '已成交', note_summary: 'TEST-STAGE22-WON', request_id: 'TEST-STAGE22', source_ip: null, operated_at: now })
    const dashboard = await getAdminDashboard(db, admin.id, now, 8)
    expect(dashboard.metrics).toMatchObject({ todayNew: 1, pending: 1, todayFollowUp: 2, overdue: 1, demoScheduled: 1, monthlyWon: 1, unread: 5 })
    expect(dashboard.tasks.pending[0].name).toBe('TEST-STAGE22-PENDING')
    expect(dashboard.tasks.today.map((lead) => lead.name)).toEqual(['TEST-STAGE22-OVERDUE', 'TEST-STAGE22-TODAY'])
    expect(dashboard.tasks.overdue[0].name).toBe('TEST-STAGE22-OVERDUE')

    await markLeadRead(db, admin.id, ids.pending, now)
    expect(await countUnreadLeads(db, admin.id)).toBe(4)
    const otherAdmin = { id: randomUUID(), username: 'stage22-other' }
    await db('admin_users').insert({ id: otherAdmin.id, username: otherAdmin.username, password_hash: await hash('Stage22-Other-Password!'), enabled: true, credential_version: 1, created_at: now, updated_at: now })
    expect(await countUnreadLeads(db, otherAdmin.id)).toBe(5)

    const contacted = await updateLeadStatus(db, ids.pending, { status: 'CONTACTED', note: 'TEST-STAGE22-CONTACTED', version: 1 }, { admin, requestId: 'TEST-STAGE22', sourceIp: '127.0.0.1' }, now)
    expect(contacted.status).toBe('CONTACTED')
    expect(await countUnreadLeads(db, admin.id)).toBe(4)
    const scheduled = await scheduleLeadDemo(db, ids.pending, { version: 2, demoScheduledAt: new Date(now.getTime() + 86400000).toISOString(), demoMethod: 'ONLINE', note: 'TEST-STAGE22-SCHEDULE' }, { admin, requestId: 'TEST-STAGE22', sourceIp: '127.0.0.1' }, now)
    expect(scheduled.status).toBe('DEMO_SCHEDULED')
    expect(Number((await db('lead_audit').where({ lead_id: ids.pending, operation_type: 'DEMO_SCHEDULED' }).count({ count: '*' }).first()).count)).toBe(1)
  })

  it('changes administrator passwords with Argon2id and revokes every active session', async () => {
    const now = new Date('2026-08-25T06:00:00.000Z')
    const adminRow = await db('admin_users').where({ id: admin.id }).first()
    await db('admin_sessions').insert([
      { token_hash: 'a'.repeat(64), csrf_token_hash: 'c'.repeat(64), admin_user_id: admin.id, credential_version: adminRow.credential_version, created_at: now, last_activity_at: now, expires_at: new Date(now.getTime() + 60000), absolute_expires_at: new Date(now.getTime() + 120000), revoked_at: null },
      { token_hash: 'b'.repeat(64), csrf_token_hash: 'd'.repeat(64), admin_user_id: admin.id, credential_version: adminRow.credential_version, created_at: now, last_activity_at: now, expires_at: new Date(now.getTime() + 60000), absolute_expires_at: new Date(now.getTime() + 120000), revoked_at: null },
    ])
    await changeAdminPassword(db, admin.id, admin.username, { currentPassword: 'Stage2-Test-Password!', newPassword: 'Stage22-New-Password!8', confirmPassword: 'Stage22-New-Password!8' }, { requestId: 'TEST-STAGE22-PASSWORD', sourceIp: '127.0.0.1' }, now)
    const updated = await db('admin_users').where({ id: admin.id }).first()
    expect(updated.password_hash.startsWith('$argon2id$')).toBe(true)
    expect(await verifyAdminPassword(updated.password_hash, 'Stage22-New-Password!8')).toBe(true)
    expect(Number((await db('admin_sessions').where({ admin_user_id: admin.id }).whereNull('revoked_at').count({ count: '*' }).first()).count)).toBe(0)
    expect(Number((await db('lead_audit').where({ admin_user_id: admin.id, operation_type: 'ADMIN_PASSWORD_CHANGED' }).count({ count: '*' }).first()).count)).toBe(1)
  })

  it('rolls back and reapplies the versioned migration cleanly', async () => {
    await db('admin_lead_read_state').del()
    await db('lead_follow_ups').del()
    await db('admin_sessions').del()
    await db('lead_audit').del()
    await db('leads').del()
    await db('admin_users').del()
    await db('rate_limits').del()
    await db.migrate.rollback({ directory: migrationsDirectory }, true)
    expect(await db.schema.hasTable('leads')).toBe(false)
    await db.migrate.latest({ directory: migrationsDirectory })
    expect(await db.schema.hasTable('leads')).toBe(true)
  })
})
