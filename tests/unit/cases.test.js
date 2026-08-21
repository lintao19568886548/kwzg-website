import { describe, expect, it } from 'vitest'
import { caseRegions, caseStudies, getCaseStudy, verifiedCaseFunctions } from '../../app/data/cases.js'

const expectedSlugs = ['tongfu', 'foshan-lecong', 'shenzhen-kengzi', 'xintang-xizhou', 'gaobu-tongxing']
const requiredKeys = ['slug', 'name', 'region', 'title', 'summary', 'coverImage', 'gallery', 'overview', 'managementScenes', 'relatedFunctions', 'valueDirections', 'seoTitle', 'seoDescription']

describe('customer case source', () => {
  it('publishes exactly the five approved cases with unique slugs', () => {
    expect(caseStudies.map(item => item.slug)).toEqual(expectedSlugs)
    expect(new Set(caseStudies.map(item => item.slug)).size).toBe(5)
    expect(caseRegions).toEqual(['全部案例', '东莞', '佛山', '深圳', '广州'])
  })

  it('keeps every case complete, differentiated and within the requested text length', () => {
    for (const item of caseStudies) {
      expect(Object.keys(item)).toEqual(expect.arrayContaining(requiredKeys))
      const body = [...item.overview, ...item.managementScenes.map(scene => scene.body), ...item.valueDirections].join('')
      expect(body.length).toBeGreaterThanOrEqual(350)
      expect(body.length).toBeLessThanOrEqual(600)
      expect(item.title).not.toBe(item.name)
      expect(item.managementScenes).toHaveLength(3)
      expect(item.seoTitle).toContain(item.name)
    }
  })

  it('uses only local WebP derivatives and the verified feature allowlist', () => {
    for (const item of caseStudies) {
      expect(item.coverImage).toMatch(/^\/assets\/cases\/[a-z0-9-]+\.webp$/)
      expect(item.gallery.length).toBeGreaterThan(0)
      for (const image of item.gallery) {
        expect(image.src).toMatch(/^\/assets\/cases\/[a-z0-9-]+\.webp$/)
        expect(image.alt.length).toBeGreaterThan(5)
      }
      for (const feature of item.relatedFunctions) expect(verifiedCaseFunctions[feature]).toBeDefined()
    }
  })

  it('does not expose Jiujiang, customer metrics, testimonials or remote media', () => {
    const serialized = JSON.stringify(caseStudies)
    expect(serialized).not.toMatch(/佛山九江|jiujiang|https?:\/\//i)
    expect(serialized).not.toMatch(/\d+(?:\.\d+)?%|客户评价|客户证言|客户表示|负责人表示|ROI/i)
  })

  it('resolves known slugs and rejects unknown slugs', () => {
    expect(getCaseStudy('tongfu')?.name).toBe('同富园区')
    expect(getCaseStudy('not-a-case')).toBeUndefined()
  })
})
