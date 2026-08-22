import process from 'node:process'
import knexFactory from 'knex'
import knexConfig from '../knexfile.js'

const db = knexFactory(knexConfig)
const migrationLock = 'kwzg_website_schema_migrations'
let connection
let lockAcquired = false

function queryConnection(rawConnection, sql, values = []) {
  return new Promise((resolve, reject) => {
    rawConnection.query(sql, values, (error, rows) => {
      if (error) reject(error)
      else resolve(rows)
    })
  })
}

try {
  const url = new URL(process.env.NUXT_DATABASE_URL || '')
  if (url.username.toLowerCase() === 'root') {
    throw new Error('The application database user must not be root.')
  }

  connection = await db.client.acquireConnection()
  const rows = await queryConnection(connection, 'SELECT GET_LOCK(?, 60) AS acquired', [migrationLock])
  lockAcquired = Number(rows?.[0]?.acquired) === 1
  if (!lockAcquired) throw new Error('Could not acquire the database migration lock.')

  const [batch, files] = await db.migrate.latest()
  process.stdout.write(`Migration batch ${batch}; applied ${files.length} file(s).\n`)
} finally {
  if (connection && lockAcquired) {
    try {
      await queryConnection(connection, 'SELECT RELEASE_LOCK(?)', [migrationLock])
    } catch {
      // The connection close below also releases a MySQL advisory lock.
    }
  }
  if (connection) await db.client.releaseConnection(connection)
  await db.destroy()
}
