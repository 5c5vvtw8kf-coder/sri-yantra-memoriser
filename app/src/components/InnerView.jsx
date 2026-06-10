/**
 * InnerView.jsx
 *
 * Zoomed view of DFT5 showing:
 *   • 16 Tithi Nitya Devatas around the perimeter of DFT5
 *       1–5  : up the RIGHT side (apex → base-right)
 *       6    : Mahāvajrēśvarī — top-RIGHT vertex, bisector of N_TOP + N_RIGHT
 *       7    : Śivadūtī      — top edge, near top-RIGHT corner (t=0.05 from BASE_R)
 *       8–10 : top row middle (Tvaritē, Kulasundarī, Nityē) — evenly between pos 11 and pos 7
 *       11   : Nīlapatākē   — top row, x-aligned with left edge (BASE_L + N_TOP offset)
 *       12   : Vijayē       — left side t=0.05 from BASE_L
 *       13–15: down the LEFT side (Sarvamaṅgaḻē → Citrē)
 *       16   : Mahā Nityē — at the bindu (centroid)
 *
 * Supports Explore mode (tap to reveal) and Memorise mode (drill sequentially).
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CENTROID, CONTEXT_TRIS, CONTEXT_FILL_PATH } from '../korvinGeometry'
import { MobileMemoriseInstr } from './MobileSvaminiButtons'

// ── Coordinate system ─────────────────────────────────────────────────────────

// APEX/BASE_L/BASE_R (the central triangle) and CENTROID come from the
// shared Korvin geometry module. See ../korvinGeometry.js.

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

// ── Outward unit normals ──────────────────────────────────────────────────────

function outwardNormal(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  let nx = dy / len, ny = -dx / len
  const midX = (a[0] + b[0]) / 2, midY = (a[1] + b[1]) / 2
  const dot = nx * (CENTROID[0] - midX) + ny * (CENTROID[1] - midY)
  if (dot > 0) { nx = -nx; ny = -ny }
  return [nx, ny]
}

// Normals for each edge (outward from triangle interior)
const N_RIGHT = outwardNormal(BASE_R, APEX)    // right side
const N_TOP   = outwardNormal(BASE_L, BASE_R)  // top edge (points upward)
const N_LEFT  = outwardNormal(APEX,   BASE_L)  // left side

// ── Nitya Devata positions ────────────────────────────────────────────────────

const NITYA_OFFSET = 22   // px outward from each edge

// ── Top-row anchor values ─────────────────────────────────────────────────────
const TOP_Y        = BASE_L[1] + N_TOP[1] * NITYA_OFFSET
const LEFT_DX_DY   = (BASE_L[0] - APEX[0]) / (BASE_L[1] - APEX[1])
const NILAPATAAKE_X = BASE_L[0] + LEFT_DX_DY * (TOP_Y - BASE_L[1])
const SHIVADUUTI_X  = lerp(BASE_R, BASE_L, 0.05)[0]

const NITYA_POSITIONS = [
  // 1–5: up the RIGHT side, apex → base-right
  ...Array.from({ length: 5 }, (_, i) => {
    const t = 0.10 + (0.90 - 0.10) * (i / 4)
    const [x, y] = lerp(APEX, BASE_R, t)
    return [x + N_RIGHT[0] * NITYA_OFFSET, y + N_RIGHT[1] * NITYA_OFFSET]
  }),
  // 6: Mahāvajrēśvarī — top-RIGHT vertex bisector
  (() => {
    const bx = N_TOP[0] + N_RIGHT[0], by = N_TOP[1] + N_RIGHT[1]
    const bl = Math.sqrt(bx * bx + by * by)
    return [BASE_R[0] + (bx / bl) * NITYA_OFFSET, BASE_R[1] + (by / bl) * NITYA_OFFSET]
  })(),
  // 7: Śivadūtī — top edge, t=0.05 from BASE_R
  (() => { const [x, y] = lerp(BASE_R, BASE_L, 0.05); return [x + N_TOP[0] * NITYA_OFFSET, y + N_TOP[1] * NITYA_OFFSET] })(),
  // 8–10: Tvaritē, Kulasundarī, Nityē — evenly spaced between Nīlapatākē and Śivadūtī
  ...Array.from({ length: 3 }, (_, i) => {
    const x = NILAPATAAKE_X + (SHIVADUUTI_X - NILAPATAAKE_X) * (3 - i) / 4
    return [x, TOP_Y]
  }),
  // 11: Nīlapatākē
  [NILAPATAAKE_X, TOP_Y],
  // 12: Vijayē — left side, t=0.05 from BASE_L
  (() => { const [x, y] = lerp(BASE_L, APEX, 0.05); return [x + N_LEFT[0] * NITYA_OFFSET, y + N_LEFT[1] * NITYA_OFFSET] })(),
  // 13–15: Sarvamaṅgaḻē, Jvālāmālinī, Citrē
  ...Array.from({ length: 3 }, (_, i) => {
    const t = 0.05 + (0.88 - 0.05) * (i + 1) / 3
    const [x, y] = lerp(BASE_L, APEX, t)
    return [x + N_LEFT[0] * NITYA_OFFSET, y + N_LEFT[1] * NITYA_OFFSET]
  }),
  // 16: Mahānityē — at the bindu (centroid of DFT5)
  [CENTROID[0], CENTROID[1]],
]

// ── Static data ───────────────────────────────────────────────────────────────

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))

const nityaDeities = deities.filter(d => d.sectionId === 'nitya')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD        = '#c9a84c'
const AMBER       = '#e6a817'
const GREEN       = '#27ae60'
const RED         = '#c0392b'
const BG          = '#0f0805'
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'

const TOTAL = 16

// CONTEXT_TRIS — the nine context triangles — come from the shared Korvin
// geometry module. See ../korvinGeometry.js.

// ── Script helper ─────────────────────────────────────────────────────────────


// ── Sub-components ────────────────────────────────────────────────────────────

function DeityDot({ x, y, r, fill, selected, highlighted, onClick, onMouseEnter, onMouseLeave, onDoubleClick, onContextMenu, dimStyle }) {
  const isInteractive = !!(onClick || onMouseEnter)
  return (
    <circle
      cx={x.toFixed(1)} cy={y.toFixed(1)}
      r={selected ? r + 2.5 : r}
      fill={selected ? fill : highlighted ? RED : fill + 'bb'}
      stroke="none"
      strokeWidth={0}
      style={{ cursor: isInteractive ? 'pointer' : 'default', pointerEvents: isInteractive ? 'all' : 'none', ...dimStyle }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}


// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, fill, script, below = false }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, 25 + w / 2), 490 - w / 2)
  const ty       = below ? y + h / 2 + 12 : y - h / 2 - 12
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(15,8,5,0.93)" stroke={fill} strokeWidth={0.6}
      />
      <text x={tx.toFixed(1)} y={ty.toFixed(1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill={fill} fontFamily="'Gentium Plus', Georgia, serif">
        {label}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InnerView({
  script = 'iast',
  onDeitySelect = () => {},
  highlightId = null,
  waning = false,
  memorise = false,
  currentSeq = 1,
  results = {},
  onStartMemorise,
  onExitMemorise,
  onMarkResult,
  onToggleResult,
  flash = false,
  onNavigate,
}) {
  const [selectedId,  setSelectedId]  = useState(null)
  const [hoveredDot,  setHoveredDot]  = useState(null)
  const clickTimer = useRef(null)

  // Drill order: waning reverses deities 1–15; Mahā Nityē always last
  const drillOrder = waning
    ? [...nityaDeities.slice(0, 15).reverse(), nityaDeities[15]]
    : nityaDeities
  const drillPos = (d) => drillOrder.findIndex(x => x.id === d.id) + 1

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    onDeitySelect(newId ? deityById[newId] : null)
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  const selectedDeity = selectedId ? deityById[selectedId] : null

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = (seq) => {
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (currentSeq === seq) onMarkResult(seq, 'correct')
      else if (results[seq] !== 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleMemDblClick = (seq) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === seq) onMarkResult(seq, 'wrong')
    else if (results[seq] === 'correct') onToggleResult(seq)
  }

  const done = memorise && currentSeq > TOTAL

  // Active dot for mobile Memorise tooltip
  const activeMemDiety  = memorise && currentSeq >= 1 && currentSeq <= TOTAL ? drillOrder[currentSeq - 1] : null
  const activeMemIdx    = activeMemDiety ? nityaDeities.findIndex(x => x.id === activeMemDiety.id) : -1
  const activeMemPos    = activeMemIdx >= 0 ? NITYA_POSITIONS[activeMemIdx] : null

  const [showCompletion, setShowCompletion] = useState(false)
  const completionTimer = useRef(null)
  useEffect(() => {
    if (done) {
      completionTimer.current = setTimeout(() => setShowCompletion(true), 3000)
    } else {
      clearTimeout(completionTimer.current)
      setShowCompletion(false)
    }
    return () => clearTimeout(completionTimer.current)
  }, [done])

  const mainTriPts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <div className="w-full p-4">


      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ background: BG }}>
        <svg viewBox="25 165 465 445" xmlns="http://www.w3.org/2000/svg"
             style={{ background: BG, display: 'block', width: '100%' }}
             aria-label="Tithi Nitya Devatas around DFT5">

          {/* Arrowhead markers */}
          <defs>
            <marker id="flow-arrow-green-inner" markerWidth="7" markerHeight="5"
              refX="0" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={GREEN} />
            </marker>
          </defs>

          {/* Context geometry — even-odd light fill, then surrounding outlines */}
          <path d={CONTEXT_FILL_PATH} fillRule="evenodd"
            fill={GOLD} fillOpacity={0.1} stroke="none" />
          {CONTEXT_TRIS.map((pts, i) => (
            <polygon key={`ctx-${i}`} points={pts}
              fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.14} />
          ))}

          {/* Central triangle — the main triangle */}
          <polygon points={mainTriPts}
            fill="rgba(201,168,76,0.04)" stroke={GOLD}
            strokeWidth={3} strokeLinejoin="miter" />

          {/* Flow arrow — right side, diagonal */}
          {!memorise && (() => {
            const off = NITYA_OFFSET + 28
            const kamBottomY = lerp(APEX, BASE_R, 0.10)[1] + N_RIGHT[1] * NITYA_OFFSET + 10
            const tStart = (kamBottomY - N_RIGHT[1] * off - APEX[1]) / (BASE_R[1] - APEX[1])
            const tEnd   = tStart + 0.14
            const [x1, y1] = lerp(APEX, BASE_R, tStart)
            const [x2, y2] = lerp(APEX, BASE_R, tEnd)
            const ax1 = x1 + N_RIGHT[0] * off
            const ay1 = y1 + N_RIGHT[1] * off
            const ax2 = x2 + N_RIGHT[0] * off
            const ay2 = y2 + N_RIGHT[1] * off
            return (
              <g>
                <line
                  x1={ax1.toFixed(1)}
                  y1={ay1.toFixed(1)}
                  x2={ax2.toFixed(1)}
                  y2={ay2.toFixed(1)}
                  stroke={GREEN} strokeWidth={2.5} opacity="0.65"
                  markerEnd="url(#flow-arrow-green-inner)" />
                <text
                  x={(ax1 + 12).toFixed(1)}
                  y={(ay1 + 4).toFixed(1)}
                  fontSize="16" fill={GOLD} opacity="0.65"
                  fontFamily="'Gentium Plus', Georgia, serif" fontStyle="italic"
                  textAnchor="start">
                  Anti-clockwise · waxing moon
                </text>
              </g>
            )
          })()}

          {/* Flow arrow — left side near Citrā, anti-clockwise */}
          {!memorise && (() => {
            const off    = NITYA_OFFSET + 28
            const tTail  = 0.88   // near Citrā
            const tHead  = 0.74   // above Citrā — arrowhead points upward = anti-clockwise
            const [x1, y1] = lerp(BASE_L, APEX, tTail)
            const [x2, y2] = lerp(BASE_L, APEX, tHead)
            const ax1 = x1 + N_LEFT[0] * off
            const ay1 = y1 + N_LEFT[1] * off
            const ax2 = x2 + N_LEFT[0] * off
            const ay2 = y2 + N_LEFT[1] * off
            return (
              <g>
                <line
                  x1={ax1.toFixed(1)}
                  y1={ay1.toFixed(1)}
                  x2={ax2.toFixed(1)}
                  y2={ay2.toFixed(1)}
                  stroke={GREEN} strokeWidth={2.5} opacity="0.65"
                  markerEnd="url(#flow-arrow-green-inner)" />
                <text
                  x={(ax1 - 8).toFixed(1)}
                  y={(ay1 + 4).toFixed(1)}
                  fontSize="16" fill={GOLD} opacity="0.65"
                  fontFamily="'Gentium Plus', Georgia, serif" fontStyle="italic"
                  textAnchor="end">
                  Clockwise · waning moon
                </text>
              </g>
            )
          })()}

          {/* ── Explore mode dots ─────────────────────────────────────────── */}
          {!memorise && nityaDeities.map((d, i) => {
            const pos = NITYA_POSITIONS[i]
            if (!pos) return null
            return (
              <DeityDot key={d.id}
                x={pos[0]} y={pos[1]} r={10}
                fill={selectedId === d.id ? RED : "#fff8c8"}
                selected={selectedId === d.id}
                highlighted={!selectedId && highlightId === d.id}
                onClick={() => toggle(d.id)}
                onMouseEnter={() => hover(d.id, pos[0], pos[1])}
                onMouseLeave={unhover}
              />
            )
          })}

          {/* ── Memorise mode dots ────────────────────────────────────────── */}
          {memorise && nityaDeities.map((d, i) => {
            const seq = drillPos(d)
            const pos = NITYA_POSITIONS[i]
            if (!pos) return null

            const isActive  = currentSeq === seq
            const isPast    = currentSeq > seq
            const isFuture  = !isActive && !isPast
            const isCorrect = results[seq] === 'correct'

            if (isFuture) return null

            let fill, selected
            if (flash)                    { fill = ACTIVE_FILL; selected = true  }
            else if (isActive)            { fill = ACTIVE_FILL; selected = true  }
            else if (isPast && isCorrect) { fill = RED;         selected = false }
            else                          { fill = GOLD;        selected = false }

            return (
              <DeityDot key={`mem-${seq}`}
                x={pos[0]} y={pos[1]} r={10} fill={fill} selected={selected}
                onClick={!flash && (isActive || isPast) ? () => handleMemClick(seq) : undefined}
                onDoubleClick={!flash && (isActive || isPast) ? () => handleMemDblClick(seq) : undefined}
                onContextMenu={!flash && isPast ? e => { e.preventDefault(); onToggleResult(seq) } : undefined}
                onMouseEnter={!flash && (isActive || isPast) ? () => hover(d.id, pos[0], pos[1]) : undefined}
                onMouseLeave={!flash && (isActive || isPast) ? unhover : undefined}
              />
            )
          })}

          {/* Tooltip — Explore mode only (desktop hover / mobile tap).
              Memorise mode label is rendered as an HTML overlay below. */}
          {!flash && (() => {
            // Memorise mode handled by HTML overlay — nothing to render here
            if (memorise) return null
            // Explore mode
            if (!memorise) {
              if (hoveredDot) {
                const hdIdx = nityaDeities.findIndex(x => x.id === hoveredDot.id)
                return (
                  <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                    label={displayName(deityById[hoveredDot.id], script)}
                    fill={GOLD} script={script}
                    below={hdIdx >= 0 && hdIdx <= 5} />
                )
              }
              if (selectedId) {
                const d   = deityById[selectedId]
                const idx = nityaDeities.findIndex(x => x.id === selectedId)
                const pos = idx >= 0 ? NITYA_POSITIONS[idx] : null
                if (!pos) return null
                return <Tooltip x={pos[0]} y={pos[1]} label={displayName(d, script)} fill={GOLD} script={script} below={idx >= 0 && idx <= 5} />
              }
            }
            return null
          })()}




        </svg>

        {/* ── Memorise mode: active deity name — HTML overlay above the triangle ── */}
        {memorise && activeMemDiety && !flash && (
          <div className="absolute left-0 right-0 flex justify-center pointer-events-none"
               style={{ top: '40%' }}>
            <div style={{
              background: 'rgba(15,8,5,0.88)',
              border: '0.5px solid rgba(255,248,200,0.7)',
              borderRadius: '4px',
              padding: '5px 12px',
            }}>
              <span className={script !== 'english' ? 'iast' : ''}
                    style={{ color: '#fff8c8', fontSize: '15px', fontFamily: "'Gentium Plus', Georgia, serif" }}>
                {displayName(activeMemDiety, script)}
              </span>
            </div>
          </div>
        )}

{/* Completion overlay (delayed 3 s) */}
        {showCompletion && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)' }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">tithi nitya dēvatāḥ</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === TOTAL
                  ? 'All memorised — well done!'
                  : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{TOTAL} memorised
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  Try again
                </button>
                <button onClick={() => onNavigate && onNavigate('gurava')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

      {memorise && <MobileMemoriseInstr />}

      </div>
    </div>
  )
}
   