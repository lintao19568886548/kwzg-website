<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAutoplayCarousel } from '~/composables/useAutoplayCarousel'
import { getCapability, roleSolutions } from '~/data/product-capabilities'

const activeIndex = ref(0)
const root = ref(null)
const tabButtons = ref([])
let touchStartX = 0
let touchStartY = 0

const active = computed(() => roleSolutions[activeIndex.value])
const activeCapabilities = computed(() => active.value.capabilities.map(getCapability).filter(Boolean).slice(0, 4))
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
  itemCount: roleSolutions.length,
  interval: 6500,
})

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.motion === 'off'
}

function selectRole(index, { focus = false } = {}) {
  activeIndex.value = index
  restartCycle()
  if (focus) nextTick(() => tabButtons.value[index]?.focus())
  nextTick(() => tabButtons.value[index]?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest', inline: 'center' }))
}

function previous() {
  selectRole((activeIndex.value - 1 + roleSolutions.length) % roleSolutions.length)
}

function next() {
  selectRole((activeIndex.value + 1) % roleSolutions.length)
}

function handleKeydown(event, index) {
  let nextIndex = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % roleSolutions.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + roleSolutions.length) % roleSolutions.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = roleSolutions.length - 1
  else return
  event.preventDefault()
  selectRole(nextIndex, { focus: true })
}

function handleTouchStart(event) {
  touchStartX = event.changedTouches[0]?.clientX || 0
  touchStartY = event.changedTouches[0]?.clientY || 0
}

function handleTouchEnd(event) {
  const point = event.changedTouches[0]
  if (!point) return
  const deltaX = point.clientX - touchStartX
  const deltaY = point.clientY - touchStartY
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return
  if (deltaX < 0) next()
  else previous()
}

</script>

<template>
  <section
    ref="root"
    class="kw-section kw-v3-roles kw-cinnabar-roles"
    aria-labelledby="roles-title"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @focusin="setFocused(true)"
    @focusout="setFocused(false)"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <div class="kw-container">
      <div v-reveal class="kw-section-heading kw-section-heading--split">
        <div><span class="kw-section-kicker">按岗位看价值</span><h2 id="roles-title">每个岗位，都看清自己最关心的经营问题</h2></div>
        <p>同一套经营数据，按不同岗位呈现重点任务、协同关系和已核实能力。</p>
      </div>

      <div class="kw-cinnabar-roles__stage">
        <div class="kw-v3-roles__tabs" role="tablist" aria-label="岗位价值角色">
          <button
            v-for="(item, index) in roleSolutions"
            :id="`role-tab-${item.id}`"
            :key="item.id"
            :ref="element => { if (element) tabButtons[index] = element }"
            type="button"
            role="tab"
            :tabindex="activeIndex === index ? 0 : -1"
            :aria-selected="activeIndex === index"
            :aria-controls="`role-panel-${item.id}`"
            :class="{ 'is-active': activeIndex === index }"
            @click="selectRole(index)"
            @keydown="handleKeydown($event, index)"
          >{{ item.name }}</button>
        </div>

        <Transition name="kw-role-panel" mode="out-in">
          <article
            :id="`role-panel-${active.id}`"
            :key="active.id"
            class="kw-v3-roles__panel"
            role="tabpanel"
            :aria-labelledby="`role-tab-${active.id}`"
          >
            <div class="kw-cinnabar-roles__copy">
              <span>岗位价值工作台</span>
              <h3>{{ active.name }}</h3>
              <strong>{{ active.headline }}</strong>
              <p>{{ active.description }}</p>
              <dl>
                <div><dt>关注问题</dt><dd>{{ active.description }}</dd></div>
                <div><dt>核心价值</dt><dd>{{ active.headline }}</dd></div>
              </dl>
              <NuxtLink to="/demo">预约岗位场景演示 <span aria-hidden="true">→</span></NuxtLink>
            </div>
            <ul class="kw-cinnabar-roles__bento">
              <li v-for="(capability, index) in activeCapabilities" :key="capability.id" :class="{ 'is-primary': index === 0 }">
                <UiLinearIcon :name="capability.icon" :size="index === 0 ? 28 : 21" />
                <span><small>0{{ index + 1 }}</small><strong>{{ capability.shortName }}</strong><em>{{ capability.businessValue }}</em></span>
              </li>
            </ul>
          </article>
        </Transition>

        <footer class="kw-cinnabar-roles__controls">
          <div><button type="button" aria-label="上一个岗位" @click="previous">← 上一项</button><button type="button" aria-label="下一个岗位" @click="next">下一项 →</button></div>
          <div class="kw-cinnabar-roles__progress" aria-hidden="true"><i v-for="(_, index) in roleSolutions" :key="index" :class="{ 'is-active': index <= activeIndex }" /></div>
          <strong>{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(roleSolutions.length).padStart(2, '0') }}</strong>
          <button v-if="autoplayState === 'playing'" type="button" @click="pause">暂停</button>
          <button v-else-if="allowResume" type="button" @click="resume">继续</button>
        </footer>
      </div>
    </div>
  </section>
</template>
