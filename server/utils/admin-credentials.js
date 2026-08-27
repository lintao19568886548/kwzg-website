import { hash, verify } from '@node-rs/argon2'
import { createKwError } from './business-error.js'

export function normalizeAdminUsername(value) {
  const username = String(value || '').normalize('NFKC').trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(username)) throw createKwError(422, 'INVALID_ADMIN_USERNAME', '管理员账号格式不正确。')
  return username
}

export function validateAdminPassword(value) {
  const password = typeof value === 'string' ? value : ''
  if (password.length === 0 || password.length > 128) {
    throw createKwError(422, 'INVALID_PASSWORD', '密码不能为空，且不能超过128个字符。')
  }
  return password
}

export function hashAdminPassword(password) {
  return hash(password, { algorithm: 2, memoryCost: 19456, timeCost: 3, parallelism: 1, outputLen: 32 })
}

export function verifyAdminPassword(passwordHash, password) {
  return verify(String(passwordHash || ''), String(password || ''))
}
