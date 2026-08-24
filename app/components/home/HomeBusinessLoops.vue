<script setup>
const grandLoops = [
  { id: 'leasing', name: '招商签约闭环', description: '让客户推进过程连续可追踪。', steps: ['招商', '带看', '报价', '签约'] },
  { id: 'finance', name: '合同回款闭环', description: '让合同规则与回款状态使用同一口径。', steps: ['合同', '账单', '收款', '核销'] },
  { id: 'service', name: '园区服务闭环', description: '让服务事项有人负责、有进度、有结果。', steps: ['报修', '派单', '处理', '验收'] },
]
</script>

<template>
  <section class="kw-section kw-v3-loops" aria-labelledby="loops-title">
    <div class="kw-container">
      <div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">三条业务闭环</span><h2 id="loops-title">让每项工作，有记录、有提醒、有责任、有结果</h2></div><p>闭环只说明已经确认的产品模块之间如何协同，不展示虚构系统数据或自动化结果。</p></div>
      <div class="kw-grand-loops">
        <article v-for="flow in grandLoops" :key="flow.id" v-reveal class="kw-v3-loops__panel">
          <header><span>{{ flow.name }}</span><p>{{ flow.description }}</p></header>
          <ol><li v-for="(step, index) in flow.steps" :key="step"><div :class="{ 'is-current': index === 0 }"><small>{{ String(index + 1).padStart(2, '0') }}</small><strong>{{ step }}</strong></div></li></ol>
        </article>
      </div>
    </div>
  </section>
</template>
