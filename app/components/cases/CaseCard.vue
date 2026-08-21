<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="kw-case-card">
    <NuxtLink class="kw-case-card__link" :to="`/cases/${item.slug}`" :aria-label="`查看${item.name}案例：${item.title}`">
      <div class="kw-case-card__media">
        <img :src="item.coverImage" :alt="item.gallery[0].alt" width="800" height="500" loading="lazy" decoding="async">
        <span>{{ item.region }}</span>
      </div>
      <div class="kw-case-card__body">
        <small>正在使用瞰维智管</small>
        <h2>{{ item.name }}</h2>
        <h3>{{ item.title }}</h3>
        <p>{{ item.summary }}</p>
        <strong>查看案例 <span aria-hidden="true">→</span></strong>
      </div>
    </NuxtLink>
  </article>
</template>
