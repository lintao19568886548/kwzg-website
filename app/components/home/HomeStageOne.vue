<script setup>
import HomeMagneticParticleField from '~/components/effects/HomeMagneticParticleField.vue'
import { siteConfig } from '~/config/site'
import { caseStudies } from '~/data/cases'
import {
  getCapability,
  managementProblems,
  operationValuePoints,
  productCapabilities,
} from '~/data/product-capabilities'

const parks = caseStudies.map(item => ({
  name: item.name,
  location: item.region,
  images: item.gallery.map(image => image.src),
}))

const aiCapability = getCapability('ai')
const technologyCapabilities = ['devices', 'access', 'security', 'hardware'].map(getCapability).filter(Boolean)
</script>

<template>
  <div class="kw-home kw-full-home">
    <section v-motion-active class="kw-home-hero kw-tech-field kw-full-hero">
      <div class="kw-home-hero__pattern" aria-hidden="true" />
      <HomeMagneticParticleField />
      <div class="kw-container kw-home-hero__grid">
        <div v-reveal class="kw-home-hero__copy">
          <UiBaseTag>面向工业园区的经营数字化管理系统</UiBaseTag>
          <h1>让园区经营，<br>从靠人盯，变成系统协同</h1>
          <p>从招商去化、租赁合同、账单回款，到设备、门禁、维修、人事和经营决策，瞰维智管把园区的人、房、客、钱、事和设备连接在同一套系统里。</p>
          <strong class="kw-full-hero__value">帮助园区提高出租率、减少空置、加快回款、降低重复工作，让老板看清经营，让团队按同一套数据和流程协同。</strong>
          <div class="kw-home-hero__actions">
            <UiBaseButton to="/demo" size="large">预约演示</UiBaseButton>
            <UiBaseButton to="/products" variant="outline" size="large">查看完整功能</UiBaseButton>
          </div>
          <ul class="kw-home-hero__facts" aria-label="产品定位">
            <li><UiLinearIcon name="monitor" :size="18" />老板一屏看经营</li>
            <li><UiLinearIcon name="network" :size="18" />团队按流程协同</li>
            <li><UiLinearIcon name="shield" :size="18" />能力状态清楚透明</li>
          </ul>
        </div>
        <HomeDashboardOverview v-reveal:right floating />
      </div>
    </section>

    <section class="kw-section kw-operation-values" aria-labelledby="operation-values-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div><span class="kw-section-kicker">围绕经营结果设计</span><h2 id="operation-values-title">不只是把 Excel 搬到线上</h2></div>
          <p>每项业务有数据、有流程、有提醒、有责任、有结果，帮助园区持续提高经营与协同效率；不对具体经营结果作绝对保证。</p>
        </div>
        <div class="kw-operation-values__grid">
          <article v-for="(item, index) in operationValuePoints" :key="item.title" v-reveal :style="{ '--kw-reveal-delay': `${index * 55}ms` }">
            <span><UiLinearIcon :name="item.icon" :size="25" /></span><small>0{{ index + 1 }}</small><h3>{{ item.title }}</h3><p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-capability-landscape-section" aria-labelledby="landscape-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div><span class="kw-section-kicker">一套系统管理全景</span><h2 id="landscape-title">从经营决策到园区服务，逐层展开</h2></div>
          <p>已上线、按项目配置、评估接入和规划中分别标注；点击状态标签可以查看含义。</p>
        </div>
        <CapabilityLandscape compact />
      </div>
    </section>

    <section class="kw-section kw-home-dashboard-proof" aria-labelledby="dashboard-proof-title">
      <div class="kw-container kw-home-dashboard-proof__grid">
        <div v-reveal><span class="kw-section-kicker">真实系统页面</span><h2 id="dashboard-proof-title">让经营信息清楚地摆在眼前</h2><p>经营总览来源于真实系统页面，官网使用演示数据重构，不复制生产截图，不展示客户经营数据。</p><ul><li>累计应收、累计实收与待收余额</li><li>在租面积、回款完成度与经营待办</li><li>合同到期、未收租、维护、报销与考勤异常</li></ul><NuxtLink class="kw-text-link" to="/products#capability-operations">查看经营驾驶舱能力 →</NuxtLink></div>
        <HomeDashboardOverview v-reveal:right />
      </div>
    </section>

    <section class="kw-section kw-business-flow-section" aria-labelledby="business-flow-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">园区经营完整闭环</span><h2 id="business-flow-title">主线、服务与组织协同各有状态</h2><p>连线用于说明模块协同关系；只有已核实或有明确配置依据的流程才作为当前能力，规划节点不会伪装成真实后台。</p></div>
        <CapabilityFlowMap />
      </div>
    </section>

    <section class="kw-section kw-full-groups" aria-labelledby="full-groups-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">完整能力矩阵</span><h2 id="full-groups-title">十二个能力板块，覆盖园区经营关键环节</h2></div><NuxtLink class="kw-text-link" to="/products">查看全部子功能 →</NuxtLink></div>
        <div class="kw-full-groups__grid">
          <article v-for="capability in productCapabilities" :key="capability.id" v-reveal>
            <header><span><UiLinearIcon :name="capability.icon" :size="24" /></span><CapabilityStatusTag :status="capability.status" compact /></header>
            <h3>{{ capability.name }}</h3><p>{{ capability.heroValue }}</p>
            <ul><li v-for="item in capability.features.slice(0, 4)" :key="item.name">{{ item.name }}</li></ul>
            <NuxtLink :to="`/products#capability-${capability.slug}`">查看详情 <span aria-hidden="true">→</span></NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-role-section" aria-labelledby="role-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">按岗位看价值</span><h2 id="role-title">让每个角色都知道该看什么、该做什么</h2></div>
        <RoleSolutionExplorer />
      </div>
    </section>

    <section class="kw-section kw-problems" aria-labelledby="problems-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--center"><span class="kw-section-kicker">九类管理问题</span><h2 id="problems-title">园区是否还在靠人盯、表格拼、微信催？</h2><p>选择符合现状的项目，结果只在当前浏览器计算，不采集、不上传，也不估算经营损失。</p></div>
        <ParkManagementCheck :questions="managementProblems" />
      </div>
    </section>

    <section class="kw-section kw-ai-suite" aria-labelledby="ai-suite-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">AI 智能增强</span><h2 id="ai-suite-title">逐项说明，不把路线图包装成已上线</h2></div><CapabilityStatusTag :status="aiCapability.status" /></div>
        <div class="kw-ai-suite__grid">
          <article v-for="item in aiCapability.features" :key="item.name" v-reveal><span><UiLinearIcon name="network" :size="21" /></span><h3>{{ item.name }}</h3><CapabilityStatusTag :status="item.status" compact /><p>{{ item.status === 'config' ? '结合房源与客户需求进行项目配置，为招商人员判断提供辅助。' : '纳入产品路线图，完成事实核验后再提供具体界面与交付边界。' }}</p></article>
        </div>
        <p class="kw-boundary-note">{{ aiCapability.boundary }}</p>
      </div>
    </section>

    <section class="kw-section kw-technology-base" aria-labelledby="technology-base-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">软硬件、安全与部署</span><h2 id="technology-base-title">先把接入条件和责任边界说清楚</h2></div>
        <div class="kw-technology-base__grid"><article v-for="item in technologyCapabilities" :key="item.id" v-reveal><div><UiLinearIcon :name="item.icon" :size="25" /><CapabilityStatusTag :status="item.status" compact /></div><h3>{{ item.name }}</h3><p>{{ item.systemAction }}</p><small>{{ item.boundary }}</small><NuxtLink :to="`/products#capability-${item.slug}`">查看状态明细 →</NuxtLink></article></div>
      </div>
    </section>

    <section class="kw-section kw-trust-section" aria-labelledby="trust-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">园区实践</span><h2 id="trust-title">真实园区，真实在用</h2></div><p>多个园区已正式使用瞰维智管；仅展示获授权园区名称与实景，不公开出租率、租金、欠费或收入等经营数据。</p></div>
        <div class="kw-park-grid"><HomeParkCard v-for="park in parks" :key="park.name" v-reveal :name="park.name" :location="park.location" :images="park.images" /></div>
      </div>
    </section>

    <section class="kw-section kw-home-service" aria-labelledby="home-service-title">
      <div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">实施服务</span><h2 id="home-service-title">从真实演示到园区实际使用</h2></div><NuxtLink class="kw-text-link" to="/service">了解实施服务 →</NuxtLink></div><ImplementationTimeline compact /></div>
    </section>

    <section class="kw-section kw-home-faq" aria-labelledby="home-faq-title">
      <div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">常见问题</span><h2 id="home-faq-title">先把能力、状态与交付边界说清楚</h2></div><NuxtLink class="kw-text-link" to="/service#faq">查看全部问题 →</NuxtLink></div><ServiceFaqAccordion :limit="4" /></div>
    </section>

    <QualificationSection mode="compact" />

    <section class="kw-final-cta" aria-labelledby="cta-title">
      <div class="kw-final-cta__pattern" aria-hidden="true" />
      <div v-reveal class="kw-container kw-final-cta__grid"><div><span class="kw-section-kicker">预约沟通</span><h2 id="cta-title">想看看哪些能力适合您的园区？</h2><p>结合园区规模、资产、岗位与当前管理方式，演示已上线能力并说明配置、接入和规划边界。</p><div class="kw-final-cta__actions"><UiBaseButton to="/demo" size="large">预约产品演示</UiBaseButton><a class="kw-final-cta__phone" :href="siteConfig.contact.phoneHref"><UiLinearIcon name="phone" :size="21" />电话咨询：{{ siteConfig.contact.phone }}</a></div></div><HomeQrPlaceholder /></div>
    </section>
  </div>
</template>
