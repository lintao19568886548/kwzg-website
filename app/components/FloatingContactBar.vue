<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ContactPopover from '~/components/ContactPopover.vue'
import UiLinearIcon from '~/components/ui/LinearIcon.vue'

const route = useRoute()
const rootElement = ref(null)
const wecomButton = ref(null)
const phoneButton = ref(null)
const mobileMenuButton = ref(null)
const panelComponent = ref(null)
const activePanel = ref(null)
const pinnedPanel = ref(null)
const isMobile = ref(false)
const showBackTop = ref(false)
const scrollProgress = ref(0)
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const scrollThreshold = 520
let mobileMedia
let reducedMotionMedia
let closeTimer
let animationFrame
let previousBodyOverflow = ''
let bodyLocked = false

function clearCloseTimer() {
  if (closeTimer) window.clearTimeout(closeTimer)
  closeTimer = undefined
}

function setBodyLock(shouldLock) {
  if (shouldLock === bodyLocked) return
  if (shouldLock) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
  bodyLocked = shouldLock
}

function focusTrigger(kind) {
  const target = isMobile.value || kind === 'menu'
    ? mobileMenuButton.value
    : kind === 'phone'
      ? phoneButton.value
      : wecomButton.value
  target?.focus()
}

async function closePanel({ restoreFocus = false } = {}) {
  const previousPanel = activePanel.value
  clearCloseTimer()
  activePanel.value = null
  pinnedPanel.value = null
  if (restoreFocus && previousPanel) {
    await nextTick()
    focusTrigger(previousPanel)
  }
}

function openOnHover(kind) {
  if (isMobile.value) return
  clearCloseTimer()
  activePanel.value = kind
  pinnedPanel.value = null
}

function scheduleHoverClose() {
  if (isMobile.value || pinnedPanel.value) return
  clearCloseTimer()
  closeTimer = window.setTimeout(() => closePanel(), 150)
}

function toggleDesktopPanel(kind) {
  clearCloseTimer()
  if (activePanel.value === kind && pinnedPanel.value === kind) {
    closePanel({ restoreFocus: true })
    return
  }
  activePanel.value = kind
  pinnedPanel.value = kind
}

function handleWecomClick() {
  toggleDesktopPanel('wecom')
}

function toggleMobileMenu() {
  if (activePanel.value === 'menu') {
    closePanel({ restoreFocus: true })
    return
  }
  activePanel.value = 'menu'
  pinnedPanel.value = 'menu'
}

function handleMobileSelect(kind) {
  activePanel.value = kind
  pinnedPanel.value = kind
}

async function handleMobileBackTop() {
  await closePanel()
  backToTop()
}

function updateScrollState() {
  animationFrame = undefined
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const current = Math.max(0, window.scrollY)
  showBackTop.value = maximum > scrollThreshold && current > scrollThreshold
  scrollProgress.value = maximum ? Math.min(1, current / maximum) : 0
}

function queueScrollUpdate() {
  if (!animationFrame) animationFrame = window.requestAnimationFrame(updateScrollState)
}

function backToTop() {
  const motionDisabled = reducedMotionMedia?.matches || document.documentElement.dataset.motion === 'off'
  window.scrollTo({ top: 0, behavior: motionDisabled ? 'auto' : 'smooth' })
  document.getElementById('main-content')?.focus({ preventScroll: true })
}

function handleDocumentPointerDown(event) {
  if (activePanel.value && !rootElement.value?.contains(event.target)) closePanel()
}

function handleDocumentKeydown(event) {
  if (!activePanel.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel({ restoreFocus: true })
  } else if (isMobile.value && event.key === 'Tab') {
    panelComponent.value?.trapFocus(event)
  }
}

function handleMobileChange(event) {
  isMobile.value = event.matches
  if (activePanel.value) closePanel()
  queueScrollUpdate()
}

watch([activePanel, isMobile], async ([panel, mobile]) => {
  setBodyLock(Boolean(panel && mobile))
  if (panel && mobile) {
    await nextTick()
    panelComponent.value?.focusClose()
  }
})

