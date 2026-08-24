<script setup>
import HomeMagneticParticleField from '~/components/effects/HomeMagneticParticleField.vue'
import { siteConfig } from '~/config/site'
import { caseStudies } from '~/data/cases'
import { capabilityFeatureIndex, homeCapabilityDomains } from '~/data/product-capabilities'

const capabilityDrawerOpen = ref(false)
const parks = caseStudies.map(item => ({ name: item.name, location: item.region, images: item.gallery.map(image => image.src) }))
</script>

<template>
  <div class="kw-home kw-home-v3">
    <section v-motion-active class="kw-home-hero kw-tech-field kw-v3-hero">
      <div class="kw-home-hero__pattern" aria-hidden="true" /><HomeMagneticParticleField />
      <div class="kw-container kw-home-hero__grid">
        <div v-reveal class="kw-home-hero__copy">
          <UiBaseTag>面向工业园区的经营数字化管理系统</UiBaseTag>
          <h1>让园区经营，<br>从靠人盯，变成系统协同</h1>
          <p>从招商去化、租赁合同、账单回款，到设备、门禁、维修、人事和经营决策，瞰维智管把园区的人、房、客、钱、事和设备连接在同一套系统里。</p>
          <strong class="kw-v3-hero__value">帮助园区提高出租率、减少空置、加快回款、降低管理成本、提升团队效率，让老板看清经营，让每项工作有人负责、有进度、有结果。</strong>
          <div class="kw-home-hero__actions"><UiBaseButton to="/demo" size="large">预约演示</UiBaseButton><a class="kw-v3-outline-button" href="#home-capabilities">查看完整能力</a></div>
          <p class="kw-v3-hero__promise">让招商、合同、收费、物业、设备、人事与经营决策，在一套系统中真正协同。</p>
        </div>
        <HomeDashboardOverview v-reveal:right floating show-all-modules />
      </div>
    </section>

    <section class="kw-v3-principle"><div v-reveal class="kw-container"><span>不是增加更多人，也不是简单把表格搬到线上</span><p>让现有团队少做重复工作，让每一项业务有记录、有提醒、有责任、有结果。</p></div></section>
    <HomeBusinessValue />
    <HomeCapabilityArchitecture />
    <HomeBusinessLoops />
    <HomeCapabilityPanorama @open-all="capabilityDrawerOpen = true" />
    <HomeSystemModuleShowcase />

    <section class="kw-section kw-v3-all-capabilities" aria-labelledby="all-capabilities-title"><div v-reveal class="kw-container"><div><span class="kw-section-kicker">完整能力查看器</span><h2 id="all-capabilities-title">{{ capabilityFeatureIndex.length }} 项能力，按七大能力域清晰查看</h2><p>支持关键词、岗位与交付方式筛选；功能数量从统一数据源实时计算，不在页面中重复写死。</p></div><div><strong>{{ homeCapabilityDomains.length }}</strong><span>能力域</span><button class="kw-v3-outline-button" type="button" @click="capabilityDrawerOpen = true">打开完整能力清单</button></div></div></section>

    <HomeRoleSolutions />
    <HomeAiCapabilities />
    <HomeTechnologyFoundation />

    <section class="kw-section kw-trust-section" aria-labelledby="trust-title"><div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">园区实践</span><h2 id="trust-title">真实园区，真实在用</h2></div><p>多个园区已正式使用瞰维智管；仅展示获授权园区名称与实景，不公开出租率、租金、欠费或收入等经营数据。</p></div><div class="kw-park-grid"><HomeParkCard v-for="park in parks" :key="park.name" v-reveal :name="park.name" :location="park.location" :images="park.images" /></div></div></section>
    <section class="kw-section kw-home-service" aria-labelledby="home-service-title"><div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">实施服务</span><h2 id="home-service-title">从真实演示到园区实际使用</h2></div><NuxtLink class="kw-text-link" to="/service">了解实施服务 →</NuxtLink></div><ImplementationTimeline compact /></div></section>
    <section class="kw-section kw-home-faq" aria-labelledby="home-faq-title"><div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">常见问题</span><h2 id="home-faq-title">把能力、交付方式与数据边界说清楚</h2></div><NuxtLink class="kw-text-link" to="/service#faq">查看全部问题 →</NuxtLink></div><ServiceFaqAccordion :limit="4" /></div></section>
    <QualificationSection mode="compact" />

    <section class="kw-final-cta" aria-labelledby="cta-title"><div class="kw-final-cta__pattern" aria-hidden="true" /><div v-reveal class="kw-container kw-final-cta__grid"><div><span class="kw-section-kicker">预约沟通</span><h2 id="cta-title">让我们结合您的园区，演示完整经营闭环</h2><p>从招商到回款，从设备到服务，从人员到决策，按实际业务、设备与部署条件说明启用方式。</p><div class="kw-final-cta__actions"><UiBaseButton to="/demo" size="large">预约产品演示</UiBaseButton><a class="kw-final-cta__phone" :href="siteConfig.contact.phoneHref"><UiLinearIcon name="phone" :size="21" />电话咨询：{{ siteConfig.contact.phone }}</a></div></div><HomeQrPlaceholder /></div></section>
    <HomeCapabilityDrawer :open="capabilityDrawerOpen" @close="capabilityDrawerOpen = false" />
  </div>
</template>
