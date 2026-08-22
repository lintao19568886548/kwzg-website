<script setup>
const groups = [
  { title: '可以演示的标准能力', tone: 'verified', items: ['园区经营总览', '招商客户', '客户详情', '合同管理', '账单管理', '报修工单'] },
  { title: '需要技术确认的评估项目', tone: 'review', items: ['原有资料整理与迁移方式', '私有化部署条件', '硬件与第三方系统接口'] },
  { title: '当前不公开承诺的能力', tone: 'boundary', items: ['未经核实的自动化流程', '固定实施周期与固定价格', '必然经营结果与任何硬件接入'] },
]
</script>

<template>
  <div class="kw-service-scope">
    <article v-for="group in groups" :key="group.title" v-reveal :class="`is-${group.tone}`">
      <h3>{{ group.title }}</h3>
      <ul><li v-for="item in group.items" :key="item">{{ item }}</li></ul>
    </article>
  </div>
</template>
