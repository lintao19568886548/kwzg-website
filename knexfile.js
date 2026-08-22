import process from 'node:process'

function configureUtcConnection(connection, done) {
  connection.query("SET time_zone = '+00:00'", (timeZoneError) => {
    if (timeZoneError) return done(timeZoneError, connection)
    connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci", (charsetError) => done(charsetError, connection))
  })
}

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
    createTimeoutMillis: 8000,
    afterCreate: configureUtcConnection,
  },
}
