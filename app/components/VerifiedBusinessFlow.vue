<script setup>
import { verifiedCapabilities } from '~/data/verified-capabilities'

const activeId = ref('overview')
const activeCapability = computed(() => verifiedCapabilities.find(item => item.id === activeId.value) || verifiedCapabilities[0])
const mainLine = verifiedCapabilities.filter(item => ['leasing', 'followup', 'contract', 'bill'].includes(item.id))
const serviceLine = verifiedCapabilities.find(item => item.id === 'repair')
</script>

<template>
  <div class="kw-verified-flow">
    <div class="kw-verified-flow__map" aria-label="已核实能力关系图">
      <button type="button" :class="{ 'is-active': activeId === 'overview' }" @click="activeId = 'overview'">
        <small>1 个中心</small><strong>园区经营总览</strong>
      </button>
      <div class="kw-verified-flow__mainline">
        <span>4 步主线</span>
        <button v-for="item in mainLine" :key="item.id" type="button" :class="{ 'is-active': activeId === item.id }" @click="activeId = item.id">{{ item.title }}</button>
      </div>
      <div class="kw-verified-flow__branch">
        <span>1 个服务支线</span>
        <button type="button" :class="{ 'is-active': activeId === serviceLine.id }" @click="activeId = serviceLine.id">{{ serviceLine.title }}</button>
      </div>
    </div>

    <Transition name="kw-product-panel" mode="out-in">
      <article :key="activeCapability.id" class="kw-verified-flow__preview">
        <div>
          <span>{{ activeCapability.source }}</span>
          <h3>{{ activeCapability.title }}</h3>
          <p>{{ activeCapability.usage }}</p>
          <small>{{ activeCapability.boundary }}</small>
        </div>
        <HomeDashboardOverview v-if="activeCapability.type === 'overview'" />
        <HomeInterfacePreview v-else :type="activeCapability.type" :title="activeCapability.title" />
      </article>
    </Transition>
  </div>
</template>
