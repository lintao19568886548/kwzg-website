import { requireAdminSession } from '../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase } from '../../../utils/database.js'
import { listLeads, parseLeadQuery } from '../../../utils/leads.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    await requireAdminSession(db, config, event)
    const filters = parseLeadQuery(getQuery(event))
    return { ok: true, ...(await listLeads(db, filters)) }
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
