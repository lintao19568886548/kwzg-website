import { countUnreadLeads } from './lead-read-state.js'
import { maskPhone } from './security.js'
import { shanghaiDayBounds, shanghaiMonthBounds } from './shanghai-time.js'
import { leadStatusLabel } from '../../shared/lead-statuses.js'

const TERMINAL_STATUSES = ['WON', 'INVALID', 'CLOSED']

function countValue(row, key) {
  return Number(row?.[key] || 0)
}

function mapTask(row) {
  return {
    id: row.id,
    name: row.name,
    phone: maskPhone(row.phone),
    parkCount: row.park_count,
    status: row.status,
    statusLabel: leadStatusLabel(row.status),
    assignee: row.assigned_admin_username || '未分配',
    nextFollowUpAt: row.next_follow_up_at || null,
    createdAt: row.created_at,
    version: row.version,
  }
}

function taskBase(db) {
  return db({ lead: 'leads' }).leftJoin({ assigned: 'admin_users' }, 'assigned.id', 'lead.assigned_admin_user_id').select('lead.id', 'lead.name', 'lead.phone', 'lead.park_count', 'lead.status', 'lead.next_follow_up_at', 'lead.demo_scheduled_at', 'lead.created_at', 'lead.version', 'assigned.username as assigned_admin_username')
}

export async function getAdminDashboard(db, adminUserId, now = new Date(), taskLimit = 8) {
  const day = shanghaiDayBounds(now)
  const month = shanghaiMonthBounds(now)
  const includeTasks = Number.isInteger(taskLimit) && taskLimit > 0
  const [leadCounts, monthlyWon, unreadCount, newItems, todayItems, overdueItems, demoItems, recentActivity] = await Promise.all([
    db('leads').select({
      todayNew: db.raw('COALESCE(SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END), 0)', [day.start, day.end]),
      pending: db.raw("COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0)"),
      todayFollowUp: db.raw(`COALESCE(SUM(CASE WHEN next_follow_up_at >= ? AND next_follow_up_at < ? AND status NOT IN (${TERMINAL_STATUSES.map(() => '?').join(',')}) THEN 1 ELSE 0 END), 0)`, [day.start, day.end, ...TERMINAL_STATUSES]),
      overdue: db.raw(`COALESCE(SUM(CASE WHEN next_follow_up_at < ? AND status NOT IN (${TERMINAL_STATUSES.map(() => '?').join(',')}) THEN 1 ELSE 0 END), 0)`, [now, ...TERMINAL_STATUSES]),
      demoScheduled: db.raw("COALESCE(SUM(CASE WHEN status = 'DEMO_SCHEDULED' THEN 1 ELSE 0 END), 0)"),
    }).first(),
    db('lead_audit').whereIn('operation_type', ['STATUS_CHANGED', 'LEAD_WON']).where({ new_status: 'WON' }).where('operated_at', '>=', month.start).where('operated_at', '<', month.end).countDistinct({ count: 'lead_id' }).first(),
    countUnreadLeads(db, adminUserId),
    includeTasks ? taskBase(db).where({ status: 'PENDING' }).orderBy('created_at', 'asc').limit(taskLimit) : [],
    includeTasks ? taskBase(db).whereNotIn('status', TERMINAL_STATUSES).where('next_follow_up_at', '>=', day.start).where('next_follow_up_at', '<', day.end).orderBy('next_follow_up_at', 'asc').limit(taskLimit) : [],
    includeTasks ? taskBase(db).whereNotIn('status', TERMINAL_STATUSES).whereNotNull('next_follow_up_at').where('next_follow_up_at', '<', now).orderBy('next_follow_up_at', 'asc').limit(taskLimit) : [],
    includeTasks ? taskBase(db).where('lead.status', 'DEMO_SCHEDULED').whereNotNull('lead.demo_scheduled_at').where('lead.demo_scheduled_at', '>=', now).orderBy('lead.demo_scheduled_at', 'asc').limit(taskLimit) : [],
    includeTasks ? db({ audit: 'lead_audit' }).leftJoin({ admin: 'admin_users' }, 'admin.id', 'audit.admin_user_id').leftJoin({ lead: 'leads' }, 'lead.id', 'audit.lead_id').select('audit.id', 'audit.operation_type', 'audit.after_summary', 'audit.note_summary', 'audit.operated_at', 'admin.username as admin_username', 'lead.name as lead_name').orderBy('audit.operated_at', 'desc').limit(12) : [],
  ])

  return {
    generatedAt: now,
    metrics: {
      todayNew: countValue(leadCounts, 'todayNew'),
      pending: countValue(leadCounts, 'pending'),
      todayFollowUp: countValue(leadCounts, 'todayFollowUp'),
      overdue: countValue(leadCounts, 'overdue'),
      demoScheduled: countValue(leadCounts, 'demoScheduled'),
      monthlyWon: countValue(monthlyWon, 'count'),
      unread: unreadCount,
    },
    tasks: {
      overdue: overdueItems.map(mapTask),
      pending: newItems.map(mapTask),
      today: todayItems.map(mapTask),
      demos: demoItems.map(row => ({ ...mapTask(row), demoScheduledAt: row.demo_scheduled_at })),
    },
    recentActivity: recentActivity.map(row => ({ id: String(row.id), eventType: row.operation_type, leadName: row.lead_name || '', adminUsername: row.admin_username || '系统', summary: row.note_summary || row.after_summary || '', occurredAt: row.operated_at })),
  }
}
