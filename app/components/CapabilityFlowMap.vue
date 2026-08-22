<script setup>
import { computed, ref } from 'vue'
import { businessFlows, getCapability } from '~/data/product-capabilities'

const activeFlow = ref(businessFlows[0].id)
const flow = computed(() => businessFlows.find(item => item.id === activeFlow.value) || businessFlows[0])
const steps = computed(() => flow.value.steps.map(getCapability).filter(Boolean))
</script>

<template>
  <div class="kw-full-flow">
    <div class="kw-full-flow__tabs" role="tablist" aria-label="园区经营协同路径">
      <button
        v-for="item in businessFlows"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="activeFlow === item.id"
        :class="{ 'is-active': activeFlow === item.id }"
        @click="activeFlow = item.id"
      >
        {{ item.name }}
      </button>
    </div>
    <Transition name="kw-product-panel" mode="out-in">
      <section :key="flow.id" class="kw-full-flow__body" role="tabpanel">
        <div class="kw-full-flow__copy"><h3>{{ flow.name }}</h3><p>{{ flow.description }}</p></div>
        <ol :style="{ '--kw-flow-count': steps.length }">
          <li v-for="(step, index) in steps" :key="step.id">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div><strong>{{ step.shortName }}</strong><small>{{ step.businessValue }}</small></div>
            <CapabilityStatusTag :status="step.status" compact />
            <i v-if="index < steps.length - 1" aria-hidden="true" />
          </li>
        </ol>
      </section>
    </Transition>
  </div>
</template>
