<script setup>
import { getVerifiedCapability, verifiedCapabilities } from '~/data/verified-capabilities'

usePageSeo({
  title: '产品能力',
  description: '了解瞰维智管已经完成页面溯源的园区经营总览、招商客户、客户详情、合同管理、账单管理与报修工单。',
})

const publicModules = verifiedCapabilities.map(capability => ({
  key: capability.id,
  label: capability.title,
  icon: capability.icon,
  group: '已核实能力',
  pageVerified: true,
  summary: capability.value,
}))

const capabilities = [
  { id: 'overview', title: '园区经营总览', type: 'overview', summary: '汇总累计应收、累计实收、待收余额、在租面积与待办事项。', source: '工作台 > 运营总览' },
  { id: 'leasing', title: '招商客户', type: 'leasing-list', summary: '按园区、招商阶段和负责人查看客户列表与跟进时间。', source: '招商管理 > 招商客户' },
  { id: 'followup', title: '客户详情', type: 'followup', summary: '查看单个客户需求、招商阶段、推荐区域与已有跟进记录。', source: '招商管理 > 招商客户 > 客户详情' },
  { id: 'contract', title: '合同管理', type: 'contract', summary: '按园区、交易类型和合同状态查看合同台账。', source: '租赁 > 合同管理' },
  { id: 'bill', title: '账单管理', type: 'bill', summary: '查看应收、实收、未收与真实收款状态口径。', source: '财务 > 账单管理' },
  { id: 'repair', title: '报修工单', type: 'repair', summary: '按编号、园区、厂房或报修内容查看工单状态。', source: '维护管理 > 报修工单' },
]

const activeId = ref(capabilities[0].id)
const activeCapability = computed(() => capabilities.find(item => item.id === activeId.value) || capabilities[0])
const activeDetail = computed(() => getVerifiedCapability(activeId.value))
</script>

<template>
  <div class="kw-stage2-page kw-products-page">
    <section v-motion-active class="kw-stage2-hero kw-tech-field">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal>
          <UiBaseTag>已核实能力</UiBaseTag>
          <h1>围绕园区经营核心场景的六项已上线能力</h1>
          <p>以下界面均根据瞰维智管实际系统功能整理并进行视觉优化，展示数据为演示数据。</p>
        </div>
        <aside v-reveal:right class="kw-stage2-hero__aside">
          <strong>真实性边界</strong>
          <span>6 项已核实页面能力</span>
          <span>0 张生产系统截图</span>
          <span>演示数据，不使用客户经营数据</span>
        </aside>
      </div>
    </section>

    <section class="kw-section kw-product-modules" aria-labelledby="product-modules-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div>
            <span class="kw-section-kicker">系统模块</span>
            <h2 id="product-modules-title">六项公开能力，每项都有直接页面证据</h2>
          </div>
          <p>其他菜单即使真实存在，在完成页面字段、按钮和状态溯源前也不作为成熟能力公开。</p>
        </div>
        <div class="kw-product-module-grid" aria-label="瞰维智管六项已核实能力">
          <article
            v-for="(module, index) in publicModules"
            :key="module.key"
            v-reveal
            class="kw-product-module-card"
            :class="{ 'has-verified-page': module.pageVerified }"
          >
            <div class="kw-product-module-card__top">
              <span class="kw-product-module-card__icon">
                <UiLinearIcon :name="module.icon" :size="24" />
              </span>
              <small>{{ String(index + 1).padStart(2, '0') }}</small>
            </div>
            <span class="kw-product-module-card__group">{{ module.group }}</span>
            <h3>{{ module.label }}</h3>
            <p>{{ module.summary }}</p>
            <em>页面已核实</em>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-product-browser" aria-labelledby="product-browser-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading kw-section-heading--split">
          <div><span class="kw-section-kicker">已核实页面</span><h2 id="product-browser-title">选择一个真实系统页面</h2></div>
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
              <dl v-if="activeDetail" class="kw-product-panel__details">
                <div><dt>业务场景</dt><dd>{{ activeDetail.scenario }}</dd></div>
                <div><dt>系统中可查看</dt><dd>{{ activeDetail.canView.join('、') }}</dd></div>
                <div><dt>使用方式</dt><dd>{{ activeDetail.usage }}</dd></div>
                <div><dt>管理作用</dt><dd>{{ activeDetail.value }}</dd></div>
              </dl>
              <small v-if="activeDetail" class="kw-product-panel__boundary">{{ activeDetail.boundary }}</small>
              <NuxtLink to="/demo" class="kw-text-link">预约查看产品演示 <span aria-hidden="true">→</span></NuxtLink>
            </div>
            <HomeDashboardOverview v-if="activeCapability.type === 'overview'" />
            <HomeInterfacePreview v-else :type="activeCapability.type" :title="activeCapability.title" />
          </article>
        </Transition>
      </div>
    </section>

    <section class="kw-section kw-product-ai" aria-labelledby="ai-capability-title">
      <div v-reveal class="kw-container kw-product-ai__card">
        <UiBaseTag>规划中</UiBaseTag>
        <div><span class="kw-section-kicker">规划能力隔离区</span><h2 id="ai-capability-title">AI招商匹配 · 规划中</h2><p>计划基于园区房源和招商客户需求提供辅助匹配，最终判断由工作人员完成。规划方向不代表当前已经交付，不放模拟系统截图，也不承诺上线日期。</p></div>
      </div>
    </section>
  </div>
</template>
