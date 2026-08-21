import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../../app/components/home/DashboardOverview.vue', import.meta.url), 'utf8')

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
})
