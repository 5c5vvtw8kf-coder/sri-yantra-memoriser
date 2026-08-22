// api/_lib/redis.js
//
// Thin wrapper around @upstash/redis so the three sync endpoints don't each
// re-derive which env vars to read. The Upstash Redis Vercel Marketplace
// integration typically injects UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN,
// but if it's ever connected under the older "Vercel KV" naming the vars show up
// as KV_REST_API_URL / KV_REST_API_TOKEN instead — support both so this doesn't
// silently break depending on how the integration was connected in the dashboard.
//
// Files starting with an underscore under /api are not turned into their own
// Serverless Functions by Vercel — this is a shared helper, not a route.

import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

let client = null

/**
 * Returns a shared Redis client, or throws a clear error if the integration
 * hasn't been connected yet. Thrown at call time (not import/module-load time)
 * so a missing-env-var deploy fails loudly on first request with a message that
 * says exactly what to fix, rather than crashing the whole function bundle.
 */
export function getRedis() {
  if (!url || !token) {
    throw new Error(
      'Redis is not configured — missing UPSTASH_REDIS_REST_URL/TOKEN (or KV_REST_API_URL/TOKEN) ' +
      'env vars. Connect the Upstash Redis integration in the Vercel dashboard (Project → Storage → ' +
      'Browse Marketplace → Upstash → Redis) and redeploy.'
    )
  }
  if (!client) client = new Redis({ url, token })
  return client
}
