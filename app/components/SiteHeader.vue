<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '~/config/site'

const mobileOpen = ref(false)
const scrolled = ref(false)
const headerElement = ref(null)
const menuButton = ref(null)
const route = useRoute()
let scrollObserver
let pendingHomeScroll = false

const navigation = [
  { label: '首页', to: '/', exact: true },
  { label: '产品能力', to: '/products' },
  { label: '解决方案', to: '/solutions' },
  { label: '客户案例', to: '/cases' },
  { label: '关于我们', to: '/about' },
]

function isCurrentNavigation(item) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function scrollToHomeTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.motion === 'off'
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

function handleHomeLink(event) {
  mobileOpen.value = false
  if (route.path === '/') {
    event.preventDefault()
    scrollToHomeTop()
    return
  }
  pendingHomeScroll = true
}

function handleNavigation(item, event) {
  mobileOpen.value = false
  if (item.to === '/') handleHomeLink(event)
}

function closeMobileMenu({ restoreFocus = false } = {}) {
  if (!mobileOpen.value) return
  mobileOpen.value = false
  if (restoreFocus) nextTick(() => menuButton.value?.focus())
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') closeMobileMenu({ restoreFocus: true })
}

function handleDocumentPointerdown(event) {
  if (mobileOpen.value && !headerElement.value?.contains(event.target)) closeMobileMenu()
}

watch(() => route.fullPath, async () => {
  mobileOpen.value = false
  if (pendingHomeScroll && route.path === '/') {
    pendingHomeScroll = false
    await nextTick()
    scrollToHomeTop()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
  document.addEventListener('pointerdown', handleDocumentPointerdown)
  const sentinel = document.getElementById('kw-scroll-sentinel')
  if (!sentinel) return
  scrollObserver = new IntersectionObserver(([entry]) => {
    scrolled.value = !entry.isIntersecting
  })
  scrollObserver.observe(sentinel)
})

onBeforeUnmount(() => {
  scrollObserver?.disconnect()
  document.removeEventListener('keydown', handleDocumentKeydown)
  document.removeEventListener('pointerdown', handleDocumentPointerdown)
})
</script>

<template>
  <header ref="headerElement" class="kw-header" :class="{ 'is-scrolled': scrolled, 'is-menu-open': mobileOpen }">
    <div class="kw-container kw-header__bar">
      <BrandLogo @click="handleHomeLink" />

      <nav class="kw-header__nav" aria-label="主导航">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="{ 'is-active': isCurrentNavigation(item) }"
          :aria-current="isCurrentNavigation(item) ? 'page' : undefined"
          @click="handleNavigation(item, $event)"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="kw-header__actions">
        <a
          class="kw-header__login"
          :href="siteConfig.systemUrl"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >登录系统</a>
        <UiBaseButton class="kw-header__cta" to="/demo" size="small">
          预约演示
        </UiBaseButton>
        <button
          ref="menuButton"
          class="kw-header__menu-button"
          type="button"
          aria-controls="mobile-navigation"
          :aria-expanded="mobileOpen"
          :aria-label="mobileOpen ? '关闭导航菜单' : '打开导航菜单'"
          @click="mobileOpen = !mobileOpen"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>

    <Transition name="kw-menu">
      <div
        v-if="mobileOpen"
        id="mobile-navigation"
        class="kw-header__mobile-panel"
      >
        <nav class="kw-container kw-header__mobile-nav" aria-label="移动端导航">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            :class="{ 'is-active': isCurrentNavigation(item) }"
            :aria-current="isCurrentNavigation(item) ? 'page' : undefined"
            @click="handleNavigation(item, $event)"
          >
            {{ item.label }}
            <span aria-hidden="true">→</span>
          </NuxtLink>
          <a
            :href="siteConfig.systemUrl"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            登录系统
            <span aria-hidden="true">↗</span>
          </a>
          <a :href="siteConfig.contact.phoneHref">
            电话联系 {{ siteConfig.contact.phone }}
            <span aria-hidden="true">☎</span>
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>
