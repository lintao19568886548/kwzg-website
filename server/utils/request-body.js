import { createKwError } from './business-error.js'

export async function readStrictJsonBody(event, options = {}) {
  const limit = options.limit || 8192
  const contentType = getRequestHeader(event, 'content-type') || ''
  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)

  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw createKwError(415, 'UNSUPPORTED_MEDIA_TYPE', '请求格式必须为 JSON。')
  }

  if (Number.isFinite(contentLength) && contentLength > limit) {
    throw createKwError(413, 'BODY_TOO_LARGE', '提交内容过大。')
  }

  const rawBody = await readRawBody(event, false)
  if (!rawBody || Buffer.byteLength(rawBody, 'utf8') > limit) {
    throw createKwError(rawBody ? 413 : 400, rawBody ? 'BODY_TOO_LARGE' : 'INVALID_JSON', rawBody ? '提交内容过大。' : '请求内容不能为空。')
  }

  try {
    const body = JSON.parse(rawBody)
    if (!body || Array.isArray(body) || typeof body !== 'object') {
      throw new Error('not an object')
    }
    return body
  } catch {
    throw createKwError(400, 'INVALID_JSON', '请求内容不是有效的 JSON。')
  }
}

export function assertExactKeys(body, allowedKeys) {
  const allowed = new Set(allowedKeys)
  if (Object.keys(body).some(key => !allowed.has(key))) {
    throw createKwError(422, 'UNEXPECTED_FIELD', '提交内容包含未允许的字段。')
  }
}
