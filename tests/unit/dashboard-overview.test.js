import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
const source = readFileSync(new URL('../../app/components/home/DashboardOverview.vue', import.meta.url), 'utf8')
const homepageSource = readFileSync(new URL('../../app/components/home/HomeStageOne.vue', import.meta.url), 'utf8')
const motionSource = readFileSync(new URL('../../app/assets/css/motion.css', import.meta.url), 'utf8')

describe('verified operating overview presentation', () => {
  it('fills the payment panel only with verified current-state fields and demo labels', () => {
    expect(source).toContain('当前口径对比')
    expect(source).toContain('累计应收')
    expect(source).toContain('累计实收')
    expect(source).toContain('待收余额')
    expect(source).toContain('回款完成度')
    expect(source).toContain('演示数据')
  })

  it('does not restore an unsupported time-series trend or the previous empty state', () => {
    expect(source).not.toMatch(/本月应收趋势|趋势折线|实时趋势|自动变化/)
    expect(source).not.toContain('演示账单写入后显示回款脉搏')
    expect(source).not.toMatch(/<polyline|class="(?:area|line-primary|line-secondary)"/)
  })

  it('keeps the payment figures internally consistent', () => {
    expect(source).toContain('126.8 万')
    expect(source).toContain('118.6 万')
    expect(source).toContain('8.2 万')
    expect(source).toContain('width: 93.5%')
  })

  it('shows only the directly verified overview navigation inside the overview mockup', () => {
    expect(source).toContain("group: '工作台'")
    expect(source).toContain("label: '运营总览'")
    expect(source).not.toMatch(/待租厂房|房态矩阵|员工移动工作台|设备巡检|数据地图|设备管理|人事|门禁管理|public/)
  })

  it('floats only the homepage hero workbench with motion and performance fallbacks', () => {
    expect(source).toContain('floating: Boolean')
    expect(source).toContain("'kw-dashboard-source--floating': props.floating")
    expect(homepageSource.match(/<HomeDashboardOverview[^>]*\bfloating\b[^>]*>/g)).toHaveLength(1)
    expect(motionSource).toContain('@keyframes kw-dashboard-float')
    expect(motionSource).toContain('@keyframes kw-dashboard-shadow-float')
    expect(motionSource).toMatch(/\.kw-dashboard-source--floating > \.kw-dashboard \{[\s\S]*?animation: none;[\s\S]*?transform: none;[\s\S]*?will-change: auto;/)
    expect(motionSource).toMatch(/\.kw-dashboard-source--floating::before,[\s\S]*?\.kw-dashboard-source--floating::after/)
    expect(motionSource).toContain("html[data-document-visibility='hidden'] .kw-dashboard-source--floating")
    expect(motionSource).toContain("html[data-motion='off'] .kw-dashboard-source--floating")
    expect(motionSource).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.kw-dashboard-source--floating/)
    expect(motionSource).toMatch(/@media \(update: slow\)[\s\S]*\.kw-dashboard-source--floating/)
  })
})
