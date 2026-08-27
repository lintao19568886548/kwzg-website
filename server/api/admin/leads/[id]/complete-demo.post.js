import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'
import { completeLeadDemo } from '../../../../utils/lead-outcomes.js'
import { assertExactKeys, readStrictJsonBody } from '../../../../utils/request-body.js'
import { getClientAddress } from '../../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event); const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    await enforceAdminApiRateLimit(db, config, event, session, 'demo-complete', 40)
    const body = await readStrictJsonBody(event, { limit: 2048 }); assertExactKeys(body, ['version', 'note'])
    return { ok: true, ...await completeLeadDemo(db, getRouterParam(event, 'id'), body, { admin: session.admin, requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) }) }
  } catch (error) { return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId) }
})
