<script setup>
import { verifiedCaseFunctions } from '~/data/cases'

const props = defineProps({
  functions: {
    type: Array,
    required: true,
  },
})

const activeName = ref(props.functions[0])
const activeFunction = computed(() => verifiedCaseFunctions[activeName.value])
const tabs = ref([])

function selectFunction(name) {
  activeName.value = name
}

function moveTab(event, index) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % props.functions.length
  if (event.key === 'ArrowLeft') nextIndex = (index - 1 + props.functions.length) % props.functions.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = props.functions.length - 1
  activeName.value = props.functions[nextIndex]
  nextTick(() => tabs.value[nextIndex]?.focus())
}
</script>

<template>
  <div class="kw-case-functions">
    <div class="kw-case-function-tabs" role="tablist" aria-label="相关功能展示">
      <button
        v-for="(name, index) in functions"
        :id="`case-function-tab-${index}`"
        :key="name"
        :ref="element => { if (element) tabs[index] = element }"
        type="button"
        role="tab"
        :aria-selected="activeName === name"
        :aria-controls="`case-function-panel-${index}`"
        :tabindex="activeName === name ? 0 : -1"
        :class="{ 'is-active': activeName === name }"
        @click="selectFunction(name)"
        @keydown="moveTab($event, index)"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ name }}
      </button>
    </div>

    <Transition name="kw-product-panel" mode="out-in">
      <section
        :id="`case-function-panel-${functions.indexOf(activeName)}`"
        :key="activeName"
        class="kw-case-function-panel"
        role="tabpanel"
        :aria-labelledby="`case-function-tab-${functions.indexOf(activeName)}`"
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
