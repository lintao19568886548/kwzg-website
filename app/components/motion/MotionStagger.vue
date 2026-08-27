<script setup>
const props = defineProps({
  as: { type: String, default: 'div' },
  step: { type: Number, default: 80 },
})
</script>

<template>
  <component
    :is="props.as"
    data-motion-stagger
    :style="{ '--kw-stagger-step': `${props.step}ms` }"
  >
    <slot />
  </component>
</template>
