import process from 'node:process'
import knexFactory from 'knex'
import knexConfig from '../knexfile.js'

const db = knexFactory(knexConfig)

try {
  const url = new URL(process.env.NUXT_DATABASE_URL || '')
  if (url.username.toLowerCase() === 'root') {
    throw new Error('The application database user must not be root.')
  }

  const [batch, files] = await db.migrate.latest()
  process.stdout.write(`Migration batch ${batch}; applied ${files.length} file(s).\n`)
} finally {
  await db.destroy()
}
