import { enforceAdminApiRateLimit, requireAdminSession } from '../../../utils/admin-auth.js'
import { appendAudit, AUDIT_EVENTS } from '../../../utils/audit.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../utils/database.js'
import { getWorkflowLeadDetail } from '../../../utils/lead-workflow.js'
import { getClientAddress } from '../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'lead-detail')
    const id = getRouterParam(event, 'id')
    const lead = await getWorkflowLeadDetail(db, id)
    const existingView = await db('lead_audit').where({ lead_id: id, admin_user_id: session.admin.id, operation_type: AUDIT_EVENTS.LEAD_VIEWED }).first('id')
    if (!existingView) await appendAudit(db, { leadId: id, adminUserId: session.admin.id, eventType: AUDIT_EVENTS.LEAD_VIEWED, afterSummary: '首次查看线索详情', requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) })
    const assignees = await db('admin_users').select('id', 'username').where({ enabled: true }).orderBy('username')
    return { ok: true, lead, assignees }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
