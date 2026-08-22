// @vitest-environment happy-dom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compileStyle, parse } from '@vue/compiler-sfc'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BrandIntro from '../../app/components/effects/BrandIntro.vue'
import {
  BRAND_INTRO_STORAGE_KEY,
  BRAND_INTRO_TIMINGS,
} from '../../app/composables/useBrandIntro.js'

const configSource = readFileSync(resolve(process.cwd(), 'nuxt.config.js'), 'utf8')
const introSource = readFileSync(resolve(process.cwd(), 'app/components/effects/BrandIntro.vue'), 'utf8')
const particleSource = readFileSync(resolve(process.cwd(), 'app/components/effects/BrandIntroParticles.vue'), 'utf8')
const homeParticleSource = readFileSync(resolve(process.cwd(), 'app/components/effects/HomeMagneticParticleField.vue'), 'utf8')
const introDescriptor = parse(introSource, { filename: 'BrandIntro.vue' }).descriptor
const compiledIntroCss = introDescriptor.styles.map((style, index) => {
  const result = compileStyle({
    filename: 'BrandIntro.vue',
    id: `data-v-brand-intro-${index}`,
    source: style.content,
    scoped: style.scoped,
  })
  if (result.errors.length) throw result.errors[0]
  return result.code
}).join('\n')

let wrapper
let compiledStyleElement

