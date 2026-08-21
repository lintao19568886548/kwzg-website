import { afterEach, describe, expect, it, vi } from 'vitest'
import { assertSafeDatabaseUrl, normalizeDatabaseError } from '../../server/utils/database.js'
import { getClientAddress, keyedDigest, maskPhone, safeEqual } from '../../server/utils/security.js'

afterEach(() => vi.unstubAllGlobals())

describe('security helpers', () => {
  it('creates stable keyed digests without retaining source values', () => {
    const secret = 's'.repeat(32)
    const digest = keyedDigest(secret, 'test', '13800000000|127.0.0.1')
    expect(digest).toHaveLength(64)
    expect(digest).not.toContain('13800000000')
    expect(digest).toBe(keyedDigest(secret, 'test', '13800000000|127.0.0.1'))
  })

  it('uses timing-safe comparison and masks list phones', () => {
    expect(safeEqual('same', 'same')).toBe(true)
    expect(safeEqual('same', 'different')).toBe(false)
    expect(maskPhone('+8613800000000')).toBe('+86138****0000')
  })

  it('rejects root and non-MySQL database URLs', () => {
    const databaseUrl = (username) => {
      const url = new URL('mysql://db:3306/site')
      url.username = username
      url.password = 'fixture-password'
      return url.toString()
    }
    expect(assertSafeDatabaseUrl(databaseUrl('kwzg_app')).username).toBe('kwzg_app')
    expect(() => assertSafeDatabaseUrl(databaseUrl('root'))).toThrow()
    expect(() => assertSafeDatabaseUrl('postgres://app:secret@db/site')).toThrow()
  })

  it('maps only known database connectivity failures to a stable 503 error', () => {
    expect(normalizeDatabaseError(Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' }))).toMatchObject({
      statusCode: 503,
      code: 'DATABASE_UNAVAILABLE',
    })
    expect(normalizeDatabaseError(Object.assign(new Error('table missing'), { code: 'ER_NO_SUCH_TABLE' }))).toMatchObject({
      statusCode: 503,
      code: 'DATABASE_MIGRATION_REQUIRED',
    })
    const unrelated = new Error('unrelated application error')
    expect(normalizeDatabaseError(unrelated)).toBe(unrelated)
  })

  it('ignores forwarded addresses unless the direct proxy address is explicitly trusted', () => {
    vi.stubGlobal('getRequestIP', vi.fn((event, options) => options?.xForwardedFor ? event.forwarded : event.direct))
    const event = { direct: '172.20.0.10', forwarded: '203.0.113.15' }
    expect(getClientAddress(event)).toBe('172.20.0.10')
    expect(getClientAddress(event, '172.20.0.11')).toBe('172.20.0.10')
    expect(getClientAddress(event, '172.20.0.10')).toBe('203.0.113.15')
  })
})
