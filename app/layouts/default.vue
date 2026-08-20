<script setup>
const navigation = [
  { label: '首页', to: '/' },
  { label: '产品能力', to: '/products' },
  { label: '解决方案', to: '/solutions' },
  { label: '客户案例', to: '/cases' },
  { label: '关于我们', to: '/about' },
]
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink
          class="brand"
          to="/"
          aria-label="瞰维智管首页"
        >
          <span class="brand-mark" aria-hidden="true">瞰</span>
          <span>
            <strong>瞰维智管</strong>
            <small>官网项目基线</small>
          </span>
        </NuxtLink>

        <nav class="main-nav" aria-label="主导航">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <NuxtLink class="button button-small" to="/demo">
          预约演示
        </NuxtLink>
      </div>
    </header>

    <main id="main-content">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div>
          <strong>瞰维智管</strong>
          <p>yizuw.org 独立官网工程</p>
        </div>
        <div class="footer-links">
          <NuxtLink to="/privacy">隐私政策</NuxtLink>
          <NuxtLink to="/demo">预约演示</NuxtLink>
        </div>
        <p class="footer-note">阶段性页面 · 未部署上线</p>
      </div>
    </footer>

  </div>
</template>
