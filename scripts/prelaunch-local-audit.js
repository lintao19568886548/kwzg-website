import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { hash } from '@node-rs/argon2'

const root = fileURLToPath(new URL('../', import.meta.url))
const composeFile = resolve(root, 'docker-compose.yml')
const auditProject = 'kwzg_admin_closed_loop_audit'
const restoreProject = 'kwzg_admin_closed_loop_restore'
const auditRoot = resolve(root, '.audit-private')
const auditDirectory = resolve(auditRoot, 'admin-closed-loop-v2')
const backupPath = resolve(auditDirectory, 'admin-closed-loop-backup.sql')
const resultPath = resolve(auditDirectory, 'admin-closed-loop-result.txt')
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

function sqlString(value) {
  return `CONVERT(UNHEX('${Buffer.from(String(value), 'utf8').toString('hex')}') USING utf8mb4)`
}

async function postDemo(baseUrl, phone, key, name) {
  return fetch(`${baseUrl}/api/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': key, Origin: new URL(baseUrl).origin },
    body: JSON.stringify({ name, phone, parkCount: 2, privacy: true, companyWebsite: '', startedAt: Date.now() - 4000 }),
  })
}

async function fetchWithTimeout(url, timeoutMs = 3000) {
  const controller = new AbortController()
  // AbortSignal.timeout() uses an unref'ed timer in Node. During a container
  // restart that can leave a top-level await with no referenced event-loop
  // handle, so use an ordinary ref'ed timer for deterministic audit waits.
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function waitForHealth(baseUrl, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/health/ready`)
      if (response.status === 200) return
    } catch {
      // The service is expected to be unavailable while MariaDB restarts.
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
  }
  throw new Error('Health endpoint did not recover before timeout.')
}

