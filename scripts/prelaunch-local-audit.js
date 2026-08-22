import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { hash } from '@node-rs/argon2'

const root = fileURLToPath(new URL('../', import.meta.url))
const composeFile = resolve(root, 'docker-compose.yml')
const auditProject = 'kwzg_prelaunch_audit'
const restoreProject = 'kwzg_prelaunch_restore'
const auditDirectory = resolve(root, '.audit-private')
const backupPath = resolve(auditDirectory, 'prelaunch-backup.sql')
let auditStarted = false
let restoreStarted = false

function secret(bytes = 36) {
  return randomBytes(bytes).toString('base64url')
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: options.env || process.env,
    input: options.input,
    encoding: options.encoding === false ? null : 'utf8',
    maxBuffer: options.maxBuffer || 64 * 1024 * 1024,
    stdio: options.capture ? ['pipe', 'pipe', 'pipe'] : 'inherit',
  })
  if (result.status !== 0) {
    const stderr = options.capture ? String(result.stderr || '').replaceAll(/[^\r\n]{80,}/g, '[redacted]') : ''
    throw new Error(`${command} ${args.slice(0, 4).join(' ')} failed with status ${result.status}.${stderr ? ` ${stderr}` : ''}`)
  }
  return result
}

function compose(project, environment, args, options = {}) {
  return run('docker', ['compose', '-f', composeFile, '-p', project, ...args], { ...options, env: environment })
}

function databaseShell(project, environment, command, options = {}) {
  return compose(project, environment, ['exec', '-T', 'db', 'sh', '-lc', command], { ...options, capture: true })
}

function databaseQuery(project, environment, query) {
  const command = `exec mariadb --batch --skip-column-names -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE" -e ${JSON.stringify(query)}`
  return String(databaseShell(project, environment, command).stdout).trim()
}

