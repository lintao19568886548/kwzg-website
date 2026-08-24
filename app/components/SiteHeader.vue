<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '~/config/site'
import { capabilityStatuses, megaMenuGroups, productCapabilities } from '~/data/product-capabilities'

const mobileOpen = ref(false)
const mobileProductsOpen = ref(false)
const productMenuOpen = ref(false)
const scrolled = ref(false)
const headerElement = ref(null)
const menuButton = ref(null)
const route = useRoute()
let scrollObserver
let pendingHomeScroll = false

const navigation = [
  { label: '首页', to: '/', exact: true },
  { label: '产品能力', to: '/products', mega: true },
  { label: '解决方案', to: '/solutions' },
  { label: '客户案例', to: '/cases' },
  { label: '实施服务', to: '/service' },
  { label: '关于我们', to: '/about' },
]

const capabilityIndex = computed(() => Object.fromEntries(productCapabilities.map(item => [item.id, item])))

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
  productMenuOpen.value = false
  if (route.path === '/') {
    event.preventDefault()
    scrollToHomeTop()
    return
  }
  pendingHomeScroll = true
}

function handleNavigation(item, event) {
  mobileOpen.value = false
  productMenuOpen.value = false
  if (item.to === '/') handleHomeLink(event)
}

function closeMobileMenu({ restoreFocus = false } = {}) {
  if (!mobileOpen.value) return
  mobileOpen.value = false
  mobileProductsOpen.value = false
  if (restoreFocus) nextTick(() => menuButton.value?.focus())
}

function handleDocumentKeydown(event) {
  if (event.key !== 'Escape') return
  productMenuOpen.value = false
  closeMobileMenu({ restoreFocus: true })
}

function handleDocumentPointerdown(event) {
  if (!headerElement.value?.contains(event.target)) {
    productMenuOpen.value = false
    closeMobileMenu()
  }
}

watch(() => route.fullPath, async () => {
  mobileOpen.value = false
  mobileProductsOpen.value = false
  productMenuOpen.value = false
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
  <header ref="headerElement" class="kw-header" :class="{ 'is-scrolled': scrolled, 'is-menu-open': mobileOpen, 'has-mega-open': productMenuOpen }">
    <div class="kw-container kw-header__bar">
      <div class="kw-header__brand"><BrandLogo :header-tagline="siteConfig.brand.headerTagline" @click="handleHomeLink" /></div>

      <nav class="kw-header__nav" aria-label="主导航">
        <template v-for="item in navigation" :key="item.to">
          <div
            v-if="item.mega"
            class="kw-header__product-nav"
            @mouseenter="productMenuOpen = true"
            @mouseleave="productMenuOpen = false"
            @focusin="productMenuOpen = true"
            @focusout="event => { if (!event.currentTarget.contains(event.relatedTarget)) productMenuOpen = false }"
          >
            <NuxtLink
              :to="item.to"
              :class="{ 'is-active': isCurrentNavigation(item) }"
              :aria-current="isCurrentNavigation(item) ? 'page' : undefined"
              @click="handleNavigation(item, $event)"
            >{{ item.label }}</NuxtLink>
            <button type="button" :aria-expanded="productMenuOpen" aria-controls="product-mega-menu" aria-label="展开产品能力分组" @click="productMenuOpen = !productMenuOpen">⌄</button>
          </div>
          <NuxtLink
            v-else
            :to="item.to"
            :class="{ 'is-active': isCurrentNavigation(item) }"
            :aria-current="isCurrentNavigation(item) ? 'page' : undefined"
            @click="handleNavigation(item, $event)"
          >{{ item.label }}</NuxtLink>
        </template>
      </nav>

      <div class="kw-header__actions">
        <a class="kw-header__login" :href="siteConfig.systemUrl" target="_blank" rel="noopener noreferrer nofollow">登录系统</a>
        <UiBaseButton class="kw-header__cta" to="/demo" size="small">预约演示</UiBaseButton>
        <button ref="menuButton" class="kw-header__menu-button" type="button" aria-controls="mobile-navigation" :aria-expanded="mobileOpen" :aria-label="mobileOpen ? '关闭导航菜单' : '打开导航菜单'" @click="mobileOpen = !mobileOpen">
          <span /><span /><span />
        </button>
      </div>
    </div>

    <Transition name="kw-menu">
      <div v-if="productMenuOpen" id="product-mega-menu" class="kw-mega-menu">
        <div class="kw-container kw-mega-menu__inner">
          <div class="kw-mega-menu__intro"><span>能力全景</span><strong>从经营决策到园区服务</strong><p>每项能力都明确标注已上线、按项目配置、评估接入或规划中。</p><NuxtLink to="/products" @click="productMenuOpen = false">查看完整产品能力 →</NuxtLink></div>
          <div class="kw-mega-menu__groups">
            <section v-for="group in megaMenuGroups" :key="group.name">
              <h2>{{ group.name }}</h2>
              <NuxtLink v-for="id in group.items" :key="id" :to="`/products#capability-${capabilityIndex[id].slug}`" @click="productMenuOpen = false">
                <span>{{ capabilityIndex[id].shortName }}</span><CapabilityStatusTag :status="capabilityIndex[id].status" compact />
              </NuxtLink>
            </section>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="kw-menu">
      <div v-if="mobileOpen" id="mobile-navigation" class="kw-header__mobile-panel">
        <nav class="kw-container kw-header__mobile-nav" aria-label="移动端导航">
          <NuxtLink to="/" :class="{ 'is-active': route.path === '/' }" :aria-current="route.path === '/' ? 'page' : undefined" @click="handleHomeLink">首页 <span aria-hidden="true">→</span></NuxtLink>
          <div class="kw-mobile-products">
            <div><NuxtLink to="/products" :class="{ 'is-active': route.path === '/products' }" @click="mobileOpen = false">产品能力</NuxtLink><button type="button" :aria-expanded="mobileProductsOpen" aria-controls="mobile-product-groups" @click="mobileProductsOpen = !mobileProductsOpen">{{ mobileProductsOpen ? '收起' : '展开' }}</button></div>
            <div v-if="mobileProductsOpen" id="mobile-product-groups" class="kw-mobile-products__groups">
              <section v-for="group in megaMenuGroups" :key="group.name"><h2>{{ group.name }}</h2><NuxtLink v-for="id in group.items" :key="id" :to="`/products#capability-${capabilityIndex[id].slug}`" @click="mobileOpen = false">{{ capabilityIndex[id].shortName }} <span>{{ capabilityStatuses?.[capabilityIndex[id].status]?.label }}</span></NuxtLink></section>
            </div>
          </div>
          <NuxtLink v-for="item in navigation.filter(item => !item.exact && !item.mega)" :key="item.to" :to="item.to" :class="{ 'is-active': isCurrentNavigation(item) }" :aria-current="isCurrentNavigation(item) ? 'page' : undefined" @click="handleNavigation(item, $event)">{{ item.label }} <span aria-hidden="true">→</span></NuxtLink>
          <NuxtLink to="/demo" @click="mobileOpen = false">预约演示 <span aria-hidden="true">→</span></NuxtLink>
          <a :href="siteConfig.systemUrl" target="_blank" rel="noopener noreferrer nofollow">登录系统 <span aria-hidden="true">↗</span></a>
          <a :href="siteConfig.contact.phoneHref">电话联系 {{ siteConfig.contact.phone }} <span aria-hidden="true">☎</span></a>
        </nav>
      </div>
    </Transition>
  </header>
</template>
