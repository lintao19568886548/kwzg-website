<script setup>
import { computed, ref } from 'vue'
import { siteConfig } from '~/config/site'
import UiLinearIcon from '~/components/ui/LinearIcon.vue'

const props = defineProps({
  variant: {
    type: String,
    required: true,
    validator: value => ['wecom', 'phone', 'menu'].includes(value),
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'select', 'back-top'])
const isDevelopment = import.meta.dev
const panelElement = ref(null)
const closeButton = ref(null)
const titleId = computed(() => `kw-contact-${props.variant}-title`)

function focusClose() {
  closeButton.value?.focus()
}

function trapFocus(event) {
  if (!props.mobile || event.key !== 'Tab') return
  const focusable = [...(panelElement.value?.querySelectorAll('a[href], button:not([disabled])') || [])]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

defineExpose({ focusClose, trapFocus })
</script>

<template>
  <div
    :class="mobile ? 'kw-contact-overlay' : 'kw-contact-popover-host'"
    data-contact-panel-host
    @click.self="emit('close')"
  >
    <section
      id="kw-floating-contact-panel"
      ref="panelElement"
      class="kw-contact-panel"
      :class="[`is-${variant}`, { 'is-mobile': mobile }]"
      :role="mobile ? 'dialog' : 'region'"
      :aria-modal="mobile ? 'true' : undefined"
      :aria-labelledby="titleId"
      data-contact-panel
    >
      <header class="kw-contact-panel__header">
        <div>
          <span>{{ variant === 'wecom' ? '官方客服' : variant === 'phone' ? '电话咨询' : '快捷服务' }}</span>
          <h2 :id="titleId">{{ variant === 'wecom' ? '微信咨询' : variant === 'phone' ? '微信扫码拨打电话' : '联系瞰维智管' }}</h2>
        </div>
        <button ref="closeButton" type="button" aria-label="关闭联系面板" @click="emit('close')">
          <UiLinearIcon name="close" :size="20" />
        </button>
      </header>

      <template v-if="variant === 'menu'">
        <p>请选择需要的联系或页面服务。</p>
        <div class="kw-contact-panel__mobile-actions">
          <button type="button" @click="emit('select', 'wecom')"><UiLinearIcon name="message" :size="22" /><span><strong>联系客服</strong><small>添加企业微信官方客服</small></span></button>
          <button type="button" @click="emit('select', 'phone')"><UiLinearIcon name="phone" :size="22" /><span><strong>电话咨询</strong><small>微信扫码打开拨号页面</small></span></button>
          <button type="button" @click="emit('back-top')"><UiLinearIcon name="arrow-up" :size="22" /><span><strong>返回顶部</strong><small>回到当前页面顶部</small></span></button>
        </div>
      </template>

      <template v-else-if="variant === 'wecom'">
        <p>长按或扫码添加企业微信<br>获取园区管理解决方案</p>
        <div class="kw-contact-panel__qr-wrap">
          <img
            :src="siteConfig.wecom.qrImage"
            width="168"
            height="168"
            loading="lazy"
            decoding="async"
            alt="瞰维智管企业微信客服二维码"
          >
        </div>
        <small v-if="mobile">长按识别二维码</small>
        <small v-else>{{ siteConfig.wecom.displayName }}</small>
      </template>

      <template v-else-if="variant === 'phone'">
        <a class="kw-contact-panel__phone" :href="siteConfig.contact.phoneHref">{{ siteConfig.contact.phone }}</a>
        <div class="kw-contact-panel__qr-wrap">
          <img
            :src="siteConfig.contact.phoneQr"
            width="168"
            height="168"
            loading="lazy"
            decoding="async"
            :alt="`扫码打开${siteConfig.contact.phone}的拨号页面`"
          >
        </div>
        <small>扫码后打开拨号页面，请按手机提示确认拨打。</small>
        <small v-if="isDevelopment" class="kw-contact-panel__development-notice">
          当前为本地预览，二维码将在官网正式上线后进行微信真机验证。
        </small>
      </template>
    </section>
  </div>
</template>
