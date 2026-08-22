/** @vitest-environment happy-dom */

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeMagneticParticleField from '../../app/components/effects/HomeMagneticParticleField.vue'

let reducedMotion = false
let resizeObservers
let intersectionObservers
let context
let host
let wrapper
let nextFrameId
let documentHidden

function mediaQuery(query) {
  return {
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
}

class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback
    this.disconnect = vi.fn()
    this.observe = vi.fn()
    resizeObservers.push(this)
  }
}

class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback
    this.disconnect = vi.fn()
    this.observe = vi.fn()
    intersectionObservers.push(this)
  }
}

beforeEach(() => {
  reducedMotion = false
  resizeObservers = []
  intersectionObservers = []
  nextFrameId = 1
  documentHidden = false
  host = document.createElement('section')
  document.body.append(host)

  context = {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    setTransform: vi.fn(),
  }

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    bottom: 620,
    height: 620,
    left: 0,
    right: 1200,
    top: 0,
    width: 1200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => documentHidden)
  vi.stubGlobal('matchMedia', vi.fn(mediaQuery))
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => nextFrameId++))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  host?.remove()
  vi.unstubAllGlobals()
})

describe('HomeMagneticParticleField lifecycle', () => {
  it('initializes one decorative Canvas loop and fully disconnects it on unmount', () => {
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener')
    wrapper = mount(HomeMagneticParticleField, { attachTo: host })
    const removeHostListener = vi.spyOn(wrapper.element.parentElement, 'removeEventListener')

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('canvas').attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('data-particle-state')).toBe('ready')
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(resizeObservers).toHaveLength(1)
    expect(intersectionObservers).toHaveLength(1)

    intersectionObservers[0].callback([{ isIntersecting: false }])
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    wrapper = undefined
    expect(resizeObservers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(intersectionObservers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(removeHostListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(removeHostListener).toHaveBeenCalledWith('pointerleave', expect.any(Function))
    expect(removeHostListener).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    expect(removeDocumentListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })

  it('draws a static grid without starting a frame loop in reduced-motion mode', () => {
    reducedMotion = true
    wrapper = mount(HomeMagneticParticleField, { attachTo: host })

    expect(wrapper.attributes('data-particle-motion')).toBe('static')
    expect(context.arc).toHaveBeenCalled()
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('pauses for hidden tabs and resumes only when the document becomes visible', () => {
    wrapper = mount(HomeMagneticParticleField, { attachTo: host })
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)

    documentHidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1)

    documentHidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('uses a one-shot blank-area touch fallback without blocking scroll or controls', () => {
    wrapper = mount(HomeMagneticParticleField, { attachTo: host })
    const canvasHost = wrapper.element.parentElement

    const touchMove = new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 420,
      clientY: 240,
      pointerType: 'touch',
    })
    canvasHost.dispatchEvent(touchMove)
    expect(touchMove.defaultPrevented).toBe(false)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)

    const blankTouch = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 420,
      clientY: 240,
      pointerType: 'touch',
    })
    canvasHost.dispatchEvent(blankTouch)
    expect(blankTouch.defaultPrevented).toBe(false)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)

    const button = document.createElement('button')
    canvasHost.append(button)
    button.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 420,
      clientY: 240,
      pointerType: 'touch',
    }))
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
  })
})
