import knexFactory from 'knex'
import knexConfig from '../knexfile.js'

const db = knexFactory(knexConfig)

try {
  const [batch, files] = await db.migrate.rollback(undefined, false)
  process.stdout.write(`Rolled back batch ${batch}; reverted ${files.length} file(s).\n`)
} finally {
  await db.destroy()
}
