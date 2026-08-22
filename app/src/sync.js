/**
 * sync.js — client-side counterpart to the api/sync-* serverless functions
 * (see PERSISTENCE-AND-SYNC-DESIGN.md Part B).
 *
 * Gathers/applies the app's localStorage state as one JSON blob, keyed to an
 * anonymous sync code. No accounts — the code IS the identity. Losing it
 * loses the data behind it; that's a deliberate trade-off, not an oversight
 * (see SyncView.jsx for the in-product warning this requires).
 *
 * Sync direction: push-on-change (debounced), pull only on an explicit,
 * confirmed user action (Link, "Pull latest") or on first load for a device
 * with zero local progress — see hasLocalProgress() and App.jsx's mount
 * effect for why an unconditional pull-on-load was removed 2026-08-22.
 *
 * Conflict handling is a per-SECTION merge on the server (see
 * api/_lib/mergeBlob.js), not a whole-blob overwrite — also changed
 * 2026-08-22, after a blind overwrite let one device's push silently erase
 * another device's progress on a circuit it had never touched. A push now
 * merges this device's changes into whatever's stored and adopts the
 * merged result locally (see pushNow), so pushing also picks up other
 * devices' independent progress. The remaining accepted trade-off: two
 * devices editing the exact same section without syncing between still
 * resolves last-write-wins for that one section — full CRDT-style merging
 * within a section was considered and rejected as unnecessary complexity
 * for this app's realistic usage pattern (one person, a handful of devices).
 */

const CODE_KEY = 'sy-sync-code'
const LAST_SYNCED_KEY = 'sy-sync-last-synced'
const SCHEMA_VERSION = 1
const PUSH_DEBOUNCE_MS = 3000

const MEMO_PREFIX = 'memo-'
const HISTORY_PREFIX = 'memo-history-'
const SESSION_LOG_KEY = 'memo-session-log'
const INCLUDE_DRILLS_KEY = 'memo-map-include-drills'
const CUSTOM_YANTRA_THEMES_KEY = 'sy-custom-yantra-themes'   // 3 custom colour-theme slots, see utils.js

// ── Code management ──────────────────────────────────────────────────────

export function getSyncCode() {
  try { return localStorage.getItem(CODE_KEY) } catch { return null }
}

function setSyncCode(code) {
  try { localStorage.setItem(CODE_KEY, code) } catch {}
}

export function clearSyncCode() {
  try {
    localStorage.removeItem(CODE_KEY)
    localStorage.removeItem(LAST_SYNCED_KEY)
  } catch {}
}

export function getLastSyncedAt() {
  try { return localStorage.getItem(LAST_SYNCED_KEY) } catch { return null }
}

function setLastSyncedAt(iso) {
  try { localStorage.setItem(LAST_SYNCED_KEY, iso) } catch {}
}

// ── Gather / apply localStorage ↔ blob ───────────────────────────────────
//
// Deliberately scans localStorage by key prefix rather than hardcoding the
// list of section keys (bhupura, c2..c9, nyasa, gurava, ...) — new sections
// or drill types shouldn't require touching this file to be included in sync.

function gatherBlob() {
  const memo = {}
  const memoHistory = {}
  let sessionLog = []
  let memoryMapIncludeDrills = false

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      if (k === SESSION_LOG_KEY) {
        sessionLog = JSON.parse(localStorage.getItem(k) || '[]')
      } else if (k === INCLUDE_DRILLS_KEY) {
        memoryMapIncludeDrills = localStorage.getItem(k) === 'true'
      } else if (k.startsWith(HISTORY_PREFIX)) {
        memoHistory[k.slice(HISTORY_PREFIX.length)] = JSON.parse(localStorage.getItem(k) || '{}')
      } else if (k.startsWith(MEMO_PREFIX)) {
        memo[k.slice(MEMO_PREFIX.length)] = JSON.parse(localStorage.getItem(k) || '{}')
      }
    }
  } catch (err) {
    console.error('sync: gatherBlob failed', err)
  }

  let yantraThemes = null
  try {
    const raw = localStorage.getItem(CUSTOM_YANTRA_THEMES_KEY)
    yantraThemes = raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('sync: reading yantraThemes failed', err)
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(), // server overwrites this on push — see sync-push.js
    memo,
    memoHistory,
    sessionLog,
    preferences: { memoryMapIncludeDrills },
    yantraThemes,
  }
}

// Writes whatever blob it's given straight into localStorage, key for key —
// this function itself does no merging. That's fine: for a Link/Pull, the
// blob it receives is exactly what's stored server-side, which is already
// the product of every device's merged contributions (see
// api/_lib/mergeBlob.js); for pushNow's local adoption, same thing. The
// merge work happens once, server-side, on write — not here on every apply.
function applyBlob(blob) {
  if (!blob || typeof blob !== 'object') return
  try {
    Object.entries(blob.memo || {}).forEach(([key, data]) => {
      localStorage.setItem(`${MEMO_PREFIX}${key}`, JSON.stringify(data))
    })
    Object.entries(blob.memoHistory || {}).forEach(([key, data]) => {
      localStorage.setItem(`${HISTORY_PREFIX}${key}`, JSON.stringify(data))
    })
    localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(blob.sessionLog || []))
    if (blob.preferences && typeof blob.preferences.memoryMapIncludeDrills === 'boolean') {
      localStorage.setItem(INCLUDE_DRILLS_KEY, blob.preferences.memoryMapIncludeDrills ? 'true' : 'false')
    }
    // Normalise to exactly 3 slots rather than requiring an exact length match —
    // an older device (or a stale cloud blob) may still be sending 5; truncate
    // rather than reject so a pull never silently discards Custom 1-3. Matches
    // the same normalisation in utils.js's loadCustomYantraThemes.
    if (Array.isArray(blob.yantraThemes) && blob.yantraThemes.length > 0) {
      const SLOT_COUNT = 3
      let normalised = blob.yantraThemes.slice(0, SLOT_COUNT)
      while (normalised.length < SLOT_COUNT) normalised.push(blob.yantraThemes[blob.yantraThemes.length - 1])
      localStorage.setItem(CUSTOM_YANTRA_THEMES_KEY, JSON.stringify(normalised))
    }
  } catch (err) {
    console.error('sync: applyBlob failed', err)
  }
}

