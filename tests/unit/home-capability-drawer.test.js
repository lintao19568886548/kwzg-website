/** @vitest-environment happy-dom */

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import HomeCapabilityDrawer from '~/components/home/HomeCapabilityDrawer.vue'

let wrapper

beforeEach(() => {
  document.body.innerHTML = '<div id="__nuxt"><button id="drawer-trigger">打开完整能力清单</button><div id="mount-point"></div></div>'
  document.body.style.overflow = ''
  document.getElementById('drawer-trigger').focus()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('HomeCapabilityDrawer', () => {
  it('locks the page, exposes all capabilities, traps focus and restores the trigger', async () => {
    const trigger = document.getElementById('drawer-trigger')
    wrapper = mount(HomeCapabilityDrawer, {
      attachTo: document.getElementById('mount-point'),
      props: { open: false },
    })

    await wrapper.setProps({ open: true })
    await nextTick()

    const dialog = document.querySelector('[role="dialog"]')
    const close = document.querySelector('[aria-label="关闭完整能力清单"]')
    const summaries = [...document.querySelectorAll('summary')]
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.textContent).toContain('查看全部 206 项匹配能力')
    expect(summaries).toHaveLength(7)
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.getElementById('__nuxt').getAttribute('aria-hidden')).toBe('true')
    expect(document.activeElement).toBe(close)

    close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(summaries.at(-1))

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    await wrapper.setProps({ open: false })
    await nextTick()

    expect(document.body.style.overflow).toBe('')
    expect(document.getElementById('__nuxt').hasAttribute('aria-hidden')).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })
})
