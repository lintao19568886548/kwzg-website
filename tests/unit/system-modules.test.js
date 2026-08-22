import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { systemModules } from '../../app/config/system-modules.js'

const homeSource = readFileSync(new URL('../../app/components/home/HomeStageOne.vue', import.meta.url), 'utf8')
const productSource = readFileSync(new URL('../../app/pages/products.vue', import.meta.url), 'utf8')

describe('verified public capability coverage', () => {
  it('keeps the real menu inventory internal while publishing only six verified capabilities', () => {
    expect(systemModules.map(module => module.label)).toEqual([
      '运营总览',
      '数据地图',
      '设备管理',
      '租赁',
      '招商管理',
      '人事',
      '财务',
      '门禁管理',
      '维护管理',
    ])
    expect(homeSource).toContain('verifiedCapabilities.map')
    expect(homeSource).toContain('六项已核实能力')
    expect(productSource).toContain('verifiedCapabilities.map')
    expect(productSource).toContain('六项已上线能力')
    expect(productSource).not.toContain('9 个真实系统模块')
  })

  it('keeps menu-only modules out of fabricated interface previews', () => {
    const menuOnlyModules = systemModules.filter(module => !module.pageVerified)

    expect(menuOnlyModules.map(module => module.label)).toEqual(['数据地图', '设备管理', '人事', '门禁管理'])
    expect(menuOnlyModules.every(module => module.summary.includes('真实系统菜单已确认'))).toBe(true)
    expect(homeSource).not.toContain('v-for="module in systemModules"')
    expect(productSource).not.toContain('v-for="(module, index) in systemModules"')
    expect(productSource).toContain('其他菜单即使真实存在')
  })

  it('adds the verified operating overview to the interface sequence', () => {
    expect(homeSource).toContain("type: 'overview', title: '园区经营总览'")
    expect(homeSource).toContain("v-if=\"item.type === 'overview'\"")
  })
})
