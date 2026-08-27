<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAutoplayCarousel } from '~/composables/useAutoplayCarousel'
import { capabilityArchitecture, getCapability } from '~/data/product-capabilities'

const activeLayerIndex = ref(0)
const root = ref(null)
const tabs = ref([])
const layer = computed(() => capabilityArchitecture[activeLayerIndex.value] || capabilityArchitecture[0])
const activeLayer = computed(() => layer.value.id)
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
  activeIndex: activeLayerIndex,
  itemCount: capabilityArchitecture.length,
  interval: 6500,
  visibilityThreshold: 0.4,
})

function selectLayer(index, { focus = false } = {}) {
  activeLayerIndex.value = index
  restartCycle()
  if (focus) nextTick(() => tabs.value[index]?.focus())
}

function moveLayerTab(event, index) {
  let nextIndex = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % capabilityArchitecture.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + capabilityArchitecture.length) % capabilityArchitecture.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = capabilityArchitecture.length - 1
  else return
  event.preventDefault()
  selectLayer(nextIndex, { focus: true })
}
</script>

<template>
  <section
    class="kw-section kw-v3-architecture"
    aria-labelledby="architecture-title"
  >
    <div class="kw-container">
      <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">三层能力架构</span><h2 id="architecture-title">从数据基础，到业务协同，再到智能决策</h2><p>节点全部来自统一能力数据；点击一层即可查看关联能力并进入产品页。</p></div>
      <div
        ref="root"
        class="kw-v3-architecture__shell"
        @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)"
        @focusin="setFocused(true)"
        @focusout="setFocused(false)"
      >
        <div class="kw-v3-architecture__layers" role="tablist" aria-label="三层能力架构">
          <button v-for="(item, index) in capabilityArchitecture" :key="item.id" :ref="element => { if (element) tabs[index] = element }" type="button" role="tab" :tabindex="activeLayerIndex === index ? 0 : -1" :aria-selected="activeLayer === item.id" :class="{ 'is-active': activeLayer === item.id }" @click="selectLayer(index)" @keydown="moveLayerTab($event, index)"><small>0{{ index + 1 }}</small><strong>{{ item.name }}</strong><span>{{ item.description }}</span></button>
        </div>
        <div class="kw-v3-architecture__stage">
          <UiContentCarouselControls :active-index="activeLayerIndex" :item-count="capabilityArchitecture.length" :autoplay-state="autoplayState" :allow-resume="allowResume" @pause="pause" @resume="resume" />
          <Transition name="kw-product-panel" mode="out-in"><article :key="layer.id" class="kw-v3-architecture__detail" role="tabpanel"><div class="kw-v3-architecture__nodes"><span v-for="node in layer.nodes" :key="node">{{ node }}</span></div><div class="kw-v3-architecture__links"><NuxtLink v-for="id in layer.capabilities" :key="id" :to="`/products#capability-${getCapability(id)?.slug}`">{{ getCapability(id)?.shortName }} <span aria-hidden="true">→</span></NuxtLink></div></article></Transition>
        </div>
      </div>
    </div>
  </section>
</template>
