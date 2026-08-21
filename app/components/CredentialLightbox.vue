<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  returnFocusTo: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:open'])
const route = useRoute()
const dialogElement = ref(null)
const closeButton = ref(null)
let triggerElement
let appRoot
let previousBodyOverflow = ''
let restoreFocusOnClose = true

function restoreBackground() {
  document.body.style.overflow = previousBodyOverflow
  if (appRoot) {
    appRoot.removeAttribute('aria-hidden')
    appRoot.inert = false
  }
  appRoot = undefined
}

async function requestClose({ restoreFocus = true } = {}) {
  restoreFocusOnClose = restoreFocus
  emit('update:open', false)
}

function handleKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
    return
  }
  if (event.key !== 'Tab') return

  const focusable = [...(dialogElement.value?.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') || [])]
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

watch(() => props.open, async (open) => {
  if (open) {
    triggerElement = props.returnFocusTo || document.activeElement
    restoreFocusOnClose = true
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    appRoot = document.getElementById('__nuxt')
    if (appRoot) {
      appRoot.setAttribute('aria-hidden', 'true')
      appRoot.inert = true
    }
    document.addEventListener('keydown', handleKeydown)
    await nextTick()
    closeButton.value?.focus()
    return
  }

  document.removeEventListener('keydown', handleKeydown)
  restoreBackground()
  if (restoreFocusOnClose && triggerElement?.isConnected) {
    await nextTick()
    triggerElement.focus()
  }
})

watch(() => route.fullPath, () => {
  if (props.open) requestClose({ restoreFocus: false })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (props.open) restoreBackground()
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="kw-credential-modal">
        <div
          v-if="open"
          class="kw-credential-overlay"
          data-credential-overlay
          @mousedown.self="requestClose()"
        >
          <section
            ref="dialogElement"
            class="kw-credential-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credential-dialog-title"
            data-credential-dialog
          >
            <header>
              <div>
                <span>企业资质实拍</span>
                <h2 id="credential-dialog-title">{{ title }}</h2>
              </div>
              <button ref="closeButton" type="button" aria-label="关闭资质大图" @click="requestClose()">
                <UiLinearIcon name="close" :size="22" />
              </button>
            </header>
            <div class="kw-credential-dialog__image">
              <img :src="image" :alt="alt" width="1800" height="1890" decoding="async">
            </div>
            <p>资质信息以证书及登记材料载明内容为准。</p>
          </section>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
