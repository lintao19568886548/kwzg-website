<script setup>
import { computed, ref } from 'vue'
import { getCapability, roleSolutions } from '~/data/product-capabilities'

const activeRole = ref(roleSolutions[0].id)
const role = computed(() => roleSolutions.find(item => item.id === activeRole.value) || roleSolutions[0])
const capabilities = computed(() => role.value.capabilities.map(getCapability).filter(Boolean))
</script>

<template>
  <div class="kw-role-explorer">
    <div class="kw-role-explorer__tabs" role="tablist" aria-label="按岗位查看解决方案">
      <button
        v-for="item in roleSolutions"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="activeRole === item.id"
        :class="{ 'is-active': activeRole === item.id }"
        @click="activeRole = item.id"
      >
        {{ item.name }}
      </button>
    </div>
    <Transition name="kw-product-panel" mode="out-in">
      <section :key="role.id" class="kw-role-explorer__panel" role="tabpanel">
        <header><span>岗位方案</span><h3>{{ role.headline }}</h3><p>{{ role.description }}</p></header>
        <div>
          <article v-for="capability in capabilities" :key="capability.id">
            <div><UiLinearIcon :name="capability.icon" :size="22" /><strong>{{ capability.shortName }}</strong></div>
            <CapabilityStatusTag :status="capability.deliveryMode" compact />
            <p>{{ capability.businessValue }}</p>
          </article>
        </div>
      </section>
    </Transition>
  </div>
</template>
