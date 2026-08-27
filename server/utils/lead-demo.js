import { appendAudit, AUDIT_EVENTS } from './audit.js'
import { createKwError } from './business-error.js'
import { preserveOwnLeadReadState } from './lead-read-state.js'
import { normalizeMultilinePlainText } from './security.js'
import { canTransitionLeadStatus, DEMO_METHOD_CODES, DEMO_METHOD_LABELS, leadStatusLabel } from '../../shared/lead-statuses.js'

export function validateDemoSchedule(input, now = new Date()) {
  if (!Number.isInteger(input.version) || input.version < 1) throw createKwError(422, 'INVALID_VERSION', '线索版本不正确。')
  if (!DEMO_METHOD_CODES.includes(input.demoMethod)) throw createKwError(422, 'INVALID_DEMO_METHOD', '演示方式不正确。')
  if (typeof input.demoScheduledAt !== 'string' || input.demoScheduledAt.length > 40) throw createKwError(422, 'INVALID_DEMO_TIME', '演示时间不正确。')
  const demoScheduledAt = new Date(input.demoScheduledAt)
  if (Number.isNaN(demoScheduledAt.getTime()) || demoScheduledAt <= now) throw createKwError(422, 'INVALID_DEMO_TIME', '请选择未来的演示时间。')
  return {
    version: input.version,
    demoMethod: input.demoMethod,
    demoScheduledAt,
    title: normalizeMultilinePlainText(input.title || '产品能力演示', 120, '演示主题'),
    note: normalizeMultilinePlainText(input.note, 500, '演示备注'),
  }
}

export async function scheduleLeadDemo(db, leadId, input, context, now = new Date()) {
  const normalized = validateDemoSchedule(input, now)
  return db.transaction(async (trx) => {
    const lead = await trx('leads').where({ id: leadId }).forUpdate().first()
    if (!lead) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
    if (lead.version !== normalized.version) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    const rescheduling = lead.status === 'DEMO_SCHEDULED'
    if (!rescheduling && !canTransitionLeadStatus(lead.status, 'DEMO_SCHEDULED')) throw createKwError(422, 'INVALID_STATUS_TRANSITION', `不能从“${leadStatusLabel(lead.status)}”直接安排演示。`)
    const nextVersion = lead.version + 1
    const updated = await trx('leads').where({ id: leadId, version: lead.version }).update({
      status: 'DEMO_SCHEDULED',
      demo_scheduled_at: normalized.demoScheduledAt,
      demo_method: normalized.demoMethod,
      demo_title: normalized.title,
      demo_note: normalized.note,
      demo_completed_at: null,
      demo_cancelled_at: null,
      next_follow_up_at: normalized.demoScheduledAt,
      assigned_admin_user_id: lead.assigned_admin_user_id || context.admin.id,
      version: nextVersion,
      updated_at: now,
    })
    if (updated !== 1) throw createKwError(409, 'VERSION_CONFLICT', '线索已被更新，请刷新后重试。')
    if (!lead.assigned_admin_user_id) {
      await appendAudit(trx, { leadId, adminUserId: context.admin.id, eventType: AUDIT_EVENTS.ASSIGNEE_CHANGED, beforeSummary: '未分配', afterSummary: context.admin.username, noteSummary: '首次安排演示时自动认领', requestId: context.requestId, sourceIp: context.sourceIp, now })
    }
    await appendAudit(trx, {
      leadId,
      adminUserId: context.admin.id,
      eventType: rescheduling ? AUDIT_EVENTS.DEMO_RESCHEDULED : AUDIT_EVENTS.DEMO_SCHEDULED,
      oldStatus: lead.status,
      newStatus: 'DEMO_SCHEDULED',
      beforeSummary: rescheduling && lead.demo_scheduled_at ? new Date(lead.demo_scheduled_at).toISOString() : leadStatusLabel(lead.status),
      afterSummary: `${normalized.title} · ${DEMO_METHOD_LABELS[normalized.demoMethod]} · ${normalized.demoScheduledAt.toISOString()}`,
      noteSummary: normalized.note,
      requestId: context.requestId,
      sourceIp: context.sourceIp,
      now,
    })
    await preserveOwnLeadReadState(trx, context.admin.id, leadId, now, now)
    return { version: nextVersion, status: 'DEMO_SCHEDULED', demoScheduledAt: normalized.demoScheduledAt, demoMethod: normalized.demoMethod, updatedAt: now }
  })
}
