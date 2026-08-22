<script setup>
const props = defineProps({
  floating: Boolean,
})

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

const verifiedNavigation = [
  {
    group: '工作台',
    items: [{ label: '运营总览', icon: 'chart', active: true }],
  },
]
</script>

<template>
  <div
    class="kw-dashboard-source"
    :class="{ 'kw-dashboard-source--floating': props.floating }"
  >
    <article class="kw-dashboard" aria-label="园区经营总览演示界面">
      <header class="kw-dashboard__topbar">
        <div class="kw-dashboard__brand">
          <span aria-hidden="true">瞰</span>
          <strong>园区运营工作台</strong>
        </div>
        <UiBaseTag tone="demo">演示数据</UiBaseTag>
      </header>

      <div class="kw-dashboard__body">
        <aside class="kw-dashboard__sidebar" aria-label="已核实功能导航示意">
          <section
            v-for="navigationGroup in verifiedNavigation"
            :key="navigationGroup.group"
            class="kw-dashboard__nav-group"
          >
            <strong>{{ navigationGroup.group }}</strong>
            <ul>
              <li
                v-for="item in navigationGroup.items"
                :key="item.label"
                :class="{ 'is-active': item.active }"
              >
                <UiLinearIcon :name="item.icon" :size="17" />
                <span>{{ item.label }}</span>
              </li>
            </ul>
          </section>
        </aside>

        <div class="kw-dashboard__content">
          <div class="kw-dashboard__heading">
            <div>
              <p>工作台 / 运营总览</p>
              <h2>园区经营总览</h2>
            </div>
            <span class="kw-status-breathe">ONLINE</span>
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
              <div
                class="kw-dashboard__payment-snapshot"
                role="img"
                aria-label="演示数据当前口径对比：累计应收 126.8 万元，累计实收 118.6 万元，待收余额 8.2 万元，回款完成度 93.5%"
              >
                <p class="kw-dashboard__payment-caption">
                  <span>当前口径对比</span>
                  <em>演示数据</em>
                </p>
                <div class="kw-dashboard__payment-row">
                  <div>
                    <span>累计应收</span>
                    <strong>126.8 <small>万</small></strong>
                  </div>
                  <i class="kw-dashboard__payment-track" aria-hidden="true">
                    <b style="--kw-payment-value: 1" />
                  </i>
                </div>
                <div class="kw-dashboard__payment-row kw-dashboard__payment-row--received">
                  <div>
                    <span>累计实收</span>
                    <strong>118.6 <small>万</small></strong>
                  </div>
                  <i class="kw-dashboard__payment-track" aria-hidden="true">
                    <b style="--kw-payment-value: 0.935" />
                  </i>
                </div>
                <p class="kw-dashboard__payment-balance">
                  <span>待收余额</span>
                  <strong>8.2 万</strong>
                  <em>当前余额 · 演示</em>
                </p>
              </div>
              <div class="kw-dashboard__progress"><span>回款完成度</span><i><b style="width: 93.5%" /></i><em>93.5% · 演示</em></div>
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

  </div>
</template>
