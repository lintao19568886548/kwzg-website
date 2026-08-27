import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  MAGNETIC_PARTICLE_CONFIG,
  createParticleGrid,
  updateParticle,
} from '../../app/utils/magnetic-particles.js'

const componentSource = readFileSync(
  new URL('../../app/components/effects/HomeMagneticParticleField.vue', import.meta.url),
  'utf8',
)
const homepageSource = readFileSync(
  new URL('../../app/components/home/HomeStageOne.vue', import.meta.url),
  'utf8',
)

function cloneParticle(particle) {
  return { ...particle }
}

describe('homepage magnetic particle physics', () => {
  it('builds a deterministic, bounded regular grid using the brand palette', () => {
    const first = createParticleGrid(1440, 720)
    const second = createParticleGrid(1440, 720)

    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(500)
    expect(first.length).toBeLessThanOrEqual(MAGNETIC_PARTICLE_CONFIG.desktopMaxParticles)
    expect(first.every(particle => Number.isFinite(particle.originX) && Number.isFinite(particle.originY))).toBe(true)
    expect(first.every(particle => particle.x === particle.originX && particle.y === particle.originY)).toBe(true)
    expect(new Set(first.map(particle => particle.color))).toEqual(new Set(['#E7A597']))

    const redRatio = first.filter(particle => particle.redEligible).length / first.length
    expect(redRatio).toBeGreaterThanOrEqual(0.05)
    expect(redRatio).toBeLessThanOrEqual(0.1)
  })

  it('transitions only a restrained subset near the pointer from pale to full cinnabar', () => {
    const particle = createParticleGrid(480, 320).find(item => item.redEligible)
    const pointer = {
      active: true,
      x: particle.originX,
      y: particle.originY,
      boostUntil: 0,
    }

    for (let frame = 0; frame < 36; frame += 1) updateParticle(particle, pointer, frame, false)

    expect(particle.colorMix).toBeGreaterThan(0.9)
    expect(particle.color).not.toBe(MAGNETIC_PARTICLE_CONFIG.paleCinnabar)

    pointer.active = false
    for (let frame = 0; frame < 80; frame += 1) updateParticle(particle, pointer, 100 + frame, false)

    expect(particle.colorMix).toBeLessThan(0.004)
    expect(particle.color).toBe(MAGNETIC_PARTICLE_CONFIG.paleCinnabar)
  })

  it('reduces particle density and DPR limits for compact devices', () => {
    const desktop = createParticleGrid(1440, 720)
    const compact = createParticleGrid(1440, 720, true)

    expect(compact.length).toBeLessThanOrEqual(MAGNETIC_PARTICLE_CONFIG.compactMaxParticles)
    expect(compact.length / desktop.length).toBeLessThanOrEqual(0.6)
    expect(MAGNETIC_PARTICLE_CONFIG.compactDprMax).toBeLessThan(MAGNETIC_PARTICLE_CONFIG.desktopDprMax)
  })

  it('keeps zero-distance attraction finite and clamps speed, displacement and size', () => {
    const particle = createParticleGrid(320, 240)[0]
    const pointer = {
      active: true,
      x: particle.originX,
      y: particle.originY,
      boostUntil: 2000,
    }

    for (let frame = 0; frame < 120; frame += 1) {
      updateParticle(particle, pointer, 1000 + frame, false)
    }

    expect(Object.values(particle).filter(value => typeof value === 'number').every(Number.isFinite)).toBe(true)
    expect(Math.hypot(particle.vx, particle.vy)).toBeLessThanOrEqual(MAGNETIC_PARTICLE_CONFIG.maxSpeed)
    expect(Math.hypot(particle.x - particle.originX, particle.y - particle.originY))
      .toBeLessThanOrEqual(MAGNETIC_PARTICLE_CONFIG.maxDisplacement)
    expect(particle.radius).toBeLessThanOrEqual(MAGNETIC_PARTICLE_CONFIG.maxRadius)
  })

  it('pulls nearby particles toward the pointer, strengthens clicks and springs home smoothly', () => {
    const base = createParticleGrid(320, 240)
      .find(particle => particle.originX > 80 && particle.originX < 240)
    const normal = cloneParticle(base)
    const boosted = cloneParticle(base)
    const pointerX = base.originX + 90
    const pointer = { active: true, x: pointerX, y: base.originY, boostUntil: 0 }
    const boostedPointer = { ...pointer, boostUntil: 2000 }

    for (let frame = 0; frame < 12; frame += 1) {
      updateParticle(normal, pointer, 1000 + frame, false)
      updateParticle(boosted, boostedPointer, 1000 + frame, false)
    }

    expect(normal.x).toBeGreaterThan(normal.originX)
    expect(boosted.x - boosted.originX).toBeGreaterThan(normal.x - normal.originX)

    const displaced = Math.abs(boosted.x - boosted.originX)
    boostedPointer.active = false
    for (let frame = 0; frame < 160; frame += 1) {
      updateParticle(boosted, boostedPointer, 3000 + frame, false)
    }

    expect(Math.abs(boosted.x - boosted.originX)).toBeLessThan(displaced)
    expect(Math.abs(boosted.x - boosted.originX)).toBeLessThan(0.05)
  })
})

describe('homepage particle integration contract', () => {
  it('mounts the Canvas decoration only in the homepage hero', () => {
    expect(homepageSource).toContain("import HomeMagneticParticleField from '~/components/effects/HomeMagneticParticleField.vue'")
    expect(homepageSource.match(/<HomeMagneticParticleField\s*\/>/g)).toHaveLength(1)
    expect(componentSource).toContain('<canvas ref="canvasElement" aria-hidden="true" />')
    expect(componentSource).toMatch(/position:\s*absolute/)
    expect(componentSource).toMatch(/pointer-events:\s*none/)
  })

  it('contains lifecycle, accessibility and performance safeguards without external requests', () => {
    for (const safeguard of [
      'ResizeObserver',
      'IntersectionObserver',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'visibilitychange',
      'prefers-reduced-motion: reduce',
      "event.pointerType === 'touch'",
      'onBeforeUnmount(teardown)',
    ]) {
      expect(componentSource).toContain(safeguard)
    }

    expect(componentSource).not.toMatch(/setInterval|fetch\(|\$fetch|XMLHttpRequest|WebSocket/)
    expect(componentSource).not.toMatch(/preventDefault\(/)
  })
})
