/**
 * sync.js — client-side counterpart to the api/sync-* serverless functions
 * (see PERSISTENCE-AND-SYNC-DESIGN.md Part B).
 *
 * Gathers/applies the app's localStorage state as one JSON blob, keyed to an
 * anonymous sync code. No accounts — the code IS the identity. Losing it
 * loses the data behind it; that's a deliberate trade-off, not an oversight
 * (see SyncView.jsx for the in-product warning this requires).
 *
 * Sync direction, per the design doc: pull-on-load (merge into local state)
 * and push-on-change (debounced, not on every tap) — no manual "sync now"
 * button, the sync itself should be invisible. Conflict handling is
 * last-write-wins at the whole-blob level, same simplification the server
 * makes (see api/sync-push.js) — deliberate given the realistic usage
 * pattern (one person, one code, rarely two devices writing at once).
 */

const CODE_KEY = 'sy-sync-code'
const LAST_SYNCED_KEY = 'sy-sync-last-synced'
const SCHEMA_VERSION = 1
const PUSH_DEBOUNCE_MS = 3000

const MEMO_PREFIX = 'memo-'
const HISTORY_PREFIX = 'memo-history-'
const SESSION_LOG_KEY = 'memo-session-log'
const INCLUDE_DRILLS_KEY = 'memo-map-include-drills'

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

  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(), // server overwrites this on push — see sync-push.js
    memo,
    memoHistory,
    sessionLog,
    preferences: { memoryMapIncludeDrills },
  }
}

// Full replace, not a per-key merge — see file header on why last-write-wins
// at the blob level is the deliberate design, not a shortcut.
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

export async function pushNow(code = getSyncCode()) {
  if (!code) return null
  const blob = gatherBlob()
  const { updatedAt } = await postJson('/api/sync-push', { code, blob })
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
