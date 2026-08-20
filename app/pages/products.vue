<script setup>
usePageSeo({
  title: '产品能力',
  description: '瞰维智管产品能力页面骨架。',
})

const items = [
  { title: '能力模块占位', description: '后续根据已确认的产品信息组织能力架构与价值表达。' },
  { title: '产品展示占位', description: '后续补充经过脱敏与授权的界面或能力示意素材。' },
  { title: '行动入口占位', description: '后续与预约演示流程统一设计，不接入生产系统。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="Product capabilities"
    title="产品能力"
    summary="产品能力页面路由已建立。当前内容仅用于验证结构，尚未进入正式信息架构与视觉设计。"
    :items="items"
  />
</template>

