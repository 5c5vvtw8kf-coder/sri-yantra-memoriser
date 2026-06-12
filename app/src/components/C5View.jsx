/**
 * C5View.jsx
 *
 * Circuit 5 — Sarvārthasādhaka Chakra (10 outer triangles)
 * Kulōttīrṇa Yoginī
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

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import triangleData from '../data/triangle-regions.json'
import SriYantraSVG from './SriYantraSVG'
import MobileSvaminiButtons, { MobileMemoriseInstr } from './MobileSvaminiButtons'
import { useDoneDelay } from '../hooks/useDoneDelay'

const CX = 260
const CY = 270

const GOLD_FILL    = 'rgba(201,168,76,0.80)'
const ACTIVE_REGION = 'rgba(255,248,200,0.92)'
const GOLD          = '#c9a84c'
const GREEN         = '#27ae60'
const CIRCUIT_VIEWBOX = '148 158 224 224'

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
const C5_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]

const C5_CENTROID_MAP = Object.fromEntries(
  triangleData
    .filter(t => t.circuit === 5)
    .map(t => [t.deitySeq, { x: t.cx, y: t.cy }])
)

const C5_POLYGON_MAP = Object.fromEntries(
  triangleData
    .filter(t => t.circuit === 5)
    .map(t => [t.deitySeq, t.points])
)

const C5_DOT_POSITIONS = Object.fromEntries(
  C5_DEITY_ORDER.map((deitySeq, idx) => [idx + 1, C5_CENTROID_MAP[deitySeq]])
)

function triangleIdForSeq(chantSeq) {
  return `tri-c5-${String(C5_DEITY_ORDER[chantSeq - 1]).padStart(2, '0')}`
}

function trianglePointsForSeq(chantSeq) {
  return C5_POLYGON_MAP[C5_DEITY_ORDER[chantSeq - 1]]
}

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c5Deities = deities
  .filter(d => d.sectionId === 'circuit-5' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const c5Section = data.sections?.find(s => s.circuitNumber === 5 && s.type === 'circuit') || {}

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 14 : script === 'english' ? 14 : 13  // scaled for viewBox 224
  const h        = script === 'devanagari' ? 28 : script === 'english' ? 28 : 26
  const charW    = script === 'devanagari' ? 11.0 : script === 'telugu' ? 13 : script === 'tamil' ? 14 : script === 'english' ? 9.0 : 8.0
  const w        = Math.max(48, label.length * charW + 13)
  const tx       = Math.min(Math.max(x, 153 + w / 2), 367 - w / 2)
  const ty       = y > CY ? y - h / 2 - 12 : y + h / 2 + 12
  return (
    <g pointerEvents="none">
      <rect x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
            width={w.toFixed(1)} height={h} rx={3}
            fill="rgba(15,8,5,0.93)" stroke={GOLD} strokeWidth={0.6} />
      <text x={tx.toFixed(1)} y={ty.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize} fill={GOLD} fontFamily="'Gentium Plus', Georgia, serif">
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
        <button onClick={() => onNavigate('c6')}
          className="px-4 py-2 rounded-lg bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 text-sm transition-colors">
          Next →
        </button>
      </div>
    </div>
  )
}

export default function C5View({
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
  const [selectedId,    setSelectedId]    = useState(null)
  const [hoveredDot,    setHoveredDot]    = useState(null)
  const [mobileRevealed, setMobileRevealed] = useState(false)

  const clickTimer     = useRef(null)
  const lastTapRef     = useRef({ seq: null, time: 0 })
  const pastClickTimer = useRef(null)

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    setHoveredDot(null)
    onDeitySelect(newId ? deityById[newId] : null)
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  // Clear tooltip and reveal state on sequence advance (no auto-reveal — first tap reveals)
  useEffect(() => { setHoveredDot(null); setMobileRevealed(false) }, [currentSeq, memorise])

  const selectedDeity = selectedId ? deityById[selectedId] : null

  const markResult = (seq, result) => { onMarkResult(seq, result); setHoveredDot(null) }

  const handleMemoriseClick = (seq) => {
    if (seq !== currentSeq) return
    const isMobile = window.innerWidth < 768
    if (isMobile && !mobileRevealed) {
      const d   = c5Deities[seq - 1]
      const pos = C5_DOT_POSITIONS[seq]
      if (d && pos) setHoveredDot({ id: d.id, x: pos.x, y: pos.y })
      setMobileRevealed(true)
      lastTapRef.current = { seq, time: Date.now() }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
      markResult(seq, 'wrong')
    } else {
      if (clickTimer.current) return
      clickTimer.current = setTimeout(() => { clickTimer.current = null; markResult(seq, 'correct') }, 280)
    }
  }

  const lastPastTapRef = useRef({ seq: null, time: 0 })
  const handlePastClick = (seq) => {
    const isMobile = window.innerWidth < 768
    const now = Date.now()
    const isDoubleTap = lastPastTapRef.current.seq === seq && (now - lastPastTapRef.current.time) < 300
    lastPastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (pastClickTimer.current) { clearTimeout(pastClickTimer.current); pastClickTimer.current = null }
      onToggleResult(seq)
    } else if (!isMobile) {
      if (pastClickTimer.current) return
      pastClickTimer.current = setTimeout(() => {
        pastClickTimer.current = null
        if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const done = memorise && currentSeq > 12
  const showCompletion = useDoneDelay(done)

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
            viewBox={CIRCUIT_VIEWBOX}
            showTriangles={true} showLabels={false} showNumbers={false}
            filledRegions={filledRegions} />

          <svg viewBox={CIRCUIT_VIEWBOX} xmlns="http://www.w3.org/2000/svg"
               className="absolute inset-0 w-full h-full"
               style={{ background: 'transparent' }}
               aria-label="Circuit 5 — 10 outer triangles deity positions">

            {/* Direction indicator marker */}
            <defs>
              <marker id="c5-cw-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#27ae60" />
              </marker>
            </defs>

            {/* —— Explore mode —— */}
            {!memorise && (
              <>
                {/* Direction arrow — right of seq-1 (deitySeq 6, bottom-centre).
                    Right edge runs from (272.4,326.8) to (260,350.4).
                    sweep=0 (CCW) bows inward toward yantra centre. */}
                <path
                  d="M 275,342 A 25,25 0 0,0 296,329"
                  fill="none" stroke="#27ae60" strokeWidth="2.5"
                  markerEnd="url(#c5-cw-arrow)"
                  style={{ pointerEvents: 'none' }}
                />
                {fillAll && c5Deities.map(d => {
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
                {c5Deities.map(d => {
                  const seq = d.sequenceInSection
                  const pos = C5_DOT_POSITIONS[seq]
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
                {!flash && c5Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq || results[seq] !== 'correct') return null
                  const pts = trianglePointsForSeq(seq)
                  if (!pts) return null
                  return <polygon key={`overlay-${d.id}`} points={pts}
                           fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75}
                           style={{ pointerEvents: 'none' }} />
                })}
                {c5Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq) return null
                  const pts = trianglePointsForSeq(seq)
                  if (!pts) return null
                  return <polygon key={`past-${d.id}`} points={pts} fill="transparent" stroke="none"
                           style={{ cursor: 'pointer' }}
                           onClick={() => handlePastClick(seq)}
                           onContextMenu={e => { e.preventDefault(); onToggleResult(seq) }} />
                })}
                {currentSeq <= 10 && (() => {
                  const d   = c5Deities[currentSeq - 1]
                  const pos = C5_DOT_POSITIONS[currentSeq]
                  const pts = trianglePointsForSeq(currentSeq)
                  if (!d || !pos || !pts) return null
                  return <polygon key={d.id} points={pts} fill="transparent" stroke="none"
                           style={{ cursor: 'pointer' }}
                           onClick={() => handleMemoriseClick(currentSeq)}
                           onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                           onMouseLeave={unhover} />
                })()}
              </>
            )}

            {/* Tooltip: auto-reveals in Memorise; Explore also falls back to selectedId tap */}
            {!flash && (() => {
              if (hoveredDot) return (
                <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                  label={displayName(deityById[hoveredDot.id], script)} script={script} />
              )
              if (!memorise && selectedId) {
                const d   = deityById[selectedId]
                const pos = d ? C5_DOT_POSITIONS[d.sequenceInSection] : null
                if (!pos) return null
                return <Tooltip x={pos.x} y={pos.y} label={displayName(d, script)} script={script} />
              }
              return null
            })()}

          </svg>
        </div>
      </div>

      {memorise && <MobileMemoriseInstr />}

      <MobileSvaminiButtons
        section={c5Section}
        script={script}
        svaminiSeq={11}
        yoginiSeq={12}
        memorise={memorise}
        currentSeq={currentSeq}
        results={results}
        onMarkResult={onMarkResult}
        onToggleResult={onToggleResult}
      />

      {showCompletion && <CompletionPanel results={results} onRestart={onStartMemorise} onNavigate={onNavigate} />}

    </div>
  )
}
