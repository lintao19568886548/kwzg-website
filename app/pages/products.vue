<script setup>
usePageSeo({
  title: '产品能力',
  description: '了解瞰维智管已经完成真实系统界面溯源的经营、招商、合同、账单与报修管理能力。',
})

const items = [
  { title: '园区经营总览', description: '汇总累计应收、累计实收、待收余额、在租面积与待办事项。' },
  { title: '招商客户与客户详情', description: '按园区、阶段和负责人筛选客户，并查看需求、推荐与跟进记录。' },
  { title: '合同、账单与报修台账', description: '合同、账单和报修工单保持独立页面与各自的字段、筛选和状态。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="Product capabilities"
    title="产品能力"
    summary="公开能力只依据已经完成本地截图溯源的真实系统页面整理，不把未验证功能包装成已上线能力。"
    :items="items"
  />
</template>
