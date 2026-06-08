/**
 * C3View.jsx
 *
 * Circuit 3 — Sarva Saṅkṣobhaṇa Chakra (8-petal lotus)
 * Guptatara Yoginī
 *
 * ── Modes ─────────────────────────────────────────────────────────────────────
 *
 * Explore  — all 8 petals cream to highlight the avarana.
 *            Hover → tooltip. Click → petal turns red, right panel shows deity.
 *
 * Memorise — petals revealed one at a time (chant order).
 *            Active petal: cream fill, hover to reveal name.
 *            Double-click = memorised → red fill + dark-red stroke.
 *            Single-click = not memorised → petal stays gold, advance.
 *            seq 9  = Chakra Svāminī (right-panel only)
 *            seq 10 = Yoginī (right-panel only)
 *            > 10   = done
 *
 * Petal ID ↔ sequenceInSection: direct 1:1 mapping.
 *   petal-c3-01 = seq 1 … petal-c3-08 = seq 8
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import SriYantraSVG, { C3_PETALS } from './SriYantraSVG'
import MobileSvaminiButtons from './MobileSvaminiButtons'

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

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD = '#c9a84c'

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c3Deities = deities
  .filter(d => d.sectionId === 'circuit-3' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const c3Section = data.sections?.find(s => s.circuitNumber === 3 && s.type === 'circuit') || {}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 49), 471 - w / 2)
  const ty       = y > CY ? y - h / 2 - 18 : y + h / 2 + 18
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
  const [selectedId,    setSelectedId]    = useState(null)
  const [hoveredDot,    setHoveredDot]    = useState(null)
  const [mobileRevealed, setMobileRevealed] = useState(false)

  const clickTimer     = useRef(null)
  const lastTapRef     = useRef({ seq: null, time: 0 })
  const pastClickTimer = useRef(null)

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
    if (!memorise || flash || currentSeq < 1 || currentSeq > 8) { setHoveredDot(null); return }
    const d   = c3Deities[currentSeq - 1]
    const pos = C3_DOT_POSITIONS[currentSeq]
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

  const lastPastTapRef = useRef({ seq: null, time: 0 })
  const handlePastPetalClick = (seq) => {
    const now = Date.now()
    const isDoubleTap = lastPastTapRef.current.seq === seq && (now - lastPastTapRef.current.time) < 300
    lastPastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (pastClickTimer.current) { clearTimeout(pastClickTimer.current); pastClickTimer.current = null }
      if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (pastClickTimer.current) return
      pastClickTimer.current = setTimeout(() => {
        pastClickTimer.current = null
        if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const done = memorise && currentSeq > 10

  // ── Filled regions ──────────────────────────────────────────────────────────

  const filledRegions = (() => {
    if (memorise) {
      if (flash) return { ...YANTRA_FILLS }
      const fills = { ...YANTRA_FILLS }
      if (currentSeq <= 8) fills[petalIdForSeq(currentSeq)] = ACTIVE_PETAL
      for (let seq = 1; seq < currentSeq; seq++) {
        if (results[seq] === 'correct') fills[petalIdForSeq(seq)] = 'rgba(200,70,70,0.85)'
      }
      return fills
    }
    // Explore: all 8 petals cream; selected/highlighted/fillAll turns red
    const fills = { ...YANTRA_FILLS }
    const RED_PETAL = 'rgba(200,70,70,0.85)'
    if (fillAll) {
      for (let i = 1; i <= 8; i++) fills[petalIdForSeq(i)] = RED_PETAL
    } else {
      for (let i = 1; i <= 8; i++) fills[petalIdForSeq(i)] = ACTIVE_PETAL
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

          <SriYantraSVG
            className="w-full h-full"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={filledRegions}
          />

          <svg
            viewBox="45 55 430 430"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label="Circuit 3 — 8-petal lotus deity positions"
          >

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
                const pos = d ? C3_DOT_POSITIONS[d.sequenceInSection] : null
                if (!pos) return null
                return <Tooltip x={pos.x} y={pos.y} label={displayName(d, script)} script={script} />
              }
              return null
            })()}

          </svg>
        </div>
      </div>


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
      {done && (
        <CompletionPanel
          results={results}
          onRestart={onStartMemorise}
          onNavigate={onNavigate}
        />
      )}

    </div>
  )
}
