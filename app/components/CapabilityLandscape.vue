<script setup>
import { computed, ref } from 'vue'
import { megaMenuGroups, productCapabilities } from '~/data/product-capabilities'

defineProps({ compact: Boolean })

const activeGroup = ref(megaMenuGroups[0].name)
const currentGroup = computed(() => megaMenuGroups.find(group => group.name === activeGroup.value) || megaMenuGroups[0])
const currentCapabilities = computed(() => currentGroup.value.items.map(id => productCapabilities.find(item => item.id === id)).filter(Boolean))
</script>

<template>
  <div class="kw-cap-landscape" :class="{ 'is-compact': compact }">
    <div class="kw-cap-landscape__tabs" role="tablist" aria-label="园区经营能力分组">
      <button
        v-for="group in megaMenuGroups"
        :key="group.name"
        type="button"
        role="tab"
        :aria-selected="activeGroup === group.name"
        :class="{ 'is-active': activeGroup === group.name }"
        @click="activeGroup = group.name"
      >
        {{ group.name }}
      </button>
    </div>

    <Transition name="kw-product-panel" mode="out-in">
      <div :key="activeGroup" class="kw-cap-landscape__panel" role="tabpanel">
        <article v-for="capability in currentCapabilities" :key="capability.id">
          <div class="kw-cap-landscape__icon"><UiLinearIcon :name="capability.icon" :size="25" /></div>
          <div>
            <div class="kw-cap-landscape__title">
              <h3>{{ capability.name }}</h3>
              <CapabilityStatusTag :status="capability.status" compact />
            </div>
            <p>{{ capability.heroValue }}</p>
            <ul>
              <li v-for="item in capability.features.slice(0, compact ? 5 : 8)" :key="item.name">
                <span>{{ item.name }}</span>
                <CapabilityStatusTag :status="item.status" compact />
              </li>
            </ul>
            <NuxtLink :to="`/products#capability-${capability.slug}`">查看能力边界 <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </article>
      </div>
    </Transition>
  </div>
</template>
