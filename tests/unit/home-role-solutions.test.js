/** @vitest-environment happy-dom */

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeRoleSolutions from '~/components/home/HomeRoleSolutions.vue'

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

function mountRoles() {
  wrapper = mount(HomeRoleSolutions, {
    global: {
      directives: { reveal: {} },
      stubs: {
        NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
        UiLinearIcon: { template: '<span aria-hidden="true" />' },
      },
    },
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  window.matchMedia = vi.fn(query => ({
    matches: query.includes('max-width') || query.includes('pointer: coarse'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  HTMLElement.prototype.scrollIntoView = vi.fn()
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

describe('HomeRoleSolutions mobile controls', () => {
  it('switches to the next role after a deliberate horizontal swipe', async () => {
    mountRoles()
    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')

    await wrapper.get('.kw-cinnabar-roles').trigger('touchstart', {
      changedTouches: [{ clientX: 300, clientY: 420 }],
    })
    await wrapper.get('.kw-cinnabar-roles').trigger('touchend', {
      changedTouches: [{ clientX: 130, clientY: 425 }],
    })
    await nextTick()

    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('role-panel-manager')
  })

  it('keeps mobile autoplay disabled even while the carousel is visible', async () => {
    mountRoles()
    const before = wrapper.get('[role="tabpanel"]').attributes('id')

    await vi.advanceTimersByTimeAsync(20_000)
    await nextTick()

    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe(before)
    expect(wrapper.find('button[aria-label="暂停"]').exists()).toBe(false)
  })
})

describe('HomeRoleSolutions desktop autoplay', () => {
  it('continues looping instead of stopping after one cycle', async () => {
    window.matchMedia = vi.fn(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    mountRoles()

    await vi.advanceTimersByTimeAsync(7_700)
    await nextTick()
    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('role-panel-manager')

    await vi.advanceTimersByTimeAsync(32_500)
    await nextTick()
    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('role-panel-owner')
    expect(wrapper.findAll('button').some(button => button.text() === '暂停')).toBe(true)
  })
})
