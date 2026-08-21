<script setup>
usePageSeo({
  title: '产品能力',
  description: '了解瞰维智管已经完成真实系统界面溯源的经营总览、招商客户、客户详情、合同、账单与报修工单，以及已确认的 AI 招商匹配能力。',
})

const capabilities = [
  { id: 'overview', title: '园区经营总览', type: 'overview', summary: '汇总累计应收、累计实收、待收余额、在租面积与待办事项。', source: '工作台 > 运营总览' },
  { id: 'leasing', title: '招商客户', type: 'leasing-list', summary: '按园区、招商阶段和负责人查看客户列表与跟进时间。', source: '招商管理 > 招商客户' },
  { id: 'followup', title: '客户详情与跟进', type: 'followup', summary: '查看单个客户需求、招商阶段、推荐区与跟进记录。', source: '招商管理 > 招商客户 > 客户详情' },
  { id: 'contract', title: '合同管理', type: 'contract', summary: '按园区、交易类型和合同状态查看合同台账。', source: '租赁 > 合同管理' },
  { id: 'bill', title: '账单管理', type: 'bill', summary: '查看应收、实收、未收与真实收款状态口径。', source: '财务 > 账单管理' },
  { id: 'repair', title: '报修工单', type: 'repair', summary: '按编号、园区、厂房或报修内容查看工单状态。', source: '维护管理 > 报修工单' },
]

const activeId = ref(capabilities[0].id)
const activeCapability = computed(() => capabilities.find(item => item.id === activeId.value) || capabilities[0])
</script>

<template>
  <div class="kw-stage2-page kw-products-page">
    <section v-motion-active class="kw-stage2-hero kw-tech-field">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal>
          <UiBaseTag>Product capabilities</UiBaseTag>
          <h1>六个真实页面来源，<br>组成清晰的园区管理视角</h1>
          <p>每个展示面板只对应一个已经完成本地截图溯源的系统页面。视觉可以更清楚，功能边界不能被改变。</p>
        </div>
        <aside v-reveal:right class="kw-stage2-hero__aside">
          <strong>真实性边界</strong>
          <span>6 项已核实能力</span>
          <span>0 张生产系统截图</span>
          <span>演示数据，不使用客户经营数据</span>
        </aside>
      </div>
    </section>

    <section class="kw-section kw-product-browser" aria-labelledby="product-browser-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div><span class="kw-section-kicker">已核实功能</span><h2 id="product-browser-title">选择一个真实系统页面</h2></div>
          <p>切换只改变官网展示内容，不代表系统数据正在实时变化。</p>
        </div>
        <div v-reveal class="kw-product-tabs" role="tablist" aria-label="产品能力">
          <button v-for="(item, index) in capabilities" :id="`product-tab-${item.id}`" :key="item.id" type="button" role="tab" :aria-selected="activeId === item.id" :aria-controls="`product-panel-${item.id}`" :class="{ 'is-active': activeId === item.id }" @click="activeId = item.id">
            <small>0{{ index + 1 }}</small><span>{{ item.title }}</span>
          </button>
        </div>
        <Transition name="kw-product-panel" mode="out-in">
          <article :id="`product-panel-${activeCapability.id}`" :key="activeCapability.id" class="kw-product-panel" role="tabpanel" :aria-labelledby="`product-tab-${activeCapability.id}`">
            <div class="kw-product-panel__copy">
              <span>{{ activeCapability.source }}</span><h2>{{ activeCapability.title }}</h2><p>{{ activeCapability.summary }}</p>
              <NuxtLink to="/demo" class="kw-text-link">预约查看产品演示 <span aria-hidden="true">→</span></NuxtLink>
            </div>
            <HomeDashboardOverview v-if="activeCapability.type === 'overview'" />
            <HomeInterfacePreview v-else :type="activeCapability.type" :title="activeCapability.title" />
          </article>
        </Transition>
        <p class="kw-source-statement">本界面基于瞰维智管现有功能进行视觉优化展示，使用演示数据，具体界面以实际交付版本为准。</p>
      </div>
    </section>

    <section class="kw-section kw-product-ai" aria-labelledby="ai-capability-title">
      <div v-reveal class="kw-container kw-product-ai__card">
        <UiBaseTag>现有能力</UiBaseTag>
        <div><span class="kw-section-kicker">智能招商能力</span><h2 id="ai-capability-title">AI 招商匹配</h2><p>瞰维智管已具备 AI 招商匹配能力，为园区招商工作提供智能匹配辅助。当前仅作能力介绍，不展示未经界面溯源核实的字段、按钮或匹配结果。</p></div>
      </div>
    </section>
  </div>
</template>
