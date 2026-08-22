import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  capabilityFeatureIndex,
  capabilityStatuses,
  megaMenuGroups,
  parkTypeSolutions,
  productCapabilities,
  roleSolutions,
  systemMenuAudit,
} from '../../app/data/product-capabilities.js'

const readSource = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const homeSource = readSource('../../app/components/home/HomeStageOne.vue')
const productsSource = readSource('../../app/pages/products.vue')
const solutionsSource = readSource('../../app/pages/solutions.vue')
const headerSource = readSource('../../app/components/SiteHeader.vue')
const statusSource = readSource('../../app/components/CapabilityStatusTag.vue')
const matrixSource = readSource('../../docs/website-full-capability-source-matrix.md')

describe('full capability source and public status layers', () => {
  it('maps every requested business area and every feature to one public status', () => {
    expect(productCapabilities).toHaveLength(12)
    expect(capabilityFeatureIndex).toHaveLength(206)
    expect(new Set(capabilityFeatureIndex.map(item => item.name)).size).toBeGreaterThan(100)
    expect(capabilityFeatureIndex.every(item => capabilityStatuses[item.status])).toBe(true)
    expect(capabilityFeatureIndex.filter(item => !item.sourceReference)).toHaveLength(0)
    expect(productCapabilities.map(item => item.productSection)).toEqual([
      '经营驾驶舱与数据地图', '资产、房源与租赁', '招商与客户管理', '合同管理', '账单、财务与回款', '物业、报修与维护', '设备、巡检与能耗', '人事、考勤与审批', '门禁和通行', 'AI智能增强', '权限、安全与部署', '软硬件接入',
    ])
  })

  it('keeps all nine real system modules and 32 discovered menu entries', () => {
    expect(systemMenuAudit.map(item => item.module)).toEqual(['运营总览', '数据地图', '设备管理', '租赁', '招商管理', '人事', '财务', '门禁管理', '维护管理'])
    expect(systemMenuAudit.flatMap(item => item.items)).toHaveLength(32)
    for (const name of systemMenuAudit.map(item => item.module)) {
      expect(matrixSource).toContain(name)
    }
  })

  it('drives home, products, solutions and the mega menu from the shared source', () => {
    expect(homeSource).toContain('productCapabilities')
    expect(homeSource).toContain('<CapabilityLandscape compact />')
    expect(homeSource).toContain('<CapabilityFlowMap />')
    expect(homeSource).toContain('<RoleSolutionExplorer />')
    expect(productsSource).toContain('v-for="(capability, index) in productCapabilities"')
    expect(solutionsSource).toContain('parkTypeSolutions')
    expect(headerSource).toContain('megaMenuGroups')
    expect(megaMenuGroups).toHaveLength(6)
    expect(parkTypeSolutions).toHaveLength(7)
    expect(roleSolutions).toHaveLength(5)
  })

  it('uses accessible text status labels and does not fabricate planning interfaces', () => {
    expect(Object.values(capabilityStatuses).map(item => item.label)).toEqual(['已上线', '按项目配置', '评估接入', '规划中'])
    expect(statusSource).toContain(':aria-expanded="open"')
    expect(statusSource).toContain('role="tooltip"')
    expect(productsSource).toContain('能力关系示意')
    expect(productsSource).toContain('不制作成看似真实的后台页面')
    expect(productsSource).not.toMatch(/AI 匹配结果|智能评分|虚构趋势图/)
  })

  it('removes the obsolete public six-feature ceiling and keeps strong non-guaranteed value copy', () => {
    for (const source of [homeSource, productsSource, solutionsSource]) {
      expect(source).not.toMatch(/六项已上线|六项公开能力|只能展示六项|只对应六项/)
    }
    expect(homeSource).toContain('让园区经营')
    expect(homeSource).toContain('从靠人盯，变成系统协同')
    expect(homeSource).toContain('帮助园区提高出租率、减少空置、加快回款')
    expect(homeSource).not.toMatch(/保证出租率|保证没有空置|保证没有欠费|100%/)
  })

  it('layers AI and hardware individually', () => {
    const ai = productCapabilities.find(item => item.id === 'ai')
    const hardware = productCapabilities.find(item => item.id === 'hardware')
    expect(ai.features).toHaveLength(9)
    expect(ai.features.find(item => item.name === 'AI招商匹配')?.status).toBe('config')
    expect(ai.features.filter(item => item.status === 'planned')).toHaveLength(8)
    expect(hardware.features.every(item => item.status === 'integration')).toBe(true)
  })
})
