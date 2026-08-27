<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAutoplayCarousel } from '~/composables/useAutoplayCarousel'
import { getCapability, roleSolutions } from '~/data/product-capabilities'

const activeRoleIndex = ref(0)
const root = ref(null)
const tabs = ref([])
const role = computed(() => roleSolutions[activeRoleIndex.value] || roleSolutions[0])
const activeRole = computed(() => role.value.id)
const capabilities = computed(() => role.value.capabilities.map(getCapability).filter(Boolean))
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
  activeIndex: activeRoleIndex,
  itemCount: roleSolutions.length,
  interval: 6500,
})

function selectRole(index, { focus = false } = {}) {
  activeRoleIndex.value = index
  restartCycle()
  if (focus) nextTick(() => tabs.value[index]?.focus())
}

function moveRoleTab(event, index) {
  let nextIndex = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % roleSolutions.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + roleSolutions.length) % roleSolutions.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = roleSolutions.length - 1
  else return
  event.preventDefault()
  selectRole(nextIndex, { focus: true })
}
</script>

<template>
  <div
    ref="root"
    class="kw-role-explorer"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @focusin="setFocused(true)"
    @focusout="setFocused(false)"
  >
    <div class="kw-role-explorer__tabs" role="tablist" aria-label="按岗位查看解决方案">
      <button
        v-for="(item, index) in roleSolutions"
        :key="item.id"
        :ref="element => { if (element) tabs[index] = element }"
        type="button"
        role="tab"
        :tabindex="activeRoleIndex === index ? 0 : -1"
        :aria-selected="activeRole === item.id"
        :class="{ 'is-active': activeRole === item.id }"
        @click="selectRole(index)"
        @keydown="moveRoleTab($event, index)"
      >
        {{ item.name }}
      </button>
    </div>
    <div class="kw-role-explorer__stage">
      <UiContentCarouselControls :active-index="activeRoleIndex" :item-count="roleSolutions.length" :autoplay-state="autoplayState" :allow-resume="allowResume" @pause="pause" @resume="resume" />
      <Transition name="kw-product-panel" mode="out-in">
        <section :key="role.id" class="kw-role-explorer__panel" role="tabpanel">
          <header><span>岗位方案</span><h3>{{ role.headline }}</h3><p>{{ role.description }}</p></header>
          <div>
            <article v-for="capability in capabilities" :key="capability.id">
              <div><UiLinearIcon :name="capability.icon" :size="22" /><strong>{{ capability.shortName }}</strong></div>
              <CapabilityStatusTag :status="capability.deliveryMode" compact />
              <p>{{ capability.businessValue }}</p>
            </article>
          </div>
        </section>
      </Transition>
    </div>
  </div>
</template>
