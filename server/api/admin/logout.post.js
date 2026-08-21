import { requireAdminSession, revokeAdminSession } from '../../utils/admin-auth.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase } from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    await requireAdminSession(db, config, event, { csrf: true })
    await revokeAdminSession(db, config, event)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { ok: true }
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
