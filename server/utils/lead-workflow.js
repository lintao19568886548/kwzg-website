import { appendAudit, AUDIT_EVENTS } from './audit.js'
import { createKwError } from './business-error.js'
import { maskPhone, normalizeMultilinePlainText } from './security.js'
import { preserveOwnLeadReadState } from './lead-read-state.js'
import { shanghaiDayBounds } from './shanghai-time.js'
import { canTransitionLeadStatus, LEAD_STATUS_CODES, LEAD_STATUS_DEFINITIONS, leadStatusLabel } from '../../shared/lead-statuses.js'

const STATUS_DEFINITION_MAP = Object.freeze(Object.fromEntries(LEAD_STATUS_DEFINITIONS.map(item => [item.code, item])))

const SORT_FIELDS = Object.freeze({ createdAt: 'lead.created_at', nextFollowUpAt: 'lead.next_follow_up_at', lastFollowUpAt: 'lead.last_follow_up_at', status: 'lead.status' })
const PAGE_SIZES = [20, 50, 100]
const QUICK_VIEWS = ['all', 'new', 'pending', 'today', 'overdue', 'demo-scheduled', 'demo-completed', 'won', 'invalid']
const TERMINAL_STATUSES = ['WON', 'INVALID', 'CLOSED']

function scalar(value) {
  if (Array.isArray(value)) throw createKwError(422, 'INVALID_FILTER', '筛选条件格式不正确。')
  return value
}

function parseDate(value, label) {
  if (!value) return ''
  const text = String(scalar(value))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) throw createKwError(422, 'INVALID_FILTER', `${label}格式不正确。`)
  return text
}

function parseOptionalInteger(value, label) {
  if (value === '' || value == null) return null
  const parsed = Number(scalar(value))
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1000000) throw createKwError(422, 'INVALID_FILTER', `${label}不正确。`)
  return parsed
}

export function parseLeadWorkflowQuery(query = {}, options = {}) {
  const page = Number(scalar(query.page) || 1)
  const pageSize = options.export ? 1000 : Number(scalar(query.pageSize) || 20)
  const search = String(scalar(query.search) || '').normalize('NFKC').trim()
  const status = String(scalar(query.status) || '').trim()
  const sourcePage = String(scalar(query.sourcePage) || '').normalize('NFKC').trim()
  const assignee = String(scalar(query.assignee) || '').trim()
  const overdue = String(scalar(query.overdue) || '').trim()
  const unread = String(scalar(query.unread) || '').trim()
  const view = String(scalar(query.view) || 'all').trim()
  const sort = String(scalar(query.sort) || 'priority')
  const order = String(scalar(query.order) || 'desc').toLowerCase()
  const parkCountMin = parseOptionalInteger(query.parkCountMin, '园区数量下限')
  const parkCountMax = parseOptionalInteger(query.parkCountMax, '园区数量上限')

  if (!Number.isInteger(page) || page < 1 || page > 100000) throw createKwError(422, 'INVALID_FILTER', '页码不正确。')
  if (!options.export && !PAGE_SIZES.includes(pageSize)) throw createKwError(422, 'INVALID_FILTER', '每页数量仅支持 20、50 或 100。')
  if (search.length > 100) throw createKwError(422, 'INVALID_FILTER', '搜索内容过长。')
  if (status && !LEAD_STATUS_CODES.includes(status)) throw createKwError(422, 'INVALID_FILTER', '线索状态不正确。')
  if (sourcePage.length > 255 || (sourcePage && !sourcePage.startsWith('/'))) throw createKwError(422, 'INVALID_FILTER', '来源页面不正确。')
  if (assignee && assignee !== 'unassigned' && !/^[0-9a-f-]{36}$/i.test(assignee)) throw createKwError(422, 'INVALID_FILTER', '负责人筛选不正确。')
  if (overdue && !['true', 'false'].includes(overdue)) throw createKwError(422, 'INVALID_FILTER', '逾期筛选不正确。')
  if (unread && !['true', 'false'].includes(unread)) throw createKwError(422, 'INVALID_FILTER', '未读筛选不正确。')
  if (!QUICK_VIEWS.includes(view)) throw createKwError(422, 'INVALID_FILTER', '快捷视图不正确。')
  if (sort !== 'priority' && !SORT_FIELDS[sort]) throw createKwError(422, 'INVALID_FILTER', '排序条件不正确。')
  if (!['asc', 'desc'].includes(order)) throw createKwError(422, 'INVALID_FILTER', '排序方向不正确。')
  if (parkCountMin != null && parkCountMax != null && parkCountMin > parkCountMax) throw createKwError(422, 'INVALID_FILTER', '园区数量范围不正确。')
  const dateFrom = parseDate(query.dateFrom, '开始日期')
  const dateTo = parseDate(query.dateTo, '结束日期')
  const nextFollowUpFrom = parseDate(query.nextFollowUpFrom, '下次跟进开始日期')
  const nextFollowUpTo = parseDate(query.nextFollowUpTo, '下次跟进结束日期')
  if (dateFrom && dateTo && dateFrom > dateTo) throw createKwError(422, 'INVALID_FILTER', '日期范围不正确。')
  if (nextFollowUpFrom && nextFollowUpTo && nextFollowUpFrom > nextFollowUpTo) throw createKwError(422, 'INVALID_FILTER', '下次跟进日期范围不正确。')
  return { page, pageSize, search, status, dateFrom, dateTo, nextFollowUpFrom, nextFollowUpTo, parkCountMin, parkCountMax, sourcePage, assignee, overdue, unread, sort, order, view, now: new Date() }
}

