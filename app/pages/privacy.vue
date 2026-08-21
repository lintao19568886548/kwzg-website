<script setup>
usePageSeo({
  title: '隐私政策',
  description: '了解瞰维智管官网当前预约表单的数据处理边界与上线前隐私审核要求。',
})
</script>

<template>
  <PagePlaceholder
    eyebrow="Privacy"
    title="隐私政策"
    summary="当前预约表单只执行浏览器内校验，不发送、保存或上传访客填写的信息。正式上线前将根据实际启用功能完成隐私审核。"
  >
    <div class="policy-placeholder">
      <h2>当前数据处理说明</h2>
      <p>官网当前不包含远程表单提交、用户登录、统计追踪或生产系统接口，不主动收集访客个人信息。</p>
      <h2>上线前待确认事项</h2>
      <p>需要根据届时实际启用的功能明确收集范围、处理目的、保存期限、第三方共享和用户权利。</p>
    </div>
  </PagePlaceholder>
</template>
