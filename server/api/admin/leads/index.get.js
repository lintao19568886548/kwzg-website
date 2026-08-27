import { enforceAdminApiRateLimit, requireAdminSession } from '../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../utils/database.js'
import { listWorkflowLeads, parseLeadWorkflowQuery } from '../../../utils/lead-workflow.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'lead-list')
    const filters = parseLeadWorkflowQuery(getQuery(event))
    return { ok: true, ...(await listWorkflowLeads(db, filters, session.admin.id)) }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
