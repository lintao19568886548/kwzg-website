import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { serviceFaqs } from '../../app/data/verified-capabilities.js'
import { productCapabilities } from '../../app/data/product-capabilities.js'

const readSource = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const homeSource = readSource('../../app/components/home/HomeStageOne.vue')
const productSource = readSource('../../app/pages/products.vue')
const solutionSource = readSource('../../app/pages/solutions.vue')
const serviceSource = readSource('../../app/pages/service.vue')
const demoSource = readSource('../../app/pages/demo.vue')
const headerSource = readSource('../../app/components/SiteHeader.vue')
const nuxtSource = readSource('../../nuxt.config.js')

describe('website content integration', () => {
  it('publishes a complete shared capability landscape with status boundaries', () => {
    expect(productCapabilities).toHaveLength(12)
    expect(homeSource).toContain('productCapabilities')
    expect(productSource).toContain('productCapabilities')
    expect(solutionSource).toContain('getCapability')
    expect(headerSource).toContain('megaMenuGroups')
  })

  it('keeps the implementation journey and FAQ route', () => {
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

  it('organizes home and solutions around landscape, flow and roles', () => {
    expect(homeSource).toContain('<ParkManagementCheck')
    expect(homeSource).toContain('<CapabilityFlowMap />')
    expect(homeSource).toContain('<CapabilityLandscape compact />')
    expect(homeSource).toContain('<RoleSolutionExplorer />')
    expect(homeSource).toContain('to="/service#faq"')
    expect(solutionSource).toContain('按园区类型')
    expect(solutionSource).toContain('按岗位角色')
  })

  it('keeps the existing local demo API and explains the next steps', () => {
    expect(demoSource).toContain("$fetch('/api/demo-requests'")
    expect(demoSource).toContain('提交后会发生什么')
    expect(demoSource).toContain('不会自动发送企业微信、短信或邮件')
    expect(demoSource).toContain('不会自动写入 yizuw.cn')
  })
})
