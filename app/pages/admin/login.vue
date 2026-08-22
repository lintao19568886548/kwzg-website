<script setup>
definePageMeta({ layout: 'admin' })
usePageSeo({ title: '管理员登录', description: '瞰维智管官网线索后台管理员登录。' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] })

const form = reactive({ username: '', password: '' })
const csrfToken = ref('')
const state = ref('loading')
const message = ref('')

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

async function login() {
  if (state.value === 'submitting') return
  if (!form.username || !form.password) {
    state.value = 'error'
    message.value = '请输入账号和密码。'
    return
  }
  state.value = 'submitting'
  message.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken.value }, body: { username: form.username, password: form.password } })
    form.password = ''
    state.value = 'success'
    message.value = '登录成功，正在进入线索管理。'
    await navigateTo('/admin/leads')
  } catch (error) {
    form.password = ''
    state.value = 'error'
    message.value = error?.data?.error?.message || '账号或密码错误。'
    await loadCsrf()
    state.value = 'error'
  }
}

onMounted(loadCsrf)
</script>

<template>
  <div class="kw-admin-login">
    <section v-reveal class="kw-admin-login__panel">
      <div class="kw-admin-login__brand"><BrandLogo /></div>
      <span>官网独立后台</span><h1>管理员登录</h1><p>仅用于查看和跟进官网预约线索，与 yizuw.cn 生产系统完全隔离。</p>
      <form novalidate @submit.prevent="login">
        <label for="admin-username">管理员账号</label><input id="admin-username" v-model="form.username" type="text" autocomplete="username" maxlength="128">
        <label for="admin-password">密码</label><input id="admin-password" v-model="form.password" type="password" autocomplete="current-password" maxlength="256">
        <button class="kw-button kw-button--primary kw-button--large" type="submit" :disabled="state === 'loading' || state === 'submitting'" :aria-busy="state === 'submitting'">{{ state === 'submitting' ? '正在验证…' : '登录' }}</button>
      </form>
      <Transition name="kw-form-status"><p v-if="message" :class="`kw-admin-feedback is-${state}`" :role="state === 'error' ? 'alert' : 'status'">{{ message }}</p></Transition>
      <NuxtLink to="/">返回官方网站</NuxtLink>
    </section>
  </div>
</template>
