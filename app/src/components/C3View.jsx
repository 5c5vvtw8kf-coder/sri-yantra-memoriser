/**
 * C3View.jsx
 *
 * Circuit 3 — Sarva Saṅkṣobhaṇa Chakra (8-petal lotus)
 * Guptatara Yoginī
 *
 * ── Modes ─────────────────────────────────────────────────────────────────────
 *
 * Explore  — All 8 petals cream. Tap any petal to focus it.
 *            Green arc arrow INSIDE the ring points from current focus → next.
 *            Tapping the focused petal advances to the next (sequential explorer).
 *            Tapping any other petal jumps to it.
 *            Tooltips in four fixed corner zones (same as C2 — always clear of petals).
 *
 * Memorise — Petals revealed one at a time (chant order).
 *            Active petal: cream fill, hover/tap to reveal name.
 *            Single-tap = correct (red); double-tap = wrong.
 *            Green arrow shows from current → next petal (seqs 1–7).
 *            seq 9  = Chakra Svāminī (MobileSvaminiButtons)
 *            seq 10 = Yoginī (MobileSvaminiButtons)
 *            > 10   = done
 *
 * Petal angles in SVG (0°=top, clockwise):
 *   seq 1 → petal-c3-01 → 0°    seq 5 → petal-c3-05 →  45°
 *   seq 2 → petal-c3-02 → 90°   seq 6 → petal-c3-06 → 135°
 *   seq 3 → petal-c3-03 → 180°  seq 7 → petal-c3-07 → 225°
 *   seq 4 → petal-c3-04 → 270°  seq 8 → petal-c3-08 → 315°
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import SriYantraSVG, { C3_PETALS } from './SriYantraSVG'
import MobileSvaminiButtons, { MobileMemoriseInstr } from './MobileSvaminiButtons'
import { useDoneDelay } from '../hooks/useDoneDelay'

// ── Coordinate constants ───────────────────────────────────────────────────────

const CX = 260
const CY = 270

// ── Yantra fills ───────────────────────────────────────────────────────────────

const GOLD_FILL    = 'rgba(201,168,76,0.80)'
const BROWN_FILL   = 'rgba(138,117,96,0.35)'
const ACTIVE_PETAL = 'rgba(255,248,200,0.92)'

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

// ── Petal geometry ─────────────────────────────────────────────────────────────

// Centroid positions keyed by petal number (seq = petal number for C3)
const C3_DOT_POSITIONS = Object.fromEntries(
  C3_PETALS.map(p => {
    const num = parseInt(p.id.slice(-2), 10)
    return [num, { x: p.cx, y: p.cy }]
  })
)

// Full SVG path keyed by petal number
const C3_PETAL_PATH_MAP = Object.fromEntries(
  C3_PETALS.map(p => [parseInt(p.id.slice(-2), 10), p.path])
)

function petalIdForSeq(seq)   { return `petal-c3-${String(seq).padStart(2, '0')}` }
function petalPathForSeq(seq) { return C3_PETAL_PATH_MAP[seq] }

// ── Direction arrow ────────────────────────────────────────────────────────────
//
// Green arc drawn at ARROW_R (inside the C3 ring, which starts at Rin=110).
// Clockwise from the current focus petal to the next.
//
// Petal SVG angles (0°=top, clockwise):
//   seq 1:   0°   seq 2:  90°   seq 3: 180°   seq 4: 270°
//   seq 5:  45°   seq 6: 135°   seq 7: 225°   seq 8: 315°

const C3_SEQ_ANGLE = { 1: 0, 2: 90, 3: 180, 4: 270, 5: 45, 6: 135, 7: 225, 8: 315 }
const ARROW_R      = 92   // px — inside C3 inner ring edge (Rin = 110)

function arcPt(angleDeg, r) {
  const rad = angleDeg * Math.PI / 180
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)]
}

/**
 * c3ArrowPath — straight line from inner position of fromSeq to toSeq.
 * ±8° offset leaves breathing room around each petal tip.
 */
