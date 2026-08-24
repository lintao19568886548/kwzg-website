import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  businessFlows,
  capabilityArchitecture,
  capabilityFeatureIndex,
  deliveryModes,
  homeCapabilityDomains,
  megaMenuGroups,
  parkTypeSolutions,
  productCapabilities,
  roleSolutions,
  systemMenuAudit,
  systemShowcaseModules,
} from '../../app/data/product-capabilities.js'

const readSource = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const homeSource = readSource('../../app/components/home/HomeStageOne.vue')
const productsSource = readSource('../../app/pages/products.vue')
const solutionsSource = readSource('../../app/pages/solutions.vue')
const headerSource = readSource('../../app/components/SiteHeader.vue')
const matrixSource = readSource('../../docs/website-full-capability-source-matrix.md')
const screenMatrixSource = readSource('../../docs/homepage-capability-screen-source-matrix.md')
const showcaseSource = readSource('../../app/components/home/HomeSystemModuleShowcase.vue')
const motionSource = readSource('../../app/assets/css/motion.css')

describe('homepage complete capability system', () => {
  it('applies the product owner confirmation to all 206 capabilities', () => {
    expect(productCapabilities).toHaveLength(12)
    expect(capabilityFeatureIndex).toHaveLength(206)
    expect(capabilityFeatureIndex.every(item => item.availability === 'available')).toBe(true)
    expect(capabilityFeatureIndex.every(item => item.productOwnerConfirmed === true)).toBe(true)
    expect(capabilityFeatureIndex.every(item => deliveryModes[item.deliveryMode])).toBe(true)
    expect(capabilityFeatureIndex.filter(item => item.deliveryMode === 'planned')).toHaveLength(0)
    expect(capabilityFeatureIndex.filter(item => !item.sourceReference)).toHaveLength(0)
    expect(matrixSource).toContain('PRODUCT_OWNER_CONFIRMED=YES')
    expect(matrixSource).toContain('PUBLIC_AVAILABILITY=AVAILABLE')
  })

  it('provides seven domains, three architecture layers, three loops and six role views', () => {
    expect(homeCapabilityDomains).toHaveLength(7)
    expect(capabilityArchitecture).toHaveLength(3)
    expect(businessFlows).toHaveLength(3)
    expect(roleSolutions).toHaveLength(6)
    expect(roleSolutions.map(item => item.name)).toEqual(['园区老板 / 股东', '园区经理', '招商人员', '财务人员', '物业与工程人员', '人事与行政人员'])
    expect(homeSource).toContain('<HomeCapabilityArchitecture />')
    expect(homeSource).toContain('<HomeBusinessLoops />')
    expect(homeSource).toContain('<HomeCapabilityPanorama')
    expect(homeSource).toContain('<HomeCapabilityDrawer')
    expect(motionSource).toContain("html[data-motion='off'],")
  })

  it('maps every top-level module to a verified Vue/CSS demo interface', () => {
    expect(systemMenuAudit.map(item => item.module)).toEqual(['运营总览', '数据地图', '设备管理', '租赁', '招商管理', '人事', '财务', '门禁管理', '维护管理'])
    expect(systemMenuAudit.flatMap(item => item.items)).toHaveLength(32)
    expect(systemShowcaseModules).toHaveLength(9)

    const reconstructedModules = systemShowcaseModules.filter(module => module.evidenceLevel === 'reconstructed')
    expect(reconstructedModules).toHaveLength(9)

    for (const module of reconstructedModules) {
      expect(screenMatrixSource).toContain(module.name)
      expect(module.sourcePage).toBeTruthy()
      expect(module.image).toBeUndefined()
    }

    expect(reconstructedModules.map(module => module.name)).toEqual(['运营总览', '数据地图', '设备管理', '租赁', '招商管理', '人事', '财务', '门禁管理', '维护管理'])
    expect(showcaseSource).toContain('<SystemShowcasePreview')
    expect(showcaseSource).toContain('<SystemShowcaseModal')
    expect(showcaseSource).not.toContain('<SystemScreenshotFrame')
    expect(showcaseSource).not.toContain('<SystemMenuEvidence')
  })

  it('removes the old six-feature homepage and public four-state wording', () => {
    expect(homeSource).not.toMatch(/VerifiedCapabilityGrid|VerifiedBusinessFlow|CapabilityLandscape|CapabilityFlowMap|RoleSolutionExplorer/)
    expect(existsSync(new URL('../../app/components/VerifiedCapabilityGrid.vue', import.meta.url))).toBe(false)
    expect(existsSync(new URL('../../app/components/VerifiedBusinessFlow.vue', import.meta.url))).toBe(false)
    for (const source of [homeSource, productsSource, solutionsSource, headerSource]) {
      expect(source).not.toMatch(/六项已核实|六项能力|仅展示六项|规划中|未核实|证据不足|暂不公开/)
    }
    expect(homeSource).toContain('从靠人盯，变成系统协同')
    expect(homeSource).toContain('让招商、合同、收费、物业、设备、人事与经营决策')
    expect(homeSource).not.toMatch(/保证出租率|保证没有空置|保证没有欠费|100%/)
  })

  it('keeps products, solutions and navigation on the same capability source', () => {
    expect(productsSource).toContain('productCapabilities')
    expect(productsSource).toContain('deliveryModes')
    expect(solutionsSource).toContain('parkTypeSolutions')
    expect(headerSource).toContain('megaMenuGroups')
    expect(megaMenuGroups).toHaveLength(6)
    expect(parkTypeSolutions).toHaveLength(7)
  })

  it('exposes all AI and hardware capabilities without inventing performance claims', () => {
    const ai = productCapabilities.find(item => item.id === 'ai')
    const hardware = productCapabilities.find(item => item.id === 'hardware')
    expect(ai.features).toHaveLength(9)
    expect(ai.features.every(item => item.availability === 'available')).toBe(true)
    expect(hardware.features.every(item => item.deliveryMode === 'integration')).toBe(true)
    expect(homeSource).not.toMatch(/实时预测|智能评分|自动成交|保证回款/)
  })
})
