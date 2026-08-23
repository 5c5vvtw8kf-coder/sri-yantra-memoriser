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
 *   unanswered / not-yet-reached → DIM_GOLD, same as everywhere else in the app
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
const DIM_GOLD   = 'rgba(201,168,76,0.35)'

export const LOCATE_TIMER_OPTIONS = [3, 5, 8, 13, null]   // Fibonacci seconds; null = off (default)

// ── C1 co-location (mirrors SpotCheckView.jsx's _posKeyDeities) ────────────
const _posKeyDeities = {}
deities.filter(d => d.sectionId === 'circuit-1' && d.role === 'deity').forEach(d => {
  const pos = getPosition(d.id)
  if (!pos) return
  const key = `${pos.x},${pos.y}`
  if (!_posKeyDeities[key]) _posKeyDeities[key] = []
  _posKeyDeities[key].push(d)
})
const C1_DOTS = Object.entries(_posKeyDeities).map(([key, group]) => ({
  key, pos: getPosition(group[0].id), deities: group,
}))

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
  if (sectionId === 'circuit-2') return `petal-c2-${pad(seq)}`
  if (sectionId === 'circuit-3') return `petal-c3-${pad(seq)}`
  if (sectionId === 'circuit-4') return `tri-c4-${pad(C4_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-5') return `tri-c5-${pad(C5_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-6') return `tri-c6-${pad(C6_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-7') return `tri-c7-${pad(C7_DEITY_ORDER[seq - 1])}`
  return null   // circuit-1: dot only, keyed by position instead — see answerKey()
}

// What must be clicked to be "correct" for a given deity — a region id for
// C2–C7, or a synthetic dot key for C1 (so co-located deities sharing one
// physical dot count each other as correct, matching Explore/Memorise/Spot
// Check's existing treatment of the same dots).
function answerKey(deity) {
  if (!deity) return null
  if (deity.sectionId === 'circuit-1') {
    const pos = getPosition(deity.id)
    return pos ? `dot:${pos.x},${pos.y}` : null
  }
  return getRegionId(deity)
}

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

function buildQueue(scope, limit) {
  const pool = scope === 'all' ? positionedDeities : positionedDeities.filter(d => d.sectionId === scope)
  const q = shuffle(pool.map(d => d.id))
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
  const [results,     setResults]     = useState({})   // deityId -> 'correct'|'wrong'|'timeout'
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
  const current = !done ? (deityById[queue[idx]] ?? null) : null
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

  const advance = useCallback((result) => {
    if (!current || done || flash) return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setResults(prev => ({ ...prev, [current.id]: result }))
    const memoKey = sectionIdToMemoKey(current.sectionId)
    if (memoKey) recordHistoryEntry(memoKey, current.sequenceInSection, result === 'correct' ? 'correct' : 'wrong', 'drill')
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

  // Per-deity countdown
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
  const handleAnswer = useCallback((clickedKey) => {
    if (!current || done || flash) return
    const target = answerKey(current)
    advance(clickedKey === target ? 'correct' : 'wrong')
  }, [current, done, flash, advance])

  // In-scope region ids (C2–C7) get a dim baseline fill + click handler;
  // out-of-scope regions stay untouched (no fill, no click).
  const scopeDeities = scope === 'all' ? positionedDeities : positionedDeities.filter(d => d.sectionId === scope)
  const scopeRegionIds = new Set(scopeDeities.map(getRegionId).filter(Boolean))
  const showC1 = scope === 'all' || scope === 'circuit-1'

  // Colour for an answered region/dot's outcome
  const outcomeColour = v => v === 'correct' ? RED : v === 'wrong' ? GOLD : v === 'timeout' ? TERRACOTTA : DIM_GOLD

  const filledRegions = {}
  scopeRegionIds.forEach(id => { filledRegions[id] = DIM_GOLD })
  Object.entries(results).forEach(([deityId, verdict]) => {
    const regionId = getRegionId(deityById[deityId])
    if (regionId) filledRegions[regionId] = outcomeColour(verdict)
  })
  if (!done && current) {
    const activeRegion = getRegionId(current)
    if (activeRegion) filledRegions[activeRegion] = flash ? outcomeColour(flash) : DIM_GOLD
  }

  // C1 dot outcomes (last answered deity sharing a dot wins, i.e. most recent)
  const dotOutcome = {}
  Object.entries(results).forEach(([deityId, verdict]) => {
    const d = deityById[deityId]
    if (d?.sectionId === 'circuit-1') {
      const pos = getPosition(d.id)
      if (pos) dotOutcome[`${pos.x},${pos.y}`] = verdict
    }
  })

  const handleRegionClick = useCallback((id) => {
    if (!scopeRegionIds.has(id)) return
    handleAnswer(id)
  }, [scopeRegionIds, handleAnswer])

  const name = current ? locateLabel(current, script) : ''

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
              {showC1 && (
                <svg
                  viewBox="45 55 430 430"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 w-full h-full"
                  style={{ background: 'transparent' }}
                >
                  {C1_DOTS.map(({ key, pos }) => {
                    if (!pos) return null
                    const isActiveDotKey = current?.sectionId === 'circuit-1' && answerKey(current) === `dot:${key}`
                    const outcome = dotOutcome[key]
                    const fill = isActiveDotKey && flash ? outcomeColour(flash)
                               : outcome ? outcomeColour(outcome)
                               : DIM_GOLD
                    return (
                      <circle key={key}
                        cx={pos.x.toFixed(1)} cy={pos.y.toFixed(1)} r={9}
                        fill={fill} stroke="none"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleAnswer(`dot:${key}`)} />
                    )
                  })}
                </svg>
              )}
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
