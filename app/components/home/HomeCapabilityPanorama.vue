<script setup>
import { getCapability, homeCapabilityDomains } from '~/data/product-capabilities'

defineEmits(['open-all'])

function features(domain) {
  return domain.capabilityIds.flatMap(id => getCapability(id)?.features || [])
}
</script>

<template>
  <section id="home-capabilities" class="kw-section kw-v3-panorama" aria-labelledby="panorama-title">
    <div class="kw-container">
      <div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">七大完整能力域</span><h2 id="panorama-title">一套系统，贯通园区经营全流程</h2></div><button class="kw-v3-outline-button" type="button" @click="$emit('open-all')">查看全部能力</button></div>
      <div class="kw-v3-panorama__grid">
        <article v-for="(domain, index) in homeCapabilityDomains" :id="`home-domain-${domain.id}`" :key="domain.id" v-reveal>
          <header><span>0{{ index + 1 }}</span><UiLinearIcon :name="domain.icon" :size="25" /></header><h3>{{ domain.name }}</h3><p>{{ domain.value }}</p>
          <ul><li v-for="item in features(domain).slice(0, 8)" :key="`${domain.id}-${item.name}`">{{ item.name }}</li></ul>
          <footer><small>适用岗位：{{ domain.roles.join('、') }}</small><NuxtLink :to="`/products#capability-${getCapability(domain.capabilityIds[0])?.slug}`">查看详细能力 →</NuxtLink></footer>
        </article>
      </div>
    </div>
  </section>
</template>
