import { createKwError } from './business-error.js'

export const AUDIT_EVENTS = Object.freeze({
  LEAD_CREATED: 'LEAD_CREATED', LEAD_VIEWED: 'LEAD_VIEWED', STATUS_CHANGED: 'STATUS_CHANGED', ASSIGNEE_CHANGED: 'ASSIGNEE_CHANGED', FOLLOW_UP_CREATED: 'FOLLOW_UP_CREATED', FOLLOW_UP_UPDATED: 'FOLLOW_UP_UPDATED', LEAD_EXPORTED: 'LEAD_EXPORTED', DEMO_SCHEDULED: 'DEMO_SCHEDULED', DEMO_RESCHEDULED: 'DEMO_RESCHEDULED', DEMO_COMPLETED: 'DEMO_COMPLETED', DEMO_CANCELLED: 'DEMO_CANCELLED', LEAD_WON: 'LEAD_WON', LEAD_PAUSED: 'LEAD_PAUSED', LEAD_INVALIDATED: 'LEAD_INVALIDATED', LEAD_REOPENED: 'LEAD_REOPENED', ADMIN_CREATED: 'ADMIN_CREATED', ADMIN_PASSWORD_CHANGED: 'ADMIN_PASSWORD_CHANGED', ADMIN_PASSWORD_RESET: 'ADMIN_PASSWORD_RESET', ADMIN_LOGIN_SUCCEEDED: 'ADMIN_LOGIN_SUCCEEDED', ADMIN_LOGIN_FAILED: 'ADMIN_LOGIN_FAILED', ADMIN_LOGOUT: 'ADMIN_LOGOUT', ADMIN_SESSION_REVOKED: 'ADMIN_SESSION_REVOKED',
})

export const AUDIT_EVENT_LABELS = Object.freeze({
  LEAD_CREATED: '线索创建', LEAD_VIEWED: '首次查看线索', STATUS_CHANGED: '状态变更', ASSIGNEE_CHANGED: '负责人变更', FOLLOW_UP_CREATED: '新增跟进', FOLLOW_UP_UPDATED: '更新跟进', LEAD_EXPORTED: '导出线索', DEMO_SCHEDULED: '安排产品演示', DEMO_RESCHEDULED: '修改演示时间', DEMO_COMPLETED: '完成产品演示', DEMO_CANCELLED: '取消产品演示', LEAD_WON: '成交归档', LEAD_PAUSED: '暂缓归档', LEAD_INVALIDATED: '无效归档', LEAD_REOPENED: '重新开启线索', ADMIN_CREATED: '创建管理员', ADMIN_PASSWORD_CHANGED: '管理员修改密码', ADMIN_PASSWORD_RESET: '管理员密码重置', ADMIN_LOGIN_SUCCEEDED: '管理员登录成功', ADMIN_LOGIN_FAILED: '管理员登录失败', ADMIN_LOGOUT: '管理员退出', ADMIN_SESSION_REVOKED: '撤销管理员会话',
})

function safeSummary(value, maxLength = 255) {
  const sanitized = [...String(value || '').normalize('NFKC')].map((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127 || character === '<' || character === '>' ? ' ' : character
  }).join('')
  return sanitized.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

export async function appendAudit(db, input) {
  if (!Object.values(AUDIT_EVENTS).includes(input.eventType)) throw createKwError(500, 'AUDIT_EVENT_INVALID', '服务暂时不可用，请稍后再试。')
  await db('lead_audit').insert({
    lead_id: input.leadId || null, admin_user_id: input.adminUserId || null, operation_type: input.eventType,
    old_status: input.oldStatus || null, new_status: input.newStatus || null, remark_changed: Boolean(input.remarkChanged),
    before_summary: safeSummary(input.beforeSummary), after_summary: safeSummary(input.afterSummary), note_summary: safeSummary(input.noteSummary),
    request_id: safeSummary(input.requestId, 64), source_ip: input.sourceIp ? safeSummary(input.sourceIp, 45) : null, operated_at: input.now || new Date(),
  })
}

export function parseAuditQuery(query = {}) {
  const page = Number(Array.isArray(query.page) ? Number.NaN : (query.page || 1))
  const pageSize = Number(Array.isArray(query.pageSize) ? Number.NaN : (query.pageSize || 20))
  if (!Number.isInteger(page) || page < 1 || page > 100000 || ![20, 50].includes(pageSize)) throw createKwError(422, 'INVALID_FILTER', '审计分页参数不正确。')
  return { page, pageSize }
}

export async function listLeadAudit(db, leadId, filters) {
  const base = db({ audit: 'lead_audit' }).leftJoin({ admin: 'admin_users' }, 'admin.id', 'audit.admin_user_id').where('audit.lead_id', leadId)
  const [countRow, rows] = await Promise.all([
    base.clone().count({ count: '*' }).first(),
    base.clone().select('audit.id', 'audit.operation_type', 'audit.old_status', 'audit.new_status', 'audit.before_summary', 'audit.after_summary', 'audit.note_summary', 'audit.request_id', 'audit.operated_at', 'admin.username as admin_username').orderBy('audit.operated_at', 'desc').limit(filters.pageSize).offset((filters.page - 1) * filters.pageSize),
  ])
  return {
    items: rows.map(row => ({ id: String(row.id), eventType: row.operation_type, eventLabel: AUDIT_EVENT_LABELS[row.operation_type] || row.operation_type, adminUsername: row.admin_username || '系统', oldStatus: row.old_status, newStatus: row.new_status, beforeSummary: row.before_summary, afterSummary: row.after_summary, noteSummary: row.note_summary, requestId: row.request_id, operatedAt: row.operated_at })),
    total: Number(countRow?.count || 0), page: filters.page, pageSize: filters.pageSize,
  }
}
