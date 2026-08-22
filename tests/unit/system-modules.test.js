import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { systemModules } from '../../app/config/system-modules.js'
import { productCapabilities, systemMenuAudit } from '../../app/data/product-capabilities.js'

const homeSource = readFileSync(new URL('../../app/components/home/HomeStageOne.vue', import.meta.url), 'utf8')
const productSource = readFileSync(new URL('../../app/pages/products.vue', import.meta.url), 'utf8')

describe('full public capability coverage', () => {
  it('includes every real top-level module in the complete landscape', () => {
    expect(systemModules.map(module => module.label)).toEqual(['运营总览', '数据地图', '设备管理', '租赁', '招商管理', '人事', '财务', '门禁管理', '维护管理'])
    expect(systemMenuAudit).toHaveLength(9)
    expect(systemMenuAudit.flatMap(item => item.items)).toHaveLength(32)
    expect(productCapabilities).toHaveLength(12)
    expect(homeSource).toContain('完整能力矩阵')
    expect(productSource).toContain('十二个能力板块')
  })

  it('keeps menu-only and planned modules out of fabricated system previews', () => {
    const interfaceGroups = productCapabilities.filter(item => item.interfaceType)
    expect(interfaceGroups.map(item => item.id)).toEqual(['operations', 'leasing-crm', 'contracts', 'billing', 'maintenance'])
    expect(productSource).toContain('能力关系示意')
    expect(productSource).toContain('不制作成看似真实的后台页面')
    expect(productSource).not.toContain('房态矩阵')
  })

  it('retains the verified operating overview and interface component', () => {
    expect(homeSource).toContain('<HomeDashboardOverview v-reveal:right floating />')
    expect(productSource).toContain("capability.interfaceType === 'overview'")
  })
})
