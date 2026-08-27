import { computed, readonly } from 'vue'

export function resolveMotionMode({ search = '', reducedMotion = false } = {}) {
  const query = new URLSearchParams(search)
  return reducedMotion || query.get('motion') === 'off' ? 'off' : 'on'
}

export function useMotionPreference() {
  const mode = useState('kw-motion-mode', () => 'on')
  const reduced = useState('kw-motion-reduced', () => false)
  const documentVisible = useState('kw-document-visible', () => true)
  const enabled = computed(() => mode.value === 'on')

  function sync({ search = '', reducedMotion = false, hidden = false } = {}) {
    reduced.value = reducedMotion
    documentVisible.value = !hidden
    mode.value = resolveMotionMode({ search, reducedMotion })

    if (import.meta.client) {
      document.documentElement.dataset.motion = mode.value
      document.documentElement.dataset.documentVisibility = hidden ? 'hidden' : 'visible'
    }

    return mode.value
  }

  return {
    mode: readonly(mode),
    reduced: readonly(reduced),
    documentVisible: readonly(documentVisible),
    enabled,
    sync,
  }
}
