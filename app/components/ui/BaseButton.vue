<script setup>
const props = defineProps({
  to: {
    type: String,
    default: '',
  },
  href: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'medium',
  },
})

const classes = computed(() => [
  'kw-button',
  `kw-button--${props.variant}`,
  `kw-button--${props.size}`,
])
const isExternal = computed(() => /^https?:\/\//.test(props.href))
</script>

<template>
  <a
    v-if="href"
    :class="classes"
    :href="href"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer nofollow' : undefined"
  >
    <slot />
  </a>
  <NuxtLink v-else :class="classes" :to="to">
    <slot />
  </NuxtLink>
</template>
