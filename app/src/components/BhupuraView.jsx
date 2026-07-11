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
 * (sequenceInSection 1–29 → BHUPURA_MARKERS n 1–29):
 *
 *   Level 1 outer  (s=228) : n 1–11  → 11 Siddhi Shaktis   — gold (n=11 near laghimā)
 *   Level 2 middle (s=220) : n 12–19 → 8 Ashta Matrikas     — teal
 *   Level 3 inner  (s=212) : n 20–29 → 10 Mudra Shaktis     — red
 *
 * Supports Explore mode (tap to reveal, filter by group) and
 * Memorise mode (drill sequentially through all 29).
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

// garimāsiddhē (sequenceInSection=3) co-locates with laghimāsiddhē on dot n=11,
// which has the same physical coordinates as n=2. Siddhis seq=4–11 shift back by
// one slot to fill n=3–10, restoring the pre-garimā positions.
function siddhiDotN(seq) {
  if (seq <= 2) return seq   // aṇimā, laghimā — unchanged
  if (seq === 3) return 11   // garimā — shares laghimā's physical position
  return seq - 1             // mahimā (4→3) through sarvakāma (11→10)
}

function bhupuraPos(d) {
  const n = d.group === 'siddhiShakti' ? siddhiDotN(d.sequenceInSection) : d.sequenceInSection
  return BHUPURA_POSITIONS[n]
}

// ── Static data ───────────────────────────────────────────────────────────────

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))
const bhupuraSection = sections.find(s => s.circuitNumber === 1 && s.type === 'circuit') || {}
const bhupuraSvaminiDeity = deities.find(d => d.sectionId === 'circuit-1' && d.role === 'chakraSvamini') ?? null
const bhupuraYoginiDeity  = deities.find(d => d.sectionId === 'circuit-1' && d.role === 'yoginiType')  ?? null

const c1Deities      = deities.filter(d => d.sectionId === 'circuit-1')
const siddhiDeities  = c1Deities.filter(d => d.group === 'siddhiShakti').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const matrikaDeities = c1Deities.filter(d => d.group === 'ashtaMatrika').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const mudraDeities   = c1Deities.filter(d => d.group === 'mudraShakti').sort((a, b) => a.sequenceInSection - b.sequenceInSection)

const C1_TOTAL     = c1Deities.length  // 29 — dot-phase deities only (includes garimāsiddhē)
const BHUPURA_TOTAL = 31               // 29 deities + Chakra Svāminī (30) + Yoginī (31)

// Co-location map: group deities by physical (x,y) position so that dots sharing
// the same coordinates (e.g. laghimāsiddhē n=2 and garimāsiddhē n=11) are merged.
const _posKeyDeities = {}
c1Deities.forEach(d => {
  const pos = bhupuraPos(d)
  if (!pos) return
  const key = `${pos.x},${pos.y}`
  if (!_posKeyDeities[key]) _posKeyDeities[key] = []
  _posKeyDeities[key].push(d)
})

// Returns the display label for a dot — concatenates names when co-located deities share a position.
function dotLabel(id, script) {
  const d = deityById[id]
  if (!d) return id
  const pos = bhupuraPos(d)
  const key = pos ? `${pos.x},${pos.y}` : null
  const group = key ? (_posKeyDeities[key] ?? []) : []
  return group.length > 1
    ? group.map(g => displayName(g, script)).join(', ')
    : displayName(d, script)
}

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

function DeityDot({ x, y, r, fill, selected, highlighted, isHovered, opacity, onClick, onTouchStart, onMouseEnter, onMouseLeave, onDoubleClick, onContextMenu }) {
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
      onTouchStart={onTouchStart}
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
  const h        = (script === 'devanagari' || script === 'kannada' || script === 'malayalam') ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'kannada' ? 20 : script === 'malayalam' ? 23 : script === 'english' ? 14.5 : 13.5
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
  { id: 'all',          label: 'All',                          trKey: 'misc.all' },
  { id: 'siddhiShakti', label: 'Outer Band — Siddhi Shaktis',  trKey: 'bhupura.outer_band', groupTrKey: 'bhupura.siddhi'  },
  { id: 'ashtaMatrika', label: 'Middle Band — Ashta Matrikas', trKey: 'bhupura.middle_band', groupTrKey: 'bhupura.matrika' },
  { id: 'mudraShakti',  label: 'Inner Band — Mudra Shaktis',   trKey: 'bhupura.inner_band',  groupTrKey: 'bhupura.mudra'   },
]

// ── Mobile band config (Explore mode navigation) ──────────────────────────────

