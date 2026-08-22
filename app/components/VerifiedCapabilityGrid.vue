<script setup>
import { verifiedCapabilities } from '~/data/verified-capabilities'

defineProps({
  compact: Boolean,
})
</script>

<template>
  <div class="kw-verified-capability-grid" :class="{ 'is-compact': compact }">
    <article v-for="(capability, index) in verifiedCapabilities" :key="capability.id" v-reveal>
      <div class="kw-verified-capability-grid__top">
        <span><UiLinearIcon :name="capability.icon" :size="25" /></span>
        <small>{{ String(index + 1).padStart(2, '0') }}</small>
      </div>
      <h3>{{ capability.title }}</h3>
      <dl>
        <div><dt>适用场景</dt><dd>{{ capability.scenario }}</dd></div>
        <div><dt>集中查看</dt><dd>{{ capability.canView.join('、') }}</dd></div>
      </dl>
      <p>{{ capability.value }}</p>
      <NuxtLink :to="`/products#product-tab-${capability.id}`">查看真实界面 <span aria-hidden="true">→</span></NuxtLink>
    </article>
  </div>
</template>
