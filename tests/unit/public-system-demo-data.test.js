import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { publicSystemDemoData, publicSystemModuleIds } from '../../app/data/public-system-demo-data.js'
import { systemShowcaseModules } from '../../app/data/product-capabilities.js'

const showcaseSource = readFileSync(new URL('../../app/components/home/HomeSystemModuleShowcase.vue', import.meta.url), 'utf8')
const previewSource = readFileSync(new URL('../../app/components/home/SystemShowcasePreview.vue', import.meta.url), 'utf8')
const dashboardSource = readFileSync(new URL('../../app/components/home/DashboardOverview.vue', import.meta.url), 'utf8')

function collectStrings(value, bucket = []) {
  if (typeof value === 'string') bucket.push(value)
  else if (Array.isArray(value)) value.forEach(item => collectStrings(item, bucket))
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectStrings(item, bucket))
  return bucket
}

describe('public system demo data', () => {
  it('uses one deterministic source for all nine reconstructed modules and the hero dashboard', () => {
    expect(publicSystemModuleIds).toHaveLength(9)
    expect(systemShowcaseModules.map(module => module.id)).toEqual(publicSystemModuleIds)
    expect(systemShowcaseModules.every(module => module.evidenceLevel === 'reconstructed')).toBe(true)
    expect(systemShowcaseModules.every(module => !('image' in module))).toBe(true)
    expect(showcaseSource).toContain('<SystemShowcasePreview :module="active"')
    expect(showcaseSource).toContain('<SystemShowcaseModal')
    expect(dashboardSource).toContain("publicSystemDemoData")
    expect(previewSource).toContain("publicSystemDemoData")
    expect(previewSource).not.toContain('Math.random')
  })

  it('keeps area, collection and bill formulas consistent', () => {
    const demo = publicSystemDemoData
    expect(demo.overview.leasedArea + demo.overview.vacantArea).toBe(demo.overview.rentableArea)
    expect((demo.overview.leasedArea / demo.overview.rentableArea) * 100).toBeCloseTo(demo.overview.occupancyRate, 5)
    expect(demo.overview.received + demo.overview.outstanding).toBeCloseTo(demo.overview.receivable, 5)
    expect((demo.overview.received / demo.overview.receivable) * 100).toBeCloseTo(demo.overview.collectionRate, 1)

    expect(demo.buildings.reduce((sum, item) => sum + item.rentableArea, 0)).toBe(demo.overview.rentableArea)
    expect(demo.buildings.reduce((sum, item) => sum + item.leasedArea, 0)).toBe(demo.overview.leasedArea)
    expect(demo.buildings.reduce((sum, item) => sum + item.vacantArea, 0)).toBe(demo.overview.vacantArea)

    const billTotals = demo.finance.bills.reduce((totals, bill) => ({
      receivable: totals.receivable + bill.receivable,
      received: totals.received + bill.received,
      outstanding: totals.outstanding + bill.outstanding,
    }), { receivable: 0, received: 0, outstanding: 0 })
    expect(billTotals.receivable).toBeCloseTo(demo.overview.receivable, 5)
    expect(billTotals.received).toBeCloseTo(demo.overview.received, 5)
    expect(billTotals.outstanding).toBeCloseTo(demo.overview.outstanding, 5)
    for (const bill of demo.finance.bills) expect(bill.received + bill.outstanding).toBeCloseTo(bill.receivable, 5)
  })

  it('keeps cross-module records and timelines coherent', () => {
    const demo = publicSystemDemoData
    const leased = demo.leasing.find(record => record.id === 'leased')
    const tenantBill = demo.finance.bills.find(bill => bill.contractCode === leased.contractCode)
    expect(tenantBill?.tenant).toBe(leased.tenant)
    expect(demo.access.employeeRecord.tenant).toBe(leased.tenant)
    expect(demo.access.visitorRecord.visitTarget).toBe(leased.tenant)
    expect(demo.maintenance.order.tenant).toBe(leased.tenant)
    expect(demo.maintenance.order.propertyCode).toBe(leased.propertyCode)
    expect(demo.investment.lead.signed).toBe(false)
    expect(demo.finance.bills.some(bill => bill.tenant === demo.investment.lead.projectName)).toBe(false)
    expect(Date.parse(demo.maintenance.order.submittedAt)).toBeLessThan(Date.parse(demo.maintenance.order.respondedAt))
    expect(Date.parse(demo.maintenance.order.respondedAt)).toBeLessThan(Date.parse(demo.maintenance.order.plannedCompletion))
  })

  it('contains explicit demo labels and no direct sensitive identifiers', () => {
    const strings = collectStrings(publicSystemDemoData)
    const source = strings.join('\n')
    expect(publicSystemDemoData.meta.label).toBe('真实系统界面 · 演示数据')
    expect(publicSystemDemoData.meta.footerNotice).toContain('安全演示数据')
    expect(source).not.toMatch(/(?<!\*)1[3-9]\d{9}(?!\d)/)
    expect(source).not.toMatch(/\b\d{17}[\dXx]\b/)
    expect(source).not.toMatch(/\b(?:\d[ -]?){16,19}\b/)
    expect(source).not.toMatch(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)
    expect(source).not.toMatch(/\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/)
    expect(source).not.toContain('yizuw.cn')
    expect(publicSystemDemoData.meta.watermark).toBe('DEMO · 演示数据')
    expect(showcaseSource).not.toContain('界面已经脱敏')
  })
})
