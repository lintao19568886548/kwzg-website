<script setup>
const props = defineProps({
  as: { type: String, default: 'div' },
  direction: { type: String, default: 'up' },
  delay: { type: Number, default: 0 },
})
</script>

<template>
  <component :is="props.as" v-reveal:[props.direction]="props.delay" class="kw-motion-reveal">
    <slot />
  </component>
</template>
