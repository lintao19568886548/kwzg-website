<script setup>
import HomeMagneticParticleField from '~/components/effects/HomeMagneticParticleField.vue'
import { siteConfig } from '~/config/site'
import { caseStudies } from '~/data/cases'
import { capabilityFeatureIndex, homeCapabilityDomains } from '~/data/product-capabilities'

const capabilityDrawerOpen = ref(false)
const parks = caseStudies.map(item => ({ slug: item.slug, name: item.name, location: item.region, images: item.gallery.map(image => image.src) }))
</script>

<template>
  <div class="kw-home kw-home-v3">
    <section v-motion-active class="kw-home-hero kw-tech-field kw-v3-hero" aria-labelledby="grand-hero-title">
      <div class="kw-home-hero__pattern" aria-hidden="true" />
      <div class="kw-grand-hero__trace" aria-hidden="true" />
      <HomeMagneticParticleField />
      <div class="kw-container kw-home-hero__grid">
        <div v-reveal class="kw-home-hero__copy">
          <UiBaseTag>面向工业园区、厂房与仓库的经营数字化系统</UiBaseTag>
          <h1 id="grand-hero-title">让园区经营，<br>从靠人盯，<br>变成系统协同</h1>
          <p>贯通招商、租赁、合同、账单、收款、设备、门禁、维护、人事与经营决策，让园区经营状态清楚、任务协同、风险及时发现。</p>
          <div class="kw-home-hero__actions"><UiBaseButton to="/demo" size="large">预约演示</UiBaseButton><a class="kw-v3-outline-button" href="#home-capabilities">查看完整能力</a></div>
        </div>
        <HomeDashboardOverview v-reveal:right floating show-all-modules />
      </div>
    </section>

    <HomeCapabilityProofRail />
    <HomeBusinessValue />
    <HomeCapabilityArchitecture />
    <HomeBusinessLoops />
    <HomeCapabilityPanorama @open-all="capabilityDrawerOpen = true" />
    <HomeSystemModuleShowcase />

    <section class="kw-section kw-v3-all-capabilities" aria-labelledby="all-capabilities-title"><div v-reveal class="kw-container"><div><span class="kw-section-kicker">完整能力查看器</span><h2 id="all-capabilities-title">{{ capabilityFeatureIndex.length }} 项能力，按七大能力域清晰查看</h2><p>支持关键词、岗位与交付方式筛选；功能数量从统一数据源实时计算，不在页面中重复写死。</p></div><div><strong>{{ homeCapabilityDomains.length }}</strong><span>能力域</span><button class="kw-v3-outline-button" type="button" @click="capabilityDrawerOpen = true">打开完整能力清单</button></div></div></section>

    <HomeRoleSolutions />
    <HomeAiCapabilities />
    <HomeTechnologyFoundation />

    <section class="kw-section kw-trust-section kw-grand-cases" aria-labelledby="trust-title"><div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">园区实践</span><h2 id="trust-title">真实园区，真实在用</h2></div><p>多个园区已正式使用瞰维智管；仅展示获授权园区名称与实景，不公开出租率、租金、欠费或收入等经营数据。</p></div><div class="kw-park-grid"><HomeParkCard v-for="park in parks" :key="park.name" v-reveal :to="`/cases/${park.slug}`" :name="park.name" :location="park.location" :images="park.images" /></div></div></section>
    <QualificationSection mode="compact" />
    <section class="kw-section kw-home-service" aria-labelledby="home-service-title"><div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">实施服务</span><h2 id="home-service-title">从真实演示到园区实际使用</h2></div><NuxtLink class="kw-text-link" to="/service">了解实施服务 →</NuxtLink></div><ImplementationTimeline compact /></div></section>
    <section class="kw-section kw-home-faq" aria-labelledby="home-faq-title"><div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">常见问题</span><h2 id="home-faq-title">把能力、交付方式与数据边界说清楚</h2></div><NuxtLink class="kw-text-link" to="/service#faq">查看全部问题 →</NuxtLink></div><ServiceFaqAccordion :limit="4" /></div></section>

    <section class="kw-final-cta" aria-labelledby="cta-title"><div class="kw-final-cta__pattern" aria-hidden="true" /><div v-reveal class="kw-container kw-final-cta__grid"><div><span class="kw-section-kicker">预约沟通</span><h2 id="cta-title">让我们结合您的园区，演示完整经营闭环</h2><p>从招商到回款，从设备到服务，从人员到决策，按实际业务、设备与部署条件说明启用方式。</p><div class="kw-final-cta__actions"><UiBaseButton to="/demo" size="large">预约产品演示</UiBaseButton><a class="kw-final-cta__phone" :href="siteConfig.contact.phoneHref"><UiLinearIcon name="phone" :size="21" />电话咨询：{{ siteConfig.contact.phone }}</a></div></div><HomeQrPlaceholder /></div></section>
    <HomeCapabilityDrawer :open="capabilityDrawerOpen" @close="capabilityDrawerOpen = false" />
  </div>
</template>
