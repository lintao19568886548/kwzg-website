<script setup>
defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="page-hero">
    <div class="container narrow-container">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="page-summary">{{ summary }}</p>

      <div v-if="items.length" class="placeholder-grid">
        <article
          v-for="item in items"
          :key="item.title"
          class="placeholder-card"
        >
          <span class="status-dot" aria-hidden="true" />
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
        </article>
      </div>

      <slot />
    </div>
  </section>
</template>

