import { enforceAdminApiRateLimit, requireAdminSession } from '../../../utils/admin-auth.js'
import { changeAdminPassword } from '../../../utils/admin-account.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../../utils/database.js'
import { assertExactKeys, readStrictJsonBody } from '../../../utils/request-body.js'
import { getClientAddress } from '../../../utils/security.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event, { csrf: true })
    await enforceAdminApiRateLimit(db, config, event, session, 'password-change', 8, 15 * 60 * 1000)
    const body = await readStrictJsonBody(event, { limit: 2048 })
    assertExactKeys(body, ['currentPassword', 'newPassword', 'confirmPassword', 'revokeOtherSessions'])
    const result = await changeAdminPassword(db, session.admin.id, session.admin.username, body, { currentTokenHash: session.tokenHash, requestId: event.context.requestId, sourceIp: getClientAddress(event, config.trustedProxyAddresses) })
    return { ok: true, reauthenticationRequired: false, revokedSessions: result.revokedSessions }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
