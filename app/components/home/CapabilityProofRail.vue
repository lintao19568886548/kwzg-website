<script setup>
import { capabilityFeatureIndex, homeCapabilityDomains, systemShowcaseModules } from '~/data/product-capabilities'

const proofItems = [
  { value: systemShowcaseModules.length, suffix: '个', label: '真实系统模块', icon: 'chart' },
  { value: capabilityFeatureIndex.length, suffix: '项', label: '功能能力', icon: 'network' },
  { value: homeCapabilityDomains.length, suffix: '类', label: '园区解决方案', icon: 'building' },
  { value: 'SaaS', suffix: '＋', label: '云端私有化部署', icon: 'server' },
]
</script>

<template>
  <section class="kw-grand-proof" aria-label="瞰维智管产品能力概览">
    <div class="kw-container kw-grand-proof__grid">
      <article v-for="item in proofItems" :key="item.label">
        <UiLinearIcon :name="item.icon" :size="24" />
        <div>
          <strong>{{ item.value }}<small>{{ item.suffix }}</small></strong>
          <span>{{ item.label }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
