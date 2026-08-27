import { describe, expect, it } from 'vitest'
import { parseLeadWorkflowQuery, workflowLeadsToCsv } from '../../server/utils/lead-workflow.js'
import { canTransitionLeadStatus, LEAD_STATUS_CODES, leadStatusLabel } from '../../shared/lead-statuses.js'
import { validateFollowUp } from '../../server/utils/lead-follow-ups.js'

describe('Stage 2.1 lead workflow', () => {
  it('exposes eight stable status codes and controlled transitions', () => {
    expect(LEAD_STATUS_CODES).toHaveLength(8)
    expect(leadStatusLabel('DEMO_SCHEDULED')).toBe('已预约演示')
    expect(canTransitionLeadStatus('PENDING', 'CONTACTED')).toBe(true)
    expect(canTransitionLeadStatus('WON', 'PENDING')).toBe(false)
  })

  it('validates complex filters through strict allowlists', () => {
    expect(parseLeadWorkflowQuery({ pageSize: '50', status: 'PENDING', parkCountMin: '2', overdue: 'true', sort: 'priority' })).toMatchObject({ pageSize: 50, status: 'PENDING', parkCountMin: 2, overdue: 'true' })
    expect(() => parseLeadWorkflowQuery({ pageSize: '25' })).toThrow()
    expect(() => parseLeadWorkflowQuery({ sort: 'created_at; DROP TABLE leads' })).toThrow()
    expect(() => parseLeadWorkflowQuery({ sourcePage: 'https://evil.example' })).toThrow()
  })

  it('rejects HTML follow-ups and neutralizes CSV formulas', () => {
    expect(validateFollowUp({ contactMethod: 'PHONE', content: '电话沟通完成', result: '客户确认继续了解', nextPlan: '安排线上演示', nextFollowUpAt: null, version: 1 }).content).toBe('电话沟通完成')
    expect(() => validateFollowUp({ contactMethod: 'PHONE', content: '<script>alert(1)</script>', result: '客户确认继续了解', nextPlan: '安排线上演示', nextFollowUpAt: null, version: 1 })).toThrow()
    const csv = workflowLeadsToCsv([{ name: '=cmd', phone: '13800000000', park_count: 1, status: 'PENDING', source_page: '/demo', assigned_admin_username: '', created_at: '2026-08-25' }])
    expect(csv).toContain("\"'=cmd\"")
  })
})
