// api/sync-push.js — POST { code, blob }
//
// Merges the incoming blob into whatever's already stored for this code —
// see _lib/mergeBlob.js for exactly what "merge" means here and the
// 2026-08-22 incident that made a blind overwrite unacceptable (two devices
// completing different circuits between syncs used to silently erase one
// another). The response includes the merged blob so the pushing device can
// adopt it locally too — a push now doubles as picking up whatever other
// devices have already contributed, without a separate manual pull.
//
// Requires an existing code (from sync-new-code) — this endpoint never creates
// one implicitly, so a typo'd code fails loudly instead of silently writing to
// a new, disconnected blob the user will never find again.

import { getRedis } from './_lib/redis.js'
import { isValidSyncCode } from './_lib/code.js'
import { getPushLimiter, clientIp } from './_lib/ratelimit.js'
import { mergeBlobs } from './_lib/mergeBlob.js'

const SCHEMA_VERSION = 1
const MAX_BODY_BYTES = 512 * 1024 // generous for this app's data shape, just stops abuse

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { success } = await getPushLimiter().limit(clientIp(req))
    if (!success) {
      return res.status(429).json({ error: 'Too many requests — try again shortly.' })
    }

    const { code, blob } = req.body || {}
    if (!isValidSyncCode(code)) {
      return res.status(400).json({ error: 'Invalid code format' })
    }
    if (!blob || typeof blob !== 'object' || Array.isArray(blob)) {
      return res.status(400).json({ error: 'Missing or malformed blob' })
    }
    if (JSON.stringify(blob).length > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'Payload too large' })
    }

    const redis = getRedis()
    const existing = await redis.get(`sync:${code}`)
    if (!existing) {
      return res.status(404).json({ error: 'Unknown code — get a new one first' })
    }

    // Server sets updatedAt and schemaVersion — never trust the client's clock
    // or an arbitrary version number arriving in the request body.
    const merged  = mergeBlobs(existing, blob)
    const toStore = { ...merged, schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString() }
    await redis.set(`sync:${code}`, toStore)

    return res.status(200).json({ ok: true, updatedAt: toStore.updatedAt, blob: toStore })
  } catch (err) {
    console.error('sync-push error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
