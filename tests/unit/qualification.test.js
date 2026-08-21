import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { siteConfig } from '~/config/site'

const root = resolve('.')
const rawImage = resolve(root, 'assets/raw/certifications/tech-sme-2026-original.jpg')
const coverImage = resolve(root, 'public/assets/certifications/tech-sme-2026-cover.webp')
const detailImage = resolve(root, 'public/assets/certifications/tech-sme-2026-detail.webp')

describe('qualification content and assets', () => {
  it('keeps the five verified facts in one site configuration source', () => {
    expect(siteConfig.qualification).toMatchObject({
      name: '科技型中小企业',
      company: '东莞市宜租网络科技有限公司',
      registrationNumber: '2026441901A0001155',
      authority: '广东省科学技术厅',
      registrationDate: '2026年8月11日',
      coverImage: '/assets/certifications/tech-sme-2026-cover.webp',
      detailImage: '/assets/certifications/tech-sme-2026-detail.webp',
    })
  })

  it('archives the source and exports only the two intended WebP files', async () => {
    const [raw, cover, detail, publicFiles] = await Promise.all([
      sharp(rawImage).metadata(),
      sharp(coverImage).metadata(),
      sharp(detailImage).metadata(),
      readdir(resolve(root, 'public/assets/certifications')),
    ])

    expect(raw).toMatchObject({ format: 'jpeg', width: 4000, height: 2992 })
    expect(cover).toMatchObject({ format: 'webp', width: 1500, height: 1000 })
    expect(detail).toMatchObject({ format: 'webp', width: 1800, height: 1890 })
    expect(publicFiles.sort()).toEqual(['tech-sme-2026-cover.webp', 'tech-sme-2026-detail.webp'])

    for (const metadata of [cover, detail]) {
      expect(metadata.exif).toBeUndefined()
      expect(metadata.gps).toBeUndefined()
      expect(metadata.icc).toBeUndefined()
      expect(metadata.iptc).toBeUndefined()
      expect(metadata.xmp).toBeUndefined()
    }
  })

  it('uses the shared component on home and about without public raw or remote references', async () => {
    const [home, about, section, config] = await Promise.all([
      readFile(resolve(root, 'app/components/home/HomeStageOne.vue'), 'utf8'),
      readFile(resolve(root, 'app/pages/about.vue'), 'utf8'),
      readFile(resolve(root, 'app/components/QualificationSection.vue'), 'utf8'),
      readFile(resolve(root, 'app/config/site.js'), 'utf8'),
    ])
    const publicSource = `${home}\n${about}\n${section}\n${config}`

    expect(home).toContain('<QualificationSection mode="compact" />')
    expect(about).toContain('<QualificationSection mode="detail" />')
    expect(publicSource).not.toMatch(/assets\/raw|tech-sme-2026-original\.jpg/)
    expect(publicSource).not.toMatch(/https?:\/\/[^'"\s]+\.(?:jpe?g|png|webp)/i)
  })

  it('contains no misleading qualification claims in public application source', async () => {
    const files = [
      'app/components/QualificationSection.vue',
      'app/components/CredentialLightbox.vue',
      'app/config/site.js',
      'app/pages/about.vue',
      'app/components/home/HomeStageOne.vue',
    ]
    const source = (await Promise.all(files.map(file => readFile(resolve(root, file), 'utf8')))).join('\n')
    const forbidden = [
      '高新技术企业',
      '国家级科技型中小企业',
      '政府推荐',
      '官方指定',
      '官方认证产品',
      '行业第一',
      '领先品牌',
      '广东省科学技术厅认证瞰维智管',
      '广东省科学技术厅推荐',
    ]
    for (const phrase of forbidden) expect(source).not.toContain(phrase)
  })
})
