<script setup>
import { getCapability } from '~/data/product-capabilities'

const capability = getCapability('ai')
const scenarios = ['业务场景', 'AI处理', '人员确认', '结果写回系统']
</script>

<template>
  <section class="kw-section kw-v3-ai" aria-labelledby="ai-title"><div class="kw-container"><div v-reveal class="kw-section-heading kw-section-heading--split"><div><span class="kw-section-kicker">AI 智能增强</span><h2 id="ai-title">让 AI 做重复工作，把最终判断留给人</h2></div><p>AI 招商、催缴、OCR、异常分析与经营问答等模块仍在持续开发完善，具体启用范围与交付时间以项目实际情况为准。</p></div><div class="kw-v3-ai__flow"><span v-for="(item, index) in scenarios" :key="item"><small>0{{ index + 1 }}</small>{{ item }}</span></div><div class="kw-v3-ai__grid"><article v-for="item in capability.features" :key="item.name" v-reveal><UiLinearIcon name="network" :size="22" /><h3>{{ item.name }}</h3><p>{{ item.description }}</p></article></div><p class="kw-boundary-note">{{ capability.boundary }}</p></div></section>
</template>
