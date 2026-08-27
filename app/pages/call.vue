<script setup>
import { siteConfig } from '~/config/site'
import MotionReveal from '~/components/motion/MotionReveal.vue'
import { createSingleDialAttempt, shouldAttemptAutomaticDial } from '~/utils/phone-call'

definePageMeta({ layout: false })

const pageTitle = `电话咨询｜${siteConfig.brand.name}`
const pageDescription = `拨打瞰维智管电话${siteConfig.contact.phone}，咨询园区管理数字化解决方案。`

useHead({
  title: pageTitle,
  titleTemplate: null,
  link: [{ rel: 'canonical', href: siteConfig.contact.callUrl }],
})

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  robots: 'noindex, nofollow',
  ogTitle: pageTitle,
  ogDescription: pageDescription,
})

const callStatus = ref('正在为您打开拨号界面…')
let attemptTimer

const attemptAutomaticDial = createSingleDialAttempt(siteConfig.contact.phoneHref, (phoneHref) => {
  window.location.href = phoneHref
})

onMounted(() => {
  if (!shouldAttemptAutomaticDial(navigator.userAgent)) {
    callStatus.value = '请点击“立即拨打”打开拨号界面。'
    return
  }

  attemptTimer = window.setTimeout(() => {
    callStatus.value = '如未自动唤起，请点击“立即拨打”。'
    attemptAutomaticDial()
  }, 180)
})

onBeforeUnmount(() => {
  window.clearTimeout(attemptTimer)
})
</script>

<template>
  <main id="main-content" class="kw-call-page" tabindex="-1">
    <MotionReveal as="section" class="kw-call-card" aria-labelledby="call-title">
      <div class="kw-call-card__brand">
        <BrandLogo />
      </div>
      <span class="kw-call-card__eyebrow">官方咨询电话</span>
      <h1 id="call-title">电话咨询</h1>
      <p class="kw-call-card__status" role="status" aria-live="polite">{{ callStatus }}</p>
      <a
        class="kw-call-card__number"
        :href="siteConfig.contact.phoneHref"
        :aria-label="`拨打电话 ${siteConfig.contact.phone}`"
      >
        <UiLinearIcon name="phone" :size="22" aria-hidden="true" />
        {{ siteConfig.contact.phone }}
      </a>
      <p class="kw-call-card__hint">如未自动唤起，请点击下方按钮</p>
      <a class="kw-button kw-button--primary kw-call-card__button" :href="siteConfig.contact.phoneHref">
        <UiLinearIcon name="phone" :size="20" aria-hidden="true" />
        立即拨打
      </a>
      <NuxtLink class="kw-call-card__back" to="/">返回瞰维智管官网</NuxtLink>
      <small>拨号前，手机系统可能会要求您确认。</small>
    </MotionReveal>
  </main>
</template>
