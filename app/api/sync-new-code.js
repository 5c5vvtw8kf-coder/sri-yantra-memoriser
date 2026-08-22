// api/sync-new-code.js — POST
//
// Generates a fresh sync code, reserves it in Redis with an empty schema-v1
// blob, and returns the code to the caller. This is the "Get a code" action —
// it never overwrites an existing code (sync-push does that), and pulling
// (sync-pull) never creates one implicitly. Each of the three endpoints does
// exactly one thing, on purpose — see PERSISTENCE-AND-SYNC-DESIGN.md Part B.

import { getRedis } from './_lib/redis.js'
import { generateSyncCode } from './_lib/code.js'
import { getNewCodeLimiter, clientIp } from './_lib/ratelimit.js'

const SCHEMA_VERSION = 1

function emptyBlob() {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    memo: {},
    memoHistory: {},
    sessionLog: [],
    preferences: { memoryMapIncludeDrills: false },
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { success } = await getNewCodeLimiter().limit(clientIp(req))
    if (!success) {
      return res.status(429).json({ error: 'Too many requests — try again shortly.' })
    }

    const redis = getRedis()

    // Collision is vanishingly unlikely (58^12 possible codes) but this is the
    // one place a collision would silently clobber someone else's data, so check.
    let code = null
    for (let attempt = 0; attempt < 5 && !code; attempt++) {
      const candidate = generateSyncCode()
      const exists = await redis.exists(`sync:${candidate}`)
      if (!exists) code = candidate
    }
    if (!code) {
      return res.status(500).json({ error: 'Could not generate a unique code — try again.' })
    }

    await redis.set(`sync:${code}`, emptyBlob())
    return res.status(200).json({ code })
  } catch (err) {
    console.error('sync-new-code error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
