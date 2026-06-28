/**
 * NyasaView.jsx
 *
 * Full Sri Yantra with the 6 Nyāsāṅga Devatāḥ placed as 9 dots:
 *
 *   nyasa-001  hṛdayadēvī  — top-right corner of middle bhupura square
 *   nyasa-002  śirōdēvī    — top-left  corner of middle bhupura square
 *   nyasa-003  śikhādēvī   — bottom-right corner of middle bhupura square
 *   nyasa-004  kavacadēvī  — bottom-left  corner of middle bhupura square
 *   nyasa-005  nētradēvī   — bindu (centre point)
 *   nyasa-006  astradēvī   — one dot at each of the four T-gate passages
 *
 * Coordinate system matches SriYantraSVG.jsx exactly:
 *   viewBox 0 0 500 500 · CX = 250 · CY = 250
 *
 * Corner dot distance:     218 from centre — between inner (212) and outer (228) square
 *                          corners, giving ~3-unit clearance from the outer bhupura line
 * Gate dot distance:       212 from centre — in the gap zone between inner box floor (212)
 *                          and outer circle (202), sitting in the visible gate passage
 * Bindu:                   (CX, CY)  — bindu maps to exact centre of 0 0 500 500 overlay
 */

import { useState, useRef, useEffect } from 'react'
import SriYantraSVG from './SriYantraSVG'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { MobileMemoriseInstr } from './MobileSvaminiButtons'
import { useDoneDelay } from '../hooks/useDoneDelay'

// ── Coordinate constants (must stay in sync with SriYantraSVG.jsx) ────────────

const CX       = 250
const CY       = 250
const BINDU_CY = CY         // 250 — bindu is exactly centre in the 0 0 500 500 overlay

// ── Dot positions ─────────────────────────────────────────────────────────────

// Corner dots: 218 from centre — between inner (212) and outer (228) square corners.
const CORNER_D = 218

const BODY_POSITIONS = [
  [CX + CORNER_D, CY - CORNER_D],   // seq 1 — Hṛdaya   — top-right   (468, 32)
  [CX - CORNER_D, CY - CORNER_D],   // seq 2 — Śiras    — top-left    (32,  32)
  [CX + CORNER_D, CY + CORNER_D],   // seq 3 — Śikhā   — bottom-right (468, 468)
  [CX - CORNER_D, CY + CORNER_D],   // seq 4 — Kavaca   — bottom-left  (32,  468)
  [CX,            BINDU_CY      ],   // seq 5 — Netra    — bindu        (250, 250)
]

// Astra: 212 from centre — inside the gap zone between inner box floor (s=212)
// and outermost boundary circle (r=202).
const GATE_D = 212

const ASTRA_POSITIONS = [
  [CX,          CY - GATE_D],   // N  (250, 38)
  [CX + GATE_D, CY          ],  // E  (462, 250)
  [CX,          CY + GATE_D],   // S  (250, 462)
  [CX - GATE_D, CY          ],  // W  (38,  250)
]

// ── Data ──────────────────────────────────────────────────────────────────────

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))

const nyasaDeities = deities
  .filter(d => d.sectionId === 'nyasa')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// ── Yantra fills (same palette as BhupuraView) ────────────────────────────────

const GOLD_FILL  = 'rgba(201,168,76,0.80)'
const BROWN_FILL = 'rgba(138,117,96,0.35)'
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

// Brown version for Memorise mode — makes gold "not memorised" dots stand out
const YANTRA_FILLS_BROWN = Object.fromEntries(
  Object.entries(YANTRA_FILLS).map(([k, v]) => [k, v === GOLD_FILL ? BROWN_FILL : v])
)

// ── Colours ───────────────────────────────────────────────────────────────────

const RED        = '#c0392b'   // past-correct dot colour
const GOLD       = '#c9a84c'   // past-wrong dot colour; explore tooltip
const GREEN      = '#27ae60'   // navigation arrow colour
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'  // cream — active item in Memorise mode

// ── NavArrow ──────────────────────────────────────────────────────────────────

