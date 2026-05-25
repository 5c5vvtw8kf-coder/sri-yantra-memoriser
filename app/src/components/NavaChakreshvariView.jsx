/**
 * NavaChakreshvariView.jsx
 *
 * Nine Tripura forms — one presiding over each āvaraṇa (circuit).
 *
 * Interaction model: whole-circuit hover/click, consistent with other avarana pages.
 *
 * Explore mode:
 *   Hover any circuit → highlights whole circuit + shows tooltip with Tripura form.
 *   Click a circuit   → reveals that form in the deity panel.
 *
 * Memorise mode:
 *   Click or double-click any part of a circuit → single-click = not yet,
 *   double-click = memorised. Right-click toggles a past result.
 *   Active circuit is highlighted via buildFills + activeCircuit.
 *
 * The bindu (c9) stays black throughout — buildFills enforces this.
 */

import { useState, useRef } from 'react'
import SriYantraSVG from './SriYantraSVG'
import data from '../data/khadgamala-canonical.json'

// ── SriYantraSVG coordinate space ────────────────────────────────────────────
//   CX = 260, CY = 270, viewBox "45 55 430 430"

const SVG_CX = 260
const SVG_CY = 270

// Tooltip anchor points per circuit, in SriYantraSVG SVG coordinates.
// Chosen to sit within the circuit's visual region without overlapping the bindu.
const CIRCUIT_TOOLTIP_POS = {
  1: { x: 260, y: 455 },   // bhupura — bottom-centre gate
  2: { x: 390, y: 270 },   // 16-petal — right midpoint
  3: { x: 148, y: 270 },   // 8-petal  — left midpoint
  4: { x: 192, y: 270 },   // 14-tri   — left inner ring
  5: { x: 214, y: 207 },   // 10-outer — upper
  6: { x: 260, y: 217 },   // 10-inner — upper-centre
  7: { x: 260, y: 243 },   // 8-tri    — mid-centre
  8: { x: 260, y: 262 },   // primary tri — lower-centre
  9: { x: 260, y: 270 },   // bindu
}

// ── Region id → circuit number ────────────────────────────────────────────────
//
// Triangle sub-region polygons (tri-cN-NN) render on top of the masked circuit
// regions and intercept events first — normalisation is therefore required.

function regionToCircuit(id) {
  if (!id) return null
  if (id === 'c1' || id.startsWith('bhupura-')) return 1
  if (id === 'c2' || id.startsWith('petal-c2-')) return 2
  if (id === 'c3' || id.startsWith('petal-c3-')) return 3
  if (id === 'c4' || id.startsWith('tri-c4-')) return 4
  if (id === 'c5' || id.startsWith('tri-c5-')) return 5
  if (id === 'c6' || id.startsWith('tri-c6-')) return 6
  if (id === 'c7' || id.startsWith('tri-c7-')) return 7
  if (id === 'c8' || id.startsWith('tri-c8-')) return 8
  if (id === 'c9') return 9
  return null
}

// ── Fill builder ──────────────────────────────────────────────────────────────

const FILL_NORM   = 'rgba(201,168,76,0.70)'
const FILL_DIM    = 'rgba(201,168,76,0.18)'
const FILL_HI     = 'rgba(255,248,200,0.92)'
const GOLD        = '#c9a84c'
const RED         = '#c0392b'
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'

function buildFills(sel) {
  const f = (n) => !sel ? FILL_NORM : sel === n ? FILL_HI : FILL_DIM
  return {
    // C1 bhupura: transparent when not highlighted so the plain gold lines show,
    // but non-null so RegionFills renders a hit-testable polygon for hover.
    'c1': sel === 1 ? FILL_HI : sel ? FILL_DIM : 'transparent',
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
      [`petal-c2-${String(i + 1).padStart(2, '0')}`, f(2)])),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
      [`petal-c3-${String(i + 1).padStart(2, '0')}`, f(3)])),
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
      [`tri-c4-${String(i + 1).padStart(2, '0')}`, f(4)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c5-${String(i + 1).padStart(2, '0')}`, f(5)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c6-${String(i + 1).padStart(2, '0')}`, f(6)])),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
      [`tri-c7-${String(i + 1).padStart(2, '0')}`, f(7)])),
    'tri-c8-01':    f(8),
    'tri-c8-bg-01': '#0f0805',
    'tri-c8-bg-02': '#0f0805',
    // Bindu stays black always — dark-red when its circuit is the active/selected one.
    'c9': sel === 9 ? '#8b0000' : '#000000',
  }
}

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const ncDeities = deities
  .filter(d => d.sectionId === 'chakreshvari')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// circuitNumber → deity
const deityByCircuit = Object.fromEntries(ncDeities.map(d => [d.circuitNumber, d]))

const TOTAL = 9

