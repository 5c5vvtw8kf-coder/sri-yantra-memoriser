/**
 * BinduView.jsx
 *
 * Zoomed view of DFT5 showing Circuit 8 and Circuit 9 deity positions.
 *
 * Circuit 8 — Sarva Siddhiprada Chakra (7 named deities):
 *   Seq 1  Bāṇinī         — LEFT side, outside triangle, below midpoint
 *   Seq 2  Chāpinī        — RIGHT side, outside triangle, below midpoint
 *   Seq 3  Pāśinī         — above base edge, toward right
 *   Seq 4  Aṅkuśinī       — above base edge, toward left
 *   Seq 5  Mahākāmēśvarī  — apex (bottom vertex)
 *   Seq 6  Mahāvajrēśvarī — top-right corner (base-right vertex)
 *   Seq 7  Mahābhagamālinī — top-left corner (base-left vertex)
 *
 * Circuit 9 — Sarva Ānandamaya Chakra:
 *   Śrī Śrī Mahābhaṭṭārikē — bindu at centroid of DFT5
 *
 * Tithi Nitya positions are shown as faint reference dots (non-interactive)
 * so the user can see where C8 sits relative to the Nitya boundary.
 */

import { useState } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'

// ── Coordinate system (same as InnerView) ────────────────────────────────────

const ICV_CX = 250
const ICV_CY = 525
const ICV_R  = 205

const iv = ([x, y]) => [ICV_CX + x * ICV_R, ICV_CY - y * ICV_R]

// ── DFT5 vertices ─────────────────────────────────────────────────────────────

const APEX   = iv([0,          -0.074074])
const BASE_L = iv([-0.518519,   0.722222])
const BASE_R = iv([ 0.518519,   0.722222])

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

const CENTROID = [
  (APEX[0] + BASE_L[0] + BASE_R[0]) / 3,
  (APEX[1] + BASE_L[1] + BASE_R[1]) / 3,
]

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

// ── Circuit 8 positions ───────────────────────────────────────────────────────
// Sequence index matches sequenceInSection - 1 in khadgamala-canonical.json

// Bāṇinī and Chāpinī: side midpoint region, pushed outward, lowered toward apex.
const C8_BANINI_POS    = (() => { const [x, y] = lerp(BASE_L, APEX, 0.6); return [x + N_LEFT[0]  * 45, y + N_LEFT[1]  * 45] })()
const C8_CHAPINI_POS   = (() => { const [x, y] = lerp(BASE_R, APEX, 0.6); return [x + N_RIGHT[0] * 45, y + N_RIGHT[1] * 45] })()
// Pāśinī and Aṅkuśinī: above the base edge, pushed outward via N_TOP.
const C8_PASINI_POS    = (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.72); return [x + N_TOP[0] * 45, y + N_TOP[1] * 45] })()
const C8_ANKUSHINI_POS = (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.28); return [x + N_TOP[0] * 45, y + N_TOP[1] * 45] })()

const C8_POSITIONS = [
  C8_BANINI_POS,                              // 1 — Bāṇinī:  left side, outside
  C8_CHAPINI_POS,                             // 2 — Chāpinī: right side, outside
  C8_PASINI_POS,                              // 3 — Pāśinī:  above base, toward right
  C8_ANKUSHINI_POS,                           // 4 — Aṅkuśinī: above base, toward left
  [APEX[0],   APEX[1]  ],                     // 5 — Mahākāmēśvarī: apex (bottom)
  [BASE_R[0], BASE_R[1]],                     // 6 — Mahāvajrēśvarī: top-right (swapped)
  [BASE_L[0], BASE_L[1]],                     // 7 — Mahābhagamālinī: top-left (swapped)
]

// ── Circuit 9 — bindu at centroid ────────────────────────────────────────────

const BINDU_POS = [CENTROID[0], CENTROID[1]]

// ── Static data ───────────────────────────────────────────────────────────────

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))

const c8Deities = deities.filter(d => d.sectionId === 'circuit-8' && d.role === 'deity')
const c9Deity   = deities.find(d => d.sectionId === 'circuit-9' && d.role === 'deity')

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD  = '#c9a84c'
const BG    = '#0f0805'

// ── Script helper ─────────────────────────────────────────────────────────────

// ── Sub-components ────────────────────────────────────────────────────────────

