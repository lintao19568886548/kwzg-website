import assert from 'node:assert/strict'
import process from 'node:process'

const baseUrl = process.env.TEST_BASE_URL
const username = process.env.TEST_ADMIN_USERNAME
const password = process.env.TEST_ADMIN_PASSWORD
const e2eName = process.env.TEST_E2E_NAME
if (!baseUrl || !username || !password || !/^E2E闭环测试-\d+$/.test(e2eName || '')) throw new Error('Restore smoke environment is incomplete.')
const origin = new URL(baseUrl).origin

function cookieValue(response, name) {
  const setCookie = response.headers.getSetCookie?.() || [response.headers.get('set-cookie') || '']
  return setCookie.join(',').match(new RegExp(`(?:^|[, ]+)${name}=([^;,]+)`))?.[1] || ''
}

const health = await fetch(`${baseUrl}/api/health/ready`)
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

const leads = await fetch(`${baseUrl}/api/admin/leads?search=${encodeURIComponent(e2eName)}`, {
  headers: { Cookie: `kwzg_admin_session=${sessionCookie}` },
})
assert.equal(leads.status, 200)
const leadsBody = await leads.json()
assert.ok(leadsBody.items.some(item => item.name === e2eName && item.phone === '138****0000'))
const restoredLead = leadsBody.items.find(item => item.name === e2eName && item.status === 'WON')
assert.ok(restoredLead)
assert.match(restoredLead.referenceCode, /^KW-\d{8}-[0-9A-F]{8}$/)
assert.equal(restoredLead.status, 'WON')

const detail = await fetch(`${baseUrl}/api/admin/leads/${restoredLead.id}`, {
  headers: { Cookie: `kwzg_admin_session=${sessionCookie}` },
})
assert.equal(detail.status, 200)
const detailBody = await detail.json()
assert.equal(detailBody.lead.status, 'WON')
assert.ok(detailBody.lead.wonAt)

const timeline = await fetch(`${baseUrl}/api/admin/leads/${restoredLead.id}/timeline?page=1&pageSize=20`, {
  headers: { Cookie: `kwzg_admin_session=${sessionCookie}` },
})
assert.equal(timeline.status, 200)
const timelineBody = await timeline.json()
assert.ok(timelineBody.items.some(item => item.kind === 'FOLLOW_UP' && item.result === '客户同意继续沟通'))
assert.ok(timelineBody.items.some(item => item.title === '安排产品演示'))
assert.ok(timelineBody.items.some(item => item.title === '完成产品演示'))
assert.ok(timelineBody.items.some(item => item.title === '成交归档'))

process.stdout.write('Restored database smoke test passed.\n')
