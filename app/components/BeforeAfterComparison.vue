<script setup>
const comparisons = [
  ['信息分散', '信息集中查看'],
  ['反复询问', '统一查询'],
  ['交接依赖个人', '记录更容易交接'],
  ['报修过程不清楚', '事项可以持续查询'],
]
</script>

<template>
  <div class="kw-before-after">
    <article v-for="(item, index) in comparisons" :key="item[0]" v-reveal :style="{ '--kw-reveal-delay': `${index * 70}ms` }">
      <span>{{ item[0] }}</span>
      <i aria-hidden="true">→</i>
      <strong>{{ item[1] }}</strong>
    </article>
  </div>
</template>
