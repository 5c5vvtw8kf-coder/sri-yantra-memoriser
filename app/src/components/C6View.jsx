/**
 * C6View.jsx
 *
 * Circuit 6 — Sarvarakṣākara Chakra (10 inner triangles)
 * Nigarbha Yoginī
 *
 * ── Modes ─────────────────────────────────────────────────────────────────────
 *
 * Explore  — all 10 triangles cream to highlight the avarana.
 *            Hover → tooltip. Click → triangle turns red, right panel shows deity.
 *
 * Memorise — triangles revealed one at a time (chant order).
 *            Active triangle: cream fill, hover to reveal name.
 *            Double-click = memorised → red fill + dark-red stroke.
 *            Single-click = not memorised → triangle stays gold, advance.
 *            seq 11 = Chakra Svāminī (right-panel only)
 *            seq 12 = Yoginī (right-panel only)
 *            > 12   = done
 */

import { useState, useRef } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import triangleData from '../data/triangle-regions.json'
import SriYantraSVG from './SriYantraSVG'

const CX = 260
const CY = 270

const GOLD_FILL    = 'rgba(201,168,76,0.80)'
const ACTIVE_REGION = 'rgba(255,248,200,0.92)'
const GOLD          = '#c9a84c'

const YANTRA_FILLS = {
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
    [`petal-c2-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length:  8 }, (_, i) =>
    [`petal-c3-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
    [`tri-c4-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c5-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c6-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length:  8 }, (_, i) =>
    [`tri-c7-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  'tri-c8-01':    GOLD_FILL,
  'tri-c8-bg-01': '#0f0805',
  'tri-c8-bg-02': '#0f0805',
  'c9':           '#000000',
}

// Chant sequence → geometric deitySeq
const C6_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]

const C6_CENTROID_MAP = Object.fromEntries(
  triangleData
    .filter(t => t.circuit === 6)
    .map(t => [t.deitySeq, { x: t.cx, y: t.cy }])
)

const C6_POLYGON_MAP = Object.fromEntries(
  triangleData
    .filter(t => t.circuit === 6)
    .map(t => [t.deitySeq, t.points])
)

const C6_DOT_POSITIONS = Object.fromEntries(
  C6_DEITY_ORDER.map((deitySeq, idx) => [idx + 1, C6_CENTROID_MAP[deitySeq]])
)

function triangleIdForSeq(chantSeq) {
  return `tri-c6-${String(C6_DEITY_ORDER[chantSeq - 1]).padStart(2, '0')}`
}

function trianglePointsForSeq(chantSeq) {
  return C6_POLYGON_MAP[C6_DEITY_ORDER[chantSeq - 1]]
}

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c6Deities = deities
  .filter(d => d.sectionId === 'circuit-6' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)


function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 19 : script === 'english' ? 18 : 17
  const h        = script === 'devanagari' ? 38 : script === 'english' ? 36 : 34
  const charW    = script === 'devanagari' ? 14 : script === 'telugu' ? 16 : script === 'tamil' ? 17 : script === 'english' ? 11.5 : 10.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 49), 471 - w / 2)
  const ty       = y > CY ? y - h / 2 - 18 : y + h / 2 + 18
  return (
    <g pointerEvents="none">
      <rect x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
            width={w.toFixed(1)} height={h} rx={3}
            fill="rgba(15,8,5,0.93)" stroke={GOLD} strokeWidth={0.6} />
      <text x={tx.toFixed(1)} y={ty.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize} fill={GOLD} fontFamily="serif">
        {label}
      </text>
    </g>
  )
}

function CompletionPanel({ results, onRestart, onNavigate }) {
  const correct = Object.values(results).filter(v => v === 'correct').length
  const skipped = 12 - correct
  return (
    <div className="mt-4 rounded-xl border border-surface-700 bg-surface-900/80 p-5 text-center">
      <p className="text-gold-400 text-base font-medium mb-1">Round complete</p>
      <p className="text-cream text-sm mb-4">
        <span className="text-red-400">{correct}/12 memorised</span>
        {skipped > 0 && <span className="text-muted"> · {skipped} to review</span>}
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onRestart}
          className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-cream text-sm transition-colors">
          Try again
        </button>
        <button onClick={() => onNavigate('c7')}
          className="px-4 py-2 rounded-lg bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 text-sm transition-colors">
          Next circuit →
        </button>
      </div>
    </div>
  )
}

