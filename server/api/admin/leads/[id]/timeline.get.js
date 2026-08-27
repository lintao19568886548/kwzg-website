import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'
import { listLeadTimeline, parseTimelineQuery } from '../../../../utils/lead-timeline.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'lead-timeline')
    const result = await listLeadTimeline(db, getRouterParam(event, 'id'), parseTimelineQuery(getQuery(event)))
    return { ok: true, ...result }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
