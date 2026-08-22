/**
 * utils.js — shared display helpers used across all view components.
 */

import { schedulePush } from './sync.js'

// ── Tooltip width measurement ─────────────────────────────────────────────────
//
// Uses the Canvas 2D API to measure actual text advance width at the same
// font-family and font-size as the SVG tooltip.  This eliminates per-script
// charW constants and handles variable-width scripts (Bengali, Tamil, etc.)
// exactly without heuristics.
//
// SVG font-size is expressed in user units.  Canvas measureText() at the same
// nominal size returns the same unit value, so the result can be used directly
// as an SVG width attribute.
//
let _ttCanvas = null

export function measureTooltipWidth(label, fontSize, padding = 18, minWidth = 60, kana = null) {
  try {
    if (!_ttCanvas) _ttCanvas = document.createElement('canvas').getContext('2d')
    _ttCanvas.font = `${fontSize}px 'Gentium Plus', Georgia, serif`
    let w = Math.ceil(_ttCanvas.measureText(label).width)
    if (kana) {
      // Kana furigana renders at fontSize=13 sans-serif — measure it too
      _ttCanvas.font = `13px sans-serif`
      w = Math.max(w, Math.ceil(_ttCanvas.measureText(kana).width))
    }
    return Math.max(minWidth, w + padding)
  } catch {
    // Fallback for non-browser environments (tests, SSR)
    return Math.max(minWidth, Math.round(label.length * fontSize * 0.65) + padding)
  }
}

// ── Memo result persistence ───────────────────────────────────────────────────
//
// Two parallel stores per section key:
//   memo-{key}         — current session results   { [seq]: 'correct'|'wrong' }
//   memo-history-{key} — rolling last-3 per deity  { [seq]: [entry, entry, ...] }
//
// History is maintained by saveMemoStorage via diff against the previously
// stored snapshot — so only genuinely new/changed results are recorded,
// regardless of how many times React re-calls saveMemoStorage.
//
// Status is derived from history alone (see MemoMapView):
//   Memorised         — last 3 entries all 'correct'
//   Partially         — at least 1 'correct' but not 3-in-a-row
//   Not memorised     — attempted, but never 'correct'
//   Not attempted     — no history
//
// Entry shape (added 2026-08-16 — see PERSISTENCE-AND-SYNC-DESIGN.md):
//   { result: 'correct'|'wrong', mode: 'memorise'|'drill' }
// 'memorise' = written by a circuit's own Explore/Memorise view (sequential).
// 'drill'    = written by Spot Check or Segment/Line/Triangle Drill (random/
//              cross-circuit). Chris asked these to stay distinguishable
//              rather than being flattened into one signal, so the Memory Map
//              can filter by mode instead of just aggregating everything.
//
// Backward compatibility: entries written before 2026-08-16 are bare strings
// ('correct'/'wrong'), not objects — they predate the mode field entirely.
// Use historyResult()/historyMode() below rather than reading entries
// directly, so old and new entries are handled the same way. Untagged
// legacy entries are treated as 'memorise', since that's the only mode that
// existed when they were written.

export function loadMemoStorage(key) {
  try {
    const v = localStorage.getItem(`memo-${key}`)
    const data = v ? JSON.parse(v) : {}

    // One-time migration: if current results exist but history is absent,
    // seed history from the stored results (one entry per deity).
    if (Object.keys(data).length > 0) {
      const histKey = `memo-history-${key}`
      if (!localStorage.getItem(histKey)) {
        const hist = {}
        Object.entries(data).forEach(([seq, result]) => {
          hist[seq] = [result]
        })
        localStorage.setItem(histKey, JSON.stringify(hist))
      }
    }

    return data
  } catch { return {} }
}

