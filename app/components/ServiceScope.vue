<script setup>
import { capabilityStatuses, productCapabilities } from '~/data/product-capabilities'

const groups = Object.values(capabilityStatuses).map(meta => ({
  ...meta,
  items: productCapabilities.filter(item => item.status === meta.id),
}))
</script>

<template>
  <div class="kw-service-scope kw-service-scope--status">
    <article v-for="group in groups" :key="group.id" v-reveal :class="`is-${group.id}`">
      <CapabilityStatusTag :status="group.id" />
      <p>{{ group.description }}</p>
      <ul><li v-for="item in group.items" :key="item.id"><NuxtLink :to="`/products#capability-${item.slug}`">{{ item.name }}</NuxtLink></li></ul>
    </article>
  </div>
</template>
