<template>
  <div class="kw-deployment-boundary">
    <article v-reveal>
      <span><UiLinearIcon name="cloud" :size="28" /></span>
      <h3>云端 SaaS</h3>
      <p>支持以云端 SaaS 方式使用，具体账号、范围与上线准备在项目确认后安排。</p>
    </article>
    <article v-reveal="80">
      <span><UiLinearIcon name="server" :size="28" /></span>
      <h3>私有化部署</h3>
      <p>需根据服务器、数据库、网络、安全和运维责任进行技术评估。</p>
    </article>
  </div>
</template>
