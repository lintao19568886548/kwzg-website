<script setup>
import { systemModuleGroups } from '~/config/system-modules'
import { formatDemoNumber, publicSystemDemoData } from '~/data/public-system-demo-data'

const props = defineProps({
  floating: Boolean,
  showAllModules: Boolean,
})

const demo = publicSystemDemoData
const metrics = [
  { label: '累计应收', value: `${demo.overview.receivable.toFixed(1)} 万`, note: '账单应收总额 · 演示', tone: 'blue' },
  { label: '累计实收', value: `${demo.overview.received.toFixed(1)} 万`, note: `回款率 ${demo.overview.collectionRate.toFixed(1)}% · 演示`, tone: 'blue' },
  { label: '待收余额', value: `${demo.overview.outstanding.toFixed(1)} 万`, note: '存在余额账单待跟进 · 演示', tone: 'red' },
  { label: '在租面积', value: `${formatDemoNumber(demo.overview.leasedArea)} ㎡`, note: `${demo.overview.leasedCustomers} 家在租客户 · 演示`, tone: 'blue' },
]

const tasks = demo.tasks

const verifiedNavigation = [
  {
    group: '工作台',
    items: [{ label: '运营总览', icon: 'chart', active: true }],
  },
]

const navigationGroups = computed(() => (
  props.showAllModules ? systemModuleGroups : verifiedNavigation
))
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
            v-for="navigationGroup in navigationGroups"
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
                :aria-label="`演示数据当前口径对比：累计应收 ${demo.overview.receivable.toFixed(1)} 万元，累计实收 ${demo.overview.received.toFixed(1)} 万元，待收余额 ${demo.overview.outstanding.toFixed(1)} 万元，回款完成度 ${demo.overview.collectionRate.toFixed(1)}%`"
              >
                <p class="kw-dashboard__payment-caption">
                  <span>当前口径对比</span>
                  <em>演示数据</em>
                </p>
                <div class="kw-dashboard__payment-row">
                  <div>
                    <span>累计应收</span>
                    <strong>{{ demo.overview.receivable.toFixed(1) }} <small>万</small></strong>
                  </div>
                  <i class="kw-dashboard__payment-track" aria-hidden="true">
                    <b style="--kw-payment-value: 1" />
                  </i>
                </div>
                <div class="kw-dashboard__payment-row kw-dashboard__payment-row--received">
                  <div>
                    <span>累计实收</span>
                    <strong>{{ demo.overview.received.toFixed(1) }} <small>万</small></strong>
                  </div>
                  <i class="kw-dashboard__payment-track" aria-hidden="true">
                    <b style="--kw-payment-value: 0.935" />
                  </i>
                </div>
                <p class="kw-dashboard__payment-balance">
                  <span>待收余额</span>
                  <strong>{{ demo.overview.outstanding.toFixed(1) }} 万</strong>
                  <em>当前余额 · 演示</em>
                </p>
              </div>
              <div class="kw-dashboard__progress"><span>回款完成度</span><i><b :style="{ width: `${demo.overview.collectionRate}%` }" /></i><em>{{ demo.overview.collectionRate.toFixed(1) }}% · 演示</em></div>
            </section>

            <section class="kw-dashboard__tasks">
              <div class="kw-dashboard__tasks-heading">
                <h3>待办事项</h3>
                <strong>{{ demo.overview.uniqueTaskTotal }} 项 · 演示</strong>
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
