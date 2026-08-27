import { hash, verify } from '@node-rs/argon2'
import { appendAudit, AUDIT_EVENTS } from './audit.js'
import { createKwError } from './business-error.js'
import { enforceRateLimit } from './rate-limit.js'
import { assertSameOrigin, getClientAddress, keyedDigest, randomToken, safeEqual } from './security.js'

export const SESSION_COOKIE = 'kwzg_admin_session'
export const LOGIN_CSRF_COOKIE = 'kwzg_login_csrf'
const IDLE_TIMEOUT_MS = 30 * 60 * 1000
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000
let dummyPasswordHashPromise

function cookieOptions(config, maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: String(config.public?.siteUrl || '').startsWith('https://'),
    maxAge,
  }
}

async function dummyPasswordHash() {
  dummyPasswordHashPromise ||= hash(randomToken(32), {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  })
  return dummyPasswordHashPromise
}

export function createLoginCsrf(event, config) {
  const token = randomToken(32)
  const expires = Date.now() + 10 * 60 * 1000
  const signature = keyedDigest(config.sessionPassword, 'login-csrf', `${token}.${expires}`)
  setCookie(event, LOGIN_CSRF_COOKIE, `${expires}.${signature}`, cookieOptions(config, 10 * 60))
  return token
}

export function validateLoginCsrf(event, config) {
  assertSameOrigin(event, config.trustedOrigins)
  const token = getRequestHeader(event, 'x-csrf-token') || ''
  const cookie = getCookie(event, LOGIN_CSRF_COOKIE) || ''
  const [expiresText, signature] = cookie.split('.')
  const expires = Number(expiresText)

  if (!token || !signature || !Number.isFinite(expires) || expires <= Date.now()) {
    throw createKwError(403, 'CSRF_REJECTED', '安全校验已过期，请刷新页面后重试。')
  }

  const expected = keyedDigest(config.sessionPassword, 'login-csrf', `${token}.${expires}`)
  if (!safeEqual(signature, expected)) {
    throw createKwError(403, 'CSRF_REJECTED', '安全校验失败，请刷新页面后重试。')
  }
}

export async function authenticateAdmin(db, config, event, username, password) {
  const normalizedUsername = typeof username === 'string' ? username.normalize('NFKC').trim().toLowerCase() : ''
  const suppliedPassword = typeof password === 'string' ? password : ''

  if (!normalizedUsername || normalizedUsername.length > 64 || !suppliedPassword || suppliedPassword.length > 256) {
    throw createKwError(401, 'INVALID_CREDENTIALS', '账号或密码错误。')
  }

  const address = getClientAddress(event, config.trustedProxyAddresses)
  const accountDigest = keyedDigest(config.sessionPassword, 'login-account', normalizedUsername)
  const bucketKey = keyedDigest(config.sessionPassword, 'login-rate', `${address}|${accountDigest}`)
  await enforceRateLimit(db, {
    bucketKey,
    action: 'admin-login',
    maxHits: 8,
    windowMs: 15 * 60 * 1000,
    now: new Date(),
  })

  const admin = await db('admin_users').whereRaw('LOWER(username) = ?', [normalizedUsername]).first()
  const candidateHash = admin?.password_hash || await dummyPasswordHash()
  if (admin && !String(candidateHash).startsWith('$argon2id$')) {
    throw createKwError(503, 'SERVER_CONFIGURATION_ERROR', '服务暂时不可用，请稍后再试。')
  }

  let passwordMatches = false
  try {
    passwordMatches = await verify(String(candidateHash), suppliedPassword)
  } catch {
    if (admin) throw createKwError(503, 'SERVER_CONFIGURATION_ERROR', '服务暂时不可用，请稍后再试。')
  }

  const now = new Date()
  if (!admin || !admin.enabled || !passwordMatches) {
    await appendAudit(db, {
      adminUserId: admin?.id,
      eventType: AUDIT_EVENTS.ADMIN_LOGIN_FAILED,
      noteSummary: '凭证无效或账号不可用',
      requestId: event.context?.requestId,
      sourceIp: address,
      now,
    })
    throw createKwError(401, 'INVALID_CREDENTIALS', '账号或密码错误。')
  }

  await db.transaction(async (trx) => {
    await trx('admin_users').where({ id: admin.id }).update({ last_login_at: now, updated_at: now })
    await appendAudit(trx, {
      adminUserId: admin.id,
      eventType: AUDIT_EVENTS.ADMIN_LOGIN_SUCCEEDED,
      afterSummary: '管理员登录成功',
      requestId: event.context?.requestId,
      sourceIp: address,
      now,
    })
  })

  return { id: admin.id, username: admin.username, credentialVersion: admin.credential_version }
}

export async function enforceAdminApiRateLimit(db, config, event, session, action, maxHits = 120, windowMs = 60 * 1000) {
  const address = getClientAddress(event, config.trustedProxyAddresses)
  const bucketKey = keyedDigest(config.sessionPassword, 'admin-api-rate', `${session.admin.id}|${address}|${action}`)
  return enforceRateLimit(db, { bucketKey, action: `admin-${action}`, maxHits, windowMs, now: new Date() })
}

