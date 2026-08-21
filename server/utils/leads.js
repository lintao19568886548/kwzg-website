import { createKwError } from './business-error.js'
import { maskPhone } from './security.js'

export const LEAD_STATUSES = ['待跟进', '跟进中', '已安排演示', '已完成', '无效']
const SORT_FIELDS = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  name: 'name',
  status: 'status',
}

function scalar(value) {
  if (Array.isArray(value)) {
    throw createKwError(422, 'INVALID_FILTER', '筛选条件格式不正确。')
  }
  return value
}

function parseDate(value, label) {
  if (!value) return ''
  const text = String(scalar(value))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) {
    throw createKwError(422, 'INVALID_FILTER', `${label}格式不正确。`)
  }
  return text
}

export function parseLeadQuery(query, options = {}) {
  const page = Number(scalar(query.page) || 1)
  const pageSize = Number(scalar(query.pageSize) || 20)
  const search = String(scalar(query.search) || '').normalize('NFKC').trim()
  const status = String(scalar(query.status) || '').trim()
  const sort = String(scalar(query.sort) || 'createdAt')
  const order = String(scalar(query.order) || 'desc').toLowerCase()

  if (!Number.isInteger(page) || page < 1 || page > 100000) {
    throw createKwError(422, 'INVALID_FILTER', '页码不正确。')
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > (options.maxPageSize || 50)) {
    throw createKwError(422, 'INVALID_FILTER', '每页数量超出允许范围。')
  }
  if (search.length > 100) {
    throw createKwError(422, 'INVALID_FILTER', '搜索内容过长。')
  }
  if (status && !LEAD_STATUSES.includes(status)) {
    throw createKwError(422, 'INVALID_FILTER', '线索状态不正确。')
  }
  if (!SORT_FIELDS[sort] || !['asc', 'desc'].includes(order)) {
    throw createKwError(422, 'INVALID_FILTER', '排序条件不正确。')
  }

  const dateFrom = parseDate(query.dateFrom, '开始日期')
  const dateTo = parseDate(query.dateTo, '结束日期')
  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw createKwError(422, 'INVALID_FILTER', '日期范围不正确。')
  }

  return { page, pageSize, search, status, dateFrom, dateTo, sortColumn: SORT_FIELDS[sort], sort, order }
}

export function applyLeadFilters(builder, filters) {
  if (filters.search) {
    const escaped = filters.search.replace(/[\\%_]/g, '\\$&')
    builder.where((nested) => {
      nested.where('name', 'like', `%${escaped}%`).orWhere('phone', 'like', `%${escaped}%`)
    })
  }
  if (filters.status) builder.where('status', filters.status)
  if (filters.dateFrom) builder.where('created_at', '>=', `${filters.dateFrom} 00:00:00`)
  if (filters.dateTo) builder.where('created_at', '<=', `${filters.dateTo} 23:59:59`)
  return builder
}

function mapLead(row, includePhone = false) {
  return {
    id: row.id,
    name: row.name,
    phone: includePhone ? row.phone : maskPhone(row.phone),
    parkCount: row.park_count,
    status: row.status,
    ...(includePhone ? { remark: row.remark, privacyConsentAt: row.privacy_consent_at, privacyVersion: row.privacy_version } : {}),
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listLeads(db, filters) {
  const countQuery = applyLeadFilters(db('leads'), filters).clone().count({ count: '*' }).first()
  const rowsQuery = applyLeadFilters(db('leads'), filters)
    .select('id', 'name', 'phone', 'park_count', 'status', 'version', 'created_at', 'updated_at')
    .orderBy(filters.sortColumn, filters.order)
    .limit(filters.pageSize)
    .offset((filters.page - 1) * filters.pageSize)

  const [countRow, rows] = await Promise.all([countQuery, rowsQuery])
  return {
    items: rows.map(row => mapLead(row)),
    total: Number(countRow?.count || 0),
    page: filters.page,
    pageSize: filters.pageSize,
  }
}

export async function getLeadDetail(db, id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) {
    throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
  }
  const row = await db('leads').where({ id }).first()
  if (!row) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
  return mapLead(row, true)
}

export function normalizeRemark(value) {
  const hasControlCharacter = typeof value === 'string' && [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 && ![9, 10, 13].includes(code)
  })
  if (typeof value !== 'string' || value.length > 1000 || /[<>]/.test(value) || hasControlCharacter) {
    throw createKwError(422, 'INVALID_REMARK', '备注必须为不超过 1000 字的纯文本。')
  }
  return value.replace(/\r\n?/g, '\n').trim()
}

export async function updateLead(db, id, input, now = new Date()) {
  if (!LEAD_STATUSES.includes(input.status)) {
    throw createKwError(422, 'INVALID_STATUS', '线索状态不正确。')
  }
  if (!Number.isInteger(input.version) || input.version < 1) {
    throw createKwError(422, 'INVALID_VERSION', '线索版本不正确。')
  }
  const remark = normalizeRemark(input.remark)

  return db.transaction(async (trx) => {
    const current = await trx('leads').where({ id }).forUpdate().first()
    if (!current) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
    if (current.version !== input.version) {
      throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    }

    const remarkChanged = current.remark !== remark
    const statusChanged = current.status !== input.status
    await trx('leads').where({ id, version: input.version }).update({
      status: input.status,
      remark,
      version: input.version + 1,
      updated_at: now,
    })
    await trx('lead_audit').insert({
      lead_id: id,
      operation_type: statusChanged && remarkChanged ? 'status_and_remark' : (statusChanged ? 'status' : 'remark'),
      old_status: current.status,
      new_status: input.status,
      remark_changed: remarkChanged,
      operated_at: now,
    })

    return { version: input.version + 1, updatedAt: now }
  })
}

export function escapeCsvCell(value) {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@\t\r\n]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function leadsToCsv(rows) {
  const headers = ['姓名', '手机号', '园区数量', '状态', '备注', '隐私同意时间', '提交时间', '更新时间']
  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of rows) {
    lines.push([
      row.name,
      row.phone,
      row.park_count,
      row.status,
      row.remark,
      row.privacy_consent_at instanceof Date ? row.privacy_consent_at.toISOString() : row.privacy_consent_at,
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    ].map(escapeCsvCell).join(','))
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`
}
