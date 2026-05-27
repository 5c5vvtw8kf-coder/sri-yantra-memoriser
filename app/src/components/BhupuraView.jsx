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
import SriYantraSVG, { BHUPURA_MARKERS } from './SriYantraSVG'

// ── Coordinate constants ───────────────────────────────────────────────────────

const CX = 260
const CY = 270

// ── Yantra fills — petals & circles gold, triangles left as lines only ────────

const GOLD_FILL   = 'rgba(201,168,76,0.80)'
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

// ── Dot positions ─────────────────────────────────────────────────────────────

const BHUPURA_POSITIONS = Object.fromEntries(
  BHUPURA_MARKERS.map(m => [m.n, { x: m.x, y: m.y, level: m.level }])
)

// ── Static data ───────────────────────────────────────────────────────────────

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))

const c1Deities      = deities.filter(d => d.sectionId === 'circuit-1')
const siddhiDeities  = c1Deities.filter(d => d.group === 'siddhiShakti')
const matrikaDeities = c1Deities.filter(d => d.group === 'ashtaMatrika')
const mudraDeities   = c1Deities.filter(d => d.group === 'mudraShakti')

const C1_TOTAL     = c1Deities.length  // 28 — dot-phase deities only
const BHUPURA_TOTAL = 30               // 28 deities + Chakra Svāminī (29) + Yoginī (30)

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD        = '#c9a84c'
const TEAL        = '#b4b6b8'
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

