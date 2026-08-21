import process from 'node:process'

const required = ['NUXT_DATABASE_URL', 'NUXT_ADMIN_USERNAME', 'NUXT_ADMIN_PASSWORD_HASH', 'NUXT_SESSION_PASSWORD']
if (required.some(name => !process.env[name])) {
  throw new Error('Required Stage 2 server configuration is missing.')
}

if (!process.env.NUXT_ADMIN_PASSWORD_HASH.startsWith('$argon2id$')) {
  throw new Error('NUXT_ADMIN_PASSWORD_HASH must be an Argon2id hash.')
}

if (process.env.NUXT_SESSION_PASSWORD.length < 32) {
  throw new Error('NUXT_SESSION_PASSWORD must contain at least 32 characters.')
}

const databaseUrl = new URL(process.env.NUXT_DATABASE_URL)
if (!['mysql:', 'mariadb:'].includes(databaseUrl.protocol) || databaseUrl.username.toLowerCase() === 'root') {
  throw new Error('NUXT_DATABASE_URL must use a non-root MariaDB/MySQL account.')
}

process.stdout.write('Runtime configuration validated.\n')
