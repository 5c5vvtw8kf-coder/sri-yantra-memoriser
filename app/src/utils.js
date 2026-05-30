/**
 * utils.js — shared display helpers used across all view components.
 */

// ── Memo result persistence ───────────────────────────────────────────────────

export function loadMemoStorage(key) {
  try {
    const v = localStorage.getItem(`memo-${key}`)
    return v ? JSON.parse(v) : {}
  } catch { return {} }
}

export function saveMemoStorage(key, data) {
  try { localStorage.setItem(`memo-${key}`, JSON.stringify(data)) } catch {}
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
