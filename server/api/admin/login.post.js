import { authenticateAdmin, createAdminSession, validateLoginCsrf } from '../../utils/admin-auth.js'
import { businessErrorResponse } from '../../utils/business-error.js'
import { getDatabase } from '../../utils/database.js'
import { assertExactKeys, readStrictJsonBody } from '../../utils/request-body.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    validateLoginCsrf(event, config)
    const body = await readStrictJsonBody(event, { limit: 2048 })
    assertExactKeys(body, ['username', 'password'])
    const db = getDatabase(config)
    await authenticateAdmin(db, config, event, body.username, body.password)
    const session = await createAdminSession(db, config, event)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { ok: true, csrfToken: session.csrfToken }
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