function NavArrow({ from, to, length = 27, gap = 12 }) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist
  const x1 = from[0] + nx * gap
  const y1 = from[1] + ny * gap
  const x2 = x1 + nx * length
  const y2 = y1 + ny * length
  return (
    <line
      x1={x1.toFixed(1)} y1={y1.toFixed(1)}
      x2={x2.toFixed(1)} y2={y2.toFixed(1)}
      stroke={GREEN} strokeWidth={2.5} opacity="0.65"
      markerEnd="url(#nav-arrow-green)"
    />
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────


// ── DeityDot ──────────────────────────────────────────────────────────────────

function DeityDot({
  x, y, r = 9, fill, selected, highlighted,
  onClick, onMouseEnter, onMouseLeave,
  onDoubleClick, onContextMenu,
  dimStyle,
}) {
  const isInteractive = !!(onClick || onMouseEnter)
  return (
    <circle
      cx={x.toFixed(1)} cy={y.toFixed(1)}
      r={selected ? r + 2.5 : r}
      fill={selected ? fill : highlighted ? RED : fill + 'bb'}
      stroke="none"
      strokeWidth={0}
      style={{
        cursor: isInteractive ? 'pointer' : 'default',
        pointerEvents: isInteractive ? 'all' : 'none',
        ...dimStyle,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, fill, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)

  const tx = Math.min(Math.max(x, w / 2 + 4), 500 - w / 2 - 4)
  const ty = y - h / 2 - 14 < 4
    ? y + h / 2 + 14
    : y - h / 2 - 14

  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(15,8,5,0.93)" stroke={fill} strokeWidth={0.6}
      />
      <text
        x={tx.toFixed(1)} y={ty.toFixed(1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill={fill} fontFamily="'Gentium Plus', Georgia, serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── DeityPanel ────────────────────────────────────────────────────────────────

function DeityPanel({ deity, script, onDismiss }) {
  if (!deity) return null
  const section   = sectionById[deity.sectionId]
  const { scripts, sequenceInChant } = deity
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
              {section?.label ?? deity.sectionId} · #{sequenceInChant}
            </span>
            <button
              onClick={onDismiss}
              className="text-muted hover:text-cream transition-colors text-lg leading-none -mt-0.5"
            >
              ×
            </button>
          </div>
          <h2 className={`${isDevPrim ? '' : 'iast'} text-gold-400 text-lg font-medium leading-snug mb-1`}>
            {primary}
          </h2>
          {script !== 'iast' && scripts.iast && (
            <p className="iast text-gold-600 text-sm mb-1">{scripts.iast}</p>
          )}
          {script !== 'english' && scripts.english && (
            <p className="text-cream text-sm mb-2">{scripts.english}</p>
          )}
          {scripts.translation && (
            <p className="text-muted text-xs italic mb-2">{scripts.translation}</p>
          )}
          {deity.note && (
            <p className="text-muted text-xs">{deity.note}</p>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NyasaView({
  script       = 'iast',
  onDeitySelect = () => {},
  highlightId  = null,
  // Memorise mode props
  memorise         = false,
  currentSeq       = 1,
  results          = {},
  onStartMemorise,
  onExitMemorise,
  onMarkResult,
  onToggleResult,
  flash            = false,
  onNavigate,
  tr               = k => k,
  uiLang           = 'en',
}) {
  const [selectedId,    setSelectedId]    = useState(null)
  const [hoveredDot,    setHoveredDot]    = useState(null)     // { id, x, y }
  const [navStep,       setNavStep]       = useState(0)        // 0–4: navigation arrow stage
  const [mobileRevealed, setMobileRevealed] = useState(false)
  const [revealedDeity,  setRevealedDeity]  = useState(null)   // for mobile name overlay
  const clickTimer = useRef(null)

  // Reset reveal state when sequence advances
  useEffect(() => { setMobileRevealed(false); setRevealedDeity(null) }, [currentSeq, memorise])

  // ── Explore mode ────────────────────────────────────────────────────────────

  const NAV_TRIGGERS = {
    'nyasa-001': 1,   // Hṛdaya  → show Śiras→Śikhā
    'nyasa-002': 2,   // Śiras   → show Śikhā→Kavaca
    'nyasa-003': 3,   // Śikhā  → show Kavaca→Netra
    'nyasa-005': 4,   // Netra   → show 4 Astra arrows
  }

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    onDeitySelect(newId ? deityById[newId] : null)
    if (id === 'nyasa-006') {
      setNavStep(0)
    } else if (NAV_TRIGGERS[id] !== undefined) {
      setNavStep(prev => Math.max(prev, NAV_TRIGGERS[id]))
    }
  }
  // Desktop hover only — suppress on mobile (HTML overlay is the mobile reveal)
  const hover   = (id, x, y) => { if (window.innerWidth < 768) return; setHoveredDot({ id, x, y }) }
  const unhover = () => setHoveredDot(null)

  const selectedDeity = selectedId ? deityById[selectedId] : null
  const bodyDeities   = nyasaDeities.slice(0, 5)
  const astraDeity    = nyasaDeities[5]

  // ── Memorise mode ────────────────────────────────────────────────────────────

  const handleMemClick = (seq) => {
    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0
    if (isMobile && currentSeq === seq && !mobileRevealed) {
      // First tap: reveal only
      const d = nyasaDeities[seq - 1]
      if (d) { setRevealedDeity(d); setMobileRevealed(true) }
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

  const done = memorise && currentSeq > 6
  const showCompletion = useDoneDelay(done)

  // dotsForSeq: returns list of [x, y] positions for this sequence number
  const dotsForSeq = (seq) => {
    if (seq >= 1 && seq <= 5) return [BODY_POSITIONS[seq - 1]]
    if (seq === 6) return ASTRA_POSITIONS
    return []
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full px-4 pt-3 pb-0 md:p-4 flex-1 flex flex-col md:block md:flex-none">

      {/* ── Yantra + dot overlay ── */}
      <div className="relative w-full flex-1 min-h-0 md:flex-none md:[padding-bottom:100%]">

        {/* Base yantra — clipped to rounded corners */}
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          <SriYantraSVG className="w-full h-full" showTriangles={true} filledRegions={memorise ? YANTRA_FILLS_BROWN : YANTRA_FILLS} />
        </div>

        {/* Dot overlay — sibling to clip container, same 500×500 viewBox */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 500 500"
          xmlns="http://www.w3.org/2000/svg"
          style={{ pointerEvents: 'none' }}
          aria-label="Nyāsa Devatāḥ dot overlay"
        >
          <defs>
            <marker id="nav-arrow-green" markerWidth="7" markerHeight="5"
              refX="0" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={GREEN} />
            </marker>
          </defs>

          {/* ── Explore mode: navigation arrows ── */}
          {!memorise && navStep === 0 && (
            <line
              x1={462} y1={15} x2={435} y2={15}
              stroke={GREEN} strokeWidth={2.5} opacity="0.65"
              markerEnd="url(#nav-arrow-green)"
            />
          )}
          {!memorise && navStep === 1 && (
            <NavArrow from={BODY_POSITIONS[1]} to={BODY_POSITIONS[2]} />
          )}
          {!memorise && navStep === 2 && (
            <NavArrow from={BODY_POSITIONS[2]} to={BODY_POSITIONS[3]} />
          )}
          {!memorise && navStep === 3 && (
            <NavArrow from={BODY_POSITIONS[3]} to={BODY_POSITIONS[4]} />
          )}
          {!memorise && navStep === 4 && ASTRA_POSITIONS.map(([ax, ay], i) => (
            <NavArrow key={`nav-astra-${i}`}
              from={[CX, BINDU_CY]} to={[ax, ay]}
              gap={20} length={65}
            />
          ))}

          {/* ── Explore mode: body dots (Hṛdaya → Netra) ── */}
          {!memorise && bodyDeities.map((d, i) => {
            const pos = BODY_POSITIONS[i]
            if (!pos) return null
            return (
              <DeityDot key={d.id}
                x={pos[0]} y={pos[1]}
                fill={selectedId === d.id ? RED : "#fff8c8"}
                selected={selectedId === d.id}
                highlighted={!selectedId && highlightId === d.id}
                onClick={() => toggle(d.id)}
                onMouseEnter={() => hover(d.id, pos[0], pos[1])}
                onMouseLeave={unhover}
              />
            )
          })}

          {/* ── Explore mode: Astra gate dots (×4) ── */}
          {!memorise && astraDeity && ASTRA_POSITIONS.map(([x, y], i) => (
            <DeityDot key={`astra-gate-${i}`}
              x={x} y={y}
              fill={selectedId === astraDeity.id ? RED : "#fff8c8"}
              selected={selectedId === astraDeity.id}
              highlighted={!selectedId && highlightId === astraDeity.id}
              onClick={() => toggle(astraDeity.id)}
              onMouseEnter={() => hover(astraDeity.id, x, y)}
              onMouseLeave={unhover}
            />
          ))}

          {/* ── Tooltip: desktop hover OR mobile tap in Explore mode ── */}
          {!flash && (() => {
            // Desktop hover (both modes)
            if (hoveredDot) {
              return astraDeity && hoveredDot.id === astraDeity.id
                ? ASTRA_POSITIONS.map(([x, y], i) => (
                    <Tooltip key={`astra-tt-${i}`}
                      x={x} y={y}
                      label={displayName(astraDeity, script)}
                      fill={GOLD} script={script}
                    />
                  ))
                : (
                    <Tooltip
                      x={hoveredDot.x} y={hoveredDot.y}
                      label={displayName(deityById[hoveredDot.id], script)}
                      fill={GOLD} script={script}
                    />
                  )
            }
            // Mobile tap fallback — Explore mode only
            if (!memorise && selectedId) {
              const d   = deityById[selectedId]
              const seq = d?.sequenceInSection
              if (!d) return null
              if (seq === 6) {
                return ASTRA_POSITIONS.map(([x, y], i) => (
                  <Tooltip key={`astra-sel-tt-${i}`}
                    x={x} y={y}
                    label={displayName(d, script)}
                    fill={GOLD} script={script}
                  />
                ))
              }
              const pos = seq >= 1 && seq <= 5 ? BODY_POSITIONS[seq - 1] : null
              if (!pos) return null
              return (
                <Tooltip
                  x={pos[0]} y={pos[1]}
                  label={displayName(d, script)}
                  fill={GOLD} script={script}
                />
              )
            }
            return null
          })()}

          {/* ── Memorise mode: dots ── */}
          {memorise && nyasaDeities.map(d => {
            const seq       = d.sequenceInSection
            const isActive  = currentSeq === seq
            const isPast    = currentSeq > seq
            const isCorrect = results[seq] === 'correct'
            const positions = dotsForSeq(seq)
            const isFuture  = !isActive && !isPast

            if (isFuture) return null

            let fill, selected
            if (flash) {
              fill = ACTIVE_FILL; selected = true
            } else if (isActive) {
              fill = ACTIVE_FILL; selected = true
            } else if (isPast && isCorrect) {
              fill = RED; selected = false
            } else {
              fill = GOLD; selected = false
            }

            return positions.map(([x, y], pi) => (
              <DeityDot key={`mem-${seq}-${pi}`}
                x={x} y={y}
                fill={fill}
                selected={selected}
                onClick={!flash && (isActive || isPast) ? () => handleMemClick(seq) : undefined}
                onDoubleClick={!flash && (isActive || isPast) ? () => handleMemDblClick(seq) : undefined}
                onContextMenu={!flash && isPast
                  ? e => { e.preventDefault(); onToggleResult(seq) }
                  : undefined}
                onMouseEnter={!flash && (isActive || isPast) ? () => hover(d.id, x, y) : undefined}
                onMouseLeave={!flash && (isActive || isPast) ? unhover : undefined}
              />
            ))
          })}

        </svg>

        {/* ── Memorise mode: mobile name overlay — tap-to-reveal ── */}
        {memorise && revealedDeity && !flash && !showCompletion && (
          <div className="md:hidden absolute left-0 right-0 flex justify-center pointer-events-none"
               style={{ top: '5%' }}>
            <div style={{
              background: 'rgba(15,8,5,0.88)',
              border: '0.5px solid rgba(201,168,76,0.5)',
              borderRadius: '6px',
              padding: '6px 18px',
            }}>
              <span className={script !== 'english' ? 'iast' : ''}
                    style={{ color: '#c9a84c', fontSize: '16px', fontFamily: "'Gentium Plus', Georgia, serif" }}>
                {displayName(revealedDeity, script)}
              </span>
            </div>
          </div>
        )}

        {/* ── Memorise mode: completion overlay (delayed 700 ms) ── */}
        {showCompletion && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(15,8,5,0.82)' }}
          >
            <div
              className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
              style={{ maxWidth: '15rem', margin: '0 1rem' }}
            >
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">
                nyāsāṅgadēvatāḥ
              </p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === 6
                  ? tr('misc.all_memorised')
                  : tr('spot.round_complete')}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/6 {tr('misc.memorised')}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
                >
                  {tr('misc.try_again')}
                </button>
                <button
                  onClick={() => onNavigate && onNavigate('inner')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
                >
                  {tr('misc.next')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>



      {memorise && <MobileMemoriseInstr tr={tr} />}

      <div className="h-0 md:h-8" />
    </div>
  )
}