export function saveMemoStorage(key, data, { clearHistory = false } = {}) {
  try {
    const storageKey = `memo-${key}`
    const histKey    = `memo-history-${key}`

    if (Object.keys(data).length === 0) {
      // Empty data = round reset. Always clear current results.
      // Only clear history when explicitly requested (e.g. "Clear all" button).
      localStorage.setItem(storageKey, JSON.stringify(data))
      if (clearHistory) localStorage.removeItem(histKey)
      schedulePush()
      return
    }

    // Diff against the stored snapshot — only record genuinely changed results.
    // This ensures useEffect re-fires don't double-count.
    const prev = JSON.parse(localStorage.getItem(storageKey) || '{}')
    const hist = JSON.parse(localStorage.getItem(histKey)    || '{}')

    Object.entries(data).forEach(([seq, result]) => {
      if (result !== prev[seq]) {
        if (!hist[seq]) hist[seq] = []
        // saveMemoStorage is only ever called from a circuit's own
        // Explore/Memorise view (see the useEffect calls in App.jsx) — so
        // every entry it writes is unambiguously 'memorise' mode.
        hist[seq].push({ result, mode: 'memorise' })
        if (hist[seq].length > 3) hist[seq].shift() // keep only last 3
      }
    })

    localStorage.setItem(storageKey, JSON.stringify(data))
    localStorage.setItem(histKey,    JSON.stringify(hist))
    schedulePush()
  } catch {}
}

export function loadMemoHistory(key) {
  try {
    const v = localStorage.getItem(`memo-history-${key}`)
    return v ? JSON.parse(v) : {}
  } catch { return {} }
}

// ── Activity log ─────────────────────────────────────────────────────────────
// Stores a chronological list of completed memo rounds.
// Entry shape: { ts: number, section: string, correct: number, total: number }

export function loadSessionLog() {
  try {
    const v = localStorage.getItem('memo-session-log')
    return v ? JSON.parse(v) : []
  } catch { return [] }
}

export function saveSessionLog(entry) {
  try {
    const log = loadSessionLog()
    log.push(entry)
    if (log.length > 500) log.splice(0, log.length - 500)
    localStorage.setItem('memo-session-log', JSON.stringify(log))
    schedulePush()
  } catch {}
}

export function clearSessionLog() {
  try { localStorage.removeItem('memo-session-log') } catch {}
}

// Write a single answer (correct or wrong) directly to history for a given store key + seq.
// Used for wrong answers, which don't update React state and therefore bypass saveMemoStorage,
// and — since 2026-08-16 — for every result written by Spot Check and the Segment/Line/Triangle
// Drills, which don't have a per-circuit results object to diff at all (a single drill round can
// touch deities from several circuits, each written into its own home circuit's history store).
//
// `mode` defaults to 'memorise' so the twelve existing per-circuit call sites (App.jsx) don't need
// to change — they were always memorise-mode and stay that way implicitly. New call sites (Spot
// Check, Segment/Line/Triangle Drill) must pass mode: 'drill' explicitly.
export function recordHistoryEntry(key, seq, result, mode = 'memorise') {
  try {
    const histKey = `memo-history-${key}`
    const hist = JSON.parse(localStorage.getItem(histKey) || '{}')
    if (!hist[seq]) hist[seq] = []
    hist[seq].push({ result, mode })
    if (hist[seq].length > 3) hist[seq].shift()
    localStorage.setItem(histKey, JSON.stringify(hist))
    schedulePush()
  } catch {}
}

// ── History entry accessors ───────────────────────────────────────────────────
// Safe readers for memo-history-{key} entries, tolerant of both the current
// { result, mode } object shape and pre-2026-08-16 bare-string entries.
// Consumers (e.g. MemoMapView) should always read through these rather than
// touching entry.result / entry.mode directly.

export function historyResult(entry) {
  if (entry == null) return null
  return typeof entry === 'object' ? entry.result : entry
}

export function historyMode(entry) {
  if (entry == null) return 'memorise'
  return typeof entry === 'object' ? (entry.mode || 'memorise') : 'memorise'
}

// Takes the raw { store: { seq: [entry, ...] } } shape returned by loadMemoHistory
// for each store, and returns the same shape with each entry array (a) filtered by
// mode — 'memorise' entries only, unless includeDrills is true — and (b) flattened
// to bare 'correct'/'wrong' strings via historyResult(). This lets every existing
// consumer (MemoMapView.jsx and MemoMapVisuals.jsx both have their own
// statusFromHistory() that does `r === 'correct'`) keep working completely
// unchanged — they just receive pre-filtered, pre-normalised history, exactly the
// shape they always expected, regardless of the underlying { result, mode } or
// legacy bare-string storage format.
export function filterHistoryByMode(rawHistory, includeDrills) {
  const out = {}
  for (const [store, byKey] of Object.entries(rawHistory || {})) {
    out[store] = {}
    for (const [key, entries] of Object.entries(byKey || {})) {
      out[store][key] = (entries || [])
        .filter(e => includeDrills || historyMode(e) === 'memorise')
        .map(e => historyResult(e))
    }
  }
  return out
}

