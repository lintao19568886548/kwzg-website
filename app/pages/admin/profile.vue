<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
usePageSeo({ title: '管理员账户', description: '瞰维智管官网线索后台管理员账户。' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] })

const route = useRoute()
const ensureAdminCsrfToken = inject('ensureAdminCsrfToken', async () => '')
const profile = ref(null)
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const showPasswords = ref(false)
const capsLock = ref(false)
const activeTab = ref(String(route.query.tab || 'overview'))
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '', revokeOtherSessions: true })
const passwordStrength = computed(() => {
  const value = form.newPassword
  if (!value) return { score: 0, label: '尚未输入' }
  let score = Math.min(2, Math.floor(value.length / 6))
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^\w]/.test(value)) score++
  return { score: Math.min(score, 4), label: ['较弱', '较弱', '一般', '良好', '较强'][Math.min(score, 4)] }
})

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '未记录'
}

async function loadProfile() {
  loading.value = true
  errorMessage.value = ''
  try {
    profile.value = await $fetch('/api/admin/profile')
  } catch (error) {
    if ((error?.statusCode || error?.response?.status) === 401) return navigateTo({ path: '/admin/login', query: { redirect: route.fullPath, expired: '1' } })
    errorMessage.value = error?.data?.error?.message || '账户信息加载失败。'
  } finally { loading.value = false }
}

async function changePassword() {
  if (saving.value) return
  saving.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    const csrfToken = await ensureAdminCsrfToken()
    const result = await $fetch('/api/admin/profile/password', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { ...form } })
    Object.assign(form, { currentPassword: '', newPassword: '', confirmPassword: '' })
    message.value = result.revokedSessions ? `密码已修改，并退出 ${result.revokedSessions} 个其他设备会话。` : '密码已修改，当前会话保持登录。'
    await loadProfile()
  } catch (error) {
    errorMessage.value = error?.data?.error?.message || '密码修改失败。'
  } finally { saving.value = false }
}

async function revokeSession(session) {
  if (session.current || !window.confirm(`确认撤销“${session.device}”会话？该设备将立即退出。`)) return
  try {
    const csrfToken = await ensureAdminCsrfToken()
    await $fetch('/api/admin/profile/sessions/revoke', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: { sessionId: session.id } })
    message.value = '其他设备会话已撤销。'
    await loadProfile()
  } catch (error) { errorMessage.value = error?.data?.error?.message || '会话撤销失败。' }
}

async function revokeOtherSessions() {
  if (!window.confirm('确认退出所有其他设备？当前设备会保持登录。')) return
  try {
    const csrfToken = await ensureAdminCsrfToken()
    const result = await $fetch('/api/admin/profile/sessions/revoke-others', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken } })
    message.value = `已退出 ${result.revokedSessions} 个其他设备会话。`
    await loadProfile()
  } catch (error) { errorMessage.value = error?.data?.error?.message || '其他设备退出失败。' }
}

function handleCapsLock(event) {
  capsLock.value = Boolean(event.getModifierState?.('CapsLock'))
}

watch(() => route.query.tab, value => { activeTab.value = String(value || 'overview') })

onMounted(loadProfile)
</script>

