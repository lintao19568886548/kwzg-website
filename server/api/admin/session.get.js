import { requireAdminSession, rotateSessionCsrf } from '../../utils/admin-auth.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    const checkOnly = getQuery(event).check === '1'
    const csrfToken = checkOnly ? undefined : await rotateSessionCsrf(db, config, session)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { ok: true, ...(csrfToken ? { csrfToken } : {}), admin: session.admin }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
