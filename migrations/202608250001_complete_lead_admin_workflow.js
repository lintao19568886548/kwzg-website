const LEAD_STATUS_CODES = ['PENDING', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'WON', 'ON_HOLD', 'INVALID', 'CLOSED']
const LEGACY_STATUS_CODES = ['待跟进', '跟进中', '已安排演示', '已完成', '无效']
const FOLLOW_UP_METHODS = ['PHONE', 'WECOM', 'ON_SITE', 'VIDEO', 'OTHER']

export async function up(knex) {
  await knex.schema.createTable('admin_users', (table) => {
    table.charset('utf8mb4')
    table.collate('utf8mb4_unicode_ci')
    table.string('id', 36).primary()
    table.string('username', 64).notNullable().unique()
    table.string('password_hash', 255).notNullable()
    table.boolean('enabled').notNullable().defaultTo(true)
    table.integer('credential_version').unsigned().notNullable().defaultTo(1)
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('last_login_at', { useTz: false }).nullable()
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.index(['enabled', 'username'], 'admin_users_enabled_username_idx')
  })

  await knex.raw('ALTER TABLE leads MODIFY COLUMN status VARCHAR(32) NOT NULL')
  await knex('leads').where({ status: '待跟进' }).update({ status: 'PENDING' })
  await knex('leads').where({ status: '跟进中' }).update({ status: 'CONTACTED' })
  await knex('leads').where({ status: '已安排演示' }).update({ status: 'DEMO_SCHEDULED' })
  await knex('leads').where({ status: '已完成' }).update({ status: 'DEMO_COMPLETED' })
  await knex('leads').where({ status: '无效' }).update({ status: 'INVALID' })
  await knex.raw(`ALTER TABLE leads MODIFY COLUMN status ENUM(${LEAD_STATUS_CODES.map(() => '?').join(',')}) NOT NULL DEFAULT 'PENDING'`, LEAD_STATUS_CODES)

  await knex.schema.alterTable('leads', (table) => {
    table.string('source_page', 255).notNullable().defaultTo('/demo')
    table.string('assigned_admin_user_id', 36).nullable()
    table.timestamp('next_follow_up_at', { useTz: false }).nullable()
    table.timestamp('last_follow_up_at', { useTz: false }).nullable()
    table.foreign('assigned_admin_user_id', 'leads_assigned_admin_fk').references('admin_users.id').onDelete('RESTRICT')
    table.index(['assigned_admin_user_id', 'status'], 'leads_assignee_status_idx')
    table.index(['next_follow_up_at'], 'leads_next_follow_up_idx')
    table.index(['last_follow_up_at'], 'leads_last_follow_up_idx')
    table.index(['source_page'], 'leads_source_page_idx')
  })

  await knex.schema.alterTable('admin_sessions', (table) => {
    table.string('admin_user_id', 36).nullable()
    table.integer('credential_version').unsigned().notNullable().defaultTo(1)
    table.foreign('admin_user_id', 'admin_sessions_user_fk').references('admin_users.id').onDelete('RESTRICT')
    table.index(['admin_user_id', 'revoked_at'], 'admin_sessions_user_revoked_idx')
  })

  await knex.schema.alterTable('lead_audit', (table) => {
    table.dropForeign('lead_id', 'lead_audit_lead_fk')
  })
  await knex.schema.alterTable('lead_audit', (table) => {
    table.string('lead_id', 36).nullable().alter()
    table.string('admin_user_id', 36).nullable()
    table.string('before_summary', 255).notNullable().defaultTo('')
    table.string('after_summary', 255).notNullable().defaultTo('')
    table.string('note_summary', 255).notNullable().defaultTo('')
    table.string('request_id', 64).notNullable().defaultTo('')
    table.string('source_ip', 45).nullable()
    table.foreign('lead_id', 'lead_audit_lead_fk').references('leads.id').onDelete('RESTRICT')
    table.foreign('admin_user_id', 'lead_audit_admin_fk').references('admin_users.id').onDelete('RESTRICT')
    table.index(['operation_type', 'operated_at'], 'lead_audit_event_time_idx')
    table.index(['admin_user_id', 'operated_at'], 'lead_audit_admin_time_idx')
  })
  await knex('lead_audit').where({ operation_type: 'created' }).update({ operation_type: 'LEAD_CREATED' })

  await knex.schema.createTable('lead_follow_ups', (table) => {
    table.charset('utf8mb4')
    table.collate('utf8mb4_unicode_ci')
    table.string('id', 36).primary()
    table.string('lead_id', 36).notNullable()
    table.string('admin_user_id', 36).notNullable()
    table.enu('contact_method', FOLLOW_UP_METHODS, { useNative: true, enumName: 'follow_up_method' }).notNullable()
    table.text('content').notNullable()
    table.timestamp('next_follow_up_at', { useTz: false }).nullable()
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.foreign('lead_id', 'lead_follow_ups_lead_fk').references('leads.id').onDelete('RESTRICT')
    table.foreign('admin_user_id', 'lead_follow_ups_admin_fk').references('admin_users.id').onDelete('RESTRICT')
    table.index(['lead_id', 'created_at'], 'lead_follow_ups_lead_time_idx')
    table.index(['admin_user_id', 'created_at'], 'lead_follow_ups_admin_time_idx')
    table.index(['next_follow_up_at'], 'lead_follow_ups_next_time_idx')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('lead_follow_ups')
  await knex.schema.alterTable('lead_audit', (table) => {
    table.dropForeign('admin_user_id', 'lead_audit_admin_fk')
    table.dropForeign('lead_id', 'lead_audit_lead_fk')
    table.dropIndex(['operation_type', 'operated_at'], 'lead_audit_event_time_idx')
    table.dropIndex(['admin_user_id', 'operated_at'], 'lead_audit_admin_time_idx')
  })
  await knex.schema.alterTable('lead_audit', (table) => {
    table.string('lead_id', 36).notNullable().alter()
    table.dropColumns('admin_user_id', 'before_summary', 'after_summary', 'note_summary', 'request_id', 'source_ip')
    table.foreign('lead_id', 'lead_audit_lead_fk').references('leads.id').onDelete('RESTRICT')
  })
  await knex.schema.alterTable('admin_sessions', (table) => {
    table.dropForeign('admin_user_id', 'admin_sessions_user_fk')
    table.dropIndex(['admin_user_id', 'revoked_at'], 'admin_sessions_user_revoked_idx')
    table.dropColumns('admin_user_id', 'credential_version')
  })
  await knex.schema.alterTable('leads', (table) => {
    table.dropForeign('assigned_admin_user_id', 'leads_assigned_admin_fk')
    table.dropIndex(['assigned_admin_user_id', 'status'], 'leads_assignee_status_idx')
    table.dropIndex(['next_follow_up_at'], 'leads_next_follow_up_idx')
    table.dropIndex(['last_follow_up_at'], 'leads_last_follow_up_idx')
    table.dropIndex(['source_page'], 'leads_source_page_idx')
  })
  await knex.raw('ALTER TABLE leads MODIFY COLUMN status VARCHAR(32) NOT NULL')
  await knex('leads').where({ status: 'PENDING' }).update({ status: '待跟进' })
  await knex('leads').whereIn('status', ['CONTACTED', 'ON_HOLD']).update({ status: '跟进中' })
  await knex('leads').where({ status: 'DEMO_SCHEDULED' }).update({ status: '已安排演示' })
  await knex('leads').whereIn('status', ['DEMO_COMPLETED', 'WON']).update({ status: '已完成' })
  await knex('leads').whereIn('status', ['INVALID', 'CLOSED']).update({ status: '无效' })
  await knex.raw(`ALTER TABLE leads MODIFY COLUMN status ENUM(${LEGACY_STATUS_CODES.map(() => '?').join(',')}) NOT NULL DEFAULT '待跟进'`, LEGACY_STATUS_CODES)
  await knex.schema.alterTable('leads', (table) => {
    table.dropColumns('source_page', 'assigned_admin_user_id', 'next_follow_up_at', 'last_follow_up_at')
  })
  await knex.schema.dropTableIfExists('admin_users')
}
