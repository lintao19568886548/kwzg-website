<script setup>
usePageSeo({
  title: '客户案例',
  description: '瞰维智管客户案例页面骨架，当前不包含真实客户与经营数据。',
})

const items = [
  { title: '案例目录占位', description: '仅在取得客户授权并完成脱敏后使用真实案例素材。' },
  { title: '成果说明占位', description: '不得展示未经确认的经营指标、客户名称或内部数据。' },
  { title: '案例详情占位', description: '后续统一设计案例结构与展示规范。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="Customer stories"
    title="客户案例"
    summary="客户案例页面路由已建立。本阶段不放置真实客户信息、经营数据或未经授权的素材。"
    :items="items"
  />
</template>

