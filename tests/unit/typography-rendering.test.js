import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const mainCss = readFileSync(new URL('../../app/assets/css/main.css', import.meta.url), 'utf8')
const stageOneCss = readFileSync(new URL('../../app/assets/css/stage1.css', import.meta.url), 'utf8')
const stageOneSectionsCss = readFileSync(new URL('../../app/assets/css/stage1-sections.css', import.meta.url), 'utf8')
const stageTwoCss = readFileSync(new URL('../../app/assets/css/stage2.css', import.meta.url), 'utf8')
const motionCss = readFileSync(new URL('../../app/assets/css/motion.css', import.meta.url), 'utf8')
const floatingContactCss = readFileSync(new URL('../../app/assets/css/floating-contact.css', import.meta.url), 'utf8')
const typographyClarityCss = readFileSync(new URL('../../app/assets/css/typography-clarity.css', import.meta.url), 'utf8')
const grandVisualCss = readFileSync(new URL('../../app/assets/css/grand-visual-system.css', import.meta.url), 'utf8')
const nuxtConfig = readFileSync(new URL('../../nuxt.config.js', import.meta.url), 'utf8')
const brandLogo = readFileSync(new URL('../../app/components/BrandLogo.vue', import.meta.url), 'utf8')

describe('typography rendering safeguards', () => {
  it('uses a local Windows-first Chinese font stack without remote font dependencies', () => {
    expect(mainCss).toContain('"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC"')
    expect(mainCss).toContain('"Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC", "Segoe UI"')
    expect(mainCss).toContain('font-kerning: normal')
    expect(mainCss).toContain('font-synthesis: none')
    expect(mainCss).toContain('text-rendering: auto')
    expect(typographyClarityCss).toContain('-webkit-font-smoothing: auto')
    expect(typographyClarityCss).toContain('-moz-osx-font-smoothing: auto')
    expect(`${mainCss}\n${stageOneCss}\n${stageOneSectionsCss}\n${stageTwoCss}\n${typographyClarityCss}\n${nuxtConfig}`).not.toMatch(/@font-face|fonts\.googleapis|text-rendering:\s*optimizeLegibility|font-smoothing:\s*(antialiased|grayscale)/)
    expect(nuxtConfig.indexOf('~/assets/css/typography-clarity.css')).toBeGreaterThan(nuxtConfig.indexOf('~/assets/css/public-demo-showcase.css'))
    expect(typographyClarityCss).toContain('--kw-font-cn: "Microsoft YaHei", "Microsoft YaHei UI", "PingFang SC", "Noto Sans CJK SC", "Source Han Sans SC", Arial, sans-serif')
  })

  it('keeps the benchmark container, gutters and hero proportions in one final override layer', () => {
    expect(grandVisualCss).toContain('--kw-container-wide: 1300px')
    expect(grandVisualCss).toContain('--kw-gutter-desktop: 2rem')
    expect(grandVisualCss).toContain('--kw-gutter-mobile: 1.25rem')
    expect(grandVisualCss).toContain('--kw-scrollbar-gutter-pair: 30px')
    expect(grandVisualCss).toContain('scrollbar-gutter: stable both-edges')
    expect(grandVisualCss).toMatch(/\.kw-container \{[^}]*width: min\(var\(--kw-container-wide\), calc\(100vw - var\(--kw-gutter-desktop\) \* 2 \+ var\(--kw-scrollbar-gutter-pair\)\)\)/)
    expect(grandVisualCss).toMatch(/\.kw-home-hero__grid \{[\s\S]*?gap: 3\.5rem;[\s\S]*?grid-template-columns: minmax\(0, 31\.25rem\) minmax\(0, 1fr\)/)
    expect(grandVisualCss).toMatch(/@media \(min-width: 100rem\)[\s\S]*?font-size: 3\.5rem !important;[\s\S]*?line-height: 4\.25rem !important;/)
    expect(grandVisualCss).toMatch(/@media \(max-width: 64rem\)[\s\S]*?font-size: 2\.875rem !important;[\s\S]*?line-height: 3\.625rem !important;/)
    expect(grandVisualCss).toMatch(/@media \(max-width: 47\.9375rem\)[\s\S]*?var\(--kw-gutter-mobile\)/)
  })

  it('removes the reveal transform after the entrance transition', () => {
    expect(motionCss).toMatch(/\[data-reveal-state='visible'\] \{[^}]*opacity: 1;[^}]*transform: none;/)
    expect(motionCss).toMatch(/\[data-reveal-state='visible'\] \{[^}]*will-change: auto;/)
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

  it('uses integer-sized responsive display type and fixed Chinese title tracking', () => {
    expect(typographyClarityCss).toContain('--font-body: 17px')
    expect(typographyClarityCss).toContain('--kw-type-display-size: 50px')
    expect(typographyClarityCss).toContain('--kw-type-section-size: 38px')
    expect(typographyClarityCss).toContain('letter-spacing: normal !important')
    expect(typographyClarityCss).toMatch(/@media \(max-width: 1024px\)[\s\S]*--kw-type-display-size: 42px/)
    expect(typographyClarityCss).toMatch(/@media \(max-width: 540px\)[\s\S]*--kw-type-display-size: 36px/)
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
