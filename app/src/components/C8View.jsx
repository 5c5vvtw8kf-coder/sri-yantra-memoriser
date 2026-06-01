/**
 * C8View.jsx
 *
 * Circuit 8 — Sarvasiddhiprada Chakra (primary downward triangle)
 * Āti Rahasya Yoginī
 *
 * 7 deity positions on DFT5:
 *   1  Bāṇinī         — left side, outside
 *   2  Chāpinī        — right side, outside
 *   3  Pāśinī         — above base edge, toward right
 *   4  Aṅkuśinī       — above base edge, toward left
 *   5  Mahākāmēśvarī  — apex (bottom vertex)
 *   6  Mahāvajrēśvarī — top-right corner (base-right vertex)
 *   7  Mahābhagamālinī — top-left corner (base-left vertex)
 *
 * Supports Explore mode (tap to reveal) and Memorise mode (drill sequentially).
 */

import { useState, useRef } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CENTROID, CONTEXT_TRIS, CONTEXT_FILL_PATH } from '../korvinGeometry'

// ── Coordinate system (matches InnerView / BinduView) ─────────────────────────

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

const N_RIGHT = outwardNormal(BASE_R, APEX)
const N_TOP   = outwardNormal(BASE_L, BASE_R)
const N_LEFT  = outwardNormal(APEX,   BASE_L)

// ── Deity dot positions ───────────────────────────────────────────────────────

const C8_BANINI_POS    = (() => { const [x, y] = lerp(BASE_L, APEX, 0.6); return [x + N_LEFT[0]  * 45, y + N_LEFT[1]  * 45] })()
const C8_CHAPINI_POS   = (() => { const [x, y] = lerp(BASE_R, APEX, 0.6); return [x + N_RIGHT[0] * 45, y + N_RIGHT[1] * 45] })()
const C8_PASINI_POS    = (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.72); return [x + N_TOP[0] * 45, y + N_TOP[1] * 45] })()
const C8_ANKUSHINI_POS = (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.28); return [x + N_TOP[0] * 45, y + N_TOP[1] * 45] })()

const C8_POSITIONS = [
  C8_BANINI_POS,                              // 1 — Bāṇinī:  left side, outside
  C8_CHAPINI_POS,                             // 2 — Chāpinī: right side, outside
  C8_PASINI_POS,                              // 3 — Pāśinī:  above base, toward right
  C8_ANKUSHINI_POS,                           // 4 — Aṅkuśinī: above base, toward left
  [APEX[0],   APEX[1]  ],                     // 5 — Mahākāmēśvarī: apex (bottom)
  [BASE_R[0], BASE_R[1]],                     // 6 — Mahāvajrēśvarī: top-right
  [BASE_L[0], BASE_L[1]],                     // 7 — Mahābhagamālinī: top-left
]

// ── Constants ─────────────────────────────────────────────────────────────────

const GOLD        = '#c9a84c'
const RED         = '#c0392b'
const BG          = '#0f0805'
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'

const TOTAL = 7

