import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { serviceFaqs, verifiedCapabilities } from '../../app/data/verified-capabilities.js'

const readSource = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const homeSource = readSource('../../app/components/home/HomeStageOne.vue')
const productSource = readSource('../../app/pages/products.vue')
const solutionSource = readSource('../../app/pages/solutions.vue')
const serviceSource = readSource('../../app/pages/service.vue')
const demoSource = readSource('../../app/pages/demo.vue')
const headerSource = readSource('../../app/components/SiteHeader.vue')
const nuxtSource = readSource('../../nuxt.config.js')

describe('verified website content integration', () => {
  it('publishes exactly the six traced capabilities', () => {
    expect(verifiedCapabilities.map(item => item.title)).toEqual([
      '园区经营总览',
      '招商客户',
      '客户详情',
      '合同管理',
      '账单管理',
      '报修工单',
    ])
    expect(homeSource).toContain('verifiedCapabilities.map')
    expect(productSource).toContain('verifiedCapabilities.map')
  })

  it('adds the implementation journey and FAQ route', () => {
    expect(headerSource).toContain("{ label: '实施服务', to: '/service' }")
    expect(nuxtSource).toContain("'/service'")
    expect(serviceSource).toContain('id="faq"')
    expect(serviceFaqs).toHaveLength(10)
    expect(serviceSource).toContain('<ImplementationReadiness />')
    expect(serviceSource).toContain('<ImplementationTimeline />')
    expect(serviceSource).toContain('<DeploymentBoundary />')
    expect(serviceSource).toContain('<ServiceScope />')
    expect(serviceSource).toContain('<ServiceFaqAccordion />')
  })

  it('organizes the home and solution pages around the approved journey', () => {
    expect(homeSource).toContain('<ParkManagementCheck')
    expect(homeSource).toContain('<VerifiedBusinessFlow />')
    expect(homeSource).toContain('<VerifiedCapabilityGrid compact />')
    expect(homeSource).toContain('<BeforeAfterComparison />')
    expect(homeSource).toContain('to="/service#faq"')
    expect(solutionSource).toContain('三类资产场景')
    expect(solutionSource).toContain('四类岗位视角')
  })

  it('keeps the existing local demo API and explains the next steps', () => {
    expect(demoSource).toContain("$fetch('/api/demo-requests'")
    expect(demoSource).toContain('提交后会发生什么')
    expect(demoSource).toContain('不会自动发送企业微信、短信或邮件')
    expect(demoSource).toContain('不会自动写入 yizuw.cn')
  })
})
