/**
 * LocateDrillView.jsx
 *
 * "Locate Drill" — Chris's wife's idea, 2026-08-23: a reverse Spot Check.
 * Spot Check shows a highlighted position and asks "what deity is this?";
 * Locate Drill shows a deity's name and asks "where does it live on the
 * yantra?" — the more direct test of the spatial knowledge this whole app
 * is built around.
 *
 * Scope (updated 2026-08-23): circuits 1–9, i.e. every deity with a real
 * yantra position. The non-yantra preamble/lineage sections (Nyāsa, Nitya,
 * Guravaḥ, Nava Cakreśvarī, Chakreśvarī) are still not included — they have
 * no real yantra position at all, so "locate it on the diagram" doesn't
 * apply to them; that would need a different drill entirely, not a scope
 * extension of this one.
 *
 * Colours — three outcomes, not two, because this mode has a timeout that
 * Memorise mode doesn't:
 *   correct  → RED         (matches the app's existing Memorise-mode "correct")
 *   wrong    → GOLD        (Chris's call, 2026-08-23 — not TERRACOTTA, to keep
 *                            wrong and timeout visually distinct from each other)
 *   timeout  → TERRACOTTA  ("brown", Chris's call)
 *   unanswered / not-yet-reached → CREAM (Chris's call, 2026-08-23, revising
 *                            the initial DIM_GOLD choice — better dot visibility)
 *
 * High score (best streak) and best time are tracked per scope+round-size
 * combination in localStorage (`sy-locate-stats`) — a 10-deity Circuit 4
 * round and a 70-deity "All" round aren't comparable, so they don't share a
 * record. Not yet wired into Device Sync (single-device only for now, same
 * trade-off the custom yantra themes made before they were extended).
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import data from '../data/activeDeities'
import { displayName, sectionIdToMemoKey, recordHistoryEntry } from '../utils.js'
import {
  getPosition, DEITY_POSITIONS, NITYA_TRIKONA, GURU_TRIKONA,
  NITYA_INSET_VIEWBOX, GURU_INSET_VIEWBOX, ASTRA_POSITIONS,
} from '../deityPositions.js'
import SriYantraSVG from './SriYantraSVG'

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

// ── Colours ───────────────────────────────────────────────────────────────
const RED        = '#c0392b'
const GOLD       = '#c9a84c'
const TERRACOTTA = '#8b4513'
const CREAM      = '#fff8c8'

export const LOCATE_TIMER_OPTIONS = [3, 5, 8, 13, null]   // Fibonacci seconds; null = off (default)

// ── C1 co-location (mirrors SpotCheckView.jsx's _posKeyDeities) ────────────
// Still needed for locateLabel() below, which shows both names together when
// a lineage-variant pair (e.g. laghimā/garimā) shares one physical dot.
// Click handling no longer needs this — see getRegionId()'s circuit-1 case.
const _posKeyDeities = {}
deities.filter(d => d.sectionId === 'circuit-1' && d.role === 'deity').forEach(d => {
  const pos = getPosition(d.id)
  if (!pos) return
  const key = `${pos.x},${pos.y}`
  if (!_posKeyDeities[key]) _posKeyDeities[key] = []
  _posKeyDeities[key].push(d)
})

function locateLabel(deity, script) {
  if (!deity) return ''
  const pos = getPosition(deity.id)
  const key = pos ? `${pos.x},${pos.y}` : null
  const group = key ? (_posKeyDeities[key] ?? []) : []
  if (group.length > 1) {
    const sorted = [...group].sort((a, b) => a.sequenceInSection - b.sequenceInSection)
    return sorted.map(g => displayName(g, script)).join(', ')
  }
  return displayName(deity, script)
}

// All circuit deities 1–9 with real yantra positions. Circuits 1, 8 and 9
// are "point" circuits — individual dots rather than filled petal/triangle
// shapes, see POINT_SECTIONS and the small-dot overlay in the render below.
// nyasa-006 (astradēvī) is force-included even though she has no
// DEITY_POSITIONS entry — she's a 4-position deity (see ASTRA_POSITIONS /
// ASTRA_REGION_IDS below), rendered and click-matched entirely as a special
// case rather than through the normal one-id-per-deity machinery.
const positionedDeities = deities.filter(d => (DEITY_POSITIONS[d.id] != null || d.id === 'nyasa-006') && d.role === 'deity')
const ASTRA_REGION_IDS = ['astrapt-01', 'astrapt-02', 'astrapt-03', 'astrapt-04']

// Sections rendered as small individual dots (own overlay, see render below)
// rather than through SriYantraSVG's filled petal/triangle regions. Nitya
// and the three Guru groups (added 2026-08-23) live in small insets in the
// yantra's top corners — see NITYA_TRIKONA/GURU_TRIKONA in deityPositions.js.
const POINT_SECTIONS = new Set([
  'circuit-1', 'circuit-8', 'circuit-9',
  'nitya', 'guru-divya', 'guru-siddha', 'guru-manava', 'nyasa',
])
const GURU_SECTIONS = new Set(['guru-divya', 'guru-siddha', 'guru-manava'])
const INSET_SECTIONS = new Set(['nitya', 'guru-divya', 'guru-siddha', 'guru-manava'])

const C4_DEITY_ORDER = [8, 7, 6, 5, 4, 3, 2, 1, 14, 13, 12, 11, 10, 9]
const C5_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C6_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C7_DEITY_ORDER = [5, 4, 3, 2, 1, 8, 7, 6]

function getRegionId(deity) {
  if (!deity || deity.role !== 'deity') return null
  const { sectionId, sequenceInSection: seq } = deity
  const pad = n => String(n).padStart(2, '0')
  // Circuit 1 uses SriYantraSVG's own bhupura dot markers (bhupura-01..29) as
  // an id space and a generous native fallback tap-area — the same ids
  // Explore/Memorise already key their C1 dots by — but the *visible* dot is
  // drawn small by this file's own point overlay (see render below), matching
  // Segment/Line Drill's dot sizing (Chris's request, 2026-08-23).
  if (sectionId === 'circuit-1') return `bhupura-${pad(seq)}`
  if (sectionId === 'circuit-2') return `petal-c2-${pad(seq)}`
  if (sectionId === 'circuit-3') return `petal-c3-${pad(seq)}`
  if (sectionId === 'circuit-4') return `tri-c4-${pad(C4_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-5') return `tri-c5-${pad(C5_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-6') return `tri-c6-${pad(C6_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-7') return `tri-c7-${pad(C7_DEITY_ORDER[seq - 1])}`
  // Circuits 8 and 9 have no fine-grained native ids in SriYantraSVG (it only
  // exposes the coarse whole-shape 'c8'/'c9'), so these synthetic ids are
  // handled entirely by this file's own point overlay — no native fallback
  // tap-area the way Circuit 1 gets, same limitation Segment/Line Drill have.
  if (sectionId === 'circuit-8') return `c8pt-${pad(seq)}`
  if (sectionId === 'circuit-9') return `c9pt-${pad(seq)}`
  // Nitya/Guru insets (added 2026-08-23) — synthetic ids, own overlay only.
  if (sectionId === 'nitya') return `nitypt-${pad(seq)}`
  if (sectionId === 'guru-divya') return `gdpt-${pad(seq)}`
  if (sectionId === 'guru-siddha') return `gspt-${pad(seq)}`
  if (sectionId === 'guru-manava') return `gmpt-${pad(seq)}`
  // Nyasa (added 2026-08-23) — synthetic ids, rendered in the main overlay
  // (not an inset) since nētradēvī shares C9's own bindu position.
  if (sectionId === 'nyasa') return `nyaspt-${pad(seq)}`
  return null
}

// ── Outer/inner paired locations ────────────────────────────────────────
// Confirmed by Chris, 2026-08-23: a handful of deity names recur at two
// distinct positions in the yantra — once as a Circuit-1 Mudrā Śakti dot
// (the "outer" occurrence, since Circuit 1/bhupura is outermost) and again
// as the presiding deity of Circuit 4 (the "inner" occurrence). Hardcoded by
// id (not matched by name at runtime) so a lineage edit to the displayed
// name can't silently break the pairing.
//
// Confirmed against the canonical 182-entry dataset via three independent
// matching passes (exact IAST, diacritic-stripped IAST, diacritic-stripped
// English) — 7 name duplicates exist in total, but only these 5 have BOTH
// occurrences inside Locate Drill's circuits-1–9 scope (the other 2 —
// Kāmeśvarī, Mahāvajreśvarī — have their second occurrence in the Nitya
// section, which has no yantra position at all, so they behave as ordinary
// single-location entries here). c1-mudra-002/c4-002 (Sarvavidrāviṇī) was
// missed by the first exact-match-only pass, 2026-08-23 — the two entries
// are transliterated slightly differently in the source data (vidrāviṇī vs
// vidrāvinī), so an exact string comparison didn't catch them as the same
// deity; Chris caught the gap by noticing the count was off ("more than
// four"), the normalized passes confirmed it. Worth remembering if this list
// ever needs re-deriving: exact-match alone isn't reliable against this
// dataset's occasional spelling inconsistencies.
//
// Revised 2026-08-23: originally these were one compound queue item needing
// two clicks before advancing. Chris asked for that to become two ordinary,
// sequential queue items instead — outer immediately followed by inner, each
// scored, timed and advanced independently like any other deity. buildQueue()
// below is what enforces the adjacency; nothing downstream of it needs to
// know pairing exists at all any more.
// Nitya's own trikona inset (added 2026-08-23, see deityPositions.js) is
// what makes these last two possible at all — before it existed, Nitya had
// no position anywhere, so Kāmeśvarī/Mahāvajreśvarī only had one clickable
// location (their circuit occurrence) despite genuinely being two-location
// deities. Ordered Nitya-first: Nitya is recited before any circuit in the
// actual stotra sequence, matching the same "earlier in the chant first"
// principle the Circuit-1/Circuit-4 pairs above already follow.
const PAIR_LOCATIONS = [
  ['c1-mudra-001', 'c4-001'],  // Sarvasaṅkṣōbhiṇī
  ['c1-mudra-002', 'c4-002'],  // Sarvavidrāviṇī
  ['c1-mudra-003', 'c4-003'],  // Sarvākarṣiṇī
  ['c1-mudra-004', 'c4-008'],  // Sarvavaśaṅkarī
  ['c1-mudra-005', 'c4-010'],  // Sarvōnmādinī
  ['nitya-001', 'c7-002'],     // Kāmeśvarī
  ['nitya-006', 'c8-006'],     // Mahāvajreśvarī
]
const PAIR_BY_OUTER = new Map(PAIR_LOCATIONS)
const INNER_IDS = new Set(PAIR_LOCATIONS.map(([, innerId]) => innerId))
// Both halves — used only to show the "(x2)" prompt badge (Chris, 2026-08-23:
// clarifying his "sequential, not simultaneous" request wasn't asking to drop
// the badge, just the old compound two-click-before-scoring mechanic). Purely
// a display concern; buildQueue()'s adjacency and the plain single-item click
// handling are unaffected.
const ALL_PAIR_IDS = new Set(PAIR_LOCATIONS.flat())

export const LOCATE_SCOPES = [
  { id: 'nyasa',     label: 'Nyāsa', trKey: 'locate.scope_nyasa' },
  { id: 'nitya',     label: 'Nitya', trKey: 'locate.scope_nitya' },
  { id: 'gurus',     label: 'Gurus', trKey: 'locate.scope_gurus' },
  { id: 'circuit-1', label: '1st', trKey: 'av.1' },
  { id: 'circuit-2', label: '2nd', trKey: 'av.2' },
  { id: 'circuit-3', label: '3rd', trKey: 'av.3' },
  { id: 'circuit-4', label: '4th', trKey: 'av.4' },
  { id: 'circuit-5', label: '5th', trKey: 'av.5' },
  { id: 'circuit-6', label: '6th', trKey: 'av.6' },
  { id: 'circuit-7', label: '7th', trKey: 'av.7' },
  // Dedicated key (not the shared av.89 used by Spot Check/Activity Log) so
  // this button's shorter wording doesn't change those other views' text.
  { id: 'c8-c9',     label: '8·9', trKey: 'locate.scope_89' },
  { id: 'all',       label: 'All', trKey: 'misc.all' },
]

// 'gurus' is one scope button covering three sectionIds (guru-divya/siddha/
// manava) since they share a single inset — everywhere else, scope === sectionId.
// 'c8-c9' combines circuits 8 and 9 into one button (Chris, 2026-08-23 — same
// combined-scope convention SpotCheckView already uses for these two, since
// C9 is just the single bindu point sitting inside C8's primary triangle).
function matchesScope(d, scope) {
  if (scope === 'gurus') return GURU_SECTIONS.has(d.sectionId)
  if (scope === 'c8-c9') return d.sectionId === 'circuit-8' || d.sectionId === 'circuit-9'
  return d.sectionId === scope
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Every queue item is an ordinary `{ id }` — including paired deities, which
// are just two separate items placed back to back (outer, then inner). Only
// relevant when scope === 'all': a single-circuit scope only ever has one
// half of a pair in its pool anyway, so no adjacency logic is needed there.
function buildQueue(scope, limit) {
  let ids
  if (scope === 'all') {
    // Inner ids are excluded from the shuffle pool — each is inserted right
    // after its outer id below instead of being placed independently.
    const shuffled = shuffle(positionedDeities.filter(d => !INNER_IDS.has(d.id)).map(d => d.id))
    ids = []
    shuffled.forEach(id => {
      ids.push(id)
      if (PAIR_BY_OUTER.has(id)) ids.push(PAIR_BY_OUTER.get(id))
    })
  } else {
    ids = shuffle(positionedDeities.filter(d => matchesScope(d, scope)).map(d => d.id))
  }
  const items = ids.map(id => ({ id }))
  return limit ? items.slice(0, limit) : items
}

// ── Best-streak / best-time persistence (local only, see file header) ──────
const STATS_KEY = 'sy-locate-stats'
function statsKey(scope, limit) { return `${scope}:${limit ?? 'whole'}` }
function loadBest(scope, limit) {
  try {
    const all = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
    return all[statsKey(scope, limit)] || { bestStreak: 0, bestTimeMs: null }
  } catch { return { bestStreak: 0, bestTimeMs: null } }
}
function saveBest(scope, limit, next) {
  try {
    const all = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
    all[statsKey(scope, limit)] = next
    localStorage.setItem(STATS_KEY, JSON.stringify(all))
  } catch {}
}

// ── Completion overlay ───────────────────────────────────────────────────
// fmtTime: minutes:seconds, no decimal place (Chris, 2026-08-25 — the old
// "12.3s" format didn't scale to longer "All" rounds, which run past 60s).
function fmtTime(ms) {
  if (ms == null) return '—'
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function CompletionOverlay({
  correct, total, timeouts, streak, best, elapsedMs, isNewStreak, isNewTime,
  undoCount, canReview, onReview, onRestart, tr,
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-cream text-sm">{tr('locate.round_complete')}</p>
      <div>
        <p className="text-4xl font-medium">
          <span style={{ color: RED }}>{correct}</span>
          <span className="text-muted text-2xl">/{total}</span>
        </p>
        <p className="text-xs text-muted mt-1">{pct}% {tr('misc.memorised')}</p>
        {timeouts > 0 && (
          <p className="text-xs mt-0.5" style={{ color: TERRACOTTA }}>{timeouts} {tr('locate.timed_out')}</p>
        )}
        {/* Feature request, 2026-08-25: surface how many undos were used —
            purely informational, doesn't affect the score above. */}
        {undoCount > 0 && (
          <p className="text-xs mt-0.5 text-muted">{undoCount} {tr('locate.undo_count')}</p>
        )}
      </div>
      <div className="flex gap-6 text-xs">
        <div>
          <p className="text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('locate.best_streak')}</p>
          <p className="text-cream font-mono mt-0.5">
            {streak}{isNewStreak && <span className="text-gold-400 ml-1">★ {tr('locate.new_best')}</span>}
            <span className="text-muted"> / {best.bestStreak}</span>
          </p>
        </div>
        <div>
          <p className="text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('locate.best_time')}</p>
          <p className="text-cream font-mono mt-0.5">
            {fmtTime(elapsedMs)}{isNewTime && <span className="text-gold-400 ml-1">★ {tr('locate.new_best')}</span>}
            <span className="text-muted"> / {fmtTime(best.bestTimeMs)}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        {canReview && (
          <button
            onClick={onReview}
            className="px-5 py-2 bg-black/20 border border-gold-700/50 text-gold-300 rounded-lg text-sm hover:bg-black/30 transition-colors"
          >
            {tr('btn.review_incorrect')}
          </button>
        )}
        <button
          onClick={onRestart}
          className="px-5 py-2 bg-gold-800/40 border border-gold-700/50 text-gold-300 rounded-lg text-sm hover:bg-gold-800/60 transition-colors"
        >
          {tr('btn.new_round')}
        </button>
      </div>
    </div>
  )
}

