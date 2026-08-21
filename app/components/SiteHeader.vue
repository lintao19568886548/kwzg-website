<script setup>
import { siteConfig } from '~/config/site'

const mobileOpen = ref(false)
const route = useRoute()

const navigation = [
  { label: '产品能力', to: '/products' },
  { label: '解决方案', to: '/solutions' },
  { label: '客户案例', to: '/cases' },
  { label: '关于我们', to: '/about' },
]

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<template>
  <header class="kw-header">
    <div class="kw-container kw-header__bar">
      <BrandLogo />

      <nav class="kw-header__nav" aria-label="主导航">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
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
