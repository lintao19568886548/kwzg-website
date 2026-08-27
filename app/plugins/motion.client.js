export default defineNuxtPlugin((nuxtApp) => {
  const revealCleanupTimers = new WeakMap()
  const motionPreference = useMotionPreference()
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')

  const clearRevealState = (element) => {
    const timer = revealCleanupTimers.get(element)
    if (timer) clearTimeout(timer)
    revealCleanupTimers.delete(element)
    delete element.dataset.revealState
    delete element.dataset.reveal
    element.style.removeProperty('--kw-reveal-delay')
  }

  const finishReveal = (element) => {
    const delay = Number.parseFloat(window.getComputedStyle(element).getPropertyValue('--kw-reveal-delay')) || 0
    const timer = window.setTimeout(() => clearRevealState(element), delay + 760)
    revealCleanupTimers.set(element, timer)
  }

  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.dataset.revealState = 'visible'
        revealObserver.unobserve(entry.target)
        finishReveal(entry.target)
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })

  const activeObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.dataset.motionActive = entry.isIntersecting ? 'true' : 'false'
    }
  }, { threshold: 0.05 })

  const revealPendingImmediately = () => {
    document.querySelectorAll('[data-reveal-state="pending"]').forEach((element) => {
      revealObserver.unobserve(element)
      element.dataset.revealState = 'visible'
      finishReveal(element)
    })
  }

  const updateMotionMode = (search) => {
    const mode = motionPreference.sync({
      search,
      reducedMotion: media.matches,
      hidden: document.hidden,
    })
    if (mode === 'off') revealPendingImmediately()
  }
  const syncMotionFromLocation = () => updateMotionMode(window.location.search)
  const updateVisibility = () => {
    motionPreference.sync({
      search: window.location.search,
      reducedMotion: media.matches,
      hidden: document.hidden,
    })
  }

  syncMotionFromLocation()
  updateVisibility()
  media.addEventListener('change', syncMotionFromLocation)
  document.addEventListener('visibilitychange', updateVisibility)
  const removeRouteHook = nuxtApp.$router.afterEach((to) => {
    const targetSearch = new URL(to.fullPath, window.location.origin).search
    updateMotionMode(targetSearch)
  })

  nuxtApp.vueApp.directive('reveal', {
    mounted(element, binding) {
      element.dataset.reveal = binding.arg || 'up'
      if (binding.value) element.style.setProperty('--kw-reveal-delay', `${Number(binding.value)}ms`)
      if (document.documentElement.dataset.motion === 'off') {
        element.dataset.revealState = 'visible'
        finishReveal(element)
        return
      }
      element.dataset.revealState = 'pending'
      revealObserver.observe(element)
    },
    unmounted(element) {
      revealObserver.unobserve(element)
      clearRevealState(element)
    },
  })

  nuxtApp.vueApp.directive('motion-active', {
    mounted(element) {
      element.dataset.motionActive = 'false'
      activeObserver.observe(element)
    },
    unmounted(element) {
      activeObserver.unobserve(element)
    },
  })

  nuxtApp.hook('app:beforeUnmount', () => {
    removeRouteHook()
    revealObserver.disconnect()
    activeObserver.disconnect()
    media.removeEventListener('change', syncMotionFromLocation)
    document.removeEventListener('visibilitychange', updateVisibility)
  })
})
