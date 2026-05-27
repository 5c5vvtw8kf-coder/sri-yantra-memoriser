/**
 * SpotCheckView.jsx
 *
 * Spot Check mode — yantra-based spatial drill across all 102 circuit deities.
 *
 * Active deity highlighting:
 *   C2-C3  — the petal fills bright
 *   C4-C8  — the triangle fills bright
 *   C9     — the bindu fills bright
 *   C1     — a dot (bhupura has no discrete region per deity)
 *
 * Controls (filter bar, progress, skip) live in the App right panel.
 * This component is responsible for the yantra + completion overlay only.
 *
 * Props:
 *   script          — active script ('iast'|'devanagari'|'telugu'|'tamil'|'english')
 *   filter          — controlled filter id (string)
 *   onProgressSync  — (stats: { idx, total, correct, wrong }) => void
 *   onRegisterSkip  — (skipFn: () => void) => void
 *   onUpdateStats   — (correct, total) => void  (end-of-round callback)
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { getPosition, DEITY_POSITIONS } from '../deityPositions.js'
import SriYantraSVG from './SriYantraSVG'

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

// Only circuit deities with yantra positions (102 total, C1-C9)
const positionedDeities = deities.filter(d =>
  DEITY_POSITIONS[d.id] != null &&
  d.sectionId !== 'circuit-8' &&
  d.sectionId !== 'circuit-9'
)

// ── Filter definitions (circuit-only — no preamble/nava/closing) ──────────────

// C8 and C9 share a single SVG region (the central triangle / bindu) so all
// deities within each circuit highlight the same shape — not useful for spatial
// recall. They'll get card-based spot-check views when their dedicated pages
// are built. Tithi Nitya and Guravah likewise need dedicated pages.
export const SC_FILTERS = [
  { id: 'all',       label: 'All', sectionIds: null },
  {
    id: 'circuit-1', label: '1st', sectionIds: ['circuit-1'],
    subFilters: [
      { id: 'c1-siddhi', label: 'Outer',  groupIds: ['siddhiShakti'] },
      { id: 'c1-ashta',  label: 'Middle', groupIds: ['ashtaMatrika'] },
      { id: 'c1-mudra',  label: 'Inner',  groupIds: ['mudraShakti'] },
      { id: 'c1-whole',  label: 'Whole',  groupIds: null },
    ],
  },
  { id: 'circuit-2', label: '2nd', sectionIds: ['circuit-2'] },
  { id: 'circuit-3', label: '3rd', sectionIds: ['circuit-3'] },
  { id: 'circuit-4', label: '4th', sectionIds: ['circuit-4'] },
  { id: 'circuit-5', label: '5th', sectionIds: ['circuit-5'] },
  { id: 'circuit-6', label: '6th', sectionIds: ['circuit-6'] },
  { id: 'circuit-7', label: '7th', sectionIds: ['circuit-7'] },
]

// ── Region-ID lookup ──────────────────────────────────────────────────────────

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
  if (sectionId === 'circuit-8') return 'tri-c8-01'
  if (sectionId === 'circuit-9') return 'c9'
  return null  // circuit-1: dot only
}

// ── Dynamic fill computation ──────────────────────────────────────────────────

const ACTIVE_FILL  = 'rgba(255,248,200,0.90)'
const ACTIVE_GREEN = 'rgba(74,222,128,0.90)'
const ACTIVE_RED   = 'rgba(248,113,113,0.80)'
const BG_DIM       = 'rgba(201,168,76,0.10)'
const BG_NORMAL    = 'rgba(201,168,76,0.80)'
const SEGMENT_GOLD   = 'rgba(201,168,76,0.55)'
const RESULT_GREEN   = 'rgba(74,222,128,0.55)'
const RESULT_RED     = 'rgba(248,113,113,0.45)'

// All SVG region IDs per circuit (for segment highlight)
const pad = n => String(n).padStart(2, '0')
const CIRCUIT_REGIONS = {
  'circuit-2': Array.from({ length: 16 }, (_, i) => `petal-c2-${pad(i+1)}`),
  'circuit-3': Array.from({ length:  8 }, (_, i) => `petal-c3-${pad(i+1)}`),
  'circuit-4': Array.from({ length: 14 }, (_, i) => `tri-c4-${pad(i+1)}`),
  'circuit-5': Array.from({ length: 10 }, (_, i) => `tri-c5-${pad(i+1)}`),
  'circuit-6': Array.from({ length: 10 }, (_, i) => `tri-c6-${pad(i+1)}`),
  'circuit-7': Array.from({ length:  8 }, (_, i) => `tri-c7-${pad(i+1)}`),
}

function computeFills(activeRegionId, flashState, filterId, results) {
  const segmentIds = filterId && filterId !== 'all' ? (CIRCUIT_REGIONS[filterId] ?? []) : []
  const bg = activeRegionId ? BG_DIM : BG_NORMAL
  const activeColor = flashState === 'correct' ? ACTIVE_GREEN
                    : flashState === 'wrong'   ? ACTIVE_RED
                    : ACTIVE_FILL

  const fills = {
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`petal-c3-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`tri-c7-${String(i+1).padStart(2,'0')}`, bg])),
    'tri-c8-01':    bg,
    'tri-c8-bg-01': '#0f0805',
    'tri-c8-bg-02': '#0f0805',
    'c9':           activeRegionId === 'c9' ? activeColor : '#000000',
  }

  // Segment gold for all non-answered regions in the active circuit filter
  segmentIds.forEach(id => {
    if (id !== activeRegionId) fills[id] = SEGMENT_GOLD
  })

  // Persistent result colours for answered regions (overrides segment gold)
  if (results) {
    Object.entries(results).forEach(([deityId, verdict]) => {
      const regionId = getRegionId(deityById[deityId])
      if (regionId && regionId !== activeRegionId) {
        fills[regionId] = verdict === 'correct' ? RESULT_GREEN : RESULT_RED
      }
    })
  }

  // Active region always on top
  if (activeRegionId && activeRegionId !== 'c9') {
    fills[activeRegionId] = activeColor
  }

  return fills
}

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD  = '#c9a84c'
const GREEN = '#4ade80'
const RED   = '#f87171'
const CY    = 270

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(filterId, subFilterId) {
  const filter = SC_FILTERS.find(f => f.id === filterId) ?? SC_FILTERS[0]
  let pool = filter.sectionIds
    ? positionedDeities.filter(d => filter.sectionIds.includes(d.sectionId))
    : positionedDeities
  if (subFilterId && filter.subFilters) {
    const sub = filter.subFilters.find(s => s.id === subFilterId)
    if (sub?.groupIds) pool = pool.filter(d => sub.groupIds.includes(d.group))
  }
  return shuffle(pool.map(d => d.id))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const charW    = script === 'devanagari' ? 14 : script === 'telugu' ? 16 : script === 'tamil' ? 17 : script === 'english' ? 11.5 : 10.5
  const fontSize = script === 'devanagari' ? 15 : script === 'english' ? 14 : 13
  const h = 30
  const w = Math.max(60, label.length * charW + 18)
  const tx = Math.min(Math.max(x, w / 2 + 49), 471 - w / 2)
  const ty = y > CY ? y - h / 2 - 18 : y + h / 2 + 18
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(15,8,5,0.93)" stroke={GOLD} strokeWidth={0.6}
      />
      <text
        x={tx.toFixed(1)} y={ty.toFixed(1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill={GOLD} fontFamily="serif"
      >
        {label}
      </text>
    </g>
  )
}

function CompletionOverlay({ correct, total, onRestart }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <p className="iast text-gold-400 text-lg">sarvam paripurnam</p>
      <p className="text-cream text-sm">Round complete</p>
      <div>
        <p className="text-4xl font-medium">
          <span className="text-green-400">{correct}</span>
          <span className="text-muted text-2xl">/{total}</span>
        </p>
        <p className="text-xs text-muted mt-1">{pct}% memorised</p>
      </div>
      <button
        onClick={onRestart}
        className="px-5 py-2 bg-gold-800/40 border border-gold-700/50 text-gold-300 rounded-lg text-sm hover:bg-gold-800/60 transition-colors"
      >
        New round
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpotCheckView({ script = 'iast', filter = 'all', subFilter = null, limit = null, onProgressSync, onRegisterSkip, onUpdateStats }) {
  const [queue,       setQueue]       = useState(() => { const q = buildQueue(filter, subFilter); return limit ? q.slice(0, limit) : q })
  const [idx,         setIdx]         = useState(0)
  const [results,     setResults]     = useState({})
  const [hovered,     setHovered]     = useState(false)
  const [flash,       setFlash]       = useState(null)
  const [prevResults, setPrevResults] = useState(null)
  const clickTimer = useRef(null)

  const total   = queue.length
  const done    = idx >= total
  const current = !done ? (deityById[queue[idx]] ?? null) : null
  const pos     = current ? getPosition(current.id) : null
  const hasPos  = pos != null

  const activeRegionId = current ? getRegionId(current) : null
  const hasRegion      = activeRegionId != null
  const showDot        = hasPos && !hasRegion   // C1 only

  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length

  const yantraFills = computeFills(activeRegionId, flash, filter, results)

  // Reset queue when filter or limit changes
  useEffect(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats) {
      onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
    }
    const q = buildQueue(filter, subFilter)
    setQueue(limit ? q.slice(0, limit) : q)
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
    setPrevResults(null)
  }, [filter, subFilter, limit]) // eslint-disable-line

  // Sync progress to right panel
  useEffect(() => {
    if (onProgressSync) {
      onProgressSync({ idx, total, correct, wrong })
    }
  }, [idx, total, correct, wrong, onProgressSync])

  // Clean up click timer
  useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current) }, [])

  const finishRound = useCallback(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0) {
      setPrevResults({ ...results })
      if (onUpdateStats) {
        onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
      }
    }
  }, [results, onUpdateStats])

  const startNewRound = useCallback(() => {
    finishRound()
    const q = buildQueue(filter, subFilter)
    setQueue(limit ? q.slice(0, limit) : q)
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
  }, [filter, subFilter, limit, finishRound])


  const advance = useCallback((result) => {
    if (!current || done) return
    setResults(prev => ({ ...prev, [current.id]: result }))
    setFlash(result)
    setTimeout(() => {
      setFlash(null)
      setHovered(false)
      setIdx(i => i + 1)
    }, 380)
  }, [current, done])

  const handleClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      advance('wrong')
    }, 260)
  }, [done, flash, advance])

  const handleDblClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    advance('correct')
  }, [done, flash, advance])

  const handleRightClick = useCallback((e, deityId) => {
    e.preventDefault()
    if (!results[deityId]) return
    setResults(prev => ({
      ...prev,
      [deityId]: prev[deityId] === 'correct' ? 'wrong' : 'correct',
    }))
  }, [results])

  const handleSkip = useCallback(() => {
    if (done || flash) return
    setHovered(false)
    setIdx(i => i + 1)
  }, [done, flash])

  // Register skip with parent (right panel skip button)
  useEffect(() => {
    if (onRegisterSkip) onRegisterSkip(handleSkip)
  }, [handleSkip, onRegisterSkip])

  const name   = current ? displayName(current, script) : ''
  const dotFill   = flash === 'correct' ? GREEN : flash === 'wrong' ? RED : 'rgba(255,248,200,0.95)'
  const dotStroke = flash === 'correct' ? '#166534' : flash === 'wrong' ? '#7f1d1d' : GOLD

  return (
    <div className="w-full p-4 flex flex-col gap-3">

      {/* Sri Yantra — always at top */}
      {!done && (
        <>
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
          style={{ paddingBottom: '100%' }}
        >
          <div className="absolute inset-0">
            <SriYantraSVG
              className="w-full h-full"
              showTriangles={true}
              showLabels={false}
              showNumbers={false}
              filledRegions={yantraFills}
            />
            <svg
              viewBox="45 55 430 430"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full"
              style={{ background: 'transparent' }}
            >
              {/* Background result dots — C1 only (C2-C9 use region fills) */}
              {positionedDeities.map(d => {
                if (d.id === current?.id) return null
                if (getRegionId(d) != null) return null
                const p = getPosition(d.id)
                if (!p) return null
                const res = results[d.id]
                const fill = res === 'correct' ? 'rgba(74,222,128,0.65)'
                           : res === 'wrong'   ? 'rgba(248,113,113,0.55)'
                           : 'rgba(201,168,76,0.22)'
                const answered = !!res
                return (
                  <circle key={d.id} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={answered ? 6 : 4}
                    fill={fill} stroke="none"
                    style={{ cursor: answered ? 'context-menu' : 'default', pointerEvents: answered ? 'all' : 'none' }}
                    onContextMenu={answered ? e => handleRightClick(e, d.id) : undefined} />
                )
              })}

              {/* C1 active dot */}
              {showDot && pos && (
                <circle
                  cx={pos.x.toFixed(1)} cy={pos.y.toFixed(1)}
                  r={9}
                  fill={dotFill} stroke={dotStroke} strokeWidth={1.5}
                  style={{ cursor: 'pointer', transition: 'fill 0.25s, stroke 0.25s' }}
                  onMouseEnter={() => { if (!flash) setHovered(true) }}
                  onMouseLeave={() => { if (!flash) setHovered(false) }}
                  onClick={handleClick}
                  onDoubleClick={handleDblClick}
                />
              )}

              {/* C2-C9 right-click hit areas for past answered deities */}
              {positionedDeities.map(d => {
                if (d.id === current?.id) return null
                if (!results[d.id]) return null
                const regionId = getRegionId(d)
                if (!regionId) return null
                const p = getPosition(d.id)
                if (!p) return null
                return (
                  <circle key={`rc-${d.id}`}
                    cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={16}
                    fill="transparent" stroke="none"
                    style={{ cursor: 'context-menu' }}
                    onContextMenu={e => handleRightClick(e, d.id)} />
                )
              })}

              {/* C2-C9 transparent hit area */}
              {hasRegion && pos && (
                <circle
                  cx={pos.x.toFixed(1)} cy={pos.y.toFixed(1)}
                  r={16}
                  fill="transparent" stroke="none"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => { if (!flash) setHovered(true) }}
                  onMouseLeave={() => { if (!flash) setHovered(false) }}
                  onClick={handleClick}
                  onDoubleClick={handleDblClick}
                />
              )}

              {/* Tooltip */}
              {hasPos && pos && (hovered || flash) && (
                <Tooltip x={pos.x} y={pos.y} label={name} script={script} />
              )}


            </svg>
          </div>
        </div>
        <p className="text-center text-muted mt-1" style={{ fontSize: '10px', fontStyle: 'italic' }}>
          hover to reveal · dbl-click = memorised · click = not memorised · right-click = change answer
        </p>
        </>
      )}

      {/* Completion overlay */}
      {done && (
        <CompletionOverlay
          correct={correct}
          total={total}
          onRestart={startNewRound}
        />
      )}

      {/* Previous round summary */}
      {!done && prevResults && (() => {
        const pC = Object.values(prevResults).filter(v => v === 'correct').length
        const pT = Object.keys(prevResults).length
        return (
          <div className="pt-1 border-t border-surface-800">
            <p className="text-xs text-muted font-mono uppercase tracking-widest mb-1">Last round</p>
            <p className="text-xs">
              <span className="text-green-400">{pC}</span>
              <span className="text-muted">/{pT} memorised</span>
            </p>
          </div>
        )
      })()}

    </div>
  )
}
