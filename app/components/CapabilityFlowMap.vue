<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAutoplayCarousel } from '~/composables/useAutoplayCarousel'
import { businessFlows, getCapability } from '~/data/product-capabilities'

const activeFlowIndex = ref(0)
const root = ref(null)
const tabs = ref([])
const flow = computed(() => businessFlows[activeFlowIndex.value] || businessFlows[0])
const activeFlow = computed(() => flow.value.id)
const steps = computed(() => flow.value.steps.map(getCapability).filter(Boolean))
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
  activeIndex: activeFlowIndex,
  itemCount: businessFlows.length,
  interval: 6500,
})

function selectFlow(index, { focus = false } = {}) {
  activeFlowIndex.value = index
  restartCycle()
  if (focus) nextTick(() => tabs.value[index]?.focus())
}

function moveFlowTab(event, index) {
  let nextIndex = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % businessFlows.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + businessFlows.length) % businessFlows.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = businessFlows.length - 1
  else return
  event.preventDefault()
  selectFlow(nextIndex, { focus: true })
}
</script>

<template>
  <div
    ref="root"
    class="kw-full-flow"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @focusin="setFocused(true)"
    @focusout="setFocused(false)"
  >
    <div class="kw-full-flow__tabs" role="tablist" aria-label="园区经营协同路径">
      <button
        v-for="(item, index) in businessFlows"
        :key="item.id"
        :ref="element => { if (element) tabs[index] = element }"
        type="button"
        role="tab"
        :tabindex="activeFlowIndex === index ? 0 : -1"
        :aria-selected="activeFlow === item.id"
        :class="{ 'is-active': activeFlow === item.id }"
        @click="selectFlow(index)"
        @keydown="moveFlowTab($event, index)"
      >
        {{ item.name }}
      </button>
    </div>
    <UiContentCarouselControls :active-index="activeFlowIndex" :item-count="businessFlows.length" :autoplay-state="autoplayState" :allow-resume="allowResume" @pause="pause" @resume="resume" />
    <Transition name="kw-product-panel" mode="out-in">
      <section :key="flow.id" class="kw-full-flow__body" role="tabpanel">
        <div class="kw-full-flow__copy"><h3>{{ flow.name }}</h3><p>{{ flow.description }}</p></div>
        <ol :style="{ '--kw-flow-count': steps.length }">
          <li v-for="(step, index) in steps" :key="step.id">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div><strong>{{ step.shortName }}</strong><small>{{ step.businessValue }}</small></div>
            <CapabilityStatusTag :status="step.status" compact />
            <i v-if="index < steps.length - 1" aria-hidden="true" />
          </li>
        </ol>
      </section>
    </Transition>
  </div>
</template>