// ── Inset panel — Nitya / Guru trikona-and-dots, standalone (not layered on
// the yantra SVG) ────────────────────────────────────────────────────────
// Pulled out of the shared yantra viewBox 2026-08-23 (Chris: on desktop these
// should sit beside the yantra near the west/east gates with a heading above,
// not overlap its top corners; on mobile they belong below the yantra as a
// side-by-side row, not on top of it). Each panel gets its own tight-cropped
// viewBox (see NITYA_INSET_VIEWBOX/GURU_INSET_VIEWBOX in deityPositions.js)
// so it renders as a small standalone diagram rather than a fragment of the
// full 430×430 yantra space.
function InsetPanel({ heading, trikona, viewBox, insetDeities, pointFills, activeRegionId, onPick, reviewing, onHover, onLeave }) {
  if (insetDeities.length === 0) return null
  const trikonaPoints = `${trikona.apex.join(',')} ${trikona.baseL.join(',')} ${trikona.baseR.join(',')}`
  return (
    <div className="flex flex-col items-center gap-1.5 w-24 md:w-28 flex-shrink-0">
      <p className="text-[9px] md:text-sm uppercase tracking-widest md:tracking-wide text-muted font-mono text-center">{heading}</p>
      <svg
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
      >
        <polygon points={trikonaPoints} fill="none" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.6" />
        {insetDeities.map(d => {
          const pos = getPosition(d.id)
          const regionId = getRegionId(d)
          if (!pos || !regionId) return null
          const fill = pointFills[regionId] || CREAM
          // Kept small deliberately — the densest inset row (Guru-mānavaugha,
          // 8 dots across ~52 units) has center-to-center spacing of only
          // ~7.4 units, so anything approaching that in diameter overlaps its
          // neighbours (Chris's report, 2026-08-23, after the first live
          // screenshot showed exactly that at r=4.8/6).
          // Constant radius regardless of active/idle — sizing the active
          // (target) dot larger was a visual tell that gave away the answer
          // before the tap, since its fill colour is identical CREAM to every
          // other not-yet-answered dot in scope (Chris's report, 2026-08-25).
          const r = 2.5
          return (
            <circle
              key={d.id}
              cx={pos.x} cy={pos.y} r={r}
              fill={fill} stroke={GOLD} strokeWidth="0.6"
              style={{ cursor: 'pointer' }}
              onClick={() => onPick(regionId)}
              onMouseEnter={() => reviewing && onHover && onHover(regionId)}
              onMouseLeave={() => reviewing && onLeave && onLeave()}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────
export default function LocateDrillView({
  script = 'iast', scope = 'all', limit = null, timerSeconds = null,
  onProgressSync, onUpdateStats, tr = k => k,
}) {
  const [queue,       setQueue]       = useState(() => buildQueue(scope, limit))
  const [idx,         setIdx]         = useState(0)
  const [results,     setResults]     = useState({})   // queueItem.id -> 'correct'|'wrong'|'timeout'
  const [flash,       setFlash]       = useState(null)  // 'correct'|'wrong'|'timeout'|null
  const [streak,      setStreak]      = useState(0)
  const [bestStreakThisRound, setBestStreakThisRound] = useState(0)
  const [timeLeft,    setTimeLeft]    = useState(timerSeconds)
  const [roundStart,  setRoundStart]  = useState(() => Date.now())
  const [elapsedMs,   setElapsedMs]   = useState(null)
  const [newStreak,   setNewStreak]   = useState(false)
  const [newTime,     setNewTime]     = useState(false)
  // Undo (Chris, 2026-08-25: "it's easy to click the wrong thing by mistake").
  // history is an ordered stack of just-enough-to-revert snapshots, pushed
  // once per advance() call — see advance() below. undoCount is a simple
  // running tally shown on the completion page; it is *not* decremented by
  // undoing further (it's a "how many mistakes did you correct" stat, not a
  // remaining-uses counter — undo is uncapped for the whole round).
  const [history,     setHistory]     = useState([])   // [{id, result, prevStreak, prevBestStreakThisRound}]
  const [undoCount,   setUndoCount]   = useState(0)
  // Review incorrect (Chris, 2026-08-25): shows the finished yantra with
  // hover tooltips on the gold (wrong) regions. reviewHoverId tracks
  // whichever region/dot the pointer is currently over.
  const [reviewing,      setReviewing]      = useState(false)
  const [reviewHoverId,  setReviewHoverId]  = useState(null)
  const timerRef     = useRef(null)
  const roundLoggedRef = useRef(false)

  const total   = queue.length
  const done    = idx >= total
  const current = !done ? (queue[idx] ?? null) : null   // queue item — see buildQueue()
  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length
  const timeouts = Object.values(results).filter(v => v === 'timeout').length

  const best = useMemo(() => loadBest(scope, limit), [scope, limit])

  // Reset round when scope/limit changes
  useEffect(() => {
    const q = buildQueue(scope, limit)
    setQueue(q)
    setIdx(0)
    setResults({})
    setFlash(null)
    setStreak(0)
    setBestStreakThisRound(0)
    setTimeLeft(timerSeconds)
    setRoundStart(Date.now())
    setElapsedMs(null)
    setNewStreak(false)
    setNewTime(false)
    setHistory([])
    setUndoCount(0)
    setReviewing(false)
    setReviewHoverId(null)
    roundLoggedRef.current = false
  }, [scope, limit]) // eslint-disable-line

  // Timer default changing mid-round only affects the *next* deity, not silently
  // truncating whatever's already counting down.
  useEffect(() => { if (idx === 0 && !done) setTimeLeft(timerSeconds) }, [timerSeconds]) // eslint-disable-line

  // Completes the current queue item with a final verdict, logs history,
  // advances to the next item. Paired deities (see PAIR_LOCATIONS) are just
  // two ordinary items placed back to back by buildQueue() — nothing here
  // needs to know pairing exists.
  const advance = useCallback((result) => {
    if (!current || done || flash) return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    const itemId = current.id
    setResults(prev => ({ ...prev, [itemId]: result }))
    const d = deityById[itemId]
    const memoKey = sectionIdToMemoKey(d.sectionId)
    // Note (2026-08-25): this write to the Memory Map / Activity Log history
    // is deliberately NOT reverted by undo below — undo only rewinds this
    // round's own tally/position, it doesn't retract the historical record
    // that an attempt happened. Reverting it would need a new "unrecord"
    // primitive that doesn't exist elsewhere in the app; not worth adding for
    // what's fundamentally a "let me retry that click" convenience.
    if (memoKey) recordHistoryEntry(memoKey, d.sequenceInSection, result === 'correct' ? 'correct' : 'wrong', 'drill')
    setFlash(result)
    setStreak(s => {
      const next = result === 'correct' ? s + 1 : 0
      setBestStreakThisRound(b => {
        // Snapshot everything undoLast() needs to fully reverse this answer,
        // captured here (inside the streak/best-streak updaters) so it's
        // built from the actual pre-mutation values, not a possibly-stale
        // closure over the `streak`/`bestStreakThisRound` state variables.
        setHistory(h => [...h, { id: itemId, result, prevStreak: s, prevBestStreakThisRound: b }])
        return Math.max(b, next)
      })
      return next
    })
    setTimeout(() => {
      setFlash(null)
      setIdx(i => i + 1)
      setTimeLeft(timerSeconds)
    }, 380)
  }, [current, done, flash, timerSeconds])

  // Undo the most recent answer — rewinds idx, drops its result, restores
  // streak/bestStreakThisRound to what they were before that answer, and
  // resets the per-deity timer for the re-presented question (handled by the
  // countdown effect above, which reruns whenever idx changes). Uncapped for
  // the round; blocked mid-flash so it can't race the 380ms auto-advance.
  const undoLast = useCallback(() => {
    if (history.length === 0 || flash) return
    const last = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setResults(prev => {
      const next = { ...prev }
      delete next[last.id]
      return next
    })
    setStreak(last.prevStreak)
    setBestStreakThisRound(last.prevBestStreakThisRound)
    setUndoCount(c => c + 1)
    setIdx(i => Math.max(0, i - 1))
  }, [history, flash])

  // Per-deity countdown.
  useEffect(() => {
    if (done || flash || timerSeconds == null || current == null) return
    setTimeLeft(timerSeconds)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          advance('timeout')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  }, [idx, done, timerSeconds]) // eslint-disable-line

  // Sync progress to right panel
  useEffect(() => {
    if (onProgressSync) onProgressSync({ idx, total, correct, wrong, timeouts, streak, timeLeft, timerSeconds })
  }, [idx, total, correct, wrong, timeouts, streak, timeLeft, timerSeconds, onProgressSync])

  // On completion: compute elapsed time, check/save records, log stats once
  useEffect(() => {
    if (!done || total === 0 || roundLoggedRef.current) return
    roundLoggedRef.current = true
    const ms = Date.now() - roundStart
    setElapsedMs(ms)
    const isNewStreak = bestStreakThisRound > best.bestStreak
    const isNewTime   = best.bestTimeMs == null || ms < best.bestTimeMs
    setNewStreak(isNewStreak)
    setNewTime(isNewTime)
    saveBest(scope, limit, {
      bestStreak: Math.max(bestStreakThisRound, best.bestStreak),
      bestTimeMs: isNewTime ? ms : best.bestTimeMs,
    })
    if (onUpdateStats) onUpdateStats(correct, total, timeouts, ms)
  }, [done]) // eslint-disable-line

  const startNewRound = useCallback(() => {
    const q = buildQueue(scope, limit)
    setQueue(q)
    setIdx(0)
    setResults({})
    setFlash(null)
    setStreak(0)
    setBestStreakThisRound(0)
    setTimeLeft(timerSeconds)
    setRoundStart(Date.now())
    setElapsedMs(null)
    setNewStreak(false)
    setNewTime(false)
    setHistory([])
    setUndoCount(0)
    setReviewing(false)
    setReviewHoverId(null)
    roundLoggedRef.current = false
  }, [scope, limit, timerSeconds])

  // ── Click handling ────────────────────────────────────────────────────
  // All circuits (1–9) go through the same region-id space.
  const handleAnswer = useCallback((clickedId) => {
    if (!current || done || flash) return
    // Astradēvī has 4 valid click targets, not one — any of the 4 gate tips
    // counts as correct (Chris, 2026-08-23: "the 4 astradevi dots need to be
    // treated as one deity").
    const isCorrect = current.id === 'nyasa-006'
      ? ASTRA_REGION_IDS.includes(clickedId)
      : clickedId === getRegionId(deityById[current.id])
    advance(isCorrect ? 'correct' : 'wrong')
  }, [current, done, flash, advance])

  // In-scope region ids get a baseline fill + click handler; out-of-scope
  // regions stay untouched (no fill; clicks on them are no-ops below).
  const scopeDeities = scope === 'all' ? positionedDeities : positionedDeities.filter(d => matchesScope(d, scope))
  const hasAstra = scopeDeities.some(d => d.id === 'nyasa-006')
  const scopeRegionIds = new Set(scopeDeities.map(getRegionId).filter(Boolean))
  if (hasAstra) ASTRA_REGION_IDS.forEach(id => scopeRegionIds.add(id))

  // Colour for an answered region's outcome
  const outcomeColour = v => v === 'correct' ? RED : v === 'wrong' ? GOLD : v === 'timeout' ? TERRACOTTA : CREAM

  // Point-section region ids (Circuit 1/8/9) never get a colour fed to
  // SriYantraSVG — if they did, its own native markers (r=8) would paint a
  // visible ring behind this file's smaller overlay dots (Chris's report,
  // 2026-08-23: "large dots around the bhupura"). They stay in `filledRegions`
  // implicitly-transparent so SriYantraSVG's click handling (and its bigger
  // hit area for Circuit 1's native bhupura markers) keeps working as an
  // invisible fallback tap-area — only `pointFills` drives what's actually
  // painted for them, via this file's own overlay below.
  const pointRegionIds = new Set(
    scopeDeities.filter(d => POINT_SECTIONS.has(d.sectionId)).map(getRegionId).filter(Boolean)
  )
  if (hasAstra) ASTRA_REGION_IDS.forEach(id => pointRegionIds.add(id))
  const filledRegions = {}   // passed to SriYantraSVG — Circuit 2–7 shapes only
  const pointFills = {}      // used only by this file's own point-dot overlay
  const setFill = (id, colour) => {
    if (!id) return
    if (pointRegionIds.has(id)) pointFills[id] = colour
    else filledRegions[id] = colour
  }

  scopeRegionIds.forEach(id => setFill(id, CREAM))
  Object.entries(results).forEach(([id, verdict]) => {
    // Astradēvī's 4 gate-tip dots all share her one result — clicking any of
    // them advances/scores as a single deity (see handleAnswer above).
    if (id === 'nyasa-006') { ASTRA_REGION_IDS.forEach(rid => setFill(rid, outcomeColour(verdict))); return }
    setFill(getRegionId(deityById[id]), outcomeColour(verdict))
  })

  // The single region id currently awaiting a click — used both for the
  // main fill colour and to decide which point-dot (if any) renders larger.
  // activeAstraIds mirrors this for Astradēvī's 4 simultaneous targets.
  let activeRegionId = null
  let activeAstraIds = null
  if (!done && current) {
    if (current.id === 'nyasa-006') {
      activeAstraIds = ASTRA_REGION_IDS
      const colour = flash ? outcomeColour(flash) : CREAM
      ASTRA_REGION_IDS.forEach(rid => setFill(rid, colour))
    } else {
      activeRegionId = getRegionId(deityById[current.id])
      setFill(activeRegionId, flash ? outcomeColour(flash) : CREAM)
    }
  }

  const handleRegionClick = useCallback((id) => {
    if (!scopeRegionIds.has(id)) return
    handleAnswer(id)
  }, [scopeRegionIds, handleAnswer])

  // (x2) badge and the outer/inner instruction only make sense in the 'all'
  // scope — that's the only scope where buildQueue() actually places both
  // halves of a pair back to back (see comment there). In a single-section
  // scope only one half is ever in the pool at all, so its partner never
  // appears nearby and the "sequential pair" framing would be misleading
  // (Chris, 2026-08-23: "not relevant if only one section filter applied").
  const showPairUi = scope === 'all'
  const name = current
    ? locateLabel(deityById[current.id], script) + (showPairUi && ALL_PAIR_IDS.has(current.id) ? ` ${tr('locate.pair_suffix')}` : '')
    : ''

  // Circuits 1/8/9 render as small individual dots on their own overlay
  // (matching Segment/Line Drill's dot sizing — Chris's request, 2026-08-23)
  // rather than through SriYantraSVG's filled-shape regions. SriYantraSVG's
  // own onRegionClick stays active underneath (it still handles C2–C7
  // triangles/petals, and for Circuit 1 specifically its native r=8 bhupura
  // markers give a generous fallback tap-area around each small dot — the
  // same hybrid pattern SegmentDrillView/LineDrillView already use).
  const pointDeities = scopeDeities.filter(d => POINT_SECTIONS.has(d.sectionId))
  // Nitya/Guru render in their own standalone InsetPanel now (see below) —
  // split them out of the main yantra overlay's point-dot list so they don't
  // get drawn twice.
  const svgPointDeities = pointDeities.filter(d => !INSET_SECTIONS.has(d.sectionId))
  const nityaInsetDeities = pointDeities.filter(d => d.sectionId === 'nitya')
  const guruInsetDeities = pointDeities.filter(d => GURU_SECTIONS.has(d.sectionId))

  // ── Review incorrect (Chris, 2026-08-25) ────────────────────────────────
  // filledRegions/pointFills above already hold the round's final colours
  // once done===true (the "active" override block only runs when !done), so
  // review mode just re-renders the same yantra with those colours and adds
  // hover tooltips. deityByRegionId is the reverse of getRegionId(), used to
  // resolve a hovered region back to "which deity actually lives here" —
  // only shown when that region's fill is GOLD (wrong), per Chris's request.
  const canReview = done && (wrong > 0 || timeouts > 0)
  const deityByRegionId = {}
  scopeDeities.forEach(d => {
    const rid = getRegionId(d)
    if (rid) deityByRegionId[rid] = d
  })
  if (hasAstra) ASTRA_REGION_IDS.forEach(id => { deityByRegionId[id] = deityById['nyasa-006'] })
  const reviewHoverFill = reviewHoverId ? (pointFills[reviewHoverId] ?? filledRegions[reviewHoverId]) : null
  const reviewHoverDeity = reviewing && reviewHoverFill === GOLD ? deityByRegionId[reviewHoverId] : null
  const reviewHoverName = reviewHoverDeity ? locateLabel(reviewHoverDeity, script) : null

  return (
    <div className="w-full p-4 flex flex-col gap-3">
      {(!done || reviewing) && (
        <>
          {done && reviewing ? (
            /* Review incorrect (Chris, 2026-08-25): replaces the prompt with a
               reviewing header + hover readout, since there's no "current"
               question any more — the round is over, this is just a look back
               at the finished yantra. */
            <div className="text-center py-2">
              <p className="text-muted text-[10px] uppercase tracking-widest mb-1">{tr('locate.reviewing_incorrect')}</p>
              <p className="text-cream text-xl leading-snug min-h-[1.75rem]">
                {reviewHoverName
                  ? <span className="iast">{reviewHoverName}</span>
                  : <span className="text-muted text-sm">{tr('locate.review_hint')}</span>}
              </p>
              <button
                onClick={() => { setReviewing(false); setReviewHoverId(null) }}
                className="mt-2 px-4 py-1.5 bg-black/20 border border-gold-700/50 text-gold-300 rounded-lg text-xs hover:bg-black/30 transition-colors"
              >
                {tr('btn.back_to_results')}
              </button>
            </div>
          ) : (
            /* Prompt — the deity name to find. Never shown on the diagram itself. */
            <div className="text-center py-2">
              <p className="text-muted text-[10px] uppercase tracking-widest mb-1">{tr('locate.find_this')}</p>
              <p className="iast text-cream text-xl leading-snug">{name}</p>
              {current && showPairUi && PAIR_BY_OUTER.has(current.id) && (
                <p className="mt-1 text-[11px]" style={{ color: 'rgba(201,168,76,0.75)' }}>
                  {tr('locate.tap_outer')}
                </p>
              )}
              {current && showPairUi && INNER_IDS.has(current.id) && (
                <p className="mt-1 text-[11px]" style={{ color: 'rgba(201,168,76,0.75)' }}>
                  {tr('locate.tap_inner')}
                </p>
              )}
              {timerSeconds != null && (
                <p className="mt-1 text-sm font-mono" style={{ color: timeLeft <= 2 ? TERRACOTTA : 'rgba(201,168,76,0.7)' }}>
                  {timeLeft}s
                </p>
              )}
              {/* Undo (Chris, 2026-08-25): only meaningful mid-round, only once
                  at least one answer has been given, disabled during the brief
                  outcome flash so it can't race the auto-advance. */}
              {history.length > 0 && (
                <button
                  onClick={undoLast}
                  disabled={!!flash}
                  className="mt-2 px-3 py-1 bg-black/20 border border-gold-700/40 text-gold-300 rounded-lg text-[11px] hover:bg-black/30 transition-colors disabled:opacity-40"
                >
                  ↺ {tr('btn.undo')}
                </button>
              )}
            </div>
          )}

          {/* Desktop: Nitya/Guru insets flank the yantra beside the west/east
              gates, each with a heading above. Mobile: hidden here — they
              render instead as a side-by-side row below the yantra (Chris's
              spec, 2026-08-23) so they never overlap the diagram on a narrow
              screen. Wrapped in md:items-center so the panels vertically
              centre against the yantra square rather than top-aligning.
              md:justify-center + an explicit width cap on the yantra square
              below (matching every other tab's normal size, not the widened
              column) — the column was widened in App.jsx purely to make room
              for the insets; without the explicit cap the yantra itself
              greedily grew to fill that extra width via flex-1, which just
              inflated the built-in blank margin above the gates into a big
              empty-looking gap under the prompt text (Chris's report,
              2026-08-23 screenshot). Capped + centred instead. */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-center md:gap-4">
            <InsetPanel
              heading={tr('locate.inset_heading_nitya')}
              trikona={NITYA_TRIKONA}
              viewBox={NITYA_INSET_VIEWBOX}
              insetDeities={nityaInsetDeities}
              pointFills={pointFills}
              activeRegionId={activeRegionId}
              onPick={handleAnswer}
              reviewing={reviewing}
              onHover={setReviewHoverId}
              onLeave={() => setReviewHoverId(null)}
            />

            <div
              className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/60"
              style={{ width: 'min(100%, calc(100dvh - 120px))', aspectRatio: '1 / 1', WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
              {/* Reverted to an uncropped square, 2026-08-23 — two crop attempts
                  (20%, then 15%) both cut into the actual north-gate artwork
                  per Chris's screenshots. Checked the real geometry afterwards:
                  BHUPURA_OUTER_PTS's topmost point is y=63.67 against a
                  viewBox top of y=55 — only a ~2% margin, not enough to
                  meaningfully crop without immediately cutting into the gate.
                  Whatever produced the visual impression of a large gap isn't
                  margin inside this SVG, so guessing at a crop percentage
                  further isn't the right tool here; every other tab in the
                  app renders this same viewBox uncropped. */}
              <div className="absolute left-0 right-0 bottom-0 w-full" style={{ aspectRatio: '1 / 1' }}>
                <SriYantraSVG
                  className="w-full h-full"
                  showTriangles={true}
                  showLabels={false}
                  showNumbers={false}
                  filledRegions={filledRegions}
                  onRegionClick={handleRegionClick}
                  onRegionHover={reviewing ? setReviewHoverId : undefined}
                  onRegionLeave={reviewing ? () => setReviewHoverId(null) : undefined}
                  binduR={0.8}
                />
                {/* pointerEvents: 'none' on the root is deliberate — this overlay only
                    ever paints a handful of small circles, and without this the
                    "empty" 90%+ of its full-canvas bounding box can still swallow
                    clicks meant for the petals/triangles rendered underneath by
                    SriYantraSVG (confirmed by Chris, 2026-08-23: Circuit 3 petals
                    stopped responding once this overlay came back for smaller C1/8/9
                    dots — same failure mode as the original click bug earlier this
                    session, this time fixed properly instead of by elimination).
                    Each circle re-enables its own events explicitly. Nitya/Guru no
                    longer render here — see the standalone InsetPanel above/below. */}
                <svg
                  viewBox="45 55 430 430"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 w-full h-full"
                  style={{ background: 'transparent', pointerEvents: 'none' }}
                >
                  {svgPointDeities.map(d => {
                    const pos = getPosition(d.id)
                    const regionId = getRegionId(d)
                    if (!pos || !regionId) return null
                    const fill = pointFills[regionId] || CREAM
                    // Nētradēvī (nyasa seq 5) shares C9's own bindu position —
                    // Chris, 2026-08-23: render her as a larger, transparent
                    // ring there instead of a normal opaque dot, so she reads
                    // as a distinct clickable target without visually replacing
                    // C9's own marker underneath.
                    const isNetraBindu = d.sectionId === 'nyasa' && d.sequenceInSection === 5
                    // r 5 fits inside the true central trikona (~23 units
                    // wide — apex/baseL/baseR from KORVIN_CENTRAL_RAW) with
                    // margin to spare; the original 9/11 was nearly half the
                    // triangle's own width and spilled outside it (Chris's
                    // report, 2026-08-23).
                    // Constant radius regardless of active/idle — sizing the
                    // active (target) dot larger was a visual tell that gave
                    // away the answer before the tap, since its fill colour is
                    // identical CREAM to every other not-yet-answered dot in
                    // scope (Chris's report, 2026-08-25).
                    const r = isNetraBindu ? 5 : 3.2
                    const fillOpacity = isNetraBindu ? 0.35 : 1
                    return (
                      <circle
                        key={d.id}
                        cx={pos.x} cy={pos.y} r={r}
                        fill={fill} fillOpacity={fillOpacity} stroke={GOLD} strokeWidth="0.6"
                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                        onClick={() => handleAnswer(regionId)}
                        onMouseEnter={() => reviewing && setReviewHoverId(regionId)}
                        onMouseLeave={() => reviewing && setReviewHoverId(null)}
                      />
                    )
                  })}
                  {/* Astradēvī — 4 gate-tip dots, all one deity (see
                      ASTRA_POSITIONS/ASTRA_REGION_IDS above). */}
                  {hasAstra && ASTRA_POSITIONS.map((pos, i) => {
                    const regionId = ASTRA_REGION_IDS[i]
                    const fill = pointFills[regionId] || CREAM
                    return (
                      <circle
                        key={regionId}
                        cx={pos.x} cy={pos.y} r={3.2}
                        fill={fill} stroke={GOLD} strokeWidth="0.6"
                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                        onClick={() => handleAnswer(regionId)}
                        onMouseEnter={() => reviewing && setReviewHoverId(regionId)}
                        onMouseLeave={() => reviewing && setReviewHoverId(null)}
                      />
                    )
                  })}
                </svg>
              </div>
            </div>

            <InsetPanel
              heading={tr('locate.inset_heading_gurus')}
              trikona={GURU_TRIKONA}
              viewBox={GURU_INSET_VIEWBOX}
              insetDeities={guruInsetDeities}
              pointFills={pointFills}
              activeRegionId={activeRegionId}
              onPick={handleAnswer}
              reviewing={reviewing}
              onHover={setReviewHoverId}
              onLeave={() => setReviewHoverId(null)}
            />
          </div>

          {/* Mobile: yantra alone, full width, insets never overlap it here. */}
          <div
            className="md:hidden relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
            style={{ paddingBottom: '100%', WebkitTouchCallout: 'none', userSelect: 'none' }}
          >
            <div className="absolute inset-0">
              <SriYantraSVG
                className="w-full h-full"
                showTriangles={true}
                showLabels={false}
                showNumbers={false}
                filledRegions={filledRegions}
                onRegionClick={handleRegionClick}
                onRegionHover={reviewing ? setReviewHoverId : undefined}
                onRegionLeave={reviewing ? () => setReviewHoverId(null) : undefined}
                binduR={0.8}
              />
              <svg
                viewBox="45 55 430 430"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full"
                style={{ background: 'transparent', pointerEvents: 'none' }}
              >
                {svgPointDeities.map(d => {
                  const pos = getPosition(d.id)
                  const regionId = getRegionId(d)
                  if (!pos || !regionId) return null
                  const fill = pointFills[regionId] || CREAM
                  const isNetraBindu = d.sectionId === 'nyasa' && d.sequenceInSection === 5
                  // Constant radius regardless of active/idle — see desktop
                  // copy above for why (Chris's report, 2026-08-25).
                  const r = isNetraBindu ? 5 : 3.2
                  const fillOpacity = isNetraBindu ? 0.35 : 1
                  return (
                    <circle
                      key={d.id}
                      cx={pos.x} cy={pos.y} r={r}
                      fill={fill} fillOpacity={fillOpacity} stroke={GOLD} strokeWidth="0.6"
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onClick={() => handleAnswer(regionId)}
                      onMouseEnter={() => reviewing && setReviewHoverId(regionId)}
                      onMouseLeave={() => reviewing && setReviewHoverId(null)}
                    />
                  )
                })}
                {hasAstra && ASTRA_POSITIONS.map((pos, i) => {
                  const regionId = ASTRA_REGION_IDS[i]
                  const fill = pointFills[regionId] || CREAM
                  return (
                    <circle
                      key={regionId}
                      cx={pos.x} cy={pos.y} r={3.2}
                      fill={fill} stroke={GOLD} strokeWidth="0.6"
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onClick={() => handleAnswer(regionId)}
                      onMouseEnter={() => reviewing && setReviewHoverId(regionId)}
                      onMouseLeave={() => reviewing && setReviewHoverId(null)}
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Mobile: Nitya + Guru side by side below the yantra. */}
          <div className="md:hidden flex flex-row gap-3 justify-center">
            <InsetPanel
              heading={tr('locate.inset_heading_nitya')}
              trikona={NITYA_TRIKONA}
              viewBox={NITYA_INSET_VIEWBOX}
              insetDeities={nityaInsetDeities}
              pointFills={pointFills}
              activeRegionId={activeRegionId}
              onPick={handleAnswer}
              reviewing={reviewing}
              onHover={setReviewHoverId}
              onLeave={() => setReviewHoverId(null)}
            />
            <InsetPanel
              heading={tr('locate.inset_heading_gurus')}
              trikona={GURU_TRIKONA}
              viewBox={GURU_INSET_VIEWBOX}
              insetDeities={guruInsetDeities}
              pointFills={pointFills}
              activeRegionId={activeRegionId}
              onPick={handleAnswer}
              reviewing={reviewing}
              onHover={setReviewHoverId}
              onLeave={() => setReviewHoverId(null)}
            />
          </div>

          <p className="md:hidden text-center text-[11px]" style={{ color: 'rgba(201,168,76,0.55)' }}>
            {tr('locate.tap_hint')}
          </p>
        </>
      )}

      {done && !reviewing && (
        <CompletionOverlay
          correct={correct} total={total} timeouts={timeouts}
          streak={bestStreakThisRound} best={best} elapsedMs={elapsedMs}
          isNewStreak={newStreak} isNewTime={newTime}
          undoCount={undoCount} canReview={canReview} onReview={() => setReviewing(true)}
          onRestart={startNewRound} tr={tr}
        />
      )}
    </div>
  )
}
