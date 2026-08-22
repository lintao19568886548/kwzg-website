import process from 'node:process'

const required = ['NUXT_DATABASE_URL', 'NUXT_ADMIN_USERNAME', 'NUXT_ADMIN_PASSWORD_HASH', 'NUXT_SESSION_PASSWORD', 'NUXT_PUBLIC_SITE_URL', 'NUXT_TRUSTED_ORIGINS']
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

function validateOrigin(value, label) {
  const url = new URL(value)
  const loopbackHttp = url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !loopbackHttp) || url.origin !== value || url.username || url.password) {
    throw new Error(`${label} must contain an HTTPS origin, or a loopback HTTP origin for local testing.`)
  }
}

validateOrigin(process.env.NUXT_PUBLIC_SITE_URL, 'NUXT_PUBLIC_SITE_URL')
for (const origin of process.env.NUXT_TRUSTED_ORIGINS.split(',').map(value => value.trim()).filter(Boolean)) {
  validateOrigin(origin, 'NUXT_TRUSTED_ORIGINS')
}

process.stdout.write('Runtime configuration validated.\n')
