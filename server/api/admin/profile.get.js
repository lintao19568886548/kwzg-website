import { enforceAdminApiRateLimit, requireAdminSession } from '../../utils/admin-auth.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../utils/database.js'
import { listAdminSessions } from '../../utils/admin-account.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    const session = await requireAdminSession(db, config, event)
    await enforceAdminApiRateLimit(db, config, event, session, 'profile')
    const sessions = await listAdminSessions(db, config, session.admin.id, session.tokenHash)
    return {
      ok: true,
      admin: session.admin,
      session: { createdAt: session.created_at, lastActivityAt: session.last_activity_at, expiresAt: session.expires_at, absoluteExpiresAt: session.absolute_expires_at },
      sessions,
    }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