<template>
  <div class="kw-admin-main kw-admin-profile">
    <header class="kw-admin-page-title"><span>账户安全</span><h1>管理员账户</h1><p>集中查看账号、会话、密码与安全操作记录。</p></header>
    <div v-if="loading" class="kw-admin-state">正在加载账户信息…</div>
    <div v-else-if="!profile" class="kw-admin-state is-error" role="alert">{{ errorMessage }} <button type="button" @click="loadProfile">重试</button></div>
    <template v-else>
      <p v-if="message" class="kw-admin-feedback is-success" role="status">{{ message }}</p><p v-if="errorMessage" class="kw-admin-feedback is-error" role="alert">{{ errorMessage }}</p>
      <nav class="kw-admin-profile-tabs" aria-label="账户页面分区"><NuxtLink to="/admin/profile">账号概览</NuxtLink><NuxtLink to="/admin/profile?tab=sessions">登录与会话</NuxtLink><NuxtLink to="/admin/profile?tab=password">修改密码</NuxtLink><NuxtLink to="/admin/profile?tab=audit">安全日志</NuxtLink></nav>
      <section v-if="activeTab === 'overview'" class="kw-admin-card kw-admin-account-overview"><div class="kw-admin-avatar" aria-hidden="true">{{ profile.admin.username.slice(0, 1).toUpperCase() }}</div><div><span>账号状态 · 正常</span><h2>{{ profile.admin.username }}</h2><p>当前会话有效，官网后台与生产管理系统完全隔离。</p></div><dl><div><dt>创建时间</dt><dd>{{ formatDate(profile.admin.createdAt) }}</dd></div><div><dt>最近登录</dt><dd>{{ formatDate(profile.admin.lastLoginAt) }}</dd></div><div><dt>最近活动</dt><dd>{{ formatDate(profile.session.lastActivityAt) }}</dd></div><div><dt>当前会话</dt><dd>有效 · 当前设备</dd></div></dl></section>
      <section v-else-if="activeTab === 'sessions'" class="kw-admin-card kw-admin-session-card"><header><div><span>登录与会话</span><h2>已登录设备</h2></div><button type="button" @click="revokeOtherSessions">退出其他设备</button></header><div class="kw-admin-table-wrap"><table><thead><tr><th>设备</th><th>脱敏 IP</th><th>创建时间</th><th>最近活动</th><th>空闲到期</th><th>最晚到期</th><th>操作</th></tr></thead><tbody><tr v-for="session in profile.sessions" :key="session.id"><td>{{ session.device }} <strong v-if="session.current">当前会话</strong></td><td>{{ session.ip }}</td><td>{{ formatDate(session.createdAt) }}</td><td>{{ formatDate(session.lastActivityAt) }}</td><td>{{ formatDate(session.expiresAt) }}</td><td>{{ formatDate(session.absoluteExpiresAt) }}</td><td><button v-if="!session.current" type="button" @click="revokeSession(session)">撤销</button><span v-else>受保护</span></td></tr></tbody></table></div></section>
      <form v-else-if="activeTab === 'password'" class="kw-admin-card kw-admin-password-form" @submit.prevent="changePassword" @keydown="handleCapsLock" @keyup="handleCapsLock"><header><span>修改密码</span><h2>更新登录凭证</h2></header><label>当前密码<div class="kw-admin-password-input"><input v-model="form.currentPassword" :type="showPasswords ? 'text' : 'password'" autocomplete="current-password" maxlength="128" required><button type="button" @click="showPasswords = !showPasswords">{{ showPasswords ? '隐藏' : '显示' }}</button></div></label><label>新密码<div class="kw-admin-password-input"><input v-model="form.newPassword" :type="showPasswords ? 'text' : 'password'" autocomplete="new-password" maxlength="128" required><button type="button" @click="showPasswords = !showPasswords">{{ showPasswords ? '隐藏' : '显示' }}</button></div><small>允许设置任意非空值，最多128个字符；建议使用长且唯一的密码。当前强度：{{ passwordStrength.label }}</small><meter min="0" max="4" :value="passwordStrength.score">{{ passwordStrength.label }}</meter></label><label>确认新密码<div class="kw-admin-password-input"><input v-model="form.confirmPassword" :type="showPasswords ? 'text' : 'password'" autocomplete="new-password" maxlength="128" required><button type="button" @click="showPasswords = !showPasswords">{{ showPasswords ? '隐藏' : '显示' }}</button></div></label><p v-if="capsLock" class="kw-admin-caps-warning" role="status">大写锁定已开启</p><label class="kw-admin-checkbox"><input v-model="form.revokeOtherSessions" type="checkbox">修改成功后退出其他设备</label><button class="kw-button kw-button--primary" type="submit" :disabled="saving || !form.currentPassword || !form.newPassword || !form.confirmPassword">{{ saving ? '正在修改…' : '修改密码' }}</button></form>
      <section v-else class="kw-admin-card"><header><span>安全日志</span><h2>可追溯安全操作</h2></header><p>管理员登录、退出、密码修改与会话撤销均写入只读审计表。线索业务操作请在线索详情时间线查看。</p><NuxtLink class="kw-button" to="/admin">查看最近动态</NuxtLink></section>
    </template>
  </div>
</template>
