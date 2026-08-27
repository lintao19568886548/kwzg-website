import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolveMotionMode } from '../../app/composables/useMotionPreference.js'

const motionCss = readFileSync(new URL('../../app/assets/css/motion.css', import.meta.url), 'utf8')
const motionPlugin = readFileSync(new URL('../../app/plugins/motion.client.js', import.meta.url), 'utf8')
const homeStage = readFileSync(new URL('../../app/components/home/HomeStageOne.vue', import.meta.url), 'utf8')
const homeAi = readFileSync(new URL('../../app/components/home/HomeAiCapabilities.vue', import.meta.url), 'utf8')

describe('central motion system', () => {
  it('keeps motion enabled by default and disables only explicit or reduced modes', () => {
    expect(resolveMotionMode()).toBe('on')
    expect(resolveMotionMode({ search: '?case-layout=balanced-final' })).toBe('on')
    expect(resolveMotionMode({ search: '?motion=off' })).toBe('off')
    expect(resolveMotionMode({ search: '?motion=on', reducedMotion: true })).toBe('off')
  })

  it('resynchronizes the root motion mode after client-side route changes', () => {
    expect(motionPlugin).toContain("nuxtApp.$router.afterEach")
    expect(motionPlugin).toContain("new URL(to.fullPath, window.location.origin).search")
    expect(motionPlugin).toContain('updateMotionMode(targetSearch)')
    expect(motionPlugin).toContain('revealPendingImmediately')
    expect(motionPlugin).toContain("document.addEventListener('visibilitychange', updateVisibility)")
  })

  it('defines shared timing, easing, distance and stagger tokens', () => {
    expect(motionCss).toContain('--motion-duration-fast: 160ms')
    expect(motionCss).toContain('--motion-duration-base: 320ms')
    expect(motionCss).toContain('--motion-duration-slow: 600ms')
    expect(motionCss).toContain('--motion-duration-hero: 900ms')
    expect(motionCss).toContain('--motion-ease-standard: cubic-bezier(0.22, 1, 0.36, 1)')
    expect(motionCss).toContain('[data-motion-stagger] > :nth-child(12)')
  })

  it('keeps shared public motion components connected to the homepage', () => {
    expect(homeStage).toContain('<HomeMagneticParticleField />')
    expect(homeStage).toContain('<HomeBusinessLoops />')
    expect(homeStage).toContain('<HomeSystemModuleShowcase />')
    expect(homeAi).toContain('<MotionStagger class="kw-v3-ai__grid" :step="70">')
  })

  it('restores sharp text layers and supports all reduced-motion paths', () => {
    expect(motionCss).toMatch(/\[data-reveal-state='visible'\] \{[\s\S]*?transform: none;[\s\S]*?will-change: auto;/)
    expect(motionCss).toContain("html[data-motion='off']")
    expect(motionCss).toContain('@media (prefers-reduced-motion: reduce)')
    expect(motionCss).toContain("html[data-document-visibility='hidden']")
  })
})