watch(() => route.fullPath, () => {
  closePanel()
  nextTick(queueScrollUpdate)
})

onMounted(() => {
  mobileMedia = window.matchMedia('(max-width: 48rem)')
  reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
  isMobile.value = mobileMedia.matches
  mobileMedia.addEventListener('change', handleMobileChange)
  window.addEventListener('scroll', queueScrollUpdate, { passive: true })
  window.addEventListener('resize', queueScrollUpdate, { passive: true })
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
  updateScrollState()
})

onBeforeUnmount(() => {
  clearCloseTimer()
  if (animationFrame) window.cancelAnimationFrame(animationFrame)
  mobileMedia?.removeEventListener('change', handleMobileChange)
  window.removeEventListener('scroll', queueScrollUpdate)
  window.removeEventListener('resize', queueScrollUpdate)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
  setBodyLock(false)
})
</script>

<template>
  <aside
    v-if="!isAdminRoute"
    ref="rootElement"
    class="kw-floating-contact"
    aria-label="联系与页面服务"
    data-floating-contact-bar
  >
    <Transition name="kw-contact-popover">
      <ContactPopover
        v-if="activePanel"
        ref="panelComponent"
        :variant="activePanel"
        :mobile="isMobile"
        @close="closePanel({ restoreFocus: true })"
        @select="handleMobileSelect"
        @back-top="handleMobileBackTop"
        @mouseenter="clearCloseTimer"
        @mouseleave="scheduleHoverClose"
      />
    </Transition>

    <div class="kw-floating-contact__rail" role="group" aria-label="快捷联系">
      <button
        ref="mobileMenuButton"
        type="button"
        class="kw-floating-contact__action kw-floating-contact__mobile-trigger"
        :class="{ 'is-active': activePanel }"
        aria-label="打开联系与页面服务"
        aria-controls="kw-floating-contact-panel"
        :aria-expanded="Boolean(activePanel)"
        @click="toggleMobileMenu"
      >
        <UiLinearIcon name="message" :size="24" />
        <span>联系服务</span>
      </button>

      <button
        ref="wecomButton"
        type="button"
        class="kw-floating-contact__action kw-floating-contact__desktop-action"
        :class="{ 'is-active': activePanel === 'wecom' }"
        aria-label="联系客服"
        aria-controls="kw-floating-contact-panel"
        :aria-expanded="activePanel === 'wecom'"
        data-contact-action="wecom"
        @mouseenter="openOnHover('wecom')"
        @mouseleave="scheduleHoverClose"
        @click="handleWecomClick"
      >
        <UiLinearIcon name="message" :size="24" />
        <span>联系客服</span>
      </button>

      <button
        ref="phoneButton"
        type="button"
        class="kw-floating-contact__action kw-floating-contact__desktop-phone kw-floating-contact__desktop-action"
        :class="{ 'is-active': activePanel === 'phone' }"
        aria-label="电话咨询"
        aria-controls="kw-floating-contact-panel"
        :aria-expanded="activePanel === 'phone'"
        data-contact-action="phone-desktop"
        @mouseenter="openOnHover('phone')"
        @mouseleave="scheduleHoverClose"
        @click="toggleDesktopPanel('phone')"
      >
        <UiLinearIcon name="phone" :size="24" />
        <span>电话咨询</span>
      </button>

      <Transition name="kw-back-top">
        <button
          v-if="showBackTop"
          type="button"
          class="kw-floating-contact__action kw-floating-contact__back-top kw-floating-contact__desktop-action"
          aria-label="返回页面顶部"
          data-contact-action="back-top"
          :style="{ '--kw-scroll-progress': `${scrollProgress * 360}deg` }"
          @click="backToTop"
        >
          <UiLinearIcon name="arrow-up" :size="24" />
          <span>返回顶部</span>
        </button>
      </Transition>
    </div>
  </aside>
</template>
