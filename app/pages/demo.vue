<script setup>
usePageSeo({
  title: '预约演示',
  description: '瞰维智管预约演示页面骨架，当前未连接任何提交或生产系统。',
})

const items = [
  { title: '需求信息占位', description: '后续确认必要字段、授权说明与数据保存范围。' },
  { title: '联系方式占位', description: '后续建立正式联系渠道，当前不收集访客数据。' },
  { title: '提交能力未启用', description: '本阶段没有后端接口、CRM 或企业微信集成。' },
]
</script>

<template>
  <PagePlaceholder
    eyebrow="Book a demo"
    title="预约演示"
    summary="预约演示页面路由已建立。当前不提供表单提交，也不会收集或发送任何访客信息。"
    :items="items"
  >
    <div class="notice-box" role="note">
      <strong>阶段说明</strong>
      <p>正式表单将在字段、隐私提示和数据流向全部确认后再实施。</p>
    </div>
  </PagePlaceholder>
</template>

