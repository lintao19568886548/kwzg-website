import { enforceAdminApiRateLimit, requireAdminSession } from '../../utils/admin-auth.js'
import { getAdminDashboard } from '../../utils/admin-dashboard.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../utils/database.js'
import { formatShanghaiDate } from '../../utils/shanghai-time.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'dashboard', 90)
    const now = new Date()
    const dashboard = await getAdminDashboard(db, session.admin.id, now, 8)
    return { ok: true, admin: session.admin, dateLabel: formatShanghaiDate(now), ...dashboard }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
