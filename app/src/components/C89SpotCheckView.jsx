/**
 * C89SpotCheckView.jsx
 *
 * Combined 8th + 9th Āvaraṇa Spot Check.
 *
 * Uses the same inner-triangle + bindu visual as C8View / C9View.
 * 8 deities total: 7 C8 (primary triangle) + 1 C9 (bindu).
 *
 * Active deity is highlighted cream on the geometry; past results
 * persist as green / red dots. Hover to reveal · dbl-click = memorised
 * · click = not memorised · right-click = toggle.
 *
 * Props (same interface as SpotCheckView):
 *   script         — 'iast' | 'devanagari' | 'english' | …
 *   subFilter      — 'c8c9-8th' | 'c8c9-9th' | null (whole)
 *   onProgressSync — ({ idx, total, correct, wrong }) => void
 *   onRegisterSkip — (skipFn) => void
 *   onUpdateStats  — (correct, total) => void
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { APEX, BASE_L, BASE_R, CENTROID, CONTEXT_TRIS, CONTEXT_FILL_PATH } from '../korvinGeometry'

// ── Geometry (matches C8View) ─────────────────────────────────────────────────

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

function outwardNormal(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  let nx = dy / len, ny = -dx / len
  const midX = (a[0] + b[0]) / 2, midY = (a[1] + b[1]) / 2
  const dot = nx * (CENTROID[0] - midX) + ny * (CENTROID[1] - midY)
  if (dot > 0) { nx = -nx; ny = -ny }
  return [nx, ny]
}

const N_RIGHT = outwardNormal(BASE_R, APEX)
const N_TOP   = outwardNormal(BASE_L, BASE_R)
const N_LEFT  = outwardNormal(APEX,   BASE_L)

// Deity dot positions for C8 — matches C8View exactly
const C8_DOT_POSITIONS = [
  (() => { const [x, y] = lerp(BASE_L, APEX, 0.6);    return [x + N_LEFT[0]  * 45, y + N_LEFT[1]  * 45] })(),  // 1 Bāṇinī
  (() => { const [x, y] = lerp(BASE_R, APEX, 0.6);    return [x + N_RIGHT[0] * 45, y + N_RIGHT[1] * 45] })(),  // 2 Chāpinī
  (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.72); return [x + N_TOP[0]   * 45, y + N_TOP[1]   * 45] })(),  // 3 Pāśinī
  (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.28); return [x + N_TOP[0]   * 45, y + N_TOP[1]   * 45] })(),  // 4 Aṅkuśinī
  [APEX[0],   APEX[1]  ],  // 5 Mahākāmēśvarī — apex
  [BASE_R[0], BASE_R[1]],  // 6 Mahāvajrēśvarī — top-right
  [BASE_L[0], BASE_L[1]],  // 7 Mahābhagamālinī — top-left
]

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const c8Deities = deities
  .filter(d => d.sectionId === 'circuit-8' && d.role === 'deity')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

const c9Deity = deities.find(d => d.sectionId === 'circuit-9' && d.role === 'deity') ?? null

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD         = '#c9a84c'
const BG           = '#0f0805'
const ACTIVE_FILL  = 'rgba(255,248,200,0.92)'
const RESULT_RED   = 'rgba(248,113,113,0.75)'   // correct = memorised = red
const RESULT_GOLD  = 'rgba(201,168,76,0.40)'    // wrong = not memorised = gold
const DIM_FILL     = 'rgba(80,50,20,0.50)'    // not yet reached — dark brown

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(subFilter) {
  let pool
  if (subFilter === 'c8c9-8th') {
    pool = c8Deities
  } else if (subFilter === 'c8c9-9th') {
    pool = c9Deity ? [c9Deity] : []
  } else {
    // null = Whole
    pool = [...c8Deities, ...(c9Deity ? [c9Deity] : [])]
  }
  return shuffle(pool.map(d => d.id))
}

function getDotPos(deity) {
  if (!deity) return null
  if (deity.sectionId === 'circuit-8') return C8_DOT_POSITIONS[deity.sequenceInSection - 1] ?? null
  if (deity.sectionId === 'circuit-9') return [CENTROID[0], CENTROID[1]]
  return null
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, script, aboveExtra }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 14 : script === 'english' ? 11.5 : 10.5
  const w        = Math.max(60, label.length * charW + 18)
  const tx       = Math.min(Math.max(x, w / 2 + 4), 500 - w / 2 - 4)
  const ty       = y - h / 2 - (aboveExtra ? 44 : 22)
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

export default function C89SpotCheckView({
  script = 'iast',
  subFilter = null,
  onProgressSync,
  onRegisterSkip,
  onUpdateStats,
  sectionLabel,
}) {
  const [queue,   setQueue]   = useState(() => buildQueue(subFilter))
  const [idx,     setIdx]     = useState(0)
  const [results, setResults] = useState({})
  const [hovered, setHovered] = useState(false)
  const [flash,   setFlash]   = useState(null)
  const [revealedId, setRevealedId] = useState(null) // mobile two-step reveal
  const clickTimer     = useRef(null)
  const roundLoggedRef = useRef(false)
  const lastPastTap    = useRef({ id: null, time: 0 }) // mobile double-tap toggle past
  const lastActiveTap  = useRef({ time: 0 })           // mobile double-tap for wrong

  const total   = queue.length
  const done    = idx >= total
  const current = !done ? (deityById[queue[idx]] ?? null) : null
  const currentPos  = current ? getDotPos(current) : null
  const isBindu = current?.sectionId === 'circuit-9'

  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length

  // Reset when subFilter changes
  useEffect(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats) {
      onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
    }
    setQueue(buildQueue(subFilter))
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
  }, [subFilter]) // eslint-disable-line

  // Reset reveal + hover state when deity changes
  useEffect(() => { setRevealedId(null); setHovered(false) }, [idx])

  // Sync progress
  useEffect(() => {
    if (onProgressSync) onProgressSync({ idx, total, correct, wrong })
  }, [idx, total, correct, wrong, onProgressSync])

  // Cleanup timer
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
    setResults(prev => ({ ...prev, [current.id]: result }))
    setFlash(result)
    setTimeout(() => {
      setFlash(null)
      setHovered(false)
      setIdx(i => i + 1)
    }, 380)
  }, [current, done])

  // Desktop: single click = correct; mobile: two-step reveal then correct
  const isMobile = window.innerWidth < 768
  const handleClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (!isMobile) {
        advance('correct')
      } else if (revealedId !== current?.id) {
        setRevealedId(current?.id ?? null)
      } else {
        setRevealedId(null)
        advance('correct')
      }
    }, 260)
  }, [done, flash, advance, revealedId, current, isMobile])

  // Desktop: double-click = wrong
  const handleDblClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    setRevealedId(null)
    advance('wrong')
  }, [done, flash, advance])

  // Mobile: onTouchEnd on active dot — single tap = reveal/correct, double-tap = wrong
  const handleActiveTouchEnd = useCallback((e) => {
    e.preventDefault()
    if (done || flash) return
    const now = Date.now()
    const elapsed = now - lastActiveTap.current.time
    if (elapsed < 350 && revealedId === current?.id) {
      // Double-tap while revealed → wrong
      lastActiveTap.current = { time: 0 }
      if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
      setRevealedId(null)
      advance('wrong')
    } else {
      lastActiveTap.current = { time: now }
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
    }
  }, [done, flash, advance, revealedId, current])

  const handleRightClick = useCallback((e, deityId) => {
    e.preventDefault()
    if (!results[deityId]) return
    setResults(prev => ({
      ...prev,
      [deityId]: prev[deityId] === 'correct' ? 'wrong' : 'correct',
    }))
  }, [results])

  const handlePastDoubleTap = useCallback((deityId) => {
    const now = Date.now()
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
    setHovered(false)
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
    setQueue(buildQueue(subFilter))
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
  }, [subFilter, results, onUpdateStats])

  const mainTriPts = [APEX, BASE_L, BASE_R]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [bx, by] = CENTROID

  const flashFill   = flash === 'correct' ? RESULT_RED : RESULT_GOLD
  const activeFill  = flash ? flashFill : ACTIVE_FILL
  const activeStroke = flash === 'correct' ? '#7f1d1d' : flash === 'wrong' ? '#a16207' : GOLD

  return (
    <div className="w-full p-4 flex flex-col gap-3">

      {/* Visual */}
      {!done && (
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
          style={{ background: BG }}
        >
          <svg
            viewBox="-30 181 560 500"
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: BG, display: 'block', width: '100%', touchAction: 'manipulation' }}
            aria-label="8th and 9th Āvaraṇa — inner triangle and bindu"
          >
            {/* Context geometry */}
            <path d={CONTEXT_FILL_PATH} fillRule="evenodd"
              fill={GOLD} fillOpacity={0.08} stroke="none" />
            {CONTEXT_TRIS.map((pts, i) => (
              <polygon key={`ctx-${i}`} points={pts}
                fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.12} />
            ))}

            {/* Central triangle */}
            <polygon points={mainTriPts}
              fill="rgba(201,168,76,0.04)" stroke={GOLD}
              strokeWidth={3} strokeLinejoin="miter" />

            {/* C8 dots — non-active */}
            {c8Deities.map((d, i) => {
              if (d.id === current?.id) return null
              const pos = C8_DOT_POSITIONS[i]
              if (!pos) return null
              const res = results[d.id]
              const fill = res === 'correct' ? RESULT_RED : res === 'wrong' ? RESULT_GOLD : DIM_FILL
              const r = res ? 10 : 7
              return (
                <circle key={d.id}
                  cx={pos[0].toFixed(1)} cy={pos[1].toFixed(1)}
                  r={r} fill={fill}
                  style={{ cursor: res ? 'pointer' : 'default', pointerEvents: res ? 'all' : 'none' }}
                  onClick={res ? () => handlePastDoubleTap(d.id) : undefined}
                  onContextMenu={res ? e => handleRightClick(e, d.id) : undefined}
                />
              )
            })}

            {/* C9 bindu — non-active */}
            {c9Deity && c9Deity.id !== current?.id && (() => {
              const res = results[c9Deity.id]
              const fill = res === 'correct' ? RESULT_RED : res === 'wrong' ? RESULT_GOLD : DIM_FILL
              const r = res ? 12 : 8
              return (
                <circle
                  cx={bx.toFixed(1)} cy={by.toFixed(1)}
                  r={r} fill={fill}
                  style={{ cursor: res ? 'pointer' : 'default', pointerEvents: res ? 'all' : 'none' }}
                  onClick={res ? () => handlePastDoubleTap(c9Deity.id) : undefined}
                  onContextMenu={res ? e => handleRightClick(e, c9Deity.id) : undefined}
                />
              )
            })()}

            {/* Active C8 dot */}
            {current && !isBindu && currentPos && (
              <circle
                cx={currentPos[0].toFixed(1)} cy={currentPos[1].toFixed(1)}
                r={14}
                fill={activeFill}
                stroke={activeStroke} strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'fill 0.25s, stroke 0.25s' }}
                onMouseEnter={() => { if (!flash) setHovered(true) }}
                onMouseLeave={() => { if (!flash) setHovered(false) }}
                onClick={handleClick}
                onDoubleClick={handleDblClick}
                onTouchEnd={handleActiveTouchEnd}
              />
            )}

            {/* Active C9 bindu */}
            {current && isBindu && (
              <circle
                cx={bx.toFixed(1)} cy={by.toFixed(1)}
                r={18}
                fill={activeFill}
                stroke={activeStroke} strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'fill 0.25s, stroke 0.25s' }}
                onMouseEnter={() => { if (!flash) setHovered(true) }}
                onMouseLeave={() => { if (!flash) setHovered(false) }}
                onClick={handleClick}
                onDoubleClick={handleDblClick}
                onTouchEnd={handleActiveTouchEnd}
              />
            )}

            {/* Tooltip */}
            {current && currentPos && (hovered || flash || revealedId === current?.id) && (
              <Tooltip
                x={currentPos[0]}
                y={currentPos[1]}
                label={displayName(current, script)}
                script={script}
                aboveExtra={isBindu}
              />
            )}

          </svg>
        </div>
      )}

      {/* Instruction hint */}
      {!done && (
        <p className="mt-3 text-center text-xs text-muted italic">
          <span className="md:hidden">tap to reveal · <span style={{ color: '#f87171' }}>tap again</span> = memorised · <span style={{ color: '#c9a84c' }}>dbl-tap</span> = not memorised · dbl-tap past = toggle</span>
          <span className="hidden md:inline">hover to reveal · <span className="text-red-400">click</span> = memorised · <span className="text-gold-400">dbl-click</span> = not memorised · right-click = toggle</span>
        </p>
      )}

      {/* Completion */}
      {done && (
        <CompletionOverlay correct={correct} total={total} onRestart={startNewRound} sectionLabel={sectionLabel} />
      )}

    </div>
  )
}