export async function createAdminSession(db, config, event, admin) {
  const currentToken = getCookie(event, SESSION_COOKIE)
  if (currentToken) {
    const currentHash = keyedDigest(config.sessionPassword, 'session', currentToken)
    await db('admin_sessions').where({ token_hash: currentHash }).whereNull('revoked_at').update({ revoked_at: new Date() })
  }

  const now = new Date()
  await cleanupAdminSessions(db, now)
  const token = randomToken(48)
  const csrfToken = randomToken(32)
  const tokenHash = keyedDigest(config.sessionPassword, 'session', token)
  const csrfHash = keyedDigest(config.sessionPassword, 'csrf', csrfToken)
  const idleExpires = new Date(now.getTime() + IDLE_TIMEOUT_MS)
  const absoluteExpires = new Date(now.getTime() + ABSOLUTE_TIMEOUT_MS)

  await db('admin_sessions').insert({
    token_hash: tokenHash,
    csrf_token_hash: csrfHash,
    admin_user_id: admin.id,
    credential_version: admin.credentialVersion,
    created_at: now,
    last_activity_at: now,
    expires_at: idleExpires,
    absolute_expires_at: absoluteExpires,
    revoked_at: null,
    user_agent: String(getRequestHeader(event, 'user-agent') || '').slice(0, 255),
    source_ip: getClientAddress(event, config.trustedProxyAddresses),
  })

  setCookie(event, SESSION_COOKIE, token, cookieOptions(config, ABSOLUTE_TIMEOUT_MS / 1000))
  deleteCookie(event, LOGIN_CSRF_COOKIE, cookieOptions(config, 0))

  return { csrfToken }
}

export async function requireAdminSession(db, config, event, options = {}) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    throw createKwError(401, 'AUTHENTICATION_REQUIRED', '请先登录。')
  }

  const tokenHash = keyedDigest(config.sessionPassword, 'session', token)
  const session = await db({ session: 'admin_sessions' })
    .leftJoin({ admin: 'admin_users' }, 'admin.id', 'session.admin_user_id')
    .select('session.*', 'admin.username as admin_username', 'admin.enabled as admin_enabled', 'admin.credential_version as admin_credential_version', 'admin.created_at as admin_created_at', 'admin.last_login_at as admin_last_login_at', 'admin.updated_at as admin_updated_at')
    .where('session.token_hash', tokenHash)
    .whereNull('session.revoked_at')
    .first()
  const now = new Date()

  const expired = !session || new Date(session.expires_at) <= now || new Date(session.absolute_expires_at) <= now
  const invalidAdmin = session && (!session.admin_user_id || !session.admin_enabled || session.credential_version !== session.admin_credential_version)
  if (expired || invalidAdmin) {
    if (session) {
      await db('admin_sessions').where({ token_hash: tokenHash }).update({ revoked_at: now })
    }
    deleteCookie(event, SESSION_COOKIE, cookieOptions(config, 0))
    throw createKwError(401, expired ? 'SESSION_EXPIRED' : 'ACCOUNT_UNAVAILABLE', '登录已过期，请重新登录。')
  }

  const absoluteExpires = new Date(session.absolute_expires_at)
  const idleExpires = new Date(Math.min(now.getTime() + IDLE_TIMEOUT_MS, absoluteExpires.getTime()))
  await db('admin_sessions').where({ token_hash: tokenHash }).update({
    last_activity_at: now,
    expires_at: idleExpires,
  })

  if (options.csrf) {
    assertSameOrigin(event, config.trustedOrigins)
    const csrfToken = getRequestHeader(event, 'x-csrf-token') || ''
    const csrfHash = keyedDigest(config.sessionPassword, 'csrf', csrfToken)
    if (!csrfToken || !safeEqual(csrfHash, session.csrf_token_hash)) {
      throw createKwError(403, 'CSRF_REJECTED', '安全校验失败，请刷新页面后重试。')
    }
  }

  return {
    ...session,
    tokenHash,
    admin: {
      id: session.admin_user_id,
      username: session.admin_username,
      credentialVersion: session.admin_credential_version,
      createdAt: session.admin_created_at,
      lastLoginAt: session.admin_last_login_at,
      updatedAt: session.admin_updated_at,
    },
  }
}

export function clearAdminSessionCookie(config, event) {
  deleteCookie(event, SESSION_COOKIE, cookieOptions(config, 0))
}

export async function revokeAllAdminSessions(db, adminUserId, now = new Date()) {
  await db('admin_sessions').where({ admin_user_id: adminUserId }).whereNull('revoked_at').update({ revoked_at: now })
}

export async function cleanupAdminSessions(db, now = new Date()) {
  const revokedRetention = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  await db('admin_sessions').where('absolute_expires_at', '<=', now).orWhere(builder => builder.whereNotNull('revoked_at').andWhere('revoked_at', '<=', revokedRetention)).delete()
}

export async function rotateSessionCsrf(db, config, session) {
  const csrfToken = randomToken(32)
  const csrfHash = keyedDigest(config.sessionPassword, 'csrf', csrfToken)
  await db('admin_sessions').where({ token_hash: session.tokenHash }).update({ csrf_token_hash: csrfHash })
  return csrfToken
}

export async function revokeAdminSession(db, config, event) {
  const token = getCookie(event, SESSION_COOKIE)
  try {
    if (token) {
      const tokenHash = keyedDigest(config.sessionPassword, 'session', token)
      await db('admin_sessions').where({ token_hash: tokenHash }).update({ revoked_at: new Date() })
    }
  } finally {
    deleteCookie(event, SESSION_COOKIE, cookieOptions(config, 0))
  }
}
