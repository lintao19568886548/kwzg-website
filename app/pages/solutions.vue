<script setup>
usePageSeo({
  title: '解决方案',
  description: '瞰维智管解决方案页面骨架。',
})

const items = [
  { title: '场景分类占位', description: '后续根据目标客户与使用场景形成解决方案分类。' },
  { title: '业务价值占位', description: '后续使用经过确认的公开信息表达业务价值。' },
  { title: '方案路径占位', description: '后续补充方案流程与交付边界，不涉及生产数据。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="Solutions"
    title="解决方案"
    summary="解决方案页面路由已建立，当前只保留后续内容组织所需的基础容器。"
    :items="items"
  />
</template>

