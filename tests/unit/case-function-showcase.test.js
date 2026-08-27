/** @vitest-environment happy-dom */

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CaseFunctionShowcase from '~/components/cases/CaseFunctionShowcase.vue'

const functions = ['园区经营总览', '合同管理', '账单管理', '报修工单']
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

function mountShowcase() {
  return mount(CaseFunctionShowcase, {
    props: { functions },
    global: {
      stubs: {
        HomeDashboardOverview: { template: '<div data-interface>126.8 万</div>' },
        HomeInterfacePreview: { props: ['title'], template: '<div data-interface>{{ title }}</div>' },
      },
    },
  })
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

describe('CaseFunctionShowcase', () => {
  it('keeps the existing demo values visible and supports manual tabs', async () => {
    wrapper = mountShowcase()

    expect(wrapper.get('[data-interface]').text()).toBe('126.8 万')
    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')

    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.findAll('[role="tab"]')[2].attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[data-interface]').text()).toBe('账单管理')
  })

  it('automatically loops and pauses while the case showcase is hovered', async () => {
    wrapper = mountShowcase()

    await vi.advanceTimersByTimeAsync(7_200)
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[data-interface]').text()).toBe('合同管理')

    await wrapper.get('.kw-case-functions').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(12_000)
    expect(wrapper.get('[data-interface]').text()).toBe('合同管理')

    await wrapper.get('.kw-case-functions').trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(6_000)
    expect(wrapper.get('[data-interface]').text()).toBe('账单管理')
  })
})
