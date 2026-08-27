import { createKwError } from './business-error.js'
import { AUDIT_EVENT_LABELS } from './audit.js'
import { FOLLOW_UP_METHOD_LABELS } from '../../shared/lead-statuses.js'

const PAGE_SIZES = [20, 50]

export function parseTimelineQuery(query = {}) {
  const page = Number(Array.isArray(query.page) ? Number.NaN : (query.page || 1))
  const pageSize = Number(Array.isArray(query.pageSize) ? Number.NaN : (query.pageSize || 20))
  if (!Number.isInteger(page) || page < 1 || page > 100000 || !PAGE_SIZES.includes(pageSize)) throw createKwError(422, 'INVALID_FILTER', '时间线分页参数不正确。')
  return { page, pageSize }
}

export async function listLeadTimeline(db, leadId, { page, pageSize }) {
  const auditBase = db({ audit: 'lead_audit' }).leftJoin({ admin: 'admin_users' }, 'admin.id', 'audit.admin_user_id').where('audit.lead_id', leadId).whereNotIn('audit.operation_type', ['FOLLOW_UP_CREATED', 'FOLLOW_UP_UPDATED'])
  const followBase = db({ followup: 'lead_follow_ups' }).join({ admin: 'admin_users' }, 'admin.id', 'followup.admin_user_id').where('followup.lead_id', leadId)
  const [auditRows, followRows, auditCount, followCount] = await Promise.all([
    auditBase.clone().select('audit.id', 'audit.operation_type', 'audit.old_status', 'audit.new_status', 'audit.before_summary', 'audit.after_summary', 'audit.note_summary', 'audit.operated_at', 'admin.username as admin_username').orderBy('audit.operated_at', 'desc').limit(pageSize * page),
    followBase.clone().select('followup.id', 'followup.contact_method', 'followup.content', 'followup.result', 'followup.next_plan', 'followup.next_follow_up_at', 'followup.created_at', 'admin.username as admin_username').orderBy('followup.created_at', 'desc').limit(pageSize * page),
    auditBase.clone().count({ count: '*' }).first(),
    followBase.clone().count({ count: '*' }).first(),
  ])
  const combined = [
    ...auditRows.map(row => ({ id: `audit-${row.id}`, kind: 'SYSTEM', title: AUDIT_EVENT_LABELS[row.operation_type] || row.operation_type, adminUsername: row.admin_username || '系统', content: row.note_summary || row.after_summary || '', beforeSummary: row.before_summary || '', afterSummary: row.after_summary || '', oldStatus: row.old_status, newStatus: row.new_status, nextFollowUpAt: null, occurredAt: row.operated_at })),
    ...followRows.map(row => ({ id: `follow-${row.id}`, kind: 'FOLLOW_UP', title: FOLLOW_UP_METHOD_LABELS[row.contact_method] || row.contact_method, adminUsername: row.admin_username, content: row.content, result: row.result, nextPlan: row.next_plan, beforeSummary: '', afterSummary: '', oldStatus: null, newStatus: null, nextFollowUpAt: row.next_follow_up_at || null, occurredAt: row.created_at })),
  ].sort((left, right) => new Date(right.occurredAt) - new Date(left.occurredAt))
  const offset = (page - 1) * pageSize
  return { items: combined.slice(offset, offset + pageSize), total: Number(auditCount?.count || 0) + Number(followCount?.count || 0), page, pageSize }
}
