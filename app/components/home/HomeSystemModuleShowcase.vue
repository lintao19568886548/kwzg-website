<script setup>
import { computed, nextTick, ref } from 'vue'
import SystemShowcaseModal from '~/components/home/SystemShowcaseModal.vue'
import SystemShowcasePreview from '~/components/home/SystemShowcasePreview.vue'
import { useAutoplayCarousel } from '~/composables/useAutoplayCarousel'
import { getCapability, systemShowcaseModules } from '~/data/product-capabilities'

const activeIndex = ref(0)
const modalOpen = ref(false)
const root = ref(null)
const tabButtons = ref([])
const active = computed(() => systemShowcaseModules[activeIndex.value] || systemShowcaseModules[0])
const activeId = computed(() => active.value.id)
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
  itemCount: systemShowcaseModules.length,
  interval: 6000,
})

function selectModule(id) {
  const index = systemShowcaseModules.findIndex(item => item.id === id)
  if (index < 0) return
  activeIndex.value = index
  restartCycle()
}

function handleTabKeydown(event, index) {
  const lastIndex = systemShowcaseModules.length - 1
  let nextIndex = index
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1
  else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = lastIndex
  else return
  event.preventDefault()
  activeIndex.value = nextIndex
  restartCycle()
  nextTick(() => tabButtons.value[nextIndex]?.focus())
}

function openModal() {
  pause()
  modalOpen.value = true
}
</script>

<template>
  <section
    ref="root"
    class="kw-section kw-v3-showcase"
    aria-labelledby="showcase-title"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @focusin="setFocused(true)"
    @focusout="setFocused(false)"
  >
    <div class="kw-container">
      <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">九个真实系统模块</span><h2 id="showcase-title">真实系统结构，演示数据清晰可见</h2><p>页面结构、字段、状态与业务流程均源自瞰维智管，公开展示的名称与数字均为安全演示数据，不对应任何真实园区、客户或员工。</p></div>
      <div class="kw-v3-showcase__layout">
        <nav role="tablist" aria-label="系统模块">
          <button
            v-for="(item, index) in systemShowcaseModules"
            :id="`home-system-tab-${item.id}`"
            :key="item.id"
            :ref="element => { if (element) tabButtons[index] = element }"
            type="button"
            role="tab"
            :tabindex="activeId === item.id ? 0 : -1"
            :aria-selected="activeId === item.id"
            :aria-controls="`home-system-panel-${item.id}`"
            :class="{ 'is-active': activeId === item.id }"
            @click="selectModule(item.id)"
            @keydown="handleTabKeydown($event, index)"
          ><small>{{ String(index + 1).padStart(2, '0') }}</small><span>{{ item.name }}</span></button>
        </nav>
        <article
          :id="`home-system-panel-${active.id}`"
          :key="active.id"
          class="kw-v3-showcase__panel"
          :data-module-id="active.id"
          role="tabpanel"
          :aria-labelledby="`home-system-tab-${active.id}`"
        >
          <div class="kw-v3-showcase__copy">
            <span>真实页面结构 · 安全演示数据</span><h3>{{ active.name }}</h3>
            <dl><div><dt>客户问题</dt><dd>{{ active.problem }}</dd></div><div><dt>系统处理</dt><dd>{{ active.action }}</dd></div><div><dt>管理价值</dt><dd>{{ active.value }}</dd></div></dl>
            <ul><li v-for="id in active.capabilityIds" :key="id">{{ getCapability(id)?.shortName }}</li></ul>
            <div class="kw-v3-showcase__actions">
              <NuxtLink :to="`/products#capability-${getCapability(active.capabilityIds[0])?.slug}`">查看详细能力</NuxtLink><NuxtLink to="/demo">预约演示</NuxtLink>
              <span class="kw-v3-showcase__carousel-count">{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(systemShowcaseModules.length).padStart(2, '0') }}</span>
              <button v-if="autoplayState === 'playing'" type="button" @click="pause">暂停轮播</button>
              <button v-else-if="allowResume" type="button" @click="resume">继续轮播</button>
            </div>
          </div>
          <SystemShowcasePreview :module="active" @expand="openModal" />
        </article>
      </div>
    </div>
    <SystemShowcaseModal :open="modalOpen" :module="active" @close="modalOpen = false" />
  </section>
</template>
