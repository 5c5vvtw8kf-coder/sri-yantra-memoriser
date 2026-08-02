/**
 * LineDrillView.jsx — Line Drill alpha
 *
 * Two phases:
 *   preview — pick (or shuffle) a line; its GOLD stroke + CREAM-filled dots
 *             are shown so you can see length/shape before committing.
 *   drill   — sequential recitation of the line's deities in order, reusing
 *             the same colour states as Memorise mode:
 *               DIM_GOLD  = not yet reached
 *               CREAM     = current stop
 *               RED       = answered correct
 *               TERRACOTTA = answered wrong
 *
 * Alpha simplification: unlike the per-circuit Memorise views, this uses one
 * shared below-yantra name strip for both mobile and desktop (no separate
 * desktop right-panel / hover-tooltip yet).
 */

import { useState, useRef, useMemo } from 'react'
import lineData from '../data/lineDrillLines.json'
import data from '../data/khadgamala-canonical.json'
import { getPosition } from '../deityPositions.js'
import { displayName } from '../utils.js'
import SriYantraSVG from './SriYantraSVG'

const GOLD       = '#c9a84c'
const CREAM      = '#fff8c8'
const RED        = '#c0392b'
const TERRACOTTA = '#8b4513'
const DIM_GOLD   = 'rgba(201,168,76,0.35)'

const FULL_VIEWBOX = '45 55 430 430'

const deityById = Object.fromEntries(data.deities.map(d => [d.id, d]))
const LINE_IDS = Object.keys(lineData.LINES)

function lineDeities(lineId) {
  return lineData.LINES[lineId].map(id => ({ id, deity: deityById[id], pos: getPosition(id) }))
}