function applyLeadFilters(builder, filters, alias = 'lead') {
  const column = name => `${alias}.${name}`
  if (filters.search) {
    const escaped = filters.search.replace(/[\\%_]/g, '\\$&')
    builder.where(nested => nested.where(column('name'), 'like', `%${escaped}%`).orWhere(column('phone'), 'like', `%${escaped}%`))
  }
  if (filters.status) builder.where(column('status'), filters.status)
  if (filters.dateFrom) builder.where(column('created_at'), '>=', `${filters.dateFrom} 00:00:00`)
  if (filters.dateTo) builder.where(column('created_at'), '<=', `${filters.dateTo} 23:59:59`)
  if (filters.nextFollowUpFrom) builder.where(column('next_follow_up_at'), '>=', `${filters.nextFollowUpFrom} 00:00:00`)
  if (filters.nextFollowUpTo) builder.where(column('next_follow_up_at'), '<=', `${filters.nextFollowUpTo} 23:59:59`)
  if (filters.parkCountMin != null) builder.where(column('park_count'), '>=', filters.parkCountMin)
  if (filters.parkCountMax != null) builder.where(column('park_count'), '<=', filters.parkCountMax)
  if (filters.sourcePage) builder.where(column('source_page'), filters.sourcePage)
  if (filters.assignee === 'unassigned') builder.whereNull(column('assigned_admin_user_id'))
  else if (filters.assignee) builder.where(column('assigned_admin_user_id'), filters.assignee)
  if (filters.overdue === 'true') builder.whereNotNull(column('next_follow_up_at')).where(column('next_follow_up_at'), '<', new Date())
  if (filters.overdue === 'false') builder.where(nested => nested.whereNull(column('next_follow_up_at')).orWhere(column('next_follow_up_at'), '>=', new Date()))
  if (filters.unread === 'true') builder.where(nested => nested.whereNull('readState.read_at').orWhereRaw(`${column('updated_at')} > readState.last_seen_lead_updated_at`))
  if (filters.unread === 'false') builder.whereNotNull('readState.read_at').whereRaw(`${column('updated_at')} <= readState.last_seen_lead_updated_at`)
  if (filters.view === 'new' || filters.view === 'pending') builder.where(column('status'), 'PENDING')
  if (filters.view === 'demo-scheduled') builder.where(column('status'), 'DEMO_SCHEDULED')
  if (filters.view === 'demo-completed') builder.where(column('status'), 'DEMO_COMPLETED')
  if (filters.view === 'won') builder.where(column('status'), 'WON')
  if (filters.view === 'invalid') builder.where(column('status'), 'INVALID')
  if (filters.view === 'today') {
    const { start, end } = shanghaiDayBounds(filters.now)
    builder.whereNotIn(column('status'), TERMINAL_STATUSES).where(column('next_follow_up_at'), '>=', start).where(column('next_follow_up_at'), '<', end)
  }
  if (filters.view === 'overdue') builder.whereNotIn(column('status'), TERMINAL_STATUSES).whereNotNull(column('next_follow_up_at')).where(column('next_follow_up_at'), '<', filters.now)
  return builder
}

