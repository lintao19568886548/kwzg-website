import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const loginSource = readFileSync(new URL('../../app/pages/admin/login.vue', import.meta.url), 'utf8')

describe('administrator login form', () => {
  it('reads browser-autofilled credentials from the submitted native form', () => {
    expect(loginSource).toContain('name="username"')
    expect(loginSource).toContain('name="password"')
    expect(loginSource).toContain('const submitted = new FormData(event.currentTarget)')
    expect(loginSource).toContain('body: credentials')
  })

  it('clears stale validation feedback when credentials are edited', () => {
    expect(loginSource).toContain('function clearFeedback()')
    expect(loginSource.match(/@input="clearFeedback"/g)).toHaveLength(2)
  })
})
