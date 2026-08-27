import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export function useAutoplayCarousel({
  root,
  activeIndex,
  itemCount,
  interval = 6500,
  startDelay = 1200,
  // Long editorial chapters can be taller than the viewport. A 60% threshold
  // therefore never becomes reachable on common laptop screens, leaving the
  // carousel in its waiting state. Twenty percent still guarantees that the
  // chapter is meaningfully on screen without blocking autoplay.
  visibilityThreshold = 0.2,
  desktopOnly = true,
}) {
  const autoplayState = ref('waiting')
  const isVisible = ref(false)
  const isHovered = ref(false)
  const hasFocus = ref(false)
  const pageHidden = ref(false)
  const introReady = ref(true)
  const allowResume = ref(false)
  let intersectionObserver
  let motionObserver
  let startTimer
  let autoplayTimer

  const autoplayPaused = computed(() => (
    isHovered.value
    || hasFocus.value
    || pageHidden.value
    || !isVisible.value
    || !introReady.value
  ))

  function mediaMatches(query) {
    return typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  }

  function reducedMotion() {
    return mediaMatches('(prefers-reduced-motion: reduce)')
      || document.documentElement.dataset.motion === 'off'
  }

  function isMobile() {
    return desktopOnly && mediaMatches('(max-width: 48rem), (pointer: coarse)')
  }

  function canAutoplay() {
    return !isMobile() && !reducedMotion()
  }

  function clearTimers() {
    if (typeof window === 'undefined') return
    window.clearTimeout(startTimer)
    window.clearTimeout(autoplayTimer)
    startTimer = undefined
    autoplayTimer = undefined
  }

  function clearAdvanceTimer() {
    if (typeof window === 'undefined') return
    window.clearTimeout(autoplayTimer)
    autoplayTimer = undefined
  }

  function scheduleNext() {
    if (typeof window === 'undefined') return
    clearAdvanceTimer()
    if (autoplayState.value !== 'playing' || autoplayPaused.value) return
    autoplayTimer = window.setTimeout(() => {
      activeIndex.value = (activeIndex.value + 1) % itemCount
      scheduleNext()
    }, interval)
  }

  function beginAutoplay() {
    if (typeof window === 'undefined') return
    clearTimers()
    if (!canAutoplay() || !introReady.value || !isVisible.value) {
      autoplayState.value = canAutoplay() ? 'waiting' : 'manual'
      return
    }
    autoplayState.value = 'waiting'
    startTimer = window.setTimeout(() => {
      if (!isVisible.value || !introReady.value || !canAutoplay()) return
      autoplayState.value = 'playing'
      scheduleNext()
    }, startDelay)
  }

  function restartCycle() {
    if (typeof window === 'undefined') return
    clearAdvanceTimer()
    scheduleNext()
  }

  function pause() {
    clearTimers()
    autoplayState.value = 'manual'
  }

  function resume() {
    if (typeof window === 'undefined' || !canAutoplay()) return
    autoplayState.value = 'playing'
    scheduleNext()
  }

  function setHovered(value) {
    isHovered.value = value
  }

  function setFocused(value) {
    hasFocus.value = value
  }

  function handleVisibility() {
    pageHidden.value = document.hidden
    if (pageHidden.value) clearAdvanceTimer()
    else scheduleNext()
  }

  function handleIntroComplete() {
    introReady.value = true
    beginAutoplay()
  }

  function syncMotionCapability() {
    allowResume.value = canAutoplay()
    if (!allowResume.value) {
      clearTimers()
      autoplayState.value = 'manual'
    } else if (autoplayState.value === 'waiting' && isVisible.value) {
      beginAutoplay()
    }
  }

  onMounted(() => {
    introReady.value = document.documentElement.dataset.kwzgIntro !== 'show'
    pageHidden.value = document.hidden
    syncMotionCapability()

    if (typeof MutationObserver === 'function') {
      motionObserver = new MutationObserver(syncMotionCapability)
      motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    }

    if (typeof IntersectionObserver === 'function') {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible.value = entry.isIntersecting && entry.intersectionRatio >= visibilityThreshold
        if (isVisible.value && autoplayState.value === 'waiting') beginAutoplay()
        else if (isVisible.value) scheduleNext()
        else clearAdvanceTimer()
      }, { threshold: [0, visibilityThreshold, 1] })
      if (root.value) intersectionObserver.observe(root.value)
    } else {
      isVisible.value = true
      beginAutoplay()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('kwzg:intro-complete', handleIntroComplete)
  })

  onBeforeUnmount(() => {
    clearTimers()
    intersectionObserver?.disconnect()
    motionObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('kwzg:intro-complete', handleIntroComplete)
  })

  watch(autoplayPaused, (paused) => {
    if (typeof window === 'undefined') return
    if (paused) clearAdvanceTimer()
    else scheduleNext()
  })

  return {
    allowResume,
    autoplayState,
    pause,
    restartCycle,
    resume,
    setFocused,
    setHovered,
  }
}
