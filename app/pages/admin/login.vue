<script setup>
definePageMeta({ layout: 'admin' })
usePageSeo({ title: '管理员登录', description: '瞰维智管官网线索后台管理员登录。' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] })

const REMEMBERED_USERNAME_KEY = 'kwzg_admin_remembered_username'
const form = reactive({ username: '', password: '', rememberUsername: false })
const route = useRoute()
const usernameInput = ref(null)
const csrfToken = ref('')
const state = ref('loading')
const message = ref('')
const showPassword = ref(false)
const capsLock = ref(false)

function clearFeedback() {
  if (state.value !== 'error') return
  state.value = 'idle'
  message.value = ''
}

function readSubmittedCredentials(event) {
  let username = form.username
  let password = form.password
  if (event?.currentTarget) {
    const submitted = new FormData(event.currentTarget)
    username = String(submitted.get('username') ?? username)
    password = String(submitted.get('password') ?? password)
  }
  form.username = username
  form.password = password
  return { username: username.trim(), password }
}

async function loadCsrf() {
  state.value = 'loading'
  try {
    const result = await $fetch('/api/admin/csrf')
    csrfToken.value = result.csrfToken
    state.value = 'idle'
  } catch {
    state.value = 'error'
    message.value = '安全校验加载失败，请刷新页面重试。'
  }
}

function detectCapsLock(event) {
  capsLock.value = Boolean(event.getModifierState?.('CapsLock'))
}

function restoreRememberedUsername() {
  try {
    const remembered = localStorage.getItem(REMEMBERED_USERNAME_KEY) || ''
    if (remembered) {
      form.username = remembered
      form.rememberUsername = true
    }
  } catch {
    form.rememberUsername = false
  }
  nextTick(() => usernameInput.value?.focus())
}

function persistUsername() {
  try {
    if (form.rememberUsername) localStorage.setItem(REMEMBERED_USERNAME_KEY, form.username.trim())
    else localStorage.removeItem(REMEMBERED_USERNAME_KEY)
  } catch {
    // 登录不依赖本地偏好存储。
  }
}

async function login(event) {
  if (state.value === 'submitting') return
  const credentials = readSubmittedCredentials(event)
  if (!credentials.username || !credentials.password) {
    state.value = 'error'
    message.value = '请输入账号和密码。'
    return
  }
  state.value = 'submitting'
  message.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken.value }, body: credentials })
    persistUsername()
    form.password = ''
    state.value = 'success'
    message.value = '登录成功，正在进入线索工作台。'
    const requested = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    await navigateTo(requested.startsWith('/admin') && requested !== '/admin/login' && !requested.startsWith('//') ? requested : '/admin')
  } catch (error) {
    form.password = ''
    state.value = 'error'
    const status = error?.statusCode || error?.response?.status
    message.value = status === 503 ? '后台数据库暂时不可用，未进行任何登录或数据操作，请稍后重试。' : (error?.data?.error?.message || '账号或密码错误。')
    await loadCsrf()
    state.value = 'error'
  }
}

onMounted(async () => {
  if (route.query.expired === '1') message.value = '登录状态已过期，请重新登录后继续。'
  if (route.query.changed === '1') message.value = '密码已修改，请使用新密码重新登录。'
  restoreRememberedUsername()
  await loadCsrf()
})
</script>

<template>
  <div class="kw-admin-login">
    <section class="kw-admin-login__panel">
      <div class="kw-admin-login__brand"><BrandLogo /></div>
      <span>官网独立后台</span><h1>管理员登录</h1><p>登录后查看今日待办、跟进预约线索。后台与 yizuw.cn 生产系统完全隔离。</p>
      <form novalidate @submit.prevent="login">
        <label for="admin-username">管理员账号</label><input id="admin-username" ref="usernameInput" v-model="form.username" name="username" type="text" autocomplete="username" maxlength="64" @input="clearFeedback">
        <label for="admin-password">密码</label><div class="kw-admin-password-input"><input id="admin-password" v-model="form.password" name="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" maxlength="256" @input="clearFeedback" @keydown="detectCapsLock" @keyup="detectCapsLock"><button type="button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">{{ showPassword ? '隐藏' : '显示' }}</button></div>
        <p v-if="capsLock" class="kw-admin-caps-warning" role="status">大写锁定已开启</p>
        <label class="kw-admin-checkbox"><input v-model="form.rememberUsername" type="checkbox">记住管理员账号（不保存密码）</label>
        <button class="kw-button kw-button--primary kw-button--large" type="submit" :disabled="state === 'loading' || state === 'submitting'" :aria-busy="state === 'submitting'">{{ state === 'submitting' ? '正在验证…' : '登录并进入工作台' }}</button>
      </form>
      <Transition name="kw-form-status"><p v-if="message" :class="`kw-admin-feedback is-${state}`" :role="state === 'error' ? 'alert' : 'status'">{{ message }}</p></Transition>
      <NuxtLink to="/">返回官方网站</NuxtLink>
    </section>
  </div>
</template>
