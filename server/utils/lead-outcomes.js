import { appendAudit, AUDIT_EVENTS } from './audit.js'
import { createKwError } from './business-error.js'
import { preserveOwnLeadReadState } from './lead-read-state.js'
import { normalizeMultilinePlainText } from './security.js'
import { canTransitionLeadStatus, leadStatusLabel } from '../../shared/lead-statuses.js'

function validateVersion(version) {
  if (!Number.isInteger(version) || version < 1) throw createKwError(422, 'INVALID_VERSION', '线索版本不正确。')
  return version
}

function parseOptionalFutureTime(value, label, now) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime()) || parsed <= now) throw createKwError(422, 'INVALID_FOLLOW_UP_TIME', `${label}必须晚于当前时间。`)
  return parsed
}

async function lockLead(trx, leadId, version) {
  const lead = await trx('leads').where({ id: leadId }).forUpdate().first()
  if (!lead) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
  if (lead.version !== version) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
  return lead
}

async function finishChange(trx, lead, update, audit, context, now) {
  const nextVersion = lead.version + 1
  const updated = await trx('leads').where({ id: lead.id, version: lead.version }).update({ ...update, assigned_admin_user_id: lead.assigned_admin_user_id || context.admin.id, version: nextVersion, updated_at: now })
  if (updated !== 1) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
  if (!lead.assigned_admin_user_id) {
    await appendAudit(trx, { leadId: lead.id, adminUserId: context.admin.id, eventType: AUDIT_EVENTS.ASSIGNEE_CHANGED, beforeSummary: '未分配', afterSummary: context.admin.username, noteSummary: '处理业务结果时自动认领', requestId: context.requestId, sourceIp: context.sourceIp, now })
  }
  await appendAudit(trx, { leadId: lead.id, adminUserId: context.admin.id, oldStatus: lead.status, requestId: context.requestId, sourceIp: context.sourceIp, now, ...audit })
  await preserveOwnLeadReadState(trx, context.admin.id, lead.id, now, now)
  return { version: nextVersion, status: update.status, statusLabel: leadStatusLabel(update.status), updatedAt: now }
}

export async function completeLeadDemo(db, leadId, input, context, now = new Date()) {
  const version = validateVersion(input.version)
  const note = normalizeMultilinePlainText(input.note, 500, '完成说明')
  return db.transaction(async (trx) => {
    const lead = await lockLead(trx, leadId, version)
    if (lead.status !== 'DEMO_SCHEDULED') throw createKwError(422, 'INVALID_STATUS_TRANSITION', '只有已预约的演示可以标记完成。')
    return finishChange(trx, lead, { status: 'DEMO_COMPLETED', demo_completed_at: now, next_follow_up_at: null }, { eventType: AUDIT_EVENTS.DEMO_COMPLETED, newStatus: 'DEMO_COMPLETED', beforeSummary: leadStatusLabel(lead.status), afterSummary: leadStatusLabel('DEMO_COMPLETED'), noteSummary: note }, context, now)
  })
}

export async function cancelLeadDemo(db, leadId, input, context, now = new Date()) {
  const version = validateVersion(input.version)
  const note = normalizeMultilinePlainText(input.note, 500, '取消原因')
  const nextFollowUpAt = parseOptionalFutureTime(input.nextFollowUpAt, '下次跟进时间', now)
  return db.transaction(async (trx) => {
    const lead = await lockLead(trx, leadId, version)
    if (lead.status !== 'DEMO_SCHEDULED') throw createKwError(422, 'INVALID_STATUS_TRANSITION', '只有已预约的演示可以取消。')
    return finishChange(trx, lead, { status: 'CONTACTED', demo_cancelled_at: now, demo_scheduled_at: null, next_follow_up_at: nextFollowUpAt }, { eventType: AUDIT_EVENTS.DEMO_CANCELLED, newStatus: 'CONTACTED', beforeSummary: lead.demo_scheduled_at ? new Date(lead.demo_scheduled_at).toISOString() : leadStatusLabel(lead.status), afterSummary: leadStatusLabel('CONTACTED'), noteSummary: note }, context, now)
  })
}

export async function archiveLeadOutcome(db, leadId, input, context, now = new Date()) {
  const version = validateVersion(input.version)
  const outcome = String(input.outcome || '')
  const note = normalizeMultilinePlainText(input.note, 500, '归档原因')
  if (!['WON', 'ON_HOLD', 'INVALID'].includes(outcome)) throw createKwError(422, 'INVALID_OUTCOME', '归档结果不正确。')
  const nextFollowUpAt = outcome === 'ON_HOLD' ? parseOptionalFutureTime(input.nextFollowUpAt, '预计重新跟进时间', now) : null
  if (outcome === 'ON_HOLD' && !nextFollowUpAt) throw createKwError(422, 'FOLLOW_UP_TIME_REQUIRED', '暂缓时必须填写预计重新跟进时间。')
  const parkCount = input.parkCount === '' || input.parkCount == null ? null : Number(input.parkCount)
  if (parkCount != null && (!Number.isInteger(parkCount) || parkCount < 1 || parkCount > 999)) throw createKwError(422, 'INVALID_PARK_COUNT', '成交园区数量不正确。')
  const reopenAllowed = input.reopenAllowed !== false
  return db.transaction(async (trx) => {
    const lead = await lockLead(trx, leadId, version)
    if (!canTransitionLeadStatus(lead.status, outcome)) throw createKwError(422, 'INVALID_STATUS_TRANSITION', `不能从“${leadStatusLabel(lead.status)}”归档为“${leadStatusLabel(outcome)}”。`)
    const update = { status: outcome, next_follow_up_at: nextFollowUpAt }
    let eventType = AUDIT_EVENTS.LEAD_INVALIDATED
    if (outcome === 'WON') Object.assign(update, { won_at: now, won_note: note, won_park_count: parkCount }), eventType = AUDIT_EVENTS.LEAD_WON
    if (outcome === 'ON_HOLD') Object.assign(update, { hold_reason: note }), eventType = AUDIT_EVENTS.LEAD_PAUSED
    if (outcome === 'INVALID') Object.assign(update, { invalid_reason: note, reopen_allowed: reopenAllowed }), eventType = AUDIT_EVENTS.LEAD_INVALIDATED
    return finishChange(trx, lead, update, { eventType, newStatus: outcome, beforeSummary: leadStatusLabel(lead.status), afterSummary: leadStatusLabel(outcome), noteSummary: note }, context, now)
  })
}

export async function reopenLead(db, leadId, input, context, now = new Date()) {
  const version = validateVersion(input.version)
  const note = normalizeMultilinePlainText(input.note, 500, '重新开启原因')
  return db.transaction(async (trx) => {
    const lead = await lockLead(trx, leadId, version)
    if (lead.status !== 'INVALID' || !lead.reopen_allowed || !canTransitionLeadStatus('INVALID', 'PENDING')) throw createKwError(422, 'REOPEN_NOT_ALLOWED', '该线索不允许重新开启。')
    return finishChange(trx, lead, { status: 'PENDING', invalid_reason: '', next_follow_up_at: null }, { eventType: AUDIT_EVENTS.LEAD_REOPENED, newStatus: 'PENDING', beforeSummary: leadStatusLabel('INVALID'), afterSummary: leadStatusLabel('PENDING'), noteSummary: note }, context, now)
  })
}
