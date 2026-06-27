/**
 * C4View.jsx
 *
 * Circuit 4 — Sarva Saubhāgyadāyaka Chakra (14 triangles)
 * Sampradāya Yoginī
 *
 * ── Modes ─────────────────────────────────────────────────────────────────────
 *
 * Explore  — all 14 triangles cream to highlight the avarana.
 *            Hover → tooltip. Click → triangle turns red, right panel shows deity.
 *
 * Memorise — triangles revealed one at a time (chant order).
 *            Active triangle: cream fill, hover to reveal name.
 *            Double-click = memorised → red fill + dark-red stroke.
 *            Single-click = not memorised → triangle stays gold, advance.
 *            seq 15 = Chakra Svāminī (right-panel only)
 *            seq 16 = Yoginī (right-panel only)
 *            > 16   = done
 *
 * Triangle ID ↔ chant sequence: via C4_DEITY_ORDER mapping.
 *   C4_DEITY_ORDER[chantSeq - 1] → geometric deitySeq → SVG element ID tri-c4-XX
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import triangleData from '../data/triangle-regions.json'
import SriYantraSVG from './SriYantraSVG'
import MobileSvaminiButtons, { MobileMemoriseInstr } from './MobileSvaminiButtons'
import { useDoneDelay } from '../hooks/useDoneDelay'

// ── Coordinate constants ───────────────────────────────────────────────────────

const CX = 260
const CY = 270

// ── Yantra fills — gold petals & triangles, black bindu ───────────────────────

const GOLD_FILL    = 'rgba(201,168,76,0.80)'
const BROWN_FILL   = 'rgba(138,117,96,0.35)'
const ACTIVE_REGION = 'rgba(255,248,200,0.92)'
const GOLD          = '#c9a84c'
const GREEN         = '#27ae60'
const CIRCUIT_VIEWBOX = '130 140 260 260'
const FULL_VIEWBOX    = '45 55 430 430'

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

// Brown version for Memorise mode — makes gold dots stand out
const YANTRA_FILLS_BROWN = Object.fromEntries(
  Object.entries(YANTRA_FILLS).map(([k, v]) => [k, v === GOLD_FILL ? BROWN_FILL : v])
)

// ── Triangle geometry ──────────────────────────────────────────────────────────

// Chant sequence → geometric deitySeq
// Starts at bottom centre (deitySeq 8, chant seq 1), runs clockwise up the
// right side, across the top, down the left side.
const C4_DEITY_ORDER = [8, 7, 6, 5, 4, 3, 2, 1, 14, 13, 12, 11, 10, 9]

// deitySeq → centroid {x, y}
const C4_CENTROID_MAP = Object.fromEntries(
  triangleData
    .filter(t => t.circuit === 4)
    .map(t => [t.deitySeq, { x: t.cx, y: t.cy }])
)

// deitySeq → polygon points string
const C4_POLYGON_MAP = Object.fromEntries(
  triangleData
    .filter(t => t.circuit === 4)
    .map(t => [t.deitySeq, t.points])
)

// chant seq (1–14) → centroid position for tooltip
const C4_DOT_POSITIONS = Object.fromEntries(
  C4_DEITY_ORDER.map((deitySeq, idx) => [idx + 1, C4_CENTROID_MAP[deitySeq]])
)

// SVG fill key for a given chant seq (matches YANTRA_FILLS keys)
function triangleIdForSeq(chantSeq) {
  return `tri-c4-${String(C4_DEITY_ORDER[chantSeq - 1]).padStart(2, '0')}`
}

// Polygon points string for a given chant seq (from triangle-regions.json)
function trianglePointsForSeq(chantSeq) {
  return C4_POLYGON_MAP[C4_DEITY_ORDER[chantSeq - 1]]
}

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c4Deities = deities
  .filter(d => d.sectionId === 'circuit-4' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const c4Section = data.sections?.find(s => s.circuitNumber === 4 && s.type === 'circuit') || {}

const c4SvaminiDeity = deities.find(d => d.sectionId === 'circuit-4' && d.role === 'chakraSvamini') ?? null
const c4YoginiDeity = deities.find(d => d.sectionId === 'circuit-4' && d.role === 'yoginiType') ?? null

// ── Tooltip ───────────────────────────────────────────────────────────────────

// Per-sequence vertical offset (SVG units) to clear the next triangle's dot.
// Calculated from actual centroid distances: offset = (y_current - y_next) + dot_radius + margin
// Right side (seqs 1–4): tooltips go above; larger offset clears the next dot above.
// Left side (seqs 8–11): tooltips go below; larger offset clears the next dot below.
const C4_TOOLTIP_OFFSET = { 1: 35, 2: 52, 3: 44, 4: 70, 8: 38, 9: 55, 10: 42, 11: 70 }

function Tooltip({ x, y, label, script, seq, isMobile }) {
  if (!label) return null
  const fontSize = isMobile
    ? (script === 'devanagari' ? 18 : script === 'english' ? 17 : 16)
    : (script === 'devanagari' ? 26 : script === 'english' ? 25 : 24)
  const h = isMobile
    ? ((script === 'devanagari' || script === 'kannada' || script === 'malayalam') ? 36 : script === 'english' ? 34 : 32)
    : ((script === 'devanagari' || script === 'kannada' || script === 'malayalam') ? 52 : script === 'english' ? 50 : 48)
  const charW = isMobile
    ? (script === 'devanagari' ? 12.5 : script === 'telugu' ? 14.5 : script === 'tamil' ? 15.5 : script === 'kannada' ? 14 : script === 'malayalam' ? 15 : script === 'english' ? 10 : 9.5)
    : (script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'kannada' ? 20 : script === 'malayalam' ? 23 : script === 'english' ? 14.5 : 13.5)
  const w  = isMobile ? Math.max(50, label.length * charW + 14) : Math.max(60, label.length * charW + 18)
  const tx = isMobile
    ? Math.min(Math.max(x, 135 + w / 2), 385 - w / 2)
    : Math.min(Math.max(x, w / 2 + 49), 471 - w / 2)
  const yOff = isMobile ? ((seq != null && seq in C4_TOOLTIP_OFFSET) ? C4_TOOLTIP_OFFSET[seq] : 14) : 18
  const ty   = y > CY ? y - h / 2 - yOff : y + h / 2 + yOff
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
        fontSize={fontSize} fill={GOLD} fontFamily="'Gentium Plus', Georgia, serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Completion panel ──────────────────────────────────────────────────────────


const NUMERAL_DIGITS_CP = {
  hi: ['०','१','२','३','४','५','६','७','८','९'],
  kn: ['೦','೧','೨','೩','೪','೫','೬','೭','೮','೯'],
  ta: ['௦','௧','௨','௩','௪','௫','௬','௭','௮','௯'],
  te: ['౦','౧','౨','౩','౪','౫','౬','౭','౮','౯'],
  ml: ['൦','൧','൨','൩','൪','൫','൬','൭','൮','൯'],
}
function localNumCP(n, lang) {
  const d = NUMERAL_DIGITS_CP[lang]
  if (!d) return n
  return String(n).replace(/[0-9]/g, x => d[+x])
}

function CompletionPanel({ results, onRestart, onNavigate, tr = k => k, uiLang = 'en' }) {
  const correct = Object.values(results).filter(v => v === 'correct').length
  const skipped = 16 - correct
  return (
    <div className="mt-4 rounded-xl border border-surface-700 bg-surface-900/80 p-5 text-center">
      <p className="text-gold-400 text-base font-medium mb-1">{Object.values(results).filter(v => v === 'correct').length === 16 ? tr('misc.all_memorised') : tr('spot.round_complete')}</p>
      <p className="text-cream text-sm mb-4">
        <span className="text-red-400">{localNumCP(correct,uiLang)}/{localNumCP(16,uiLang)} {tr('misc.memorised')}</span>
        {skipped > 0 && <span className="text-muted"> · {localNumCP(skipped,uiLang)} {tr('score.not_memorised')}</span>}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-cream text-sm transition-colors"
        >
          {tr('misc.try_again')}
        </button>
        <button
          onClick={() => onNavigate('c5')}
          className="px-4 py-2 rounded-lg bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 text-sm transition-colors"
        >
          {tr('misc.next')}
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function C4View({
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
  tr               = k => k,
  uiLang           = 'en',
}) {
  const [selectedId,    setSelectedId]    = useState(null)
  const [hoveredDot,    setHoveredDot]    = useState(null)
  const [mobileRevealed, setMobileRevealed] = useState(false)

  const clickTimer     = useRef(null)
  const lastTapRef     = useRef({ seq: null, time: 0 })
  const pastClickTimer = useRef(null)

  // ── Explore handlers ────────────────────────────────────────────────────────

  const toggle = (id) => {
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

  // ── Memorise handlers ───────────────────────────────────────────────────────

  const markResult = (seq, result) => {
    onMarkResult(seq, result)
    setHoveredDot(null)
  }

  const handleMemoriseClick = (seq) => {
    if (seq !== currentSeq) return
    const isMobile = window.innerWidth < 768
    if (isMobile && !mobileRevealed) {
      const d   = c4Deities[seq - 1]
      const pos = C4_DOT_POSITIONS[seq]
      if (d && pos) setHoveredDot({ id: d.id, x: pos.x, y: pos.y })
      setMobileRevealed(true)
      lastTapRef.current = { seq: null, time: 0 }
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
  const handlePastTriangleClick = (seq) => {
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

  const done = memorise && currentSeq > 16
  const showCompletion = useDoneDelay(done)

  // ── Filled regions ──────────────────────────────────────────────────────────

  const filledRegions = (() => {
    if (memorise) {
      if (flash) return { ...YANTRA_FILLS }
      const fills = { ...YANTRA_FILLS_BROWN }
      if (currentSeq <= 14) fills[triangleIdForSeq(currentSeq)] = ACTIVE_REGION
      for (let seq = 1; seq < currentSeq; seq++) {
        if (results[seq] === 'correct') fills[triangleIdForSeq(seq)] = 'rgba(200,70,70,0.85)'
        else fills[triangleIdForSeq(seq)] = GOLD_FILL
      }
      return fills
    }
    // Explore: all 14 C4 triangles cream; selected/highlighted/fillAll turns red
    const fills = { ...YANTRA_FILLS }
    const RED = 'rgba(200,70,70,0.85)'
    if (fillAll) {
      for (let i = 1; i <= 14; i++) fills[triangleIdForSeq(i)] = RED
    } else {
      for (let i = 1; i <= 14; i++) fills[triangleIdForSeq(i)] = ACTIVE_REGION
      const focusDeity = selectedDeity
        || (hoveredDot ? deityById[hoveredDot.id] : null)
        || (highlightId ? deityById[highlightId] : null)
      if (focusDeity) fills[triangleIdForSeq(focusDeity.sequenceInSection)] = RED
    }
    return fills
  })()

  // ── Render ──────────────────────────────────────────────────────────────────

  const isMobileView = window.innerWidth < 768
  const activeViewBox = isMobileView ? CIRCUIT_VIEWBOX : FULL_VIEWBOX

  return (
    <div className="w-full px-4 pt-3 pb-0 md:p-4 flex-1 flex flex-col md:block md:flex-none">

      {/* Diagram */}
      <div
        className="relative w-full flex-1 min-h-0 md:flex-none rounded-xl overflow-hidden shadow-2xl shadow-black/60 md:[padding-bottom:100%]"
      >
        <div className="absolute inset-0">

          <SriYantraSVG
            className="w-full h-full"
            viewBox={activeViewBox}
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={filledRegions}
          />

          <svg
            viewBox={activeViewBox}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label="Circuit 4 — 14 triangles deity positions"
          >

            {/* Direction indicator marker */}
            <defs>
              <marker id="c4-cw-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#27ae60" />
              </marker>
            </defs>

            {/* —— Explore mode —— */}
            {!memorise && (
              <>
                {/* Sequence direction indicator — short inward-curving arc in the
                    black interstice to the right of seq-1 (Sarvaśaṅkṣobhiṇī).
                    seq-1 right edge runs from (281.684,350.38) to (260,380).
                    Arc sits outside that edge, below seq-2 body (above y=350).
                    sweep=0 (CCW) bows the arc toward the yantra centre (inward). */}
                <path
                  d="M 276,370 A 28,28 0 0,0 298,358"
                  fill="none"
                  stroke="#27ae60"
                  strokeWidth="2.5"
                  markerEnd="url(#c4-cw-arrow)"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Red fill overlay — covers gold stroke */}
                {fillAll && c4Deities.map(d => {
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

                {/* Transparent hit areas over all 14 triangles */}
                {c4Deities.map(d => {
                  const seq = d.sequenceInSection
                  const pos = C4_DOT_POSITIONS[seq]
                  const pts = trianglePointsForSeq(seq)
                  if (!pos || !pts) return null
                  return (
                    <polygon
                      key={d.id}
                      points={pts}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggle(d.id)}
                      onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={unhover}
                    />
                  )
                })}
              </>
            )}

            {/* ── Memorise mode ── */}
            {memorise && !done && (
              <>
                {/* Red overlays for memorised triangles — hidden during flash */}
                {!flash && c4Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq || results[seq] !== 'correct') return null
                  const pts = trianglePointsForSeq(seq)
                  if (!pts) return null
                  return (
                    <polygon
                      key={`overlay-${d.id}`}
                      points={pts}
                      fill="rgba(200,70,70,0.85)"
                      stroke="#7a1a1a"
                      strokeWidth={0.75}
                      style={{ pointerEvents: 'none' }}
                    />
                  )
                })}

                {/* Past triangle hit areas (toggle/correct on click/dblclick) */}
                {c4Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq) return null
                  const pts = trianglePointsForSeq(seq)
                  if (!pts) return null
                  return (
                    <polygon
                      key={`past-${d.id}`}
                      points={pts}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePastTriangleClick(seq)}
                      onContextMenu={e => { e.preventDefault(); onToggleResult(seq) }}
                    />
                  )
                })}

                {/* Active triangle hit area */}
                {currentSeq <= 14 && (() => {
                  const d   = c4Deities[currentSeq - 1]
                  const pos = C4_DOT_POSITIONS[currentSeq]
                  const pts = trianglePointsForSeq(currentSeq)
                  if (!d || !pos || !pts) return null
                  return (
                    <polygon
                      key={d.id}
                      points={pts}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleMemoriseClick(currentSeq)}
                      onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={unhover}
                    />
                  )
                })()}
              </>
            )}

            {/* Tooltip: Explore tap-to-reveal; Memorise desktop hover */}
            {!flash && (() => {
              if (hoveredDot) {
                const hd = deityById[hoveredDot.id]
                return (
                  <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                    label={displayName(hd, script)} script={script}
                    seq={hd?.sequenceInSection} isMobile={isMobileView} />
                )
              }
              if (!memorise && selectedId) {
                const d   = deityById[selectedId]
                const pos = d ? C4_DOT_POSITIONS[d.sequenceInSection] : null
                if (!pos) return null
                return <Tooltip x={pos.x} y={pos.y} label={displayName(d, script)} script={script}
                         seq={d.sequenceInSection} isMobile={isMobileView} />
              }
              return null
            })()}

          </svg>
        </div>
      </div>

      {memorise && <MobileMemoriseInstr tr={tr} />}

      <MobileSvaminiButtons
        section={c4Section}
        svaminiDeity={c4SvaminiDeity}
        yoginiDeity={c4YoginiDeity}
        script={script}
        tr={tr}
        svaminiSeq={15}
        yoginiSeq={16}
        memorise={memorise}
        currentSeq={currentSeq}
        results={results}
        onMarkResult={onMarkResult}
        onToggleResult={onToggleResult}
      />

      {/* Completion panel */}
      {showCompletion && (
        <CompletionPanel
          results={results}
          onRestart={onStartMemorise}
          onNavigate={onNavigate}
          tr={tr}
          uiLang={uiLang}
        />
      )}

    </div>
  )
}
