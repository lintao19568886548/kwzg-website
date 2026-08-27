import { createKwError } from './business-error.js'

export async function markLeadRead(db, adminUserId, leadId, now = new Date()) {
  const lead = await db('leads').select('id', 'updated_at').where({ id: leadId }).first()
  if (!lead) throw createKwError(404, 'LEAD_NOT_FOUND', '未找到该线索。')
  await db('admin_lead_read_state').insert({
    admin_user_id: adminUserId,
    lead_id: leadId,
    read_at: now,
    last_seen_lead_updated_at: lead.updated_at,
    created_at: now,
    updated_at: now,
  }).onConflict(['admin_user_id', 'lead_id']).merge({
    read_at: now,
    last_seen_lead_updated_at: lead.updated_at,
    updated_at: now,
  })
  return { readAt: now }
}

export async function preserveOwnLeadReadState(db, adminUserId, leadId, leadUpdatedAt, now = new Date()) {
  await db('admin_lead_read_state').insert({
    admin_user_id: adminUserId,
    lead_id: leadId,
    read_at: now,
    last_seen_lead_updated_at: leadUpdatedAt,
    created_at: now,
    updated_at: now,
  }).onConflict(['admin_user_id', 'lead_id']).merge({
    read_at: now,
    last_seen_lead_updated_at: leadUpdatedAt,
    updated_at: now,
  })
}

export async function countUnreadLeads(db, adminUserId) {
  const row = await db({ lead: 'leads' })
    .leftJoin({ readState: 'admin_lead_read_state' }, function joinReadState() {
      this.on('readState.lead_id', '=', 'lead.id').andOnVal('readState.admin_user_id', '=', adminUserId)
    })
    .where(builder => builder.whereNull('readState.read_at').orWhereRaw('lead.updated_at > readState.last_seen_lead_updated_at'))
    .countDistinct({ count: 'lead.id' })
    .first()
  return Number(row?.count || 0)
}
