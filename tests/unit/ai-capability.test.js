import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getCapability } from '../../app/data/product-capabilities.js'

const productSource = readFileSync(new URL('../../app/pages/products.vue', import.meta.url), 'utf8')

describe('AI capability status layering', () => {
  it('separates configured AI leasing matching from planned AI directions', () => {
    const ai = getCapability('ai')
    expect(ai.status).toBe('config')
    expect(ai.features.find(item => item.name === 'AI招商匹配')?.status).toBe('config')
    expect(ai.features.filter(item => item.status === 'planned').map(item => item.name)).toEqual([
      'AI催缴内容', 'OCR水电表识别', 'OCR票据识别', 'AI异常告警', 'AI租金分析', 'AI经营助手', 'AI经营问答', 'AI票据检查',
    ])
  })

  it('does not fabricate an audited interactive AI system panel', () => {
    expect(getCapability('ai').screenshots).toEqual([])
    expect(productSource).toContain('本区只展示能力名称、协同关系和状态')
    expect(productSource).not.toMatch(/AI 匹配结果|智能评分|执行记录|自动推荐结果/)
  })
})
