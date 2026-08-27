import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'
import { cancelLeadDemo } from '../../../../utils/lead-outcomes.js'
import { assertExactKeys, readStrictJsonBody } from '../../../../utils/request-body.js'
import { getClientAddress } from '../../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event); const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    await enforceAdminApiRateLimit(db, config, event, session, 'demo-cancel', 40)
    const body = await readStrictJsonBody(event, { limit: 2048 }); assertExactKeys(body, ['version', 'note', 'nextFollowUpAt'])
    return { ok: true, ...await cancelLeadDemo(db, getRouterParam(event, 'id'), body, { admin: session.admin, requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) }) }
  } catch (error) { return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId) }
})
