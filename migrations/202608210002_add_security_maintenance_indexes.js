export async function up(knex) {
  await knex.schema.alterTable('leads', (table) => {
    table.index(['updated_at'], 'idx_leads_updated_at')
  })

  await knex.schema.alterTable('admin_sessions', (table) => {
    table.index(['revoked_at'], 'idx_admin_sessions_revoked_at')
  })
}

export async function down(knex) {
  await knex.schema.alterTable('admin_sessions', (table) => {
    table.dropIndex(['revoked_at'], 'idx_admin_sessions_revoked_at')
  })

  await knex.schema.alterTable('leads', (table) => {
    table.dropIndex(['updated_at'], 'idx_leads_updated_at')
  })
}
