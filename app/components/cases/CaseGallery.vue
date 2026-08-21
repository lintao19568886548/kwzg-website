<script setup>
const props = defineProps({
  name: { type: String, required: true },
  images: { type: Array, required: true },
})

const activeIndex = ref(0)
const isOpen = ref(false)
const closeButton = ref(null)
const dialogPanel = ref(null)
let previousFocus

const activeImage = computed(() => props.images[activeIndex.value])

function openGallery(index = 0) {
  previousFocus = document.activeElement
  activeIndex.value = index
  isOpen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => closeButton.value?.focus())
}

function closeGallery() {
  isOpen.value = false
  document.body.style.overflow = ''
  nextTick(() => previousFocus?.focus?.())
}

function moveImage(direction) {
  activeIndex.value = (activeIndex.value + direction + props.images.length) % props.images.length
}

function handleKeydown(event) {
  if (!isOpen.value) return
  if (event.key === 'Escape') closeGallery()
  if (event.key === 'ArrowLeft') moveImage(-1)
  if (event.key === 'ArrowRight') moveImage(1)
  if (event.key !== 'Tab') return
  const focusable = dialogPanel.value ? [...dialogPanel.value.querySelectorAll('button:not([disabled])')] : []
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

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="kw-case-gallery-grid">
    <button
      v-for="(image, index) in images"
      :key="image.src"
      type="button"
      class="kw-case-gallery-thumb"
      :aria-label="`查看${name}实景大图 ${index + 1}`"
      @click="openGallery(index)"
    >
      <img :src="image.src" :alt="image.alt" width="800" height="500" loading="lazy" decoding="async">
      <span>{{ image.caption }} <i aria-hidden="true">↗</i></span>
    </button>
  </div>

  <Teleport to="body">
    <Transition name="kw-gallery">
      <div v-if="isOpen" class="kw-gallery" role="dialog" aria-modal="true" :aria-label="`${name}实景画廊`" @click.self="closeGallery">
        <div ref="dialogPanel" class="kw-gallery__panel">
          <header>
            <div><small>园区实景</small><h2>{{ name }}</h2></div>
            <button ref="closeButton" type="button" @click="closeGallery">关闭 <span aria-hidden="true">×</span></button>
          </header>
          <Transition name="kw-gallery-image" mode="out-in">
            <img :key="activeImage.src" :src="activeImage.src" :alt="activeImage.alt" width="1200" height="750">
          </Transition>
          <footer>
            <span>{{ activeIndex + 1 }} / {{ images.length }} · {{ activeImage.caption }}</span>
            <div v-if="images.length > 1"><button type="button" @click="moveImage(-1)">上一张</button><button type="button" @click="moveImage(1)">下一张</button></div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
