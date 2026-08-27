<script setup>
import { DEMO_METHODS, FOLLOW_UP_METHODS, LEAD_STATUS_DEFINITIONS } from '~~/shared/lead-statuses.js'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
usePageSeo({ title: '预约线索', description: '瞰维智管官网独立预约线索管理。' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] })

const route = useRoute()
const router = useRouter()
const refreshNavigation = inject('refreshAdminNavigation', () => {})
const ensureAdminCsrfToken = inject('ensureAdminCsrfToken', async () => '')
const showingChildDetail = computed(() => Boolean(route.params.id))
const viewDefinitions = [
  { code: 'all', label: '全部线索' }, { code: 'new', label: '新预约' }, { code: 'pending', label: '待跟进' }, { code: 'today', label: '今日跟进' },
  { code: 'overdue', label: '已逾期' }, { code: 'demo-scheduled', label: '已预约演示' }, { code: 'demo-completed', label: '已完成演示' }, { code: 'won', label: '已成交' }, { code: 'invalid', label: '无效线索' },
]
const filters = reactive({ search: '', status: '', dateFrom: '', dateTo: '', nextFollowUpFrom: '', nextFollowUpTo: '', parkCountMin: '', parkCountMax: '', sourcePage: '', assignee: '', overdue: '', unread: '', page: 1, pageSize: 20, sort: 'priority', order: 'desc', view: 'all' })
const filterOptions = reactive({ sources: [], assignees: [] })
const list = ref([])
const total = ref(0)
const loading = ref(true)
const listError = ref('')
const feedback = ref('')
const drawerOpen = ref(false)
const drawerLeadId = ref('')
const drawerPanel = ref(null)
const drawerCloseButton = ref(null)
const modal = reactive({ type: '', lead: null })
const followUpForm = reactive({ contactMethod: 'PHONE', content: '', result: '', nextPlan: '', nextFollowUpAt: '' })
const demoForm = reactive({ demoScheduledAt: '', demoMethod: 'ONLINE', title: '瞰维智管产品能力演示', note: '' })
const saving = ref('')
let searchTimer
let drawerTrigger
let pageInitialized = false

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.pageSize)))
const currentViewLabel = computed(() => viewDefinitions.find(item => item.code === filters.view)?.label || '全部线索')

function scalarQuery(value, fallback = '') {
  return Array.isArray(value) ? fallback : (value ?? fallback)
}

function applyQueryToFilters() {
  Object.assign(filters, {
    search: String(scalarQuery(route.query.search)),
    status: String(scalarQuery(route.query.status)),
    dateFrom: String(scalarQuery(route.query.dateFrom)),
    dateTo: String(scalarQuery(route.query.dateTo)),
    nextFollowUpFrom: String(scalarQuery(route.query.nextFollowUpFrom)),
    nextFollowUpTo: String(scalarQuery(route.query.nextFollowUpTo)),
    parkCountMin: scalarQuery(route.query.parkCountMin),
    parkCountMax: scalarQuery(route.query.parkCountMax),
    sourcePage: String(scalarQuery(route.query.sourcePage)),
    assignee: String(scalarQuery(route.query.assignee)),
    overdue: String(scalarQuery(route.query.overdue)),
    unread: String(scalarQuery(route.query.unread)),
    page: Number(scalarQuery(route.query.page, 1)) || 1,
    pageSize: Number(scalarQuery(route.query.pageSize, 20)) || 20,
    sort: String(scalarQuery(route.query.sort, 'priority')),
    order: String(scalarQuery(route.query.order, 'desc')),
    view: String(scalarQuery(route.query.view, 'all')),
  })
}

function queryParams() {
  return Object.fromEntries(Object.entries({
    search: filters.search || undefined, status: filters.status || undefined, dateFrom: filters.dateFrom || undefined, dateTo: filters.dateTo || undefined, nextFollowUpFrom: filters.nextFollowUpFrom || undefined, nextFollowUpTo: filters.nextFollowUpTo || undefined,
    parkCountMin: filters.parkCountMin === '' ? undefined : filters.parkCountMin, parkCountMax: filters.parkCountMax === '' ? undefined : filters.parkCountMax,
    sourcePage: filters.sourcePage || undefined, assignee: filters.assignee || undefined, overdue: filters.overdue || undefined, unread: filters.unread || undefined,
    page: filters.page, pageSize: filters.pageSize, sort: filters.sort, order: filters.order, view: filters.view === 'all' ? undefined : filters.view,
  }).filter(([, value]) => value !== undefined && value !== ''))
}

