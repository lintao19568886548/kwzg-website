<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
})

const statusCode = computed(() => Number(props.error?.statusCode) || 500)
const isNotFound = computed(() => statusCode.value === 404)

useHead({
  title: () => `${statusCode.value}｜瞰维智管`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

</script>

<template>
  <div class="kw-error-page">
    <a class="kw-skip-link" href="#error-main">跳到主要内容</a>
    <header><BrandLogo /></header>
    <main id="error-main">
      <span>{{ statusCode }}</span>
      <h1>{{ isNotFound ? '页面没有找到' : '页面暂时无法打开' }}</h1>
      <p>{{ isNotFound ? '你访问的地址不存在或已经调整，请返回官网继续浏览。' : '服务暂时不可用，请稍后重试。' }}</p>
      <NuxtLink class="kw-button kw-button--primary" to="/">返回首页</NuxtLink>
    </main>
  </div>
</template>
