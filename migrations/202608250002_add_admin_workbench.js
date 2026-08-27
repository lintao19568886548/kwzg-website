export async function up(knex) {
  if (!(await knex.schema.hasColumn('leads', 'demo_scheduled_at'))) {
    await knex.schema.alterTable('leads', (table) => {
      table.timestamp('demo_scheduled_at', { useTz: false }).nullable()
      table.string('demo_method', 32).nullable()
      table.string('demo_note', 500).notNullable().defaultTo('')
      table.index(['demo_scheduled_at'], 'leads_demo_scheduled_idx')
      table.index(['status', 'next_follow_up_at'], 'leads_status_next_follow_idx')
    })
  }

  if (!(await knex.schema.hasTable('admin_lead_read_state'))) {
    await knex.schema.createTable('admin_lead_read_state', (table) => {
      table.charset('utf8mb4')
      table.collate('utf8mb4_unicode_ci')
      table.string('admin_user_id', 36).notNullable()
      table.string('lead_id', 36).notNullable()
      table.timestamp('read_at', { useTz: false }).notNullable()
      table.timestamp('last_seen_lead_updated_at', { useTz: false }).notNullable()
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.primary(['admin_user_id', 'lead_id'], 'admin_lead_read_state_pk')
      table.foreign('admin_user_id', 'admin_lead_read_admin_fk').references('admin_users.id').onDelete('RESTRICT')
      table.foreign('lead_id', 'admin_lead_read_lead_fk').references('leads.id').onDelete('RESTRICT')
      table.index(['admin_user_id', 'read_at'], 'admin_lead_read_admin_time_idx')
      table.index(['lead_id', 'updated_at'], 'admin_lead_read_lead_time_idx')
    })
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('admin_lead_read_state')
  if (await knex.schema.hasColumn('leads', 'demo_scheduled_at')) {
    await knex.schema.alterTable('leads', (table) => {
      table.dropIndex(['demo_scheduled_at'], 'leads_demo_scheduled_idx')
      table.dropIndex(['status', 'next_follow_up_at'], 'leads_status_next_follow_idx')
      table.dropColumns('demo_scheduled_at', 'demo_method', 'demo_note')
    })
  }
}
