<script setup>
import { caseRegions } from '~/data/cases'

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const buttons = ref([])

function selectRegion(region) {
  emit('update:modelValue', region)
}

function moveFocus(event, index) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % caseRegions.length
  if (event.key === 'ArrowLeft') nextIndex = (index - 1 + caseRegions.length) % caseRegions.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = caseRegions.length - 1
  buttons.value[nextIndex]?.focus()
}
</script>

<template>
  <div class="kw-case-filter" role="toolbar" aria-label="按地区筛选客户案例">
    <button
      v-for="(region, index) in caseRegions"
      :key="region"
      :ref="element => { if (element) buttons[index] = element }"
      type="button"
      :class="{ 'is-active': modelValue === region }"
      :aria-pressed="modelValue === region"
      @click="selectRegion(region)"
      @keydown="moveFocus($event, index)"
    >
      {{ region }}
    </button>
  </div>
</template>
