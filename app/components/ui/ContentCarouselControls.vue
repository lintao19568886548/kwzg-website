<script setup>
defineProps({
  activeIndex: {
    type: Number,
    required: true,
  },
  itemCount: {
    type: Number,
    required: true,
  },
  autoplayState: {
    type: String,
    required: true,
  },
  allowResume: Boolean,
})

defineEmits(['pause', 'resume'])
</script>

<template>
  <div class="kw-content-carousel-controls" aria-label="内容轮播状态">
    <span>{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(itemCount).padStart(2, '0') }}</span>
    <button v-if="autoplayState === 'playing'" type="button" @click="$emit('pause')">暂停轮播</button>
    <button v-else-if="allowResume && autoplayState === 'manual'" type="button" @click="$emit('resume')">继续轮播</button>
  </div>
</template>
