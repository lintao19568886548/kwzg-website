export const MAGNETIC_PARTICLE_CONFIG = Object.freeze({
  desktopSpacing: 26,
  compactSpacing: 34,
  desktopMaxParticles: 1250,
  compactMaxParticles: 360,
  edgePadding: 18,
  redParticleRatio: 0.08,
  baseRadiusMin: 1.05,
  baseRadiusMax: 1.65,
  activeRadiusBoost: 1.45,
  maxRadius: 3.4,
  baseOpacityMin: 0.14,
  baseOpacityMax: 0.3,
  activeOpacityBoost: 0.16,
  influenceRadius: 158,
  compactInfluenceRadius: 128,
  attraction: 0.115,
  returnSpring: 0.072,
  damping: 0.82,
  maxSpeed: 3.8,
  maxDisplacement: 66,
  pointerApproachRatio: 0.62,
  pointerSmoothing: 0.2,
  clickBoost: 1.65,
  clickDuration: 460,
  touchDuration: 620,
  desktopDprMax: 2,
  compactDprMax: 1.25,
  settleEnergy: 0.014,
  settleFrames: 24,
  epsilon: 0.001,
  paleCinnabar: '#E7A597',
  cinnabar: '#A9362A',
})

const rgbCache = new Map()

function resolveRgb(hex) {
  if (rgbCache.has(hex)) return rgbCache.get(hex)
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  const rgb = {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
  rgbCache.set(hex, rgb)
  return rgb
}

export function mixParticleColor(from, to, progress) {
  const amount = Math.min(1, Math.max(0, progress))
  const start = resolveRgb(from)
  const end = resolveRgb(to)
  const r = Math.round(start.r + (end.r - start.r) * amount)
  const g = Math.round(start.g + (end.g - start.g) * amount)
  const b = Math.round(start.b + (end.b - start.b) * amount)
  return `rgb(${r}, ${g}, ${b})`
}

function stableUnit(index, salt) {
  return ((index * salt) % 101) / 100
}

function resolveGrid(width, height, compact, config) {
  let spacing = compact ? config.compactSpacing : config.desktopSpacing
  const maxParticles = compact ? config.compactMaxParticles : config.desktopMaxParticles
  const usableWidth = Math.max(1, width - config.edgePadding * 2)
  const usableHeight = Math.max(1, height - config.edgePadding * 2)
  let columns = Math.max(1, Math.floor(usableWidth / spacing) + 1)
  let rows = Math.max(1, Math.floor(usableHeight / spacing) + 1)

  if (columns * rows > maxParticles) {
    spacing *= Math.sqrt((columns * rows) / maxParticles)
    columns = Math.max(1, Math.floor(usableWidth / spacing) + 1)
    rows = Math.max(1, Math.floor(usableHeight / spacing) + 1)
  }

  return { columns, rows, spacing }
}

export function createParticleGrid(width, height, compact = false, config = MAGNETIC_PARTICLE_CONFIG) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return []

  const { columns, rows, spacing } = resolveGrid(width, height, compact, config)
  const gridWidth = (columns - 1) * spacing
  const gridHeight = (rows - 1) * spacing
  const startX = (width - gridWidth) / 2
  const startY = (height - gridHeight) / 2
  const particles = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column
      const radiusUnit = stableUnit(index + 1, 37)
      const opacityUnit = stableUnit(index + 3, 53)
      const baseRadius = config.baseRadiusMin + (config.baseRadiusMax - config.baseRadiusMin) * radiusUnit
      const baseOpacity = config.baseOpacityMin + (config.baseOpacityMax - config.baseOpacityMin) * opacityUnit
      const originX = startX + column * spacing
      const originY = startY + row * spacing

      particles.push({
        originX,
        originY,
        x: originX,
        y: originY,
        vx: 0,
        vy: 0,
        baseRadius,
        radius: baseRadius,
        baseOpacity,
        opacity: baseOpacity,
        redEligible: index % 100 < config.redParticleRatio * 100,
        colorMix: 0,
        color: config.paleCinnabar,
      })
    }
  }

  return particles
}

export function updateParticle(particle, pointer, timestamp, compact = false, config = MAGNETIC_PARTICLE_CONFIG) {
  const influenceRadius = compact ? config.compactInfluenceRadius : config.influenceRadius
  const boosted = pointer.active && timestamp < pointer.boostUntil
  const boost = boosted ? config.clickBoost : 1
  let targetX = particle.originX
  let targetY = particle.originY
  let influence = 0

  if (pointer.active) {
    const originDx = pointer.x - particle.originX
    const originDy = pointer.y - particle.originY
    const originDistance = Math.max(config.epsilon, Math.hypot(originDx, originDy))

    if (originDistance < influenceRadius) {
      const normalized = 1 - originDistance / influenceRadius
      influence = normalized * normalized
      const maximumPull = Math.min(
        config.maxDisplacement,
        originDistance * config.pointerApproachRatio,
      )
      const pull = maximumPull * influence * boost
      targetX += (originDx / originDistance) * pull
      targetY += (originDy / originDistance) * pull
    }
  }

  const stiffness = pointer.active ? config.attraction : config.returnSpring
  particle.vx = (particle.vx + (targetX - particle.x) * stiffness) * config.damping
  particle.vy = (particle.vy + (targetY - particle.y) * stiffness) * config.damping

  const speed = Math.hypot(particle.vx, particle.vy)
  if (speed > config.maxSpeed) {
    const speedScale = config.maxSpeed / speed
    particle.vx *= speedScale
    particle.vy *= speedScale
  }

  particle.x += particle.vx
  particle.y += particle.vy

  const displacementX = particle.x - particle.originX
  const displacementY = particle.y - particle.originY
  const displacement = Math.hypot(displacementX, displacementY)
  if (displacement > config.maxDisplacement) {
    const displacementScale = config.maxDisplacement / displacement
    particle.x = particle.originX + displacementX * displacementScale
    particle.y = particle.originY + displacementY * displacementScale
    particle.vx *= 0.55
    particle.vy *= 0.55
  }

  const targetOpacity = Math.min(0.48, particle.baseOpacity + influence * config.activeOpacityBoost * boost)
  const targetRadius = Math.min(config.maxRadius, particle.baseRadius + influence * config.activeRadiusBoost * boost)
  const targetColorMix = particle.redEligible && pointer.active ? Math.min(1, influence * 1.35) : 0
  particle.opacity += (targetOpacity - particle.opacity) * 0.16
  particle.radius += (targetRadius - particle.radius) * 0.16
  particle.colorMix += (targetColorMix - particle.colorMix) * 0.14
  particle.color = particle.colorMix < 0.004
    ? config.paleCinnabar
    : mixParticleColor(config.paleCinnabar, config.cinnabar, particle.colorMix)

  return Math.abs(particle.vx) + Math.abs(particle.vy)
    + Math.abs(particle.x - particle.originX) * 0.02
    + Math.abs(particle.y - particle.originY) * 0.02
    + Math.abs(targetColorMix - particle.colorMix) * 0.1
}
