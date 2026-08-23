/**
 * LocateDrillView.jsx
 *
 * "Locate Drill" — Chris's wife's idea, 2026-08-23: a reverse Spot Check.
 * Spot Check shows a highlighted position and asks "what deity is this?";
 * Locate Drill shows a deity's name and asks "where does it live on the
 * yantra?" — the more direct test of the spatial knowledge this whole app
 * is built around.
 *
 * v1 scope (deliberate cut, not an oversight — see App.jsx wiring comment
 * and the roadmap memory note for 2026-08-23): circuits 1–7 only, i.e. the
 * same 102-deity positioned set SpotCheckView already uses for its own
 * spatial mode. Circuit 8/9 and the non-yantra preamble/lineage sections
 * (Nyāsa, Nitya, Guravaḥ, Nava Cakreśvarī, Chakreśvarī) are not included —
 * several of those have no real yantra position at all, and the rest would
 * each need their own bespoke click-target logic the way SpotCheckView
 * delegates to six dedicated sub-components for them. Building all of that
 * in one sitting wasn't a safe bet; this can grow later.
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

// Only circuit deities 1–7 with real yantra positions — see file header.
const positionedDeities = deities.filter(d =>
  DEITY_POSITIONS[d.id] != null && d.role === 'deity' &&
  d.sectionId !== 'circuit-8' && d.sectionId !== 'circuit-9'
)

const C4_DEITY_ORDER = [8, 7, 6, 5, 4, 3, 2, 1, 14, 13, 12, 11, 10, 9]
const C5_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C6_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C7_DEITY_ORDER = [5, 4, 3, 2, 1, 8, 7, 6]

function getRegionId(deity) {
  if (!deity || deity.role !== 'deity') return null
  const { sectionId, sequenceInSection: seq } = deity
  const pad = n => String(n).padStart(2, '0')
  // Circuit 1 uses SriYantraSVG's own bhupura dot markers (bhupura-01..29,
  // r=8, rendered + click-wired natively by SriYantraSVG itself) — the same
  // id space Explore/Memorise already key their C1 dots by. No separate
  // overlay needed; see the note above C1_DOTS' old home in git history for
  // why an earlier version of this file duplicated that rendering (it broke
  // clicks by sitting on top of it — fixed 2026-08-23).
  if (sectionId === 'circuit-1') return `bhupura-${pad(seq)}`
  if (sectionId === 'circuit-2') return `petal-c2-${pad(seq)}`
  if (sectionId === 'circuit-3') return `petal-c3-${pad(seq)}`
  if (sectionId === 'circuit-4') return `tri-c4-${pad(C4_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-5') return `tri-c5-${pad(C5_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-6') return `tri-c6-${pad(C6_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-7') return `tri-c7-${pad(C7_DEITY_ORDER[seq - 1])}`
  return null
}

// ── Outer/inner paired locations ────────────────────────────────────────
// Confirmed by Chris, 2026-08-23: a handful of deity names recur at two
// distinct positions in the yantra — once as a Circuit-1 Mudrā Śakti dot
// (the "outer" occurrence, since Circuit 1/bhupura is outermost) and again
// as the presiding deity of Circuit 4 (the "inner" occurrence). Confirmed
// exhaustively against the canonical 182-entry dataset — exactly 6 name
// duplicates exist in total, but only these 4 have BOTH occurrences inside
// Locate Drill's current circuits-1–7 scope (the other 2 — Kāmeśvarī,
// Mahāvajreśvarī — have their second occurrence in the Nitya/Circuit-8
// sections, which aren't in Locate Drill's yantra-position scope at all, so
// they behave as ordinary single-location entries here). Hardcoded by id
// (not matched by name at runtime) so a lineage edit to the displayed name
// can't silently break the pairing.
const PAIR_LOCATIONS = [
  ['c1-mudra-001', 'c4-001'],  // Sarvasaṅkṣōbhiṇī
  ['c1-mudra-003', 'c4-003'],  // Sarvākarṣiṇī
  ['c1-mudra-004', 'c4-008'],  // Sarvavaśaṅkarī
  ['c1-mudra-005', 'c4-010'],  // Sarvōnmādinī
]
const PAIR_BY_OUTER = new Map(PAIR_LOCATIONS)
const PAIRED_IDS = new Set(PAIR_LOCATIONS.flat())

export const LOCATE_SCOPES = [
  { id: 'circuit-1', label: '1st', trKey: 'av.1' },
  { id: 'circuit-2', label: '2nd', trKey: 'av.2' },
  { id: 'circuit-3', label: '3rd', trKey: 'av.3' },
  { id: 'circuit-4', label: '4th', trKey: 'av.4' },
  { id: 'circuit-5', label: '5th', trKey: 'av.5' },
  { id: 'circuit-6', label: '6th', trKey: 'av.6' },
  { id: 'circuit-7', label: '7th', trKey: 'av.7' },
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

// Queue items are `{ id, pair: false }` for an ordinary deity, or
// `{ id: 'pair:<outerId>', pair: true, outerId, innerId }` for one of the
// four outer/inner pairs — only ever produced when scope === 'all', since a
// single-circuit scope only ever has one half of a pair in play anyway.
function buildQueue(scope, limit) {
  let items
  if (scope === 'all') {
    const singles = positionedDeities
      .filter(d => !PAIRED_IDS.has(d.id))
      .map(d => ({ id: d.id, pair: false }))
    const pairs = PAIR_LOCATIONS.map(([outerId, innerId]) => ({
      id: `pair:${outerId}`, pair: true, outerId, innerId,
    }))
    items = [...singles, ...pairs]
  } else {
    items = positionedDeities.filter(d => d.sectionId === scope).map(d => ({ id: d.id, pair: false }))
  }
  const q = shuffle(items)
  return limit ? q.slice(0, limit) : q
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
  const [pairStage,   setPairStage]   = useState(0)   // 0 = outer click needed, 1 = inner click needed
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
    setPairStage(0)
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

  // Completes the current queue item (single deity or paired outer+inner)
  // with a final verdict, logs history, advances to the next item.
  const advance = useCallback((result) => {
    if (!current || done || flash) return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setResults(prev => ({ ...prev, [current.id]: result }))
    const logOne = d => {
      const memoKey = sectionIdToMemoKey(d.sectionId)
      if (memoKey) recordHistoryEntry(memoKey, d.sequenceInSection, result === 'correct' ? 'correct' : 'wrong', 'drill')
    }
    if (current.pair) {
      logOne(deityById[current.outerId])
      logOne(deityById[current.innerId])
    } else {
      logOne(deityById[current.id])
    }
    setFlash(result)
    setStreak(s => {
      const next = result === 'correct' ? s + 1 : 0
      setBestStreakThisRound(b => Math.max(b, next))
      return next
    })
    setTimeout(() => {
      setFlash(null)
      setIdx(i => i + 1)
      setPairStage(0)
      setTimeLeft(timerSeconds)
    }, 380)
  }, [current, done, flash, timerSeconds])

  // Per-deity countdown. Re-keyed on pairStage too, so the inner half of a
  // pair gets its own full countdown window rather than inheriting however
  // much time was left when the outer half was answered.
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
  }, [idx, pairStage, done, timerSeconds]) // eslint-disable-line

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
    setPairStage(0)
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
  // All circuits (1–7) now go through the same region-id space that
  // SriYantraSVG itself renders and click-wires — no separate overlay.
  // Paired items (outer + inner, see PAIR_LOCATIONS) need a second click:
  // a correct outer click advances the stage without ending the round item;
  // a wrong click at either stage ends it as 'wrong' immediately — there's
  // no partial credit for getting only one half of a pair right.
  const handleAnswer = useCallback((clickedId) => {
    if (!current || done || flash) return
    if (!current.pair) {
      const target = getRegionId(deityById[current.id])
      advance(clickedId === target ? 'correct' : 'wrong')
      return
    }
    if (pairStage === 0) {
      const target = getRegionId(deityById[current.outerId])
      if (clickedId !== target) { advance('wrong'); return }
      setPairStage(1)
      setFlash('correct')
      setTimeout(() => setFlash(null), 380)   // brief flash only — does not advance idx
    } else {
      const target = getRegionId(deityById[current.innerId])
      advance(clickedId === target ? 'correct' : 'wrong')
    }
  }, [current, done, flash, pairStage, advance])

  // In-scope region ids get a baseline fill + click handler; out-of-scope
  // regions stay untouched (no fill; clicks on them are no-ops below).
  const scopeDeities = scope === 'all' ? positionedDeities : positionedDeities.filter(d => d.sectionId === scope)
  const scopeRegionIds = new Set(scopeDeities.map(getRegionId).filter(Boolean))

  // Colour for an answered region's outcome
  const outcomeColour = v => v === 'correct' ? RED : v === 'wrong' ? GOLD : v === 'timeout' ? TERRACOTTA : CREAM

  const filledRegions = {}
  scopeRegionIds.forEach(id => { filledRegions[id] = CREAM })
  Object.entries(results).forEach(([key, verdict]) => {
    if (key.startsWith('pair:')) {
      const outerId = key.slice(5)
      const innerId = PAIR_BY_OUTER.get(outerId)
      const outerRegion = getRegionId(deityById[outerId])
      const innerRegion = getRegionId(deityById[innerId])
      if (outerRegion) filledRegions[outerRegion] = outcomeColour(verdict)
      if (innerRegion) filledRegions[innerRegion] = outcomeColour(verdict)
    } else {
      const regionId = getRegionId(deityById[key])
      if (regionId) filledRegions[regionId] = outcomeColour(verdict)
    }
  })
  if (!done && current) {
    if (current.pair) {
      const outerRegion = getRegionId(deityById[current.outerId])
      const innerRegion = getRegionId(deityById[current.innerId])
      if (pairStage === 0) {
        if (outerRegion) filledRegions[outerRegion] = flash ? outcomeColour(flash) : CREAM
      } else {
        if (outerRegion) filledRegions[outerRegion] = RED   // outer half already confirmed correct
        if (innerRegion) filledRegions[innerRegion] = flash ? outcomeColour(flash) : CREAM
      }
    } else {
      const activeRegion = getRegionId(deityById[current.id])
      if (activeRegion) filledRegions[activeRegion] = flash ? outcomeColour(flash) : CREAM
    }
  }

  const handleRegionClick = useCallback((id) => {
    if (!scopeRegionIds.has(id)) return
    handleAnswer(id)
  }, [scopeRegionIds, handleAnswer])

  const name = current
    ? locateLabel(deityById[current.pair ? current.outerId : current.id], script)
    : ''

  return (
    <div className="w-full p-4 flex flex-col gap-3">
      {!done && (
        <>
          {/* Prompt — the deity name to find. Never shown on the diagram itself. */}
          <div className="text-center py-2">
            <p className="text-muted text-[10px] uppercase tracking-widest mb-1">{tr('locate.find_this')}</p>
            <p className="iast text-cream text-xl leading-snug">{name}</p>
            {current?.pair && (
              <p className="mt-1 text-[11px]" style={{ color: 'rgba(201,168,76,0.75)' }}>
                {pairStage === 0 ? tr('locate.tap_outer') : tr('locate.tap_inner')}
              </p>
            )}
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