// CONTEXT_TRIS — the nine context triangles — come from the shared Korvin
// geometry module. See ../korvinGeometry.js.

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c8Deities = deities
  .filter(d => d.sectionId === 'circuit-8' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// ── Helpers ───────────────────────────────────────────────────────────────────


// ── Sub-components ────────────────────────────────────────────────────────────

function DeityDot({ x, y, r, fill, selected, highlighted, isHovered, onClick, onDoubleClick, onContextMenu, onMouseEnter, onMouseLeave, dimStyle }) {
  const isInteractive = !!(onClick || onMouseEnter)
  return (
    <circle
      cx={x.toFixed(1)} cy={y.toFixed(1)}
      r={selected ? r + 2.5 : r}
      fill={selected ? fill : (highlighted || isHovered) ? RED : fill + 'bb'}
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


function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 19 : script === 'english' ? 18 : 17
  const h        = script === 'devanagari' ? 38 : script === 'english' ? 36 : 34
  const charW    = script === 'devanagari' ? 14 : script === 'telugu' ? 16 : script === 'tamil' ? 17 : script === 'english' ? 11.5 : 10.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 4), 500 - w / 2 - 4)
  const ty       = y - h / 2 - 14
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

export default function C8View({
  script = 'iast',
  onDeitySelect = () => {},
  highlightId = null,
  fillAll = false,
  memorise = false,
  currentSeq = 1,
  results = {},
  onStartMemorise,
  onExitMemorise,
  onMarkResult,
  onToggleResult,
  flash = false,
  onNavigate,
  done: doneProp = null,
}) {
  const [selectedId,  setSelectedId]  = useState(null)
  const [hoveredDot,  setHoveredDot]  = useState(null)
  const clickTimer = useRef(null)

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

  const done = doneProp !== null ? doneProp : (memorise && currentSeq > TOTAL)

  const mainTriPts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <div className="w-full p-4">


      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ background: BG }}>
        <svg viewBox="-30 181 560 500" xmlns="http://www.w3.org/2000/svg"
             style={{ background: BG, display: 'block', width: '100%' }}
             aria-label="Circuit 8 — Sarvasiddhiprada Chakra — 7 deity positions">

          {/* Context geometry — even-odd light fill, then surrounding outlines */}
          <path d={CONTEXT_FILL_PATH} fillRule="evenodd"
            fill={GOLD} fillOpacity={0.1} stroke="none" />
          {CONTEXT_TRIS.map((pts, i) => (
            <polygon key={`ctx-${i}`} points={pts}
              fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.14} />
          ))}

          {/* Central triangle — gold fill; red on fillAll hover */}
          <polygon points={mainTriPts}
            fill={!memorise && fillAll ? 'rgba(200,70,70,0.85)' : 'rgba(201,168,76,0.80)'}
            stroke={!memorise && fillAll ? 'none' : GOLD}
            strokeWidth={!memorise && fillAll ? 0 : 3}
            strokeLinejoin="miter" />
          {/* Black dot marking the bindu position — always visible */}
          <circle cx={CENTROID[0].toFixed(1)} cy={CENTROID[1].toFixed(1)} r={8}
            fill="#000000" opacity={1} style={{ pointerEvents: 'none' }} />

          {/* ── Explore mode dots ─────────────────────────────────────────── */}
          {!memorise && c8Deities.map((d, i) => {
            const pos = C8_POSITIONS[i]
            if (!pos) return null
            return (
              <DeityDot key={d.id}
                x={pos[0]} y={pos[1]} r={14}
                fill={selectedId === d.id ? RED : "#fff8c8"}
                selected={selectedId === d.id}
                highlighted={!selectedId && highlightId === d.id}
                isHovered={hoveredDot?.id === d.id}
                onClick={() => toggle(d.id)}
                onMouseEnter={() => hover(d.id, pos[0], pos[1])}
                onMouseLeave={unhover} />
            )
          })}

          {/* ── Memorise mode dots ────────────────────────────────────────── */}
          {memorise && c8Deities.map((d, i) => {
            const seq = d.sequenceInSection
            const pos = C8_POSITIONS[i]
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
                x={pos[0]} y={pos[1]} r={14} fill={fill} selected={selected}
                onClick={!flash && (isActive || isPast) ? () => handleMemClick(seq) : undefined}
                onDoubleClick={!flash && (isActive || isPast) ? () => handleMemDblClick(seq) : undefined}
                onContextMenu={!flash && isPast ? e => { e.preventDefault(); onToggleResult(seq) } : undefined}
                onMouseEnter={!flash && (isActive || isPast) ? () => hover(d.id, pos[0], pos[1]) : undefined}
                onMouseLeave={!flash && (isActive || isPast) ? unhover : undefined}
              />
            )
          })}

          {/* Hover tooltip */}
          {hoveredDot && !flash && (() => {
            const d = deityById[hoveredDot.id]
            if (!d) return null
            return (
              <Tooltip
                x={hoveredDot.x} y={hoveredDot.y}
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
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">sarvasiddhiprada cakra</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === TOTAL
                  ? 'Memorised — well done!'
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
                <button onClick={() => onNavigate && onNavigate('c9')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="h-8" />
    </div>
  )
}
