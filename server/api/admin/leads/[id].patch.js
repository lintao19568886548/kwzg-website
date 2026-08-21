import { requireAdminSession } from '../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase } from '../../../utils/database.js'
import { updateLead } from '../../../utils/leads.js'
import { assertExactKeys, readStrictJsonBody } from '../../../utils/request-body.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    await requireAdminSession(db, config, event, { csrf: true })
    const body = await readStrictJsonBody(event, { limit: 4096 })
    assertExactKeys(body, ['status', 'remark', 'version'])
    const result = await updateLead(db, getRouterParam(event, 'id'), body)
    return { ok: true, ...result }
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
