<script setup>
import { canTransitionLeadStatus, DEMO_METHODS, FOLLOW_UP_METHODS, LEAD_STATUS_DEFINITIONS } from '~~/shared/lead-statuses.js'

const props = defineProps({ leadId: { type: String, required: true }, drawer: { type: Boolean, default: false }, returnTo: { type: String, default: '/admin/leads' } })
const emit = defineEmits(['close', 'updated'])
const route = useRoute()
const refreshNavigation = inject('refreshAdminNavigation', () => {})
const ensureAdminCsrfToken = inject('ensureAdminCsrfToken', async () => '')
const lead = ref(null)
const assignees = ref([])
const timeline = ref([])
const timelineTotal = ref(0)
const timelinePage = ref(1)
const loading = ref(true)
const saving = ref('')
const message = ref('')
const errorMessage = ref('')
const statusForm = reactive({ status: '', note: '' })
const followUpForm = reactive({ contactMethod: 'PHONE', content: '', result: '', nextPlan: '', nextFollowUpAt: '' })
const demoForm = reactive({ demoScheduledAt: '', demoMethod: 'ONLINE', title: '瞰维智管产品能力演示', note: '' })
const assigneeForm = reactive({ adminUserId: '', note: '' })
const archiveForm = reactive({ outcome: 'ON_HOLD', note: '', parkCount: '', nextFollowUpAt: '', reopenAllowed: true })
const demoActionForm = reactive({ note: '', nextFollowUpAt: '' })
const statusOptions = computed(() => LEAD_STATUS_DEFINITIONS.filter(item => lead.value && canTransitionLeadStatus(lead.value.status, item.code) && item.code === 'CONTACTED'))
const archiveOptions = computed(() => LEAD_STATUS_DEFINITIONS.filter(item => lead.value && ['WON', 'ON_HOLD', 'INVALID'].includes(item.code) && canTransitionLeadStatus(lead.value.status, item.code)))

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '未设置'
}

async function handleAuthError(error) {
  const status = error?.statusCode || error?.response?.status
  if (status === 401) await navigateTo({ path: '/admin/login', query: { redirect: route.fullPath, expired: '1' } })
  return status
}

async function loadTimeline(page = 1, append = false) {
  const result = await $fetch(`/api/admin/leads/${props.leadId}/timeline`, { query: { page, pageSize: 20 } })
  timeline.value = append ? [...timeline.value, ...result.items] : result.items
  timelineTotal.value = result.total
  timelinePage.value = page
}

async function loadAll() {
  loading.value = true
  errorMessage.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    const [detailResult] = await Promise.all([$fetch(`/api/admin/leads/${props.leadId}`), loadTimeline()])
    lead.value = detailResult.lead
    assignees.value = detailResult.assignees || []
    statusForm.status = statusOptions.value[0]?.code || lead.value.status
    assigneeForm.adminUserId = lead.value.assignee?.id || ''
    demoForm.demoMethod = lead.value.demoMethod || 'ONLINE'
    demoForm.title = lead.value.demoTitle || '瞰维智管产品能力演示'
    archiveForm.outcome = archiveOptions.value[0]?.code || 'ON_HOLD'
    await $fetch(`/api/admin/leads/${props.leadId}/read`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken } })
    await refreshNavigation()
  } catch (error) {
    await handleAuthError(error)
    errorMessage.value = error?.data?.error?.message || '线索详情加载失败。'
  } finally {
    loading.value = false
  }
}

async function refreshAfterSave(successMessage) {
  message.value = successMessage
  await loadAll()
  emit('updated')
}

async function copyPhone() {
  try {
    await navigator.clipboard.writeText(lead.value.phone)
    message.value = '手机号已复制。'
  } catch {
    message.value = '复制失败，请长按或手动选择号码复制。'
  }
}

