<script setup>
const valueCards = [
  {
    title: '提高出租率，减少空置',
    text: '让空置房源、客户需求、带看跟进与合同到期进入同一条招商主线，帮助团队更早发现机会并持续推进。',
    icon: 'building',
    items: ['资产房源', '招商客户', '跟进带看', '合同到期'],
    signal: '房源 → 客户 → 带看 → 签约',
  },
  {
    title: '加快回款，减少欠费遗漏',
    text: '以合同规则驱动账单、应收、收款和核销，让待收事项及时进入经营待办，财务与业务使用同一口径。',
    icon: 'wallet',
    items: ['合同规则', '账单应收', '收款核销', '欠费跟进'],
    signal: '合同 → 账单 → 收款 → 核销',
  },
  {
    title: '一套系统协同人、房、客、钱、事和设备',
    text: '把经营总览、设备门禁、报修维护与人员协同连接起来，让管理层看清状态，让执行人员明确责任和进度。',
    icon: 'network',
    items: ['经营总览', '设备门禁', '报修维护', '人事协同'],
    signal: '数据统一 · 任务协同 · 过程留痕',
  },
]
</script>

<template>
  <section class="kw-section kw-v3-values" aria-labelledby="home-results-title">
    <div class="kw-container">
      <div v-reveal class="kw-section-heading kw-section-heading--split">
        <div><span class="kw-section-kicker">经营价值</span><h2 id="home-results-title">把园区经营的关键问题，放进一套协同系统</h2></div>
        <p>不使用未经证实的提升比例，只展示瞰维智管如何连接真实业务环节，帮助团队减少空置、加快回款并降低协同成本。</p>
      </div>
      <div class="kw-v3-values__grid">
        <article v-for="(item, index) in valueCards" :key="item.title" v-reveal>
          <header><span>0{{ index + 1 }}</span><UiLinearIcon :name="item.icon" :size="26" /></header>
          <h3>{{ item.title }}</h3><p>{{ item.text }}</p>
          <ul><li v-for="label in item.items" :key="label">{{ label }}</li></ul>
          <div class="kw-grand-value__signal"><i aria-hidden="true" /><strong>{{ item.signal }}</strong></div>
        </article>
      </div>
    </div>
  </section>
</template>
