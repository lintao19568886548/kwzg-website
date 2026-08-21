/** @vitest-environment happy-dom */

import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import CredentialLightbox from '~/components/CredentialLightbox.vue'

let wrapper
let mountPoint

async function mountLightbox(open = false) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/about', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  mountPoint = document.createElement('div')
  document.getElementById('__nuxt').append(mountPoint)
  wrapper = mount(CredentialLightbox, {
    attachTo: mountPoint,
    props: {
      open,
      image: '/assets/certifications/tech-sme-2026-detail.webp',
      alt: '东莞市宜租网络科技有限公司科技型中小企业资质牌匾及证书实拍',
      title: '科技型中小企业资质展示',
      returnFocusTo: document.getElementById('qualification-trigger'),
    },
    global: {
      plugins: [router],
      stubs: {
        ClientOnly: { template: '<slot />' },
        UiLinearIcon: true,
      },
    },
  })
  return { router, wrapper }
}

beforeEach(() => {
  document.body.innerHTML = '<div id="__nuxt"><button id="qualification-trigger">查看资质</button></div>'
  document.body.style.overflow = ''
  document.getElementById('qualification-trigger').focus()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  mountPoint = undefined
  document.body.innerHTML = ''
})

describe('CredentialLightbox', () => {
  it('opens as a modal, locks and hides the background, then restores focus on Escape', async () => {
    const trigger = document.getElementById('qualification-trigger')
    const { wrapper } = await mountLightbox()
    await wrapper.setProps({ open: true })
    await nextTick()

    expect(document.querySelector('[data-credential-dialog]')?.getAttribute('aria-modal')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.getElementById('__nuxt').getAttribute('aria-hidden')).toBe('true')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('关闭资质大图')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.body.style.overflow).toBe('')
    expect(document.getElementById('__nuxt').hasAttribute('aria-hidden')).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('closes from the overlay and when the route changes', async () => {
    const { router, wrapper } = await mountLightbox()
    await wrapper.setProps({ open: true })
    await nextTick()
    await document.querySelector('[data-credential-overlay]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])

    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await router.push('/about')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('keeps Tab focus inside the dialog', async () => {
    const { wrapper } = await mountLightbox()
    await wrapper.setProps({ open: true })
    await nextTick()
    const close = document.querySelector('[aria-label="关闭资质大图"]')
    close.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(close)
  })
})
