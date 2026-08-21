<script setup>
defineProps({
  tone: {
    type: String,
    default: 'blue',
  },
})
</script>

<template>
  <span class="kw-tag" :class="`kw-tag--${tone}`">
    <slot />
  </span>
</template>
