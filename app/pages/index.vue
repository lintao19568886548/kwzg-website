<script setup>
usePageSeo({
  title: '首页',
  description: '瞰维智管官方网站项目基线临时首页，用于验证路由、构建与响应式访问。',
})

const routeChecks = [
  { label: '产品能力', to: '/products' },
  { label: '解决方案', to: '/solutions' },
  { label: '客户案例', to: '/cases' },
  { label: '关于我们', to: '/about' },
  { label: '预约演示', to: '/demo' },
  { label: '隐私政策', to: '/privacy' },
]
</script>

<template>
  <div>
    <section class="temporary-hero">
      <div class="container hero-grid">
        <div>
          <p class="eyebrow">yizuw.org · Stage 0</p>
          <h1>瞰维智管<br>官网工程已就绪</h1>
          <p class="hero-copy">
            此页面仅用于验证独立官网项目的运行、路由和响应式基线，不代表最终视觉设计或正式网站文案。
          </p>
          <div class="hero-actions">
            <NuxtLink class="button" to="/products">检查页面路由</NuxtLink>
            <NuxtLink class="text-link" to="/about">查看项目说明</NuxtLink>
          </div>
        </div>

        <aside class="status-panel" aria-label="项目状态">
          <p class="status-label">当前状态</p>
          <strong>独立官网基线</strong>
          <ul>
            <li><span aria-hidden="true">✓</span> Nuxt + JavaScript</li>
            <li><span aria-hidden="true">✓</span> 七个页面路由</li>
            <li><span aria-hidden="true">✓</span> 响应式页面骨架</li>
            <li><span aria-hidden="true">✓</span> 默认禁止搜索引擎收录</li>
          </ul>
          <p class="status-footnote">未连接生产系统 · 未部署</p>
        </aside>
      </div>
    </section>

    <section class="route-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Route baseline</p>
          <h2>页面路由骨架</h2>
          <p>以下入口用于阶段验收，正式内容将在后续阶段完成。</p>
        </div>
        <div class="route-grid">
          <NuxtLink
            v-for="item in routeChecks"
            :key="item.to"
            class="route-card"
            :to="item.to"
          >
            <span>{{ item.label }}</span>
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
