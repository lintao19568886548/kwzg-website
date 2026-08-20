<script setup>
usePageSeo({
  title: '关于我们',
  description: '瞰维智管关于我们页面骨架。',
})

const items = [
  { title: '品牌介绍占位', description: '后续补充经过确认的企业与品牌介绍。' },
  { title: '价值主张占位', description: '后续统一品牌语言，当前不作为正式对外文案。' },
  { title: '联系信息占位', description: '后续补充可公开的官方联系信息。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="About us"
    title="关于我们"
    summary="关于我们页面路由已建立，企业介绍、品牌故事与联系信息将在后续确认后补充。"
    :items="items"
  />
</template>

