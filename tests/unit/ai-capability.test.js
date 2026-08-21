import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readSource = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const homeSource = readSource('../../app/components/home/HomeStageOne.vue')
const productSource = readSource('../../app/pages/products.vue')

describe('AI leasing capability status', () => {
  it('shows AI leasing matching as a confirmed current capability', () => {
    for (const source of [homeSource, productSource]) {
      expect(source).toContain('AI 招商匹配')
      expect(source).toContain('现有能力')
      expect(source).not.toMatch(/规划中|未来计划|尚未作为当前正式功能交付|产品规划/)
    }
  })

  it('does not fabricate an audited interactive AI system panel', () => {
    expect(productSource).toContain('不展示未经界面溯源核实的字段、按钮或匹配结果')
    expect(productSource).not.toMatch(/AI 匹配结果|智能评分|执行记录|自动推荐结果/)
  })
})