function c3ArrowPath(fromSeq, toSeq) {
  const [fx, fy] = arcPt(C3_SEQ_ANGLE[fromSeq] + 8, ARROW_R)
  // Wrap arrow (8→1): use a larger offset so the head swings left toward the top-petal centre
  const toOffset = (fromSeq === 8 && toSeq === 1) ? -18 : -8
  const [tx, ty] = arcPt(C3_SEQ_ANGLE[toSeq] + toOffset, ARROW_R)
  return `M ${fx.toFixed(1)},${fy.toFixed(1)} L ${tx.toFixed(1)},${ty.toFixed(1)}`
}

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD = '#c9a84c'

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c3Deities = deities
  .filter(d => d.sectionId === 'circuit-3' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const c3Section = data.sections?.find(s => s.circuitNumber === 3 && s.type === 'circuit') || {}

// ── Tooltip — four fixed corner zones (same as C2) ────────────────────────────
//
// Quadrant of the petal centroid relative to the yantra centre determines
// which corner zone the tooltip occupies — always clear of the petal ring.

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = (script === 'devanagari' || script === 'kannada' || script === 'malayalam') ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'kannada' ? 20 : script === 'malayalam' ? 23 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)
  const hw = w / 2, hh = h / 2

  const dx = x - CX
  const dy = y - CY
  let zx, zy
  if      (dx >= 0 && dy <= 0) { zx = 405; zy = 90  }  // top-right
  else if (dx >= 0 && dy >  0) { zx = 405; zy = 450 }  // bottom-right
  else if (dx <  0 && dy >  0) { zx = 115; zy = 450 }  // bottom-left
  else                          { zx = 115; zy = 90  }  // top-left

  const tx = Math.min(Math.max(zx, hw + 49), 471 - hw)
  const ty = Math.min(Math.max(zy, hh + 57), 485 - hh - 2)

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

