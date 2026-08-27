import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'
import { updateLeadAssignee } from '../../../../utils/lead-workflow.js'
import { assertExactKeys, readStrictJsonBody } from '../../../../utils/request-body.js'
import { getClientAddress } from '../../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    await enforceAdminApiRateLimit(db, config, event, session, 'lead-assignee', 40)
    const body = await readStrictJsonBody(event, { limit: 4096 })
    assertExactKeys(body, ['adminUserId', 'note', 'version'])
    const result = await updateLeadAssignee(db, getRouterParam(event, 'id'), body, { admin: session.admin, requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) })
    return { ok: true, ...result }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
