import { getDatabase } from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  try {
    const db = getDatabase(useRuntimeConfig(event))
    await db.raw('SELECT 1').timeout(5000, { cancel: false })
    return { ok: true, ready: true }
  } catch {
    setResponseStatus(event, 503)
    return { ok: false, ready: false }
  }
})
