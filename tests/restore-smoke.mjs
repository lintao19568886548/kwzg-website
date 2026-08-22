import assert from 'node:assert/strict'
import process from 'node:process'

const baseUrl = process.env.TEST_BASE_URL
const username = process.env.TEST_ADMIN_USERNAME
const password = process.env.TEST_ADMIN_PASSWORD
if (!baseUrl || !username || !password) throw new Error('Restore smoke environment is incomplete.')
const origin = new URL(baseUrl).origin

function cookieValue(response, name) {
  const setCookie = response.headers.getSetCookie?.() || [response.headers.get('set-cookie') || '']
  return setCookie.join(',').match(new RegExp(`(?:^|[, ]+)${name}=([^;,]+)`))?.[1] || ''
}

const health = await fetch(`${baseUrl}/api/health`)
assert.equal(health.status, 200)

const preflight = await fetch(`${baseUrl}/api/admin/csrf`)
assert.equal(preflight.status, 200)
const preflightBody = await preflight.json()
const loginCsrfCookie = cookieValue(preflight, 'kwzg_login_csrf')

const login = await fetch(`${baseUrl}/api/admin/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': preflightBody.csrfToken,
    Cookie: `kwzg_login_csrf=${loginCsrfCookie}`,
    Origin: origin,
  },
  body: JSON.stringify({ username, password }),
})
assert.equal(login.status, 200)
const sessionCookie = cookieValue(login, 'kwzg_admin_session')
assert.ok(sessionCookie)

const leads = await fetch(`${baseUrl}/api/admin/leads?search=${encodeURIComponent('上线前审计测试')}`, {
  headers: { Cookie: `kwzg_admin_session=${sessionCookie}` },
})
assert.equal(leads.status, 200)
const leadsBody = await leads.json()
assert.ok(leadsBody.items.some(item => item.name === '上线前审计测试' && item.phone === '+86138****0000'))

process.stdout.write('Restored database smoke test passed.\n')
