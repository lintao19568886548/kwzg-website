<script setup>
defineProps({ src: { type: String, required: true }, alt: { type: String, required: true }, eager: { type: Boolean, default: false } })
</script>

<template>
  <figure class="kw-system-frame"><div class="kw-system-frame__bar"><span /><span /><span /><small>瞰维智管 · 真实系统界面</small></div><img :src="src" :alt="alt" width="1440" height="810" :loading="eager ? 'eager' : 'lazy'" decoding="async"><figcaption>界面结构与功能来自瞰维智管，数字和名称均为安全演示数据。</figcaption></figure>
</template>
