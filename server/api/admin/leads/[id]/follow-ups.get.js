import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'
import { listFollowUps } from '../../../../utils/lead-follow-ups.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'followup-list')
    return { ok: true, ...(await listFollowUps(db, getRouterParam(event, 'id'), getQuery(event))) }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
