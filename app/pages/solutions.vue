<script setup>
usePageSeo({
  title: '解决方案',
  description: '瞰维智管为园区经营管理、招商协同与合同账单台账提供清晰的管理视角。',
})

const items = [
  { title: '管理者经营视角', description: '通过园区经营总览查看应收、实收、待收、在租面积和待办事项。' },
  { title: '招商团队协同', description: '通过招商客户列表与客户详情查看阶段、需求、推荐和跟进记录。' },
  { title: '合同账单与报修台账', description: '分别查看合同状态、账单收款状态和报修工单处理状态。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="Solutions"
    title="解决方案"
    summary="围绕已经核验的真实页面组织管理场景；具体界面使用演示数据，实际交付以项目版本为准。"
    :items="items"
  />
</template>
