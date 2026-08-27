import { hashAdminPassword, validateAdminPassword, verifyAdminPassword } from './admin-credentials.js'
import { appendAudit, AUDIT_EVENTS } from './audit.js'
import { createKwError } from './business-error.js'
import { keyedDigest, safeEqual } from './security.js'

function maskIp(value) {
  const ip = String(value || '')
  if (!ip) return '未记录'
  if (ip.includes(':')) return `${ip.split(':').slice(0, 3).join(':')}:****`
  const parts = ip.split('.')
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : '已脱敏'
}

function deviceLabel(userAgent) {
  const value = String(userAgent || '')
  const browser = /Edg\//.test(value) ? 'Edge' : /Chrome\//.test(value) ? 'Chrome' : /Firefox\//.test(value) ? 'Firefox' : /Safari\//.test(value) ? 'Safari' : '未知浏览器'
  const system = /Windows/.test(value) ? 'Windows' : /Android/.test(value) ? 'Android' : /iPhone|iPad/.test(value) ? 'iOS' : /Mac OS/.test(value) ? 'macOS' : '未知设备'
  return `${browser} · ${system}`
}

function publicSessionId(config, tokenHash) {
  return keyedDigest(config.sessionPassword, 'session-public-id', tokenHash).slice(0, 32)
}

export async function listAdminSessions(db, config, adminId, currentTokenHash, now = new Date()) {
  const rows = await db('admin_sessions').select('token_hash', 'created_at', 'last_activity_at', 'expires_at', 'absolute_expires_at', 'user_agent', 'source_ip').where({ admin_user_id: adminId }).whereNull('revoked_at').where('absolute_expires_at', '>', now).orderBy('last_activity_at', 'desc')
  return rows.map(row => ({ id: publicSessionId(config, row.token_hash), createdAt: row.created_at, lastActivityAt: row.last_activity_at, expiresAt: row.expires_at, absoluteExpiresAt: row.absolute_expires_at, device: deviceLabel(row.user_agent), ip: maskIp(row.source_ip), current: safeEqual(row.token_hash, currentTokenHash) }))
}

export async function revokeOtherAdminSession(db, config, adminId, currentTokenHash, sessionId, context, now = new Date()) {
  const rows = await db('admin_sessions').select('token_hash').where({ admin_user_id: adminId }).whereNull('revoked_at')
  const target = rows.find(row => safeEqual(publicSessionId(config, row.token_hash), String(sessionId || '')))
  if (!target) throw createKwError(404, 'SESSION_NOT_FOUND', '未找到该会话。')
  if (safeEqual(target.token_hash, currentTokenHash)) throw createKwError(422, 'CURRENT_SESSION_PROTECTED', '当前会话不能在这里撤销。')
  await db.transaction(async (trx) => {
    await trx('admin_sessions').where({ token_hash: target.token_hash, admin_user_id: adminId }).whereNull('revoked_at').update({ revoked_at: now })
    await appendAudit(trx, { adminUserId: adminId, eventType: AUDIT_EVENTS.ADMIN_SESSION_REVOKED, afterSummary: '撤销一个其他设备会话', requestId: context.requestId, sourceIp: context.sourceIp, now })
  })
}

export async function revokeOtherAdminSessions(db, adminId, currentTokenHash, context, now = new Date()) {
  return db.transaction(async (trx) => {
    const count = await trx('admin_sessions').where({ admin_user_id: adminId }).whereNot({ token_hash: currentTokenHash }).whereNull('revoked_at').update({ revoked_at: now })
    await appendAudit(trx, { adminUserId: adminId, eventType: AUDIT_EVENTS.ADMIN_SESSION_REVOKED, afterSummary: `退出其他设备 ${count} 个会话`, requestId: context.requestId, sourceIp: context.sourceIp, now })
    return Number(count)
  })
}

export async function changeAdminPassword(db, adminId, username, input, context, now = new Date()) {
  if (input.newPassword !== input.confirmPassword) throw createKwError(422, 'PASSWORD_CONFIRMATION_MISMATCH', '两次输入的新密码不一致。')
  const newPassword = validateAdminPassword(input.newPassword, username)
  return db.transaction(async (trx) => {
    const admin = await trx('admin_users').where({ id: adminId }).forUpdate().first()
    if (!admin || !admin.enabled) throw createKwError(401, 'ACCOUNT_UNAVAILABLE', '管理员账号不可用。')
    if (!(await verifyAdminPassword(admin.password_hash, input.currentPassword))) throw createKwError(401, 'CURRENT_PASSWORD_INVALID', '当前密码不正确。')
    if (await verifyAdminPassword(admin.password_hash, newPassword)) throw createKwError(422, 'PASSWORD_UNCHANGED', '新密码不能与当前密码相同。')
    const passwordHash = await hashAdminPassword(newPassword)
    const credentialVersion = admin.credential_version + 1
    await trx('admin_users').where({ id: admin.id }).update({ password_hash: passwordHash, credential_version: credentialVersion, updated_at: now })
    if (context.currentTokenHash) await trx('admin_sessions').where({ token_hash: context.currentTokenHash }).update({ credential_version: credentialVersion })
    let revokedSessions = 0
    if (!context.currentTokenHash) revokedSessions = await trx('admin_sessions').where({ admin_user_id: admin.id }).whereNull('revoked_at').update({ revoked_at: now })
    else if (input.revokeOtherSessions) revokedSessions = await trx('admin_sessions').where({ admin_user_id: admin.id }).whereNot({ token_hash: context.currentTokenHash }).whereNull('revoked_at').update({ revoked_at: now })
    await appendAudit(trx, { adminUserId: admin.id, eventType: AUDIT_EVENTS.ADMIN_PASSWORD_CHANGED, afterSummary: input.revokeOtherSessions ? `密码已修改并退出其他设备 ${revokedSessions} 个会话` : '管理员主动修改密码', requestId: context.requestId, sourceIp: context.sourceIp, now })
    return { credentialVersion, revokedSessions: Number(revokedSessions) }
  })
}
