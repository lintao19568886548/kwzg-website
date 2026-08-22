/** @vitest-environment happy-dom */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SiteHeader from '~/components/SiteHeader.vue'
import { siteConfig } from '~/config/site'

const routes = [
  '/',
  '/products',
  '/solutions',
  '/cases',
  '/cases/tongfu',
  '/cases/foshan-lecong',
  '/cases/shenzhen-kengzi',
  '/cases/xintang-xizhou',
  '/cases/gaobu-tongxing',
  '/service',
  '/about',
  '/demo',
  '/privacy',
].map(path => ({ path, component: { template: '<div />' } }))

let wrapper
let reducedMotion = false

async function mountHeader(path = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  wrapper = mount(SiteHeader, {
    attachTo: document.body,
    global: {
      plugins: [router],
      stubs: {
        NuxtLink: RouterLink,
        BrandLogo: { template: '<RouterLink class="logo-stub" to="/" aria-label="瞰维智管官网首页"><span>瞰维智管</span></RouterLink>' },
        UiBaseButton: { props: ['to'], template: '<RouterLink :to="to"><slot /></RouterLink>' },
      },
    },
  })
  return { router, wrapper }
}

beforeEach(() => {
  reducedMotion = false
  document.body.innerHTML = ''
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: reducedMotion,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    disconnect() {}
  })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('SiteHeader home navigation', () => {
  it('uses the centralized production system login target on desktop and mobile', async () => {
    const { wrapper } = await mountHeader('/')
    expect(siteConfig.systemUrl).toBe('https://yizuw.cn')
    expect(wrapper.find('.kw-header__tagline').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(siteConfig.brand.tagline)
    const desktopLogin = wrapper.get('.kw-header__login')
    expect(desktopLogin.attributes('href')).toBe(siteConfig.systemUrl)
    expect(desktopLogin.attributes('target')).toBe('_blank')
    expect(desktopLogin.attributes('rel')).toContain('noopener')

    await wrapper.get('.kw-header__menu-button').trigger('click')
    const mobileLogin = wrapper.findAll('#mobile-navigation a').find(link => link.text().includes('登录系统'))
    expect(mobileLogin?.attributes('href')).toBe(siteConfig.systemUrl)
  })

  it('renders the required shared order and exactly one current desktop item', async () => {
    const { router, wrapper } = await mountHeader('/')
    const expected = ['首页', '产品能力', '解决方案', '客户案例', '实施服务', '关于我们']
    expect(wrapper.findAll('.kw-header__nav a').map(link => link.text().trim())).toEqual(expected)
    await wrapper.get('.kw-header__menu-button').trigger('click')
    expect(wrapper.findAll('.kw-header__mobile-nav a').slice(0, 6).map(link => link.text().replace('→', '').trim())).toEqual(expected)
    expect(wrapper.findAll('.kw-header__nav a.is-active')).toHaveLength(1)
    expect(wrapper.get('.kw-header__nav a.is-active').text()).toBe('首页')
    expect(wrapper.get('.kw-header__nav a.is-active').attributes('aria-current')).toBe('page')

    await router.push('/cases/tongfu')
    await flushPromises()
    expect(wrapper.findAll('.kw-header__nav a.is-active')).toHaveLength(1)
    expect(wrapper.get('.kw-header__nav a.is-active').text()).toBe('客户案例')

    await router.push('/privacy')
    await flushPromises()
    expect(wrapper.findAll('.kw-header__nav a.is-active')).toHaveLength(0)
    expect(wrapper.find('.kw-header__nav a[aria-current="page"]').exists()).toBe(false)
  })

  it.each([
    ['/', '首页'],
    ['/products', '产品能力'],
    ['/solutions', '解决方案'],
    ['/cases', '客户案例'],
    ['/cases/tongfu', '客户案例'],
    ['/cases/foshan-lecong', '客户案例'],
    ['/cases/shenzhen-kengzi', '客户案例'],
    ['/cases/xintang-xizhou', '客户案例'],
    ['/cases/gaobu-tongxing', '客户案例'],
    ['/service', '实施服务'],
    ['/about', '关于我们'],
    ['/demo', null],
    ['/privacy', null],
  ])('uses one exact active item on %s', async (path, expectedActive) => {
    const { wrapper } = await mountHeader(path)
    const activeLinks = wrapper.findAll('.kw-header__nav a.is-active')
    expect(activeLinks).toHaveLength(expectedActive ? 1 : 0)
    if (expectedActive) {
      expect(activeLinks[0].text()).toBe(expectedActive)
      expect(activeLinks[0].attributes('aria-current')).toBe('page')
    }
  })

  it('returns home without a reload, closes mobile navigation and scrolls to the top', async () => {
    const { router, wrapper } = await mountHeader('/products')
    await wrapper.get('.kw-header__menu-button').trigger('click')
    expect(wrapper.find('#mobile-navigation').exists()).toBe(true)

    await wrapper.findAll('.kw-header__mobile-nav a')[0].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.find('#mobile-navigation').exists()).toBe(false)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('scrolls an already-open home page without duplicate navigation and respects reduced motion', async () => {
    reducedMotion = true
    const { router, wrapper } = await mountHeader('/')
    await wrapper.findAll('.kw-header__nav a')[0].trigger('click')
    expect(router.currentRoute.value.path).toBe('/')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('keeps the complete logo link and closes the menu with Escape or an outside pointer', async () => {
    const { router, wrapper } = await mountHeader('/about')
    const logo = wrapper.get('.logo-stub')
    expect(logo.attributes('href')).toBe('/')
    expect(logo.attributes('aria-label')).toBe('瞰维智管官网首页')
    await logo.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')

    const button = wrapper.get('.kw-header__menu-button')
    await button.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.find('#mobile-navigation').exists()).toBe(false)
    expect(document.activeElement).toBe(button.element)

    await button.trigger('click')
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await flushPromises()
    expect(wrapper.find('#mobile-navigation').exists()).toBe(false)
  })

  it('keeps semantic internal links in the case breadcrumb', async () => {
    const [caseSource, logoSource, headerSource] = await Promise.all([
      readFile(resolve('app/pages/cases/[slug].vue'), 'utf8'),
      readFile(resolve('app/components/BrandLogo.vue'), 'utf8'),
      readFile(resolve('app/components/SiteHeader.vue'), 'utf8'),
    ])
    expect(caseSource).toContain('<NuxtLink to="/">首页</NuxtLink>')
    expect(caseSource).toContain('<NuxtLink to="/cases">客户案例</NuxtLink>')
    expect(caseSource).toContain('<li aria-current="page">{{ item.name }}</li>')
    expect(caseSource).not.toContain('javascript:history.back()')
    expect(logoSource).toContain("to=\"/\"")
    expect(logoSource).toContain("'瞰维智管官网首页'")
    expect(headerSource).not.toMatch(/127\.0\.0\.1|window\.location|yizuw\.cn/)
  })
})