function displayName(deity, script) {
  if (!deity) return ''
  const { scripts } = deity
  if (script === 'devanagari') return scripts.devanagari || scripts.iast
  if (script === 'english')    return scripts.english    || scripts.iast
  return scripts.iast
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
//
// Rendered inside an overlay SVG with viewBox "45 55 430 430" — same as SriYantraSVG —
// so tooltip positions are in the same coordinate space as CIRCUIT_TOOLTIP_POS.

function Tooltip({ circuitNum, script }) {
  if (!circuitNum) return null
  const deity = deityByCircuit[circuitNum]
  if (!deity) return null
  const label = displayName(deity, script)
  if (!label) return null

  const pos = CIRCUIT_TOOLTIP_POS[circuitNum]
  if (!pos) return null

  const { x, y } = pos
  const fontSize = script === 'devanagari' ? 19 : script === 'english' ? 18 : 17
  const h        = script === 'devanagari' ? 38 : script === 'english' ? 36 : 34
  const charW    = script === 'devanagari' ? 14 : script === 'english' ? 11.5 : 10.5
  const w        = Math.max(60, label.length * charW + 18)

  // Clamp within viewBox "45 55 430 430"
  const tx = Math.min(Math.max(x, 45 + w / 2 + 4), 475 - w / 2)
  const ty = y > SVG_CY ? y - h / 2 - 18 : y + h / 2 + 18

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
        fontSize={fontSize} fill={GOLD} fontFamily="serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NavaChakreshvariView({
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
  const [selectedCircuit, setSelectedCircuit] = useState(null)
  const [hoveredCircuit,  setHoveredCircuit]  = useState(null)
  const [contextMenu,     setContextMenu]     = useState(null)
  const clickTimer         = useRef(null)
  const lastHoveredCircuit = useRef(null)   // used by right-click handler

  // ── Explore mode handlers ──────────────────────────────────────────────────

  const handleRegionHover = (id) => {
    const c = regionToCircuit(id)
    if (c) {
      setHoveredCircuit(c)
      lastHoveredCircuit.current = c
    }
  }

  const handleRegionLeave = () => {
    setHoveredCircuit(null)
  }

  const handleRegionClick = (id) => {
    const c = regionToCircuit(id)
    if (!c) return
    const newC = selectedCircuit === c ? null : c
    setSelectedCircuit(newC)
    onDeitySelect(newC ? deityByCircuit[newC] : null)
  }

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

  const handleMemRegionClick = (id) => {
    const c = regionToCircuit(id)
    if (!c) return
    const deity = deityByCircuit[c]
    if (!deity) return
    const seq = deity.sequenceInSection
    if (currentSeq === seq || currentSeq > seq) handleMemClick(seq)
  }

  const handleMemRegionDblClick = (id) => {
    const c = regionToCircuit(id)
    if (!c) return
    const deity = deityByCircuit[c]
    if (!deity) return
    const seq = deity.sequenceInSection
    if (currentSeq === seq || currentSeq > seq) handleMemDblClick(seq)
  }

  // Right-click: uses lastHoveredCircuit so we know which region was under the cursor.
  const handleContextMenu = (e) => {
    if (!memorise || flash) return
    const c = lastHoveredCircuit.current
    if (!c) return
    const deity = deityByCircuit[c]
    if (!deity) return
    const seq = deity.sequenceInSection
    if (currentSeq > seq) {
      e.preventDefault()
      setContextMenu({ seq, x: e.clientX, y: e.clientY })
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const done = memorise && currentSeq > TOTAL

  const activeCircuit = memorise && !done && !flash
    ? ncDeities.find(d => d.sequenceInSection === currentSeq)?.circuitNumber ?? null
    : null

  // Explore: fill = hovered (transient) takes priority over selected (persistent).
  // Memorise: fill = activeCircuit only.
  const fillSel = memorise
    ? activeCircuit
    : (hoveredCircuit ?? selectedCircuit)

  const filledRegions = buildFills(fillSel)

  // Tooltip shown on hover in both modes (suppressed during flash).
  const tooltipCircuit = flash ? null : hoveredCircuit

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

      <div
        className="relative w-full"
        style={{ paddingBottom: '100%' }}
        onContextMenu={handleContextMenu}
      >

        {/* Base yantra with whole-circuit interaction */}
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          <SriYantraSVG
            className="w-full h-full"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={filledRegions}
            onRegionClick={
              flash ? null
              : memorise ? handleMemRegionClick
              : handleRegionClick
            }
            onRegionHover={flash ? null : handleRegionHover}
            onRegionLeave={flash ? null : handleRegionLeave}
            onRegionDoubleClick={
              memorise && !flash ? handleMemRegionDblClick : null
            }
          />
        </div>

        {/* Tooltip overlay — same viewBox as SriYantraSVG so coordinates match */}
        {tooltipCircuit && (
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="45 55 430 430"
            style={{ pointerEvents: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <Tooltip circuitNum={tooltipCircuit} script={script} />
          </svg>
        )}

        {/* Completion overlay */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)' }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">navacakrēśvarī</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === TOTAL
                  ? 'All memorised — well done!'
                  : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{TOTAL} memorised
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  Try again
                </button>
                <button onClick={() => onNavigate && onNavigate('closing')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Idle hint */}
      {!memorise && !hoveredCircuit && !selectedCircuit && (
        <p className="mt-2 text-center text-xs text-muted italic" style={{ fontFamily: 'serif' }}>
          Hover or click from outside in towards the Bindu to reveal the Chakresvaris in order
        </p>
      )}

      {/* Memorise instruction */}
      {memorise && !done && (
        <p className="mt-2 text-center text-xs text-muted italic" style={{ fontFamily: 'serif' }}>
          double-tap = memorised · single-tap = not yet
        </p>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: RED }} />
          Nava Chakreshvarī
        </span>
      </div>

      {/* Caption */}
      <div className="mt-3 text-center">
        <p className="iast text-gold-600 text-xs">navacakrēśvarī</p>
        <p className="text-muted mt-1" style={{ fontSize: '10px' }}>
          One Tripura form presides over each of the nine circuits
        </p>
      </div>

      <div className="h-8" />
    </div>
  )
}
