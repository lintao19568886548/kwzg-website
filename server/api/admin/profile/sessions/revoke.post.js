import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { revokeOtherAdminSession } from '../../../../utils/admin-account.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'
import { assertExactKeys, readStrictJsonBody } from '../../../../utils/request-body.js'
import { getClientAddress } from '../../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event); const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    await enforceAdminApiRateLimit(db, config, event, session, 'session-revoke', 20)
    const body = await readStrictJsonBody(event, { limit: 1024 }); assertExactKeys(body, ['sessionId'])
    await revokeOtherAdminSession(db, config, session.admin.id, session.tokenHash, body.sessionId, { requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) })
    return { ok: true }
  } catch (error) { return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId) }
})
