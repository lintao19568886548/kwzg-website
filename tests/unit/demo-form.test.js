import { describe, expect, it } from 'vitest'
import { describeDemoSubmissionError } from '../../app/utils/demo-form.js'
import { siteConfig } from '../../app/config/site.js'

function apiError(statusCode, code, message = '') {
  return { statusCode, data: { error: { code, message } } }
}

describe('demo form response feedback', () => {
  it('maps correctable server validation to the related field', () => {
    expect(describeDemoSubmissionError(apiError(422, 'INVALID_PHONE', '请输入正确的大陆手机号。'), siteConfig.contact.phone)).toEqual({
      message: '请检查并修正表单内容后重新提交。',
      fieldErrors: { phone: '请输入正确的大陆手机号。' },
    })
    expect(describeDemoSubmissionError(apiError(422, 'INVALID_PARK_COUNT', '园区数量必须是 1 至 999 的整数。'), siteConfig.contact.phone).fieldErrors).toHaveProperty('parkCount')
    expect(describeDemoSubmissionError(apiError(422, 'PRIVACY_REQUIRED', '请先阅读并同意隐私政策。'), siteConfig.contact.phone).fieldErrors).toHaveProperty('privacy')
    expect(describeDemoSubmissionError(apiError(422, 'VALIDATION_ERROR', '姓名格式不正确。'), siteConfig.contact.phone).fieldErrors).toHaveProperty('name')
  })

  it('distinguishes rate limiting, database outage, network failure and unknown errors', () => {
    expect(describeDemoSubmissionError(apiError(429, 'RATE_LIMITED'), siteConfig.contact.phone).message).toBe('提交过于频繁，请稍后再试。')
    expect(describeDemoSubmissionError(apiError(503, 'DATABASE_UNAVAILABLE'), siteConfig.contact.phone).message).toBe('服务暂时不可用，请稍后再试。')
    expect(describeDemoSubmissionError(new TypeError('fetch failed'), siteConfig.contact.phone).message).toBe('网络连接失败，请检查网络后重新提交。')
    expect(describeDemoSubmissionError(apiError(500, 'INTERNAL_ERROR'), siteConfig.contact.phone).message).toBe(`提交未完成，请稍后重试或拨打${siteConfig.contact.phone}联系我们。`)
  })

  it('reports an already accepted duplicate without claiming a new notification', () => {
    expect(describeDemoSubmissionError(apiError(409, 'DUPLICATE_REQUEST'), siteConfig.contact.phone).message).toBe('该预约已经受理，请勿重复提交。')
  })
})
