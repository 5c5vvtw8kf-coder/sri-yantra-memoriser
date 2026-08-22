// api/sync-pull.js — GET ?code=XXXXXXXXXXXX
//
// Returns the stored blob for a sync code, or 404 if the code is unknown.
// Deliberately read-only: this endpoint never creates or modifies data, so a
// mistyped or guessed code can't have any side effect beyond a rate-limit hit.

import { getRedis } from './_lib/redis.js'
import { isValidSyncCode } from './_lib/code.js'
import { getPullLimiter, clientIp } from './_lib/ratelimit.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { success } = await getPullLimiter().limit(clientIp(req))
    if (!success) {
      return res.status(429).json({ error: 'Too many requests — try again shortly.' })
    }

    const code = typeof req.query.code === 'string' ? req.query.code : ''
    if (!isValidSyncCode(code)) {
      return res.status(400).json({ error: 'Invalid code format' })
    }

    const redis = getRedis()
    const blob = await redis.get(`sync:${code}`)
    if (!blob) {
      return res.status(404).json({ error: 'No data for this code' })
    }

    return res.status(200).json(blob)
  } catch (err) {
    console.error('sync-pull error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
