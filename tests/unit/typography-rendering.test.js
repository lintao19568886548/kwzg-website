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
const cinnabarCss = readFileSync(new URL('../../app/assets/css/cinnabar-monochrome.css', import.meta.url), 'utf8')
const nuxtConfig = readFileSync(new URL('../../nuxt.config.js', import.meta.url), 'utf8')
const brandLogo = readFileSync(new URL('../../app/components/BrandLogo.vue', import.meta.url), 'utf8')
const brandIntro = readFileSync(new URL('../../app/components/effects/BrandIntro.vue', import.meta.url), 'utf8')

describe('typography rendering safeguards', () => {
  it('uses a local Windows-first Chinese font stack without remote font dependencies', () => {
    expect(mainCss).toContain('"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC"')
    expect(mainCss).toContain('"Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC", "Segoe UI"')
    expect(mainCss).toContain('font-kerning: normal')
    expect(mainCss).toContain('font-synthesis: none')
    expect(mainCss).toContain('text-rendering: optimizeLegibility')
    expect(typographyClarityCss).toContain('text-rendering: optimizeLegibility')
    expect(typographyClarityCss).toContain('-webkit-font-smoothing: auto')
    expect(typographyClarityCss).toContain('-moz-osx-font-smoothing: auto')
    expect(`${mainCss}\n${stageOneCss}\n${stageOneSectionsCss}\n${stageTwoCss}\n${typographyClarityCss}\n${nuxtConfig}`).not.toMatch(/@font-face|fonts\.googleapis|font-smoothing:\s*(antialiased|grayscale)/)
    expect(nuxtConfig.indexOf('~/assets/css/typography-clarity.css')).toBeGreaterThan(nuxtConfig.indexOf('~/assets/css/public-demo-showcase.css'))
    expect(typographyClarityCss).toContain('--font-family-sans: "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", system-ui, -apple-system, "Segoe UI", Arial, sans-serif')
  })

  it('keeps the 1360/1440/900 container system and hero proportions in one final override layer', () => {
    expect(grandVisualCss).toContain('--site-container: 1360px')
    expect(grandVisualCss).toContain('--site-container-wide: 1440px')
    expect(grandVisualCss).toContain('--site-reading: 900px')
    expect(grandVisualCss).toContain('--site-gutter-desktop: 40px')
    expect(grandVisualCss).toContain('--site-gutter-laptop: 32px')
    expect(grandVisualCss).toContain('--site-gutter-tablet: 24px')
    expect(grandVisualCss).toContain('--site-gutter-mobile: 20px')
    expect(grandVisualCss).toContain('--kw-scrollbar-gutter-pair: 30px')
    expect(grandVisualCss).toContain('scrollbar-gutter: stable both-edges')
    expect(grandVisualCss).toMatch(/\.site-container,\s*\.kw-container \{[\s\S]*?var\(--site-container\)[\s\S]*?var\(--kw-gutter-desktop\)/)
    expect(grandVisualCss).toMatch(/\.site-container--wide,[\s\S]*?var\(--site-container-wide\)/)
    expect(grandVisualCss).toMatch(/\.site-container--reading \{[\s\S]*?var\(--site-reading\)/)
    expect(grandVisualCss).toMatch(/\.kw-home-hero__grid \{[\s\S]*?gap: 4rem;[\s\S]*?grid-template-columns: minmax\(31\.25rem, 32\.5rem\) minmax\(45rem, 1fr\)/)
    expect(grandVisualCss).toMatch(/font-size: var\(--font-size-hero\) !important;[\s\S]*?line-height: var\(--line-height-hero\) !important;/)
    expect(grandVisualCss).toMatch(/@media \(max-width: 74\.9375rem\)[\s\S]*?font-size: 48px !important;[\s\S]*?line-height: 58px !important;/)
    expect(grandVisualCss).toMatch(/@media \(max-width: 37\.4375rem\)[\s\S]*?font-size: 38px !important;[\s\S]*?line-height: 48px !important;/)
  })

  it('keeps the hero dashboard complete at desktop and intermediate widths', () => {
    expect(grandVisualCss).toMatch(/\.kw-home-v3 \.kw-dashboard \{[\s\S]*?height: 33\.125rem;[\s\S]*?overflow: hidden;/)
    expect(grandVisualCss).toMatch(/@media \(max-width: 75rem\)[\s\S]*?\.kw-home-v3 \.kw-dashboard \{[\s\S]*?height: 34rem;/)
    expect(grandVisualCss).toMatch(/@media \(max-width: 72rem\)[\s\S]*?grid-template-columns: minmax\(0, 1fr\);[\s\S]*?\.kw-home-v3 \.kw-dashboard-source \{[\s\S]*?max-width: none;/)
    expect(grandVisualCss).toMatch(/\.kw-home-v3 \.kw-dashboard__tasks li:nth-child\(n \+ 5\) \{[^}]*display: none;/)
  })

  it('keeps dashboard demo labels and task counts readable in every public placement', () => {
    expect(cinnabarCss).toMatch(/\.kw-site-shell \.kw-dashboard__topbar \.kw-tag \{[\s\S]*?color: var\(--kw-red-800\) !important;[\s\S]*?white-space: nowrap !important;/)
    expect(cinnabarCss).toMatch(/\.kw-site-shell \.kw-dashboard__tasks-heading > strong \{[\s\S]*?display: inline-flex !important;[\s\S]*?min-width: max-content !important;[\s\S]*?white-space: nowrap !important;/)
    expect(cinnabarCss).toMatch(/\.kw-site-shell \.kw-dashboard__tasks li > em \{[\s\S]*?display: inline-flex !important;[\s\S]*?min-width: 1\.5rem !important;[\s\S]*?color: var\(--kw-text-on-red\) !important;/)
  })

  it('keeps the five-case mosaic balanced across desktop and tablet widths', () => {
    expect(grandVisualCss).toMatch(/@media \(min-width: 75rem\)[\s\S]*?\.kw-grand-cases \.kw-park-card:nth-child\(-n \+ 2\) \{[\s\S]*?height: clamp\(22rem, 28vw, 26rem\);/)
    expect(grandVisualCss).toMatch(/@media \(min-width: 56\.25rem\) and \(max-width: 74\.9375rem\)[\s\S]*?\.kw-grand-cases \.kw-park-card:last-child \{[\s\S]*?grid-column: 1 \/ -1;/)
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

  it('centers the brand intro without leaving its text on a transformed layer', () => {
    expect(brandIntro).toMatch(/\.kw-brand-intro__content \{[\s\S]*?inset: 0;[\s\S]*?height: max-content;[\s\S]*?margin: auto;[\s\S]*?transform: none;/)
    expect(brandIntro).not.toMatch(/\.kw-brand-intro__content \{[^}]*translate\(/)
  })

  it('keeps all configured text weights on supported 100-step values', () => {
    expect(`${mainCss}\n${stageOneCss}\n${stageOneSectionsCss}\n${stageTwoCss}`).not.toMatch(/font-weight:\s*(650|750|850)/)
  })

  it('uses integer-sized responsive display type and fixed Chinese title tracking', () => {
    expect(typographyClarityCss).toContain('--font-body: 17px')
    expect(typographyClarityCss).toContain('--font-size-hero: 60px')
    expect(typographyClarityCss).toContain('--font-size-page-title: 52px')
    expect(typographyClarityCss).toContain('--font-size-section-title: 42px')
    expect(typographyClarityCss).toContain('--font-size-card-title: 22px')
    expect(typographyClarityCss).toContain('--font-size-body-large: 19px')
    expect(typographyClarityCss).toContain('--font-size-system-ui: 15px')
    expect(typographyClarityCss).toContain('letter-spacing: normal !important')
    expect(typographyClarityCss).toMatch(/@media \(max-width: 1024px\)[\s\S]*--kw-type-display-size: 48px/)
    expect(typographyClarityCss).toMatch(/@media \(max-width: 899px\)[\s\S]*--kw-type-display-size: 42px/)
    expect(typographyClarityCss).toMatch(/@media \(max-width: 599px\)[\s\S]*--kw-type-display-size: 38px[\s\S]*--font-size-system-ui: 14px/)
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
