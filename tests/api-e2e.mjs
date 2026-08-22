import assert from 'node:assert/strict'
import process from 'node:process'
import { siteConfig } from '../app/config/site.js'

const baseUrl = process.env.TEST_BASE_URL
const adminUsername = process.env.TEST_ADMIN_USERNAME
const adminPassword = process.env.TEST_ADMIN_PASSWORD
if (!baseUrl || !adminUsername || !adminPassword) throw new Error('API test environment is incomplete.')

const origin = new URL(baseUrl).origin
const results = []
const remember = name => results.push(name)

function cookieValue(response, name) {
  const setCookie = response.headers.getSetCookie?.() || [response.headers.get('set-cookie') || '']
  const match = setCookie.join(',').match(new RegExp(`(?:^|[, ]+)${name}=([^;,]+)`))
  return match?.[1] || ''
}

async function jsonRequest(path, options = {}) {
  const method = options.method || 'GET'
  const publicFormOrigin = path === '/api/demo-requests' && method === 'POST' ? { Origin: origin } : {}
  const headers = { ...publicFormOrigin, ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)),
    redirect: options.redirect || 'manual',
  })
  let data
  try { data = await response.json() } catch { data = null }
  return { response, data }
}

const publicRoutes = ['/', '/products', '/solutions', '/cases', '/cases/tongfu', '/cases/foshan-lecong', '/cases/shenzhen-kengzi', '/cases/xintang-xizhou', '/cases/gaobu-tongxing', '/service', '/about', '/demo', '/call', '/privacy']
const contactBarRoutes = publicRoutes.filter(route => route !== '/call')
for (const route of [...publicRoutes, '/admin/login']) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' })
  assert.equal(response.status, 200, `${route} should return 200`)
  const html = await response.text()
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route} should render one h1`)
  assert.match(html, /<title>[^<]+<\/title>/, `${route} should render a title`)
  assert.match(html, /<meta[^>]+name="description"[^>]+content="[^"]+"|<meta[^>]+content="[^"]+"[^>]+name="description"/, `${route} should render a description`)
  assert.equal(html.includes('data-floating-contact-bar'), contactBarRoutes.includes(route), `${route} contact bar boundary`)
  if (route === '/' || route === '/about') {
    for (const value of ['科技型中小企业', '东莞市宜租网络科技有限公司', '2026441901A0001155', '广东省科学技术厅', '2026年8月11日']) {
      assert.ok(html.includes(value), `${route} qualification should include ${value}`)
    }
    assert.ok(html.includes(`data-qualification-section="${route === '/' ? 'compact' : 'detail'}"`), `${route} qualification mode`)
    assert.equal(html.includes('tech-sme-2026-original.jpg'), false, `${route} must not expose raw qualification image`)
  }
  if (route === '/') {
    assert.match(response.headers.get('content-security-policy') || '', /frame-ancestors 'none'/)
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.match(html, /<meta[^>]+name="robots"[^>]+content="noindex, nofollow"|<meta[^>]+content="noindex, nofollow"[^>]+name="robots"/)
    assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${siteConfig.siteUrl}/"|<link[^>]+href="${siteConfig.siteUrl}/"[^>]+rel="canonical"`))
    assert.equal(/(?:127\.0\.0\.1|localhost):\d+/.test(html), false)
  }
  if (route === '/admin/login') {
    assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0')
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive')
    assert.match(html, /<meta[^>]+name="robots"[^>]+content="noindex, nofollow, noarchive"|<meta[^>]+content="noindex, nofollow, noarchive"[^>]+name="robots"/)
  }
  if (route === '/call') {
    assert.ok(html.includes(siteConfig.contact.phone), '/call should include the public phone number')
    assert.ok(html.includes(siteConfig.contact.phoneHref), '/call should include a real telephone fallback')
    assert.ok(html.includes('立即拨打'), '/call should include the fallback call button')
    assert.ok(html.includes('返回瞰维智管官网'), '/call should include the return link')
    assert.ok(html.includes(`电话咨询｜${siteConfig.brand.name}`), '/call should use the exact title')
    assert.ok(html.includes(`拨打瞰维智管电话${siteConfig.contact.phone}，咨询园区管理数字化解决方案。`), '/call should use the exact description')
    assert.match(html, /<meta[^>]+name="robots"[^>]+content="noindex, nofollow"|<meta[^>]+content="noindex, nofollow"[^>]+name="robots"/)
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    assert.equal(html.includes('当前为本地预览，二维码将在官网正式上线后进行微信真机验证。'), false, '/call production HTML must omit the development notice')
  }
}
remember('public-and-login-routes')
remember('floating-contact-route-boundary')
remember('qualification-route-content')

