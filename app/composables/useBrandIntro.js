import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export const BRAND_INTRO_STORAGE_KEY = 'kwzg_brand_intro_seen_v1'
export const BRAND_INTRO_TIMINGS = Object.freeze({
  desktop: Object.freeze({ duration: 2800, watchdog: 3200 }),
  compact: Object.freeze({ duration: 1950, watchdog: 2400 }),
  reduced: Object.freeze({ duration: 650, watchdog: 900 }),
  skip: 200,
})

function getIntroMode() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.motion === 'off'
  if (reduced) return 'reduced'
  return window.matchMedia('(max-width: 48rem), (pointer: coarse), (update: slow)').matches
    ? 'compact'
    : 'desktop'
}

function restoreInlineStyle(element, property, value) {
  if (value) element.style.setProperty(property, value)
  else element.style.removeProperty(property)
}

export function useBrandIntro() {
  const rendered = ref(true)
  const active = ref(false)
  const exiting = ref(false)
  const mode = ref('desktop')
  const completionReason = ref('pending')

  let autoTimer
  let watchdogTimer
  let exitTimer
  let startedAt = 0
  let hiddenAt = 0
  let finished = false
  let lockSnapshot

  const reducedMotion = computed(() => mode.value === 'reduced')
  const compact = computed(() => mode.value === 'compact')
  const duration = computed(() => BRAND_INTRO_TIMINGS[mode.value].duration)
  const watchdogDuration = computed(() => BRAND_INTRO_TIMINGS[mode.value].watchdog)

  function clearTimers() {
    window.clearTimeout(autoTimer)
    window.clearTimeout(watchdogTimer)
    window.clearTimeout(exitTimer)
    autoTimer = undefined
    watchdogTimer = undefined
    exitTimer = undefined
  }

  function markSeen() {
    try {
      window.sessionStorage.setItem(BRAND_INTRO_STORAGE_KEY, '1')
    } catch {
      // The pre-paint guard defaults to skipping when sessionStorage is unavailable.
    }
  }

  function lockScroll() {
    if (lockSnapshot) return
    const root = document.documentElement
    const body = document.body
    const scrollbarGap = Math.max(0, window.innerWidth - root.clientWidth)
    const computedBodyPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0

    lockSnapshot = {
      rootOverflow: root.style.getPropertyValue('overflow'),
      bodyOverflow: body.style.getPropertyValue('overflow'),
      bodyPaddingRight: body.style.getPropertyValue('padding-right'),
    }

    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbarGap > 0) body.style.paddingRight = `${computedBodyPadding + scrollbarGap}px`
    root.dataset.kwzgIntroLock = 'true'
  }

  function unlockScroll() {
    if (!lockSnapshot) return
    const root = document.documentElement
    const body = document.body
    restoreInlineStyle(root, 'overflow', lockSnapshot.rootOverflow)
    restoreInlineStyle(body, 'overflow', lockSnapshot.bodyOverflow)
    restoreInlineStyle(body, 'padding-right', lockSnapshot.bodyPaddingRight)
    delete root.dataset.kwzgIntroLock
    lockSnapshot = undefined
  }

  function focusMainContent() {
    window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    })
  }

  function announceCompletion(reason, focusMain = false) {
    completionReason.value = reason
    document.documentElement.dataset.kwzgIntro = 'done'
    window.dispatchEvent(new CustomEvent('kwzg:intro-complete', { detail: { reason } }))
    if (focusMain) focusMainContent()
  }

  function complete(reason = 'complete', { focusMain = false } = {}) {
    if (finished) return
    finished = true
    clearTimers()
    active.value = false
    exiting.value = false
    unlockScroll()
    markSeen()
    removeListeners()
    announceCompletion(reason, focusMain)
    rendered.value = false
  }

  function skip({ focusMain = false } = {}) {
    if (finished || exiting.value) return
    exiting.value = true
    markSeen()
    window.clearTimeout(autoTimer)
    autoTimer = undefined
    exitTimer = window.setTimeout(
      () => complete('skipped', { focusMain }),
      BRAND_INTRO_TIMINGS.skip,
    )
  }

  function handleKeydown(event) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    skip({ focusMain: true })
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      hiddenAt = window.performance.now()
      return
    }

    if (!hiddenAt) return
    hiddenAt = 0
    if (window.performance.now() - startedAt >= duration.value) complete('visibility-timeout')
  }

  function addListeners() {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  function removeListeners() {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  function start() {
    if (document.documentElement.dataset.kwzgIntro !== 'show') {
      rendered.value = false
      return
    }

    try {
      mode.value = getIntroMode()
      startedAt = window.performance.now()
      lockScroll()
      addListeners()
      active.value = true
      autoTimer = window.setTimeout(() => complete('complete'), duration.value)
      watchdogTimer = window.setTimeout(() => complete('watchdog'), watchdogDuration.value)
    } catch {
      complete('initialization-error')
    }
  }

  function handleCanvasUnavailable() {
    complete('canvas-unavailable')
  }

  onMounted(start)
  onBeforeUnmount(() => {
    if (!finished) complete('route-change')
    else {
      clearTimers()
      unlockScroll()
      removeListeners()
    }
  })

  return {
    active,
    compact,
    completionReason,
    duration,
    exiting,
    handleCanvasUnavailable,
    reducedMotion,
    rendered,
    skip,
    watchdogDuration,
  }
}