function CompletionPanel({ results, onRestart, onNavigate }) {
  const correct = Object.values(results).filter(v => v === 'correct').length
  const skipped = 10 - correct
  return (
    <div className="mt-4 rounded-xl border border-surface-700 bg-surface-900/80 p-5 text-center">
      <p className="text-gold-400 text-base font-medium mb-1">Round complete</p>
      <p className="text-cream text-sm mb-4">
        <span className="text-red-400">{correct}/10 memorised</span>
        {skipped > 0 && <span className="text-muted"> · {skipped} to review</span>}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-cream text-sm transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => onNavigate('c4')}
          className="px-4 py-2 rounded-lg bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 text-sm transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function C3View({
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
  const [selectedId,     setSelectedId]     = useState(null)
  const [hoveredDot,     setHoveredDot]     = useState(null)
  const [mobileRevealed, setMobileRevealed] = useState(false)
  // Explore mode: tracks which petal is currently focused (1–8, wraps).
  // Tapping the focused petal advances to the next; tapping another jumps to it.
  const [exploreSeq,     setExploreSeq]     = useState(1)

  const clickTimer     = useRef(null)
  const lastTapRef     = useRef({ seq: null, time: 0 })
  const pastClickTimer = useRef(null)

  // ── Explore handlers ────────────────────────────────────────────────────────

  /**
   * handleExploreClick — Nyāsa-style sequential advance.
   *   Tap focused petal  → advance exploreSeq to the next petal (1→2→…→8→1).
   *   Tap any other petal → jump exploreSeq to that petal.
   * Either way, selectedId is kept in sync for tooltip + red-fill.
   */
  const handleExploreClick = (seq, id) => {
    if (selectedId === id) {
      // Already selected — advance to next
      const nextSeq   = (seq % 8) + 1
      const nextDeity = c3Deities[nextSeq - 1]
      setExploreSeq(nextSeq)
      setSelectedId(nextDeity?.id ?? null)
      setHoveredDot(null)
      onDeitySelect(nextDeity ?? null)
    } else {
      // First tap — select this petal and show its name
      setExploreSeq(seq)
      setSelectedId(id)
      setHoveredDot(null)
      onDeitySelect(deityById[id] ?? null)
    }
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
      const d   = c3Deities[seq - 1]
      const pos = C3_DOT_POSITIONS[seq]
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
  const handlePastPetalClick = (seq) => {
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

  const done = memorise && currentSeq > 10
  const showCompletion = useDoneDelay(done)

  // ── Filled regions ──────────────────────────────────────────────────────────

  const filledRegions = (() => {
    if (memorise) {
      if (flash) return { ...YANTRA_FILLS }
      const fills = { ...YANTRA_FILLS_BROWN }
      if (currentSeq <= 8) fills[petalIdForSeq(currentSeq)] = ACTIVE_PETAL
      for (let seq = 1; seq < currentSeq; seq++) {
        if (results[seq] === 'correct') fills[petalIdForSeq(seq)] = 'rgba(200,70,70,0.85)'
        else fills[petalIdForSeq(seq)] = GOLD_FILL
      }
      return fills
    }
    // Explore: all 8 petals cream; focused/selected/highlighted petal turns red
    const fills    = { ...YANTRA_FILLS }
    const RED_PETAL = 'rgba(200,70,70,0.85)'
    if (fillAll) {
      for (let i = 1; i <= 8; i++) fills[petalIdForSeq(i)] = RED_PETAL
    } else {
      for (let i = 1; i <= 8; i++) fills[petalIdForSeq(i)] = ACTIVE_PETAL
      // Hover overrides; fall back to selectedId (which tracks exploreSeq after first tap)
      const focusDeity = (hoveredDot ? deityById[hoveredDot.id] : null)
        || selectedDeity
        || (highlightId ? deityById[highlightId] : null)
      if (focusDeity) fills[petalIdForSeq(focusDeity.sequenceInSection)] = RED_PETAL
    }
    return fills
  })()

  // ── Render ──────────────────────────────────────────────────────────────────

  // Arrow seq for each mode:
  //   Explore  → exploreSeq (next = (exploreSeq % 8) + 1, wraps 8→1)
  //   Memorise → currentSeq (only shown for seqs 1–7; seq 8 next is Svāminī, not seq 1)
  const arrowFromSeq = memorise ? currentSeq : exploreSeq
  const arrowToSeq   = memorise
    ? currentSeq + 1                          // next in sequence
    : (exploreSeq % 8) + 1                    // wraps 8→1 in Explore
  const showArrow = memorise
    ? (currentSeq >= 1 && currentSeq <= 7)    // stop before Svāminī
    : true                                    // always shown in Explore

  return (
    <div className="w-full px-4 pt-3 pb-0 md:p-4 flex-1 flex flex-col md:block md:flex-none">

      {/* Diagram */}
      <div
        className="relative w-full flex-1 min-h-0 md:flex-none rounded-xl overflow-hidden shadow-2xl shadow-black/60 md:[padding-bottom:100%]"
      >
        <div className="absolute inset-0">

          <SriYantraSVG
            className="w-full h-full"
            preserveAspectRatio="xMidYMin meet"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={filledRegions}
          />

          <svg
            viewBox="45 55 430 430"
            preserveAspectRatio="xMidYMin meet"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label="Circuit 3 — 8-petal lotus deity positions"
          >

            <defs>
              {/* Arrowhead for inside-ring direction indicator */}
              <marker id="c3-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#27ae60" />
              </marker>
            </defs>

            {/* ── Explore mode ── */}
            {!memorise && (
              <>
                {fillAll && c3Deities.map(d => {
                  const pathD = petalPathForSeq(d.sequenceInSection)
                  if (!pathD) return null
                  return <path key={`fill-${d.id}`} d={pathD} fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75} style={{ pointerEvents: 'none' }} />
                })}
                {!fillAll && (selectedDeity || highlightId) && (() => {
                  const d = selectedDeity ?? deityById[highlightId]
                  if (!d) return null
                  const pathD = petalPathForSeq(d.sequenceInSection)
                  if (!pathD) return null
                  return <path d={pathD} fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75} style={{ pointerEvents: 'none' }} />
                })()}

                {/* Transparent hit areas for every petal */}
                {c3Deities.map(d => {
                  const seq   = d.sequenceInSection
                  const pos   = C3_DOT_POSITIONS[seq]
                  const pathD = petalPathForSeq(seq)
                  if (!pos || !pathD) return null
                  return (
                    <path
                      key={d.id}
                      d={pathD}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleExploreClick(seq, d.id)}
                      onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={unhover}
                    />
                  )
                })}

                {/* Direction arrow — inside the ring, clockwise from current focus to next */}
                {showArrow && C3_SEQ_ANGLE[arrowFromSeq] !== undefined && C3_SEQ_ANGLE[arrowToSeq] !== undefined && (
                  <path
                    d={c3ArrowPath(arrowFromSeq, arrowToSeq)}
                    fill="none"
                    stroke="#27ae60"
                    strokeWidth="2.5"
                    markerEnd="url(#c3-arrow)"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </>
            )}

            {/* ── Memorise mode ── */}
            {memorise && !done && (
              <>
                {/* Red overlays for memorised petals — hidden during flash */}
                {!flash && c3Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq || results[seq] !== 'correct') return null
                  const pathD = petalPathForSeq(seq)
                  if (!pathD) return null
                  return (
                    <path
                      key={`overlay-${d.id}`}
                      d={pathD}
                      fill="rgba(200,70,70,0.85)"
                      stroke="#7a1a1a"
                      strokeWidth={0.75}
                      style={{ pointerEvents: 'none' }}
                    />
                  )
                })}

                {/* Past petal hit areas */}
                {c3Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq) return null
                  const pathD = petalPathForSeq(seq)
                  if (!pathD) return null
                  return (
                    <path
                      key={`past-${d.id}`}
                      d={pathD}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePastPetalClick(seq)}
                      onContextMenu={e => { e.preventDefault(); onToggleResult(seq) }}
                    />
                  )
                })}

                {/* Active petal hit area */}
                {currentSeq <= 8 && (() => {
                  const d     = c3Deities[currentSeq - 1]
                  const pos   = C3_DOT_POSITIONS[currentSeq]
                  const pathD = petalPathForSeq(currentSeq)
                  if (!d || !pos || !pathD) return null
                  return (
                    <path
                      key={d.id}
                      d={pathD}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleMemoriseClick(currentSeq)}
                      onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={unhover}
                    />
                  )
                })()}

                {/* Direction arrow — inside ring, current → next (seqs 1–7 only); desktop only in Memorise */}
                {!flash && showArrow && window.innerWidth >= 768 && C3_SEQ_ANGLE[arrowFromSeq] !== undefined && C3_SEQ_ANGLE[arrowToSeq] !== undefined && (
                  <path
                    d={c3ArrowPath(arrowFromSeq, arrowToSeq)}
                    fill="none"
                    stroke="#27ae60"
                    strokeWidth="2.5"
                    markerEnd="url(#c3-arrow)"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </>
            )}

            {/* Tooltip: four fixed corner zones — always clear of the petal ring */}
            {!flash && (() => {
              if (hoveredDot) return (
                <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                  label={displayName(deityById[hoveredDot.id], script)} script={script} />
              )
              if (!memorise && selectedId) {
                const d   = deityById[selectedId]
                const pos = d ? C3_DOT_POSITIONS[d.sequenceInSection] : null
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
        section={c3Section}
        script={script}
        svaminiSeq={9}
        yoginiSeq={10}
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
        />
      )}

    </div>
  )
}
