<script setup>
const items = ['资产范围', '使用岗位', '现有资料', '使用模块', '部署偏好', '项目边界']
</script>

<template>
  <div class="kw-readiness-grid">
    <article v-for="(item, index) in items" :key="item" v-reveal :style="{ '--kw-reveal-delay': `${index * 60}ms` }">
      <span>{{ String(index + 1).padStart(2, '0') }}</span>
      <h3>{{ item }}</h3>
      <p>在演示与范围确认前共同梳理，避免把未确认事项写成固定承诺。</p>
    </article>
  </div>
</template>
