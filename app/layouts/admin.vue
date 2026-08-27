<script setup>
import { siteConfig } from '~/config/site'

const route = useRoute()
const isLogin = computed(() => route.path === '/admin/login')
const menuOpen = ref(false)
const sidebarCollapsed = ref(false)
const adminMenuOpen = ref(false)
const sidebar = ref(null)
const menuButton = ref(null)
const counts = reactive({ unread: 0, today: 0, overdue: 0 })
const admin = ref(null)
const csrfToken = ref('')
const navigationError = ref(false)
const motionPage = computed(() => `admin-${String(route.name || route.path).replaceAll('/', '-')}`)
let navigationPromise = null

const navigationGroups = computed(() => [
  { label: '运营工作', links: [
    { to: '/admin', label: '工作台', icon: '▦', exact: true },
    { to: '/admin/leads', label: '预约线索', icon: '◎', badge: counts.unread },
    { to: '/admin/leads?view=today', label: '今日跟进', icon: '◷', badge: counts.today },
    { to: '/admin/leads?view=overdue', label: '逾期跟进', icon: '!', badge: counts.overdue, urgent: true },
  ] },
  { label: '账户安全', links: [
    { to: '/admin/profile', label: '管理员账户', icon: '◇' },
    { to: '/admin/profile?tab=sessions', label: '登录与会话', icon: '◉' },
    { to: '/admin/profile?tab=audit', label: '操作日志', icon: '≡' },
  ] },
])
const pageTitle = computed(() => route.path === '/admin' ? '工作台' : route.path.startsWith('/admin/leads') ? '预约线索' : '管理员账户')

function isActive(link) {
  if (link.exact) return route.path === link.to
  const [path, search] = link.to.split('?')
  if (route.path !== path) return false
  if (!search) return path === '/admin/profile' ? !route.query.tab : !route.query.view
  return [...new URLSearchParams(search).entries()].every(([key, value]) => String(route.query[key] || '') === value)
}

async function loadNavigation() {
  if (isLogin.value) return
  if (navigationPromise) return navigationPromise
  navigationPromise = (async () => {
    navigationError.value = false
    const result = await $fetch('/api/admin/navigation')
    admin.value = result.admin
    Object.assign(counts, result.counts)
    // The session endpoint rotates the CSRF token. Only call it when this
    // browser tab has no token yet; rotating it on every route change can race
    // the first write made by a newly mounted detail page.
    if (!csrfToken.value) {
      const session = await $fetch('/api/admin/session')
      csrfToken.value = session.csrfToken
    }
    return result
  })()
  try {
    return await navigationPromise
  } catch (error) {
    const status = error?.statusCode || error?.response?.status
    if (status === 401) return navigateTo({ path: '/admin/login', query: { redirect: route.fullPath, expired: '1' } })
    navigationError.value = true
  } finally {
    navigationPromise = null
  }
}

async function ensureAdminCsrfToken() {
  if (navigationPromise) await navigationPromise
  if (!csrfToken.value) await loadNavigation()
  return csrfToken.value
}

function closeMenu(restoreFocus = true) {
  menuOpen.value = false
  if (import.meta.client) document.body.style.overflow = ''
  if (restoreFocus) nextTick(() => menuButton.value?.focus())
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  document.body.style.overflow = menuOpen.value ? 'hidden' : ''
  if (menuOpen.value) {
    nextTick(() => sidebar.value?.querySelector('a, button')?.focus())
  }
}

function toggleSidebar() {
  if (window.innerWidth <= 768) return toggleMenu()
  sidebarCollapsed.value = !sidebarCollapsed.value
  sessionStorage.setItem('kwzg-admin-sidebar-collapsed', sidebarCollapsed.value ? '1' : '0')
}

async function logout() {
  try {
    await $fetch('/api/admin/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken.value } })
  } finally {
    await navigateTo('/admin/login')
  }
}

function onKeydown(event) {
  if (!menuOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
    return
  }
  if (event.key !== 'Tab' || !sidebar.value) return
  const focusable = [...sidebar.value.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => route.fullPath, () => {
  closeMenu(false)
  loadNavigation()
})
onMounted(() => {
  sidebarCollapsed.value = sessionStorage.getItem('kwzg-admin-sidebar-collapsed') === '1'
  document.addEventListener('keydown', onKeydown)
  loadNavigation()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
provide('refreshAdminNavigation', loadNavigation)
provide('adminCsrfToken', readonly(csrfToken))
provide('ensureAdminCsrfToken', ensureAdminCsrfToken)
</script>

<template>
  <div class="kw-admin-shell" :data-motion-page="motionPage">
    <a class="kw-skip-link" href="#admin-main">跳到主要内容</a>
    <template v-if="isLogin">
      <main id="admin-main"><slot /></main>
    </template>
    <template v-else>
      <button class="kw-admin-nav-mask" :class="{ 'is-open': menuOpen }" type="button" aria-label="关闭后台菜单" @click="closeMenu" />
      <aside id="admin-navigation" ref="sidebar" class="kw-admin-sidebar" :class="{ 'is-open': menuOpen, 'is-collapsed': sidebarCollapsed }" aria-label="后台主导航">
        <div class="kw-admin-sidebar__brand"><BrandLogo inverse /><b class="kw-admin-brand-mark" aria-hidden="true">瞰</b><span>官网线索后台</span></div>
        <nav v-for="group in navigationGroups" :key="group.label"><small>{{ group.label }}</small>
          <NuxtLink v-for="link in group.links" :key="link.to" :to="link.to" :title="sidebarCollapsed ? link.label : undefined" :class="{ 'is-active': isActive(link), 'is-urgent': link.urgent }" @click="closeMenu">
            <span aria-hidden="true">{{ link.icon }}</span><strong>{{ link.label }}</strong><em v-if="link.badge">{{ link.badge > 99 ? '99+' : link.badge }}</em>
          </NuxtLink>
        </nav>
        <a class="kw-admin-sidebar__site" :href="siteConfig.siteUrl">返回官方网站 ↗</a>
      </aside>
      <div class="kw-admin-workspace" :class="{ 'is-collapsed': sidebarCollapsed }">
        <header class="kw-admin-topbar">
          <div class="kw-admin-breadcrumb"><button ref="menuButton" class="kw-admin-menu-button" type="button" :aria-expanded="menuOpen" aria-controls="admin-navigation" aria-label="切换后台菜单" @click="toggleSidebar"><span aria-hidden="true">☰</span></button><span>瞰维智管后台</span><b>/</b><strong>{{ pageTitle }}</strong></div>
          <div class="kw-admin-account-menu"><span v-if="navigationError" class="kw-admin-nav-error">服务状态异常</span><span v-else class="kw-admin-service-status">● 服务正常</span><button type="button" :aria-expanded="adminMenuOpen" @click="adminMenuOpen = !adminMenuOpen"><i aria-hidden="true">{{ (admin?.username || '管').slice(0, 1).toUpperCase() }}</i>{{ admin?.username || '管理员' }}⌄</button><div v-if="adminMenuOpen" class="kw-admin-account-popover"><NuxtLink to="/admin/profile" @click="adminMenuOpen = false">账户设置</NuxtLink><NuxtLink to="/admin/profile?tab=sessions" @click="adminMenuOpen = false">登录与会话</NuxtLink><button type="button" @click="logout">退出登录</button></div></div>
        </header>
        <main id="admin-main"><slot /></main>
      </div>
    </template>
  </div>
</template>
