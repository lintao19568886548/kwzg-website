/** @vitest-environment happy-dom */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FloatingContactBar from '~/components/FloatingContactBar.vue'
import { siteConfig } from '~/config/site'

let mobileViewport = false
let reducedMotion = false
let scrollPosition = 0
let wrapper

function mediaQuery(query) {
  return {
    matches: query.includes('max-width') ? mobileViewport : reducedMotion,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
}

async function mountBar(path = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/products', component: { template: '<div />' } },
      { path: '/admin/login', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  wrapper = mount(FloatingContactBar, {
    attachTo: document.body,
    global: { plugins: [router] },
  })
  return { router, wrapper }
}

beforeEach(() => {
  vi.useFakeTimers()
  mobileViewport = false
  reducedMotion = false
  scrollPosition = 0
  document.body.innerHTML = '<main id="main-content" tabindex="-1"></main>'
  document.body.style.overflow = ''
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollPosition })
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2200 })
  vi.stubGlobal('matchMedia', vi.fn(mediaQuery))
  vi.stubGlobal('requestAnimationFrame', vi.fn(callback => window.setTimeout(callback, 0)))
  vi.stubGlobal('cancelAnimationFrame', vi.fn(handle => window.clearTimeout(handle)))
  vi.stubGlobal('scrollTo', vi.fn(options => {
    scrollPosition = Number(options?.top || 0)
  }))
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('FloatingContactBar', () => {
  it('opens mutually exclusive desktop panels and supports hover tolerance, Escape and outside close', async () => {
    const { wrapper } = await mountBar()
    const wecom = wrapper.get('[data-contact-action="wecom"]')
    const phone = wrapper.get('[data-contact-action="phone-desktop"]')

    expect(wrapper.get('[data-contact-action="phone-mobile"]').attributes('href')).toBe(siteConfig.contact.phoneHref)
    expect(wrapper.find('[data-contact-action="back-top"]').exists()).toBe(false)

    await wecom.trigger('mouseenter')
    expect(wrapper.get('[data-contact-panel] img').attributes('src')).toBe('/assets/wecom-qrcode/kwzg-wecom-qr.png')
    await wecom.trigger('mouseleave')
    await wrapper.get('[data-contact-panel-host]').trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(200)
    expect(wrapper.find('[data-contact-panel]').exists()).toBe(true)

    await phone.trigger('click')
    expect(wrapper.findAll('[data-contact-panel]')).toHaveLength(1)
    expect(wrapper.get('[data-contact-panel] img').attributes('src')).toBe(siteConfig.contact.phoneQr)
    expect(wrapper.get('.kw-contact-panel__phone').attributes('href')).toBe(siteConfig.contact.phoneHref)
    expect(wrapper.get('.kw-contact-panel__phone').text()).toBe(siteConfig.contact.phone)
    expect(wrapper.get('[data-contact-panel] h2').text()).toBe('微信扫码拨打电话')
    expect(wrapper.get('[data-contact-panel]').text()).toContain('扫码后打开拨号页面，请按手机提示确认拨打。')
    expect(wrapper.find('.kw-contact-panel__development-notice').exists()).toBe(false)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await vi.runAllTimersAsync()
    expect(wrapper.find('[data-contact-panel]').exists()).toBe(false)
    expect(document.activeElement).toBe(phone.element)

    await wecom.trigger('click')
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await vi.runAllTimersAsync()
    expect(wrapper.find('[data-contact-panel]').exists()).toBe(false)
  })

  it('shows scroll progress after the threshold and returns to the top with focus preserved', async () => {
    const { wrapper } = await mountBar()
    scrollPosition = 700
    window.dispatchEvent(new Event('scroll'))
    await vi.runAllTimersAsync()

    const backTop = wrapper.get('[data-contact-action="back-top"]')
    expect(backTop.attributes('style')).toContain('--kw-scroll-progress')
    await backTop.trigger('click')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(document.activeElement?.id).toBe('main-content')
  })

  it('uses an accessible mobile dialog and direct telephone link', async () => {
    mobileViewport = true
    const { wrapper } = await mountBar()
    const wecom = wrapper.get('[data-contact-action="wecom"]')

    expect(wrapper.get('[data-contact-action="phone-mobile"]').attributes('href')).toBe(siteConfig.contact.phoneHref)
    await wecom.trigger('click')
    expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(wrapper.get('[aria-label="关闭联系面板"]').element)

    await wrapper.get('.kw-contact-overlay').trigger('click')
    await vi.runAllTimersAsync()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(wecom.element)
  })

  it('closes on route changes and stays absent from every admin-prefixed route', async () => {
    const { router, wrapper } = await mountBar()
    await wrapper.get('[data-contact-action="wecom"]').trigger('click')
    expect(wrapper.find('[data-contact-panel]').exists()).toBe(true)

    await router.push('/products')
    expect(wrapper.find('[data-contact-panel]').exists()).toBe(false)
    await router.push('/admin/login')
    expect(wrapper.find('[data-floating-contact-bar]').exists()).toBe(false)
  })

  it('uses immediate scrolling when reduced motion is enabled', async () => {
    reducedMotion = true
    const { wrapper } = await mountBar()
    scrollPosition = 700
    window.dispatchEvent(new Event('scroll'))
    await vi.runAllTimersAsync()
    await wrapper.get('[data-contact-action="back-top"]').trigger('click')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('keeps the undeployed scan notice behind a development-only render condition', async () => {
    const source = await readFile(resolve(import.meta.dirname, '../../app/components/ContactPopover.vue'), 'utf8')
    expect(source).toContain('const isDevelopment = import.meta.dev')
    expect(source).toContain('v-if="isDevelopment"')
    expect(source).toContain('当前为本地预览，二维码将在官网正式上线后进行微信真机验证。')
  })
})
