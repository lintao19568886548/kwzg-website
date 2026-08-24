import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getCapability } from '../../app/data/product-capabilities.js'

const productSource = readFileSync(new URL('../../app/pages/products.vue', import.meta.url), 'utf8')
const homeAiSource = readFileSync(new URL('../../app/components/home/HomeAiCapabilities.vue', import.meta.url), 'utf8')

describe('AI complete capability model', () => {
  it('marks every AI direction available and keeps delivery explicit', () => {
    const ai = getCapability('ai')
    expect(ai.availability).toBe('available')
    expect(ai.deliveryMode).toBe('configuration')
    expect(ai.features.every(item => item.availability === 'available')).toBe(true)
    expect(ai.features.map(item => item.name)).toEqual([
      'AI招商匹配',
      'AI催缴内容', 'OCR水电表识别', 'OCR票据识别', 'AI异常告警', 'AI租金分析', 'AI经营助手', 'AI经营问答', 'AI票据检查',
    ])
    expect(ai.features.every(item => item.description.length >= 30)).toBe(true)
    expect(new Set(ai.features.map(item => item.description)).size).toBe(ai.features.length)
    expect(homeAiSource).toContain('{{ item.description }}')
    expect(homeAiSource).not.toContain('减少重复处理，提高检索与异常发现效率，并保留人工复核。')
  })

  it('does not fabricate an audited interactive AI system panel', () => {
    expect(getCapability('ai').screenshots).toEqual([])
    expect(productSource).toContain('本区只展示能力名称、协同关系和交付方式')
    expect(productSource).not.toMatch(/AI 匹配结果|智能评分|执行记录|自动推荐结果/)
  })
})
