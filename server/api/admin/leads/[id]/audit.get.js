import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { listLeadAudit, parseAuditQuery } from '../../../../utils/audit.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'audit-list')
    return { ok: true, ...(await listLeadAudit(db, getRouterParam(event, 'id'), parseAuditQuery(getQuery(event)))) }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
