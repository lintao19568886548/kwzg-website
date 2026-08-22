import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const mainCss = readFileSync(new URL('../../app/assets/css/main.css', import.meta.url), 'utf8')
const stageOneCss = readFileSync(new URL('../../app/assets/css/stage1.css', import.meta.url), 'utf8')
const stageOneSectionsCss = readFileSync(new URL('../../app/assets/css/stage1-sections.css', import.meta.url), 'utf8')
const stageTwoCss = readFileSync(new URL('../../app/assets/css/stage2.css', import.meta.url), 'utf8')
const motionCss = readFileSync(new URL('../../app/assets/css/motion.css', import.meta.url), 'utf8')
const floatingContactCss = readFileSync(new URL('../../app/assets/css/floating-contact.css', import.meta.url), 'utf8')
const nuxtConfig = readFileSync(new URL('../../nuxt.config.js', import.meta.url), 'utf8')
const brandLogo = readFileSync(new URL('../../app/components/BrandLogo.vue', import.meta.url), 'utf8')

describe('typography rendering safeguards', () => {
  it('uses a local Windows-first Chinese font stack without remote font dependencies', () => {
    expect(mainCss).toContain('"Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei"')
    expect(mainCss).toContain('"PingFang SC", "Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC"')
    expect(mainCss).toContain('font-synthesis: none')
    expect(`${mainCss}\n${stageOneCss}\n${stageOneSectionsCss}\n${stageTwoCss}\n${nuxtConfig}`).not.toMatch(/@font-face|fonts\.googleapis|font-smoothing|text-rendering:\s*optimizeLegibility/)
  })

  it('removes the reveal transform after the entrance transition', () => {
    expect(motionCss).toMatch(/\[data-reveal-state='visible'\] \{[^}]*opacity: 1;[^}]*transform: none;/)
    expect(motionCss).not.toMatch(/\[data-reveal-state='visible'\] \{[^}]*transform:\s*translate3d\(0, 0, 0\)/)
  })

  it('keeps workbench text static and animates decorative layers only', () => {
    expect(motionCss).toMatch(/\.kw-dashboard-source--floating > \.kw-dashboard \{[\s\S]*?animation: none;[\s\S]*?transform: none;[\s\S]*?will-change: auto;/)
    expect(motionCss).toMatch(/\.kw-dashboard-source--floating::before[\s\S]*?animation: kw-dashboard-shadow-float/)
    expect(motionCss).toMatch(/\.kw-dashboard-source--floating::after[\s\S]*?animation: kw-dashboard-float/)
  })

  it('keeps all configured text weights on supported 100-step values', () => {
    expect(`${mainCss}\n${stageOneCss}\n${stageOneSectionsCss}\n${stageTwoCss}`).not.toMatch(/font-weight:\s*(650|750|850)/)
  })

  it('does not keep the desktop contact panel on a transformed text layer', () => {
    expect(floatingContactCss).toMatch(/^\.kw-contact-popover-host \{[^}]*bottom: 0;/m)
    expect(floatingContactCss).not.toMatch(/^\.kw-contact-popover-host \{[^}]*transform:/m)
  })

  it('declares intrinsic logo dimensions for stable high-density rendering', () => {
    expect(brandLogo).toContain(':width="logoWidth"')
    expect(brandLogo).toContain('height="160"')
    expect(brandLogo).toContain('props.withTagline ? 670 : 778')
    expect(stageOneCss).toMatch(/\.kw-brand-logo img \{[^}]*image-rendering: auto;/)
  })
})