function applyLeadOrdering(builder, filters) {
  if (filters.sort === 'priority') {
    const { start, end } = shanghaiDayBounds(filters.now)
    return builder
      .orderByRaw("CASE WHEN lead.status NOT IN ('WON','INVALID','CLOSED') AND lead.next_follow_up_at IS NOT NULL AND lead.next_follow_up_at < ? THEN 0 WHEN lead.status NOT IN ('WON','INVALID','CLOSED') AND lead.next_follow_up_at >= ? AND lead.next_follow_up_at < ? THEN 1 WHEN lead.status = 'PENDING' THEN 2 ELSE 3 END ASC", [filters.now, start, end])
      .orderByRaw("CASE lead.status WHEN 'PENDING' THEN 0 WHEN 'CONTACTED' THEN 1 WHEN 'DEMO_SCHEDULED' THEN 2 WHEN 'DEMO_COMPLETED' THEN 3 WHEN 'WON' THEN 4 WHEN 'ON_HOLD' THEN 5 WHEN 'INVALID' THEN 6 ELSE 7 END ASC")
      .orderBy('lead.created_at', 'desc')
  }
  return builder.orderBy(SORT_FIELDS[filters.sort], filters.order).orderBy('lead.created_at', 'desc')
}

function mapLead(row, includePrivate = false) {
  const nextFollowUpAt = row.next_follow_up_at || null
  return {
    id: row.id, referenceCode: row.reference_code, name: row.name, phone: includePrivate ? row.phone : maskPhone(row.phone), parkCount: row.park_count,
    status: row.status, statusLabel: leadStatusLabel(row.status), statusTone: STATUS_DEFINITION_MAP[row.status]?.tone || 'neutral', sourcePage: row.source_page,
    assignee: row.assigned_admin_user_id ? { id: row.assigned_admin_user_id, username: row.assigned_admin_username || '管理员' } : null,
    nextFollowUpAt, lastFollowUpAt: row.last_follow_up_at || null, overdue: Boolean(nextFollowUpAt && new Date(nextFollowUpAt) < new Date()),
    unread: Boolean(row.is_unread), demoScheduledAt: row.demo_scheduled_at || null, demoMethod: row.demo_method || '', demoTitle: row.demo_title || '', demoNote: row.demo_note || '', demoCompletedAt: row.demo_completed_at || null, demoCancelledAt: row.demo_cancelled_at || null,
    wonAt: row.won_at || null, wonNote: row.won_note || '', wonParkCount: row.won_park_count == null ? null : Number(row.won_park_count), holdReason: row.hold_reason || '', invalidReason: row.invalid_reason || '', reopenAllowed: Boolean(row.reopen_allowed),
    ...(includePrivate ? { legacyRemark: row.remark, privacyConsentAt: row.privacy_consent_at, privacyVersion: row.privacy_version } : {}),
    version: row.version, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

function leadBaseQuery(db, adminUserId) {
  const query = db({ lead: 'leads' }).leftJoin({ assigned: 'admin_users' }, 'assigned.id', 'lead.assigned_admin_user_id')
  if (adminUserId) {
    query.leftJoin({ readState: 'admin_lead_read_state' }, function joinReadState() {
      this.on('readState.lead_id', '=', 'lead.id').andOnVal('readState.admin_user_id', '=', adminUserId)
    })
  }
  return query
}

const LEAD_SELECT = ['lead.id', 'lead.reference_code', 'lead.name', 'lead.phone', 'lead.park_count', 'lead.status', 'lead.source_page', 'lead.assigned_admin_user_id', 'lead.next_follow_up_at', 'lead.last_follow_up_at', 'lead.demo_scheduled_at', 'lead.demo_method', 'lead.demo_title', 'lead.demo_note', 'lead.demo_completed_at', 'lead.demo_cancelled_at', 'lead.won_at', 'lead.won_note', 'lead.won_park_count', 'lead.hold_reason', 'lead.invalid_reason', 'lead.reopen_allowed', 'lead.version', 'lead.created_at', 'lead.updated_at', 'assigned.username as assigned_admin_username']

export async function listWorkflowLeads(db, filters, adminUserId) {
  const listSelect = adminUserId ? [...LEAD_SELECT, db.raw('CASE WHEN readState.read_at IS NULL OR lead.updated_at > readState.last_seen_lead_updated_at THEN 1 ELSE 0 END AS is_unread')] : LEAD_SELECT
  const [countRow, rows, sources, admins] = await Promise.all([
    applyLeadFilters(leadBaseQuery(db, adminUserId), filters).countDistinct({ count: 'lead.id' }).first(),
    applyLeadOrdering(applyLeadFilters(leadBaseQuery(db, adminUserId), filters).select(listSelect), filters).limit(filters.pageSize).offset((filters.page - 1) * filters.pageSize),
    db('leads').distinct('source_page').whereNotNull('source_page').orderBy('source_page'),
    db('admin_users').select('id', 'username').where({ enabled: true }).orderBy('username'),
  ])
  return { items: rows.map(row => mapLead(row)), total: Number(countRow?.count || 0), page: filters.page, pageSize: filters.pageSize, options: { sources: sources.map(row => row.source_page), assignees: admins } }
}

export async function getWorkflowLeadDetail(db, id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
  const row = await leadBaseQuery(db).select([...LEAD_SELECT, 'lead.remark', 'lead.privacy_consent_at', 'lead.privacy_version']).where('lead.id', id).first()
  if (!row) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
  return mapLead(row, true)
}

export async function updateLeadStatus(db, id, input, context, now = new Date()) {
  if (!LEAD_STATUS_CODES.includes(input.status)) throw createKwError(422, 'INVALID_STATUS', '线索状态不正确。')
  if (!Number.isInteger(input.version) || input.version < 1) throw createKwError(422, 'INVALID_VERSION', '线索版本不正确。')
  const note = normalizeMultilinePlainText(input.note, 500, '变更说明')
  return db.transaction(async (trx) => {
    const current = await trx('leads').where({ id }).forUpdate().first()
    if (!current) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
    if (current.version !== input.version) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    if (current.status === input.status) throw createKwError(422, 'STATUS_UNCHANGED', '请选择新的线索状态。')
    if (!canTransitionLeadStatus(current.status, input.status)) throw createKwError(422, 'INVALID_STATUS_TRANSITION', `不能从“${leadStatusLabel(current.status)}”变更为“${leadStatusLabel(input.status)}”。`)
    const updated = await trx('leads').where({ id, version: input.version }).update({ status: input.status, assigned_admin_user_id: current.assigned_admin_user_id || context.admin.id, version: input.version + 1, updated_at: now })
    if (updated !== 1) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    if (!current.assigned_admin_user_id) {
      await appendAudit(trx, { leadId: id, adminUserId: context.admin.id, eventType: AUDIT_EVENTS.ASSIGNEE_CHANGED, beforeSummary: '未分配', afterSummary: context.admin.username, noteSummary: '首次处理线索时自动认领', requestId: context.requestId, sourceIp: context.sourceIp, now })
    }
    await appendAudit(trx, { leadId: id, adminUserId: context.admin.id, eventType: AUDIT_EVENTS.STATUS_CHANGED, oldStatus: current.status, newStatus: input.status, beforeSummary: leadStatusLabel(current.status), afterSummary: leadStatusLabel(input.status), noteSummary: note, requestId: context.requestId, sourceIp: context.sourceIp, now })
    await preserveOwnLeadReadState(trx, context.admin.id, id, now, now)
    return { version: input.version + 1, status: input.status, statusLabel: leadStatusLabel(input.status), updatedAt: now }
  })
}

export async function updateLeadAssignee(db, id, input, context, now = new Date()) {
  const adminUserId = input.adminUserId === null || input.adminUserId === '' ? null : String(input.adminUserId || '')
  if (adminUserId && !/^[0-9a-f-]{36}$/i.test(adminUserId)) throw createKwError(422, 'INVALID_ASSIGNEE', '负责人不正确。')
  if (!Number.isInteger(input.version) || input.version < 1) throw createKwError(422, 'INVALID_VERSION', '线索版本不正确。')
  const note = normalizeMultilinePlainText(input.note, 500, '变更说明')
  return db.transaction(async (trx) => {
    const current = await trx({ lead: 'leads' }).leftJoin({ assigned: 'admin_users' }, 'assigned.id', 'lead.assigned_admin_user_id').select('lead.*', 'assigned.username as assigned_username').where('lead.id', id).forUpdate().first()
    if (!current) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
    if (current.version !== input.version) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    let nextAdmin = null
    if (adminUserId) {
      nextAdmin = await trx('admin_users').select('id', 'username').where({ id: adminUserId, enabled: true }).first()
      if (!nextAdmin) throw createKwError(422, 'INVALID_ASSIGNEE', '负责人不正确。')
    }
    if ((current.assigned_admin_user_id || null) === adminUserId) throw createKwError(422, 'ASSIGNEE_UNCHANGED', '请选择新的负责人。')
    const updated = await trx('leads').where({ id, version: input.version }).update({ assigned_admin_user_id: adminUserId, version: input.version + 1, updated_at: now })
    if (updated !== 1) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    await appendAudit(trx, { leadId: id, adminUserId: context.admin.id, eventType: AUDIT_EVENTS.ASSIGNEE_CHANGED, beforeSummary: current.assigned_username || '未分配', afterSummary: nextAdmin?.username || '未分配', noteSummary: note, requestId: context.requestId, sourceIp: context.sourceIp, now })
    await preserveOwnLeadReadState(trx, context.admin.id, id, now, now)
    return { version: input.version + 1, assignee: nextAdmin, updatedAt: now }
  })
}

export async function exportLeads(db, filters, adminUserId) {
  const countRow = await applyLeadFilters(leadBaseQuery(db, adminUserId), filters).countDistinct({ count: 'lead.id' }).first()
  const total = Number(countRow?.count || 0)
  if (total > 1000) throw createKwError(422, 'EXPORT_LIMIT_EXCEEDED', '当前筛选结果超过 1000 条，请缩小范围后再导出。')
  const rows = await applyLeadOrdering(applyLeadFilters(leadBaseQuery(db, adminUserId), filters).select([...LEAD_SELECT, 'lead.remark', 'lead.privacy_consent_at']), filters).limit(1000)
  return { rows, total }
}

function escapeCsvCell(value) {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@\t\r\n]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function workflowLeadsToCsv(rows) {
  const headers = ['预约编号', '姓名', '手机号', '园区数量', '状态', '来源页面', '负责人', '下次跟进时间', '最近跟进时间', '提交时间']
  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of rows) lines.push([row.reference_code, row.name, row.phone, row.park_count, leadStatusLabel(row.status), row.source_page, row.assigned_admin_username || '未分配', row.next_follow_up_at, row.last_follow_up_at, row.created_at].map(escapeCsvCell).join(','))
  return `\uFEFF${lines.join('\r\n')}\r\n`
}
