/**
 * C9View.jsx
 *
 * Circuit 9 — Sarvānandamaya Chakra (bindu)
 * Para Para Rahasya Yoginī
 *
 * Single deity — Śrī Śrī Mahābhaṭṭārikē — at the central bindu point.
 * The central triangle is the main triangle; the full yantra shows as faint context.
 *
 * Supports Explore mode (tap to reveal) and Memorise mode (single interaction).
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CENTROID, CONTEXT_TRIS, CONTEXT_FILL_PATH } from '../korvinGeometry'
import MobileSvaminiButtons, { MobileMemoriseInstr } from './MobileSvaminiButtons'
import { useDoneDelay } from '../hooks/useDoneDelay'

// ── Geometry ──────────────────────────────────────────────────────────────────
// The central (main) triangle and the nine context triangles come from the
// shared Korvin geometry module. See ../korvinGeometry.js.

// ── Constants ─────────────────────────────────────────────────────────────────

const GOLD        = '#c9a84c'
const RED         = '#c0392b'
const BG          = '#0f0805'
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'

const TOTAL = 1

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const c9Deity   = deities.find(d => d.sectionId === 'circuit-9' && d.role === 'deity')
const c9Section = data.sections?.find(s => s.circuitNumber === 9 && s.type === 'circuit') || {}

// ── Helpers ───────────────────────────────────────────────────────────────────


// ── Sub-components ────────────────────────────────────────────────────────────


function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 33 : script === 'english' ? 32 : 32
  const h        = script === 'devanagari' ? 66 : script === 'english' ? 64 : 64
  const charW    = script === 'devanagari' ? 25 : script === 'telugu' ? 29 : script === 'tamil' ? 30 : script === 'english' ? 20 : 22
  const w        = Math.max(80, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 - 26), 526 - w / 2)
  const ty       = y - h / 2 - 44
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

// ── Main component ────────────────────────────────────────────────────────────

export default function C9View({
  script = 'iast',
  onDeitySelect = () => {},
  fillAll = false,
  memorise = false,
  currentSeq = 1,
  results = {},
  onStartMemorise,
  onExitMemorise,
  onMarkResult,
  onToggleResult,
  flash = false,
  onNavigate,
  done: doneProp = null,
}) {
  const [selected,      setSelected]      = useState(false)
  const [hovered,       setHovered]       = useState(false)
  const [mobileRevealed, setMobileRevealed] = useState(false)
  const clickTimer = useRef(null)

  // Reset reveal state when mode changes (mobile tap-to-reveal)
  useEffect(() => { setMobileRevealed(false) }, [currentSeq, memorise])

  const toggle = () => {
    const next = !selected
    setSelected(next)
    onDeitySelect(next && c9Deity ? c9Deity : null)
  }

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = () => {
    if (window.innerWidth < 768 && currentSeq === 1) setMobileRevealed(true)
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (currentSeq === 1) onMarkResult(1, 'correct')
    }, 280)
  }

  const handleMemDblClick = () => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === 1) onMarkResult(1, 'wrong')
  }

  const done = doneProp !== null ? doneProp : (memorise && currentSeq > TOTAL)
  const showCompletion = useDoneDelay(done)

  const [bx, by] = CENTROID

  const mainTriPts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  // Memorise mode visual state for the bindu.
  // The bindu interaction hides after seq 1 is answered (currentSeq > 1),
  // so only cream (active/flash) states matter here. But if for any reason
  // it's still rendered, show result color correctly.
  const isCorrect = results[1] === 'correct'
  let bindufill = GOLD
  if (memorise) {
    if (flash || currentSeq === 1) bindufill = ACTIVE_FILL
    else if (isCorrect)            bindufill = RED
    // else: GOLD (answered wrong)
  }

  return (
    <div className="w-full p-4">
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ background: BG }}>
        <svg viewBox="-30 181 560 500" xmlns="http://www.w3.org/2000/svg"
             aria-label="Circuit 9 — Sarvānandamaya Chakra — bindu">

          {/* Context geometry — even-odd light fill, then surrounding outlines */}
          <path d={CONTEXT_FILL_PATH} fillRule="evenodd"
            fill={GOLD} fillOpacity={0.1} stroke="none" />
          {CONTEXT_TRIS.map((pts, i) => (
            <polygon key={`ctx-${i}`} points={pts}
              fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.14} />
          ))}


          {/* ── Explore mode bindu ────────────────────────────────────── */}
          {!memorise && (
            <g onClick={toggle}
               onMouseEnter={() => setHovered(true)}
               onMouseLeave={() => setHovered(false)}
               style={{ cursor: 'pointer' }}>
              <circle
                cx={bx.toFixed(1)} cy={by.toFixed(1)}
                r={8}
                fill={selected ? RED : (fillAll || hovered) ? RED : "#fff8c8"}
                opacity={selected || fillAll || hovered ? 1 : 0.85} />
            </g>
          )}

          {/* ── Memorise mode bindu ───────────────────────────────────── */}
          {/* Bindu interaction only while seq 1 is active; hidden once answered */}
          {memorise && currentSeq === 1 && (
            <g
              onClick={!flash ? handleMemClick : undefined}
              onDoubleClick={!flash ? handleMemDblClick : undefined}
              onMouseEnter={!flash ? () => setHovered(true) : undefined}
              onMouseLeave={!flash ? () => setHovered(false) : undefined}
              style={{ cursor: flash ? 'default' : 'pointer' }}>
              <circle
                cx={bx.toFixed(1)} cy={by.toFixed(1)}
                r={8}
                fill={bindufill}
                opacity={1} />
            </g>
          )}


          {/* Tooltip: hover/select (Explore); auto-show in Memorise when bindu is active */}
          {(hovered || selected || (memorise && currentSeq === 1)) && !flash && c9Deity && (
            <Tooltip
              x={bx} y={by}
              label={displayName(c9Deity, script)}
              script={script}
            />
          )}

          {/* Explore hint */}


        </svg>

        {/* Completion overlay */}

      {showCompletion && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)' }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">sarvānandamaya cakra</p>
              <p className="text-cream text-sm">
                {isCorrect ? 'Memorised — well done!' : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">
                {isCorrect ? '1/1' : '0/1'} memorised
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  Try again
                </button>
                <button onClick={() => onNavigate && onNavigate('chakreshvari')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {memorise && <MobileMemoriseInstr />}

      <MobileSvaminiButtons
        section={c9Section}
        script={script}
        svaminiSeq={2}
        yoginiSeq={3}
        memorise={memorise}
        currentSeq={currentSeq}
        results={results}
        onMarkResult={onMarkResult}
        onToggleResult={onToggleResult}
      />

    </div>
  )
}
