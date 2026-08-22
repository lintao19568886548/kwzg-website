<script setup>
usePageSeo({
  title: '解决方案',
  description: '瞰维智管围绕老板经营看数、招商客户跟进、合同账单管理与园区报修协同组织真实解决方案。',
})

const scenes = [
  { number: '01', title: '老板 / 股东', audience: '管理层视角', description: '从园区经营总览查看已经核实的重点经营信息，不把官网演示数值当作实际经营数据。', source: '园区经营总览' },
  { number: '02', title: '招商人员', audience: '客户管理视角', description: '通过招商客户列表查看分类和阶段，再进入客户详情核对需求与已有跟进记录。', source: '招商客户＋客户详情' },
  { number: '03', title: '园区管理人员', audience: '合同台账视角', description: '在合同管理页面按真实筛选条件查询合同主体、状态与到期信息。', source: '合同管理' },
  { number: '04', title: '财务 / 账单管理人员', audience: '账单查询视角', description: '在账单管理页面按真实口径查看应收、实收、未收与收款状态。', source: '账单管理' },
  { number: '05', title: '园区服务人员', audience: '事项跟进视角', description: '在报修工单台账中按真实筛选项查看待处理、进行中与已完成状态。', source: '报修工单' },
]

const assetScenes = [
  { title: '工业园区', text: '围绕招商客户、合同、账单、经营信息和报修事项的集中管理。' },
  { title: '厂房', text: '聚焦厂房经营中的客户、合同、账单和服务记录，不暗示已上线房态矩阵。' },
  { title: '仓库', text: '适用于仓库资产经营管理场景，不延伸为仓储库存或物流管理系统。' },
]
</script>

<template>
  <div class="kw-stage2-page kw-solutions-page">
    <section v-motion-active class="kw-stage2-hero kw-tech-field kw-solutions-hero">
      <div class="kw-container kw-stage2-hero__grid">
        <div v-reveal>
          <UiBaseTag>解决方案</UiBaseTag>
          <h1>工业园区、厂房和仓库的经营管理场景</h1>
          <p>以“资产场景＋岗位视角”组织已核实能力，帮助不同角色找到与自己有关的信息入口。</p>
        </div>
        <div v-reveal:right class="kw-solution-orbit" aria-hidden="true">
          <span>经营</span><i /><span>招商</span><i /><span>台账</span><i /><span>报修</span>
        </div>
      </div>
    </section>

    <section class="kw-section kw-solution-assets" aria-labelledby="asset-scenes-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">三类资产场景</span>
          <h2 id="asset-scenes-title">只聚焦已经明确的适用范围</h2>
        </div>
        <div class="kw-solution-asset-grid">
          <article v-for="(item, index) in assetScenes" :key="item.title" v-reveal class="kw-stage2-card">
            <span>0{{ index + 1 }}</span><h3>{{ item.title }}</h3><p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section" aria-labelledby="solution-scenes-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">四类岗位视角</span><h2 id="solution-scenes-title">每个岗位只对应已经核实的页面</h2><p>角色之间的排列用于帮助阅读，不代表系统存在未经核实的审批或自动流转。</p>
        </div>
        <div class="kw-solution-path">
          <article v-for="(scene, index) in scenes" :key="scene.number" v-reveal :style="{ '--kw-reveal-delay': `${index * 80}ms` }" class="kw-stage2-card kw-solution-card">
            <span>{{ scene.number }}</span><small>{{ scene.audience }}</small><h2>{{ scene.title }}</h2><p>{{ scene.description }}</p><strong>来源：{{ scene.source }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="kw-section kw-solution-flow" aria-labelledby="solution-flow-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">真实协作关系</span>
          <h2 id="solution-flow-title">1 个经营中心＋4 步业务主线＋1 条服务支线</h2>
        </div>
        <VerifiedBusinessFlow />
      </div>
    </section>

    <section class="kw-section" aria-labelledby="solution-deployment-title">
      <div class="kw-container">
        <div v-reveal class="kw-section-heading">
          <span class="kw-section-kicker">部署方式</span>
          <h2 id="solution-deployment-title">SaaS 使用与私有化方案评估</h2>
          <p>具体环境、资料整理和非标准服务以项目确认结果为准。</p>
        </div>
        <DeploymentBoundary />
      </div>
    </section>

    <section class="kw-section kw-solution-goal">
      <div v-reveal class="kw-container kw-solution-goal__inner">
        <div><span class="kw-section-kicker">能力边界</span><h2>集中查看信息、持续记录过程、及时跟进事项</h2><p>系统不承诺直接保证出租率、回款结果或消除经营风险。</p></div>
        <div class="kw-solution-goal__actions"><UiBaseButton to="/cases" variant="outline" size="large">查看客户案例</UiBaseButton><UiBaseButton to="/demo" size="large">结合园区预约演示</UiBaseButton></div>
      </div>
    </section>
  </div>
</template>
