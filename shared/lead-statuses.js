export const LEAD_STATUS_DEFINITIONS = Object.freeze([
  Object.freeze({ code: 'PENDING', label: '待跟进', tone: 'urgent' }),
  Object.freeze({ code: 'CONTACTED', label: '已联系', tone: 'active' }),
  Object.freeze({ code: 'DEMO_SCHEDULED', label: '已预约演示', tone: 'active' }),
  Object.freeze({ code: 'DEMO_COMPLETED', label: '已完成演示', tone: 'success' }),
  Object.freeze({ code: 'WON', label: '已成交', tone: 'success' }),
  Object.freeze({ code: 'ON_HOLD', label: '暂缓', tone: 'warning' }),
  Object.freeze({ code: 'INVALID', label: '无效线索', tone: 'muted' }),
  Object.freeze({ code: 'CLOSED', label: '已关闭', tone: 'muted' }),
])

export const LEAD_STATUS_CODES = Object.freeze(LEAD_STATUS_DEFINITIONS.map(item => item.code))
export const LEAD_STATUS_LABELS = Object.freeze(Object.fromEntries(LEAD_STATUS_DEFINITIONS.map(item => [item.code, item.label])))

export const LEAD_STATUS_TRANSITIONS = Object.freeze({
  PENDING: Object.freeze(['CONTACTED', 'ON_HOLD', 'INVALID']),
  CONTACTED: Object.freeze(['DEMO_SCHEDULED', 'ON_HOLD', 'INVALID']),
  DEMO_SCHEDULED: Object.freeze(['DEMO_COMPLETED', 'CONTACTED', 'ON_HOLD', 'INVALID']),
  DEMO_COMPLETED: Object.freeze(['WON', 'CONTACTED', 'ON_HOLD', 'INVALID']),
  WON: Object.freeze([]),
  ON_HOLD: Object.freeze(['PENDING', 'CONTACTED', 'INVALID']),
  INVALID: Object.freeze(['PENDING']),
  CLOSED: Object.freeze([]),
})

export const FOLLOW_UP_METHODS = Object.freeze([
  Object.freeze({ code: 'PHONE', label: '电话' }),
  Object.freeze({ code: 'WECOM', label: '企业微信' }),
  Object.freeze({ code: 'ON_SITE', label: '现场沟通' }),
  Object.freeze({ code: 'VIDEO', label: '线上演示' }),
  Object.freeze({ code: 'OTHER', label: '其他' }),
])

export const FOLLOW_UP_METHOD_CODES = Object.freeze(FOLLOW_UP_METHODS.map(item => item.code))
export const FOLLOW_UP_METHOD_LABELS = Object.freeze(Object.fromEntries(FOLLOW_UP_METHODS.map(item => [item.code, item.label])))

export const DEMO_METHODS = Object.freeze([
  Object.freeze({ code: 'ONLINE', label: '线上演示' }),
  Object.freeze({ code: 'ON_SITE', label: '上门演示' }),
  Object.freeze({ code: 'VISIT', label: '客户到访' }),
])
export const DEMO_METHOD_CODES = Object.freeze(DEMO_METHODS.map(item => item.code))
export const DEMO_METHOD_LABELS = Object.freeze(Object.fromEntries(DEMO_METHODS.map(item => [item.code, item.label])))

export function leadStatusLabel(code) {
  return LEAD_STATUS_LABELS[code] || code
}

export function canTransitionLeadStatus(from, to) {
  return Boolean(LEAD_STATUS_TRANSITIONS[from]?.includes(to))
}
