<script setup>
const metrics = [
  { label: '累计应收', value: '126.8 万', note: '账单应收总额 · 演示', tone: 'blue' },
  { label: '累计实收', value: '118.6 万', note: '回款率 93.5% · 演示', tone: 'blue' },
  { label: '待收余额', value: '8.2 万', note: '3 笔账单待跟进 · 演示', tone: 'red' },
  { label: '在租面积', value: '28,600 ㎡', note: '12 个租赁客户 · 演示', tone: 'blue' },
]

const tasks = [
  { title: '未收租提醒', description: '存在余额的应收账单', count: '3' },
  { title: '合同到期提醒', description: '90 天内到期合同', count: '2' },
  { title: '待处理报销', description: '等待审批或复核', count: '1' },
  { title: '报修工单', description: '尚未完成的维修任务', count: '3' },
]
</script>

<template>
  <div class="kw-dashboard-source">
    <article class="kw-dashboard" aria-label="园区经营总览演示界面">
      <header class="kw-dashboard__topbar">
        <div class="kw-dashboard__brand">
          <span aria-hidden="true">瞰</span>
          <strong>园区运营工作台</strong>
        </div>
        <UiBaseTag tone="demo">演示数据</UiBaseTag>
      </header>

      <div class="kw-dashboard__body">
        <aside class="kw-dashboard__sidebar" aria-hidden="true">
          <span class="is-active"><UiLinearIcon name="chart" :size="17" /></span>
          <span><UiLinearIcon name="building" :size="17" /></span>
          <span><UiLinearIcon name="users" :size="17" /></span>
          <span><UiLinearIcon name="wallet" :size="17" /></span>
          <span><UiLinearIcon name="wrench" :size="17" /></span>
        </aside>

        <div class="kw-dashboard__content">
          <div class="kw-dashboard__heading">
            <div>
              <p>工作台 / 运营总览</p>
              <h2>园区经营总览</h2>
            </div>
            <span>ONLINE</span>
          </div>

          <div class="kw-dashboard__metrics">
            <div
              v-for="metric in metrics"
              :key="metric.label"
              class="kw-dashboard__metric"
              :class="`kw-dashboard__metric--${metric.tone}`"
            >
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
              <small>{{ metric.note }}</small>
            </div>
          </div>

          <div class="kw-dashboard__lower">
            <section class="kw-dashboard__chart">
              <div>
                <h3>经营回款脉搏</h3>
                <span>应收 / 实收</span>
              </div>
              <div class="kw-dashboard__empty-chart">
                <UiLinearIcon name="chart" :size="24" />
                <strong>演示账单写入后显示回款脉搏</strong>
                <span>当前不虚构截图中没有的数据趋势。</span>
              </div>
              <div class="kw-dashboard__progress"><span>回款完成度</span><i><b style="width: 64%" /></i><em>演示</em></div>
            </section>

            <section class="kw-dashboard__tasks">
              <div class="kw-dashboard__tasks-heading">
                <h3>待办事项</h3>
                <strong>演示</strong>
              </div>
              <ul>
                <li v-for="task in tasks" :key="task.title">
                  <span><UiLinearIcon name="clipboard" :size="15" /></span>
                  <div>
                    <strong>{{ task.title }}</strong>
                    <small>{{ task.description }}</small>
                  </div>
                  <em>{{ task.count }}</em>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </article>

    <p class="kw-interface-source__notice">本界面基于瞰维智管现有功能进行视觉优化展示，使用演示数据，具体界面以实际交付版本为准。</p>
  </div>
</template>
