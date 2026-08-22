<script setup>
const props = defineProps({
  questions: {
    type: Array,
    default: () => [
      '招商信息是否散落在微信或个人手机中？',
      '查询客户、合同和账单时是否需要反复询问？',
      '查看账单状态是否仍然依赖人工临时整理？',
      '报修事项是否缺少统一记录和持续跟进？',
      '查看园区经营情况时是否需要临时找人做表？',
    ],
  },
})

const selected = ref(new Set())
const selectedCount = computed(() => selected.value.size)
const resultText = computed(() => {
  if (!selectedCount.value) return '点击符合现状的项目，结果只在当前页面本地计算。'
  if (selectedCount.value <= 2) return `已标记 ${selectedCount.value} 项，可带着具体场景进一步沟通。`
  return `已标记 ${selectedCount.value} 项，说明有多个信息环节值得进一步梳理。`
})

function toggle(index) {
  const next = new Set(selected.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  selected.value = next
}
</script>

<template>
  <div class="kw-management-check">
    <div class="kw-management-check__grid">
      <button
        v-for="(question, index) in props.questions"
        :key="question"
        type="button"
        :class="{ 'is-selected': selected.has(index) }"
        :aria-pressed="selected.has(index)"
        @click="toggle(index)"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <strong>{{ question }}</strong>
        <em aria-hidden="true">已标记</em>
      </button>
    </div>
    <p class="kw-management-check__result" aria-live="polite">
      <strong>{{ selectedCount }}/5</strong>
      {{ resultText }} 本自查不上传结果，也不用于估算经济损失或承诺经营改善。
    </p>
  </div>
</template>
