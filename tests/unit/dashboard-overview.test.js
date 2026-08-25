import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { systemModuleGroups } from '../../app/config/system-modules.js'
import { publicSystemDemoData } from '../../app/data/public-system-demo-data.js'
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
    expect(publicSystemDemoData.overview.received + publicSystemDemoData.overview.outstanding).toBeCloseTo(publicSystemDemoData.overview.receivable, 5)
    expect((publicSystemDemoData.overview.received / publicSystemDemoData.overview.receivable) * 100).toBeCloseTo(publicSystemDemoData.overview.collectionRate, 1)
    expect(source).toContain('demo.overview.receivable')
    expect(source).toContain('demo.overview.received')
    expect(source).toContain('demo.overview.outstanding')
    expect(source).toContain('demo.overview.collectionRate')
  })

  it('shows all audited system modules only in the homepage hero workbench', () => {
    expect(systemModuleGroups.flatMap(group => group.items.map(item => item.label))).toEqual([
      '运营总览', '数据地图', '设备管理', '租赁', '招商管理', '人事', '财务', '门禁管理', '维护管理',
    ])
    expect(source).toContain('showAllModules: Boolean')
    expect(source).toContain('props.showAllModules ? systemModuleGroups : verifiedNavigation')
    expect(homepageSource.match(/<HomeDashboardOverview[^>]*\bshow-all-modules\b[^>]*>/g)).toHaveLength(1)
    expect(source).not.toMatch(/待租厂房|房态矩阵|员工移动工作台|设备巡检/)
  })

  it('floats only the homepage hero workbench with motion and performance fallbacks', () => {
    expect(source).toContain('floating: Boolean')
    expect(source).toContain("'kw-dashboard-source--floating': props.floating")
    expect(source).toContain('v-if="!props.floating" class="kw-dashboard__progress"')
    expect(homepageSource.match(/<HomeDashboardOverview[^>]*\bfloating\b[^>]*>/g)).toHaveLength(1)
    expect(motionSource).toContain('@keyframes kw-dashboard-float')
    expect(motionSource).toContain('@keyframes kw-dashboard-shadow-float')
    expect(motionSource).toMatch(/\.kw-dashboard-source--floating > \.kw-dashboard \{[\s\S]*?animation: none;[\s\S]*?transform: none;[\s\S]*?will-change: auto;/)
    expect(motionSource).not.toContain(".kw-home-hero[data-motion-active='true'] .kw-dashboard-source--floating > .kw-dashboard")
    expect(motionSource).toContain(".kw-home-hero[data-motion-active='true'] .kw-dashboard-source--floating::before")
    expect(motionSource).toMatch(/\.kw-dashboard-source--floating::before,[\s\S]*?\.kw-dashboard-source--floating::after/)
    expect(motionSource).toContain("html[data-document-visibility='hidden'] .kw-dashboard-source--floating")
    expect(motionSource).toContain("html[data-motion='off'] .kw-dashboard-source--floating")
    expect(motionSource).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.kw-dashboard-source--floating/)
    expect(motionSource).toMatch(/@media \(update: slow\)[\s\S]*\.kw-dashboard-source--floating/)
  })
})
