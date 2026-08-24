<script setup>
import { getCapability, parkTypeSolutions } from '~/data/product-capabilities'

usePageSeo({
  title: '园区解决方案',
  description: '按工业园区、厂房、仓库、产业园、物流园、写字楼和多园区经营场景，以及老板、招商、财务、物业工程和人事角色查看瞰维智管方案。',
})

const activePark = ref(parkTypeSolutions[0].name)
const park = computed(() => parkTypeSolutions.find(item => item.name === activePark.value) || parkTypeSolutions[0])
const parkCapabilities = computed(() => park.value.capabilities.map(getCapability).filter(Boolean))
</script>

<template>
  <div class="kw-stage2-page kw-solutions-page kw-full-solutions">
    <section v-motion-active class="kw-stage2-hero kw-tech-field kw-solutions-hero">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal><UiBaseTag>园区类型＋岗位角色</UiBaseTag><h1>让不同园区、不同岗位，都找到自己的经营路径</h1><p>不是把功能简单堆在一起，而是按资产场景、使用角色和项目状态组织招商、合同、回款、服务、设备与组织协同。</p><div class="kw-stage2-hero__actions"><UiBaseButton to="/demo" size="large">预约场景化演示</UiBaseButton><UiBaseButton to="/products" variant="outline" size="large">查看完整功能</UiBaseButton></div></div>
        <div v-reveal:right class="kw-solution-orbit" aria-hidden="true"><span>人</span><i /><span>房</span><i /><span>钱</span><i /><span>事</span><i /><span>设备</span></div>
      </div>
    </section>

    <section class="kw-section kw-park-type-solutions" aria-labelledby="park-type-title">
      <div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">按园区类型</span><h2 id="park-type-title">从资产与经营场景出发</h2></div><p>适用范围随资产结构、岗位、资料和软硬件条件确认；不会把仓库经营扩写为库存物流系统。</p></div>
        <div class="kw-park-type-solutions__tabs" role="tablist" aria-label="园区类型"><button v-for="item in parkTypeSolutions" :key="item.name" type="button" role="tab" :aria-selected="activePark === item.name" :class="{ 'is-active': activePark === item.name }" @click="activePark = item.name">{{ item.name }}</button></div>
        <Transition name="kw-product-panel" mode="out-in"><section :key="park.name" class="kw-park-type-solutions__panel" role="tabpanel"><header><span>场景方案</span><h3>{{ park.name }}</h3><p>{{ park.text }}</p></header><div><article v-for="capability in parkCapabilities" :key="capability.id"><div><UiLinearIcon :name="capability.icon" :size="22" /><h4>{{ capability.shortName }}</h4></div><CapabilityStatusTag :status="capability.deliveryMode" compact /><p>{{ capability.businessValue }}</p><NuxtLink :to="`/products#capability-${capability.slug}`">查看能力 →</NuxtLink></article></div></section></Transition>
      </div>
    </section>

    <section class="kw-section kw-role-section" aria-labelledby="role-solution-title"><div class="kw-container"><div v-reveal class="kw-section-heading"><span class="kw-section-kicker">按岗位角色</span><h2 id="role-solution-title">同一套系统，让不同团队围绕同一经营目标协同</h2><p>每个角色只展示已经完善并可按标准、配置、接入或云端私有化部署方式交付的能力。</p></div><RoleSolutionExplorer /></div></section>

    <section class="kw-section kw-solution-flow" aria-labelledby="solution-flow-title"><div class="kw-container"><div v-reveal class="kw-section-heading"><span class="kw-section-kicker">跨模块协同</span><h2 id="solution-flow-title">从招商到回款，从设备到服务，从人员到决策</h2></div><CapabilityFlowMap /></div></section>

    <section class="kw-section kw-solution-deployment" aria-labelledby="solution-deployment-title"><div class="kw-container"><div v-reveal class="kw-section-heading"><span class="kw-section-kicker">部署与接入</span><h2 id="solution-deployment-title">SaaS、云端私有化部署与软硬件边界分别确认</h2><p>SaaS 是当前系统使用形态；云端私有化部署、指定服务器和数据库、设备与第三方接口均需结合项目条件评估。</p></div><DeploymentBoundary /><div class="kw-solution-deployment__links"><NuxtLink to="/products#capability-security">查看权限与部署状态 →</NuxtLink><NuxtLink to="/products#capability-hardware">查看软硬件接入状态 →</NuxtLink></div></div></section>

    <section class="kw-section kw-solution-goal"><div v-reveal class="kw-container kw-solution-goal__inner"><div><span class="kw-section-kicker">经营价值边界</span><h2>帮助提高出租率、加快回款、降低遗漏与重复工作</h2><p>系统提供数据、流程、提醒与责任依据，但不保证具体出租率、付款或成本结果。</p></div><div class="kw-solution-goal__actions"><UiBaseButton to="/cases" variant="outline" size="large">查看客户案例</UiBaseButton><UiBaseButton to="/demo" size="large">结合园区预约演示</UiBaseButton></div></div></section>
  </div>
</template>
