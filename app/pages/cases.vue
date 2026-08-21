<script setup>
usePageSeo({
  title: '客户案例',
  description: '瞰维智管已在六个获授权公开名称的园区正式使用，案例不展示租金、出租率或收入等经营数据。',
})

const items = [
  { title: '东莞园区实践', description: '同富园区、高埗同兴园区；仅展示已授权的园区名称与实景。' },
  { title: '佛山园区实践', description: '佛山乐从园区、佛山九江园区；九江无水印原图补齐前不公开照片。' },
  { title: '深圳与广州园区实践', description: '深圳坑梓园区、新塘西州；仅使用已经核验并获授权的园区实景。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="Customer stories"
    title="客户案例"
    summary="六个园区均已正式使用瞰维智管。官网不公开出租率、租金、欠费、收入或租户经营信息。"
    :items="items"
  />
</template>
