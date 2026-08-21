import { requireAdminSession } from '../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase } from '../../../utils/database.js'
import { getLeadDetail } from '../../../utils/leads.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    await requireAdminSession(db, config, event)
    return { ok: true, lead: await getLeadDetail(db, getRouterParam(event, 'id')) }
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
