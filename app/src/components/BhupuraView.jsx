/**
 * BhupuraView.jsx
 *
 * Circuit 1 — Trailokya Mohana Chakra (Bhūpura / outer square enclosure)
 * Prakaṭa Yoginī
 *
 * Uses the full SriYantraSVG as the background diagram, with deity dots
 * overlaid as a second SVG layer (same 500×500 viewBox).
 *
 * Dot positions mirror the numbered markers on the Śrī Yantra page exactly
 * (sequenceInSection 1–28 → BHUPURA_MARKERS n 1–28):
 *
 *   Level 1 outer  (s=228) : n 1–10  → 10 Siddhi Shaktis   — gold
 *   Level 2 middle (s=220) : n 11–18 → 8 Ashta Matrikas     — teal
 *   Level 3 inner  (s=212) : n 19–28 → 10 Mudra Shaktis     — red
 *
 * Supports Explore mode (tap to reveal, filter by group) and
 * Memorise mode (drill sequentially through all 28).
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import SriYantraSVG, { BHUPURA_MARKERS } from './SriYantraSVG'
import { useDoneDelay } from '../hooks/useDoneDelay'
import MobileSvaminiButtons, { MobileMemoriseInstr } from './MobileSvaminiButtons'

// ── Coordinate constants ───────────────────────────────────────────────────────

const CX = 260
const CY = 270

// ── Yantra fills — petals & circles gold, triangles left as lines only ────────

const GOLD_FILL   = 'rgba(201,168,76,0.80)'
const BROWN_FILL  = 'rgba(138,117,96,0.35)'
const YANTRA_FILLS = {
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
    [`petal-c2-${String(i + 1).padStart(2, '0')}`, GOLD_FILL]
  )),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
    [`petal-c3-${String(i + 1).padStart(2, '0')}`, GOLD_FILL]
  )),
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
    [`tri-c4-${String(i + 1).padStart(2, '0')}`, GOLD_FILL]
  )),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c5-${String(i + 1).padStart(2, '0')}`, GOLD_FILL]
  )),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c6-${String(i + 1).padStart(2, '0')}`, GOLD_FILL]
  )),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
    [`tri-c7-${String(i + 1).padStart(2, '0')}`, GOLD_FILL]
  )),
  'tri-c8-01':    GOLD_FILL,
  'tri-c8-bg-01': '#0f0805',
  'tri-c8-bg-02': '#0f0805',
  'c9': '#000000',
}

// Brown version for Memorise mode — makes gold "not memorised" dots stand out
const YANTRA_FILLS_BROWN = Object.fromEntries(
  Object.entries(YANTRA_FILLS).map(([k, v]) => [k, v === GOLD_FILL ? BROWN_FILL : v])
)

// ── Dot positions ─────────────────────────────────────────────────────────────

const BHUPURA_POSITIONS = Object.fromEntries(
  BHUPURA_MARKERS.map(m => [m.n, { x: m.x, y: m.y, level: m.level }])
)

// ── Static data ───────────────────────────────────────────────────────────────

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))
const bhupuraSection = sections.find(s => s.circuitNumber === 1 && s.type === 'circuit') || {}

const c1Deities      = deities.filter(d => d.sectionId === 'circuit-1')
const siddhiDeities  = c1Deities.filter(d => d.group === 'siddhiShakti').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const matrikaDeities = c1Deities.filter(d => d.group === 'ashtaMatrika').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const mudraDeities   = c1Deities.filter(d => d.group === 'mudraShakti').sort((a, b) => a.sequenceInSection - b.sequenceInSection)

const C1_TOTAL     = c1Deities.length  // 28 — dot-phase deities only
const BHUPURA_TOTAL = 30               // 28 deities + Chakra Svāminī (29) + Yoginī (30)

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD        = '#c9a84c'
const TEAL        = '#b4b6b8'
const GREEN       = '#27ae60'
const RED         = '#c0392b'
const BG          = '#0f0805'
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'

// Dot sizing — normal: all 28 visible without major overlap; focus: active/selected dot
const DOT_R_NORMAL = 5
const DOT_R_FOCUS  = 9

const GROUP_COLOUR = {
  siddhiShakti: RED,
  ashtaMatrika: TEAL,
  mudraShakti:  GOLD,
}

const GROUP_LABEL = {
  siddhiShakti: 'Siddhi Shaktis',
  ashtaMatrika: 'Ashta Matrikas',
  mudraShakti:  'Mudra Shaktis',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── Sub-components ────────────────────────────────────────────────────────────

function DeityDot({ x, y, r, fill, selected, highlighted, isHovered, opacity, onClick, onMouseEnter, onMouseLeave, onDoubleClick, onContextMenu }) {
  const isInteractive = !!(onClick || onMouseEnter)
  return (
    <circle
      cx={x.toFixed(1)} cy={y.toFixed(1)}
      r={r}
      fill={selected ? fill : (highlighted || isHovered) ? RED : fill + 'bb'}
      stroke="none"
      strokeWidth={0}
      opacity={opacity ?? 1}
      style={{ cursor: isInteractive ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

function Tooltip({ x, y, label, fill, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 49), 471 - w / 2)
  const ty       = y > CY ? y - h / 2 - 16 : y + h / 2 + 16
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

// ── Desktop filter config ─────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',          label: 'All'                          },
  { id: 'siddhiShakti', label: 'Outer Band — Siddhi Shaktis' },
  { id: 'ashtaMatrika', label: 'Middle Band — Ashta Matrikas' },
  { id: 'mudraShakti',  label: 'Inner Band — Mudra Shaktis'  },
]

// ── Mobile band config (Explore mode navigation) ──────────────────────────────

const BAND_CONFIG = [
  { id: 'siddhiShakti', list: siddhiDeities,  label: 'Outer Band',  groupLabel: 'Siddhi Shaktis' },
  { id: 'ashtaMatrika', list: matrikaDeities, label: 'Middle Band', groupLabel: 'Ashta Matrikas' },
  { id: 'mudraShakti',  list: mudraDeities,   label: 'Inner Band',  groupLabel: 'Mudra Shaktis'  },
]

// ── NavArrow ──────────────────────────────────────────────────────────────────

function NavArrow({ from, to, gap = 14, length = 27 }) {
  const dx = to[0] - from[0], dy = to[1] - from[1]
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist, ny = dy / dist
  const x1 = from[0] + nx * gap,  y1 = from[1] + ny * gap
  const x2 = x1 + nx * length,    y2 = y1 + ny * length
  return (
    <line x1={x1.toFixed(1)} y1={y1.toFixed(1)}
          x2={x2.toFixed(1)} y2={y2.toFixed(1)}
      stroke={GREEN} strokeWidth={2.5}
      markerEnd="url(#bhupura-nav-arrow)" />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BhupuraView({
  script = 'iast',
  onDeitySelect = () => {},
  highlightId = null,
  showColors = false,
  fillAll = false,
  memoGroup = 'all',
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
  // Desktop state
  const [selectedId,    setSelectedId]    = useState(null)
  const [activeFilter,  setActiveFilter]  = useState('all')
  // Mobile state
  const [lastTappedId,  setLastTappedId]  = useState(null)
  const [bandStep,      setBandStep]      = useState(0)
  const [navStep,       setNavStep]       = useState(0)
  // Shared
  const [hoveredDot,    setHoveredDot]    = useState(null)
  const [isMobile,      setIsMobile]      = useState(() => window.innerWidth < 768)
  const [mobileRevealed, setMobileRevealed] = useState(false)
  const clickTimer = useRef(null)
  const lastTapRef     = useRef({ seq: null, time: 0 })
  const yantraRef  = useRef(null)
  const [yantraPos, setYantraPos] = useState({ top: 80, height: 300, right: 500 })

  useEffect(() => {
    const update = () => {
      if (!yantraRef.current) return
      const r = yantraRef.current.getBoundingClientRect()
      setYantraPos({ top: r.top, height: r.height, right: r.right })
    }
    update()
    const t = setTimeout(update, 50)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [])

  // Track mobile breakpoint reactively
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Desktop: original toggle (select / deselect)
  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    setHoveredDot(null)
    onDeitySelect(newId ? deityById[newId] : null)
  }

  // Mobile: every tap always sets lastTappedId (no toggle/deselect). This ensures the
  // useEffect sees a state change on every tap, even if the same dot is tapped
  // twice in a row. navStep only advances when the tapped dot is the focus dot.
  const tap     = (id) => {
    setLastTappedId(null)           // force state change even if same id tapped again
    requestAnimationFrame(() => {   // then set it in next frame so effect fires
      setLastTappedId(id)
      setHoveredDot(null)
      onDeitySelect(deityById[id] || null)
    })
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  // Advance navStep when the current focus dot is tapped (Explore mode).
  useEffect(() => {
    if (memorise || !lastTappedId) return
    const band = BAND_CONFIG[bandStep]
    setNavStep(prev => {
      if (prev >= band.list.length) return prev
      if (band.list[prev]?.id === lastTappedId) return prev + 1
      return prev
    })
  }, [lastTappedId, bandStep, memorise])

  // Clear reveal state and tooltip when sequence advances or mode changes (no auto-reveal — first tap reveals)
  useEffect(() => { setHoveredDot(null); setMobileRevealed(false) }, [currentSeq, memorise])

  // Reset selection and navStep when band changes
  useEffect(() => { setLastTappedId(null); setHoveredDot(null); setNavStep(0) }, [bandStep])

  // Auto-advance to next band after last dot in current band is tapped (mobile only)
  useEffect(() => {
    if (memorise || !isMobile) return
    const band = BAND_CONFIG[bandStep]
    if (navStep < band.list.length) return          // not at end yet
    if (bandStep >= BAND_CONFIG.length - 1) return  // already on last band
    const timer = setTimeout(() => setBandStep(b => b + 1), 1400)
    return () => clearTimeout(timer)
  }, [navStep, bandStep, memorise, isMobile])

  const selectedDeity = lastTappedId ? deityById[lastTappedId] : null

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = (seq) => {
    const isMobileTap = window.innerWidth < 768
    if (isMobileTap && currentSeq === seq && !mobileRevealed) {
      // First tap: reveal only
      const d   = memoDeities[seq - 1]
      const pos = d ? BHUPURA_POSITIONS[d.sequenceInSection] : null
      if (d && pos) setHoveredDot({ id: d.id, x: pos.x, y: pos.y })
      setMobileRevealed(true)
      lastTapRef.current = { seq: null, time: 0 }  // reset so confirm tap isn't mis-detected as double-tap
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
      if (currentSeq === seq) onMarkResult(seq, 'wrong')
      else onToggleResult(seq)
    } else {
      if (isMobileTap && currentSeq !== seq) return  // mobile past: single tap = nothing
      if (clickTimer.current) return
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null
        if (currentSeq === seq) onMarkResult(seq, 'correct')
        else if (!isMobileTap && results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  // Memo mode: filtered deity list and total
  const memoDeities = memoGroup === 'siddhiShakti' ? siddhiDeities
    : memoGroup === 'ashtaMatrika' ? matrikaDeities
    : memoGroup === 'mudraShakti'  ? mudraDeities
    : c1Deities
  const MEMO_TOTAL = memoGroup === 'all' ? BHUPURA_TOTAL : memoDeities.length + 2

  const done = memorise && currentSeq > MEMO_TOTAL
  const showCompletion = useDoneDelay(done)

  // Dynamic fills — brown in Memorise (contrast with gold dots); red band overlays in Explore fillAll
  const dynamicFills = memorise
    ? YANTRA_FILLS_BROWN
    : (fillAll
        ? { ...YANTRA_FILLS, 'c1-outer': 'rgba(200,70,70,0.85)', 'c1-mid': 'rgba(200,70,70,0.85)' }
        : YANTRA_FILLS)

  return (
    <div className="w-full p-4">

      {/* Diagram — full Sri Yantra background + dot overlay */}
      <div ref={yantraRef}
           className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">

          {/* Layer 1: full Sri Yantra */}
          <SriYantraSVG
            className="w-full h-full"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={dynamicFills}
          />

          {/* Layer 2: deity dots + tooltip + nav */}
          <svg
            viewBox="45 55 430 430"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label="Bhūpura deity positions"
          >
            <defs>
              <marker id="bhupura-nav-arrow" markerWidth="7" markerHeight="5"
                refX="0" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill={GREEN} />
              </marker>
            </defs>

            {/* ── Explore mode dots ─────────────────────────────────────── */}
            {!memorise && (isMobile ? (
              // Mobile: band-paged dots with navStep colour coding
              (() => {
                const band = BAND_CONFIG[bandStep]
                const makeDot = (d, bandIdx) => {
                  const pos     = BHUPURA_POSITIONS[d.sequenceInSection]
                  if (!pos) return null
                  const isFocus = bandIdx === navStep
                  const isPast  = bandIdx < navStep
                  const fill    = isPast ? RED : '#fff8c8'
                  const opacity = isFocus ? 1 : isPast ? 1 : 0.40
                  return (
                    <DeityDot key={d.id}
                      x={pos.x} y={pos.y}
                      r={isFocus ? DOT_R_FOCUS : DOT_R_NORMAL}
                      fill={fill} selected={isPast} highlighted={false}
                      isHovered={hoveredDot?.id === d.id}
                      opacity={opacity}
                      onClick={() => tap(d.id)}
                      onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={unhover}
                    />
                  )
                }
                return [
                  band.list.map((d, i) => i !== navStep ? makeDot(d, i) : null),
                  navStep < band.list.length ? makeDot(band.list[navStep], navStep) : null,
                ]
              })()
            ) : (
              // Desktop: all dots filtered by activeFilter, toggle select/deselect
              (() => {
                const filtered = activeFilter === 'all' ? c1Deities : c1Deities.filter(d => d.group === activeFilter)
                const frontId  = hoveredDot?.id ?? highlightId ?? selectedId
                const makeDot  = (d) => {
                  const pos  = BHUPURA_POSITIONS[d.sequenceInSection]
                  if (!pos) return null
                  const fill = showColors ? GROUP_COLOUR[d.group] : '#fff8c8'
                  return (
                    <DeityDot key={d.id}
                      x={pos.x} y={pos.y}
                      r={selectedId === d.id ? DOT_R_FOCUS : DOT_R_NORMAL}
                      fill={fill}
                      selected={selectedId === d.id}
                      highlighted={!selectedId && highlightId === d.id}
                      isHovered={hoveredDot?.id === d.id}
                      opacity={1}
                      onClick={() => toggle(d.id)}
                      onMouseEnter={() => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={unhover}
                    />
                  )
                }
                return [
                  filtered.filter(d => d.id !== frontId).map(d => makeDot(d)),
                  filtered.filter(d => d.id === frontId).map(d => makeDot(d)),
                ]
              })()
            ))}

            {/* ── Memorise mode dots ─────────────────────────────────────── */}
            {memorise && memoDeities.map((d, idx) => {
              const seq = idx + 1
              const pos = BHUPURA_POSITIONS[d.sequenceInSection]
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
                  x={pos.x} y={pos.y}
                  r={isActive ? DOT_R_FOCUS : DOT_R_NORMAL}
                  fill={fill} selected={selected}
                  opacity={1}
                  onClick={!flash && (isActive || isPast) ? () => handleMemClick(seq) : undefined}
                  onContextMenu={!flash && isPast ? e => { e.preventDefault(); onToggleResult(seq) } : undefined}
                  onMouseEnter={!flash && (isActive || isPast) ? () => hover(d.id, pos.x, pos.y) : undefined}
                  onMouseLeave={!flash && (isActive || isPast) ? unhover : undefined}
                />
              )
            })}

            {/* Tooltip — Explore mode (desktop hover / mobile tap) and
                Memorise mode (mobile tap-to-reveal inside the bhupura box). */}
            {!flash && (() => {
              // Memorise mode — desktop: show tooltip on hover
              if (memorise && !isMobile && hoveredDot) {
                const d = deityById[hoveredDot.id]
                if (!d) return null
                return <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                  label={displayName(d, script)} fill={GOLD} script={script} />
              }
              // Memorise mode — mobile: show tooltip on tap (inside SVG)
              if (memorise && isMobile && mobileRevealed && hoveredDot) {
                const d = deityById[hoveredDot.id]
                if (!d) return null
                return <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                  label={displayName(d, script)} fill={GOLD} script={script} />
              }
              // Explore mode
              if (!memorise) {
                if (hoveredDot) return (
                  <Tooltip x={hoveredDot.x} y={hoveredDot.y}
                    label={displayName(deityById[hoveredDot.id], script)}
                    fill={GOLD} script={script} />
                )
                const tooltipId = isMobile ? lastTappedId : selectedId
                if (tooltipId) {
                  const d   = deityById[tooltipId]
                  const pos = d ? BHUPURA_POSITIONS[d.sequenceInSection] : null
                  if (!pos) return null
                  return <Tooltip x={pos.x} y={pos.y} label={displayName(d, script)} fill={GOLD} script={script} />
                }
              }
              return null
            })()}

            {/* ── Dot-to-dot nav arrow (Explore mode, mobile only) ─────── */}
            {!memorise && isMobile && (() => {
              const band = BAND_CONFIG[bandStep]
              if (navStep >= band.list.length - 1) return null
              const fromD   = band.list[navStep]
              const toD     = band.list[navStep + 1]
              const fromPos = BHUPURA_POSITIONS[fromD.sequenceInSection]
              const toPos   = BHUPURA_POSITIONS[toD.sequenceInSection]
              if (!fromPos || !toPos) return null
              return <NavArrow from={[fromPos.x, fromPos.y]} to={[toPos.x, toPos.y]} />
            })()}

          </svg>

        </div>

        {/* Completion overlay — inside the diagram container */}

      {showCompletion && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)', zIndex: 10 }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">bhūpura · circuit 1</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === MEMO_TOTAL
                  ? 'All memorised — well done!'
                  : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{MEMO_TOTAL} memorised
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  Try again
                </button>
                <button onClick={() => onNavigate && onNavigate('c2')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  Next → Circuit 2
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter strip — Explore mode only */}
      {!memorise && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {(isMobile ? BAND_CONFIG.map((b, i) => ({ id: b.id, label: b.label, groupLabel: b.groupLabel, active: bandStep === i, onSelect: () => setBandStep(i) }))
                     : FILTERS.map(f => ({ id: f.id, label: f.label, active: activeFilter === f.id, onSelect: () => setActiveFilter(f.id) }))
          ).map(item => (
            <button
              key={item.id}
              onClick={item.onSelect}
              style={{
                fontSize: item.active ? 13 : 11,
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '0.04em',
                color: item.active ? GOLD : 'rgba(201,168,76,0.40)',
                fontWeight: item.active ? 600 : 400,
                background: item.active ? 'rgba(201,168,76,0.12)' : 'transparent',
                border: `1px solid ${item.active ? 'rgba(201,168,76,0.55)' : 'rgba(201,168,76,0.20)'}`,
                borderRadius: 20,
                cursor: 'pointer',
                padding: item.active ? '5px 14px' : '4px 12px',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s, background 0.2s, border-color 0.2s',
              }}
            >
              {item.active && item.groupLabel ? (
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.3 }}>
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.75 }}>{item.groupLabel}</span>
                </span>
              ) : item.label}
            </button>
          ))}
        </div>
      )}

{memorise && <MobileMemoriseInstr />}

      <MobileSvaminiButtons
        section={bhupuraSection}
        script={script}
        svaminiSeq={memoGroup === 'all' ? 29 : memoDeities.length + 1}
        yoginiSeq={memoGroup === 'all' ? 30 : memoDeities.length + 2}
        memorise={memorise}
        currentSeq={currentSeq}
        results={results}
        onMarkResult={onMarkResult}
        onToggleResult={onToggleResult}
      />


      <div className="h-2" />
    </div>
  )
}