async function loadLeads() {
  loading.value = true
  listError.value = ''
  try {
    const result = await $fetch('/api/admin/leads', { query: queryParams() })
    list.value = result.items
    total.value = result.total
    Object.assign(filterOptions, result.options || { sources: [], assignees: [] })
  } catch (error) {
    const status = error?.statusCode || error?.response?.status
    if (status === 401) return navigateTo({ path: '/admin/login', query: { redirect: route.fullPath, expired: '1' } })
    listError.value = status === 503 ? '数据库暂时不可用，线索列表未显示任何假数据。' : (error?.data?.error?.message || '线索列表加载失败。')
  } finally { loading.value = false }
}

async function replaceFilters(resetPage = true) {
  if (resetPage) filters.page = 1
  await router.replace({ path: '/admin/leads', query: queryParams() })
}

function scheduleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => replaceFilters(true), 300)
}

function clearFilters() {
  Object.assign(filters, { search: '', status: '', dateFrom: '', dateTo: '', nextFollowUpFrom: '', nextFollowUpTo: '', parkCountMin: '', parkCountMax: '', sourcePage: '', assignee: '', overdue: '', unread: '', page: 1, pageSize: 20, sort: 'priority', order: 'desc', view: 'all' })
  replaceFilters(false)
}

async function setPage(page) {
  filters.page = Math.min(Math.max(1, page), totalPages.value)
  await replaceFilters(false)
}

async function openLead(lead, event) {
  if (window.innerWidth <= 1024) {
    await navigateTo({ path: `/admin/leads/${lead.id}`, query: { returnTo: route.fullPath } })
    return
  }
  drawerTrigger = event?.currentTarget || document.activeElement
  await router.push({ path: '/admin/leads', query: { ...route.query, detail: lead.id } })
}

async function openDrawerFromRoute() {
  const id = String(scalarQuery(route.query.detail))
  drawerLeadId.value = id
  drawerOpen.value = Boolean(id)
  document.body.style.overflow = id ? 'hidden' : ''
  if (id) await nextTick(() => {
    drawerCloseButton.value = drawerPanel.value?.querySelector('[aria-label="关闭线索详情"]') || null
    drawerCloseButton.value?.focus()
  })
  else nextTick(() => drawerTrigger?.focus())
}

async function closeDrawer() {
  if (!drawerOpen.value) return
  await router.back()
}

async function getPrivateLead(lead) {
  const result = await $fetch(`/api/admin/leads/${lead.id}`)
  const csrfToken = await ensureAdminCsrfToken()
  await $fetch(`/api/admin/leads/${lead.id}/read`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken } })
  return result.lead
}

async function callLead(lead) {
  try {
    const detail = await getPrivateLead(lead)
    window.location.href = `tel:${detail.phone}`
  } catch (error) { feedback.value = error?.data?.error?.message || '暂时无法读取拨号号码。' }
}

async function copyPhone(lead) {
  try {
    const detail = await getPrivateLead(lead)
    await navigator.clipboard.writeText(detail.phone)
    feedback.value = '手机号已复制。'
  } catch {
    feedback.value = '复制失败，请进入详情手动选择号码。'
  }
}

