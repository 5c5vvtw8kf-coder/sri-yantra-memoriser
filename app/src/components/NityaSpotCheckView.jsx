/**
 * NityaSpotCheckView.jsx
 *
 * Tithi Nitya Spot Check — 16 Nitya Devatas arranged around the central
 * triangle, using the same dot positions as InnerView.
 *
 * Active dot lights up cream; user hovers to reveal name.
 * Double-click = memorised · single-click = not yet · right-click = toggle past
 *
 * Props:
 *   script          — 'iast'|'devanagari'|'telugu'|'tamil'|'english'
 *   onProgressSync  — ({ idx, total, correct, wrong }) => void
 *   onRegisterSkip  — (skipFn) => void
 *   onUpdateStats   — (correct, total) => void
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CENTROID, CONTEXT_TRIS, CONTEXT_FILL_PATH } from '../korvinGeometry'

// ── Geometry (matches InnerView exactly) ──────────────────────────────────────

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

function outwardNormal(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  let nx = dy / len, ny = -dx / len
  const midX = (a[0] + b[0]) / 2, midY = (a[1] + b[1]) / 2
  const dot = nx * (CENTROID[0] - midX) + ny * (CENTROID[1] - midY)
  if (dot > 0) { nx = -nx; ny = -ny }
  return [nx, ny]
}

const N_RIGHT = outwardNormal(BASE_R, APEX)
const N_TOP   = outwardNormal(BASE_L, BASE_R)
const N_LEFT  = outwardNormal(APEX,   BASE_L)

const NITYA_OFFSET  = 22
const TOP_Y         = BASE_L[1] + N_TOP[1] * NITYA_OFFSET
const LEFT_DX_DY    = (BASE_L[0] - APEX[0]) / (BASE_L[1] - APEX[1])
const NILAPATAAKE_X = BASE_L[0] + LEFT_DX_DY * (TOP_Y - BASE_L[1])
const SHIVADUUTI_X  = lerp(BASE_R, BASE_L, 0.05)[0]

const NITYA_POSITIONS = [
  // 1–5: up the right side (apex → base-right)
  ...Array.from({ length: 5 }, (_, i) => {
    const t = 0.10 + (0.90 - 0.10) * (i / 4)
    const [x, y] = lerp(APEX, BASE_R, t)
    return [x + N_RIGHT[0] * NITYA_OFFSET, y + N_RIGHT[1] * NITYA_OFFSET]
  }),
  // 6: top-right vertex (bisector of N_TOP + N_RIGHT)
  (() => {
    const bx = N_TOP[0] + N_RIGHT[0], by = N_TOP[1] + N_RIGHT[1]
    const bl = Math.sqrt(bx * bx + by * by)
    return [BASE_R[0] + (bx / bl) * NITYA_OFFSET, BASE_R[1] + (by / bl) * NITYA_OFFSET]
  })(),
  // 7: top edge, t=0.05 from BASE_R
  (() => { const [x, y] = lerp(BASE_R, BASE_L, 0.05); return [x + N_TOP[0] * NITYA_OFFSET, y + N_TOP[1] * NITYA_OFFSET] })(),
  // 8–10: evenly spaced between Nīlapatākē and Śivadūtī
  ...Array.from({ length: 3 }, (_, i) => {
    const x = NILAPATAAKE_X + (SHIVADUUTI_X - NILAPATAAKE_X) * (3 - i) / 4
    return [x, TOP_Y]
  }),
  // 11: Nīlapatākē
  [NILAPATAAKE_X, TOP_Y],
  // 12: left side, t=0.05 from BASE_L
  (() => { const [x, y] = lerp(BASE_L, APEX, 0.05); return [x + N_LEFT[0] * NITYA_OFFSET, y + N_LEFT[1] * NITYA_OFFSET] })(),
  // 13–15: down the left side
  ...Array.from({ length: 3 }, (_, i) => {
    const t = 0.05 + (0.88 - 0.05) * (i + 1) / 3
    const [x, y] = lerp(BASE_L, APEX, t)
    return [x + N_LEFT[0] * NITYA_OFFSET, y + N_LEFT[1] * NITYA_OFFSET]
  }),
  // 16: Mahānityē — bindu (centroid)
  [CENTROID[0], CENTROID[1]],
]

// ── Constants ─────────────────────────────────────────────────────────────────

const GOLD         = '#c9a84c'
const BG           = '#0f0805'
const ACTIVE_FILL  = 'rgba(255,248,200,0.92)'
const RESULT_RED   = 'rgba(248,113,113,0.85)'   // correct = memorised = red
const RESULT_GOLD  = 'rgba(201,168,76,0.40)'    // wrong = not memorised = gold
const DIM_FILL     = 'rgba(201,168,76,0.25)'

const FLASH_MS = 380

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const nityaDeities = deities
  .filter(d => d.sectionId === 'nitya')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue() {
  return shuffle(nityaDeities.map(d => d.id))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 19 : script === 'english' ? 18 : 17
  const h        = script === 'devanagari' ? 38 : script === 'english' ? 36 : 34
  const charW    = script === 'devanagari' ? 14 : script === 'telugu' ? 16
                 : script === 'tamil' ? 17 : script === 'english' ? 11.5 : 10.5
  const w  = Math.max(60, label.length * charW + 18)
  const tx = Math.min(Math.max(x, w / 2 + 4), 500 - w / 2 - 4)
  const ty = y - h / 2 - 14
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(15,8,5,0.93)" stroke={GOLD} strokeWidth={0.6}
      />
      <text x={tx.toFixed(1)} y={ty.toFixed(1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill={GOLD} fontFamily="serif">
        {label}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NityaSpotCheckView({
  script = 'iast',
  onProgressSync,
  onRegisterSkip,
  onUpdateStats,
}) {
  const [queue,     setQueue]     = useState(() => buildQueue())
  const [idx,       setIdx]       = useState(0)
  const [results,   setResults]   = useState({})   // id → 'correct'|'wrong'
  const [hoveredId, setHoveredId] = useState(null)
  const [flash,     setFlash]     = useState(null) // null | 'correct' | 'wrong'

  const clickTimer = useRef(null)
  const flashTimer = useRef(null)

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
    setQueue(buildQueue())
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

  return (
    <div className="w-full p-4">
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ background: BG }}>
        <svg viewBox="-30 181 560 500" xmlns="http://www.w3.org/2000/svg"
             style={{ display: 'block', width: '100%' }}
             aria-label="Tithi Nitya Spot Check — 16 Nitya positions">

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

          {/* ── Deity dots ─────────────────────────────────────────────────── */}
          {nityaDeities.map((d, i) => {
            const pos      = NITYA_POSITIONS[i]
            if (!pos) return null

            const isActive  = !done && current?.id === d.id
            const isPast    = results[d.id] != null
            const isCorrect = results[d.id] === 'correct'

            let fill, r, opacity
            if (isActive && flash === 'correct')  { fill = RESULT_RED;   r = 13; opacity = 1 }
            else if (isActive && flash === 'wrong') { fill = RESULT_GOLD;  r = 13; opacity = 1 }
            else if (isActive)                    { fill = ACTIVE_FILL;  r = 13; opacity = 1 }
            else if (isPast && isCorrect)         { fill = RESULT_RED;   r = 10; opacity = 0.85 }
            else if (isPast)                      { fill = RESULT_GOLD;  r = 10; opacity = 0.85 }
            else                                  { fill = DIM_FILL;     r = 7;  opacity = 0.55 }

            return (
              <circle key={d.id}
                cx={pos[0].toFixed(1)} cy={pos[1].toFixed(1)}
                r={r}
                fill={fill}
                stroke={isActive ? '#fff' : 'none'}
                strokeWidth={isActive ? 0.8 : 0}
                opacity={opacity}
                style={{
                  cursor: (isActive || isPast) && !flash ? 'pointer' : 'default',
                  pointerEvents: (isActive || isPast) && !flash ? 'all' : 'none',
                }}
                onClick={isActive && !flash ? () => handleClick(d.id) : undefined}
                onDoubleClick={isActive && !flash ? () => handleDblClick(d.id) : undefined}
                onContextMenu={isPast && !flash
                  ? (e) => { e.preventDefault(); handleToggle(d.id) }
                  : undefined}
                onMouseEnter={(isActive || isPast) && !flash
                  ? () => setHoveredId(d.id) : undefined}
                onMouseLeave={(isActive || isPast) && !flash
                  ? () => setHoveredId(null) : undefined}
              />
            )
          })}

          {/* Tooltip */}
          {hoveredId && !flash && (() => {
            const d = deityById[hoveredId]
            if (!d) return null
            const i   = nityaDeities.findIndex(nd => nd.id === hoveredId)
            const pos = NITYA_POSITIONS[i]
            if (!pos) return null
            return (
              <Tooltip
                x={pos[0]} y={pos[1]}
                label={displayName(d, script)}
                script={script}
              />
            )
          })()}

          {/* Instruction */}
          {!done && !flash && (
            <text x={250} y={630} textAnchor="middle"
              fontSize="13" fill={GOLD} opacity="0.55"
              fontFamily="serif" fontStyle="italic">
              hover to reveal · click = memorised · dbl-click = not yet
            </text>
          )}

        </svg>

        {/* Completion overlay */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)' }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">tithi nitya devātāḥ</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === total
                  ? 'Memorised — well done!'
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

      <div className="mt-3 text-center">
        <p className="iast text-gold-600 text-xs">tithi nitya devātāḥ · 16 goddesses of the lunar phases</p>
      </div>

      <div className="h-8" />
    </div>
  )
}
