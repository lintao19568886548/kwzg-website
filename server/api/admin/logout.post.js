import { requireAdminSession, revokeAdminSession } from '../../utils/admin-auth.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../utils/database.js'
import { appendAudit, AUDIT_EVENTS } from '../../utils/audit.js'
import { getClientAddress } from '../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    let auditError
    try {
      await appendAudit(db, { adminUserId: session.admin.id, eventType: AUDIT_EVENTS.ADMIN_LOGOUT, afterSummary: '管理员主动退出', requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) })
    } catch (error) {
      auditError = error
    }
    await revokeAdminSession(db, config, event)
    if (auditError) throw auditError
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { ok: true }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