async function saveStatus() {
  if (!lead.value || saving.value) return
  saving.value = 'status'
  errorMessage.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${lead.value.id}`, { method: 'PATCH', headers: { 'X-CSRF-Token': csrfToken }, body: { status: statusForm.status, note: statusForm.note, version: lead.value.version } })
    statusForm.note = ''
    await refreshAfterSave('状态已更新，审计记录已写入。')
  } catch (error) {
    await handleAuthError(error)
    errorMessage.value = error?.data?.error?.message || '状态保存失败。'
    if (error?.statusCode === 409) await loadAll()
  } finally { saving.value = '' }
}

async function saveAssignee() {
  if (!lead.value || saving.value) return
  saving.value = 'assignee'
  errorMessage.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${lead.value.id}/assignee`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { adminUserId: assigneeForm.adminUserId || null, note: assigneeForm.note, version: lead.value.version } })
    assigneeForm.note = ''
    await refreshAfterSave('负责人已更新，审计记录已写入。')
  } catch (error) {
    await handleAuthError(error)
    errorMessage.value = error?.data?.error?.message || '负责人保存失败。'
    if (error?.statusCode === 409) await loadAll()
  } finally { saving.value = '' }
}

async function saveFollowUp() {
  if (!lead.value || saving.value) return
  saving.value = 'follow-up'
  errorMessage.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${lead.value.id}/follow-ups`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { contactMethod: followUpForm.contactMethod, content: followUpForm.content, result: followUpForm.result, nextPlan: followUpForm.nextPlan, nextFollowUpAt: followUpForm.nextFollowUpAt ? new Date(followUpForm.nextFollowUpAt).toISOString() : null, version: lead.value.version } })
    followUpForm.content = ''
    followUpForm.result = ''
    followUpForm.nextPlan = ''
    followUpForm.nextFollowUpAt = ''
    await refreshAfterSave('跟进记录已保存。')
  } catch (error) {
    await handleAuthError(error)
    errorMessage.value = error?.data?.error?.message || '跟进记录保存失败。'
    if (error?.statusCode === 409) await loadAll()
  } finally { saving.value = '' }
}

async function scheduleDemo() {
  if (!lead.value || saving.value) return
  saving.value = 'demo'
  errorMessage.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${lead.value.id}/schedule-demo`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { demoScheduledAt: new Date(demoForm.demoScheduledAt).toISOString(), demoMethod: demoForm.demoMethod, title: demoForm.title, note: demoForm.note, version: lead.value.version } })
    demoForm.note = ''
    demoForm.demoScheduledAt = ''
    await refreshAfterSave('产品演示已安排。')
  } catch (error) {
    await handleAuthError(error)
    errorMessage.value = error?.data?.error?.message || '安排演示失败。'
    if (error?.statusCode === 409) await loadAll()
  } finally { saving.value = '' }
}

async function runLeadAction(endpoint, body, successMessage) {
  if (!lead.value || saving.value) return
  saving.value = endpoint
  errorMessage.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch(`/api/admin/leads/${lead.value.id}/${endpoint}`, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { ...body, version: lead.value.version } })
    demoActionForm.note = ''
    demoActionForm.nextFollowUpAt = ''
    archiveForm.note = ''
    archiveForm.parkCount = ''
    archiveForm.nextFollowUpAt = ''
    await refreshAfterSave(successMessage)
  } catch (error) {
    await handleAuthError(error)
    errorMessage.value = error?.data?.error?.message || '业务操作失败。'
    if ((error?.statusCode || error?.response?.status) === 409) await loadAll()
  } finally { saving.value = '' }
}

function completeDemo() {
  return runLeadAction('complete-demo', { note: demoActionForm.note }, '演示已标记完成，审计记录已写入。')
}

function cancelDemo() {
  return runLeadAction('cancel-demo', { note: demoActionForm.note, nextFollowUpAt: demoActionForm.nextFollowUpAt ? new Date(demoActionForm.nextFollowUpAt).toISOString() : null }, '演示已取消，线索已回到已联系。')
}

function archiveLead() {
  return runLeadAction('archive', { outcome: archiveForm.outcome, note: archiveForm.note, parkCount: archiveForm.parkCount, nextFollowUpAt: archiveForm.nextFollowUpAt ? new Date(archiveForm.nextFollowUpAt).toISOString() : null, reopenAllowed: archiveForm.reopenAllowed }, '处理结果已归档。')
}

function reopenLead() {
  return runLeadAction('reopen', { note: archiveForm.note }, '线索已重新开启并回到待跟进。')
}

onMounted(loadAll)
watch(() => props.leadId, loadAll)
</script>

