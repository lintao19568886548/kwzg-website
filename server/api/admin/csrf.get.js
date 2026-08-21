import { businessErrorResponse } from '../../utils/business-error.js'
import { createLoginCsrf } from '../../utils/admin-auth.js'

export default defineEventHandler((event) => {
  try {
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { ok: true, csrfToken: createLoginCsrf(event, useRuntimeConfig(event)) }
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
