/** @vitest-environment happy-dom */

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeSystemModuleShowcase from '~/components/home/HomeSystemModuleShowcase.vue'
import SystemShowcaseModal from '~/components/home/SystemShowcaseModal.vue'
import { systemShowcaseModules } from '~/data/product-capabilities'

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
  document.body.innerHTML = '<button id="showcase-trigger">打开</button><div id="mount-point"></div>'
  document.getElementById('showcase-trigger').focus()
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.className = ''
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.motion
  delete document.documentElement.dataset.kwzgIntro
})

describe('HomeSystemModuleShowcase', () => {
  it('switches all nine modules with click and roving keyboard tabs', async () => {
    wrapper = mount(HomeSystemModuleShowcase, {
      attachTo: document.getElementById('mount-point'),
      global: {
        directives: { reveal: {} },
        stubs: {
          NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
          SystemShowcasePreview: { props: ['module'], template: '<div data-preview>{{ module.name }}<button type="button" @click="$emit(\'expand\')">放大</button></div>' },
          SystemShowcaseModal: { props: ['open', 'module'], template: '<div data-modal :data-open="String(open)">{{ module.name }}</div>' },
        },
      },
    })

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(9)
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[data-preview]').text()).toContain('运营总览')

    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1)
    expect(wrapper.get('[role="tabpanel"]').attributes('data-module-id')).toBe('data-map')
    expect(wrapper.get('[data-preview]').text()).toContain('数据地图')

    await wrapper.findAll('[role="tab"]')[1].trigger('keydown', { key: 'End' })
    await nextTick()
    expect(wrapper.findAll('[role="tab"]')[8].attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1)
    expect(wrapper.get('[role="tabpanel"]').attributes('data-module-id')).toBe('maintenance')
    expect(wrapper.get('[data-preview]').text()).toContain('维护管理')
  })

  it('opens the enlarged preview from the active module', async () => {
    wrapper = mount(HomeSystemModuleShowcase, {
      attachTo: document.getElementById('mount-point'),
      global: {
        directives: { reveal: {} },
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          SystemShowcasePreview: { props: ['module'], template: '<button data-expand type="button" @click="$emit(\'expand\')">{{ module.name }}</button>' },
          SystemShowcaseModal: { props: ['open', 'module'], template: '<div data-modal :data-open="String(open)">{{ module.name }}</div>' },
        },
      },
    })

    await wrapper.get('[data-expand]').trigger('click')
    expect(wrapper.get('[data-modal]').attributes('data-open')).toBe('true')
    expect(wrapper.get('[data-modal]').text()).toBe('运营总览')
  })

  it('automatically loops through modules and pauses while hovered', async () => {
    wrapper = mount(HomeSystemModuleShowcase, {
      attachTo: document.getElementById('mount-point'),
      global: {
        directives: { reveal: {} },
        stubs: {
          NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
          SystemShowcasePreview: { props: ['module'], template: '<div data-preview>{{ module.name }}</div>' },
          SystemShowcaseModal: { template: '<div />' },
        },
      },
    })

    await vi.advanceTimersByTimeAsync(7_200)
    expect(wrapper.get('[role="tabpanel"]').attributes('data-module-id')).toBe('data-map')

    await wrapper.get('.kw-v3-showcase').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(12_000)
    expect(wrapper.get('[role="tabpanel"]').attributes('data-module-id')).toBe('data-map')

    await wrapper.get('.kw-v3-showcase').trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(6_000)
    expect(wrapper.get('[role="tabpanel"]').attributes('data-module-id')).toBe('equipment')
  })
})

describe('SystemShowcaseModal', () => {
  it('focuses the close control, traps focus, closes with Escape and restores focus', async () => {
    const trigger = document.getElementById('showcase-trigger')
    wrapper = mount(SystemShowcaseModal, {
      attachTo: document.getElementById('mount-point'),
      props: { open: false, module: systemShowcaseModules[0] },
      global: { stubs: { SystemShowcasePreview: { template: '<div>演示界面</div>' } } },
    })

    await wrapper.setProps({ open: true })
    await nextTick()
    const dialog = document.querySelector('[role="dialog"]')
    const close = document.querySelector('[aria-label="关闭放大界面"]')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(document.body.classList.contains('kw-has-system-modal')).toBe(true)
    expect(document.activeElement).toBe(close)

    close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(close)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.body.classList.contains('kw-has-system-modal')).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })
})