export default function C6View({
  script          = 'iast',
  onDeitySelect   = () => {},
  highlightId     = null,
  fillAll         = false,
  memorise        = false,
  currentSeq      = 1,
  results         = {},
  onStartMemorise = () => {},
  onExitMemorise  = () => {},
  onMarkResult    = () => {},
  onToggleResult  = () => {},
  flash           = false,
  onNavigate      = () => {},
}) {
  const [selectedId,  setSelectedId]  = useState(null)
  const [hoveredDot,  setHoveredDot]  = useState(null)

  const clickTimer     = useRef(null)
  const pastClickTimer = useRef(null)

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    onDeitySelect(newId ? deityById[newId] : null)
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  const selectedDeity = selectedId ? deityById[selectedId] : null

  const markResult = (seq, result) => { onMarkResult(seq, result); setHoveredDot(null) }

  const handleMemoriseClick = (seq) => {
    if (seq !== currentSeq) return
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => { clickTimer.current = null; markResult(seq, 'correct') }, 280)
  }

  const handleMemoriseDoubleClick = (seq) => {
    if (seq !== currentSeq) return
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    markResult(seq, 'wrong')
  }

  const handlePastClick = (seq) => {
    if (pastClickTimer.current) return
    pastClickTimer.current = setTimeout(() => {
      pastClickTimer.current = null
      if (results[seq] !== 'correct') onToggleResult(seq)
    }, 280)
  }

  const handlePastDoubleClick = (seq) => {
    if (pastClickTimer.current) { clearTimeout(pastClickTimer.current); pastClickTimer.current = null }
    if (results[seq] === 'correct') onToggleResult(seq)
  }

  const done = memorise && currentSeq > 12

  const filledRegions = (() => {
    if (memorise) {
      if (flash) return { ...YANTRA_FILLS }
      const fills = { ...YANTRA_FILLS }
      if (currentSeq <= 10) fills[triangleIdForSeq(currentSeq)] = ACTIVE_REGION
      for (let seq = 1; seq < currentSeq; seq++) {
        if (results[seq] === 'correct') fills[triangleIdForSeq(seq)] = 'rgba(200,70,70,0.85)'
      }
      return fills
    }
    const fills = { ...YANTRA_FILLS }
    const RED = 'rgba(200,70,70,0.85)'
    if (fillAll) {
      for (let i = 1; i <= 10; i++) fills[triangleIdForSeq(i)] = RED
    } else {
      for (let i = 1; i <= 10; i++) fills[triangleIdForSeq(i)] = ACTIVE_REGION
      const focusDeity = selectedDeity
        || (hoveredDot ? deityById[hoveredDot.id] : null)
        || (highlightId ? deityById[highlightId] : null)
      if (focusDeity) fills[triangleIdForSeq(focusDeity.sequenceInSection)] = RED
    }
    return fills
  })()

  return (
    <div className="w-full p-4">

      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">

          <SriYantraSVG className="w-full h-full"
            showTriangles={true} showLabels={false} showNumbers={false}
            filledRegions={filledRegions} />

          <svg viewBox="45 55 430 430" xmlns="http://www.w3.org/2000/svg"
               className="absolute inset-0 w-full h-full"
               style={{ background: 'transparent' }}
               aria-label="Circuit 6 — 10 inner triangles deity positions">

            {/* Explore mode */}
            {!memorise && (
              <>
                {fillAll && c6Deities.map(d => {
                  const pts = trianglePointsForSeq(d.sequenceInSection)
                  if (!pts) return null
                  return <polygon key={`fill-${d.id}`} points={pts} fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75} style={{ pointerEvents: 'none' }} />
                })}
                {!fillAll && (selectedDeity || highlightId) && (() => {
                  const d = selectedDeity ?? deityById[highlightId]
                  if (!d) return null
                  const pts = trianglePointsForSeq(d.sequenceInSection)
                  if (!pts) return null
                  return <polygon points={pts} fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75} style={{ pointerEvents: 'none' }} />
                })()}
                {c6Deities.map(d => {
                  const seq = d.sequenceInSection
                  const pos = C6_DOT_POSITIONS[seq]
                  const pts = trianglePointsForSeq(seq)
                  if (!pos || !pts) return null
                  return <polygon key={d.id} points={pts} fill="transparent" stroke="none"
                           style={{ cursor: 'pointer' }}
                           onClick={() => toggle(d.id)}
                           onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                           onMouseLeave={unhover} />
                })}
              </>
            )}

            {/* Memorise mode */}
            {memorise && !done && (
              <>
                {!flash && c6Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq || results[seq] !== 'correct') return null
                  const pts = trianglePointsForSeq(seq)
                  if (!pts) return null
                  return <polygon key={`overlay-${d.id}`} points={pts}
                           fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75}
                           style={{ pointerEvents: 'none' }} />
                })}
                {c6Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq) return null
                  const pts = trianglePointsForSeq(seq)
                  if (!pts) return null
                  return <polygon key={`past-${d.id}`} points={pts} fill="transparent" stroke="none"
                           style={{ cursor: 'pointer' }}
                           onClick={() => handlePastClick(seq)}
                           onDoubleClick={() => handlePastDoubleClick(seq)}
                           onContextMenu={e => { e.preventDefault(); onToggleResult(seq) }} />
                })}
                {currentSeq <= 10 && (() => {
                  const d   = c6Deities[currentSeq - 1]
                  const pos = C6_DOT_POSITIONS[currentSeq]
                  const pts = trianglePointsForSeq(currentSeq)
                  if (!d || !pos || !pts) return null
                  return <polygon key={d.id} points={pts} fill="transparent" stroke="none"
                           style={{ cursor: 'pointer' }}
                           onClick={() => handleMemoriseClick(currentSeq)}
                           onDoubleClick={() => handleMemoriseDoubleClick(currentSeq)}
                           onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                           onMouseLeave={unhover} />
                })()}
              </>
            )}

            {hoveredDot && (
              <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                label={displayName(deityById[hoveredDot.id], script)} script={script} />
            )}

          </svg>
        </div>
      </div>

      {done && <CompletionPanel results={results} onRestart={onStartMemorise} onNavigate={onNavigate} />}


    </div>
  )
}
