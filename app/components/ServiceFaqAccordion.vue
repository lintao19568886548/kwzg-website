<script setup>
import { serviceFaqs } from '~/data/verified-capabilities'

const props = defineProps({
  limit: {
    type: Number,
    default: 0,
  },
})

const openIndex = ref(0)
const visibleFaqs = computed(() => props.limit > 0 ? serviceFaqs.slice(0, props.limit) : serviceFaqs)

function toggle(index) {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>

<template>
  <div class="kw-service-faq">
    <article v-for="(item, index) in visibleFaqs" :key="item.question" :class="{ 'is-open': openIndex === index }">
      <h3>
        <button
          :id="`faq-button-${index}`"
          type="button"
          :aria-expanded="openIndex === index"
          :aria-controls="`faq-panel-${index}`"
          @click="toggle(index)"
        >
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          {{ item.question }}
          <i aria-hidden="true">{{ openIndex === index ? '−' : '+' }}</i>
        </button>
      </h3>
      <div v-show="openIndex === index" :id="`faq-panel-${index}`" role="region" :aria-labelledby="`faq-button-${index}`">
        <p>{{ item.answer }}</p>
      </div>
    </article>
  </div>
</template>
