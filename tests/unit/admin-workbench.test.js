import { describe, expect, it } from 'vitest'
import { validateAdminPassword } from '../../server/utils/admin-credentials.js'
import { validateDemoSchedule } from '../../server/utils/lead-demo.js'
import { parseLeadWorkflowQuery } from '../../server/utils/lead-workflow.js'
import { shanghaiDayBounds, shanghaiMonthBounds } from '../../server/utils/shanghai-time.js'

describe('Stage 2.2 admin workbench rules', () => {
  it('uses fixed Asia/Shanghai day and month boundaries', () => {
    const now = new Date('2026-08-25T16:30:00.000Z')
    expect(shanghaiDayBounds(now)).toEqual({ start: new Date('2026-08-25T16:00:00.000Z'), end: new Date('2026-08-26T16:00:00.000Z') })
    expect(shanghaiMonthBounds(now)).toEqual({ start: new Date('2026-07-31T16:00:00.000Z'), end: new Date('2026-08-31T16:00:00.000Z') })
  })

  it('validates quick views and future demo schedules', () => {
    expect(parseLeadWorkflowQuery({ view: 'today' }).view).toBe('today')
    expect(() => parseLeadWorkflowQuery({ view: 'DROP TABLE leads' })).toThrow()
    const now = new Date('2026-08-25T04:00:00.000Z')
    expect(validateDemoSchedule({ version: 1, demoScheduledAt: '2026-08-26T04:00:00.000Z', demoMethod: 'ONLINE', note: '线上产品演示' }, now).demoMethod).toBe('ONLINE')
    expect(() => validateDemoSchedule({ version: 1, demoScheduledAt: '2026-08-24T04:00:00.000Z', demoMethod: 'ONLINE', note: '过期时间' }, now)).toThrow()
  })

  it('allows arbitrary non-empty administrator passwords', () => {
    expect(validateAdminPassword('Valid-Stage22-Password!8', 'operator')).toBe('Valid-Stage22-Password!8')
    expect(validateAdminPassword('short', 'operator')).toBe('short')
    expect(validateAdminPassword('Operator-Password-2026!', 'operator')).toBe('Operator-Password-2026!')
    expect(() => validateAdminPassword('', 'operator')).toThrow()
    expect(() => validateAdminPassword('x'.repeat(129), 'operator')).toThrow()
  })
})
