<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAutoplayCarousel } from '~/composables/useAutoplayCarousel'
import { megaMenuGroups, productCapabilities } from '~/data/product-capabilities'

defineProps({ compact: Boolean })

const activeGroupIndex = ref(0)
const root = ref(null)
const tabs = ref([])
const currentGroup = computed(() => megaMenuGroups[activeGroupIndex.value] || megaMenuGroups[0])
const activeGroup = computed(() => currentGroup.value.name)
const currentCapabilities = computed(() => currentGroup.value.items.map(id => productCapabilities.find(item => item.id === id)).filter(Boolean))
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
  activeIndex: activeGroupIndex,
  itemCount: megaMenuGroups.length,
  interval: 6500,
})

function selectGroup(index, { focus = false } = {}) {
  activeGroupIndex.value = index
  restartCycle()
  if (focus) nextTick(() => tabs.value[index]?.focus())
}

function moveGroupTab(event, index) {
  let nextIndex = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % megaMenuGroups.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + megaMenuGroups.length) % megaMenuGroups.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = megaMenuGroups.length - 1
  else return
  event.preventDefault()
  selectGroup(nextIndex, { focus: true })
}
</script>

<template>
  <div
    ref="root"
    class="kw-cap-landscape"
    :class="{ 'is-compact': compact }"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @focusin="setFocused(true)"
    @focusout="setFocused(false)"
  >
    <div class="kw-cap-landscape__tabs" role="tablist" aria-label="园区经营能力分组">
      <button
        v-for="(group, index) in megaMenuGroups"
        :key="group.name"
        :ref="element => { if (element) tabs[index] = element }"
        type="button"
        role="tab"
        :tabindex="activeGroupIndex === index ? 0 : -1"
        :aria-selected="activeGroup === group.name"
        :class="{ 'is-active': activeGroup === group.name }"
        @click="selectGroup(index)"
        @keydown="moveGroupTab($event, index)"
      >
        {{ group.name }}
      </button>
    </div>
    <UiContentCarouselControls :active-index="activeGroupIndex" :item-count="megaMenuGroups.length" :autoplay-state="autoplayState" :allow-resume="allowResume" @pause="pause" @resume="resume" />

    <Transition name="kw-product-panel" mode="out-in">
      <div :key="activeGroup" class="kw-cap-landscape__panel" role="tabpanel">
        <article v-for="capability in currentCapabilities" :key="capability.id">
          <div class="kw-cap-landscape__icon"><UiLinearIcon :name="capability.icon" :size="25" /></div>
          <div>
            <div class="kw-cap-landscape__title">
              <h3>{{ capability.name }}</h3>
              <CapabilityStatusTag :status="capability.status" compact />
            </div>
            <p>{{ capability.heroValue }}</p>
            <ul>
              <li v-for="item in capability.features.slice(0, compact ? 5 : 8)" :key="item.name">
                <span>{{ item.name }}</span>
                <CapabilityStatusTag :status="item.status" compact />
              </li>
            </ul>
            <NuxtLink :to="`/products#capability-${capability.slug}`">查看能力边界 <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </article>
      </div>
    </Transition>
  </div>
</template>
