const LEAD_STATUSES = ['待跟进', '跟进中', '已安排演示', '已完成', '无效']

export async function up(knex) {
  await knex.schema.createTable('leads', (table) => {
    table.charset('utf8mb4')
    table.collate('utf8mb4_unicode_ci')
    table.string('id', 36).primary()
    table.string('name', 64).notNullable()
    table.string('phone', 18).notNullable()
    table.integer('park_count').unsigned().notNullable()
    table.enu('status', LEAD_STATUSES, { useNative: true, enumName: 'lead_status' }).notNullable().defaultTo('待跟进')
    table.text('remark').notNullable().defaultTo('')
    table.timestamp('privacy_consent_at', { useTz: false }).notNullable()
    table.string('privacy_version', 32).notNullable()
    table.string('idempotency_key', 96).notNullable().unique()
    table.integer('version').unsigned().notNullable().defaultTo(1)
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.index(['status', 'created_at'], 'leads_status_created_idx')
    table.index(['phone'], 'leads_phone_idx')
    table.index(['name'], 'leads_name_idx')
  })

  await knex.schema.createTable('lead_audit', (table) => {
    table.charset('utf8mb4')
    table.collate('utf8mb4_unicode_ci')
    table.bigIncrements('id').primary()
    table.string('lead_id', 36).notNullable()
    table.string('operation_type', 32).notNullable()
    table.string('old_status', 32).nullable()
    table.string('new_status', 32).nullable()
    table.boolean('remark_changed').notNullable().defaultTo(false)
    table.timestamp('operated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.foreign('lead_id', 'lead_audit_lead_fk').references('leads.id').onDelete('RESTRICT')
    table.index(['lead_id', 'operated_at'], 'lead_audit_lead_time_idx')
  })

  await knex.schema.createTable('admin_sessions', (table) => {
    table.charset('utf8mb4')
    table.collate('utf8mb4_unicode_ci')
    table.string('token_hash', 64).primary()
    table.string('csrf_token_hash', 64).notNullable()
    table.timestamp('created_at', { useTz: false }).notNullable()
    table.timestamp('last_activity_at', { useTz: false }).notNullable()
    table.timestamp('expires_at', { useTz: false }).notNullable()
    table.timestamp('absolute_expires_at', { useTz: false }).notNullable()
    table.timestamp('revoked_at', { useTz: false }).nullable()
    table.index(['expires_at'], 'admin_sessions_expires_idx')
  })

  await knex.schema.createTable('rate_limits', (table) => {
    table.charset('utf8mb4')
    table.collate('utf8mb4_unicode_ci')
    table.string('bucket_key', 64).primary()
    table.string('action', 32).notNullable()
    table.timestamp('window_start', { useTz: false }).notNullable()
    table.integer('hits').unsigned().notNullable().defaultTo(1)
    table.timestamp('expires_at', { useTz: false }).notNullable()
    table.index(['expires_at'], 'rate_limits_expires_idx')
  })

}

export async function down(knex) {
  await knex.schema.dropTableIfExists('rate_limits')
  await knex.schema.dropTableIfExists('admin_sessions')
  await knex.schema.dropTableIfExists('lead_audit')
  await knex.schema.dropTableIfExists('leads')
}
