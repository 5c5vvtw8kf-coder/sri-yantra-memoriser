/**
 * C2View.jsx
 *
 * Circuit 2 — Sarvāśā Paripūraka Chakra (16-petal lotus)
 * Gupta Yoginī
 *
 * ── Modes (controlled by parent via props) ────────────────────────────────────
 *
 * Explore   — tap any dot → slide-up panel with name. Hover → tooltip.
 *
 * Memorise  — petals revealed one at a time (chant order, bottom → anti-CW).
 *             Active petal: cream fill, hover to reveal name.
 *             Double-click = memorised → petal turns red (fill + stroke).
 *             Single-click = skip      → petal stays gold, advance.
 *             Correct petals: red fill + dark-red stroke overlay.
 *             The mode toggle and progress bar live in the right panel (App.jsx).
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import SriYantraSVG, { C2_PETALS } from './SriYantraSVG'
import MobileSvaminiButtons, { MobileMemoriseInstr } from './MobileSvaminiButtons'

// ── Coordinate constants ───────────────────────────────────────────────────────

const CX = 260
const CY = 270

// ── Yantra fills ───────────────────────────────────────────────────────────────

const GOLD_FILL    = 'rgba(201,168,76,0.80)'
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

// ── Petal geometry ─────────────────────────────────────────────────────────────

const C2_PETAL_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

const C2_PETAL_MAP = Object.fromEntries(
  C2_PETALS.map(p => [parseInt(p.id.slice(-2), 10), { x: p.cx, y: p.cy }])
)

// Full path for click/hover targets and correct-petal overlays
const C2_PETAL_PATH_MAP = Object.fromEntries(
  C2_PETALS.map(p => [parseInt(p.id.slice(-2), 10), p.path])
)

const C2_DOT_POSITIONS = Object.fromEntries(
  C2_PETAL_ORDER.map((petalNum, idx) => [idx + 1, C2_PETAL_MAP[petalNum]])
)

function petalIdForSeq(seq) {
  return `petal-c2-${String(C2_PETAL_ORDER[seq - 1]).padStart(2, '0')}`
}
function petalPathForSeq(seq) {
  return C2_PETAL_PATH_MAP[C2_PETAL_ORDER[seq - 1]]
}

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD = '#c9a84c'

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c2Deities = deities
  .filter(d => d.sectionId === 'circuit-2' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const c2Section = data.sections?.find(s => s.circuitNumber === 2 && s.type === 'circuit') || {}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeityDot({ x, y, selected, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <circle
      cx={x.toFixed(1)}
      cy={y.toFixed(1)}
      r={selected ? 10.5 : 7.5}
      fill={selected ? '#ffffff' : 'rgba(255,248,220,0.68)'}
      stroke={selected ? '#2a0e04' : 'rgba(201,168,76,0.70)'}
      strokeWidth={selected ? 1.8 : 0.9}
      style={{ cursor: 'pointer', transition: 'r 0.12s, fill 0.12s, stroke 0.12s' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

function DeityPanel({ deity, script, onDismiss }) {
  if (!deity) return null
  const { scripts, sequenceInSection } = deity
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
              Gupta Yoginī · {sequenceInSection} of 16
            </span>
            <button
              onClick={onDismiss}
              className="text-muted hover:text-cream transition-colors text-lg leading-none -mt-0.5"
            >×</button>
          </div>
          <h2 className={`${isDevPrim ? '' : 'iast'} text-gold-400 text-lg font-medium leading-snug mb-1`}>
            {primary}
          </h2>
          {script !== 'iast'    && scripts.iast    && <p className="iast text-gold-600 text-sm mb-1">{scripts.iast}</p>}
          {script !== 'english' && scripts.english  && <p className="text-cream text-sm mb-2">{scripts.english}</p>}
          {scripts.translation                       && <p className="text-muted text-xs italic">{scripts.translation}</p>}
        </div>
      </div>
    </>
  )
}

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)
  const hw = w / 2, hh = h / 2

  // Four fixed zones in the corners of the yantra — always outside the petal ring.
  // Quadrant determined by the petal's position relative to the yantra centre.
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

function CompletionPanel({ results, onRestart, onNavigate }) {
  // Count all 18 items (petals 1–16 + Chakra Svāminī 17 + Yoginī 18)
  const correct = Object.values(results).filter(v => v === 'correct').length
  const skipped = 18 - correct
  return (
    <div className="mt-4 rounded-xl border border-surface-700 bg-surface-900/80 p-5 text-center">
      <p className="text-gold-400 text-base font-medium mb-1">Round complete</p>
      <p className="text-cream text-sm mb-4">
        <span className="text-red-400">{correct}/18 memorised</span>
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
          onClick={() => onNavigate('c3')}
          className="px-4 py-2 rounded-lg bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 text-sm transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function C2View({
  script           = 'iast',
  onDeitySelect    = () => {},
  highlightId      = null,
  fillAll          = false,
  // Memorise mode — controlled by App.jsx
  memorise         = false,
  currentSeq       = 1,
  results          = {},
  onStartMemorise  = () => {},
  onExitMemorise   = () => {},
  onMarkResult     = () => {},   // (seq, 'correct' | 'wrong')
  onToggleResult   = () => {},   // (seq) — right-click correction
  flash            = false,      // true during all-correct victory flash
  onNavigate       = () => {},   // (tabId) — for "Next circuit →"
}) {
  // Explore mode state (local)
  const [selectedId,    setSelectedId]    = useState(null)
  const [hoveredDot,    setHoveredDot]    = useState(null)
  const [mobileRevealed, setMobileRevealed] = useState(false)

  const clickTimer     = useRef(null)   // active petal
  const pastClickTimer = useRef(null)   // past petals

  // ── Explore handlers ────────────────────────────────────────────────────────

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    setHoveredDot(null)
    onDeitySelect(newId ? deityById[newId] : null)
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  // Auto-reveal active petal in Memorise mode (mobile: hover never fires)
  useEffect(() => {
    if (!memorise || flash || currentSeq < 1 || currentSeq > 16) { setHoveredDot(null); return }
    const d   = c2Deities[currentSeq - 1]
    const pos = C2_DOT_POSITIONS[currentSeq]
    if (d && pos) setHoveredDot({ id: d.id, x: pos.x, y: pos.y })
    else          setHoveredDot(null)
  }, [memorise, flash, currentSeq])

  // Reset reveal state when sequence advances (mobile tap-to-reveal)
  useEffect(() => { setMobileRevealed(false) }, [currentSeq, memorise])

  const selectedDeity = selectedId ? deityById[selectedId] : null

  // ── Memorise handlers ───────────────────────────────────────────────────────

  const markResult = (seq, result) => {
    onMarkResult(seq, result)
    setHoveredDot(null)
  }

  // Single-tap marks memorised (red); double-tap marks not memorised (gold).
  // On mobile: first tap reveals the name; subsequent taps mark.
  const handleMemoriseClick = (seq) => {
    if (seq !== currentSeq) return
    if (window.innerWidth < 768) setMobileRevealed(true)
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
      markResult(seq, 'wrong')
    } else {
      if (clickTimer.current) return
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null
        markResult(seq, 'correct')
      }, 280)
    }
  }

  // Past petals: single-tap marks if skipped; double-tap unmarks if memorised.
  const lastPastTapRef = useRef({ seq: null, time: 0 })
  const handlePastPetalClick = (seq) => {
    const now = Date.now()
    const isDoubleTap = lastPastTapRef.current.seq === seq && (now - lastPastTapRef.current.time) < 300
    lastPastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (pastClickTimer.current) { clearTimeout(pastClickTimer.current); pastClickTimer.current = null }
      if (results[seq] === 'correct') onToggleResult(seq)   // unmark
    } else {
      if (pastClickTimer.current) return
      pastClickTimer.current = setTimeout(() => {
        pastClickTimer.current = null
        if (results[seq] !== 'correct') onToggleResult(seq) // mark
      }, 280)
    }
  }

  // Petals: seq 1–16. Extra items: seq 17 (Chakra Svāminī), 18 (Yoginī).
  const done = memorise && currentSeq > 18

  // ── Background SVG fills ────────────────────────────────────────────────────

  const filledRegions = (() => {
    if (memorise) {
      // During the all-correct victory flash: briefly return to all-gold (no red)
      if (flash) return { ...YANTRA_FILLS }
      const fills = { ...YANTRA_FILLS }
      // Active petal: cream so it reads as "focus here"
      if (currentSeq <= 16) fills[petalIdForSeq(currentSeq)] = ACTIVE_PETAL
      // Correct petals only — wrong petals stay gold (no color)
      for (let seq = 1; seq < currentSeq; seq++) {
        if (results[seq] === 'correct') fills[petalIdForSeq(seq)] = 'rgba(200,70,70,0.85)'
      }
      return fills
    }
    // Explore mode: all petals cream; selected/highlighted/fillAll turns red
    const fills = { ...YANTRA_FILLS }
    const RED_PETAL = 'rgba(200,70,70,0.85)'
    if (fillAll) {
      for (let i = 1; i <= 16; i++) fills[petalIdForSeq(i)] = RED_PETAL
    } else {
      for (let i = 1; i <= 16; i++) fills[petalIdForSeq(i)] = ACTIVE_PETAL
      const focusDeity = selectedDeity
        || (hoveredDot ? deityById[hoveredDot.id] : null)
        || (highlightId ? deityById[highlightId] : null)
      if (focusDeity) fills[petalIdForSeq(focusDeity.sequenceInSection)] = RED_PETAL
    }
    return fills
  })()

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full p-4">

      {/* Diagram */}
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
        style={{ paddingBottom: '100%' }}
      >
        <div className="absolute inset-0">

          {/* Layer 1: full Śrī Yantra background */}
          <SriYantraSVG
            className="w-full h-full"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={filledRegions}
          />

          {/* Layer 2: deity dots / petal overlays + tooltip + hint */}
          <svg
            viewBox="45 55 430 430"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label="Circuit 2 — 16-petal lotus deity positions"
          >

            <defs>
              {/* Arrowhead for sequence direction indicator */}
              <marker id="c2-ccw-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#27ae60" />
              </marker>
            </defs>

            {/* ── Explore mode: full petal hit areas ── */}
            {!memorise && (
              <>
                {/* Dark-red stroke overlay — covers gold stroke for selected/highlighted/fillAll */}
                {fillAll && c2Deities.map(d => {
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
                {c2Deities.map(d => {
                  const seq = d.sequenceInSection
                  const pos = C2_DOT_POSITIONS[seq]
                  const pathD = petalPathForSeq(seq)
                  if (!pos || !pathD) return null
                  return (
                    <path
                      key={d.id}
                      d={pathD}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggle(d.id)}
                      onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={unhover}
                    />
                  )
                })}

                {/* Sequence direction indicator — back of arrow aligns with tip of Kāmākarṣiṇī
                    petal (x=260), arcs anti-clockwise. Radius 157 sits just outside petal ring. */}
                <path
                  d="M 260,427 A 157,157 0 0,0 339,406"
                  fill="none"
                  stroke="#27ae60"
                  strokeWidth="2.5"
                  markerEnd="url(#c2-ccw-arrow)"
                  style={{ pointerEvents: 'none' }}
                />
              </>
            )}

            {/* ── Memorise mode ── */}
            {memorise && !done && (
              <>
                {/* Red fill + dark-red stroke overlay for memorised petals.
                    Same viewBox as SriYantraSVG → pixel-perfect alignment,
                    covering the base gold stroke with the dark-red one.
                    Hidden during flash so all petals briefly show gold. */}
                {!flash && c2Deities.map(d => {
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

                {/* Past petal hit areas — click/dbl-click to correct, right-click for menu.
                    Rendered above the fill overlay so they capture events. */}
                {c2Deities.map(d => {
                  const seq = d.sequenceInSection
                  if (seq >= currentSeq) return null
                  const pathD = petalPathForSeq(seq)
                  if (!pathD) return null
                  return (
                    <path
                      key={`ctx-${d.id}`}
                      d={pathD}
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePastPetalClick(seq)}
                      onContextMenu={e => { e.preventDefault(); onToggleResult(seq) }}
                    />
                  )
                })}

                {/* Active petal: transparent hit area for hover / click / dbl-click */}
                {currentSeq <= 16 && (() => {
                  const d     = c2Deities[currentSeq - 1]
                  const pos   = C2_DOT_POSITIONS[currentSeq]
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
              </>
            )}

            {/* Tooltip: four fixed zones at the yantra corners — always clear of the ring. */}
            {!flash && (() => {
              if (hoveredDot) return (
                <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                  label={displayName(deityById[hoveredDot.id], script)} script={script} />
              )
              if (!memorise && selectedId) {
                const d   = deityById[selectedId]
                const pos = d ? C2_DOT_POSITIONS[d.sequenceInSection] : null
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
        section={c2Section}
        script={script}
        svaminiSeq={17}
        yoginiSeq={18}
        memorise={memorise}
        currentSeq={currentSeq}
        results={results}
        onMarkResult={onMarkResult}
        onToggleResult={onToggleResult}
      />

      {/* Completion panel */}
      {done && (
        <CompletionPanel
          results={results}
          onRestart={onStartMemorise}
          onNavigate={onNavigate}
        />
      )}

      <div className="h-8" />
    </div>
  )
}