function installMatchMedia({ reduced = false, compact = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(query => ({
      matches: query.includes('prefers-reduced-motion') ? reduced : compact,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

function mountIntro(options = {}) {
  installMatchMedia(options)
  wrapper = mount(BrandIntro, {
    global: {
      stubs: {
        BrandIntroParticles: {
          props: ['active', 'compact', 'reduced'],
          template: '<div data-intro-particles :data-active="String(active)" :data-reduced="String(reduced)" />',
        },
      },
    },
  })
  return wrapper
}

beforeEach(() => {
  vi.useFakeTimers()
  window.sessionStorage.clear()
  document.documentElement.dataset.kwzgIntro = 'show'
  delete document.documentElement.dataset.motion
  document.documentElement.removeAttribute('style')
  document.body.removeAttribute('style')
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1400 })
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
  compiledStyleElement = document.createElement('style')
  compiledStyleElement.dataset.brandIntroCompiledCss = ''
  compiledStyleElement.textContent = compiledIntroCss
  document.head.append(compiledStyleElement)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.clearAllTimers()
  vi.useRealTimers()
  window.sessionStorage.clear()
  delete document.documentElement.dataset.kwzgIntro
  delete document.documentElement.dataset.kwzgIntroLock
  document.documentElement.removeAttribute('style')
  document.body.removeAttribute('style')
  compiledStyleElement?.remove()
  compiledStyleElement = undefined
  document.body.replaceChildren()
})

describe('朱砂聚印 · 智慧启幕', () => {
  it('renders the exact decorative copy without adding a second heading', async () => {
    const intro = mountIntro()
    await nextTick()

    expect(intro.text()).toContain('瞰维智管')
    expect(intro.text()).toContain('给园区管理装上大脑和翅膀，')
    expect(intro.text()).toContain('让您少操心，赚更多。')
    expect(intro.findAll('h1')).toHaveLength(0)
    expect(intro.get('.kw-brand-intro__skip').attributes('aria-label')).toBe('跳过品牌开场，进入首页')
    expect(intro.get('img').attributes('src')).toBe('/assets/logo/kwzg-logo-symbol.png')
  })

  it('locks scrolling, completes at 2800ms and fully removes the overlay', async () => {
    const intro = mountIntro()
    await nextTick()

    expect(intro.get('[data-brand-intro]').classes()).toContain('is-active')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('40px')

    await vi.advanceTimersByTimeAsync(BRAND_INTRO_TIMINGS.desktop.duration)
    await nextTick()

    expect(intro.find('[data-brand-intro]').exists()).toBe(false)
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
    expect(window.sessionStorage.getItem(BRAND_INTRO_STORAGE_KEY)).toBe('1')
    expect(document.documentElement.dataset.kwzgIntro).toBe('done')
  })

  it('supports the skip button and Escape within the 200ms exit budget', async () => {
    const intro = mountIntro()
    await nextTick()
    await intro.get('.kw-brand-intro__skip').trigger('click')

    expect(intro.get('[data-brand-intro]').classes()).toContain('is-skipping')
    await vi.advanceTimersByTimeAsync(BRAND_INTRO_TIMINGS.skip)
    await nextTick()
    expect(intro.find('[data-brand-intro]').exists()).toBe(false)

    document.documentElement.dataset.kwzgIntro = 'show'
    wrapper.unmount()
    const escapeIntro = mountIntro()
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await vi.advanceTimersByTimeAsync(BRAND_INTRO_TIMINGS.skip)
    await nextTick()
    expect(escapeIntro.find('[data-brand-intro]').exists()).toBe(false)
  })

  it('uses the reduced-motion duration and does not activate the intro canvas', async () => {
    const intro = mountIntro({ reduced: true })
    await nextTick()

    expect(intro.get('[data-brand-intro]').classes()).toContain('is-reduced')
    expect(intro.get('[data-intro-particles]').attributes('data-reduced')).toBe('true')
    expect(intro.get('[data-intro-particles]').attributes('data-active')).toBe('false')

    await vi.advanceTimersByTimeAsync(BRAND_INTRO_TIMINGS.reduced.duration)
    await nextTick()
    expect(intro.find('[data-brand-intro]').exists()).toBe(false)
  })

  it('does not render an overlay when the pre-paint decision says to skip', async () => {
    document.documentElement.dataset.kwzgIntro = 'skip'
    const intro = mountIntro()
    await nextTick()
    expect(intro.find('[data-brand-intro]').exists()).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('never hides the document roots in any intro state', () => {
    for (const state of ['show', 'done', 'skip']) {
      document.documentElement.dataset.kwzgIntro = state
      expect(getComputedStyle(document.documentElement).display).not.toBe('none')
      expect(getComputedStyle(document.body).display).not.toBe('none')
      expect(getComputedStyle(document.documentElement).visibility).not.toBe('hidden')
      expect(getComputedStyle(document.body).visibility).not.toBe('hidden')
    }
  })

  it('leaves the rendered homepage visible and interactive after the maximum fail-safe budget', async () => {
    const nuxtRoot = document.createElement('div')
    nuxtRoot.id = '__nuxt'
    nuxtRoot.innerHTML = '<main><h1 data-home-title>让工业园区少空置</h1><button type="button" data-home-action>预约产品演示</button></main>'
    document.body.append(nuxtRoot)
    const action = nuxtRoot.querySelector('[data-home-action]')
    const actionHandler = vi.fn()
    action.addEventListener('click', actionHandler)

    const intro = mountIntro()
    await nextTick()
    await vi.advanceTimersByTimeAsync(BRAND_INTRO_TIMINGS.desktop.watchdog)
    await nextTick()

    expect(intro.find('[data-kwzg-brand-intro]').exists()).toBe(false)
    expect(nuxtRoot.querySelector('[data-home-title]')?.textContent).toContain('少空置')
    expect(getComputedStyle(document.documentElement).display).not.toBe('none')
    expect(getComputedStyle(document.body).display).not.toBe('none')
    expect(getComputedStyle(nuxtRoot).display).not.toBe('none')
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
    action.click()
    expect(actionHandler).toHaveBeenCalledOnce()
  })

  it('keeps a previously played session visible without mounting the overlay', async () => {
    window.sessionStorage.setItem(BRAND_INTRO_STORAGE_KEY, '1')
    document.documentElement.dataset.kwzgIntro = 'skip'
    const nuxtRoot = document.createElement('div')
    nuxtRoot.id = '__nuxt'
    nuxtRoot.innerHTML = '<h1 data-home-title>让工业园区少空置</h1>'
    document.body.append(nuxtRoot)

    const intro = mountIntro()
    await nextTick()

    expect(intro.find('[data-kwzg-brand-intro]').exists()).toBe(false)
    expect(getComputedStyle(document.documentElement).display).not.toBe('none')
    expect(getComputedStyle(document.body).display).not.toBe('none')
    expect(getComputedStyle(nuxtRoot).display).not.toBe('none')
    expect(nuxtRoot.querySelector('[data-home-title]')).not.toBeNull()
  })
})

describe('brand intro implementation contract', () => {
  it('uses a synchronous pre-paint session guard only for the direct homepage document', () => {
    expect(configSource).toContain("const key='kwzg_brand_intro_seen_v1'")
    expect(configSource).toContain("window.location.pathname!=='/'")
    expect(configSource).toContain('window.sessionStorage.getItem(key)')
    expect(configSource).toContain("window.sessionStorage.setItem(key,'1')")
    expect(configSource).toContain("root.dataset.kwzgIntro='show'")
    expect(configSource).toContain("catch{root.dataset.kwzgIntro='skip'}")
  })

  it('keeps the Canvas bounded and cleans up all continuous work', () => {
    for (const safeguard of [
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'ResizeObserver',
      'visibilitychange',
      'Math.min(window.devicePixelRatio || 1, 2)',
      'clamp(areaCount, 110, 168)',
      'clamp(areaCount, 52, 82)',
      "document.removeEventListener('visibilitychange', handleVisibilityChange)",
    ]) expect(particleSource).toContain(safeguard)

    expect(particleSource).not.toMatch(/setInterval|fetch\(|\$fetch|XMLHttpRequest|WebSocket/)
  })

  it('hands the permanent homepage particle field over only after completion', () => {
    expect(homeParticleSource).toContain("document.documentElement.dataset.kwzgIntro !== 'show'")
    expect(homeParticleSource).toContain("window.addEventListener('kwzg:intro-complete', handleIntroComplete)")
    expect(homeParticleSource).toContain("window.removeEventListener('kwzg:intro-complete', handleIntroComplete)")
    expect(homeParticleSource).toContain("data-particle-state='waiting'")
  })

  it('contains both JS and CSS fail-safes without routes, redirects or reloads', () => {
    expect(BRAND_INTRO_TIMINGS.desktop.watchdog).toBe(4800)
    expect(BRAND_INTRO_TIMINGS.compact.watchdog).toBe(3800)
    expect(introSource).toContain('kw-brand-intro-failsafe 4.8s')
    expect(introSource).toContain('kw-brand-intro-reduced-failsafe')
    expect(introSource).not.toMatch(/window\.location\.(?:href|assign|replace|reload)|navigateTo\(|router\.(?:push|replace)/)
  })

  it('compiles every global gate to the overlay target without hiding a document root', () => {
    const style = document.createElement('style')
    style.textContent = compiledIntroCss
    document.head.append(style)
    const nuxtRoot = document.createElement('div')
    nuxtRoot.id = '__nuxt'
    document.body.append(nuxtRoot)
    const protectedRoots = [document.documentElement, document.body, nuxtRoot]
    const dangerousRules = []

    for (const rule of style.sheet.cssRules) {
      if (!('selectorText' in rule)) continue
      const hidesContent = rule.style.display === 'none' || rule.style.visibility === 'hidden'
      if (!hidesContent) continue
      const selectors = rule.selectorText.split(',').map(selector => selector.trim())
      for (const selector of selectors) {
        if (protectedRoots.some(root => root.matches(selector))) dangerousRules.push(selector)
      }
    }

    expect(compiledIntroCss).toMatch(/html:not\(\[data-kwzg-intro=['"]show['"]\]\) \[data-kwzg-brand-intro\]/)
    expect(compiledIntroCss).toMatch(/html\[data-kwzg-intro=['"]show['"]\] \[data-kwzg-brand-intro\]/)
    expect(dangerousRules).toEqual([])
    style.remove()
  })
})
