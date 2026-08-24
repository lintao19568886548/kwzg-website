<script setup>
import { capabilityArchitecture, getCapability } from '~/data/product-capabilities'

const activeLayer = ref(capabilityArchitecture[0].id)
const layer = computed(() => capabilityArchitecture.find(item => item.id === activeLayer.value) || capabilityArchitecture[0])
</script>

<template>
  <section class="kw-section kw-v3-architecture" aria-labelledby="architecture-title">
    <div class="kw-container">
      <div v-reveal class="kw-section-heading"><span class="kw-section-kicker">三层能力架构</span><h2 id="architecture-title">从数据基础，到业务协同，再到智能决策</h2><p>节点全部来自统一能力数据；点击一层即可查看关联能力并进入产品页。</p></div>
      <div class="kw-v3-architecture__shell">
        <div class="kw-v3-architecture__layers" role="tablist" aria-label="三层能力架构">
          <button v-for="(item, index) in capabilityArchitecture" :key="item.id" type="button" role="tab" :aria-selected="activeLayer === item.id" :class="{ 'is-active': activeLayer === item.id }" @click="activeLayer = item.id"><small>0{{ index + 1 }}</small><strong>{{ item.name }}</strong><span>{{ item.description }}</span></button>
        </div>
        <Transition name="kw-product-panel" mode="out-in"><article :key="layer.id" class="kw-v3-architecture__detail" role="tabpanel"><div class="kw-v3-architecture__nodes"><span v-for="node in layer.nodes" :key="node">{{ node }}</span></div><div class="kw-v3-architecture__links"><NuxtLink v-for="id in layer.capabilities" :key="id" :to="`/products#capability-${getCapability(id)?.slug}`">{{ getCapability(id)?.shortName }} <span aria-hidden="true">→</span></NuxtLink></div></article></Transition>
      </div>
    </div>
  </section>
</template>
