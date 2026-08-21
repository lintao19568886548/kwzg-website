<script setup>
defineProps({
  tone: {
    type: String,
    default: 'white',
  },
})
</script>

<template>
  <div class="kw-card" :class="`kw-card--${tone}`">
    <slot />
  </div>
</template>
