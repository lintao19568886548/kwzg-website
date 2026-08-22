<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  MAGNETIC_PARTICLE_CONFIG as config,
  createParticleGrid,
  updateParticle,
} from '~/utils/magnetic-particles'

const rootElement = ref(null)
const canvasElement = ref(null)

let context
let hostElement
let particles = []
let frameId
let resizeObserver
let intersectionObserver
let motionMedia
let compactMedia
let width = 0
let height = 0
let compact = false
let documentVisible = true
let fieldVisible = true
let reducedMotion = false
let settledFrameCount = 0
let introReady = true

const pointer = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  active: false,
  boostUntil: 0,
  touchReleaseAt: 0,
}

function stopAnimation() {
  if (frameId === undefined) return
  window.cancelAnimationFrame(frameId)
  frameId = undefined
}

function canAnimate() {
  return introReady && !reducedMotion && documentVisible && fieldVisible
}

function drawParticles() {
  if (!context) return
  context.clearRect(0, 0, width, height)

  for (const particle of particles) {
    context.globalAlpha = particle.opacity
    context.fillStyle = particle.color
    context.beginPath()
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    context.fill()
  }

  context.globalAlpha = 1
}

function resetToStaticGrid() {
  for (const particle of particles) {
    particle.x = particle.originX
    particle.y = particle.originY
    particle.vx = 0
    particle.vy = 0
    particle.radius = particle.baseRadius
    particle.opacity = particle.baseOpacity
    particle.colorMix = 0
    particle.color = config.deepBlue
  }
  drawParticles()
}

function animate(timestamp) {
  frameId = undefined
  if (!canAnimate()) return

  if (pointer.touchReleaseAt && timestamp >= pointer.touchReleaseAt) {
    pointer.active = false
    pointer.touchReleaseAt = 0
  }

  pointer.x += (pointer.targetX - pointer.x) * config.pointerSmoothing
  pointer.y += (pointer.targetY - pointer.y) * config.pointerSmoothing

  let energy = 0
  for (const particle of particles) {
    energy += updateParticle(particle, pointer, timestamp, compact, config)
  }
  drawParticles()

  const averageEnergy = particles.length ? energy / particles.length : 0
  const timedInteraction = timestamp < pointer.boostUntil || timestamp < pointer.touchReleaseAt

  if (averageEnergy > config.settleEnergy || timedInteraction) settledFrameCount = 0
  else settledFrameCount += 1

  if (timedInteraction || settledFrameCount < config.settleFrames) {
    frameId = window.requestAnimationFrame(animate)
  }
}

function ensureAnimation() {
  if (frameId !== undefined || !canAnimate()) return
  frameId = window.requestAnimationFrame(animate)
}

function resizeCanvas() {
  const root = rootElement.value
  const canvas = canvasElement.value
  if (!root || !canvas || !context) return

  const bounds = root.getBoundingClientRect()
  const nextWidth = Math.max(1, Math.round(bounds.width))
  const nextHeight = Math.max(1, Math.round(bounds.height))
  compact = compactMedia?.matches || nextWidth <= 768
  const dprLimit = compact ? config.compactDprMax : config.desktopDprMax
  const dpr = Math.min(window.devicePixelRatio || 1, dprLimit)

  width = nextWidth
  height = nextHeight
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  particles = createParticleGrid(width, height, compact, config)
  pointer.x = pointer.targetX = width * 0.68
  pointer.y = pointer.targetY = height * 0.42
  settledFrameCount = 0

  if (reducedMotion) resetToStaticGrid()
  else {
    drawParticles()
    ensureAnimation()
  }
}

function updatePointerPosition(event) {
  const bounds = hostElement.getBoundingClientRect()
  pointer.targetX = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left))
  pointer.targetY = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))
  if (!pointer.active) {
    pointer.x = pointer.targetX
    pointer.y = pointer.targetY
  }
}

function handlePointerMove(event) {
  if (reducedMotion || event.pointerType === 'touch') return
  updatePointerPosition(event)
  pointer.active = true
  ensureAnimation()
}

function handlePointerLeave() {
  pointer.active = false
  pointer.touchReleaseAt = 0
  ensureAnimation()
}

function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea, label, [role="button"]'))
}

function handlePointerDown(event) {
  if (reducedMotion || (event.pointerType === 'touch' && isInteractiveTarget(event.target))) return
  updatePointerPosition(event)
  pointer.active = true
  const timestamp = window.performance.now()
  pointer.boostUntil = timestamp + config.clickDuration
  pointer.touchReleaseAt = event.pointerType === 'touch' ? timestamp + config.touchDuration : 0
  ensureAnimation()
}

