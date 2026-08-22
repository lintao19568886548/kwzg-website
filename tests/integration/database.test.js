import { fileURLToPath } from 'node:url'
import knexFactory from 'knex'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { hash } from '@node-rs/argon2'
import { authenticateAdmin, createAdminSession, requireAdminSession, revokeAdminSession } from '../../server/utils/admin-auth.js'
import { createDemoRequest } from '../../server/utils/demo-requests.js'
import { consumeRateLimit } from '../../server/utils/rate-limit.js'
import { updateLead } from '../../server/utils/leads.js'
import { configureUtcConnection } from '../../server/utils/database.js'

const databaseUrl = process.env.TEST_DATABASE_URL
const suite = databaseUrl ? describe : describe.skip
const migrationsDirectory = fileURLToPath(new URL('../../migrations', import.meta.url))

suite('MariaDB integration', () => {
  let db
  const secret = 'integration-secret-'.padEnd(48, 's')

  beforeAll(async () => {
    db = knexFactory({ client: 'mysql2', connection: databaseUrl, pool: { min: 0, max: 6, afterCreate: configureUtcConnection } })
    await db.migrate.latest({ directory: migrationsDirectory })
    await db.migrate.latest({ directory: migrationsDirectory })
    await db('lead_audit').del()
    await db('leads').del()
    await db('admin_sessions').del()
    await db('rate_limits').del()

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
    expect(statusRows[0].columnType).toContain("enum('待跟进','跟进中','已安排演示','已完成','无效')")

    const [foreignKeyRows] = await db.raw("SELECT CONSTRAINT_NAME AS constraintName FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'lead_audit'")
    expect(foreignKeyRows.map(row => row.constraintName)).toContain('lead_audit_lead_fk')
    const [sessionIndexRows] = await db.raw('SHOW INDEX FROM admin_sessions')
    expect(new Set(sessionIndexRows.map(row => row.Key_name))).toContain('idx_admin_sessions_revoked_at')
  })

  it('rolls back failed transactions', async () => {
    await expect(db.transaction(async (trx) => { await trx('leads').insert({ id: '00000000-0000-4000-8000-000000000001', name: '回滚测试', phone: '+8613800000001', park_count: 1, status: '待跟进', remark: '', privacy_consent_at: new Date(), privacy_version: 'test', idempotency_key: 'rollback-test-key-000000000000', version: 1, created_at: new Date(), updated_at: new Date() }); throw new Error('rollback') })).rejects.toThrow('rollback')
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
    const result = await updateLead(db, lead.id, { status: '跟进中', remark: '已电话沟通', version: 1 })
    expect(result.version).toBe(2)
    await expect(updateLead(db, lead.id, { status: '已完成', remark: '', version: 1 })).rejects.toMatchObject({ code: 'VERSION_CONFLICT' })
  })

  it('authenticates, rate limits, rotates, expires, validates CSRF and revokes server sessions', async () => {
    const passwordHash = await hash('Stage2-Test-Password!')
    const config = { adminUsername: 'stage2-admin', adminPasswordHash: passwordHash, sessionPassword: secret }
    const event = { address: '127.0.0.20', cookies: {}, headers: {}, url: 'http://127.0.0.1:3212' }
    await expect(authenticateAdmin(db, config, event, 'stage2-admin', 'wrong')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    await expect(authenticateAdmin(db, config, { ...event, address: '127.0.0.21' }, 'wrong-admin', 'Stage2-Test-Password!')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    const bruteEvent = { ...event, address: '127.0.0.22' }
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await expect(authenticateAdmin(db, config, bruteEvent, 'brute-admin', 'Stage2-Test-Password!')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    }
    await expect(authenticateAdmin(db, config, bruteEvent, 'brute-admin', 'Stage2-Test-Password!')).rejects.toMatchObject({ code: 'RATE_LIMITED' })
    await authenticateAdmin(db, config, event, 'stage2-admin', 'Stage2-Test-Password!')
    await createAdminSession(db, config, event)
    const firstCookie = event.cookies.kwzg_admin_session
    await createAdminSession(db, config, event)
    expect(event.cookies.kwzg_admin_session).not.toBe(firstCookie)
    const session = await requireAdminSession(db, config, event)
    expect(session.revoked_at).toBeNull()
    event.headers = { origin: 'http://127.0.0.1:3212', 'x-csrf-token': 'wrong-csrf-token' }
    await expect(requireAdminSession(db, config, event, { csrf: true })).rejects.toMatchObject({ code: 'CSRF_REJECTED' })
    event.headers = {}
    await db('admin_sessions').where({ token_hash: session.tokenHash }).update({ expires_at: new Date(Date.now() - 1000) })
    await expect(requireAdminSession(db, config, event)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect((await db('admin_sessions').where({ token_hash: session.tokenHash }).first()).revoked_at).not.toBeNull()
    await createAdminSession(db, config, event)
    await revokeAdminSession(db, config, event)
    await expect(requireAdminSession(db, config, event)).rejects.toMatchObject({ code: 'AUTHENTICATION_REQUIRED' })
  })

  it('rolls back and reapplies the versioned migration cleanly', async () => {
    await db.migrate.rollback({ directory: migrationsDirectory }, true)
    expect(await db.schema.hasTable('leads')).toBe(false)
    await db.migrate.latest({ directory: migrationsDirectory })
    expect(await db.schema.hasTable('leads')).toBe(true)
  })
})
