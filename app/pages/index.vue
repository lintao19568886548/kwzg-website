<script setup>
import BrandIntro from '~/components/effects/BrandIntro.vue'

usePageSeo({
  title: '工业园区经营管理系统',
  description: '瞰维智管面向工业园区、厂房和仓库，汇总经营总览、招商客户、合同、账单与报修工单。',
})
</script>

<template>
  <div class="kw-home-page">
    <BrandIntro />
    <HomeStageOne />
  </div>
</template>