const robots = await fetch(`${baseUrl}/robots.txt`)
assert.equal(robots.status, 200)
assert.equal(await robots.text(), 'User-agent: *\nDisallow: /\n')
assert.match(robots.headers.get('cache-control') || '', /no-store/)
const sitemap = await fetch(`${baseUrl}/sitemap.xml`)
assert.equal(sitemap.status, 200)
const sitemapXml = await sitemap.text()
assert.equal((sitemapXml.match(/<url>/g) || []).length, 13)
assert.equal(sitemapXml.includes('/call</loc>'), false)
assert.equal(sitemapXml.includes('/admin'), false)
assert.equal(sitemapXml.includes('/api/'), false)
assert.equal(sitemap.headers.get('x-robots-tag'), 'noindex, nofollow')
remember('robots-and-sitemap-noindex-mode')

const invalidCase = await fetch(`${baseUrl}/cases/not-a-real-case`, {
  redirect: 'manual',
  headers: { Accept: 'text/html' },
})
assert.equal(invalidCase.status, 404)
assert.ok((await invalidCase.text()).includes('页面没有找到'))
remember('case-detail-routes-and-404')

const protectedPage = await fetch(`${baseUrl}/admin/leads`, { redirect: 'manual' })
assert.ok([302, 307].includes(protectedPage.status))
assert.match(protectedPage.headers.get('location') || '', /admin\/login/)
assert.equal(protectedPage.headers.get('cache-control'), 'no-store, max-age=0')
assert.equal(protectedPage.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive')
assert.equal((await protectedPage.text()).includes('+8613'), false)
const unauthList = await jsonRequest('/api/admin/leads')
assert.equal(unauthList.response.status, 401)
assert.equal(unauthList.response.headers.get('cache-control'), 'no-store, max-age=0')
remember('unauthorized-boundaries')

const methodRejected = await jsonRequest('/api/demo-requests')
assert.equal(methodRejected.response.status, 405)
const contentTypeRejected = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' })
assert.equal(contentTypeRejected.response.status, 415)
const oversized = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'X-Idempotency-Key': 'oversized-request-key-00000000' }, body: { padding: 'x'.repeat(5000) } })
assert.equal(oversized.response.status, 413)
const publicBadOrigin = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { Origin: 'https://attacker.invalid', 'X-Idempotency-Key': 'bad-public-origin-key-000000001' }, body: { name: '来源测试', phone: '13800000000', parkCount: 2, privacy: true, companyWebsite: '', startedAt: Date.now() - 4000 } })
assert.equal(publicBadOrigin.response.status, 403)
assert.equal(publicBadOrigin.data.error.code, 'ORIGIN_REJECTED')
remember('method-content-type-body-limit-and-public-origin')

const validBody = (phone = '13800000000', name = '上线前审计测试') => ({ name, phone, parkCount: 2, privacy: true, companyWebsite: '', startedAt: Date.now() - 4000 })
const invalidCases = [
  [{ ...validBody(), phone: '123' }, 'invalid-phone-key-000000000001', 422],
  [{ ...validBody(), privacy: false }, 'privacy-required-key-000000001', 422],
  [{ ...validBody(), companyWebsite: 'bot.example' }, 'honeypot-key-000000000000001', 422],
  [{ ...validBody(), startedAt: Date.now() }, 'fast-form-key-000000000000001', 422],
  [{ ...validBody(), extra: 'field' }, 'extra-field-key-0000000000001', 422],
]
for (const [body, key, status] of invalidCases) {
  const result = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'X-Idempotency-Key': key }, body })
  assert.equal(result.response.status, status)
}
remember('server-validation')

