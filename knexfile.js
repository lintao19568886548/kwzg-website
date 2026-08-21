import process from 'node:process'

function connection() {
  const databaseUrl = process.env.NUXT_DATABASE_URL

  if (!databaseUrl) {
    throw new Error('NUXT_DATABASE_URL is required for database migrations.')
  }

  return databaseUrl
}

export default {
  client: 'mysql2',
  connection,
  migrations: {
    directory: './migrations',
    extension: 'js',
    tableName: 'knex_migrations',
  },
  pool: {
    min: 0,
    max: 6,
    acquireTimeoutMillis: 8000,
    idleTimeoutMillis: 30000,
  },
}
