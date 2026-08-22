// api/_lib/ratelimit.js
//
// Per-endpoint rate limiting via @upstash/ratelimit, keyed by client IP.
// This is the other half (alongside code.js's entropy) of the "entropy +
// rate-limiting from day one, not added later" requirement Chris set on
// 2026-07-26 — see PERSISTENCE-AND-SYNC-DESIGN.md.
//
// Limits are deliberately per-endpoint, not one shared limiter:
//   - pull is the guessing/enumeration vector (an attacker trying random codes
//     to read someone else's data), so it gets the tightest window.
//   - push requires a code you already have, so it's more generous — it's
//     normal usage (debounced auto-sync) that should never realistically hit it.
//   - new-code is capped to stop someone farming codes to pre-populate a guess
//     list, though the code space is large enough that this is a secondary concern.
//
// These numbers are a starting point, not finalised — revisit at the pre-launch
// security review (the hard gate Chris set before this can go public).

import { Ratelimit } from '@upstash/ratelimit'
import { getRedis } from './redis.js'

let pullLimiter = null
let pushLimiter = null
let newCodeLimiter = null

export function getPullLimiter() {
  if (!pullLimiter) {
    pullLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, '10 s'),
      prefix: 'ratelimit:sync-pull',
    })
  }
  return pullLimiter
}

export function getPushLimiter() {
  if (!pushLimiter) {
    pushLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, '10 s'),
      prefix: 'ratelimit:sync-push',
    })
  }
  return pushLimiter
}

export function getNewCodeLimiter() {
  if (!newCodeLimiter) {
    newCodeLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'ratelimit:sync-new-code',
    })
  }
  return newCodeLimiter
}

// Best-effort client identifier for rate limiting. Vercel sets x-forwarded-for
// on every request; the 'unknown' fallback is defensive only — it shouldn't be
// reachable in production but keeps a limiter from throwing if it ever is.
export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return 'unknown'
}