async function markContacted(lead) {
  if (lead.status !== 'PENDING' || saving.value) return
  saving.value = lead.id
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${lead.id}`, { method: 'PATCH', headers: { 'X-CSRF-Token': csrfToken }, body: { status: 'CONTACTED', note: '线索列表快捷标记已联系', version: lead.version } })
    feedback.value = `${lead.name} 已标记为已联系。`
    await Promise.all([loadLeads(), refreshNavigation()])
  } catch (error) { feedback.value = error?.data?.error?.message || '状态更新失败。' } finally { saving.value = '' }
}

function openModal(type, lead) {
  modal.type = type
  modal.lead = lead
  Object.assign(followUpForm, { contactMethod: 'PHONE', content: '', result: '', nextPlan: '', nextFollowUpAt: '' })
  Object.assign(demoForm, { demoScheduledAt: '', demoMethod: 'ONLINE', title: '瞰维智管产品能力演示', note: '' })
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modal.type = ''
  modal.lead = null
  if (!drawerOpen.value) document.body.style.overflow = ''
}

async function saveQuickFollowUp() {
  if (!modal.lead || saving.value) return
  saving.value = modal.lead.id
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${modal.lead.id}/follow-ups`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { contactMethod: followUpForm.contactMethod, content: followUpForm.content, result: followUpForm.result, nextPlan: followUpForm.nextPlan, nextFollowUpAt: followUpForm.nextFollowUpAt ? new Date(followUpForm.nextFollowUpAt).toISOString() : null, version: modal.lead.version } })
    feedback.value = '跟进记录已保存。'
    closeModal()
    await Promise.all([loadLeads(), refreshNavigation()])
  } catch (error) { feedback.value = error?.data?.error?.message || '跟进保存失败。' } finally { saving.value = '' }
}

