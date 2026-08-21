<script setup>
import { siteConfig } from '~/config/site'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
usePageSeo({ title: '预约线索', description: '瞰维智管官网独立预约线索管理。' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] })

const statuses = ['待跟进', '跟进中', '已安排演示', '已完成', '无效']
const filters = reactive({ search: '', status: '', dateFrom: '', dateTo: '', page: 1, pageSize: 20, sort: 'createdAt', order: 'desc' })
const csrfToken = ref('')
const list = ref([])
const total = ref(0)
const loading = ref(true)
const listError = ref('')
const detail = ref(null)
const drawerOpen = ref(false)
const saving = ref(false)
const feedback = ref('')
let searchTimer

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.pageSize)))

function queryParams(includePage = true) {
  return Object.fromEntries(Object.entries({
    search: filters.search || undefined,
    status: filters.status || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    page: includePage ? filters.page : undefined,
    pageSize: includePage ? filters.pageSize : undefined,
    sort: filters.sort,
    order: filters.order,
  }).filter(([, value]) => value !== undefined && value !== ''))
}

async function loadSession() {
  const session = await $fetch('/api/admin/session')
  csrfToken.value = session.csrfToken
}

async function loadLeads() {
  loading.value = true
  listError.value = ''
  try {
    const result = await $fetch('/api/admin/leads', { query: queryParams() })
    list.value = result.items
    total.value = result.total
  } catch (error) {
    if (error?.statusCode === 401) return navigateTo('/admin/login')
    listError.value = error?.data?.error?.message || '线索列表加载失败。'
  } finally {
    loading.value = false
  }
}

function scheduleSearch() {
  clearTimeout(searchTimer)
  filters.page = 1
  searchTimer = setTimeout(loadLeads, 300)
}

async function openDetail(id) {
  feedback.value = ''
  try {
    const result = await $fetch(`/api/admin/leads/${id}`)
    detail.value = result.lead
    drawerOpen.value = true
  } catch (error) {
    listError.value = error?.data?.error?.message || '线索详情加载失败。'
  }
}

function closeDrawer() {
  drawerOpen.value = false
  detail.value = null
  feedback.value = ''
}

async function saveDetail() {
  if (!detail.value || saving.value) return
  saving.value = true
  feedback.value = ''
  try {
    const result = await $fetch(`/api/admin/leads/${detail.value.id}`, {
      method: 'PATCH',
      headers: { 'X-CSRF-Token': csrfToken.value },
      body: { status: detail.value.status, remark: detail.value.remark, version: detail.value.version },
    })
    detail.value.version = result.version
    detail.value.updatedAt = result.updatedAt
    feedback.value = '状态与备注已保存。'
    await loadLeads()
  } catch (error) {
    feedback.value = error?.data?.error?.message || '保存失败，请稍后重试。'
    if (error?.statusCode === 409) await openDetail(detail.value.id)
  } finally {
    saving.value = false
  }
}

