import { authenticateAdmin, createAdminSession, validateLoginCsrf } from '../../utils/admin-auth.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase, normalizeDatabaseError } from '../../utils/database.js'
import { assertExactKeys, readStrictJsonBody } from '../../utils/request-body.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    validateLoginCsrf(event, config)
    const body = await readStrictJsonBody(event, { limit: 2048 })
    assertExactKeys(body, ['username', 'password'])
    const db = getDatabase(config)
    const admin = await authenticateAdmin(db, config, event, body.username, body.password)
    const session = await createAdminSession(db, config, event, admin)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { ok: true, csrfToken: session.csrfToken }
  } catch (error) {
    return businessErrorResponse(event, normalizeDatabaseError(error), event.context.requestId)
  }
})
