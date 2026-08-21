<script setup>
usePageSeo({
  title: '解决方案',
  description: '瞰维智管围绕老板经营看数、招商客户跟进、合同账单管理与园区报修协同组织真实解决方案。',
})

const scenes = [
  { number: '01', title: '老板经营看数', audience: '民营产业园老板与股东', description: '从园区经营总览查看累计应收、累计实收、待收余额、在租面积和待办事项。', source: '园区经营总览' },
  { number: '02', title: '招商客户跟进', audience: '工业园区与厂房招商团队', description: '通过招商客户列表掌握阶段和跟进时间，再进入客户详情查看需求与跟进记录。', source: '招商客户＋客户详情' },
  { number: '03', title: '合同与账单管理', audience: '园区经营与财务协同人员', description: '合同管理和账单管理保持独立口径，分别核对合同状态与账单收款状态。', source: '合同管理＋账单管理' },
  { number: '04', title: '园区报修协同', audience: '工业园区、厂房与仓库', description: '在报修工单台账中按真实筛选项查看待处理、进行中与已完成状态。', source: '报修工单' },
]
</script>

<template>
  <div class="kw-stage2-page kw-solutions-page">
    <section v-motion-active class="kw-stage2-hero kw-tech-field kw-solutions-hero">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal>
          <UiBaseTag>Solutions</UiBaseTag>
          <h1>从真实经营场景出发，<br>让信息各归其位</h1>
          <p>面向民营产业园老板、工业园区、厂房和仓库，以已核实系统页面回应看数、招商、合同账单和报修协同。</p>
        </div>
        <div v-reveal:right class="kw-solution-orbit" aria-hidden="true">
          <span>经营</span><i /><span>招商</span><i /><span>台账</span><i /><span>报修</span>
        </div>
      </div>
    </section>

    <section class="kw-section" aria-labelledby="solution-scenes-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">四个真实场景</span><h2 id="solution-scenes-title">管理问题不同，页面边界也不同</h2><p>场景之间的连接表示管理者的阅读路径，不代表系统存在未经核实的自动流程。</p>
        </div>
        <div class="kw-solution-path">
          <article v-for="(scene, index) in scenes" :key="scene.number" v-reveal :style="{ '--kw-reveal-delay': `${index * 80}ms` }" class="kw-stage2-card kw-solution-card">
            <span>{{ scene.number }}</span><small>{{ scene.audience }}</small><h2>{{ scene.title }}</h2><p>{{ scene.description }}</p><strong>来源：{{ scene.source }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-solution-goal">
      <div v-reveal class="kw-container kw-solution-goal__inner">
        <div><span class="kw-section-kicker">产品目标</span><h2>帮助团队更早看清信息，减少空置管理中的盲区</h2><p>“提高出租率、减少空置”是产品努力方向，不构成具体比例或必然经营结果承诺。</p></div>
        <UiBaseButton to="/demo" size="large">结合园区预约演示</UiBaseButton>
      </div>
    </section>
  </div>
</template>