<template>
  <section class="kw-admin-lead-panel" :class="{ 'is-drawer': drawer }">
    <header class="kw-admin-lead-panel__header">
      <div><span>客户线索</span><h1>{{ lead?.name || '线索详情' }}</h1><p v-if="lead">{{ lead.sourcePage }} · {{ formatDate(lead.createdAt) }}</p></div>
      <button v-if="drawer" type="button" aria-label="关闭线索详情" @click="emit('close')">关闭 ×</button>
      <NuxtLink v-else :to="returnTo">← 返回线索列表</NuxtLink>
    </header>
    <div v-if="loading" class="kw-admin-state">正在加载线索详情…</div>
    <div v-else-if="!lead" class="kw-admin-state is-error" role="alert">{{ errorMessage }} <button type="button" @click="loadAll">重试</button></div>
    <template v-else>
      <p v-if="message" class="kw-admin-feedback is-success" role="status">{{ message }}</p>
      <p v-if="errorMessage" class="kw-admin-feedback is-error" role="alert">{{ errorMessage }}</p>
      <article class="kw-admin-card kw-admin-lead-summary">
        <div class="kw-admin-lead-summary__top"><span class="kw-lead-status" :data-tone="lead.statusTone">{{ lead.statusLabel }}</span><small>更新于 {{ formatDate(lead.updatedAt) }}</small></div>
        <dl><div><dt>预约编号</dt><dd>{{ lead.referenceCode }}</dd></div><div><dt>完整手机号</dt><dd>{{ lead.phone }}</dd></div><div><dt>园区数量</dt><dd>{{ lead.parkCount }}</dd></div><div><dt>负责人</dt><dd>{{ lead.assignee?.username || '未分配' }}</dd></div><div><dt>下次跟进</dt><dd :class="{ 'is-overdue': lead.overdue }">{{ formatDate(lead.nextFollowUpAt) }}</dd></div><div><dt>演示时间</dt><dd>{{ formatDate(lead.demoScheduledAt) }}</dd></div><div><dt>演示主题</dt><dd>{{ lead.demoTitle || '未设置' }}</dd></div><div><dt>演示完成</dt><dd>{{ formatDate(lead.demoCompletedAt) }}</dd></div><div><dt>成交时间</dt><dd>{{ formatDate(lead.wonAt) }}</dd></div></dl>
        <div class="kw-admin-phone"><strong>{{ lead.phone }}</strong><a :href="`tel:${lead.phone}`">拨打电话</a><button type="button" @click="copyPhone">复制号码</button></div>
      </article>
      <div class="kw-admin-lead-actions-grid">
        <form class="kw-admin-card" @submit.prevent="saveFollowUp"><header><span>01</span><h2>添加跟进</h2></header><label>联系方式<select v-model="followUpForm.contactMethod"><option v-for="method in FOLLOW_UP_METHODS" :key="method.code" :value="method.code">{{ method.label }}</option></select></label><label>跟进内容<textarea v-model="followUpForm.content" rows="4" maxlength="2000" required /></label><label>跟进结果<textarea v-model="followUpForm.result" rows="2" maxlength="500" required /></label><label>下一步计划<textarea v-model="followUpForm.nextPlan" rows="2" maxlength="500" required /></label><label>下次跟进时间<input v-model="followUpForm.nextFollowUpAt" type="datetime-local"></label><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !followUpForm.content || !followUpForm.result || !followUpForm.nextPlan">{{ saving === 'follow-up' ? '保存中…' : '保存跟进' }}</button></form>
        <form class="kw-admin-card" @submit.prevent="scheduleDemo"><header><span>02</span><h2>安排产品演示</h2></header><label>演示时间<input v-model="demoForm.demoScheduledAt" type="datetime-local" required></label><label>演示方式<select v-model="demoForm.demoMethod"><option v-for="method in DEMO_METHODS" :key="method.code" :value="method.code">{{ method.label }}</option></select></label><label>演示主题<input v-model="demoForm.title" maxlength="120" required></label><label>演示备注<textarea v-model="demoForm.note" rows="3" maxlength="500" required /></label><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !demoForm.demoScheduledAt || !demoForm.title || !demoForm.note || !['CONTACTED', 'DEMO_SCHEDULED'].includes(lead.status)">{{ saving === 'demo' ? '安排中…' : (lead.status === 'DEMO_SCHEDULED' ? '调整演示时间' : '确认安排演示') }}</button><small v-if="!['CONTACTED', 'DEMO_SCHEDULED'].includes(lead.status)">线索标记“已联系”后可安排演示。</small></form>
        <form v-if="lead.status === 'DEMO_SCHEDULED'" class="kw-admin-card" @submit.prevent="completeDemo"><header><span>03</span><h2>演示结果</h2></header><label>完成或取消说明<textarea v-model="demoActionForm.note" rows="4" maxlength="500" required /></label><label>取消后的下次跟进<input v-model="demoActionForm.nextFollowUpAt" type="datetime-local"></label><div class="kw-admin-inline-actions"><button type="button" :disabled="saving || !demoActionForm.note" @click="cancelDemo">取消演示</button><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !demoActionForm.note">标记演示完成</button></div></form>
        <form v-if="statusOptions.length" class="kw-admin-card" @submit.prevent="saveStatus"><header><span>04</span><h2>继续跟进</h2></header><label>目标状态<select v-model="statusForm.status"><option v-for="status in statusOptions" :key="status.code" :value="status.code">{{ status.label }}</option></select></label><label>变更原因<textarea v-model="statusForm.note" rows="4" maxlength="500" required /></label><button class="kw-button kw-button--primary" type="submit" :disabled="saving || statusForm.status === lead.status || !statusForm.note">{{ saving === 'status' ? '保存中…' : '保存状态' }}</button></form>
        <form v-if="archiveOptions.length" class="kw-admin-card kw-admin-archive-form" @submit.prevent="archiveLead"><header><span>05</span><h2>结果归档</h2></header><label>处理结果<select v-model="archiveForm.outcome"><option v-for="status in archiveOptions" :key="status.code" :value="status.code">{{ status.label }}</option></select></label><label>处理原因<textarea v-model="archiveForm.note" rows="4" maxlength="500" required /></label><label v-if="archiveForm.outcome === 'WON'">成交园区数量（可选）<input v-model="archiveForm.parkCount" type="number" min="1" max="999"></label><label v-if="archiveForm.outcome === 'ON_HOLD'">预计重新跟进时间<input v-model="archiveForm.nextFollowUpAt" type="datetime-local" required></label><label v-if="archiveForm.outcome === 'INVALID'" class="kw-admin-checkbox"><input v-model="archiveForm.reopenAllowed" type="checkbox">允许后续重新开启</label><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !archiveForm.note || (archiveForm.outcome === 'ON_HOLD' && !archiveForm.nextFollowUpAt)">确认归档</button></form>
        <form v-if="lead.status === 'INVALID' && lead.reopenAllowed" class="kw-admin-card" @submit.prevent="reopenLead"><header><span>05</span><h2>重新开启</h2></header><label>重新开启原因<textarea v-model="archiveForm.note" rows="4" maxlength="500" required /></label><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !archiveForm.note">重新开启为待跟进</button></form>
        <form class="kw-admin-card" @submit.prevent="saveAssignee"><header><span>04</span><h2>变更负责人</h2></header><label>负责人<select v-model="assigneeForm.adminUserId"><option value="">未分配</option><option v-for="admin in assignees" :key="admin.id" :value="admin.id">{{ admin.username }}</option></select></label><label>变更原因<textarea v-model="assigneeForm.note" rows="4" maxlength="500" required /></label><button class="kw-button kw-button--primary" type="submit" :disabled="saving || assigneeForm.adminUserId === (lead.assignee?.id || '') || !assigneeForm.note">{{ saving === 'assignee' ? '保存中…' : '保存负责人' }}</button></form>
      </div>
      <article class="kw-admin-card kw-admin-timeline"><header><span>05</span><h2>客户时间线</h2></header><p v-if="!timeline.length" class="kw-admin-empty">暂时没有时间线记录。</p><ol v-else><li v-for="item in timeline" :key="item.id" :data-kind="item.kind"><time>{{ formatDate(item.occurredAt) }}</time><div><strong>{{ item.title }}<small> · {{ item.adminUsername }}</small></strong><p v-if="item.content">{{ item.content }}</p><p v-if="item.result">结果：{{ item.result }}</p><p v-if="item.nextPlan">下一步：{{ item.nextPlan }}</p><p v-if="item.beforeSummary || item.afterSummary">{{ item.beforeSummary }}<template v-if="item.afterSummary"> → {{ item.afterSummary }}</template></p><small v-if="item.nextFollowUpAt">下次跟进：{{ formatDate(item.nextFollowUpAt) }}</small></div></li></ol><button v-if="timeline.length < timelineTotal" type="button" @click="loadTimeline(timelinePage + 1, true)">加载更多记录</button></article>
    </template>
  </section>
</template>
