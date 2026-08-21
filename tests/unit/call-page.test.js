import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { siteConfig } from '~/config/site'
import { createSingleDialAttempt, shouldAttemptAutomaticDial } from '~/utils/phone-call'

const callPagePath = resolve(import.meta.dirname, '../../app/pages/call.vue')

describe('public call landing page', () => {
  it.each([
    'MicroMessenger',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    'Mozilla/5.0 (Linux; Android 15)',
    'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)',
    'Example Mobile Browser',
  ])('allows one progressive dial attempt for mobile user agent: %s', (userAgent) => {
    expect(shouldAttemptAutomaticDial(userAgent)).toBe(true)
  })

  it('does not automatically dial on a desktop user agent', () => {
    expect(shouldAttemptAutomaticDial('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false)
  })

  it('caps automatic dialing at exactly one navigation attempt', () => {
    const navigate = vi.fn()
    const attempt = createSingleDialAttempt(siteConfig.contact.phoneHref, navigate)

    expect(attempt()).toBe(true)
    expect(attempt()).toBe(false)
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith(siteConfig.contact.phoneHref)
  })

  it('keeps the accessible fallback, permanent noindex and local-only behavior in source', async () => {
    const source = await readFile(callPagePath, 'utf8')
    for (const text of [
      '电话咨询',
      '正在为您打开拨号界面…',
      '如未自动唤起，请点击下方按钮',
      '立即拨打',
      '返回瞰维智管官网',
      '拨号前，手机系统可能会要求您确认。',
      'noindex, nofollow',
    ]) expect(source).toContain(text)

    expect(source).toContain(':href="siteConfig.contact.phoneHref"')
    expect(source).toContain('role="status"')
    for (const forbidden of ['$fetch', 'fetch(', '/api/', 'localStorage', 'sessionStorage', 'document.cookie', siteConfig.systemUrl]) {
      expect(source).not.toContain(forbidden)
    }
  })
})
