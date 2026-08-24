<script setup>
import { operationValuePoints } from '~/data/product-capabilities'
</script>

<template>
  <section class="kw-section kw-v3-values" aria-labelledby="home-results-title">
    <div class="kw-container">
      <div v-reveal class="kw-section-heading kw-section-heading--split">
        <div><span class="kw-section-kicker">四大经营结果</span><h2 id="home-results-title">让系统协同，真正落到经营结果</h2></div>
        <p>不使用虚假量化数字，围绕增收、降本、提效和控风险，把日常工作连接成可追踪的经营过程。</p>
      </div>
      <div class="kw-v3-values__grid">
        <article v-for="(item, index) in operationValuePoints" :key="item.title" v-reveal>
          <header><span>0{{ index + 1 }}</span><UiLinearIcon :name="item.icon" :size="26" /></header>
          <h3>{{ item.title }}</h3><p>{{ item.text }}</p>
          <ul><li v-for="label in item.items" :key="label">{{ label }}</li></ul>
        </article>
      </div>
    </div>
  </section>
</template>
