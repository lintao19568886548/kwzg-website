<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
usePageSeo({ title: '线索工作台', description: '瞰维智管官网预约线索每日待办工作台。' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] })

const route = useRoute()
const refreshNavigation = inject('refreshAdminNavigation', () => {})
const ensureAdminCsrfToken = inject('ensureAdminCsrfToken', async () => '')
const data = ref(null)
const loading = ref(true)
const errorMessage = ref('')
const feedback = ref('')
const savingId = ref('')

const metricDefinitions = [
  { key: 'todayNew', label: '今日新增', hint: '今天提交的官网预约', view: 'new' },
  { key: 'pending', label: '待跟进', hint: '尚未完成首次联系', view: 'pending' },
  { key: 'todayFollowUp', label: '今日应跟进', hint: '今天需要继续联系', view: 'today' },
  { key: 'overdue', label: '已逾期', hint: '已超过计划跟进时间', view: 'overdue', urgent: true },
  { key: 'demoScheduled', label: '已预约演示', hint: '等待进行产品演示', view: 'demo-scheduled' },
  { key: 'monthlyWon', label: '本月已成交', hint: '按成交状态审计统计', view: 'won' },
]

const taskGroups = computed(() => data.value ? [
  { key: 'overdue', label: '已逾期跟进', hint: '最早逾期优先', view: 'overdue', items: data.value.tasks.overdue, urgent: true },
  { key: 'today', label: '今日需要跟进', hint: '按计划时间升序', view: 'today', items: data.value.tasks.today },
  { key: 'pending', label: '新预约尚未联系', hint: '最早提交优先', view: 'pending', items: data.value.tasks.pending },
  { key: 'demos', label: '即将进行演示', hint: '按演示时间升序', view: 'demo-scheduled', items: data.value.tasks.demos },
] : [])

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '未设置'
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    data.value = await $fetch('/api/admin/dashboard')
  } catch (error) {
    const status = error?.statusCode || error?.response?.status
    if (status === 401) return navigateTo({ path: '/admin/login', query: { redirect: route.fullPath, expired: '1' } })
    data.value = null
    errorMessage.value = status === 503 ? '数据库暂时不可用，工作台未显示任何推测数据。恢复连接后请重试。' : (error?.data?.error?.message || '工作台加载失败。')
  } finally {
    loading.value = false
  }
}

async function markContacted(item) {
  if (item.status !== 'PENDING' || savingId.value) return
  savingId.value = item.id
  feedback.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${item.id}`, { method: 'PATCH', headers: { 'X-CSRF-Token': csrfToken }, body: { status: 'CONTACTED', note: '工作台快捷标记已联系', version: item.version } })
    feedback.value = `${item.name} 已标记为已联系。`
    await Promise.all([loadDashboard(), refreshNavigation()])
  } catch (error) {
    feedback.value = error?.data?.error?.message || '快捷更新失败，请进入详情重试。'
  } finally { savingId.value = '' }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="kw-admin-workbench kw-admin-main">
    <div v-if="loading" class="kw-admin-state">正在汇总今天的线索任务…</div>
    <div v-else-if="!data" class="kw-admin-state is-error" role="alert"><strong>工作台暂不可用</strong><p>{{ errorMessage }}</p><button type="button" @click="loadDashboard">重新加载</button></div>
    <template v-else>
      <header class="kw-admin-welcome">
        <div><span>{{ data.dateLabel }}</span><h1>{{ data.admin.username }}，今天优先处理什么？</h1><p>今天有 <strong>{{ data.metrics.todayFollowUp + data.metrics.overdue + data.metrics.pending }}</strong> 条线索需要关注，其中 <em>{{ data.metrics.overdue }}</em> 条已经逾期。</p></div>
        <dl><div><dt>最近一次登录</dt><dd>{{ formatDate(data.admin.lastLoginAt) }}</dd></div><div><dt>未读线索</dt><dd>{{ data.metrics.unread }}</dd></div></dl>
      </header>
      <p v-if="feedback" class="kw-admin-feedback" role="status">{{ feedback }}</p>
      <section class="kw-admin-metrics" aria-label="线索工作台指标">
        <NuxtLink v-for="metric in metricDefinitions" :key="metric.key" :to="{ path: '/admin/leads', query: { view: metric.view } }" :class="{ 'is-urgent': metric.urgent }">
          <span>{{ metric.label }}</span><strong>{{ data.metrics[metric.key] }}</strong><small>{{ metric.hint }}</small>
        </NuxtLink>
      </section>
      <section class="kw-admin-task-groups">
        <article v-for="group in taskGroups" :key="group.key" class="kw-admin-card kw-admin-task-card" :class="{ 'is-urgent': group.urgent }">
          <header><div><span>{{ group.label }}</span><small>{{ group.hint }}</small></div><NuxtLink :to="{ path: '/admin/leads', query: { view: group.view } }">查看全部 →</NuxtLink></header>
          <p v-if="!group.items.length" class="kw-admin-empty">当前没有需要处理的线索。</p>
          <ul v-else><li v-for="item in group.items" :key="item.id"><div><strong>{{ item.name }}</strong><span>{{ item.phone }} · {{ item.parkCount }}个园区</span></div><span>{{ item.statusLabel }} · 负责人：{{ item.assignee }}</span><time>{{ formatDate(item.demoScheduledAt || item.nextFollowUpAt || item.createdAt) }}</time><div class="kw-admin-task-actions"><button v-if="item.status === 'PENDING'" type="button" :disabled="savingId === item.id" @click="markContacted(item)">{{ savingId === item.id ? '处理中…' : '标记已联系' }}</button><NuxtLink :to="{ path: `/admin/leads/${item.id}`, query: { returnTo: `/admin/leads?view=${group.view}` } }">查看详情 / 处理</NuxtLink></div></li></ul>
        </article>
      </section>
      <section class="kw-admin-card kw-admin-recent-activity"><header><div><span>最近动态</span><h2>业务与安全审计</h2></div><small>数据来自只读审计记录</small></header><p v-if="!data.recentActivity.length" class="kw-admin-empty">暂无最近动态。</p><ol v-else><li v-for="item in data.recentActivity" :key="item.id"><time>{{ formatDate(item.occurredAt) }}</time><div><strong>{{ item.leadName || item.eventType }}</strong><p>{{ item.summary || item.eventType }} · {{ item.adminUsername }}</p></div></li></ol></section>
    </template>
  </div>
</template>