async function exportCsv() {
  feedback.value = ''
  try {
    const query = new URLSearchParams(queryParams(false)).toString()
    const response = await fetch(`/api/admin/leads/export?${query}`, { headers: { 'X-CSRF-Token': csrfToken.value } })
    if (!response.ok) throw new Error('export failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'kwzg-leads.csv'
    link.click()
    URL.revokeObjectURL(url)
    feedback.value = '已导出当前筛选结果。'
  } catch {
    feedback.value = '导出失败，请稍后重试。'
  }
}

async function logout() {
  try {
    await $fetch('/api/admin/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken.value } })
  } finally {
    await navigateTo('/admin/login')
  }
}

watch(() => [filters.status, filters.dateFrom, filters.dateTo, filters.sort, filters.order, filters.page], loadLeads)
onMounted(async () => {
  try {
    await loadSession()
    await loadLeads()
  } catch {
    await navigateTo('/admin/login')
  }
})
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <div class="kw-admin-page">
    <header class="kw-admin-header"><BrandLogo /><div><span>官网线索后台</span><a :href="siteConfig.siteUrl">yizuw.org</a><button type="button" @click="logout">退出登录</button></div></header>
    <main class="kw-admin-main">
      <div class="kw-admin-title"><div><span>预约管理</span><h1>预约线索</h1><p>仅展示官网独立数据库中的预约信息。</p></div><button type="button" @click="exportCsv">导出当前筛选 CSV</button></div>
      <section class="kw-admin-filters" aria-label="线索筛选">
        <label>搜索姓名或手机号<input v-model="filters.search" type="search" maxlength="100" placeholder="输入姓名或手机号" @input="scheduleSearch"></label>
        <label>状态<select v-model="filters.status"><option value="">全部状态</option><option v-for="status in statuses" :key="status" :value="status">{{ status }}</option></select></label>
        <label>开始日期<input v-model="filters.dateFrom" type="date"></label><label>结束日期<input v-model="filters.dateTo" type="date"></label>
      </section>
      <p v-if="feedback" class="kw-admin-feedback is-success" role="status">{{ feedback }}</p>
      <section class="kw-admin-list" :aria-busy="loading">
        <div v-if="loading" class="kw-admin-state">正在加载线索…</div><div v-else-if="listError" class="kw-admin-state is-error" role="alert">{{ listError }} <button type="button" @click="loadLeads">重试</button></div><div v-else-if="!list.length" class="kw-admin-state">当前筛选下暂无线索。</div>
        <div v-else class="kw-admin-table-wrap"><table><thead><tr><th>姓名</th><th>手机号</th><th>园区数量</th><th>状态</th><th>提交时间</th><th>操作</th></tr></thead><TransitionGroup name="kw-list" tag="tbody"><tr v-for="lead in list" :key="lead.id"><td>{{ lead.name }}</td><td>{{ lead.phone }}</td><td>{{ lead.parkCount }}</td><td><span class="kw-lead-status">{{ lead.status }}</span></td><td>{{ new Date(lead.createdAt).toLocaleString('zh-CN') }}</td><td><button type="button" @click="openDetail(lead.id)">查看详情</button></td></tr></TransitionGroup></table></div>
        <footer><span>共 {{ total }} 条</span><div><button type="button" :disabled="filters.page <= 1" @click="filters.page--">上一页</button><span>{{ filters.page }} / {{ totalPages }}</span><button type="button" :disabled="filters.page >= totalPages" @click="filters.page++">下一页</button></div></footer>
      </section>
    </main>

    <Teleport to="body"><Transition name="kw-drawer"><div v-if="drawerOpen && detail" class="kw-admin-drawer" role="dialog" aria-modal="true" aria-labelledby="lead-detail-title" @click.self="closeDrawer"><div class="kw-admin-drawer__panel"><header><div><span>线索详情</span><h2 id="lead-detail-title">{{ detail.name }}</h2></div><button type="button" @click="closeDrawer">关闭 ×</button></header><dl><div><dt>手机号</dt><dd>{{ detail.phone }}</dd></div><div><dt>园区数量</dt><dd>{{ detail.parkCount }}</dd></div><div><dt>提交时间</dt><dd>{{ new Date(detail.createdAt).toLocaleString('zh-CN') }}</dd></div><div><dt>隐私版本</dt><dd>{{ detail.privacyVersion }}</dd></div></dl><label>跟进状态<select v-model="detail.status"><option v-for="status in statuses" :key="status" :value="status">{{ status }}</option></select></label><label>纯文本备注<textarea v-model="detail.remark" maxlength="1000" rows="8" placeholder="填写跟进备注，不支持 HTML" /><small>{{ detail.remark.length }} / 1000</small></label><button class="kw-button kw-button--primary" type="button" :disabled="saving" @click="saveDetail">{{ saving ? '正在保存…' : '保存状态与备注' }}</button><p v-if="feedback" class="kw-admin-feedback" role="status">{{ feedback }}</p></div></div></Transition></Teleport>
  </div>
</template>