export default function LineDrillView({ script = 'iast' }) {
  const [phase, setPhase]           = useState('preview') // 'preview' | 'drill' | 'done'
  const [lineId, setLineId]         = useState(LINE_IDS[0])
  const [currentIndex, setCurrent]  = useState(0)
  const [revealed, setRevealed]     = useState(false)
  const [results, setResults]       = useState({}) // index -> 'correct' | 'wrong'

  const tapRef       = useRef({ index: null, time: 0 })
  const pastTapRef    = useRef({ index: null, time: 0 })
  const clickTimer   = useRef(null)
  const advanceTimer = useRef(null)

  const stops = useMemo(() => lineDeities(lineId), [lineId])

  function pickLine(id) {
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null }
    setLineId(id)
    setPhase('preview')
    setCurrent(0)
    setRevealed(false)
    setResults({})
  }

  function shuffle() {
    let next = lineId
    if (LINE_IDS.length > 1) {
      while (next === lineId) next = LINE_IDS[Math.floor(Math.random() * LINE_IDS.length)]
    }
    pickLine(next)
  }

  function startDrill() {
    setPhase('drill')
    setCurrent(0)
    setRevealed(false)
    setResults({})
  }

  function markResult(index, result) {
    setResults(r => ({ ...r, [index]: result }))
    setRevealed(true)
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      setRevealed(false)
      setCurrent(i => {
        const nextI = i + 1
        if (nextI >= stops.length) { setPhase('done'); return i }
        return nextI
      })
    }, 550)
  }

  function handleActiveTap(index) {
    const now = Date.now()
    const isDouble = tapRef.current.index === index && (now - tapRef.current.time) < 300
    tapRef.current = { index, time: now }
    if (isDouble) {
      if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
      markResult(index, 'wrong')
    } else {
      if (clickTimer.current) return
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null
        markResult(index, 'correct')
      }, 280)
    }
  }

  function handlePastTap(index) {
    const now = Date.now()
    const isDouble = pastTapRef.current.index === index && (now - pastTapRef.current.time) < 300
    pastTapRef.current = { index, time: now }
    if (isDouble) {
      setResults(r => ({ ...r, [index]: r[index] === 'correct' ? 'wrong' : 'correct' }))
    }
  }

  function restartSameLine() {
    setPhase('drill')
    setCurrent(0)
    setRevealed(false)
    setResults({})
  }

  const correctCount = Object.values(results).filter(v => v === 'correct').length

  // Connecting stroke through the line's stops, in order
  const strokePoints = stops
    .filter(s => s.pos)
    .map(s => `${s.pos.x},${s.pos.y}`)
    .join(' ')

  const currentStop = stops[currentIndex]
  const stripDeity = phase === 'drill' && currentStop ? currentStop.deity : null

  return (
    <div className="w-full px-4 pt-3 pb-2 flex-1 flex flex-col md:block md:flex-none">

      {/* ── Line picker ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold mr-1">Line Drill</p>
        <button
          onClick={shuffle}
          className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-gold-400 border border-surface-700 hover:border-gold-600"
        >
          Shuffle
        </button>
        {phase === 'preview' && (
          <button
            onClick={startDrill}
            className="px-2.5 py-1 rounded text-xs font-mono bg-gold-400 text-surface-900 font-bold"
          >
            Start Drill
          </button>
        )}
        {phase !== 'preview' && (
          <button
            onClick={() => pickLine(lineId)}
            className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-muted hover:text-cream border border-surface-700"
          >
            Back to preview
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {LINE_IDS.map(id => (
          <button
            key={id}
            onClick={() => pickLine(id)}
            className={[
              'px-2 py-0.5 rounded text-xs font-mono transition-colors',
              id === lineId ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream',
            ].join(' ')}
          >
            {id} ({lineData.LINES[id].length})
          </button>
        ))}
      </div>

      <p className="text-xs text-muted font-mono mb-2" style={{ fontSize: '11px' }}>
        {lineId} — {lineData.LINE_LABELS[lineId]} — {stops.length} deities
        {phase === 'drill' && ` — stop ${Math.min(currentIndex + 1, stops.length)} of ${stops.length}`}
      </p>

      {/* ── Diagram ─────────────────────────────────────────────────────── */}
      <div className="relative w-full flex-1 min-h-0 md:flex-none rounded-xl overflow-hidden shadow-2xl shadow-black/60 md:[padding-bottom:100%]">
        <div className="absolute inset-0">
          <SriYantraSVG className="w-full h-full" viewBox={FULL_VIEWBOX} showTriangles={true} />

          <svg
            viewBox={FULL_VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label={`Line Drill — ${lineId}`}
          >
            {strokePoints && (
              <polyline points={strokePoints} fill="none" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.55" style={{ pointerEvents: 'none' }} />
            )}

            {stops.map((s, i) => {
              if (!s.pos) return null
              let fill = DIM_GOLD
              let r = 4.5
              if (phase === 'preview') {
                fill = CREAM
              } else if (phase === 'drill' || phase === 'done') {
                if (i < currentIndex || results[i]) {
                  fill = results[i] === 'wrong' ? TERRACOTTA : (results[i] === 'correct' ? RED : DIM_GOLD)
                } else if (i === currentIndex) {
                  fill = CREAM
                  r = 5.5
                }
              }
              const isActive = phase === 'drill' && i === currentIndex
              const isPast   = phase === 'drill' && i < currentIndex
              return (
                <circle
                  key={s.id}
                  cx={s.pos.x}
                  cy={s.pos.y}
                  r={r}
                  fill={fill}
                  stroke="#0f0805"
                  strokeWidth="0.6"
                  style={{ cursor: (isActive || isPast) ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (isActive) handleActiveTap(i)
                    else if (isPast) handlePastTap(i)
                  }}
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* ── Below-yantra name strip ─────────────────────────────────────── */}
      <div className="mt-2 min-h-[2.5rem] flex items-center justify-center text-center px-2">
        {phase === 'preview' && (
          <p className="text-xs text-muted font-mono">Tap Start Drill to recite this line in order, or pick / shuffle a different one.</p>
        )}
        {phase === 'drill' && (
          <p className="text-sm font-serif" style={{ color: revealed ? CREAM : 'transparent', fontFamily: "'Gentium Plus', Georgia, serif" }}>
            {stripDeity ? `${displayName(stripDeity, script)} — ${displayName(stripDeity, 'devanagari')}` : ''}
          </p>
        )}
        {phase === 'drill' && !revealed && (
          <p className="text-xs text-muted font-mono absolute">tap to reveal</p>
        )}
        {phase === 'done' && (
          <p className="text-sm font-mono">
            <span className="text-red-400">{correctCount}/{stops.length} correct</span>
            <button onClick={restartSameLine} className="ml-3 px-2 py-0.5 rounded text-xs bg-surface-800 text-gold-400 border border-surface-700">
              Redrill
            </button>
            <button onClick={shuffle} className="ml-2 px-2 py-0.5 rounded text-xs bg-surface-800 text-gold-400 border border-surface-700">
              Shuffle next
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