// ── Network ───────────────────────────────────────────────────────────────

async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

async function getJson(path) {
  const res = await fetch(path)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

// ── Public actions ───────────────────────────────────────────────────────

/** Generates a new code, saves it locally, and seeds it with whatever's already on this device. */
export async function createSyncCode() {
  const { code } = await postJson('/api/sync-new-code', {})
  setSyncCode(code)
  const updatedAt = await pushNow(code)
  setLastSyncedAt(updatedAt || new Date().toISOString())
  return code
}

/** Links an existing code on this device. Pulls immediately — this OVERWRITES local data. */
export async function linkSyncCode(code) {
  const blob = await getJson(`/api/sync-pull?code=${encodeURIComponent(code)}`)
  applyBlob(blob)
  setSyncCode(code)
  setLastSyncedAt(blob.updatedAt || new Date().toISOString())
  return blob
}

export async function pullNow(code = getSyncCode()) {
  if (!code) return null
  const blob = await getJson(`/api/sync-pull?code=${encodeURIComponent(code)}`)
  applyBlob(blob)
  setLastSyncedAt(blob.updatedAt || new Date().toISOString())
  return blob
}

// Used to decide whether an automatic pull is safe. A device with zero local
// progress has nothing to lose, so pulling on mount is a pure convenience for
// a brand-new install. A device that already has memo results, history, or a
// session log must never be silently overwritten — that's what caused the
// 2026-08-22 Activity Log wipe (mount-effect pull ran unconditionally and
// replaced a fuller local dataset with a leaner cloud one). Any explicit pull
// from here on (Link, Sync now) still overwrites — that's the point of those
// actions — but it happens only when the user asked for it, with a confirm.
export function hasLocalProgress() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      if (k === SESSION_LOG_KEY) {
        const log = JSON.parse(localStorage.getItem(k) || '[]')
        if (Array.isArray(log) && log.length > 0) return true
      } else if (k.startsWith(MEMO_PREFIX) && k !== INCLUDE_DRILLS_KEY) {
        const val = JSON.parse(localStorage.getItem(k) || '{}')
        if (val && typeof val === 'object' && Object.keys(val).length > 0) return true
      }
    }
  } catch (err) {
    console.error('sync: hasLocalProgress check failed', err)
  }
  return false
}

// Pushes this device's data, then adopts whatever the server merged it into
// (see api/_lib/mergeBlob.js) — sections this device never touched but
// another device already pushed come back in the response and get applied
// locally. Safe to apply unconditionally: the merge is additive (a section
// is only ever replaced by a newer write for that exact section, never
// dropped), unlike the old blind-pull overwrite this deliberately isn't.
export async function pushNow(code = getSyncCode()) {
  if (!code) return null
  const blob = gatherBlob()
  const { updatedAt, blob: merged } = await postJson('/api/sync-push', { code, blob })
  if (merged) applyBlob(merged)
  setLastSyncedAt(updatedAt)
  return updatedAt
}

// ── Debounced auto-push ──────────────────────────────────────────────────
// Call schedulePush() from anywhere that just wrote a memo-* result — it's a
// no-op if no code is linked yet. Debounced so a burst of taps (e.g. a whole
// Segment Drill round) triggers one push, not one per tap. Failures are
// logged, not surfaced — sync is additive; the app must keep working fully
// offline on local data regardless of network/server state (see design doc).

let pushTimer = null

export function schedulePush() {
  const code = getSyncCode()
  if (!code) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushTimer = null
    pushNow(code).catch(err => console.error('sync: debounced push failed', err))
  }, PUSH_DEBOUNCE_MS)
}

// A pending debounced push lives only as a setTimeout in this tab's memory —
// if the tab closes, the app is backgrounded, or the OS reclaims it before
// the timer fires, that push is silently lost (this is what dropped three
// real Activity Log entries on 2026-08-22: Desktop generated them, closed
// before the 3s debounce ran, and nothing surfaced the failure). Call this
// from a visibilitychange/pagehide listener to flush immediately instead of
// waiting. Uses sendBeacon rather than fetch — sendBeacon is specifically
// designed to survive page unload, where a normal in-flight fetch can be
// cancelled. Best-effort and silent by design (no response to read on
// unload); no-op if nothing is pending or no code is linked.
export function flushPendingPush() {
  if (!pushTimer) return
  clearTimeout(pushTimer)
  pushTimer = null
  const code = getSyncCode()
  if (!code) return
  try {
    const payload = new Blob([JSON.stringify({ code, blob: gatherBlob() })], { type: 'application/json' })
    navigator.sendBeacon('/api/sync-push', payload)
  } catch (err) {
    console.error('sync: flushPendingPush failed', err)
  }
}