function handleVisibilityChange() {
  documentVisible = !document.hidden
  if (documentVisible) ensureAnimation()
  else stopAnimation()
}

function resolveReducedMotion() {
  const disabledByQuery = new URLSearchParams(window.location.search).get('motion') === 'off'
  reducedMotion = motionMedia.matches || disabledByQuery || document.documentElement.dataset.motion === 'off'
  rootElement.value.dataset.particleMotion = reducedMotion ? 'static' : 'active'

  if (reducedMotion) {
    pointer.active = false
    stopAnimation()
    resetToStaticGrid()
  } else {
    ensureAnimation()
  }
}

function handleIntersection(entries) {
  fieldVisible = entries.some(entry => entry.isIntersecting)
  if (fieldVisible) ensureAnimation()
  else stopAnimation()
}

function handleIntroComplete() {
  introReady = true
  settledFrameCount = 0
  if (rootElement.value) rootElement.value.dataset.particleState = 'ready'
  ensureAnimation()
}

function initialize() {
  const root = rootElement.value
  const canvas = canvasElement.value
  if (!root || !canvas) return

  context = canvas.getContext('2d', { alpha: true })
  if (!context) {
    root.dataset.particleState = 'unavailable'
    return
  }

  hostElement = root.parentElement
  if (!hostElement) return

  motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
  compactMedia = window.matchMedia('(max-width: 48rem), (pointer: coarse), (update: slow)')
  introReady = document.documentElement.dataset.kwzgIntro !== 'show'
  documentVisible = !document.hidden
  resolveReducedMotion()

  resizeObserver = new ResizeObserver(resizeCanvas)
  resizeObserver.observe(root)

  intersectionObserver = new IntersectionObserver(handleIntersection, { threshold: 0.01 })
  intersectionObserver.observe(root)

  hostElement.addEventListener('pointermove', handlePointerMove, { passive: true })
  hostElement.addEventListener('pointerleave', handlePointerLeave, { passive: true })
  hostElement.addEventListener('pointerdown', handlePointerDown, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('kwzg:intro-complete', handleIntroComplete)
  motionMedia.addEventListener('change', resolveReducedMotion)
  compactMedia.addEventListener('change', resizeCanvas)

  resizeCanvas()
  root.dataset.particleState = introReady ? 'ready' : 'waiting'
}

function teardown() {
  stopAnimation()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  hostElement?.removeEventListener('pointermove', handlePointerMove)
  hostElement?.removeEventListener('pointerleave', handlePointerLeave)
  hostElement?.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('kwzg:intro-complete', handleIntroComplete)
  motionMedia?.removeEventListener('change', resolveReducedMotion)
  compactMedia?.removeEventListener('change', resizeCanvas)
  particles = []
  context = undefined
  hostElement = undefined
  resizeObserver = undefined
  intersectionObserver = undefined
}

onMounted(() => {
  try {
    initialize()
  } catch {
    teardown()
    if (rootElement.value) rootElement.value.dataset.particleState = 'unavailable'
  }
})

onBeforeUnmount(teardown)
</script>

<template>
  <div ref="rootElement" class="kw-home-particle-field" aria-hidden="true">
    <canvas ref="canvasElement" aria-hidden="true" />
  </div>
</template>

<style scoped>
.kw-home-particle-field,
.kw-home-particle-field canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.kw-home-particle-field {
  z-index: 0;
  overflow: hidden;
  opacity: 0;
  animation: kw-particle-field-enter var(--kw-motion-slow) var(--kw-motion-ease) 180ms forwards;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.16) 30%, #000 60%, rgba(0, 0, 0, 0.72) 100%);
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.16) 30%, #000 60%, rgba(0, 0, 0, 0.72) 100%);
}

.kw-home-particle-field[data-particle-state='unavailable'] {
  display: none;
}

.kw-home-particle-field[data-particle-state='waiting'] {
  opacity: 0;
  animation: none;
}

@keyframes kw-particle-field-enter {
  to { opacity: 0.78; }
}

html[data-motion='off'] .kw-home-particle-field,
.kw-home-particle-field[data-particle-motion='static'] {
  opacity: 0.48;
  animation: none;
}

@media (max-width: 64rem) {
  .kw-home-particle-field {
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.22) 24%, #000 56%, rgba(0, 0, 0, 0.58) 100%);
    mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.22) 24%, #000 56%, rgba(0, 0, 0, 0.58) 100%);
  }
}

@media (max-width: 48rem), (update: slow) {
  .kw-home-particle-field {
    opacity: 0.56;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kw-home-particle-field {
    opacity: 0.42;
    animation: none;
  }
}
</style>