const idempotencyKey = 'normal-idempotency-key-000000001'
const normal = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'X-Idempotency-Key': idempotencyKey }, body: validBody() })
assert.equal(normal.response.status, 201)
assert.equal(normal.data.success, true)
assert.match(normal.data.requestId, /^[0-9a-f-]{36}$/)
assert.deepEqual(Object.keys(normal.data).sort(), ['requestId', 'success'])
const duplicate = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'X-Idempotency-Key': idempotencyKey }, body: validBody() })
assert.equal(duplicate.response.status, 200)
const concurrentKey = 'concurrent-api-key-00000000000001'
const concurrent = await Promise.all([1, 2].map(() => jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'X-Idempotency-Key': concurrentKey }, body: validBody('13700000000') })))
assert.ok(concurrent.every(item => [200, 201].includes(item.response.status)))
remember('idempotency-and-concurrency')

const rateStatuses = []
for (let index = 0; index < 6; index += 1) {
  const result = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'X-Idempotency-Key': `rate-limit-key-${String(index).padStart(18, '0')}` }, body: validBody('13900000000') })
  rateStatuses.push(result.response.status)
}
assert.equal(rateStatuses.at(-1), 429)
remember('rate-limit-429')

const preflight = await jsonRequest('/api/admin/csrf')
assert.equal(preflight.response.status, 200)
const loginCsrfCookie = cookieValue(preflight.response, 'kwzg_login_csrf')
assert.ok(loginCsrfCookie && preflight.data.csrfToken)
const badOrigin = await jsonRequest('/api/admin/login', { method: 'POST', headers: { Origin: 'https://attacker.invalid', Cookie: `kwzg_login_csrf=${loginCsrfCookie}`, 'X-CSRF-Token': preflight.data.csrfToken }, body: { username: adminUsername, password: adminPassword } })
assert.equal(badOrigin.response.status, 403)
const badLoginCsrf = await jsonRequest('/api/admin/login', { method: 'POST', headers: { Origin: origin, Cookie: `kwzg_login_csrf=${loginCsrfCookie}`, 'X-CSRF-Token': `${preflight.data.csrfToken}x` }, body: { username: adminUsername, password: adminPassword } })
assert.equal(badLoginCsrf.response.status, 403)
const wrongUsername = await jsonRequest('/api/admin/login', { method: 'POST', headers: { Origin: origin, Cookie: `kwzg_login_csrf=${loginCsrfCookie}`, 'X-CSRF-Token': preflight.data.csrfToken }, body: { username: `not-${adminUsername}`, password: adminPassword } })
assert.equal(wrongUsername.response.status, 401)
const wrongLogin = await jsonRequest('/api/admin/login', { method: 'POST', headers: { Origin: origin, Cookie: `kwzg_login_csrf=${loginCsrfCookie}`, 'X-CSRF-Token': preflight.data.csrfToken }, body: { username: adminUsername, password: `${adminPassword}x` } })
assert.equal(wrongLogin.response.status, 401)
const bruteStatuses = []
for (let attempt = 0; attempt < 9; attempt += 1) {
  const brute = await jsonRequest('/api/admin/login', { method: 'POST', headers: { Origin: origin, Cookie: `kwzg_login_csrf=${loginCsrfCookie}`, 'X-CSRF-Token': preflight.data.csrfToken }, body: { username: 'brute-admin', password: adminPassword } })
  bruteStatuses.push(brute.response.status)
}
assert.deepEqual(bruteStatuses.slice(0, 8), Array(8).fill(401))
assert.equal(bruteStatuses.at(-1), 429)
const login = await jsonRequest('/api/admin/login', { method: 'POST', headers: { Origin: origin, Cookie: `kwzg_login_csrf=${loginCsrfCookie}`, 'X-CSRF-Token': preflight.data.csrfToken }, body: { username: adminUsername, password: adminPassword } })
assert.equal(login.response.status, 200)
let sessionCookie = cookieValue(login.response, 'kwzg_admin_session')
let csrfToken = login.data.csrfToken
assert.ok(sessionCookie && csrfToken)
const forged = await jsonRequest('/api/admin/leads', { headers: { Cookie: 'kwzg_admin_session=forged-session-token' } })
assert.equal(forged.response.status, 401)
remember('login-origin-csrf-and-forged-session')

