<script setup>
import { caseStudies } from '~/data/cases'

usePageSeo({
  title: '客户案例',
  description: '查看多个真实园区的瞰维智管使用案例；内容基于已授权园区名称、实景图片及已核实功能整理，不披露客户经营数据。',
})

const activeRegion = ref('全部案例')
const filteredCases = computed(() => activeRegion.value === '全部案例'
  ? caseStudies
  : caseStudies.filter(item => item.region === activeRegion.value))
</script>

<template>
  <div class="kw-stage2-page kw-cases-page">
    <section class="kw-stage2-hero kw-cases-hero">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal>
          <h1>客户案例</h1>
          <p class="kw-cases-hero__lead">来自真实园区的数字化管理实践</p>
          <p class="kw-cases-hero__notice">案例内容基于已授权园区名称、实景图片及瞰维智管已核实功能整理，不披露出租率、租金、欠费、收入或租户经营信息。</p>
        </div>
        <aside v-reveal:right class="kw-case-fact">
          <strong>公开原则</strong><span>多个授权园区案例</span><span>已核实系统功能</span><span>零经营数据披露</span>
        </aside>
      </div>
    </section>

    <section class="kw-section kw-case-index" aria-labelledby="case-list-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div><span class="kw-section-kicker">园区实践</span><h2 id="case-list-title">从真实园区，看清管理场景</h2></div>
          <p>按地区筛选案例，进入详情查看园区实景、管理场景与对应的真实系统页面。</p>
        </div>

        <CasesCaseFilter v-model="activeRegion" v-reveal />
        <p class="kw-case-result-count" aria-live="polite">当前显示 {{ filteredCases.length }} 个案例</p>

        <TransitionGroup name="kw-case-list" tag="div" class="kw-case-grid">
          <CasesCaseCard
            v-for="(item, index) in filteredCases"
            :key="item.slug"
            v-reveal
            :item="item"
            :style="{ '--kw-reveal-delay': `${(index % 3) * 80}ms` }"
          />
        </TransitionGroup>
      </div>
    </section>

    <section v-reveal class="kw-container kw-case-index-cta" aria-labelledby="case-index-cta-title">
      <div><span>了解产品</span><h2 id="case-index-cta-title">从案例出发，看看哪些管理页面适合你的园区</h2></div>
      <UiBaseButton to="/demo">预约同类园区演示 <span aria-hidden="true">→</span></UiBaseButton>
    </section>
  </div>
</template>
