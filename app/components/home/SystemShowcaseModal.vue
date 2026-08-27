<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SystemShowcasePreview from '~/components/home/SystemShowcasePreview.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  module: { type: Object, required: true },
})

const emit = defineEmits(['close'])
const dialog = ref(null)
const closeButton = ref(null)
let previouslyFocused = null

function close() {
  emit('close')
}

function getFocusableElements() {
  if (!dialog.value) return []
  return [...dialog.value.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true')
}

function handleKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const focusable = getFocusableElements()
  if (!focusable.length) {
    event.preventDefault()
    dialog.value?.focus()
    return
  }
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

watch(() => props.open, async (open) => {
  if (typeof document === 'undefined') return
  if (open) {
    previouslyFocused = document.activeElement
    document.body.classList.add('kw-has-system-modal')
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.body.classList.remove('kw-has-system-modal')
    previouslyFocused?.focus?.()
  }
})

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('kw-has-system-modal')
})
</script>

<template>
  <Teleport to="body">
    <Transition name="kw-system-modal">
      <div v-if="open" class="kw-system-modal" role="presentation" @mousedown.self="close">
        <section
          ref="dialog"
          class="kw-system-modal__dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`system-modal-${module.id}-title`"
          tabindex="-1"
        >
          <header>
            <div><span>{{ module.id === 'data-map' ? '真实系统截图 · 实际业务数据' : '安全演示数据' }}</span><h2 :id="`system-modal-${module.id}-title`">{{ module.name }}</h2></div>
            <button ref="closeButton" type="button" aria-label="关闭放大界面" @click="close">×</button>
          </header>
          <div class="kw-system-modal__content">
            <SystemShowcasePreview :module="module" modal />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
