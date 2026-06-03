/**
 * GuravahSpotCheckView.jsx
 *
 * Guravaḥ Spot Check — 19 guru-lineage deities in three rows above the central
 * triangle, using the same trapezoid geometry as GuravaView.
 *
 * Supports sub-filter prop to drill a single lineage set:
 *   'gurus-divya'  → Divyaugha  (7)
 *   'gurus-siddha' → Siddhaugha (4)
 *   'gurus-manava' → Mānavaugha (8)
 *   null           → all 19
 *
 * Active dot lights up cream; hover to reveal name.
 * Double-click = memorised · single-click = not yet · right-click = toggle past
 *
 * Props:
 *   script          — 'iast'|'devanagari'|'telugu'|'tamil'|'english'
 *   subFilter       — active sub-filter id (string | null)
 *   onProgressSync  — ({ idx, total, correct, wrong }) => void
 *   onRegisterSkip  — (skipFn) => void
 *   onUpdateStats   — (correct, total) => void
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CONTEXT_TRIS, CONTEXT_FILL_PATH, GURU_TRAPEZOID } from '../korvinGeometry'

// ── Geometry (matches GuravaView exactly) ─────────────────────────────────────

const DOT_R   = 6
const ROW_GAP = 16
const H_INSET = 10

const TZ = GURU_TRAPEZOID

function trapEdgeX(y, side) {
  const t   = (y - TZ.yTop) / (TZ.yBottom - TZ.yTop)
  const top = side === 'L' ? TZ.topLeft[0]    : TZ.topRight[0]
  const bot = side === 'L' ? TZ.bottomLeft[0] : TZ.bottomRight[0]
  return top + (bot - top) * t
}

const GURU_Y = { manava: TZ.yBottom - 8.4 }
GURU_Y.siddha = GURU_Y.manava - ROW_GAP
GURU_Y.divya  = GURU_Y.manava - 2 * ROW_GAP

function rowXY(count, y) {
  const left  = trapEdgeX(y, 'L') + H_INSET
  const right = trapEdgeX(y, 'R') - H_INSET
  return Array.from({ length: count }, (_, i) => [
    count === 1 ? (left + right) / 2 : left + ((right - left) / (count - 1)) * i,
    y,
  ])
}

const divyaRow  = rowXY(7, GURU_Y.divya)
const siddhaL   = (divyaRow[0][0] + divyaRow[1][0]) / 2
const siddhaR   = (divyaRow[5][0] + divyaRow[6][0]) / 2
const siddhaRow = Array.from({ length: 4 }, (_, i) => [
  siddhaL + ((siddhaR - siddhaL) / 3) * i,
  GURU_Y.siddha,
])

const GURU_POSITIONS = {
  'guru-divya':  divyaRow,
  'guru-siddha': siddhaRow,
  'guru-manava': rowXY(8, GURU_Y.manava),
}

const INNER_L = trapEdgeX(GURU_Y.divya, 'L') + H_INSET

// ── Constants ─────────────────────────────────────────────────────────────────

const GOLD         = '#c9a84c'
const RED          = '#c0392b'
const BG           = '#0f0805'
const ACTIVE_FILL  = 'rgba(255,248,200,0.92)'
const RESULT_RED   = 'rgba(248,113,113,0.85)'   // correct = memorised = red
const RESULT_GOLD  = 'rgba(201,168,76,0.40)'    // wrong = not memorised = gold
const DIM_FILL     = 'rgba(201,168,76,0.22)'

const FLASH_MS = 380

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const guruDivya  = deities.filter(d => d.sectionId === 'guru-divya').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const guruSiddha = deities.filter(d => d.sectionId === 'guru-siddha').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const guruManava = deities.filter(d => d.sectionId === 'guru-manava').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const guruAll    = [...guruDivya, ...guruSiddha, ...guruManava]

// ── Position lookup ────────────────────────────────────────────────────────────

function getGuruPos(d) {
  const list = d.sectionId === 'guru-divya'  ? guruDivya
             : d.sectionId === 'guru-siddha' ? guruSiddha
             : guruManava
  const i = list.findIndex(g => g.id === d.id)
  return GURU_POSITIONS[d.sectionId]?.[i]
}

// ── Queue builder ─────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(subFilter) {
  let pool
  if (subFilter === 'gurus-divya')  pool = guruDivya
  else if (subFilter === 'gurus-siddha') pool = guruSiddha
  else if (subFilter === 'gurus-manava') pool = guruManava
  else pool = guruAll
  return shuffle(pool.map(d => d.id))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 14 : script === 'telugu' ? 16
                 : script === 'tamil' ? 17 : script === 'english' ? 11.5 : 10.5
  const w  = Math.max(60, label.length * charW + 18)
  const tx = Math.min(Math.max(x, -116 + w / 2), 496 - w / 2)
  const ty = y - h / 2 - 12
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(15,8,5,0.93)" stroke={GOLD} strokeWidth={0.6}
      />
      <text x={tx.toFixed(1)} y={ty.toFixed(1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill={GOLD} fontFamily="'Gentium Plus', Georgia, serif">
        {label}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GuravahSpotCheckView({
  script = 'iast',
  subFilter = null,
  onProgressSync,
  onRegisterSkip,
  onUpdateStats,
}) {
  const [queue,     setQueue]     = useState(() => buildQueue(subFilter))
  const [idx,       setIdx]       = useState(0)
  const [results,   setResults]   = useState({})
  const [hoveredId, setHoveredId] = useState(null)
  const [flash,     setFlash]     = useState(null)

  const clickTimer = useRef(null)
  const flashTimer = useRef(null)

  // Reset queue when sub-filter changes
  useEffect(() => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (flashTimer.current) { clearTimeout(flashTimer.current); flashTimer.current = null }
    setQueue(buildQueue(subFilter))
    setIdx(0)
    setResults({})
    setFlash(null)
    setHoveredId(null)
  }, [subFilter])

  const total   = queue.length
  const done    = idx >= total
  const current = done ? null : deityById[queue[idx]]

  // ── Progress sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!onProgressSync) return
    const correct = Object.values(results).filter(v => v === 'correct').length
    const wrong   = Object.values(results).filter(v => v === 'wrong').length
    onProgressSync({ idx, total, correct, wrong })
  }, [idx, total, results, onProgressSync])

  // ── End-of-round stats ─────────────────────────────────────────────────────
  useEffect(() => {
    if (done && onUpdateStats) {
      const correct = Object.values(results).filter(v => v === 'correct').length
      onUpdateStats(correct, total)
    }
  }, [done, results, total, onUpdateStats])

  // ── Mark result ────────────────────────────────────────────────────────────
  const markResult = useCallback((id, outcome) => {
    if (!id || flash) return
    setResults(r => ({ ...r, [id]: outcome }))
    setFlash(outcome)
    flashTimer.current = setTimeout(() => {
      setFlash(null)
      setIdx(i => i + 1)
    }, FLASH_MS)
  }, [flash])

  // ── Click / dbl-click (active dot only) ───────────────────────────────────
  const handleClick = useCallback((id) => {
    if (flash || !current || id !== current.id) return
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      markResult(id, 'correct')
    }, 280)
  }, [flash, current, markResult])

  const handleDblClick = useCallback((id) => {
    if (flash || !current || id !== current.id) return
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    markResult(id, 'wrong')
  }, [flash, current, markResult])

  // ── Toggle past result (right-click) ──────────────────────────────────────
  const handleToggle = useCallback((id) => {
    setResults(r => ({ ...r, [id]: r[id] === 'correct' ? 'wrong' : 'correct' }))
  }, [])

  // ── Skip ──────────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (done || flash) return
    setHoveredId(null)
    setIdx(i => i + 1)
  }, [done, flash])

  useEffect(() => {
    if (onRegisterSkip) onRegisterSkip(handleSkip)
  }, [handleSkip, onRegisterSkip])

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = () => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (flashTimer.current) { clearTimeout(flashTimer.current); flashTimer.current = null }
    setQueue(buildQueue(subFilter))
    setIdx(0)
    setResults({})
    setFlash(null)
    setHoveredId(null)
  }

  // Cleanup on unmount
  useEffect(() => () => {
    if (clickTimer.current) clearTimeout(clickTimer.current)
    if (flashTimer.current) clearTimeout(flashTimer.current)
  }, [])

  const mainTriPts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  // Which section IDs are in the active queue (for dimming unrelated rows)
  const activeSectionIds = queue.map(id => deityById[id]?.sectionId).filter(Boolean)
  const activeSections = new Set(activeSectionIds)

  return (
    <div className="w-full p-4">
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ background: BG }}>
        <svg viewBox="-30 181 560 500" xmlns="http://www.w3.org/2000/svg"
             style={{ display: 'block', width: '100%' }}
             aria-label="Guravaḥ Spot Check — guru lineage positions">

          <defs>
            <marker id="gs-flow-arrow" markerWidth="7" markerHeight="5"
              refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={RED} opacity="0.7" />
            </marker>
          </defs>

          {/* Context geometry */}
          <path d={CONTEXT_FILL_PATH} fillRule="evenodd"
            fill={GOLD} fillOpacity={0.1} stroke="none" />
          {CONTEXT_TRIS.map((pts, i) => (
            <polygon key={`ctx-${i}`} points={pts}
              fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.14} />
          ))}

          {/* Central triangle */}
          <polygon points={mainTriPts}
            fill="rgba(201,168,76,0.04)" stroke={GOLD}
            strokeWidth={3} strokeLinejoin="miter" />

          {/* Flow arrow */}
          {(() => {
            const ay = GURU_Y.divya - 26
            return (
              <line
                x1={INNER_L.toFixed(1)} y1={ay.toFixed(1)}
                x2={(INNER_L + 39).toFixed(1)} y2={ay.toFixed(1)}
                stroke={RED} strokeWidth={2.5} opacity="0.55"
                markerEnd="url(#gs-flow-arrow)" />
            )
          })()}

          {/* Row labels */}
          {(() => {
            const sharedX = (GURU_POSITIONS['guru-manava'][0][0] - 9 - 8).toFixed(1)
            return [
              { iast: 'divyaugha guravaḥ',  devanagari: 'दिव्यौघ गुरवः', english: 'Divine Gurus', y: GURU_Y.divya,  sid: 'guru-divya'  },
              { iast: 'siddhaugha guravaḥ', devanagari: 'सिद्धौघ गुरवः', english: 'Siddha Gurus', y: GURU_Y.siddha, sid: 'guru-siddha' },
              { iast: 'mānavaugha guravaḥ', devanagari: 'मानवौघ गुरवः',  english: 'Human Gurus',  y: GURU_Y.manava, sid: 'guru-manava' },
            ].map(({ iast, devanagari, english, y, sid }) => {
              const label = script === 'devanagari' ? devanagari : script === 'english' ? english : iast
              const dim = subFilter && !activeSections.has(sid)
              return (
                <text key={iast} x={sharedX} y={y.toFixed(1)}
                  textAnchor="end" dominantBaseline="middle"
                  fontSize="12" fill={GOLD} opacity={dim ? '0.20' : '0.65'}
                  fontFamily="'Gentium Plus', Georgia, serif">
                  {label}
                </text>
              )
            })
          })()}

          {/* ── Deity dots ─────────────────────────────────────────────────── */}
          {guruAll.map((d) => {
            const pos = getGuruPos(d)
            if (!pos) return null

            const inQueue   = queue.includes(d.id)
            const isActive  = !done && current?.id === d.id
            const isPast    = results[d.id] != null
            const isCorrect = results[d.id] === 'correct'

            let fill, r, opacity
            if (isActive && flash === 'correct')  { fill = RESULT_RED;   r = DOT_R + 3; opacity = 1 }
            else if (isActive && flash === 'wrong') { fill = RESULT_GOLD;  r = DOT_R + 3; opacity = 1 }
            else if (isActive)                    { fill = ACTIVE_FILL;  r = DOT_R + 3; opacity = 1 }
            else if (isPast && isCorrect)         { fill = RESULT_RED;   r = DOT_R + 1; opacity = 0.85 }
            else if (isPast)                      { fill = RESULT_GOLD;  r = DOT_R + 1; opacity = 0.85 }
            else if (inQueue)                     { fill = DIM_FILL;     r = DOT_R;     opacity = 0.55 }
            else                                  { fill = DIM_FILL;     r = DOT_R - 1; opacity = 0.18 }

            const isInteractive = (isActive || isPast) && !flash

            return (
              <circle key={d.id}
                cx={pos[0].toFixed(1)} cy={pos[1].toFixed(1)}
                r={r}
                fill={fill}
                stroke={isActive ? '#fff' : 'none'}
                strokeWidth={isActive ? 0.8 : 0}
                opacity={opacity}
                style={{
                  cursor: isInteractive ? 'pointer' : 'default',
                  pointerEvents: isInteractive ? 'all' : 'none',
                }}
                onClick={isActive && !flash ? () => handleClick(d.id) : undefined}
                onDoubleClick={isActive && !flash ? () => handleDblClick(d.id) : undefined}
                onContextMenu={isPast && !flash
                  ? (e) => { e.preventDefault(); handleToggle(d.id) }
                  : undefined}
                onMouseEnter={isInteractive ? () => setHoveredId(d.id) : undefined}
                onMouseLeave={isInteractive ? () => setHoveredId(null) : undefined}
              />
            )
          })}

          {/* Tooltip */}
          {hoveredId && !flash && (() => {
            const d = deityById[hoveredId]
            if (!d) return null
            const pos = getGuruPos(d)
            if (!pos) return null
            return (
              <Tooltip
                x={pos[0]} y={pos[1]}
                label={displayName(d, script)}
                script={script}
              />
            )
          })()}

        </svg>

        {/* Completion overlay */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)' }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">guravaḥ</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === total
                  ? 'All memorised — well done!'
                  : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{total} memorised
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={restart}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
