<script setup>
import { getCapability } from '~/data/product-capabilities'

const groups = [
  { id: 'hardware', title: '软硬件连接', capability: getCapability('hardware') },
  { id: 'security', title: '权限与数据安全', capability: getCapability('security') },
]
</script>

<template>
  <section class="kw-section kw-v3-technology" aria-labelledby="technology-title"><div class="kw-container"><div v-reveal class="kw-section-heading"><span class="kw-section-kicker">软硬件、安全与部署</span><h2 id="technology-title">产品能力完整，启用条件清楚</h2><p>具体启用方式根据客户设备型号、协议、网络环境、服务器条件和实施范围确定。</p></div><div class="kw-v3-technology__grid"><article v-for="group in groups" :key="group.id" v-reveal><header><UiLinearIcon :name="group.capability.icon" :size="26" /><h3>{{ group.title }}</h3></header><p>{{ group.capability.systemAction }}</p><ul><li v-for="item in group.capability.features" :key="item.name">{{ item.name }}</li></ul></article></div></div></section>
</template>
