import { createHash, randomUUID } from 'node:crypto'
import { createKwError } from './business-error.js'
import { enforceRateLimit } from './rate-limit.js'
import { keyedDigest, normalizePlainText } from './security.js'

export const PRIVACY_VERSION = '2026-08-21'
export const DEMO_BODY_KEYS = ['name', 'phone', 'parkCount', 'privacy', 'companyWebsite', 'startedAt']

export function normalizePhone(value) {
  if (typeof value !== 'string') {
    throw createKwError(422, 'INVALID_PHONE', '请输入正确的大陆手机号。')
  }

  let normalized = value.normalize('NFKC').replace(/[\s()-]/g, '')
  if (normalized.startsWith('0086')) normalized = normalized.slice(4)
  if (normalized.startsWith('+86')) normalized = normalized.slice(3)

  if (!/^1[3-9]\d{9}$/.test(normalized)) {
    throw createKwError(422, 'INVALID_PHONE', '请输入正确的大陆手机号。')
  }

  return `+86${normalized}`
}

export function validateDemoRequest(body, now = Date.now()) {
  const name = normalizePlainText(body.name, 40, '姓名')
  const phone = normalizePhone(body.phone)
  const parkCount = Number(body.parkCount)

  if (!Number.isInteger(parkCount) || parkCount < 1 || parkCount > 999) {
    throw createKwError(422, 'INVALID_PARK_COUNT', '园区数量必须是 1 至 999 的整数。')
  }

  if (body.privacy !== true) {
    throw createKwError(422, 'PRIVACY_REQUIRED', '请先阅读并同意隐私政策。')
  }

  if (typeof body.companyWebsite !== 'string' || body.companyWebsite.length > 0) {
    throw createKwError(422, 'FORM_REJECTED', '提交内容未通过校验。')
  }

  const startedAt = Number(body.startedAt)
  if (!Number.isFinite(startedAt) || startedAt > now || now - startedAt < 2500 || now - startedAt > 86400000) {
    throw createKwError(422, 'FORM_TIMING_REJECTED', '填写时间异常，请刷新页面后重试。')
  }

  return { name, phone, parkCount }
}

export function validateIdempotencyKey(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{16,96}$/.test(value)) {
    throw createKwError(400, 'IDEMPOTENCY_KEY_REQUIRED', '请刷新页面后重新提交。')
  }
  return value
}

function submissionDigest(input) {
  return createHash('sha256')
    .update(`${input.name}|${input.phone}|${input.parkCount}`)
    .digest('hex')
}

function createReferenceCode(now, leadId) {
  const datePart = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now).replaceAll('-', '')
  return `KW-${datePart}-${leadId.replaceAll('-', '').slice(0, 8).toUpperCase()}`
}

export async function createDemoRequest(db, input, context) {
  const digest = submissionDigest(input)
  const existing = await db('leads').select('reference_code', 'idempotency_digest').where({ idempotency_key: context.idempotencyKey }).first()
  if (existing) {
    if (existing.idempotency_digest !== digest) {
      throw createKwError(409, 'IDEMPOTENCY_CONFLICT', '本次提交凭证与表单内容不一致，请刷新页面后重试。')
    }
    return { duplicate: true, referenceCode: existing.reference_code }
  }

  const rateKey = keyedDigest(context.secret, 'demo-rate', `${context.clientAddress}|${input.phone}`)
  await enforceRateLimit(db, {
    bucketKey: rateKey,
    action: 'demo-request',
    maxHits: 5,
    windowMs: 10 * 60 * 1000,
    now: context.now,
  })

  const leadId = randomUUID()
  const now = context.now || new Date()
  const referenceCode = createReferenceCode(now, leadId)

  try {
    await db.transaction(async (trx) => {
      await trx('leads').insert({
        id: leadId,
        name: input.name,
        phone: input.phone,
        park_count: input.parkCount,
        status: 'PENDING',
        source_page: '/demo',
        remark: '',
        privacy_consent_at: now,
        privacy_version: PRIVACY_VERSION,
        idempotency_key: context.idempotencyKey,
        idempotency_digest: digest,
        reference_code: referenceCode,
        version: 1,
        created_at: now,
        updated_at: now,
      })
      await trx('lead_audit').insert({
        lead_id: leadId,
        operation_type: 'LEAD_CREATED',
        old_status: null,
        new_status: 'PENDING',
        remark_changed: false,
        operated_at: now,
      })
    })
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      const duplicate = await db('leads').select('reference_code', 'idempotency_digest').where({ idempotency_key: context.idempotencyKey }).first()
      if (!duplicate) throw error
      if (duplicate.idempotency_digest !== digest) {
        throw createKwError(409, 'IDEMPOTENCY_CONFLICT', '本次提交凭证与表单内容不一致，请刷新页面后重试。')
      }
      return { duplicate: true, referenceCode: duplicate.reference_code }
    }
    throw error
  }

  return { duplicate: false, referenceCode }
}