async function postDemo(baseUrl, phone, key) {
  return fetch(`${baseUrl}/api/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': key, Origin: new URL(baseUrl).origin },
    body: JSON.stringify({ name: '上线前审计测试', phone, parkCount: 2, privacy: true, companyWebsite: '', startedAt: Date.now() - 4000 }),
  })
}

async function waitForHealth(baseUrl, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.status === 200) return
    } catch {
      // The service is expected to be unavailable while MariaDB restarts.
    }
    await new Promise(resolvePromise => setTimeout(resolvePromise, 1000))
  }
  throw new Error('Health endpoint did not recover before timeout.')
}

function cleanupDirectory() {
  const relativePath = relative(root, auditDirectory)
  if (relativePath !== '.audit-private') throw new Error('Refusing to clean an unexpected audit path.')
  rmSync(auditDirectory, { recursive: true, force: true })
}

const common = {
  ...process.env,
  KWZG_DB_NAME: 'kwzg_audit',
  KWZG_DB_USER: 'kwzg_audit_app',
  KWZG_DB_PASSWORD: secret(),
  KWZG_DB_ROOT_PASSWORD: secret(),
  NUXT_ADMIN_USERNAME: `audit-${secret(8)}`,
  NUXT_SESSION_PASSWORD: secret(48),
  NUXT_PUBLIC_INDEXABLE: 'false',
  NUXT_ENABLE_HSTS: 'false',
  NUXT_TRUSTED_PROXY_ADDRESSES: '',
}
const auditPassword = secret(24)
common.NUXT_ADMIN_PASSWORD_HASH = await hash(auditPassword)
const auditBaseUrl = 'http://127.0.0.1:3220'
const auditEnvironment = { ...common, KWZG_APP_PORT: '3220', KWZG_BUILD_SITE_URL: 'https://yizuw.org', NUXT_PUBLIC_SITE_URL: auditBaseUrl, NUXT_TRUSTED_ORIGINS: auditBaseUrl }
const restoreBaseUrl = 'http://127.0.0.1:3221'
const restoreEnvironment = {
  ...common,
  KWZG_DB_NAME: 'kwzg_restore',
  KWZG_DB_USER: 'kwzg_restore_app',
  KWZG_DB_PASSWORD: secret(),
  KWZG_DB_ROOT_PASSWORD: secret(),
  KWZG_APP_PORT: '3221',
  KWZG_BUILD_SITE_URL: 'https://yizuw.org',
  NUXT_PUBLIC_SITE_URL: restoreBaseUrl,
  NUXT_TRUSTED_ORIGINS: restoreBaseUrl,
}

try {
  const existingAudit = compose(auditProject, auditEnvironment, ['ps', '-q'], { capture: true }).stdout
  const existingRestore = compose(restoreProject, restoreEnvironment, ['ps', '-q'], { capture: true }).stdout
  assert.equal(String(existingAudit).trim(), '', 'The audit Docker project already exists; refusing to reuse it.')
  assert.equal(String(existingRestore).trim(), '', 'The restore Docker project already exists; refusing to reuse it.')

  process.stdout.write('AUDIT_STEP=build-and-start-isolated-stack\n')
  auditStarted = true
  compose(auditProject, auditEnvironment, ['up', '-d', '--build', '--wait', 'db', 'migrate', 'app'], { capture: true, maxBuffer: 128 * 1024 * 1024 })
  const uid = compose(auditProject, auditEnvironment, ['exec', '-T', 'app', 'id', '-u'], { capture: true }).stdout
  assert.notEqual(String(uid).trim(), '0', 'Application container must not run as root.')

  process.stdout.write('AUDIT_STEP=database-integration-tests\n')
  compose(auditProject, auditEnvironment, ['--profile', 'test', 'build', 'test'], { capture: true, maxBuffer: 128 * 1024 * 1024 })
  compose(auditProject, auditEnvironment, ['--profile', 'test', 'run', '--rm', 'test'])

  process.stdout.write('AUDIT_STEP=api-e2e\n')
  run(process.execPath, ['tests/api-e2e.mjs'], { env: { ...process.env, TEST_BASE_URL: auditBaseUrl, TEST_ADMIN_USERNAME: common.NUXT_ADMIN_USERNAME, TEST_ADMIN_PASSWORD: auditPassword } })
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM leads WHERE idempotency_key='normal-idempotency-key-000000001'"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM lead_audit a JOIN leads l ON l.id=a.lead_id WHERE l.idempotency_key='normal-idempotency-key-000000001' AND a.operation_type='created'"), '1')

  process.stdout.write('AUDIT_STEP=backup-and-restore\n')
  mkdirSync(auditDirectory, { recursive: true })
  const dumpCommand = 'exec mariadb-dump -u"root" -p"$MARIADB_ROOT_PASSWORD" --single-transaction --quick --routines --triggers --events --default-character-set=utf8mb4 "$MARIADB_DATABASE"'
  const dump = databaseShell(auditProject, auditEnvironment, dumpCommand, { encoding: false, maxBuffer: 128 * 1024 * 1024 })
  assert.ok(dump.stdout?.length > 1024, 'Backup output is unexpectedly small.')
  writeFileSync(backupPath, dump.stdout, { mode: 0o600 })
  const checksum = createHash('sha256').update(dump.stdout).digest('hex')
  assert.equal(checksum.length, 64)

  restoreStarted = true
  compose(restoreProject, restoreEnvironment, ['up', '-d', '--wait', 'db'])
  const restoreCommand = 'exec mariadb -u"root" -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"'
  databaseShell(restoreProject, restoreEnvironment, restoreCommand, { input: dump.stdout, encoding: false, maxBuffer: 128 * 1024 * 1024 })
  assert.equal(databaseQuery(restoreProject, restoreEnvironment, "SELECT COUNT(*) FROM leads WHERE idempotency_key='normal-idempotency-key-000000001'"), '1')
  assert.equal(databaseQuery(restoreProject, restoreEnvironment, "SELECT COUNT(*) FROM lead_audit a JOIN leads l ON l.id=a.lead_id WHERE l.idempotency_key='normal-idempotency-key-000000001' AND a.operation_type='created'"), '1')
  databaseShell(restoreProject, restoreEnvironment, 'exec mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE" -e "DELETE FROM admin_sessions"')
  compose(restoreProject, restoreEnvironment, ['up', '-d', '--build', '--wait', 'migrate', 'app'], { capture: true, maxBuffer: 128 * 1024 * 1024 })
  run(process.execPath, ['tests/restore-smoke.mjs'], { env: { ...process.env, TEST_BASE_URL: restoreBaseUrl, TEST_ADMIN_USERNAME: common.NUXT_ADMIN_USERNAME, TEST_ADMIN_PASSWORD: auditPassword } })

  process.stdout.write('AUDIT_STEP=database-failure-and-recovery\n')
  compose(auditProject, auditEnvironment, ['stop', 'db'])
  const unavailable = await postDemo(auditBaseUrl, '13400000000', 'database-down-audit-key-00000001')
  assert.equal(unavailable.status, 503)
  const unavailableBody = await unavailable.json()
  assert.equal(unavailableBody.success, undefined)
  compose(auditProject, auditEnvironment, ['start', 'db'])
  await waitForHealth(auditBaseUrl)
  const recovered = await postDemo(auditBaseUrl, '13500000000', 'database-recovery-key-000000001')
  assert.equal(recovered.status, 201)

  process.stdout.write('LOCAL_AUDIT_RESULT=PASS\n')
  process.stdout.write('POST_DEMO_REQUEST_STATUS=201\nLEAD_INSERT_COUNT=1\nINITIAL_AUDIT_INSERT_COUNT=1\nDATABASE_DOWN_STATUS=503\nDATABASE_RECOVERY=PASS\nTEST_BACKUP=PASS\nTEST_RESTORE=PASS\nRESTORED_LEAD_VISIBLE=PASS\nDOCKER_NON_ROOT=PASS\n')
} catch (error) {
  if (auditStarted) compose(auditProject, auditEnvironment, ['logs', '--no-color', '--tail', '120', 'migrate'])
  throw error
} finally {
  if (restoreStarted) compose(restoreProject, restoreEnvironment, ['down', '-v', '--remove-orphans'])
  if (auditStarted) compose(auditProject, auditEnvironment, ['down', '-v', '--remove-orphans'])
  cleanupDirectory()
}