const session = await jsonRequest('/api/admin/session', { headers: { Cookie: `kwzg_admin_session=${sessionCookie}` } })
assert.equal(session.response.status, 200)
csrfToken = session.data.csrfToken
const list = await jsonRequest('/api/admin/leads', { headers: { Cookie: `kwzg_admin_session=${sessionCookie}` } })
assert.equal(list.response.status, 200)
assert.ok(list.data.items.length >= 1)
assert.match(list.data.items[0].phone, /\*{4}/)
assert.ok(list.data.items.some(item => item.name === '上线前审计测试' && item.phone === '+86138****0000'))
const invalidPagination = await jsonRequest('/api/admin/leads?pageSize=51', { headers: { Cookie: `kwzg_admin_session=${sessionCookie}` } })
assert.equal(invalidPagination.response.status, 422)
const invalidSort = await jsonRequest('/api/admin/leads?sort=id%3BDROP%20TABLE%20leads', { headers: { Cookie: `kwzg_admin_session=${sessionCookie}` } })
assert.equal(invalidSort.response.status, 422)
const injectionSearch = await jsonRequest(`/api/admin/leads?search=${encodeURIComponent("%' OR 1=1 --")}`, { headers: { Cookie: `kwzg_admin_session=${sessionCookie}` } })
assert.equal(injectionSearch.response.status, 200)
const leadId = list.data.items[0].id
const detail = await jsonRequest(`/api/admin/leads/${leadId}`, { headers: { Cookie: `kwzg_admin_session=${sessionCookie}` } })
assert.equal(detail.response.status, 200)
assert.match(detail.data.lead.phone, /^\+86\d{11}$/)
const updateBody = { status: '跟进中', remark: '已电话沟通', version: detail.data.lead.version }
const missingCsrf = await jsonRequest(`/api/admin/leads/${leadId}`, { method: 'PATCH', headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}` }, body: updateBody })
assert.equal(missingCsrf.response.status, 403)
const wrongCsrf = await jsonRequest(`/api/admin/leads/${leadId}`, { method: 'PATCH', headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}`, 'X-CSRF-Token': `${csrfToken}x` }, body: updateBody })
assert.equal(wrongCsrf.response.status, 403)
const invalidStatus = await jsonRequest(`/api/admin/leads/${leadId}`, { method: 'PATCH', headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}`, 'X-CSRF-Token': csrfToken }, body: { ...updateBody, status: '不存在的状态' } })
assert.equal(invalidStatus.response.status, 422)
const xss = await jsonRequest(`/api/admin/leads/${leadId}`, { method: 'PATCH', headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}`, 'X-CSRF-Token': csrfToken }, body: { ...updateBody, remark: '<script>alert(1)</script>' } })
assert.equal(xss.response.status, 422)
const updated = await jsonRequest(`/api/admin/leads/${leadId}`, { method: 'PATCH', headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}`, 'X-CSRF-Token': csrfToken }, body: updateBody })
assert.equal(updated.response.status, 200)
const conflict = await jsonRequest(`/api/admin/leads/${leadId}`, { method: 'PATCH', headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}`, 'X-CSRF-Token': csrfToken }, body: updateBody })
assert.equal(conflict.response.status, 409)
remember('list-detail-update-xss-concurrency')

const formulaLead = await jsonRequest('/api/demo-requests', { method: 'POST', headers: { 'X-Idempotency-Key': 'csv-formula-key-000000000000001' }, body: validBody('13600000000', '=2+2') })
assert.equal(formulaLead.response.status, 201)
const unauthExport = await fetch(`${baseUrl}/api/admin/leads/export`)
assert.equal(unauthExport.status, 401)
const exportResponse = await fetch(`${baseUrl}/api/admin/leads/export`, { headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}`, 'X-CSRF-Token': csrfToken } })
assert.equal(exportResponse.status, 200)
assert.match(exportResponse.headers.get('content-type') || '', /text\/csv/)
const csvBytes = new Uint8Array(await exportResponse.arrayBuffer())
assert.deepEqual([...csvBytes.slice(0, 3)], [0xEF, 0xBB, 0xBF])
const csv = new TextDecoder().decode(csvBytes.slice(3))
assert.match(csv, /"'=2\+2"/)
remember('authorized-safe-csv-export')

const logout = await jsonRequest('/api/admin/logout', { method: 'POST', headers: { Origin: origin, Cookie: `kwzg_admin_session=${sessionCookie}`, 'X-CSRF-Token': csrfToken }, body: undefined })
assert.equal(logout.response.status, 200)
const afterLogout = await jsonRequest('/api/admin/leads', { headers: { Cookie: `kwzg_admin_session=${sessionCookie}` } })
assert.equal(afterLogout.response.status, 401)
remember('logout-invalidates-session')

process.stdout.write(`API E2E passed: ${results.join(', ')}\n`)
