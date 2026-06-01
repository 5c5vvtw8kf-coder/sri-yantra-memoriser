/**
 * utils.js — shared display helpers used across all view components.
 */

// ── Memo result persistence ───────────────────────────────────────────────────
//
// Two parallel stores per section key:
//   memo-{key}         — current session results   { [seq]: 'correct'|'wrong' }
//   memo-history-{key} — rolling last-3 per deity  { [seq]: ['correct','wrong',...] }
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
      return
    }

    // Diff against the stored snapshot — only record genuinely changed results.
    // This ensures useEffect re-fires don't double-count.
    const prev = JSON.parse(localStorage.getItem(storageKey) || '{}')
    const hist = JSON.parse(localStorage.getItem(histKey)    || '{}')

    Object.entries(data).forEach(([seq, result]) => {
      if (result !== prev[seq]) {
        if (!hist[seq]) hist[seq] = []
        hist[seq].push(result)
        if (hist[seq].length > 3) hist[seq].shift() // keep only last 3
      }
    })

    localStorage.setItem(storageKey, JSON.stringify(data))
    localStorage.setItem(histKey,    JSON.stringify(hist))
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
  } catch {}
}

export function clearSessionLog() {
  try { localStorage.removeItem('memo-session-log') } catch {}
}

/**
 * Returns the display name for a deity in the requested script,
 * falling back to IAST if the requested script is unavailable.
 */
export function displayName(deity, script) {
  if (!deity) return ''
  const s = deity.scripts
  if (script === 'devanagari') return s.devanagari || s.iast
  if (script === 'english')    return s.english    || s.iast
  if (script === 'telugu')     return s.telugu     || s.iast
  if (script === 'tamil')      return s.tamil      || s.iast
  if (script === 'marathi')    return s.marathi    || s.iast
  if (script === 'hindi')      return s.hindi      || s.iast
  return s.iast
}
