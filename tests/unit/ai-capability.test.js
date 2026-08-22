import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readSource = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const homeSource = readSource('../../app/components/home/HomeStageOne.vue')
const productSource = readSource('../../app/pages/products.vue')

describe('AI leasing capability status', () => {
  it('shows AI leasing matching only as a planning capability', () => {
    for (const source of [homeSource, productSource]) {
      expect(source).toContain('AI招商匹配 · 规划中')
      expect(source).toContain('规划中')
      expect(source).not.toContain('<UiBaseTag>现有能力</UiBaseTag>')
    }
  })

  it('does not fabricate an audited interactive AI system panel', () => {
    expect(productSource).toContain('不放模拟系统截图')
    expect(productSource).not.toMatch(/AI 匹配结果|智能评分|执行记录|自动推荐结果/)
  })
})
