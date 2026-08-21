import { requireAdminSession, rotateSessionCsrf } from '../../utils/admin-auth.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase } from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    const csrfToken = await rotateSessionCsrf(db, config, session)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { ok: true, csrfToken }
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