async function saveQuickDemo() {
  if (!modal.lead || saving.value) return
  saving.value = modal.lead.id
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${modal.lead.id}/schedule-demo`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { demoScheduledAt: new Date(demoForm.demoScheduledAt).toISOString(), demoMethod: demoForm.demoMethod, title: demoForm.title, note: demoForm.note, version: modal.lead.version } })
    feedback.value = '产品演示已安排。'
    closeModal()
    await Promise.all([loadLeads(), refreshNavigation()])
  } catch (error) { feedback.value = error?.data?.error?.message || '演示安排失败。' } finally { saving.value = '' }
}

async function exportCsv() {
  feedback.value = ''
  if (!window.confirm('导出文件包含完整手机号，仅限授权管理员在受控环境使用。确认导出当前筛选结果？')) return
  try {
    const csrfToken = await ensureAdminCsrfToken()
    const exportQuery = new URLSearchParams(queryParams()).toString()
    const response = await fetch(`/api/admin/leads/export?${exportQuery}`, { headers: { 'X-CSRF-Token': csrfToken } })
    if (!response.ok) throw new Error('export failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kwzg-leads-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    feedback.value = '当前筛选结果已导出。'
  } catch {
    feedback.value = '导出失败，请稍后重试。'
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    if (modal.type) closeModal()
    else if (drawerOpen.value) closeDrawer()
  }
  if (event.key !== 'Tab' || !drawerOpen.value || !drawerPanel.value) return
  const focusable = [...drawerPanel.value.querySelectorAll('button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

async function initialize() {
  if (showingChildDetail.value || pageInitialized) return
  pageInitialized = true
  applyQueryToFilters()
  await Promise.all([loadLeads(), openDrawerFromRoute()])
}

watch(() => route.fullPath, async () => {
  if (showingChildDetail.value) return
  applyQueryToFilters()
  await Promise.all([loadLeads(), openDrawerFromRoute()])
})
watch(showingChildDetail, value => { if (!value) initialize() })
onMounted(() => { document.addEventListener('keydown', handleKeydown); initialize() })
onBeforeUnmount(() => { clearTimeout(searchTimer); document.removeEventListener('keydown', handleKeydown); document.body.style.overflow = '' })
</script>

<template>
  <div v-if="!showingChildDetail" class="kw-admin-main kw-admin-leads-page">
    <header class="kw-admin-page-title"><span>预约管理</span><h1>{{ currentViewLabel }}</h1><p>筛选条件、分页和详情位置均保留在当前网址中。</p></header>
    <nav class="kw-admin-views" aria-label="线索快捷视图"><NuxtLink v-for="view in viewDefinitions" :key="view.code" :to="{ path: '/admin/leads', query: view.code === 'all' ? {} : { view: view.code } }" :class="{ 'is-active': filters.view === view.code }">{{ view.label }}</NuxtLink></nav>
    <section class="kw-admin-list-toolbar"><strong>当前结果 {{ total }} 条</strong><button type="button" @click="exportCsv">导出当前筛选 CSV</button></section>
    <section class="kw-admin-filters" aria-label="线索筛选">
      <label>搜索姓名或手机号<input v-model="filters.search" type="search" maxlength="100" placeholder="输入姓名或手机号" @input="scheduleSearch"></label>
      <label>状态<select v-model="filters.status" @change="replaceFilters()"><option value="">全部状态</option><option v-for="status in LEAD_STATUS_DEFINITIONS" :key="status.code" :value="status.code">{{ status.label }}</option></select></label>
      <label>开始日期<input v-model="filters.dateFrom" type="date" @change="replaceFilters()"></label><label>结束日期<input v-model="filters.dateTo" type="date" @change="replaceFilters()"></label>
      <label>下次跟进开始<input v-model="filters.nextFollowUpFrom" type="date" @change="replaceFilters()"></label><label>下次跟进结束<input v-model="filters.nextFollowUpTo" type="date" @change="replaceFilters()"></label>
      <label>园区数量下限<input v-model="filters.parkCountMin" type="number" min="0" inputmode="numeric" @change="replaceFilters()"></label><label>园区数量上限<input v-model="filters.parkCountMax" type="number" min="0" inputmode="numeric" @change="replaceFilters()"></label>
      <label>来源页面<select v-model="filters.sourcePage" @change="replaceFilters()"><option value="">全部来源</option><option v-for="source in filterOptions.sources" :key="source" :value="source">{{ source }}</option></select></label>
      <label>负责人<select v-model="filters.assignee" @change="replaceFilters()"><option value="">全部负责人</option><option value="unassigned">未分配</option><option v-for="admin in filterOptions.assignees" :key="admin.id" :value="admin.id">{{ admin.username }}</option></select></label>
      <label>线索阅读状态<select v-model="filters.unread" @change="replaceFilters()"><option value="">全部</option><option value="true">仅未读线索</option><option value="false">仅已读线索</option></select></label>
      <label>跟进时效<select v-model="filters.overdue" @change="replaceFilters()"><option value="">全部</option><option value="true">仅已逾期</option><option value="false">未逾期</option></select></label>
      <label>排序<select v-model="filters.sort" @change="replaceFilters()"><option value="priority">状态优先级</option><option value="createdAt">提交时间</option><option value="nextFollowUpAt">下次跟进</option><option value="lastFollowUpAt">最近跟进</option></select></label>
      <label>每页<select v-model.number="filters.pageSize" @change="replaceFilters()"><option :value="20">20 条</option><option :value="50">50 条</option><option :value="100">100 条</option></select></label>
      <button type="button" class="kw-admin-filter-reset" @click="clearFilters">清空筛选</button>
    </section>
    <p v-if="feedback" class="kw-admin-feedback" role="status">{{ feedback }}</p>
    <section class="kw-admin-list" :aria-busy="loading">
      <div v-if="loading" class="kw-admin-state">正在加载线索…</div><div v-else-if="listError" class="kw-admin-state is-error" role="alert">{{ listError }} <button type="button" @click="loadLeads">重试</button></div><div v-else-if="!list.length" class="kw-admin-state"><strong>当前筛选下暂无线索</strong><p>可以清空筛选条件查看全部预约。</p></div>
      <div v-else class="kw-admin-table-wrap"><table><thead><tr><th>预约编号 / 客户</th><th>状态</th><th>负责人</th><th>下次跟进</th><th>提交时间</th><th>快捷操作</th></tr></thead><tbody><tr v-for="lead in list" :key="lead.id" :class="{ 'is-unread': lead.unread }"><td data-label="预约编号 / 客户"><strong>{{ lead.name }}<i v-if="lead.unread">未读</i></strong><span>{{ lead.referenceCode }} · {{ lead.phone }} · {{ lead.parkCount }}个园区</span></td><td data-label="状态"><span class="kw-lead-status" :data-tone="lead.statusTone">{{ lead.statusLabel }}</span></td><td data-label="负责人">{{ lead.assignee?.username || '未分配' }}</td><td data-label="下次跟进" :class="{ 'is-overdue': lead.overdue }">{{ lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString('zh-CN') : '未设置' }}</td><td data-label="提交时间">{{ new Date(lead.createdAt).toLocaleString('zh-CN') }}</td><td data-label="快捷操作"><div class="kw-admin-row-actions"><button type="button" @click="callLead(lead)">拨打</button><button type="button" @click="copyPhone(lead)">复制号码</button><button v-if="lead.status === 'PENDING'" type="button" :disabled="saving === lead.id" @click="markContacted(lead)">标记已联系</button><button type="button" @click="openModal('follow-up', lead)">添加跟进</button><button v-if="['CONTACTED', 'DEMO_SCHEDULED'].includes(lead.status)" type="button" @click="openModal('demo', lead)">预约演示</button><button class="is-primary" type="button" @click="openLead(lead, $event)">查看详情</button></div></td></tr></tbody></table></div>
      <footer><span>第 {{ filters.page }} 页，共 {{ totalPages }} 页</span><div><button type="button" :disabled="filters.page <= 1" @click="setPage(filters.page - 1)">上一页</button><button type="button" :disabled="filters.page >= totalPages" @click="setPage(filters.page + 1)">下一页</button></div></footer>
    </section>
    <Teleport to="body"><Transition name="kw-drawer"><div v-if="drawerOpen && drawerLeadId" class="kw-admin-drawer" role="dialog" aria-modal="true" aria-label="线索详情" @click.self="closeDrawer"><div ref="drawerPanel" class="kw-admin-drawer__panel kw-admin-drawer__panel--wide" tabindex="-1"><AdminLeadDetailPanel :lead-id="drawerLeadId" drawer @close="closeDrawer" @updated="loadLeads" /></div></div></Transition></Teleport>
    <Teleport to="body"><Transition name="kw-drawer"><div v-if="modal.type && modal.lead" class="kw-admin-modal" role="dialog" aria-modal="true" :aria-label="modal.type === 'demo' ? '安排产品演示' : '添加跟进'" @click.self="closeModal"><form v-if="modal.type === 'follow-up'" class="kw-admin-card" @submit.prevent="saveQuickFollowUp"><header><span>快捷操作</span><h2>为 {{ modal.lead.name }} 添加跟进</h2></header><label>联系方式<select v-model="followUpForm.contactMethod"><option v-for="method in FOLLOW_UP_METHODS" :key="method.code" :value="method.code">{{ method.label }}</option></select></label><label>跟进内容<textarea v-model="followUpForm.content" rows="5" maxlength="2000" required /></label><label>跟进结果<textarea v-model="followUpForm.result" rows="2" maxlength="500" required /></label><label>下一步计划<textarea v-model="followUpForm.nextPlan" rows="2" maxlength="500" required /></label><label>下次跟进时间<input v-model="followUpForm.nextFollowUpAt" type="datetime-local"></label><div><button type="button" @click="closeModal">取消</button><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !followUpForm.content || !followUpForm.result || !followUpForm.nextPlan">{{ saving ? '保存中…' : '保存跟进' }}</button></div></form><form v-else class="kw-admin-card" @submit.prevent="saveQuickDemo"><header><span>快捷操作</span><h2>为 {{ modal.lead.name }} 安排演示</h2></header><label>演示时间<input v-model="demoForm.demoScheduledAt" type="datetime-local" required></label><label>演示方式<select v-model="demoForm.demoMethod"><option v-for="method in DEMO_METHODS" :key="method.code" :value="method.code">{{ method.label }}</option></select></label><label>演示主题<input v-model="demoForm.title" maxlength="120" required></label><label>备注<textarea v-model="demoForm.note" rows="4" maxlength="500" required /></label><div><button type="button" @click="closeModal">取消</button><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !demoForm.demoScheduledAt || !demoForm.title || !demoForm.note">{{ saving ? '安排中…' : '确认安排' }}</button></div></form></div></Transition></Teleport>
  </div>
  <NuxtPage v-else />
</template>
