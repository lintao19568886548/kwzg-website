import { enforceAdminApiRateLimit, requireAdminSession } from '../../../../utils/admin-auth.js'
import { revokeOtherAdminSessions } from '../../../../utils/admin-account.js'
import { businessErrorResponse } from '../../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../../utils/database.js'
import { getClientAddress } from '../../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event); const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    await enforceAdminApiRateLimit(db, config, event, session, 'sessions-revoke-others', 10)
    const revokedSessions = await revokeOtherAdminSessions(db, session.admin.id, session.tokenHash, { requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) })
    return { ok: true, revokedSessions }
  } catch (error) { return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId) }
})
