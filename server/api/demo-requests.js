import { businessErrorResponse, createKwError } from '../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../utils/database.js'
import { createDemoRequest, DEMO_BODY_KEYS, validateDemoRequest, validateIdempotencyKey } from '../utils/demo-requests.js'
import { assertExactKeys, readStrictJsonBody } from '../utils/request-body.js'
import { assertSameOrigin, getClientAddress } from '../utils/security.js'

export default defineEventHandler(async (event) => {
  const requestId = event.context.requestId

  try {
    if (getMethod(event) !== 'POST') {
      setResponseHeader(event, 'Allow', 'POST')
      throw createKwError(405, 'METHOD_NOT_ALLOWED', '请求方法不受支持。')
    }

    const body = await readStrictJsonBody(event, { limit: 4096 })
    assertSameOrigin(event)
    assertExactKeys(body, DEMO_BODY_KEYS)
    const normalized = validateDemoRequest(body)
    const idempotencyKey = validateIdempotencyKey(getRequestHeader(event, 'x-idempotency-key'))
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const result = await createDemoRequest(db, normalized, {
      idempotencyKey,
      clientAddress: getClientAddress(event, config.trustedProxyAddresses),
      secret: config.sessionPassword,
      now: new Date(),
    })

    setResponseStatus(event, result.duplicate ? 200 : 201)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { success: true, requestId }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), requestId)
  }
})
