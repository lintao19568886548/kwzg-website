import { verify } from '@node-rs/argon2'
import { createKwError } from './business-error.js'
import { enforceRateLimit } from './rate-limit.js'
import { assertSameOrigin, getClientAddress, keyedDigest, randomToken, safeEqual } from './security.js'

export const SESSION_COOKIE = 'kwzg_admin_session'
export const LOGIN_CSRF_COOKIE = 'kwzg_login_csrf'
const IDLE_TIMEOUT_MS = 30 * 60 * 1000
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  }
}

export function createLoginCsrf(event, config) {
  const token = randomToken(32)
  const expires = Date.now() + 10 * 60 * 1000
  const signature = keyedDigest(config.sessionPassword, 'login-csrf', `${token}.${expires}`)
  setCookie(event, LOGIN_CSRF_COOKIE, `${expires}.${signature}`, cookieOptions(10 * 60))
  return token
}

export function validateLoginCsrf(event, config) {
  assertSameOrigin(event)
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
  const normalizedUsername = typeof username === 'string' ? username.normalize('NFKC').trim() : ''
  const suppliedPassword = typeof password === 'string' ? password : ''

  if (!normalizedUsername || normalizedUsername.length > 128 || !suppliedPassword || suppliedPassword.length > 256) {
    throw createKwError(401, 'INVALID_CREDENTIALS', '账号或密码错误。')
  }

  const address = getClientAddress(event)
  const accountDigest = keyedDigest(config.sessionPassword, 'login-account', normalizedUsername.toLowerCase())
  const bucketKey = keyedDigest(config.sessionPassword, 'login-rate', `${address}|${accountDigest}`)
  await enforceRateLimit(db, {
    bucketKey,
    action: 'admin-login',
    maxHits: 8,
    windowMs: 15 * 60 * 1000,
    now: new Date(),
  })

  const configuredDigest = keyedDigest(config.sessionPassword, 'admin-name', String(config.adminUsername).toLowerCase())
  const suppliedDigest = keyedDigest(config.sessionPassword, 'admin-name', normalizedUsername.toLowerCase())
  let passwordMatches

  try {
    passwordMatches = await verify(String(config.adminPasswordHash), suppliedPassword)
  } catch {
    throw createKwError(503, 'SERVER_CONFIGURATION_ERROR', '服务暂时不可用，请稍后再试。')
  }

  if (!safeEqual(configuredDigest, suppliedDigest) || !passwordMatches) {
    throw createKwError(401, 'INVALID_CREDENTIALS', '账号或密码错误。')
  }
}

export async function createAdminSession(db, config, event) {
  const currentToken = getCookie(event, SESSION_COOKIE)
  if (currentToken) {
    const currentHash = keyedDigest(config.sessionPassword, 'session', currentToken)
    await db('admin_sessions').where({ token_hash: currentHash }).whereNull('revoked_at').update({ revoked_at: new Date() })
  }

  const now = new Date()
  const token = randomToken(48)
  const csrfToken = randomToken(32)
  const tokenHash = keyedDigest(config.sessionPassword, 'session', token)
  const csrfHash = keyedDigest(config.sessionPassword, 'csrf', csrfToken)
  const idleExpires = new Date(now.getTime() + IDLE_TIMEOUT_MS)
  const absoluteExpires = new Date(now.getTime() + ABSOLUTE_TIMEOUT_MS)

  await db('admin_sessions').insert({
    token_hash: tokenHash,
    csrf_token_hash: csrfHash,
    created_at: now,
    last_activity_at: now,
    expires_at: idleExpires,
    absolute_expires_at: absoluteExpires,
    revoked_at: null,
  })

  setCookie(event, SESSION_COOKIE, token, cookieOptions(ABSOLUTE_TIMEOUT_MS / 1000))
  deleteCookie(event, LOGIN_CSRF_COOKIE, { path: '/' })

  return { csrfToken }
}

export async function requireAdminSession(db, config, event, options = {}) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    throw createKwError(401, 'AUTHENTICATION_REQUIRED', '请先登录。')
  }

  const tokenHash = keyedDigest(config.sessionPassword, 'session', token)
  const session = await db('admin_sessions').where({ token_hash: tokenHash }).whereNull('revoked_at').first()
  const now = new Date()

  if (!session || new Date(session.expires_at) <= now || new Date(session.absolute_expires_at) <= now) {
    if (session) {
      await db('admin_sessions').where({ token_hash: tokenHash }).update({ revoked_at: now })
    }
    deleteCookie(event, SESSION_COOKIE, { path: '/' })
    throw createKwError(401, 'SESSION_EXPIRED', '登录已过期，请重新登录。')
  }

  const absoluteExpires = new Date(session.absolute_expires_at)
  const idleExpires = new Date(Math.min(now.getTime() + IDLE_TIMEOUT_MS, absoluteExpires.getTime()))
  await db('admin_sessions').where({ token_hash: tokenHash }).update({
    last_activity_at: now,
    expires_at: idleExpires,
  })

  if (options.csrf) {
    assertSameOrigin(event)
    const csrfToken = getRequestHeader(event, 'x-csrf-token') || ''
    const csrfHash = keyedDigest(config.sessionPassword, 'csrf', csrfToken)
    if (!csrfToken || !safeEqual(csrfHash, session.csrf_token_hash)) {
      throw createKwError(403, 'CSRF_REJECTED', '安全校验失败，请刷新页面后重试。')
    }
  }

  return { ...session, tokenHash }
}

export async function rotateSessionCsrf(db, config, session) {
  const csrfToken = randomToken(32)
  const csrfHash = keyedDigest(config.sessionPassword, 'csrf', csrfToken)
  await db('admin_sessions').where({ token_hash: session.tokenHash }).update({ csrf_token_hash: csrfHash })
  return csrfToken
}

export async function revokeAdminSession(db, config, event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    const tokenHash = keyedDigest(config.sessionPassword, 'session', token)
    await db('admin_sessions').where({ token_hash: tokenHash }).update({ revoked_at: new Date() })
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
