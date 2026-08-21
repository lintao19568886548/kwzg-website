<script setup>
import { siteConfig } from '~/config/site'
</script>

<template>
  <div class="kw-qr-placeholder">
    <img
      v-if="siteConfig.wecom.qrImage"
      :src="siteConfig.wecom.qrImage"
      :alt="`${siteConfig.wecom.displayName}企业微信二维码`"
      width="480"
      height="480"
      loading="eager"
      decoding="async"
    >
    <div v-else class="kw-qr-placeholder__missing" role="img" aria-label="企业微信二维码待补充">
      <UiLinearIcon name="mobile" :size="30" />
      <span>二维码素材待补充</span>
    </div>
    <strong>{{ siteConfig.wecom.displayName }}</strong>
    <span>企业微信认证主体：{{ siteConfig.wecom.verification }}</span>
  </div>
</template>
