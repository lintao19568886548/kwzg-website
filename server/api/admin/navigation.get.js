import { enforceAdminApiRateLimit, requireAdminSession } from '../../utils/admin-auth.js'
import { getAdminDashboard } from '../../utils/admin-dashboard.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'navigation', 120)
    const { metrics } = await getAdminDashboard(db, session.admin.id, new Date(), 0)
    return { ok: true, admin: session.admin, counts: { unread: metrics.unread, today: metrics.todayFollowUp, overdue: metrics.overdue } }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
