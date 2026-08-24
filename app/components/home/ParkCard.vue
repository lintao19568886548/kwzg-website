<script setup>
defineProps({
  to: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <NuxtLink :to="to" class="kw-park-card" :aria-label="`查看${name}案例详情`">
    <div v-if="images.length" class="kw-park-card__media">
      <img
        :src="images[0]"
        :alt="`${name}实景`"
        width="1200"
        height="750"
        loading="lazy"
        decoding="async"
      >
      <span v-if="images.length > 1">实景 {{ images.length }} 张</span>
    </div>
    <div v-else class="kw-park-card__placeholder" role="img" :aria-label="`${name}图片待更新`">
      <UiLinearIcon name="building" :size="30" />
      <span>图片待更新</span>
    </div>
    <span class="kw-park-card__caption">
      <strong>{{ name }}</strong>
      <span>{{ location }}</span>
      <em>查看案例 →</em>
    </span>
  </NuxtLink>
</template>
