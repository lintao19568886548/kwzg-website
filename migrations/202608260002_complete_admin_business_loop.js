async function addColumn(knex, tableName, columnName, callback) {
  if (!(await knex.schema.hasColumn(tableName, columnName))) {
    await knex.schema.alterTable(tableName, callback)
  }
}

export async function up(knex) {
  await addColumn(knex, 'leads', 'demo_title', table => table.string('demo_title', 120).notNullable().defaultTo('产品能力演示'))
  await addColumn(knex, 'leads', 'demo_completed_at', table => table.timestamp('demo_completed_at', { useTz: false }).nullable())
  await addColumn(knex, 'leads', 'demo_cancelled_at', table => table.timestamp('demo_cancelled_at', { useTz: false }).nullable())
  await addColumn(knex, 'leads', 'won_at', table => table.timestamp('won_at', { useTz: false }).nullable())
  await addColumn(knex, 'leads', 'won_note', table => table.string('won_note', 500).notNullable().defaultTo(''))
  await addColumn(knex, 'leads', 'won_park_count', table => table.integer('won_park_count').unsigned().nullable())
  await addColumn(knex, 'leads', 'hold_reason', table => table.string('hold_reason', 500).notNullable().defaultTo(''))
  await addColumn(knex, 'leads', 'invalid_reason', table => table.string('invalid_reason', 500).notNullable().defaultTo(''))
  await addColumn(knex, 'leads', 'reopen_allowed', table => table.boolean('reopen_allowed').notNullable().defaultTo(true))
  await addColumn(knex, 'admin_sessions', 'user_agent', table => table.string('user_agent', 255).notNullable().defaultTo(''))
  await addColumn(knex, 'admin_sessions', 'source_ip', table => table.string('source_ip', 45).nullable())
}

export async function down(knex) {
  const leadColumns = ['demo_title', 'demo_completed_at', 'demo_cancelled_at', 'won_at', 'won_note', 'won_park_count', 'hold_reason', 'invalid_reason', 'reopen_allowed']
  for (const column of leadColumns) {
    if (await knex.schema.hasColumn('leads', column)) await knex.schema.alterTable('leads', table => table.dropColumn(column))
  }
  for (const column of ['user_agent', 'source_ip']) {
    if (await knex.schema.hasColumn('admin_sessions', column)) await knex.schema.alterTable('admin_sessions', table => table.dropColumn(column))
  }
}
