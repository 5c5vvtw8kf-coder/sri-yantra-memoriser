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
import { getPosition, DEITY_POSITIONS } from '../deityPositions.js'
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
const positionedDeities = deities.filter(d => DEITY_POSITIONS[d.id] != null && d.role === 'deity')

// Sections rendered as small individual dots (own overlay, see render below)
// rather than through SriYantraSVG's filled petal/triangle regions.
const POINT_SECTIONS = new Set(['circuit-1', 'circuit-8', 'circuit-9'])

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
const PAIR_LOCATIONS = [
  ['c1-mudra-001', 'c4-001'],  // Sarvasaṅkṣōbhiṇī
  ['c1-mudra-002', 'c4-002'],  // Sarvavidrāviṇī
  ['c1-mudra-003', 'c4-003'],  // Sarvākarṣiṇī
  ['c1-mudra-004', 'c4-008'],  // Sarvavaśaṅkarī
  ['c1-mudra-005', 'c4-010'],  // Sarvōnmādinī
]
const PAIR_BY_OUTER = new Map(PAIR_LOCATIONS)
const INNER_IDS = new Set(PAIR_LOCATIONS.map(([, innerId]) => innerId))

export const LOCATE_SCOPES = [
  { id: 'circuit-1', label: '1st', trKey: 'av.1' },
  { id: 'circuit-2', label: '2nd', trKey: 'av.2' },
  { id: 'circuit-3', label: '3rd', trKey: 'av.3' },
  { id: 'circuit-4', label: '4th', trKey: 'av.4' },
  { id: 'circuit-5', label: '5th', trKey: 'av.5' },
  { id: 'circuit-6', label: '6th', trKey: 'av.6' },
  { id: 'circuit-7', label: '7th', trKey: 'av.7' },
  { id: 'circuit-8', label: '8th', trKey: 'av.8' },
  { id: 'circuit-9', label: '9th', trKey: 'av.9' },
  { id: 'all',       label: 'All', trKey: 'misc.all' },
]

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
    ids = shuffle(positionedDeities.filter(d => d.sectionId === scope).map(d => d.id))
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
function CompletionOverlay({ correct, total, timeouts, streak, best, elapsedMs, isNewStreak, isNewTime, onRestart, tr }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const fmtTime = ms => ms == null ? '—' : `${(ms / 1000).toFixed(1)}s`
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
      <button
        onClick={onRestart}
        className="px-5 py-2 bg-gold-800/40 border border-gold-700/50 text-gold-300 rounded-lg text-sm hover:bg-gold-800/60 transition-colors"
      >
        {tr('btn.new_round')}
      </button>
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
    setResults(prev => ({ ...prev, [current.id]: result }))
    const d = deityById[current.id]
    const memoKey = sectionIdToMemoKey(d.sectionId)
    if (memoKey) recordHistoryEntry(memoKey, d.sequenceInSection, result === 'correct' ? 'correct' : 'wrong', 'drill')
    setFlash(result)
    setStreak(s => {
      const next = result === 'correct' ? s + 1 : 0
      setBestStreakThisRound(b => Math.max(b, next))
      return next
    })
    setTimeout(() => {
      setFlash(null)
      setIdx(i => i + 1)
      setTimeLeft(timerSeconds)
    }, 380)
  }, [current, done, flash, timerSeconds])

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
    roundLoggedRef.current = false
  }, [scope, limit, timerSeconds])

  // ── Click handling ────────────────────────────────────────────────────
  // All circuits (1–9) go through the same region-id space.
  const handleAnswer = useCallback((clickedId) => {
    if (!current || done || flash) return
    const target = getRegionId(deityById[current.id])
    advance(clickedId === target ? 'correct' : 'wrong')
  }, [current, done, flash, advance])

  // In-scope region ids get a baseline fill + click handler; out-of-scope
  // regions stay untouched (no fill; clicks on them are no-ops below).
  const scopeDeities = scope === 'all' ? positionedDeities : positionedDeities.filter(d => d.sectionId === scope)
  const scopeRegionIds = new Set(scopeDeities.map(getRegionId).filter(Boolean))

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
  const filledRegions = {}   // passed to SriYantraSVG — Circuit 2–7 shapes only
  const pointFills = {}      // used only by this file's own point-dot overlay
  const setFill = (id, colour) => {
    if (!id) return
    if (pointRegionIds.has(id)) pointFills[id] = colour
    else filledRegions[id] = colour
  }

  scopeRegionIds.forEach(id => setFill(id, CREAM))
  Object.entries(results).forEach(([id, verdict]) => {
    setFill(getRegionId(deityById[id]), outcomeColour(verdict))
  })

  // The single region id currently awaiting a click — used both for the
  // main fill colour and to decide which point-dot (if any) renders larger.
  let activeRegionId = null
  if (!done && current) {
    activeRegionId = getRegionId(deityById[current.id])
    setFill(activeRegionId, flash ? outcomeColour(flash) : CREAM)
  }

  const handleRegionClick = useCallback((id) => {
    if (!scopeRegionIds.has(id)) return
    handleAnswer(id)
  }, [scopeRegionIds, handleAnswer])

  const name = current ? locateLabel(deityById[current.id], script) : ''

  // Circuits 1/8/9 render as small individual dots on their own overlay
  // (matching Segment/Line Drill's dot sizing — Chris's request, 2026-08-23)
  // rather than through SriYantraSVG's filled-shape regions. SriYantraSVG's
  // own onRegionClick stays active underneath (it still handles C2–C7
  // triangles/petals, and for Circuit 1 specifically its native r=8 bhupura
  // markers give a generous fallback tap-area around each small dot — the
  // same hybrid pattern SegmentDrillView/LineDrillView already use).
  const pointDeities = scopeDeities.filter(d => POINT_SECTIONS.has(d.sectionId))

  return (
    <div className="w-full p-4 flex flex-col gap-3">
      {!done && (
        <>
          {/* Prompt — the deity name to find. Never shown on the diagram itself. */}
          <div className="text-center py-2">
            <p className="text-muted text-[10px] uppercase tracking-widest mb-1">{tr('locate.find_this')}</p>
            <p className="iast text-cream text-xl leading-snug">{name}</p>
            {timerSeconds != null && (
              <p className="mt-1 text-sm font-mono" style={{ color: timeLeft <= 2 ? TERRACOTTA : 'rgba(201,168,76,0.7)' }}>
                {timeLeft}s
              </p>
            )}
          </div>

          <div
            className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
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
              />
              {/* pointerEvents: 'none' on the root is deliberate — this overlay only
                  ever paints a handful of small circles, and without this the
                  "empty" 90%+ of its full-canvas bounding box can still swallow
                  clicks meant for the petals/triangles rendered underneath by
                  SriYantraSVG (confirmed by Chris, 2026-08-23: Circuit 3 petals
                  stopped responding once this overlay came back for smaller C1/8/9
                  dots — same failure mode as the original click bug earlier this
                  session, this time fixed properly instead of by elimination).
                  Each circle re-enables its own events explicitly. */}
              <svg
                viewBox="45 55 430 430"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full"
                style={{ background: 'transparent', pointerEvents: 'none' }}
              >
                {pointDeities.map(d => {
                  const pos = getPosition(d.id)
                  const regionId = getRegionId(d)
                  if (!pos || !regionId) return null
                  const fill = pointFills[regionId] || CREAM
                  const isActive = regionId === activeRegionId
                  return (
                    <circle
                      key={d.id}
                      cx={pos.x} cy={pos.y} r={isActive ? 4 : 3.2}
                      fill={fill} stroke={GOLD} strokeWidth="0.6"
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onClick={() => handleAnswer(regionId)}
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          <p className="md:hidden text-center text-[11px]" style={{ color: 'rgba(201,168,76,0.55)' }}>
            {tr('locate.tap_hint')}
          </p>
        </>
      )}

      {done && (
        <CompletionOverlay
          correct={correct} total={total} timeouts={timeouts}
          streak={bestStreakThisRound} best={best} elapsedMs={elapsedMs}
          isNewStreak={newStreak} isNewTime={newTime}
          onRestart={startNewRound} tr={tr}
        />
      )}
    </div>
  )
}
