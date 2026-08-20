<script setup>
usePageSeo({
  title: '隐私政策',
  description: '瞰维智管隐私政策页面骨架，正式政策将在上线前完成审核。',
})
</script>

<template>
  <PagePlaceholder
    eyebrow="Privacy"
    title="隐私政策"
    summary="本页面为隐私政策路由骨架，不构成正式隐私政策。正式文本需在上线前结合实际数据处理流程完成审核。"
  >
    <div class="policy-placeholder">
      <h2>当前阶段的数据处理说明</h2>
      <p>此项目基线不包含表单提交、用户登录、统计追踪或生产系统接口，不主动收集访客个人信息。</p>
      <h2>上线前待确认事项</h2>
      <p>需要根据届时实际启用的功能明确收集范围、处理目的、保存期限、第三方共享和用户权利。</p>
    </div>
  </PagePlaceholder>
</template>

