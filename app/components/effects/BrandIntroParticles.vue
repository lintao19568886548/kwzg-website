<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  reduced: { type: Boolean, default: false },
})

const emit = defineEmits(['unavailable'])
const rootElement = ref(null)
const canvasElement = ref(null)

const palette = ['#4C78B8', '#A83A2A', '#F7F2E8', '#B28A50']
let context
let particles = []
let frameId
let resizeObserver
let startedAt = 0
let pausedAt = 0
let totalPaused = 0
let width = 0
let height = 0
let running = false

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2
}

function stableUnit(index, salt) {
  return ((index * salt) % 997) / 996
}

function particleColor(index) {
  const unit = stableUnit(index + 5, 223)
  if (unit < 0.7) return palette[0]
  if (unit < 0.9) return palette[1]
  if (unit < 0.97) return palette[2]
  return palette[3]
}

function createParticles() {
  const areaCount = Math.round((width * height) / (props.compact ? 8500 : 9000))
  const count = props.compact ? clamp(areaCount, 52, 82) : clamp(areaCount, 110, 168)
  const centerX = width / 2
  const centerY = height / 2 - Math.min(28, height * 0.03)

  particles = Array.from({ length: count }, (_, index) => {
    const edge = index % 4
    const edgePosition = stableUnit(index + 7, 431)
    const outside = 16 + stableUnit(index + 11, 379) * 54
    let startX
    let startY

    if (edge === 0) [startX, startY] = [-outside, edgePosition * height]
    else if (edge === 1) [startX, startY] = [width + outside, edgePosition * height]
    else if (edge === 2) [startX, startY] = [edgePosition * width, -outside]
    else [startX, startY] = [edgePosition * width, height + outside]

    const angle = index * 2.3999632297
    const ring = 48 + stableUnit(index + 17, 613) * Math.min(128, width * 0.1)
    return {
      startX,
      startY,
      targetX: centerX + Math.cos(angle) * ring,
      targetY: centerY + Math.sin(angle) * ring * 0.64,
      x: startX,
      y: startY,
      color: particleColor(index),
      radius: 1 + stableUnit(index + 3, 157) * 1.15,
      alpha: 0,
      delay: stableUnit(index + 13, 271) * (props.compact ? 90 : 140),
      curve: (stableUnit(index + 19, 337) - 0.5) * (props.compact ? 34 : 58),
      scatterDirection: index % 2 === 0 ? -1 : 1,
    }
  })
}

function resizeCanvas() {
  const root = rootElement.value
  const canvas = canvasElement.value
  if (!root || !canvas || !context) return
  const bounds = root.getBoundingClientRect()
  width = Math.max(1, Math.round(bounds.width))
  height = Math.max(1, Math.round(bounds.height))
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  createParticles()
}

function drawParticle(particle) {
  context.globalAlpha = particle.alpha
  context.fillStyle = particle.color
  context.beginPath()
  context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
  context.fill()
}

function updateParticle(particle, elapsed) {
  const compact = props.compact
  const gatherStart = compact ? 200 : 200
  const gatherEnd = compact ? 650 : 900
  const revealStart = compact ? 1550 : 2250
  const revealEnd = compact ? 1950 : 2800
  const localElapsed = elapsed - particle.delay
  const gather = clamp((localElapsed - gatherStart) / (gatherEnd - gatherStart), 0, 1)
  const gathered = easeOutCubic(gather)
  const arc = Math.sin(gathered * Math.PI) * particle.curve

  particle.x = particle.startX + (particle.targetX - particle.startX) * gathered + arc
  particle.y = particle.startY + (particle.targetY - particle.startY) * gathered - arc * 0.35
  particle.alpha = clamp(gather * 1.45, 0, particle.color === palette[2] ? 0.66 : 0.78)

  if (elapsed > gatherEnd) {
    const breath = Math.sin((elapsed - gatherEnd) / 260 + particle.delay) * 1.5
    particle.x += Math.cos(particle.delay) * breath
    particle.y += Math.sin(particle.delay) * breath * 0.6
  }

  if (elapsed >= revealStart) {
    const scatter = easeInOutCubic(clamp((elapsed - revealStart) / (revealEnd - revealStart), 0, 1))
    particle.x += particle.scatterDirection * scatter * width * 0.38
    particle.alpha *= 1 - scatter
  }
}

function draw(timestamp) {
  frameId = undefined
  if (!running || document.hidden || !context) return
  const elapsed = timestamp - startedAt - totalPaused
  context.clearRect(0, 0, width, height)
  for (const particle of particles) {
    updateParticle(particle, elapsed)
    drawParticle(particle)
  }
  context.globalAlpha = 1
  const duration = props.compact ? 1950 : 2800
  if (elapsed < duration) frameId = window.requestAnimationFrame(draw)
}

function stop() {
  running = false
  if (frameId !== undefined) window.cancelAnimationFrame(frameId)
  frameId = undefined
}

function start() {
  if (!props.active || props.reduced || running) return
  const canvas = canvasElement.value
  const root = rootElement.value
  if (!canvas || !root || typeof ResizeObserver === 'undefined') {
    emit('unavailable')
    return
  }

  try {
    context = canvas.getContext('2d', { alpha: true })
    if (!context) throw new Error('Canvas 2D unavailable')
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(root)
    resizeCanvas()
    running = true
    startedAt = window.performance.now()
    totalPaused = 0
    frameId = window.requestAnimationFrame(draw)
  } catch {
    stop()
    emit('unavailable')
  }
}

function handleVisibilityChange() {
  if (!running) return
  if (document.hidden) {
    pausedAt = window.performance.now()
    if (frameId !== undefined) window.cancelAnimationFrame(frameId)
    frameId = undefined
    return
  }

  if (pausedAt) totalPaused += window.performance.now() - pausedAt
  pausedAt = 0
  if (frameId === undefined) frameId = window.requestAnimationFrame(draw)
}

watch(() => props.active, (active) => {
  if (active) start()
  else stop()
}, { flush: 'post' })

watch(() => props.reduced, (reduced) => {
  if (reduced) stop()
  else if (props.active) start()
})

onMounted(() => document.addEventListener('visibilitychange', handleVisibilityChange))

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  resizeObserver = undefined
  particles = []
  context = undefined
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div ref="rootElement" class="kw-brand-intro-particles" aria-hidden="true">
    <canvas ref="canvasElement" aria-hidden="true" />
  </div>
</template>

<style scoped>
.kw-brand-intro-particles,
.kw-brand-intro-particles canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.kw-brand-intro-particles {
  z-index: 2;
  overflow: hidden;
  -webkit-mask-image: radial-gradient(circle at center, transparent 0 8rem, #000 16rem 100%);
  mask-image: radial-gradient(circle at center, transparent 0 8rem, #000 16rem 100%);
}
</style>