function displayName(deity, script) {
  if (!deity) return ''
  const s = deity.scripts
  if (script === 'devanagari') return s.devanagari || s.iast
  if (script === 'english')    return s.english    || s.iast
  return s.iast
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeityDot({ x, y, r, fill, selected, opacity, onClick, onMouseEnter, onMouseLeave, onDoubleClick, onContextMenu }) {
  const isInteractive = !!(onClick || onMouseEnter)
  return (
    <circle
      cx={x.toFixed(1)} cy={y.toFixed(1)}
      r={r}
      fill={selected ? fill : fill + 'bb'}
      stroke={selected ? '#fff' : fill}
      strokeWidth={selected ? 1.2 : 0.8}
      opacity={opacity ?? 1}
      style={{ cursor: isInteractive ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

function DeityPanel({ deity, script, onDismiss }) {
  if (!deity) return null
  const section = sectionById[deity.sectionId]  // eslint-disable-line no-unused-vars
  const { scripts, sequenceInChant, group, role } = deity

  const groupLabel = group
    ? GROUP_LABEL[group]
    : role === 'chakraSvamini' ? 'Chakra Svāminī' : 'Yoginī'

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
              {groupLabel} · #{sequenceInChant}
            </span>
            <button onClick={onDismiss}
              className="text-muted hover:text-cream transition-colors text-lg leading-none -mt-0.5">
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
            <p className="text-muted text-xs italic">{scripts.translation}</p>
          )}
        </div>
      </div>
    </>
  )
}

function Tooltip({ x, y, label, fill, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 19 : script === 'english' ? 18 : 17
  const h        = script === 'devanagari' ? 38 : script === 'english' ? 36 : 34
  const charW    = script === 'devanagari' ? 14 : script === 'english' ? 11.5 : 10.5
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
        fontSize={fontSize} fill={fill} fontFamily="serif">
        {label}
      </text>
    </g>
  )
}

// ── Filter config ─────────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',          label: 'All',            dot: null              },
  { id: 'siddhiShakti', label: 'Siddhi Shaktis', dot: 'siddhiShakti'   },
  { id: 'ashtaMatrika', label: 'Ashta Matrikas', dot: 'ashtaMatrika'   },
  { id: 'mudraShakti',  label: 'Mudra Shaktis',  dot: 'mudraShakti'    },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function BhupuraView({
  script = 'iast',
  onDeitySelect = () => {},
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
  const [selectedId,   setSelectedId]   = useState(null)
  const [hoveredDot,   setHoveredDot]   = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [contextMenu,  setContextMenu]  = useState(null)
  const clickTimer = useRef(null)
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

  const toggle  = (id) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    onDeitySelect(newId ? deityById[newId] : null)
  }
  const hover   = (id, x, y) => setHoveredDot({ id, x, y })
  const unhover = () => setHoveredDot(null)

  const selectedDeity = selectedId ? deityById[selectedId] : null
  const isDimmed      = (group) => activeFilter !== 'all' && activeFilter !== group

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = (seq) => {
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (currentSeq === seq) onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleMemDblClick = (seq) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === seq) onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const done = memorise && currentSeq > BHUPURA_TOTAL

  return (
    <div className="w-full p-4">

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div className="fixed z-50 bg-surface-800 border border-surface-600 rounded-lg shadow-xl py-1"
               style={{ left: contextMenu.x, top: contextMenu.y }}>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}>
              {results[contextMenu.seq] === 'correct' ? 'Mark as not memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
      )}

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
            filledRegions={YANTRA_FILLS}
          />

          {/* Layer 2: deity dots + tooltip + hint */}
          <svg
            viewBox="45 55 430 430"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label="Bhūpura deity positions"
          >

            {/* ── Explore mode dots ──────────────────────────────────────── */}
            {!memorise && [
              { list: siddhiDeities,  group: 'siddhiShakti' },
              { list: matrikaDeities, group: 'ashtaMatrika' },
              { list: mudraDeities,   group: 'mudraShakti'  },
            ].flatMap(({ list, group }) =>
              list.map(d => {
                const pos    = BHUPURA_POSITIONS[d.sequenceInSection]
                if (!pos) return null
                const fill   = GROUP_COLOUR[group]
                const dimmed = isDimmed(group)
                return (
                  <DeityDot key={d.id}
                    x={pos.x} y={pos.y}
                    r={selectedId === d.id ? DOT_R_FOCUS : DOT_R_NORMAL}
                    fill={fill}
                    selected={selectedId === d.id}
                    opacity={dimmed ? 0.15 : 1}
                    onClick={() => !dimmed && toggle(d.id)}
                    onMouseEnter={() => !dimmed && hover(d.id, pos.x, pos.y)}
                    onMouseLeave={unhover}
                  />
                )
              })
            )}

            {/* ── Memorise mode dots ─────────────────────────────────────── */}
            {memorise && c1Deities.map(d => {
              const seq = d.sequenceInSection
              const pos = BHUPURA_POSITIONS[seq]
              if (!pos) return null

              const isActive  = currentSeq === seq
              const isPast    = currentSeq > seq
              const isFuture  = !isActive && !isPast
              const isCorrect = results[seq] === 'correct'

              let fill, selected
              if (flash)                        { fill = ACTIVE_FILL; selected = true  }
              else if (isActive)                { fill = ACTIVE_FILL; selected = true  }
              else if (isPast && isCorrect)     { fill = RED;         selected = false }
              else if (isPast)                  { fill = GOLD;        selected = false }
              else                              { fill = RED;         selected = false }

              return (
                <DeityDot key={`mem-${seq}`}
                  x={pos.x} y={pos.y}
                  r={isActive ? DOT_R_FOCUS : DOT_R_NORMAL}
                  fill={fill} selected={selected}
                  opacity={isFuture ? 0.15 : 1}
                  onClick={!flash && (isActive || isPast) ? () => handleMemClick(seq) : undefined}
                  onDoubleClick={!flash && (isActive || isPast) ? () => handleMemDblClick(seq) : undefined}
                  onContextMenu={!flash && isPast ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) } : undefined}
                  onMouseEnter={!flash && (isActive || isPast) ? () => hover(d.id, pos.x, pos.y) : undefined}
                  onMouseLeave={!flash && (isActive || isPast) ? unhover : undefined}
                />
              )
            })}

            {/* Memorise: position counter near active dot */}
            {memorise && !done && !flash && currentSeq <= C1_TOTAL && (() => {
              const d   = c1Deities.find(d => d.sequenceInSection === currentSeq)
              const pos = d ? BHUPURA_POSITIONS[currentSeq] : null
              if (!pos) return null
              const labelY = pos.y > CY ? pos.y - 16 : pos.y + 16
              return (
                <text x={pos.x.toFixed(1)} y={labelY.toFixed(1)}
                  textAnchor="middle" fontSize="12" fill={ACTIVE_FILL}
                  fontFamily="serif" pointerEvents="none">
                  {currentSeq} / {C1_TOTAL}
                </text>
              )
            })()}

            {/* Hover tooltip (both modes; suppressed during flash) */}
            {hoveredDot && !flash && (!memorise ? !selectedId : true) && (
              <Tooltip
                x={hoveredDot.x} y={hoveredDot.y}
                label={displayName(deityById[hoveredDot.id], script)}
                fill={GOLD} script={script}
              />
            )}



          </svg>

        </div>

        {/* Completion overlay — inside the diagram container */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)', zIndex: 10 }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">bhūpura · circuit 1</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === BHUPURA_TOTAL
                  ? 'All memorised — well done!'
                  : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{BHUPURA_TOTAL} memorised
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

      {/* Fixed filter strip — bottom-left of yantra, horizontal (explore only) */}
      {!memorise && (
        <div style={{
          position: 'fixed',
          left: 208,
          top: yantraPos.top + yantraPos.height + 8,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'row',
          gap: 6,
        }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => { setActiveFilter(f.id); setSelectedId(null); onDeitySelect(null) }}
              style={{
                fontSize: 11,
                fontFamily: 'serif',
                letterSpacing: '0.04em',
                color: activeFilter === f.id
                  ? GOLD
                  : 'rgba(201,168,76,0.40)',
                fontWeight: activeFilter === f.id ? 600 : 400,
                background: activeFilter === f.id
                  ? 'rgba(201,168,76,0.12)'
                  : 'transparent',
                border: `1px solid ${activeFilter === f.id ? 'rgba(201,168,76,0.55)' : 'rgba(201,168,76,0.20)'}`,
                borderRadius: 20,
                cursor: 'pointer',
                padding: '3px 10px',
                transition: 'color 0.2s, background 0.2s, border-color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {f.dot && (
                <span style={{
                  display: 'inline-block',
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: GROUP_COLOUR[f.dot],
                  flexShrink: 0,
                  marginRight: 4,
                }} />
              )}
              {f.label}
            </button>
          ))}
        </div>
      )}



      {!memorise && (
        <div className="mt-2 text-center">
          <p className="text-muted" style={{ fontSize: '10px' }}>
            Hover or click any dot to reveal the deity
          </p>
        </div>
      )}
      {memorise && !done && (
        <p className="text-center text-muted mt-1" style={{ fontSize: '10px', fontStyle: 'italic' }}>
          hover to reveal · dbl-click = memorised · click = not memorised
        </p>
      )}

      {/* Explore mode: deity panel */}
      {!memorise && selectedDeity && (
        <DeityPanel
          deity={selectedDeity}
          script={script}
          onDismiss={() => { setSelectedId(null); onDeitySelect(null) }}
        />
      )}

      <div className="h-8" />
    </div>
  )
}
