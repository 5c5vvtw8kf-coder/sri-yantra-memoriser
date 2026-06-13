/**
 * NyasaSpotCheckView.jsx
 *
 * Spot check for the 6 Nyāsāṅga Devatāḥ.
 *
 * Uses the same body-position visual as NyasaView: full Sri Yantra with
 * 5 body dots (Hṛdaya–Netra) and 4 T-gate dots (AstraDevī).
 *
 * Active deity's dot(s) glow cream; hover/tap to reveal name; click/2nd-tap =
 * memorised; dbl-click = not memorised; right-click/dbl-tap-past = toggle.
 *
 * AstraDevī (seq 6) occupies all 4 gate positions simultaneously —
 * any gate click marks the answer; all 4 gates flash together.
 *
 * Props (same interface as SpotCheckView):
 *   script         — 'iast' | 'devanagari' | 'english' | …
 *   subFilter      — (unused — no sub-filters for Nyāsa)
 *   onProgressSync — ({ idx, total, correct, wrong }) => void
 *   onRegisterSkip — (skipFn) => void
 *   onUpdateStats  — (correct, total) => void
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import SriYantraSVG from './SriYantraSVG'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'

// ── Coordinate constants (must match SriYantraSVG.jsx) ───────────────────────

const CX       = 250
const CY       = 250
const BINDU_CY = 250

const CORNER_D = 218
const GATE_D   = 212

const BODY_POSITIONS = [
  [CX + CORNER_D, CY - CORNER_D],   // seq 1 — Hṛdaya   — top-right
  [CX - CORNER_D, CY - CORNER_D],   // seq 2 — Śiras    — top-left
  [CX + CORNER_D, CY + CORNER_D],   // seq 3 — Śikhā   — bottom-right
  [CX - CORNER_D, CY + CORNER_D],   // seq 4 — Kavaca   — bottom-left
  [CX,            BINDU_CY      ],   // seq 5 — Netra    — bindu
]

const ASTRA_POSITIONS = [
  [CX,          CY - GATE_D],   // N
  [CX + GATE_D, CY          ],  // E
  [CX,          CY + GATE_D],   // S
  [CX - GATE_D, CY          ],  // W
]

// ── Yantra fills (same as NyasaView) ─────────────────────────────────────────

const GOLD_FILL = 'rgba(201,168,76,0.80)'
const YANTRA_FILLS = {
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
    [`petal-c2-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
    [`petal-c3-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
    [`tri-c4-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c5-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c6-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
    [`tri-c7-${String(i + 1).padStart(2, '0')}`, GOLD_FILL])),
  'tri-c8-01':    GOLD_FILL,
  'tri-c8-bg-01': '#0f0805',
  'tri-c8-bg-02': '#0f0805',
  'c9':           '#000000',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const nyasaDeities = deities
  .filter(d => d.sectionId === 'nyasa')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD         = '#c9a84c'
const BG           = '#0f0805'
const ACTIVE_FILL  = 'rgba(255,248,200,0.92)'
const RESULT_RED   = 'rgba(248,113,113,0.75)'   // correct = memorised = red
const RESULT_GOLD  = 'rgba(201,168,76,0.40)'    // wrong = not memorised = gold
const DIM_FILL     = 'rgba(80,50,20,0.50)'    // not yet reached — dark brown, distinct from gold

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dotsForSeq(seq) {
  if (seq >= 1 && seq <= 5) return [BODY_POSITIONS[seq - 1]]
  if (seq === 6) return ASTRA_POSITIONS
  return []
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 14 : script === 'english' ? 11.5 : 10.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 4), 496 - w / 2)
  const ty       = y - h / 2 - 14 < 4 ? y + h / 2 + 14 : y - h / 2 - 14
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

// ── Completion overlay ────────────────────────────────────────────────────────

function CompletionOverlay({ correct, total, onRestart, sectionLabel }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <p className="text-gold-400 text-lg">{sectionLabel || 'Round complete'}</p>
      <p className="text-cream text-sm">Round complete</p>
      <div>
        <p className="text-4xl font-medium">
          <span className="text-red-400">{correct}</span>
          <span className="text-muted text-2xl">/{total}</span>
        </p>
        <p className="text-xs text-muted mt-1">{pct}% memorised</p>
      </div>
      <button
        onClick={onRestart}
        className="px-5 py-2 bg-gold-800/40 border border-gold-700/50 text-gold-300 rounded-lg text-sm hover:bg-gold-800/60 transition-colors"
      >
        New round
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NyasaSpotCheckView({
  script = 'iast',
  subFilter = null,  // unused — no sub-filters for Nyāsa
  onProgressSync,
  onRegisterSkip,
  onUpdateStats,
}) {
  const [queue,   setQueue]   = useState(() => shuffle(nyasaDeities.map(d => d.id)))
  const [idx,     setIdx]     = useState(0)
  const [results, setResults] = useState({})
  const [hoveredSeq,  setHoveredSeq]  = useState(null)
  const [revealedId,  setRevealedId]  = useState(null)
  const [flash,   setFlash]   = useState(null)
  const clickTimer     = useRef(null)
  const lastPastTap    = useRef({ id: null, time: 0 })
  const roundLoggedRef = useRef(false)

  const total   = queue.length
  const done    = idx >= total
  const current = !done ? (deityById[queue[idx]] ?? null) : null
  const activeSeq = current?.sequenceInSection ?? null

  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length

  // Reset on mount only (no sub-filters)
  useEffect(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats) {
      onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
    }
    setQueue(shuffle(nyasaDeities.map(d => d.id)))
    setIdx(0)
    setResults({})
    setHoveredSeq(null)
    setRevealedId(null)
    setFlash(null)
  }, [subFilter]) // eslint-disable-line

  // Clear reveal when question advances
  useEffect(() => { setRevealedId(null) }, [idx])

  useEffect(() => {
    if (onProgressSync) onProgressSync({ idx, total, correct, wrong })
  }, [idx, total, correct, wrong, onProgressSync])

  useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current) }, [])

  // Log session as soon as the round completes
  useEffect(() => {
    if (!done) { roundLoggedRef.current = false; return }
    if (roundLoggedRef.current) return
    const doneCount = Object.keys(results).length
    if (doneCount === 0) return
    roundLoggedRef.current = true
    if (onUpdateStats) onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
  }, [done]) // eslint-disable-line

  const advance = useCallback((result) => {
    if (!current || done) return
    setRevealedId(null)
    setResults(prev => ({ ...prev, [current.id]: result }))
    setFlash(result)
    setTimeout(() => {
      setFlash(null)
      setHoveredSeq(null)
      setIdx(i => i + 1)
    }, 380)
  }, [current, done])

  // Two-step tap: first tap reveals name; second tap = memorised
  const handleClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (revealedId !== current?.id) {
        setRevealedId(current?.id ?? null)
      } else {
        setRevealedId(null)
        advance('correct')
      }
    }, 260)
  }, [done, flash, advance, revealedId, current])

  // Double-tap active = not memorised
  const handleDblClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    advance('wrong')
  }, [done, flash, advance])

  // Right-click (desktop) or double-tap (mobile) past dot = toggle
  const handleRightClick = useCallback((e, deityId) => {
    e.preventDefault()
    if (!results[deityId]) return
    setResults(prev => ({
      ...prev,
      [deityId]: prev[deityId] === 'correct' ? 'wrong' : 'correct',
    }))
  }, [results])

  // Mobile double-tap (within 350ms) to toggle a past answer — mirrors right-click on desktop
  const handlePastDoubleTap = useCallback((deityId) => {
    const now  = Date.now()
    const last = lastPastTap.current
    if (last.id === deityId && now - last.time < 500) {
      lastPastTap.current = { id: null, time: 0 }
      setResults(prev => {
        if (!prev[deityId]) return prev
        return { ...prev, [deityId]: prev[deityId] === 'correct' ? 'wrong' : 'correct' }
      })
    } else {
      lastPastTap.current = { id: deityId, time: now }
    }
  }, [])

  const handleSkip = useCallback(() => {
    if (done || flash) return
    setHoveredSeq(null)
    setRevealedId(null)
    setIdx(i => i + 1)
  }, [done, flash])

  useEffect(() => {
    if (onRegisterSkip) onRegisterSkip(handleSkip)
  }, [handleSkip, onRegisterSkip])

  const startNewRound = useCallback(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats && !roundLoggedRef.current) {
      onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
    }
    roundLoggedRef.current = false
    setQueue(shuffle(nyasaDeities.map(d => d.id)))
    setIdx(0)
    setResults({})
    setHoveredSeq(null)
    setRevealedId(null)
    setFlash(null)
  }, [results, onUpdateStats])

  const flashFill   = flash === 'correct' ? RESULT_RED : RESULT_GOLD
  const activeFill  = flash ? flashFill : ACTIVE_FILL
  const activeStroke = flash === 'correct' ? '#7f1d1d' : flash === 'wrong' ? '#a16207' : '#fff'

  return (
    <div className="w-full p-4 flex flex-col gap-3">

      {/* Visual */}
      {!done && (
        <div className="relative w-full" style={{ paddingBottom: '100%' }}>

          {/* Base yantra */}
          <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
            <SriYantraSVG
              className="w-full h-full"
              showTriangles={true}
              filledRegions={YANTRA_FILLS}
            />
          </div>

          {/* Dot overlay — 500×500 viewBox matches SriYantraSVG */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Nyāsa Devatāḥ spot check"
            style={{ touchAction: 'manipulation' }}
          >
            {nyasaDeities.map(d => {
              const seq      = d.sequenceInSection
              const isActive = seq === activeSeq
              const res      = results[d.id]
              const isPast   = !!res
              const positions = dotsForSeq(seq)

              const dotFill = isActive
                ? activeFill
                : isPast
                  ? (res === 'correct' ? RESULT_RED : RESULT_GOLD)
                  : DIM_FILL

              const r        = isActive ? 12 : isPast ? 10 : 7
              const stroke   = isActive ? activeStroke : 'none'
              const strokeW  = isActive ? 1.5 : 0
              const isCursor = isActive || isPast
              const isHovered = hoveredSeq === seq

              return positions.map(([x, y], pi) => (
                <circle key={`${d.id}-${pi}`}
                  cx={x.toFixed(1)} cy={y.toFixed(1)}
                  r={r}
                  fill={dotFill}
                  stroke={stroke} strokeWidth={strokeW}
                  style={{
                    cursor: isCursor ? 'pointer' : 'default',
                    pointerEvents: isCursor ? 'all' : 'none',
                    transition: 'fill 0.25s',
                  }}
                  onClick={isActive && !flash ? handleClick : undefined}
                  onDoubleClick={isActive && !flash ? handleDblClick : undefined}
                  onTouchEnd={isPast ? e => { e.preventDefault(); handlePastDoubleTap(d.id) } : undefined}
                  onContextMenu={isPast ? e => handleRightClick(e, d.id) : undefined}
                  onMouseEnter={isActive && !flash ? () => setHoveredSeq(seq) : undefined}
                  onMouseLeave={isActive && !flash ? () => setHoveredSeq(null) : undefined}
                />
              ))
            })}

            {/* Tooltip on active hovered dot (desktop) or first tap (mobile) */}
            {(hoveredSeq !== null || revealedId === current?.id) && !flash && current && (() => {
              const positions = dotsForSeq(activeSeq)
              const [x, y] = positions[0] ?? [CX, CY]
              return (
                <Tooltip
                  x={x} y={y}
                  label={displayName(current, script)}
                  script={script}
                />
              )
            })()}

            {/* Flash tooltip — brief answer reveal */}
            {flash && current && (() => {
              const positions = dotsForSeq(activeSeq)
              const [x, y] = positions[0] ?? [CX, CY]
              return (
                <Tooltip
                  x={x} y={y}
                  label={displayName(current, script)}
                  script={script}
                />
              )
            })()}

          </svg>
        </div>
      )}

      {/* Instruction — mobile */}
      {!done && (
        <p className="mt-3 text-center text-xs text-muted italic md:hidden">
          tap to reveal · <span className="text-red-400">tap again</span> = memorised · <span className="text-gold-400">dbl-tap</span> = not memorised · dbl-tap past = toggle
        </p>
      )}
      {/* Instruction — desktop */}
      {!done && (
        <p className="mt-3 text-center text-xs text-muted italic hidden md:block">
          hover to reveal · <span className="text-red-400">click</span> = memorised · <span className="text-gold-400">dbl-click</span> = not memorised · right-click = toggle
        </p>
      )}

      {/* Completion */}
      {done && (
        <CompletionOverlay correct={correct} total={total} onRestart={startNewRound} sectionLabel={sectionLabel} />
      )}

    </div>
  )
}
