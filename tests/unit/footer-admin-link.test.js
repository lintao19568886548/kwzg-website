import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const footerSource = readFileSync(new URL('../../app/components/SiteFooter.vue', import.meta.url), 'utf8')
const headerSource = readFileSync(new URL('../../app/components/SiteHeader.vue', import.meta.url), 'utf8')
const footerCss = readFileSync(new URL('../../app/assets/css/stage1-sections.css', import.meta.url), 'utf8')

describe('public footer administrator entry', () => {
  it('links the subtle global footer entry to the independent admin login', () => {
    expect(footerSource).toContain('class="kw-footer__admin-link"')
    expect(footerSource).toContain('to="/admin/login"')
    expect(footerSource).toContain('aria-label="进入瞰维智管官网后台登录页"')
    expect(footerSource).toContain('>后台管理</NuxtLink>')
  })

  it('keeps the public system login link unchanged', () => {
    expect(headerSource).toContain(':href="siteConfig.systemUrl"')
    expect(headerSource).not.toContain('to="/admin/login"')
  })

  it('provides restrained hover and keyboard focus treatment', () => {
    expect(footerCss).toMatch(/\.kw-footer__admin-link \{[\s\S]*?opacity: 0\.72;/)
    expect(footerCss).toMatch(/\.kw-footer__admin-link:focus-visible \{[\s\S]*?outline: 2px solid currentcolor;/)
  })
})
