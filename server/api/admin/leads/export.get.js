import { requireAdminSession } from '../../../utils/admin-auth.js'
import { businessErrorResponse } from '../../../utils/business-error.js'
import { getDatabase } from '../../../utils/database.js'
import { applyLeadFilters, leadsToCsv, parseLeadQuery } from '../../../utils/leads.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const db = getDatabase(config)
    await requireAdminSession(db, config, event, { csrf: true })
    const filters = parseLeadQuery({ ...getQuery(event), page: 1, pageSize: 50 })
    const rows = await applyLeadFilters(db('leads'), filters)
      .select('name', 'phone', 'park_count', 'status', 'remark', 'privacy_consent_at', 'created_at', 'updated_at')
      .orderBy(filters.sortColumn, filters.order)
      .limit(2000)
    setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="kwzg-leads.csv"')
    return leadsToCsv(rows)
  } catch (error) {
    return businessErrorResponse(event, error, event.context.requestId)
  }
})
