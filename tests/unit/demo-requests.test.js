import { describe, expect, it } from 'vitest'
import { assertExactKeys } from '../../server/utils/request-body.js'
import { createDemoRequest, DEMO_BODY_KEYS, normalizePhone, validateDemoRequest, validateIdempotencyKey } from '../../server/utils/demo-requests.js'

const now = 1_800_000_000_000
const valid = () => ({ name: ' 张 三 ', phone: '+86 138-0000-0000', parkCount: 2, privacy: true, companyWebsite: '', startedAt: now - 5000 })

describe('demo request validation', () => {
  it('normalizes a valid submission and +86 phone', () => {
    expect(validateDemoRequest(valid(), now)).toEqual({ name: '张 三', phone: '+8613800000000', parkCount: 2 })
    expect(normalizePhone('0086 13900000000')).toBe('+8613900000000')
  })

  it.each([
    ['missing name', { name: '' }],
    ['invalid phone', { phone: '12345' }],
    ['park count too high', { parkCount: 1000 }],
    ['privacy missing', { privacy: false }],
    ['honeypot hit', { companyWebsite: 'bot.example' }],
    ['submitted too quickly', { startedAt: now - 300 }],
    ['stale form', { startedAt: now - 90_000_000 }],
  ])('rejects %s', (_, change) => {
    expect(() => validateDemoRequest({ ...valid(), ...change }, now)).toThrow()
  })

  it('rejects overlong and unexpected values', () => {
    expect(() => validateDemoRequest({ ...valid(), name: '名'.repeat(41) }, now)).toThrow()
    expect(() => assertExactKeys({ ...valid(), role: 'admin' }, DEMO_BODY_KEYS)).toThrow()
  })

  it('requires a bounded idempotency key', () => {
    expect(validateIdempotencyKey('a'.repeat(32))).toBe('a'.repeat(32))
    expect(() => validateIdempotencyKey('short')).toThrow()
    expect(() => validateIdempotencyKey(`bad:${'a'.repeat(32)}`)).toThrow()
  })

  it.each([0, -1, 1.5, 1000, 'not-a-number'])('rejects invalid park count %s', (parkCount) => {
    expect(() => validateDemoRequest({ ...valid(), parkCount }, now)).toThrow()
  })

  it('never reports success when the database rejects the operation', async () => {
    const unavailableDatabase = Object.assign(
      () => ({ select() { return this }, where() { return this }, first: async () => null }),
      { transaction: async () => { throw new Error('database unavailable') } },
    )
    await expect(createDemoRequest(unavailableDatabase, { name: '演示', phone: '+8613800000000', parkCount: 1 }, { secret: 's'.repeat(32), clientAddress: '127.0.0.1', idempotencyKey: 'database-failure-key-000000000', now: new Date() })).rejects.toThrow('database unavailable')
  })
})