async function waitForLive(baseUrl, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/health/live`)
      if (response.status === 200) return response
    } catch {
      // A brief socket reset is expected while the app drops stale database connections.
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
  }
  throw new Error('Liveness endpoint did not recover while MariaDB was stopped.')
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
const auditAdminId = randomUUID()
const e2eName = `E2E闭环测试-${Date.now()}`
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

mkdirSync(auditDirectory, { recursive: true })

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
  databaseQuery(auditProject, auditEnvironment, `INSERT INTO admin_users (id, username, password_hash, enabled, credential_version, created_at, updated_at) VALUES (${sqlString(auditAdminId)}, ${sqlString(common.NUXT_ADMIN_USERNAME)}, ${sqlString(common.NUXT_ADMIN_PASSWORD_HASH)}, 1, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP())`)
  databaseQuery(auditProject, auditEnvironment, `INSERT INTO lead_audit (lead_id, admin_user_id, operation_type, old_status, new_status, remark_changed, before_summary, after_summary, note_summary, request_id, source_ip, operated_at) VALUES (NULL, ${sqlString(auditAdminId)}, 'ADMIN_CREATED', NULL, NULL, 0, '', '本地审计管理员已创建', '', 'prelaunch-local-audit', NULL, UTC_TIMESTAMP())`)
  run(process.execPath, ['tests/api-e2e.mjs'], { env: { ...process.env, TEST_BASE_URL: auditBaseUrl, TEST_ADMIN_USERNAME: common.NUXT_ADMIN_USERNAME, TEST_ADMIN_PASSWORD: auditPassword, TEST_E2E_NAME: e2eName } })
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM leads WHERE idempotency_key='normal-idempotency-key-000000001'"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM lead_audit a JOIN leads l ON l.id=a.lead_id WHERE l.idempotency_key='normal-idempotency-key-000000001' AND a.operation_type='LEAD_CREATED'"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM leads WHERE idempotency_key='normal-idempotency-key-000000001' AND status='WON' AND won_at IS NOT NULL"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM lead_follow_ups f JOIN leads l ON l.id=f.lead_id WHERE l.idempotency_key='normal-idempotency-key-000000001' AND f.result<>'' AND f.next_plan<>''"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM leads WHERE idempotency_key='concurrent-api-key-00000000000001'"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM lead_audit a JOIN leads l ON l.id=a.lead_id WHERE l.idempotency_key='concurrent-api-key-00000000000001' AND a.operation_type='LEAD_CREATED'"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM leads WHERE idempotency_key IN ('invalid-phone-key-000000000001','privacy-required-key-000000001','honeypot-key-000000000000001','fast-form-key-000000000000001','extra-field-key-0000000000001')"), '0')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM knex_migrations WHERE name='202608260001_close_demo_lead_loop.js'"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM knex_migrations WHERE name='202608260002_complete_admin_business_loop.js'"), '1')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM lead_audit a JOIN leads l ON l.id=a.lead_id WHERE l.idempotency_key='normal-idempotency-key-000000001' AND a.operation_type IN ('DEMO_COMPLETED','LEAD_WON')"), '2')
  assert.equal(databaseQuery(auditProject, auditEnvironment, "SELECT COUNT(*) FROM lead_audit WHERE operation_type IN ('LEAD_PAUSED','LEAD_INVALIDATED','LEAD_REOPENED')"), '3')

  process.stdout.write('AUDIT_STEP=application-restart-persistence\n')
  compose(auditProject, auditEnvironment, ['restart', 'app'])
  await waitForHealth(auditBaseUrl)
  run(process.execPath, ['tests/restore-smoke.mjs'], { env: { ...process.env, TEST_BASE_URL: auditBaseUrl, TEST_ADMIN_USERNAME: common.NUXT_ADMIN_USERNAME, TEST_ADMIN_PASSWORD: auditPassword, TEST_E2E_NAME: e2eName } })

  process.stdout.write('AUDIT_STEP=database-restart-persistence\n')
  compose(auditProject, auditEnvironment, ['restart', 'db'])
  await waitForHealth(auditBaseUrl)
  run(process.execPath, ['tests/restore-smoke.mjs'], { env: { ...process.env, TEST_BASE_URL: auditBaseUrl, TEST_ADMIN_USERNAME: common.NUXT_ADMIN_USERNAME, TEST_ADMIN_PASSWORD: auditPassword, TEST_E2E_NAME: e2eName } })

  process.stdout.write('AUDIT_STEP=backup-and-restore\n')
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
  assert.equal(databaseQuery(restoreProject, restoreEnvironment, "SELECT COUNT(*) FROM lead_audit a JOIN leads l ON l.id=a.lead_id WHERE l.idempotency_key='normal-idempotency-key-000000001' AND a.operation_type='LEAD_CREATED'"), '1')
  databaseShell(restoreProject, restoreEnvironment, 'exec mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE" -e "DELETE FROM admin_sessions"')
  compose(restoreProject, restoreEnvironment, ['up', '-d', '--build', '--wait', 'migrate', 'app'], { capture: true, maxBuffer: 128 * 1024 * 1024 })
  run(process.execPath, ['tests/restore-smoke.mjs'], { env: { ...process.env, TEST_BASE_URL: restoreBaseUrl, TEST_ADMIN_USERNAME: common.NUXT_ADMIN_USERNAME, TEST_ADMIN_PASSWORD: auditPassword, TEST_E2E_NAME: e2eName } })

  process.stdout.write('AUDIT_STEP=database-failure-and-recovery\n')
  compose(auditProject, auditEnvironment, ['stop', 'db'])
  const liveWhileDatabaseDown = await waitForLive(auditBaseUrl)
  assert.equal(liveWhileDatabaseDown.status, 200)
  const unavailable = await postDemo(auditBaseUrl, '13400000000', 'database-down-audit-key-00000001', e2eName)
  assert.equal(unavailable.status, 503)
  const unavailableBody = await unavailable.json()
  assert.equal(unavailableBody.success, undefined)
  compose(auditProject, auditEnvironment, ['start', 'db'])
  await waitForHealth(auditBaseUrl)
  const recovered = await postDemo(auditBaseUrl, '13500000000', 'database-recovery-key-000000001', e2eName)
  assert.equal(recovered.status, 201)

  const appLogs = String(compose(auditProject, auditEnvironment, ['logs', '--no-color', 'app'], { capture: true }).stdout)
  const fullPhoneOccurrences = (appLogs.match(/\b1[3-9]\d{9}\b/g) || []).length
  assert.equal(fullPhoneOccurrences, 0)

  process.stdout.write('LOCAL_AUDIT_RESULT=PASS\n')
  const resultText = 'ADMIN_CLOSED_LOOP=PASS\nPUBLIC_FORM_TO_DATABASE=PASS\nPOST_DEMO_REQUEST_STATUS=201\nLEAD_INSERT_COUNT=1\nINITIAL_AUDIT_INSERT_COUNT=1\nPARTIAL_WRITES=0\nDOUBLE_SUBMIT_REQUEST_COUNT=2\nDOUBLE_SUBMIT_RECORD_COUNT=1\nIDEMPOTENCY=PASS\nINVALID_INPUT_RECORDS=0\nADMIN_LOGIN=PASS\nADMIN_DASHBOARD=PASS\nDASHBOARD_REAL_DATA=PASS\nNEW_LEAD_BADGE=PASS\nADMIN_LEAD_VISIBILITY=PASS\nLEAD_DETAIL=PASS\nLEAD_MARK_READ=PASS\nFOLLOW_UP_RECORDS=PASS\nNEXT_FOLLOW_UP=PASS\nLEAD_STATUS_UPDATE=PASS\nDEMO_SCHEDULING=PASS\nDEMO_COMPLETION=PASS\nINVALID_TRANSITION_BLOCKED=PASS\nLEAD_WON_FLOW=PASS\nLEAD_PAUSED_FLOW=PASS\nLEAD_INVALID_FLOW=PASS\nLEAD_REOPEN_FLOW=PASS\nSTATUS_AUDIT=PASS\nAUDIT_TIMELINE=PASS\nPERSIST_AFTER_RELOGIN=PASS\nPERSIST_AFTER_APP_RESTART=PASS\nPERSIST_AFTER_DATABASE_RESTART=PASS\nDATABASE_DOWN_STATUS=503\nDATABASE_DOWN_FALSE_SUCCESS=0\nDATABASE_RECOVERY=PASS\nBACKUP_RESTORE=PASS\nUNAUTHORIZED_ACCESS_BLOCKED=PASS\nCSRF_ORIGIN=PASS\nRATE_LIMIT=PASS\nSQL_INJECTION=PASS\nXSS_ESCAPING=PASS\nCSV_INJECTION_PROTECTION=PASS\nFULL_PHONE_LOG_OCCURRENCES=0\nDOCKER_NON_ROOT=PASS\n'
  writeFileSync(resultPath, resultText, { mode: 0o600 })
  process.stdout.write(resultText)
} catch (error) {
  writeFileSync(resultPath, `ADMIN_CLOSED_LOOP=FAIL\nERROR=${String(error?.message || 'unknown').slice(0, 500)}\n`, { mode: 0o600 })
  if (auditStarted) compose(auditProject, auditEnvironment, ['logs', '--no-color', '--tail', '120', 'migrate'])
  throw error
} finally {
  if (restoreStarted) compose(restoreProject, restoreEnvironment, ['down', '-v', '--remove-orphans'])
  if (auditStarted) compose(auditProject, auditEnvironment, ['down', '-v', '--remove-orphans'])
}
