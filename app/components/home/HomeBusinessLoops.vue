<script setup>
import { businessFlows } from '~/data/product-capabilities'

const activeId = ref(businessFlows[0].id)
const active = computed(() => businessFlows.find(item => item.id === activeId.value) || businessFlows[0])
const selectedStep = ref(0)
watch(activeId, () => { selectedStep.value = 0 })
</script>

<template>
  <section class="kw-section kw-v3-loops" aria-labelledby="loops-title">
    <div class="kw-container">
      <div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">三条业务闭环</span><h2 id="loops-title">让每项工作，有记录、有提醒、有责任、有结果</h2></div><p>闭环只说明产品模块之间的协同关系，不展示虚构系统数据。</p></div>
      <div class="kw-v3-loops__tabs" role="tablist" aria-label="业务闭环"><button v-for="item in businessFlows" :key="item.id" type="button" role="tab" :aria-selected="activeId === item.id" :class="{ 'is-active': activeId === item.id }" @click="activeId = item.id">{{ item.name }}</button></div>
      <Transition name="kw-product-panel" mode="out-in"><article :key="active.id" class="kw-v3-loops__panel" role="tabpanel"><header><h3>{{ active.name }}</h3><p>{{ active.description }}</p></header><ol><li v-for="(step, index) in active.steps" :key="step"><button type="button" :class="{ 'is-active': selectedStep === index }" @click="selectedStep = index"><small>{{ String(index + 1).padStart(2, '0') }}</small><span>{{ step }}</span></button></li></ol></article></Transition>
    </div>
  </section>
</template>
