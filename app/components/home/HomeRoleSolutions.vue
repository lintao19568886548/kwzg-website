<script setup>
import { getCapability, roleSolutions } from '~/data/product-capabilities'

const activeId = ref(roleSolutions[0].id)
const active = computed(() => roleSolutions.find(item => item.id === activeId.value) || roleSolutions[0])
</script>

<template>
  <section class="kw-section kw-v3-roles" aria-labelledby="roles-title"><div class="kw-container"><div v-reveal class="kw-section-heading"><span class="kw-section-kicker">按岗位看价值</span><h2 id="roles-title">每个角色，都看到自己最关心的经营问题</h2></div><div class="kw-v3-roles__tabs" role="tablist"><button v-for="item in roleSolutions" :key="item.id" type="button" role="tab" :aria-selected="activeId === item.id" :class="{ 'is-active': activeId === item.id }" @click="activeId = item.id">{{ item.name }}</button></div><Transition name="kw-product-panel" mode="out-in"><article :key="active.id" class="kw-v3-roles__panel"><div><span>岗位工作台</span><h3>{{ active.headline }}</h3><p>{{ active.description }}</p><NuxtLink to="/demo">预约岗位场景演示 →</NuxtLink></div><ul><li v-for="id in active.capabilities" :key="id"><UiLinearIcon :name="getCapability(id)?.icon" :size="21" /><span><strong>{{ getCapability(id)?.shortName }}</strong><small>{{ getCapability(id)?.businessValue }}</small></span></li></ul></article></Transition></div></section>
</template>
