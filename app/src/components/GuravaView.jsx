/**
 * GuravaView.jsx
 *
 * Shows the DFT5 triangle with the three Guru lineage rows above it:
 *   Row 1 (furthest, Divyaugha)  — 7 deities
 *   Row 2 (middle,  Siddhaugha)  — 4 deities
 *   Row 3 (closest, Mānavaugha)  — 8 deities
 *   Total: 19 Guru lineage deities
 *
 * Supports Explore mode (tap to reveal) and Memorise mode (drill 1→19).
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CONTEXT_TRIS, CONTEXT_FILL_PATH, GURU_TRAPEZOID } from '../korvinGeometry'
import { MobileMemoriseInstr } from './MobileSvaminiButtons'

// ── Coordinate system ─────────────────────────────────────────────────────────

// APEX/BASE_L/BASE_R (the central triangle) come from the shared Korvin
// geometry module. See ../korvinGeometry.js.

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]  // eslint-disable-line no-unused-vars

// ── Guru row positions ────────────────────────────────────────────────────────

// The 19 guru dots sit in the lower half of GURU_TRAPEZOID (the dark cell above
// the central triangle), in three rows aligned toward its base.

const DOT_R   = 6      // guru dot radius
const ROW_GAP = 16     // vertical spacing between rows
const H_INSET = 10     // horizontal gap from the trapezoid's sloping sides

const TZ = GURU_TRAPEZOID

// x of the trapezoid's left or right edge at a given y
function trapEdgeX(y, side) {
  const t   = (y - TZ.yTop) / (TZ.yBottom - TZ.yTop)
  const top = side === 'L' ? TZ.topLeft[0]    : TZ.topRight[0]
  const bot = side === 'L' ? TZ.bottomLeft[0] : TZ.bottomRight[0]
  return top + (bot - top) * t
}

// Three row y-values; the bottom row tucks just above the central triangle base
const GURU_Y = { manava: TZ.yBottom - 8.4 }
GURU_Y.siddha = GURU_Y.manava - ROW_GAP
GURU_Y.divya  = GURU_Y.manava - 2 * ROW_GAP

// Evenly spaced row of `count` dots between the trapezoid's inset edges
function rowXY(count, y) {
  const left  = trapEdgeX(y, 'L') + H_INSET
  const right = trapEdgeX(y, 'R') - H_INSET
  return Array.from({ length: count }, (_, i) => [
    count === 1 ? (left + right) / 2 : left + ((right - left) / (count - 1)) * i,
    y,
  ])
}

const divyaRow = rowXY(7, GURU_Y.divya)

// Middle row: outer dots sit under the top row's first and last gaps; the four
// are then spaced evenly between them
const siddhaL = (divyaRow[0][0] + divyaRow[1][0]) / 2
const siddhaR = (divyaRow[5][0] + divyaRow[6][0]) / 2
const siddhaRow = Array.from({ length: 4 }, (_, i) => [
  siddhaL + ((siddhaR - siddhaL) / 3) * i,
  GURU_Y.siddha,
])

const GURU_POSITIONS = {
  'guru-divya':  divyaRow,
  'guru-siddha': siddhaRow,
  'guru-manava': rowXY(8, GURU_Y.manava),
}

const INNER_L = trapEdgeX(GURU_Y.divya, 'L') + H_INSET

// ── Static data ───────────────────────────────────────────────────────────────

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))

const guruDivya  = deities.filter(d => d.sectionId === 'guru-divya').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const guruSiddha = deities.filter(d => d.sectionId === 'guru-siddha').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
const guruManava = deities.filter(d => d.sectionId === 'guru-manava').sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// Combined in chant order: divya → siddha → manava
const guruAll = [...guruDivya, ...guruSiddha, ...guruManava]
const GURU_TOTAL = guruAll.length  // 19

// ── Position lookup ────────────────────────────────────────────────────────────

function getGuruPos(d) {
  const list = d.sectionId === 'guru-divya'  ? guruDivya
             : d.sectionId === 'guru-siddha' ? guruSiddha
             : guruManava
  const i = list.findIndex(g => g.id === d.id)
  return GURU_POSITIONS[d.sectionId]?.[i]
}

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD        = '#c9a84c'
const GREEN       = '#27ae60'
const RED         = '#c0392b'
const BG          = '#0f0805'
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'

// CONTEXT_TRIS — the nine context triangles — come from the shared Korvin
// geometry module. See ../korvinGeometry.js.

// ── Script helper ─────────────────────────────────────────────────────────────


// ── Sub-components ────────────────────────────────────────────────────────────

function DeityDot({ x, y, r, fill, selected, highlighted, onClick, onMouseEnter, onMouseLeave, onDoubleClick, onContextMenu, dimStyle }) {
  const isInteractive = !!(onClick || onMouseEnter)
  return (
    <circle
      cx={x.toFixed(1)} cy={y.toFixed(1)}
      r={selected ? r + 2.5 : r}
      fill={selected ? fill : highlighted ? RED : fill + 'bb'}
      stroke="none"
      strokeWidth={0}
      style={{ cursor: isInteractive ? 'pointer' : 'default', pointerEvents: isInteractive ? 'all' : 'none', ...dimStyle }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}


function Tooltip({ x, label, fill, script }) {
  if (!label) return null
  // Font sizes scaled to match apparent size in other views (GuravaView viewBox is 350
  // wide vs ~465 in InnerView, so SVG font units need to be proportionally smaller)
  const fontSize = script === 'devanagari' ? 20 : script === 'english' ? 19 : 18
  const h        = script === 'devanagari' ? 40 : 38
  const charW    = script === 'devanagari' ? 13.5 : script === 'telugu' ? 16 : script === 'tamil' ? 17 : script === 'english' ? 11 : 10.5
  const w        = Math.max(50, label.length * charW + 14)
  const tx       = Math.min(Math.max(x, 5 + w / 2), 345 - w / 2)
  // Always pin above the top (divya) row so tooltip never covers dots
  const ty       = GURU_Y.divya - h / 2 - 10
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

// ── Main component ────────────────────────────────────────────────────────────

export default function GuravaView({
  script = 'iast',
  onDeitySelect = () => {},
  highlightId = null,
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
  const [selectedId,    setSelectedId]    = useState(null)
  const [hoveredDot,    setHoveredDot]    = useState(null)
  const [mobileRevealed, setMobileRevealed] = useState(false)
  const clickTimer = useRef(null)

  // Clear reveal state when sequence advances or mode changes (no auto-reveal — first tap reveals)
  useEffect(() => { setHoveredDot(null); setMobileRevealed(false) }, [currentSeq, memorise])

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    onDeitySelect(newId ? deityById[newId] : null)
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  const selectedDeity = selectedId ? deityById[selectedId] : null

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = (seq) => {
    const isMobile = window.innerWidth < 768
    if (isMobile && currentSeq === seq && !mobileRevealed) {
      // First tap: reveal only
      const d = guruAll[seq - 1]
      const pos = d ? getGuruPos(d) : null
      if (d && pos) setHoveredDot({ id: d.id, x: pos[0], y: pos[1] })
      setMobileRevealed(true)
      return
    }
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (currentSeq === seq) onMarkResult(seq, 'correct')
      else if (!isMobile && results[seq] !== 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleMemDblClick = (seq) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === seq) onMarkResult(seq, 'wrong')
    else onToggleResult(seq)
  }

  const done = memorise && currentSeq > GURU_TOTAL

  const [showCompletion, setShowCompletion] = useState(false)
  const completionTimer = useRef(null)
  useEffect(() => {
    if (done) {
      completionTimer.current = setTimeout(() => setShowCompletion(true), 3000)
    } else {
      clearTimeout(completionTimer.current)
      setShowCompletion(false)
    }
    return () => clearTimeout(completionTimer.current)
  }, [done])

  const mainTriPts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <div className="w-full p-4">


      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ background: BG }}>
        <svg viewBox="5 220 350 370" xmlns="http://www.w3.org/2000/svg"
             style={{ background: BG, display: 'block', width: '100%' }}
             aria-label="Guravaḥ — three guru lineages">

          <defs>
            <marker id="gurava-flow-arrow-green" markerWidth="7" markerHeight="5"
              refX="0" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={GREEN} />
            </marker>
          </defs>

          {/* Context geometry — even-odd light fill, then surrounding outlines */}
          <path d={CONTEXT_FILL_PATH} fillRule="evenodd"
            fill={GOLD} fillOpacity={0.1} stroke="none" />
          {CONTEXT_TRIS.map((pts, i) => (
            <polygon key={`ctx-${i}`} points={pts}
              fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.14} />
          ))}

          {/* Central triangle — the main triangle */}
          <polygon points={mainTriPts}
            fill="rgba(201,168,76,0.04)" stroke={GOLD}
            strokeWidth={3} strokeLinejoin="miter" />

          {/* Flow arrow — horizontal above Divyaugha row */}
          {!memorise && (() => {
            const ay = GURU_Y.divya - 26
            return (
              <line
                x1={INNER_L.toFixed(1)} y1={ay.toFixed(1)}
                x2={(INNER_L + 27).toFixed(1)} y2={ay.toFixed(1)}
                stroke={GREEN} strokeWidth={2.5} opacity="0.65"
                markerEnd="url(#gurava-flow-arrow-green)" />
            )
          })()}

          {/* Guru row labels */}
          {(() => {
            const sharedX = (GURU_POSITIONS['guru-manava'][0][0] - 9 - 8).toFixed(1)
            return [
              { iast: 'divyaugha guravaḥ',  devanagari: 'दिव्यौघ गुरवः', english: 'Divine Gurus', y: GURU_Y.divya  },
              { iast: 'siddhaugha guravaḥ', devanagari: 'सिद्धौघ गुरवः', english: 'Siddha Gurus', y: GURU_Y.siddha },
              { iast: 'mānavaugha guravaḥ', devanagari: 'मानवौघ गुरवः',  english: 'Human Gurus',  y: GURU_Y.manava },
            ].map(({ iast, devanagari, english, y }) => {
              const label = script === 'devanagari' ? devanagari : script === 'english' ? english : iast
              return (
                <text key={iast} x={sharedX} y={y.toFixed(1)}
                  textAnchor="end" dominantBaseline="middle"
                  fontSize="12" fill={GOLD} opacity="0.70"
                  fontFamily="'Gentium Plus', Georgia, serif">
                  {label}
                </text>
              )
            })
          })()}

          {/* ── Explore mode dots ─────────────────────────────────────────── */}
          {!memorise && [
            { sectionId: 'guru-divya',  list: guruDivya  },
            { sectionId: 'guru-siddha', list: guruSiddha },
            { sectionId: 'guru-manava', list: guruManava },
          ].flatMap(({ sectionId, list }) =>
            list.map((d, i) => {
              const pos = GURU_POSITIONS[sectionId]?.[i]
              if (!pos) return null
              return (
                <DeityDot key={d.id}
                  x={pos[0]} y={pos[1]} r={DOT_R}
                  fill={selectedId === d.id ? RED : "#fff8c8"}
                  selected={selectedId === d.id}
                  highlighted={!selectedId && highlightId === d.id}
                  onClick={() => toggle(d.id)}
                  onMouseEnter={() => hover(d.id, pos[0], pos[1])}
                  onMouseLeave={unhover}
                />
              )
            })
          )}

          {/* ── Memorise mode dots ────────────────────────────────────────── */}
          {memorise && guruAll.map((d, idx) => {
            const seq = idx + 1
            const pos = getGuruPos(d)
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
                x={pos[0]} y={pos[1]} r={DOT_R} fill={fill} selected={selected}
                onClick={!flash && (isActive || isPast) ? () => handleMemClick(seq) : undefined}
                onDoubleClick={!flash && (isActive || isPast) ? () => handleMemDblClick(seq) : undefined}
                onContextMenu={!flash && isPast ? e => { e.preventDefault(); onToggleResult(seq) } : undefined}
                onMouseEnter={!flash && (isActive || isPast) ? () => hover(d.id, pos[0], pos[1]) : undefined}
                onMouseLeave={!flash && (isActive || isPast) ? unhover : undefined}
              />
            )
          })}

          {/* Memorise: active position counter */}

          {/* Tooltip: auto-reveals in Memorise; Explore falls back to selectedId tap.
              Always pinned above the top (divya) row — never covers any dots. */}
          {!flash && (() => {
            if (hoveredDot) return (
              <Tooltip x={hoveredDot.x}
                label={displayName(deityById[hoveredDot.id], script)}
                fill={GOLD} script={script} />
            )
            if (!memorise && selectedId) {
              const d   = deityById[selectedId]
              const pos = d ? getGuruPos(d) : null
              if (!pos) return null
              return <Tooltip x={pos[0]} label={displayName(d, script)} fill={GOLD} script={script} />
            }
            return null
          })()}

          {/* Hint */}



        </svg>

        {/* Completion overlay (delayed 700 ms) */}
        {showCompletion && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)' }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">guravaḥ</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === GURU_TOTAL
                  ? 'All memorised — well done!'
                  : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{GURU_TOTAL} memorised
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  Try again
                </button>
                <button onClick={() => onNavigate && onNavigate('bhupura')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {memorise && <MobileMemoriseInstr />}

      <div className="h-8" />

    </div>
  )
}
