import { describe, expect, it } from 'vitest'
import { escapeCsvCell, leadsToCsv, normalizeRemark, parseLeadQuery } from '../../server/utils/leads.js'

describe('lead filters and safe output', () => {
  it('accepts only whitelisted paging and sorting', () => {
    expect(parseLeadQuery({ page: '2', pageSize: '50', sort: 'createdAt', order: 'desc' })).toMatchObject({ page: 2, pageSize: 50, sortColumn: 'created_at' })
    expect(() => parseLeadQuery({ pageSize: '500' })).toThrow()
    expect(() => parseLeadQuery({ sort: 'created_at desc; DROP TABLE leads' })).toThrow()
    expect(() => parseLeadQuery({ status: '已删除' })).toThrow()
    expect(() => parseLeadQuery({ dateFrom: '2026-09-01', dateTo: '2026-08-01' })).toThrow()
  })

  it('allows plain text and rejects HTML or control characters', () => {
    expect(normalizeRemark('  已电话沟通\r\n待确认时间  ')).toBe('已电话沟通\n待确认时间')
    expect(() => normalizeRemark('<script>alert(1)</script>')).toThrow()
    expect(() => normalizeRemark(`ok${String.fromCharCode(0)}bad`)).toThrow()
    expect(() => normalizeRemark('a'.repeat(1001))).toThrow()
  })

  it.each(['=1+1', '+SUM(A1)', '-1+2', '@cmd', '\tformula', '\rformula', '\nformula'])('neutralizes CSV formula cell %s', (value) => {
    expect(escapeCsvCell(value)).toBe(`"'${value.replaceAll('"', '""')}"`)
  })

  it('produces UTF-8 BOM CSV with Chinese content and escaping', () => {
    const csv = leadsToCsv([{ name: '演示联系人', phone: '+8613800000000', park_count: 2, status: '待跟进', remark: '含,逗号和"引号"', privacy_consent_at: '2026-08-21', created_at: '2026-08-21', updated_at: '2026-08-21' }])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('演示联系人')
    expect(csv).toContain('"含,逗号和""引号"""')
  })
})