const BAND_CONFIG = [
  { id: 'siddhiShakti', list: siddhiDeities,  label: 'Outer Band',  groupLabel: 'Siddhi Shaktis', trKey: 'bhupura.outer_band',  groupTrKey: 'bhupura.siddhi'  },
  { id: 'ashtaMatrika', list: matrikaDeities, label: 'Middle Band', groupLabel: 'Ashta Matrikas', trKey: 'bhupura.middle_band', groupTrKey: 'bhupura.matrika' },
  { id: 'mudraShakti',  list: mudraDeities,   label: 'Inner Band',  groupLabel: 'Mudra Shaktis',  trKey: 'bhupura.inner_band',  groupTrKey: 'bhupura.mudra'   },
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
  tr = k => k,
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
  const isTouchDevice = navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches
  const touchFiredRef = useRef(0)   // ms timestamp of last touchStart; 0 = never; suppresses ghost click in onClick
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

  // Explore: tap always selects (no deselect on re-tap). Show deity details in right panel.
  const toggle  = (id) => {
    setSelectedId(id)
    setHoveredDot(null)
    const deity = deityById[id]
    if (!deity) { onDeitySelect(null); return }
    // Co-location: if siblings share this dot (e.g. laghimā + garimā), show both
    const pos      = bhupuraPos(deity)
    const key      = pos ? `${pos.x},${pos.y}` : null
    const siblings = key ? _posKeyDeities[key] : null
    if (siblings && siblings.length > 1) {
      const sorted = [...siblings].sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      onDeitySelect(sorted)
    } else {
      onDeitySelect(deity)
    }
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
    const isMobileTap = window.innerWidth < 768 || (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches)
    if (isMobileTap && currentSeq === seq && !mobileRevealed) {
      // First tap: reveal only
      const d   = memoDeities[seq - 1]
      const pos = d ? bhupuraPos(d) : null
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
    <div className="w-full px-4 pt-3 pb-0 md:p-4 flex-1 flex flex-col md:block md:flex-none">

      {/* Diagram — full Sri Yantra background + dot overlay */}
      <div ref={yantraRef}
           className="relative w-full flex-1 min-h-0 md:flex-none rounded-xl overflow-hidden shadow-2xl shadow-black/60 md:[padding-bottom:100%]">
        <div className="absolute inset-0">

          {/* Layer 1: full Sri Yantra */}
          <SriYantraSVG
            className="w-full h-full"
            preserveAspectRatio="xMidYMin meet"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={dynamicFills}
          />

          {/* Layer 2: deity dots + tooltip + nav */}
          <svg
            viewBox="45 55 430 430"
            preserveAspectRatio="xMidYMin meet"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent', touchAction: 'manipulation' }}
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
                  const pos     = bhupuraPos(d)
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
                  const pos  = bhupuraPos(d)
                  if (!pos) return null
                  const isSelected = selectedId === d.id
                  const fill = isSelected ? RED : (showColors ? GROUP_COLOUR[d.group] : '#fff8c8')
                  return (
                    <DeityDot key={d.id}
                      x={pos.x} y={pos.y}
                      r={DOT_R_NORMAL}
                      fill={fill}
                      selected={isSelected}
                      highlighted={!selectedId && highlightId === d.id}
                      isHovered={hoveredDot?.id === d.id}
                      opacity={1}
                      onTouchStart={() => {
                        touchFiredRef.current = Date.now()
                        toggle(d.id)
                      }}
                      onClick={() => {
                        if (Date.now() - touchFiredRef.current < 800) return  // suppress ghost click after touchstart
                        toggle(d.id)
                      }}
                      onMouseEnter={isTouchDevice ? undefined : () => hover(d.id, pos.x, pos.y)}
                      onMouseLeave={isTouchDevice ? undefined : unhover}
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
              const pos = bhupuraPos(d)
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
                    label={dotLabel(hoveredDot.id, script)}
                    fill={GOLD} script={script} />
                )
                const tooltipId = isMobile ? lastTappedId : selectedId
                if (tooltipId) {
                  const d   = deityById[tooltipId]
                  const pos = d ? bhupuraPos(d) : null
                  if (!pos) return null
                  return <Tooltip x={pos.x} y={pos.y} label={dotLabel(tooltipId, script)} fill={GOLD} script={script} />
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
              const fromPos = bhupuraPos(fromD)
              const toPos   = bhupuraPos(toD)
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
                  ? tr('misc.all_memorised')
                  : tr('spot.round_complete')}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{MEMO_TOTAL} {tr('misc.memorised')}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  {tr('misc.try_again')}
                </button>
                <button onClick={() => onNavigate && onNavigate('c2')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  {tr('misc.next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter strip — Explore mode only */}
      {!memorise && (
        <div className="flex items-center justify-center gap-2 mt-2">
          {(isMobile ? BAND_CONFIG.map((b, i) => ({ id: b.id, label: tr(b.trKey) || b.label, groupLabel: tr(b.groupTrKey) || b.groupLabel, active: bandStep === i, onSelect: () => setBandStep(i) }))
                     : FILTERS.map(f => ({ id: f.id, label: tr(f.trKey) || f.label, groupLabel: f.groupTrKey ? tr(f.groupTrKey) : null, active: activeFilter === f.id, onSelect: () => setActiveFilter(f.id) }))
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

{memorise && <MobileMemoriseInstr tr={tr} />}

      <MobileSvaminiButtons
        section={bhupuraSection}
        script={script}
        tr={tr}
        svaminiDeity={bhupuraSvaminiDeity}
        yoginiDeity={bhupuraYoginiDeity}
        svaminiSeq={memoGroup === 'all' ? 29 : memoDeities.length + 1}
        yoginiSeq={memoGroup === 'all' ? 30 : memoDeities.length + 2}
        memorise={memorise}
        currentSeq={currentSeq}
        atEnd={!memorise && navStep >= BAND_CONFIG[bandStep].list.length && bandStep >= BAND_CONFIG.length - 1}
        results={results}
        onMarkResult={onMarkResult}
        onToggleResult={onToggleResult}
      />


      
    </div>
  )
}
