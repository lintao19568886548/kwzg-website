/** @vitest-environment happy-dom */

import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RoleSolutionExplorer from '~/components/RoleSolutionExplorer.vue'

const carouselSources = [
  '../../app/pages/products.vue',
  '../../app/pages/solutions.vue',
  '../../app/components/RoleSolutionExplorer.vue',
  '../../app/components/CapabilityFlowMap.vue',
  '../../app/components/CapabilityLandscape.vue',
  '../../app/components/home/HomeCapabilityArchitecture.vue',
  '../../app/components/home/HomeRoleSolutions.vue',
  '../../app/components/home/HomeSystemModuleShowcase.vue',
  '../../app/components/cases/CaseFunctionShowcase.vue',
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8'))
const autoplaySource = readFileSync('app/composables/useAutoplayCarousel.js', 'utf8')

let wrapper

class VisibleIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe() {
    this.callback([{ isIntersecting: true, intersectionRatio: 1 }])
  }

  disconnect() {}
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  window.matchMedia = vi.fn(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  document.documentElement.dataset.motion = 'on'
  document.documentElement.dataset.kwzgIntro = 'skip'
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.useRealTimers()
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.motion
  delete document.documentElement.dataset.kwzgIntro
})

describe('public content carousels', () => {
  it('connects every public content tab showcase to the shared autoplay behavior', () => {
    for (const source of carouselSources) {
      expect(source).toContain('useAutoplayCarousel')
      expect(source).toContain('restartCycle')
      expect(source).toContain('setHovered')
      expect(source).toContain('setFocused')
    }
    expect(autoplaySource).toContain('visibilityThreshold = 0.2')
    expect(autoplaySource).toContain("attributeFilter: ['data-motion']")
    expect(autoplaySource).toContain('motionObserver?.disconnect()')
  })

  it('automatically rotates the role explorer and pauses while hovered', async () => {
    wrapper = mount(RoleSolutionExplorer, {
      global: {
        stubs: {
          UiLinearIcon: { template: '<i />' },
          CapabilityStatusTag: { template: '<span />' },
          UiContentCarouselControls: { props: ['activeIndex'], template: '<div data-carousel-index>{{ activeIndex }}</div>' },
        },
      },
    })

    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')
    await vi.advanceTimersByTimeAsync(7_700)
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')

    await wrapper.get('.kw-role-explorer').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(13_000)
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')

    await wrapper.get('.kw-role-explorer').trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(6_500)
    expect(wrapper.findAll('[role="tab"]')[2].attributes('aria-selected')).toBe('true')
  })
})