// ── Section → memo storage key mapping ─────────────────────────────────────────
// Every deity's `sectionId` (from khadgamala-canonical.json) maps to exactly one
// memo-{key} / memo-history-{key} storage key — the same key that section's own
// Explore/Memorise view reads and writes. Drill modes (Spot Check, Segment/Line/
// Triangle Drill) touch deities from multiple sections per round, so each result
// needs to be routed to its deity's own home key, not a separate per-drill store.
//
// 'invocation' (the opening Devi Sambodhanam line, 1 item) has no memo store —
// it's display-only and never quizzed — so it's intentionally absent below.
const SECTION_TO_MEMO_KEY = {
  'nyasa':        'nyasa',
  'nitya':        'inner',
  'guru-divya':   'gurava',
  'guru-siddha':  'gurava',
  'guru-manava':  'gurava',
  'circuit-1':    'bhupura',
  'circuit-2':    'c2',
  'circuit-3':    'c3',
  'circuit-4':    'c4',
  'circuit-5':    'c5',
  'circuit-6':    'c6',
  'circuit-7':    'c7',
  'circuit-8':    'c8',
  'circuit-9':    'c9',
  'chakreshvari': 'nc',
  'closing':      'closing',
}

export function sectionIdToMemoKey(sectionId) {
  return SECTION_TO_MEMO_KEY[sectionId] ?? null
}

// The three guru lineages (guru-divya/guru-siddha/guru-manava) are the one
// exception to "storage key = sectionId, seq = sequenceInSection": they share
// a single combined 'gurava' store (see GuravahView.jsx / MemoMapView.jsx's
// getDeityStatus), so each sub-lineage's own 1-based sequenceInSection needs
// an offset to avoid collisions — divya stays 1-7, siddha becomes 8-11
// (7 + seq), manava becomes 12-19 (11 + seq). Every other section maps
// straight through with offset 0. Use this instead of sectionIdToMemoKey()
// directly whenever a deity might belong to a combined-store section.
const GURU_SEQ_OFFSET = { 'guru-divya': 0, 'guru-siddha': 7, 'guru-manava': 11 }

export function sectionIdToMemoKeyAndSeq(sectionId, sequenceInSection) {
  const key = sectionIdToMemoKey(sectionId)
  if (key == null) return { key: null, seq: null }
  const offset = GURU_SEQ_OFFSET[sectionId] ?? 0
  return { key, seq: sequenceInSection + offset }
}

// ── Per-circuit Chakra Svāminī / Yoginī quiz slots ─────────────────────────────
// Each circuit's own Explore/Memorise round quizzes two extra items beyond its
// deity list: the circuit's Chakra Svāminī name and Yoginī type. These live in
// the *same* per-circuit store as the deities (e.g. 'c2'), at the two seq
// numbers immediately following the last deity (e.g. circuit-2 has 16 deities,
// so svamini=17, yogini=18 — matching the total:18 already logged by
// handleC2MarkResult's saveSessionLog call). This table was previously only
// defined inside MemoMapVisuals.jsx; it's shared here so Spot Check's
// NavaCakraSpotCheckView (which quizzes exactly this content) can write to the
// same slots instead of duplicating — or worse, drifting from — these numbers.
export const CIRCUIT_STORE = {
  'circuit-1': 'bhupura', 'circuit-2': 'c2', 'circuit-3': 'c3',
  'circuit-4': 'c4',      'circuit-5': 'c5', 'circuit-6': 'c6',
  'circuit-7': 'c7',      'circuit-8': 'c8', 'circuit-9': 'c9',
}

export const SVAMINI_YOGINI_SEQS = {
  'circuit-1': { svamini: 29, yogini: 30 },
  'circuit-2': { svamini: 17, yogini: 18 },
  'circuit-3': { svamini: 9,  yogini: 10 },
  'circuit-4': { svamini: 15, yogini: 16 },
  'circuit-5': { svamini: 11, yogini: 12 },
  'circuit-6': { svamini: 11, yogini: 12 },
  'circuit-7': { svamini: 9,  yogini: 10 },
  'circuit-8': { svamini: 8,  yogini: 9  },
  'circuit-9': { svamini: 2,  yogini: 3  },
}

