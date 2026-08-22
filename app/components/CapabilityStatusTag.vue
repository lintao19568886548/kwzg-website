<script setup>
import { computed, ref, useId } from 'vue'
import { getStatusMeta } from '~/data/product-capabilities'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  compact: Boolean,
})

const open = ref(false)
const meta = computed(() => getStatusMeta(props.status))
const descriptionId = `capability-status-${useId().replaceAll(':', '')}`
</script>

<template>
  <span class="kw-cap-status" :class="[`is-${status}`, { 'is-open': open, 'is-compact': compact }]">
    <button
      type="button"
      :aria-expanded="open"
      :aria-describedby="open ? descriptionId : undefined"
      @click="open = !open"
      @blur="open = false"
    >
      <i aria-hidden="true" />
      {{ meta.label }}
    </button>
    <span :id="descriptionId" role="tooltip" class="kw-cap-status__tip">{{ meta.description }}</span>
  </span>
</template>
