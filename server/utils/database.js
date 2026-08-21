import knexFactory from 'knex'
import { createKwError } from './business-error.js'

let database
let connectionUrl

const DATABASE_CONNECTION_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENOTFOUND',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'PROTOCOL_ENQUEUE_AFTER_QUIT',
])

const DATABASE_CONFIGURATION_CODES = new Set([
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_DBACCESS_DENIED_ERROR',
])

export function assertSafeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    throw createKwError(503, 'DATABASE_UNAVAILABLE', '服务暂时不可用，请稍后再试。')
  }

  let parsed
  try {
    parsed = new URL(databaseUrl)
  } catch {
    throw createKwError(503, 'DATABASE_UNAVAILABLE', '服务暂时不可用，请稍后再试。')
  }

  if (!['mysql:', 'mariadb:'].includes(parsed.protocol) || parsed.username.toLowerCase() === 'root') {
    throw createKwError(503, 'DATABASE_CONFIGURATION_ERROR', '服务暂时不可用，请稍后再试。')
  }

  return parsed
}

export function getDatabase(config) {
  const databaseUrl = config.databaseUrl
  assertSafeDatabaseUrl(databaseUrl)

  if (database && connectionUrl === databaseUrl) {
    return database
  }

  if (database) {
    void database.destroy()
  }

  connectionUrl = databaseUrl
  database = knexFactory({
    client: 'mysql2',
    connection: databaseUrl,
    pool: {
      min: 0,
      max: 8,
      acquireTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
      createTimeoutMillis: 8000,
    },
  })

  return database
}

export function normalizeDatabaseError(error) {
  if (error?.name === 'KwBusinessError') return error

  if (DATABASE_CONFIGURATION_CODES.has(error?.code)) {
    return createKwError(503, 'DATABASE_CONFIGURATION_ERROR', '服务暂时不可用，请稍后再试。')
  }

  if (error?.code === 'ER_NO_SUCH_TABLE') {
    return createKwError(503, 'DATABASE_MIGRATION_REQUIRED', '服务暂时不可用，请稍后再试。')
  }

  if (DATABASE_CONNECTION_CODES.has(error?.code)) {
    return createKwError(503, 'DATABASE_UNAVAILABLE', '服务暂时不可用，请稍后再试。')
  }

  return error
}

export async function closeDatabase() {
  if (database) {
    await database.destroy()
    database = undefined
    connectionUrl = undefined
  }
}