// Returns { key, seq } for a circuit's Svamini or Yogini quiz slot, or
// { key: null, seq: null } if the circuit/type combination isn't recognised.
export function svaminiYoginiToMemoKeyAndSeq(circuitSectionId, type) {
  const store = CIRCUIT_STORE[circuitSectionId]
  const seq   = SVAMINI_YOGINI_SEQS[circuitSectionId]?.[type]
  if (!store || seq == null) return { key: null, seq: null }
  return { key: store, seq }
}

// ── Lineage settings ─────────────────────────────────────────────────────────
//
// Some deities (e.g. garimāsiddhē) are excluded by some lineages and included
// by others — see khadgamala-canonical.json's `optional: true` flag. This
// setting controls whether optional deities are shown, and is read once at
// module-load time by data/activeDeities.js (which every view imports data
// through instead of the raw canonical JSON). Because it's read at import
// time rather than kept in React state, toggling it requires a page reload
// to take effect everywhere — see setIncludeOptionalDeities's caller in
// ReferencesView.jsx.

const INCLUDE_OPTIONAL_KEY = 'sy-include-optional-deities'

export function getIncludeOptionalDeities() {
  try { return localStorage.getItem(INCLUDE_OPTIONAL_KEY) === 'true' } catch { return false }
}

export function setIncludeOptionalDeities(value) {
  try { localStorage.setItem(INCLUDE_OPTIONAL_KEY, value ? 'true' : 'false') } catch {}
}

// ── Śrī Yantra page: user's custom colour themes ────────────────────────────
// Part of the Device Sync blob (see sync.js's gatherBlob/applyBlob and
// api/_lib/mergeBlob.js) — whichever device pushed last wins for the whole
// array of 5 slots, same as `preferences`. Saving here also schedules a
// push, same as every other memo-* write in this file.

const CUSTOM_YANTRA_THEME_KEY  = 'sy-custom-yantra-theme'    // legacy: single slot — read-only, kept for migration
const CUSTOM_YANTRA_THEMES_KEY = 'sy-custom-yantra-themes'   // current: array of 5 slots

// Legacy loader — only used once, to migrate an existing single custom theme
// into slot 1 the first time a device sees the 5-slot version.
export function loadCustomYantraTheme() {
  try {
    const v = localStorage.getItem(CUSTOM_YANTRA_THEME_KEY)
    return v ? JSON.parse(v) : null
  } catch { return null }
}

export function loadCustomYantraThemes() {
  try {
    const v = localStorage.getItem(CUSTOM_YANTRA_THEMES_KEY)
    const arr = v ? JSON.parse(v) : null
    return Array.isArray(arr) && arr.length === 5 ? arr : null
  } catch { return null }
}

export function saveCustomYantraThemes(themes) {
  try {
    localStorage.setItem(CUSTOM_YANTRA_THEMES_KEY, JSON.stringify(themes))
    schedulePush()
  } catch {}
}

/**
 * Returns the display name for a deity in the requested script,
 * falling back to IAST if the requested script is unavailable.
 *
 * `scriptOrLocale` can be either a raw script key ('telugu', 'iast', …)
 * or a locale id ('te', 'si', …).  Locale ids are resolved via
 * localeScript() before lookup, so callers can pass either form.
 */
export function displayName(deity, scriptOrLocale) {
  if (!deity) return ''
  const s = deity.scripts
  // Resolve locale → script if needed (locale ids that differ from script ids)
  const script = resolveScript(scriptOrLocale)
  return s[script] || s.iast
}

/**
 * Map a locale id or script key to the actual JSON script field name.
 * Most existing locale ids happen to match the script field name directly.
 * New locales (ne, si, id, ja, …) need explicit mappings here.
 */
function resolveScript(scriptOrLocale) {
  const LOCALE_TO_SCRIPT = {
    ne: 'devanagari',
    si: 'sinhala',
    id: 'iast',
    ja: 'kana',
  }
  return LOCALE_TO_SCRIPT[scriptOrLocale] ?? scriptOrLocale
}
