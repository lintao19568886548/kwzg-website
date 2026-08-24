<script setup>
const props = defineProps({
  inverse: {
    type: Boolean,
    default: false,
  },
  withTagline: {
    type: Boolean,
    default: false,
  },
  headerTagline: {
    type: String,
    default: '',
  },
})

const logoImage = computed(() => {
  const tone = props.inverse ? '-inverse' : ''
  const tagline = props.withTagline ? '-with-tagline' : ''

  return `/assets/logo/kwzg-logo-horizontal${tone}${tagline}.png`
})

const logoWidth = computed(() => props.withTagline ? 670 : 778)
</script>

<template>
  <NuxtLink
    class="kw-brand-logo"
    :class="{
      'kw-brand-logo--inverse': inverse,
      'kw-brand-logo--tagline': withTagline,
      'kw-brand-logo--header': headerTagline,
    }"
    to="/"
    :aria-label="headerTagline
      ? '返回瞰维智管官网首页'
      : withTagline
      ? '瞰维智管官网首页：给园区管理装上大脑和翅膀，少操心，赚更多。'
      : '瞰维智管官网首页'"
  >
    <img
      :src="logoImage"
      :alt="withTagline
        ? '瞰维智管｜给园区管理装上大脑和翅膀，少操心，赚更多。'
        : '瞰维智管'"
      :width="logoWidth"
      height="160"
      decoding="async"
    >
    <span v-if="headerTagline" class="kw-brand-logo__header-tagline" aria-hidden="true">
      <span class="kw-brand-logo__header-tagline-line" />
      <span class="kw-brand-logo__header-tagline-text">{{ headerTagline }}</span>
    </span>
  </NuxtLink>
</template>
