<script setup>
import { implementationSteps } from '~/data/verified-capabilities'

defineProps({
  compact: Boolean,
})
</script>

<template>
  <ol class="kw-implementation-timeline" :class="{ 'is-compact': compact }">
    <li v-for="(step, index) in implementationSteps" :key="step" v-reveal :style="{ '--kw-reveal-delay': `${index * 65}ms` }">
      <span>{{ String(index + 1).padStart(2, '0') }}</span>
      <strong>{{ step }}</strong>
    </li>
  </ol>
</template>
