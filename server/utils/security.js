import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createKwError } from './business-error.js'

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

export function keyedDigest(secret, purpose, value) {
  if (!secret || secret.length < 32) {
    throw createKwError(503, 'SERVER_CONFIGURATION_ERROR', '服务暂时不可用，请稍后再试。')
  }

  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex')
}

export function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left))
  const rightBuffer = Buffer.from(String(right))

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function getClientAddress(event, trustedProxyAddresses = '') {
  const directAddress = getRequestIP(event) || 'unknown'
  const trustedAddresses = String(trustedProxyAddresses).split(',').map(value => value.trim()).filter(Boolean)
  if (!trustedAddresses.includes(directAddress)) return directAddress
  return getRequestIP(event, { xForwardedFor: true }) || directAddress
}

function normalizeAllowedOrigin(value) {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== value || url.username || url.password) {
    throw new Error('invalid origin')
  }
  return url.origin
}

export function parseTrustedOrigins(value = '') {
  try {
    return String(value).split(',').map(origin => origin.trim()).filter(Boolean).map(normalizeAllowedOrigin)
  } catch {
    throw createKwError(503, 'SERVER_CONFIGURATION_ERROR', '服务暂时不可用，请稍后再试。')
  }
}

export function assertSameOrigin(event, trustedOrigins = '') {
  const origin = getRequestHeader(event, 'origin')
  const referer = getRequestHeader(event, 'referer')
  const requestOrigin = getRequestURL(event).origin
  const allowedOrigins = new Set([requestOrigin, ...parseTrustedOrigins(trustedOrigins)])
  let suppliedOrigin

  try {
    suppliedOrigin = origin ? new URL(origin).origin : (referer ? new URL(referer).origin : '')
  } catch {
    throw createKwError(403, 'ORIGIN_REJECTED', '请求来源验证失败。')
  }

  if (!suppliedOrigin || !allowedOrigins.has(suppliedOrigin)) {
    throw createKwError(403, 'ORIGIN_REJECTED', '请求来源验证失败。')
  }
}

export function normalizePlainText(value, maxLength, fieldLabel) {
  if (typeof value !== 'string') {
    throw createKwError(422, 'VALIDATION_ERROR', `${fieldLabel}格式不正确。`)
  }

  const normalized = value.normalize('NFKC').replace(/\s+/g, ' ').trim()
  if (!normalized || normalized.length > maxLength) {
    throw createKwError(422, 'VALIDATION_ERROR', `${fieldLabel}格式不正确。`)
  }

  return normalized
}

export function normalizeMultilinePlainText(value, maxLength, fieldLabel) {
  if (typeof value !== 'string') throw createKwError(422, 'VALIDATION_ERROR', `${fieldLabel}格式不正确。`)
  const hasControlCharacter = [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 && ![9, 10, 13].includes(code)
  })
  const normalized = value.normalize('NFKC').replace(/\r\n?/g, '\n').trim()
  if (!normalized || normalized.length > maxLength || /[<>]/.test(normalized) || hasControlCharacter) throw createKwError(422, 'VALIDATION_ERROR', `${fieldLabel}必须为不超过 ${maxLength} 字的纯文本。`)
  return normalized
}

export function maskPhone(phone) {
  return phone.replace(/^(\+?86)?(\d{3})\d{4}(\d{4})$/, '$2****$3')
}
