import { enforceAdminApiRateLimit, requireAdminSession } from '../../../utils/admin-auth.js'
import { appendAudit, AUDIT_EVENTS } from '../../../utils/audit.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../utils/database.js'
import { exportLeads, parseLeadWorkflowQuery, workflowLeadsToCsv } from '../../../utils/lead-workflow.js'
import { getClientAddress } from '../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    await enforceAdminApiRateLimit(db, config, event, session, 'lead-export', 10, 10 * 60 * 1000)
    const filters = parseLeadWorkflowQuery({ ...getQuery(event), page: 1 }, { export: true })
    const { rows, total } = await exportLeads(db, filters, session.admin.id)
    await appendAudit(db, { adminUserId: session.admin.id, eventType: AUDIT_EVENTS.LEAD_EXPORTED, afterSummary: `导出 ${total} 条线索`, requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) })
    setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="kwzg-leads.csv"')
    return workflowLeadsToCsv(rows)
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
