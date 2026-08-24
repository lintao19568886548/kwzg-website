<script setup>
import { deliveryModes, productCapabilities } from '~/data/product-capabilities'

usePageSeo({
  title: '产品能力全景',
  description: '查看瞰维智管经营决策、资产招商、合同账单、设备门禁、人事审批、AI、软硬件与部署能力及其当前状态。',
})

const verifiedInterfaceGroups = productCapabilities.filter(item => item.interfaceType)
const activeInterface = ref(verifiedInterfaceGroups[0].id)
const activeCapability = computed(() => verifiedInterfaceGroups.find(item => item.id === activeInterface.value) || verifiedInterfaceGroups[0])
</script>

<template>
  <div class="kw-stage2-page kw-products-page kw-full-products">
    <section v-motion-active class="kw-stage2-hero kw-tech-field">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal><UiBaseTag>完整能力全景</UiBaseTag><h1>一套系统，管好园区经营全流程</h1><p>从经营决策、资产招商、合同账单，到设备门禁、维护人事、AI 与部署接入，每项能力都给出产品能力和交付方式。</p><div class="kw-stage2-hero__actions"><UiBaseButton to="/demo" size="large">预约完整产品演示</UiBaseButton><a class="kw-text-link" href="#capability-operations">开始查看能力</a></div></div>
        <aside v-reveal:right class="kw-stage2-hero__aside"><strong>能力已完善</strong><span v-for="meta in deliveryModes" :key="meta.id"><b>{{ meta.label }}</b>{{ meta.description }}</span></aside>
      </div>
    </section>

    <section class="kw-section kw-product-status-legend" aria-labelledby="status-legend-title">
      <div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">交付方式</span><h2 id="status-legend-title">四种清晰的交付方式</h2></div><p>交付方式说明实施边界，不代表经营结果保证；鼠标悬停、键盘聚焦或点击状态标签可查看解释。</p></div><div class="kw-product-status-legend__grid"><article v-for="meta in deliveryModes" :key="meta.id" v-reveal><CapabilityStatusTag :status="meta.id" /><p>{{ meta.description }}</p></article></div></div>
    </section>

    <nav class="kw-product-anchor-nav" aria-label="产品能力板块"><div class="kw-container"><a v-for="(capability, index) in productCapabilities" :key="capability.id" :href="`#capability-${capability.slug}`"><small>{{ String(index + 1).padStart(2, '0') }}</small>{{ capability.shortName }}</a></div></nav>

    <section class="kw-section kw-product-capability-sections" aria-labelledby="all-capabilities-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">十二个能力板块</span><h2 id="all-capabilities-title">功能、价值、关联与交付方式一次说清楚</h2></div>
        <article v-for="(capability, index) in productCapabilities" :id="`capability-${capability.slug}`" :key="capability.id" v-reveal class="kw-product-capability-section">
          <header class="kw-product-capability-section__header"><div><small>{{ String(index + 1).padStart(2, '0') }} / {{ capability.group }}</small><h2>{{ capability.name }}</h2><p>{{ capability.heroValue }}</p></div><CapabilityStatusTag :status="capability.deliveryMode" /></header>
          <div class="kw-product-capability-section__story"><section><span>客户面临的问题</span><p>{{ capability.customerProblem }}</p></section><section><span>系统如何处理</span><p>{{ capability.systemAction }}</p></section><section><span>经营与协同价值</span><p>{{ capability.businessValue }}</p></section></div>
          <div class="kw-product-capability-section__body">
            <div class="kw-product-feature-list"><h3>核心子功能与交付方式</h3><div><article v-for="feature in capability.features" :key="feature.name"><strong>{{ feature.name }}</strong><CapabilityStatusTag :status="feature.deliveryMode" compact /><small v-if="feature.boundary">{{ feature.boundary }}</small></article></div></div>
            <aside class="kw-product-capability-section__meta"><div><span>适用岗位</span><ul><li v-for="role in capability.roles" :key="role">{{ role }}</li></ul></div><div><span>关联模块</span><ul><li v-for="related in capability.relatedCapabilities" :key="related">{{ productCapabilities.find(item => item.id === related)?.shortName }}</li></ul></div><p>{{ capability.boundary }}</p><UiBaseButton :to="capability.cta.to">{{ capability.cta.label }}</UiBaseButton></aside>
          </div>

          <div v-if="capability.interfaceType" class="kw-product-capability-section__proof">
            <div><span>真实页面视觉优化展示</span><p>界面来自已保存的真实系统页面证据，并使用演示数据重构；具体界面以实际交付版本为准。</p></div>
            <HomeDashboardOverview v-if="capability.interfaceType === 'overview'" />
            <HomeInterfacePreview v-else :type="capability.interfaceType" :title="capability.name" />
            <HomeInterfacePreview v-if="capability.id === 'leasing-crm'" type="followup" title="客户详情" />
          </div>
          <div v-else class="kw-product-capability-section__concept">
            <div><UiLinearIcon :name="capability.icon" :size="30" /><span>能力关系示意</span><CapabilityStatusTag :status="capability.deliveryMode" compact /></div><p>本区只展示能力名称、协同关系和交付方式，不制作成看似真实的后台页面。</p><ol><li v-for="item in capability.features.slice(0, 5)" :key="item.name"><span>{{ item.name }}</span><CapabilityStatusTag :status="item.deliveryMode" compact /></li></ol>
          </div>
        </article>
      </div>
    </section>

    <section class="kw-section kw-product-browser" aria-labelledby="verified-interface-title">
      <div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">真实系统界面组</span><h2 id="verified-interface-title">选择一个已经有页面证据的界面</h2></div><p>切换只改变官网演示内容，不代表生产系统数据实时变化。</p></div>
        <div v-reveal class="kw-product-tabs" role="tablist" aria-label="真实页面展示"><button v-for="(item, index) in verifiedInterfaceGroups" :id="`product-tab-${item.id}`" :key="item.id" type="button" role="tab" :aria-selected="activeInterface === item.id" :aria-controls="`product-panel-${item.id}`" :class="{ 'is-active': activeInterface === item.id }" @click="activeInterface = item.id"><small>{{ String(index + 1).padStart(2, '0') }}</small><span>{{ item.shortName }}</span></button></div>
        <Transition name="kw-product-panel" mode="out-in"><article :id="`product-panel-${activeCapability.id}`" :key="activeCapability.id" class="kw-product-panel" role="tabpanel" :aria-labelledby="`product-tab-${activeCapability.id}`"><div class="kw-product-panel__copy"><span>{{ activeCapability.sourceReference }}</span><h2>{{ activeCapability.name }}</h2><p>{{ activeCapability.systemAction }}</p><small class="kw-product-panel__boundary">{{ activeCapability.boundary }}</small><NuxtLink to="/demo" class="kw-text-link">预约查看真实系统演示 →</NuxtLink></div><HomeDashboardOverview v-if="activeCapability.interfaceType === 'overview'" /><HomeInterfacePreview v-else :type="activeCapability.interfaceType" :title="activeCapability.name" /></article></Transition>
      </div>
    </section>
  </div>
</template>
