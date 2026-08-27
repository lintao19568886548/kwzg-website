import { randomUUID } from 'node:crypto'
import { appendAudit, AUDIT_EVENTS } from './audit.js'
import { createKwError } from './business-error.js'
import { normalizeMultilinePlainText } from './security.js'
import { preserveOwnLeadReadState } from './lead-read-state.js'
import { FOLLOW_UP_METHOD_CODES, FOLLOW_UP_METHOD_LABELS } from '../../shared/lead-statuses.js'

function parsePageQuery(query = {}) {
  const page = Number(Array.isArray(query.page) ? Number.NaN : (query.page || 1))
  const pageSize = Number(Array.isArray(query.pageSize) ? Number.NaN : (query.pageSize || 20))
  if (!Number.isInteger(page) || page < 1 || page > 100000 || ![20, 50].includes(pageSize)) throw createKwError(422, 'INVALID_FILTER', '跟进记录分页参数不正确。')
  return { page, pageSize }
}

function parseNextFollowUpAt(value) {
  if (value === '' || value == null) return null
  if (typeof value !== 'string' || value.length > 40) throw createKwError(422, 'INVALID_NEXT_FOLLOW_UP', '下次跟进时间不正确。')
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw createKwError(422, 'INVALID_NEXT_FOLLOW_UP', '下次跟进时间不正确。')
  return parsed
}

export function validateFollowUp(input) {
  if (!FOLLOW_UP_METHOD_CODES.includes(input.contactMethod)) throw createKwError(422, 'INVALID_CONTACT_METHOD', '跟进方式不正确。')
  if (!Number.isInteger(input.version) || input.version < 1) throw createKwError(422, 'INVALID_VERSION', '线索版本不正确。')
  return {
    contactMethod: input.contactMethod,
    content: normalizeMultilinePlainText(input.content, 2000, '跟进内容'),
    result: normalizeMultilinePlainText(input.result, 500, '跟进结果'),
    nextPlan: normalizeMultilinePlainText(input.nextPlan, 500, '下一步计划'),
    nextFollowUpAt: parseNextFollowUpAt(input.nextFollowUpAt),
    version: input.version,
  }
}

export async function listFollowUps(db, leadId, query) {
  const { page, pageSize } = parsePageQuery(query)
  const base = db({ followup: 'lead_follow_ups' }).join({ admin: 'admin_users' }, 'admin.id', 'followup.admin_user_id').where('followup.lead_id', leadId)
  const [countRow, rows] = await Promise.all([
    base.clone().count({ count: '*' }).first(),
    base.clone().select('followup.id', 'followup.contact_method', 'followup.content', 'followup.result', 'followup.next_plan', 'followup.next_follow_up_at', 'followup.created_at', 'followup.updated_at', 'admin.username as admin_username').orderBy('followup.created_at', 'desc').limit(pageSize).offset((page - 1) * pageSize),
  ])
  return { items: rows.map(row => ({ id: row.id, contactMethod: row.contact_method, contactMethodLabel: FOLLOW_UP_METHOD_LABELS[row.contact_method] || row.contact_method, content: row.content, result: row.result, nextPlan: row.next_plan, nextFollowUpAt: row.next_follow_up_at, adminUsername: row.admin_username, createdAt: row.created_at, updatedAt: row.updated_at })), total: Number(countRow?.count || 0), page, pageSize }
}

export async function createFollowUp(db, leadId, input, context, now = new Date()) {
  const normalized = validateFollowUp(input)
  return db.transaction(async (trx) => {
    const lead = await trx('leads').where({ id: leadId }).forUpdate().first()
    if (!lead) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
    if (lead.version !== normalized.version) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    const id = randomUUID()
    await trx('lead_follow_ups').insert({ id, lead_id: leadId, admin_user_id: context.admin.id, contact_method: normalized.contactMethod, content: normalized.content, result: normalized.result, next_plan: normalized.nextPlan, next_follow_up_at: normalized.nextFollowUpAt, created_at: now, updated_at: now })
    const updated = await trx('leads').where({ id: leadId, version: normalized.version }).update({ assigned_admin_user_id: lead.assigned_admin_user_id || context.admin.id, last_follow_up_at: now, next_follow_up_at: normalized.nextFollowUpAt, version: normalized.version + 1, updated_at: now })
    if (updated !== 1) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    if (!lead.assigned_admin_user_id) {
      await appendAudit(trx, { leadId, adminUserId: context.admin.id, eventType: AUDIT_EVENTS.ASSIGNEE_CHANGED, beforeSummary: '未分配', afterSummary: context.admin.username, noteSummary: '首次添加跟进时自动认领', requestId: context.requestId, sourceIp: context.sourceIp, now })
    }
    await appendAudit(trx, { leadId, adminUserId: context.admin.id, eventType: AUDIT_EVENTS.FOLLOW_UP_CREATED, afterSummary: `${FOLLOW_UP_METHOD_LABELS[normalized.contactMethod]} · ${normalized.result}`, noteSummary: `${normalized.content}；下一步：${normalized.nextPlan}`, requestId: context.requestId, sourceIp: context.sourceIp, now })
    await preserveOwnLeadReadState(trx, context.admin.id, leadId, now, now)
    return { id, version: normalized.version + 1, lastFollowUpAt: now, nextFollowUpAt: normalized.nextFollowUpAt }
  })
}
