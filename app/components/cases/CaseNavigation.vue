<script setup>
defineProps({
  previousCase: { type: Object, required: true },
  nextCase: { type: Object, required: true },
})
</script>

<template>
  <nav class="kw-case-navigation" aria-label="客户案例导航">
    <NuxtLink :to="`/cases/${previousCase.slug}`">
      <span aria-hidden="true">←</span><small>上一个案例</small><strong>{{ previousCase.name }}</strong>
    </NuxtLink>
    <NuxtLink class="kw-case-navigation__all" to="/cases">返回全部案例</NuxtLink>
    <NuxtLink class="is-next" :to="`/cases/${nextCase.slug}`">
      <small>下一个案例</small><strong>{{ nextCase.name }}</strong><span aria-hidden="true">→</span>
    </NuxtLink>
  </nav>
</template>
