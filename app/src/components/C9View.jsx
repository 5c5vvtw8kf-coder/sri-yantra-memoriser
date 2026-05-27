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

import { useState, useRef } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CENTROID, CONTEXT_TRIS, CONTEXT_FILL_PATH } from '../korvinGeometry'

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
const c9Deity = deities.find(d => d.sectionId === 'circuit-9' && d.role === 'deity')

// ── Helpers ───────────────────────────────────────────────────────────────────


// ── Sub-components ────────────────────────────────────────────────────────────

function DeityPanel({ deity, script, onDismiss }) {
  if (!deity) return null
  const { scripts } = deity
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
              Para Para Rahasya Yoginī · Bindu
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

function Tooltip({ x, y, label, script }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 19 : script === 'english' ? 18 : 17
  const h        = script === 'devanagari' ? 38 : script === 'english' ? 36 : 34
  const charW    = script === 'devanagari' ? 14 : script === 'telugu' ? 16 : script === 'tamil' ? 17 : script === 'english' ? 11.5 : 10.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 4), 500 - w / 2 - 4)
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
        fontSize={fontSize} fill={GOLD} fontFamily="serif">
        {label}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function C9View({
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
  const [selected, setSelected] = useState(false)
  const [hovered,  setHovered]  = useState(false)
  const clickTimer = useRef(null)

  const toggle = () => {
    const next = !selected
    setSelected(next)
    onDeitySelect(next && c9Deity ? c9Deity : null)
  }

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = () => {
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (currentSeq === 1) onMarkResult(1, 'wrong')
    }, 280)
  }

  const handleMemDblClick = () => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === 1) onMarkResult(1, 'correct')
  }

  const done = memorise && currentSeq > TOTAL

  const [bx, by] = CENTROID

  const mainTriPts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  // Memorise mode visual state for the bindu
  const isCorrect = results[1] === 'correct'
  let bindufill = GOLD
  if (memorise) {
    if (flash)                          bindufill = ACTIVE_FILL
    else if (currentSeq === 1)          bindufill = ACTIVE_FILL
    else if (done && isCorrect)         bindufill = RED
    else if (done)                      bindufill = GOLD
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

          {/* Central triangle — the main triangle */}
          <polygon points={mainTriPts}
            fill="rgba(201,168,76,0.04)" stroke={GOLD}
            strokeWidth={3} strokeLinejoin="miter" />

          {/* ── Explore mode bindu ────────────────────────────────────── */}
          {!memorise && (
            <g onClick={toggle}
               onMouseEnter={() => setHovered(true)}
               onMouseLeave={() => setHovered(false)}
               style={{ cursor: 'pointer' }}>
              <circle
                cx={bx.toFixed(1)} cy={by.toFixed(1)}
                r={selected ? 16 : 11}
                fill="#fff8c8"
                opacity={selected ? 1 : 0.85} />
            </g>
          )}

          {/* ── Memorise mode bindu ───────────────────────────────────── */}
          {memorise && !done && (
            <g
              onClick={!flash ? handleMemClick : undefined}
              onDoubleClick={!flash ? handleMemDblClick : undefined}
              onMouseEnter={!flash ? () => setHovered(true) : undefined}
              onMouseLeave={!flash ? () => setHovered(false) : undefined}
              style={{ cursor: flash ? 'default' : 'pointer' }}>
              <circle
                cx={bx.toFixed(1)} cy={by.toFixed(1)}
                r={20}
                fill={bindufill}
                opacity={1} />
            </g>
          )}

          {/* Memorise mode: instruction */}
          {memorise && !done && !flash && (
            <text x={250} y={630} textAnchor="middle"
              fontSize="13" fill={GOLD} opacity="0.55"
              fontFamily="serif" fontStyle="italic">
              double-tap = memorised · single-tap = not yet
            </text>
          )}

          {/* Hover tooltip */}
          {hovered && !flash && c9Deity && (
            <Tooltip
              x={bx} y={by}
              label={displayName(c9Deity, script)}
              script={script}
            />
          )}

          {/* Explore hint */}
          {!memorise && !selected && !hovered && (
            <text x={250} y={630} textAnchor="middle"
              fontSize="13" fill={GOLD} opacity="0.45"
              fontFamily="serif" fontStyle="italic">
              Tap the bindu to reveal the deity
            </text>
          )}

        </svg>

        {/* Completion overlay */}
        {done && (
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

      <div className="mt-3 text-center">
        <p className="iast text-gold-600 text-xs">sarvānandamaya cakra · parāpararahasyayōginī</p>
        <p className="text-muted mt-1" style={{ fontSize: '10px' }}>
          The central point — seat of Mahātripurasundarī
        </p>
      </div>

      <div className="h-8" />

      {/* Explore mode: deity panel */}
      {!memorise && selected && c9Deity && (
        <DeityPanel deity={c9Deity} script={script} onDismiss={toggle} />
      )}
    </div>
  )
}