function DeityDot({ x, y, r, fill, selected, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <circle
      cx={x.toFixed(1)} cy={y.toFixed(1)}
      r={selected ? r + 2.5 : r}
      fill={selected ? fill : fill + 'cc'}
      stroke={selected ? '#fff' : 'none'}
      strokeWidth={selected ? 0.8 : 0}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

function DeityPanel({ deity, script, onDismiss }) {
  if (!deity) return null
  const section = sectionById[deity.sectionId]
  const { scripts, sequenceInChant } = deity
  let sectionLabel = section?.label ?? deity.sectionId
  if (deity.circuitNumber) sectionLabel = `Circuit ${deity.circuitNumber}`

  const primary   = displayName(deity, script)
  const isDevPrim = script === 'devanagari'

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onDismiss} />
      <div
        className="fixed left-0 right-0 bottom-0 z-50 bg-surface-900 border-t border-surface-700 rounded-t-2xl shadow-2xl shadow-black/80"
        style={{ maxHeight: '55vh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-600" />
        </div>
        <div className="px-5 pb-8 pt-2">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-mono text-gold-700 uppercase tracking-widest">
              {sectionLabel} · #{sequenceInChant}
            </span>
            <button onClick={onDismiss}
              className="text-muted hover:text-cream transition-colors text-lg leading-none -mt-0.5">
              ×
            </button>
          </div>
          <h2 className={`${isDevPrim ? '' : 'iast'} text-gold-400 text-lg font-medium leading-snug mb-1`}>
            {primary}
          </h2>
          {script !== 'iast' && scripts.iast && (
            <p className="iast text-gold-600 text-sm mb-1">{scripts.iast}</p>
          )}
          {script !== 'english' && scripts.english && (
            <p className="text-cream text-sm mb-2">{scripts.english}</p>
          )}
          {scripts.translation && (
            <p className="text-muted text-xs italic">{scripts.translation}</p>
          )}
        </div>
      </div>
    </>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, fill, script, kana }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = (script === 'devanagari' || script === 'kannada' || script === 'malayalam') ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'kannada' ? 20 : script === 'malayalam' ? 23 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 4), 500 - w / 2 - 4)
  const ty       = y - h / 2 - 12
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2 - (kana ? 18 : 0)).toFixed(1)}
        width={w.toFixed(1)} height={h + (kana ? 18 : 0)} rx={3}
        fill="rgba(15,8,5,0.93)" stroke={fill} strokeWidth={0.6}
      />
      {kana && (
        <text
          x={tx.toFixed(1)} y={(ty - h / 2 - 2).toFixed(1)}
          textAnchor="middle" dominantBaseline="text-after-edge"
          fontSize={13} fill="rgba(201,168,76,0.75)" fontFamily="sans-serif"
        >
          {kana}
        </text>
      )}
      <text x={tx.toFixed(1)} y={(kana ? ty - h / 2 + 2 : ty).toFixed(1)}
        textAnchor="middle" dominantBaseline={kana ? "hanging" : "middle"}
        fontSize={fontSize} fill={fill} fontFamily="'Gentium Plus', Georgia, serif">
        {label}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BinduView({ script = 'iast', onDeitySelect = () => {} }) {
  const isJapanese = script === 'ja' || script === 'kana'
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredDot, setHoveredDot] = useState(null)  // { id, x, y }

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    setHoveredDot(null)
    onDeitySelect(newId ? deityById[newId] : null)
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  const selectedDeity = selectedId ? deityById[selectedId] : null

  const dft5Pts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <div className="w-full px-4 pt-3 pb-0 md:p-4 flex-1 flex flex-col md:block md:flex-none">

        <div className="relative w-full flex-1 min-h-0 md:flex-none rounded-xl overflow-hidden shadow-2xl shadow-black/60"
             style={{ background: BG }}>
          <svg viewBox="0 175 500 600" xmlns="http://www.w3.org/2000/svg"
               style={{ background: BG, display: 'block', width: '100%', height: '100%' }}
               aria-label="Bindu View — Circuit 8 and Circuit 9 positions on DFT5">

            {/* DFT5 triangle */}
            <polygon points={dft5Pts}
              fill="rgba(201,168,76,0.04)" stroke={GOLD}
              strokeWidth={1.2} strokeLinejoin="miter" />

            {/* Circuit 8 dots */}
            {c8Deities.map((d, i) => {
              const pos = C8_POSITIONS[i]
              if (!pos) return null
              return (
                <DeityDot key={d.id}
                  x={pos[0]} y={pos[1]} r={14}
                  fill={GOLD}
                  selected={selectedId === d.id}
                  onClick={() => toggle(d.id)}
                  onMouseEnter={() => hover(d.id, pos[0], pos[1])}
                  onMouseLeave={unhover} />
              )
            })}

            {/* Circuit 9 — bindu */}
            {c9Deity && (
              <g onClick={() => toggle(c9Deity.id)}
                 onMouseEnter={() => hover(c9Deity.id, BINDU_POS[0], BINDU_POS[1])}
                 onMouseLeave={unhover}
                 style={{ cursor: 'pointer' }}>
                <circle
                  cx={BINDU_POS[0].toFixed(1)} cy={BINDU_POS[1].toFixed(1)}
                  r={selectedId === c9Deity.id ? 28 : 24}
                  fill="none" stroke={GOLD}
                  strokeWidth={selectedId === c9Deity.id ? 1.2 : 0.7}
                  opacity={0.55} />
                <circle
                  cx={BINDU_POS[0].toFixed(1)} cy={BINDU_POS[1].toFixed(1)}
                  r={selectedId === c9Deity.id ? 11 : 8}
                  fill={GOLD}
                  opacity={selectedId === c9Deity.id ? 1 : 0.85} />
              </g>
            )}

            {/* Hover tooltip */}
            {hoveredDot && !selectedId && (
              <Tooltip
                x={hoveredDot.x} y={hoveredDot.y}
                label={isJapanese ? displayName(deityById[hoveredDot.id], 'iast') : displayName(deityById[hoveredDot.id], script)}
                fill={GOLD} script={script}
                kana={isJapanese ? deityById[hoveredDot.id]?.scripts?.kana : null}
              />
            )}

            {/* Hint */}
            {!selectedId && !hoveredDot && (
              <text x={250} y={590} textAnchor="middle"
                fontSize="8" fill={GOLD} opacity="0.35"
                fontFamily="'Gentium Plus', Georgia, serif" fontStyle="italic">
                Tap any position to reveal the deity
              </text>
            )}

          </svg>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: GOLD }} />

            Circuit 8 · Circuit 9
          </span>
        </div>

        <div className="mt-3 text-center">
          <p className="iast text-gold-600 text-xs">
            sarvasiddhiprada cakra · sarvānandamaya cakra
          </p>
          <p className="text-muted mt-1" style={{ fontSize: '10px' }}>
            Positions are approximate — verify against your lineage source
          </p>
        </div>

        <div className="h-0 md:h-8" />
    </div>
  )
}
