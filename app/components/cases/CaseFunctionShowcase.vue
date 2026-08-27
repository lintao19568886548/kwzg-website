<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAutoplayCarousel } from '~/composables/useAutoplayCarousel'
import { verifiedCaseFunctions } from '~/data/cases'

const props = defineProps({
  functions: {
    type: Array,
    required: true,
  },
})

const activeIndex = ref(0)
const root = ref(null)
const activeName = computed(() => props.functions[activeIndex.value] || props.functions[0])
const activeFunction = computed(() => verifiedCaseFunctions[activeName.value])
const tabs = ref([])
const {
  allowResume,
  autoplayState,
  pause,
  restartCycle,
  resume,
  setFocused,
  setHovered,
} = useAutoplayCarousel({
  root,
  activeIndex,
  itemCount: props.functions.length,
  interval: 6000,
})

function selectFunction(index) {
  activeIndex.value = index
  restartCycle()
}

function moveTab(event, index) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % props.functions.length
  if (event.key === 'ArrowLeft') nextIndex = (index - 1 + props.functions.length) % props.functions.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = props.functions.length - 1
  activeIndex.value = nextIndex
  restartCycle()
  nextTick(() => tabs.value[nextIndex]?.focus())
}
</script>

<template>
  <div
    ref="root"
    class="kw-case-functions"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @focusin="setFocused(true)"
    @focusout="setFocused(false)"
  >
    <div class="kw-case-function-tabs" role="tablist" aria-label="相关功能展示">
      <button
        v-for="(name, index) in functions"
        :id="`case-function-tab-${index}`"
        :key="name"
        :ref="element => { if (element) tabs[index] = element }"
        type="button"
        role="tab"
        :aria-selected="activeIndex === index"
        :aria-controls="`case-function-panel-${index}`"
        :tabindex="activeIndex === index ? 0 : -1"
        :class="{ 'is-active': activeIndex === index }"
        @click="selectFunction(index)"
        @keydown="moveTab($event, index)"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ name }}
      </button>
    </div>

    <div class="kw-case-function-carousel" aria-label="功能界面轮播状态">
      <span>{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(functions.length).padStart(2, '0') }}</span>
      <button v-if="autoplayState === 'playing'" type="button" @click="pause">暂停轮播</button>
      <button v-else-if="allowResume" type="button" @click="resume">继续轮播</button>
    </div>

    <Transition name="kw-product-panel" mode="out-in">
      <section
        :id="`case-function-panel-${activeIndex}`"
        :key="activeName"
        class="kw-case-function-panel"
        role="tabpanel"
        :aria-labelledby="`case-function-tab-${activeIndex}`"
      >
        <div class="kw-case-function-panel__copy">
          <span>相关功能展示</span>
          <h3>{{ activeName }}</h3>
          <p>{{ activeFunction.description }}</p>
        </div>
        <HomeDashboardOverview v-if="activeFunction.type === 'overview'" />
        <HomeInterfacePreview v-else :type="activeFunction.type" :title="activeName" />
      </section>
    </Transition>
  </div>
</template>
