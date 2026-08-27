import { createHash } from 'node:crypto'

function submissionDigest(row) {
  return createHash('sha256')
    .update(`${row.name}|${row.phone}|${row.park_count}`)
    .digest('hex')
}

function referenceCode(row) {
  const date = new Date(row.created_at || Date.now())
  const datePart = Number.isNaN(date.getTime())
    ? '00000000'
    : date.toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = String(row.id || '').replaceAll('-', '').slice(0, 8).toUpperCase().padEnd(8, '0')
  return `KW-${datePart}-${suffix}`
}

async function indexExists(knex, tableName, indexName) {
  const [rows] = await knex.raw(
    'SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1',
    [tableName, indexName],
  )
  return rows.length > 0
}

export async function up(knex) {
  if (!(await knex.schema.hasColumn('leads', 'reference_code'))) {
    await knex.schema.alterTable('leads', (table) => {
      table.string('reference_code', 32).nullable()
    })
  }
  const leadsWithoutReference = await knex('leads')
    .select('id', 'created_at')
    .whereNull('reference_code')
  for (const row of leadsWithoutReference) {
    await knex('leads').where({ id: row.id }).update({ reference_code: referenceCode(row) })
  }
  await knex.schema.alterTable('leads', (table) => {
    table.string('reference_code', 32).notNullable().alter()
  })
  if (!(await indexExists(knex, 'leads', 'leads_reference_code_unique'))) {
    await knex.schema.alterTable('leads', (table) => {
      table.unique(['reference_code'], 'leads_reference_code_unique')
    })
  }

  if (!(await knex.schema.hasColumn('leads', 'idempotency_digest'))) {
    await knex.schema.alterTable('leads', (table) => {
      table.string('idempotency_digest', 64).nullable()
    })
  }
  const leadsWithoutDigest = await knex('leads')
    .select('id', 'name', 'phone', 'park_count')
    .whereNull('idempotency_digest')
  for (const row of leadsWithoutDigest) {
    await knex('leads').where({ id: row.id }).update({ idempotency_digest: submissionDigest(row) })
  }
  await knex.schema.alterTable('leads', (table) => {
    table.string('idempotency_digest', 64).notNullable().alter()
  })

  if (!(await knex.schema.hasColumn('lead_follow_ups', 'result'))) {
    await knex.schema.alterTable('lead_follow_ups', (table) => {
      table.string('result', 500).notNullable().defaultTo('')
    })
  }
  if (!(await knex.schema.hasColumn('lead_follow_ups', 'next_plan'))) {
    await knex.schema.alterTable('lead_follow_ups', (table) => {
      table.string('next_plan', 500).notNullable().defaultTo('')
    })
  }
}

export async function down(knex) {
  if (await knex.schema.hasColumn('lead_follow_ups', 'result')) {
    await knex.schema.alterTable('lead_follow_ups', (table) => {
      table.dropColumns('result', 'next_plan')
    })
  }
  if (await knex.schema.hasColumn('leads', 'idempotency_digest')) {
    await knex.schema.alterTable('leads', (table) => {
      table.dropColumn('idempotency_digest')
    })
  }
  if (await knex.schema.hasColumn('leads', 'reference_code')) {
    await knex.schema.alterTable('leads', (table) => {
      table.dropUnique(['reference_code'], 'leads_reference_code_unique')
      table.dropColumn('reference_code')
    })
  }
}
