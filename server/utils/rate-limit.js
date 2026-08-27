import { createKwError } from './business-error.js'

export async function consumeRateLimit(db, options) {
  const now = options.now || new Date()
  const expiresAt = new Date(now.getTime() + options.windowMs)

  return db.transaction(async (trx) => {
    let bucket = await trx('rate_limits').where({ bucket_key: options.bucketKey }).forUpdate().first()

    if (!bucket) {
      try {
        await trx('rate_limits').insert({
          bucket_key: options.bucketKey,
          action: options.action,
          window_start: now,
          hits: 1,
          expires_at: expiresAt,
        })
        return { allowed: true, remaining: options.maxHits - 1 }
      } catch (error) {
        if (error?.code !== 'ER_DUP_ENTRY') {
          throw error
        }
        bucket = await trx('rate_limits').where({ bucket_key: options.bucketKey }).forUpdate().first()
      }
    }

    if (new Date(bucket.expires_at).getTime() <= now.getTime()) {
      await trx('rate_limits').where({ bucket_key: options.bucketKey }).update({
        action: options.action,
        window_start: now,
        hits: 1,
        expires_at: expiresAt,
      })
      return { allowed: true, remaining: options.maxHits - 1 }
    }

    if (bucket.hits >= options.maxHits) {
      return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((new Date(bucket.expires_at).getTime() - now.getTime()) / 1000)) }
    }

    await trx('rate_limits').where({ bucket_key: options.bucketKey }).increment('hits', 1)
    return { allowed: true, remaining: options.maxHits - bucket.hits - 1 }
  })
}

export async function cleanupExpiredRateLimits(db, now = new Date(), limit = 1000) {
  return db('rate_limits')
    .where('expires_at', '<=', now)
    .limit(limit)
    .delete()
}

export async function enforceRateLimit(db, options) {
  const result = await consumeRateLimit(db, options)
  if (!result.allowed) {
    throw createKwError(429, 'RATE_LIMITED', '操作过于频繁，请稍后再试。')
  }
  return result
}
