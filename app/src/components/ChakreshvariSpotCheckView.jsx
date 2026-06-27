/**
 * ChakreshvariSpotCheckView.jsx
 *
 * Spot check for the nine Nava Chakreshvarī — the Tripura forms presiding
 * over each āvaraṇa. One circuit is highlighted at a time; the user hovers
 * to reveal the Tripura form name, then marks memorised or not.
 *
 * Fills mirror NavaChakreshvariView.jsx:
 *   active circuit  → cream
 *   past correct    → red
 *   past wrong      → gold
 *   future          → dim
 *
 * Props:
 *   script         — 'iast' | 'devanagari' | 'english' | …
 *   onProgressSync — ({ idx, total, correct, wrong }) => void
 *   onRegisterSkip — (skipFn) => void
 *   onUpdateStats  — (correct, total) => void
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import SriYantraSVG from './SriYantraSVG'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data

const ncDeities = deities
  .filter(d => d.sectionId === 'chakreshvari')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

const deityById      = Object.fromEntries(ncDeities.map(d => [d.id, d]))
const deityByCircuit = Object.fromEntries(ncDeities.map(d => [d.circuitNumber, d]))

// ── Region id → circuit number ────────────────────────────────────────────────

function regionToCircuit(id) {
  if (!id) return null
  if (id === 'c1' || id.startsWith('c1-') || id.startsWith('bhupura-')) return 1
  if (id === 'c2' || id.startsWith('petal-c2-')) return 2
  if (id === 'c3' || id.startsWith('petal-c3-')) return 3
  if (id === 'c4' || id.startsWith('tri-c4-'))   return 4
  if (id === 'c5' || id.startsWith('tri-c5-'))   return 5
  if (id === 'c6' || id.startsWith('tri-c6-'))   return 6
  if (id === 'c7' || id.startsWith('tri-c7-'))   return 7
  if (id === 'c8' || id.startsWith('tri-c8-'))   return 8
  if (id === 'c9') return 9
  return null
}

// ── Colours ───────────────────────────────────────────────────────────────────

const pad         = n => String(n).padStart(2, '0')
const HIGHLIGHT   = 'rgba(255,248,200,0.90)'
const FLASH_RED   = 'rgba(248,113,113,0.62)'
const FLASH_GOLD  = 'rgba(201,168,76,0.52)'
const RESULT_RED  = 'rgba(248,113,113,0.55)'
const RESULT_GOLD = 'rgba(201,168,76,0.35)'
const DIM         = 'rgba(138,117,96,0.35)'

// ── Fill builder ──────────────────────────────────────────────────────────────

function computeFills(activeCircuit, flashState, results) {
  const activeColor = flashState === 'correct' ? FLASH_RED
                    : flashState === 'wrong'   ? FLASH_GOLD
                    : HIGHLIGHT

  const circuitColor = (n) => {
    if (n === activeCircuit) return activeColor
    const d = deityByCircuit[n]
    if (!d) return null
    if (results[d.id] === 'correct') return RESULT_RED
    if (results[d.id] === 'wrong')   return RESULT_GOLD
    return DIM
  }

  const c1 = circuitColor(1)

  // tri-c7-03, tri-c7-05, tri-c7-07 are geometrically inside the c8 primary triangle.
  // Any non-dim c8 fill (active, result-correct, result-wrong) bleeds through their
  // transparent area. Paint them background-dark (#0f0805) as cutouts whenever c8
  // has a visible fill — same mechanism as tri-c8-bg-01/02.
  const c8Deity  = deityByCircuit[8]
  const c8Result = c8Deity ? results[c8Deity.id] : undefined
  const c8Lit    = activeCircuit === 8 || c8Result === 'correct' || c8Result === 'wrong'
  const C8_INNER = new Set(['tri-c7-03', 'tri-c7-05', 'tri-c7-07'])
  // Only apply the dark cutout when c7's own fill is DIM — if c7 is active or
  // answered, its fill covers c8's bleed naturally. Without this guard, an already-
  // answered c8 would mask the three inner triangles even when c7 is active.
  const c7Color  = circuitColor(7)

  return {
    'c1':       'transparent',
    'c1-outer': c1,
    'c1-mid':   c1,
    'c1-inner': 'transparent',
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${pad(i+1)}`, circuitColor(2)])),
    ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`petal-c3-${pad(i+1)}`, circuitColor(3)])),
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${pad(i+1)}`, circuitColor(4)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${pad(i+1)}`, circuitColor(5)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${pad(i+1)}`, circuitColor(6)])),
    ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => {
      const id = `tri-c7-${pad(i+1)}`
      if (c8Lit && C8_INNER.has(id) && c7Color === DIM) return [id, '#0f0805']
      return [id, c7Color]
    })),
    'tri-c8-01':    circuitColor(8),
    'tri-c8-bg-01': '#0f0805',
    'tri-c8-bg-02': '#0f0805',
    'c9': activeCircuit === 9
        ? activeColor
        : (results[deityByCircuit[9]?.id] === 'correct' ? RESULT_RED : '#000000'),
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue() {
  return shuffle(ncDeities.map(d => d.id))
}

// ── Answer SVG label ──────────────────────────────────────────────────────────
// SVG overlay sharing the yantra viewBox — scales with the container like all
// other tooltips in the app rather than being fixed in CSS pixels.

function AnswerSVGLabel({ label, script }) {
  const fontSize = script === 'devanagari' ? 16 : script === 'english' ? 15 : 14
  const h        = script === 'devanagari' ? 30 : 28
  const charW    = script === 'devanagari' ? 12 : script === 'telugu' ? 14 : script === 'tamil' ? 15 : script === 'english' ? 10 : 9
  const w        = Math.max(80, label.length * charW + 24)
  const tx = 260   // centred on yantra horizontal axis
  const ty = 90    // inside the top bhupura band
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(15,8,5,0.92)" stroke="rgba(201,168,76,0.45)" strokeWidth={0.7}
      />
      <text
        x={tx} y={ty}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill="#c9a84c" fontFamily="'Gentium Plus', Georgia, serif"
      >
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
      <p className="text-gold-400 text-lg">{sectionLabel || tr('spot.round_complete')}</p>
      {tr('spot.round_complete')}
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

export default function ChakreshvariSpotCheckView({
  script = 'iast',
  onProgressSync,
  onRegisterSkip,
  onUpdateStats,
  sectionLabel,
})
  tr               = k => k,
}) {
  const [queue,   setQueue]   = useState(() => buildQueue())
  const [idx,     setIdx]     = useState(0)
  const [results, setResults] = useState({})
  const [hovered, setHovered] = useState(false)
  const [flash,   setFlash]   = useState(null)
  const clickTimer   = useRef(null)
  const advanceTimer = useRef(null)

  const total         = queue.length
  const done          = idx >= total
  const current       = !done ? deityById[queue[idx]] : null
  const activeCircuit = current?.circuitNumber ?? null
  const name          = current ? displayName(current, script) : ''

  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length

  const yantraFills = computeFills(activeCircuit, flash, results)

  // ── Progress sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (onProgressSync) onProgressSync({ idx, total, correct, wrong })
  }, [idx, total, correct, wrong, onProgressSync])

  // ── End-of-round stats ─────────────────────────────────────────────────────
  useEffect(() => {
    if (done && onUpdateStats) onUpdateStats(correct, total)
  }, [done]) // eslint-disable-line

  // Cleanup
  useEffect(() => () => {
    if (clickTimer.current)   clearTimeout(clickTimer.current)
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
  }, [])

  // ── Advance ────────────────────────────────────────────────────────────────
  const scheduleAdvance = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null
      setFlash(null)
      setHovered(false)
      setIdx(i => i + 1)
    }, 380)
  }, [])

  const advance = useCallback((result) => {
    if (!current || done) return
    setResults(prev => ({ ...prev, [current.id]: result }))
    setFlash(result)
    scheduleAdvance()
  }, [current, done, scheduleAdvance])

  // ── Click handlers ─────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      advance('correct')
    }, 260)
  }, [done, flash, advance])

  const handleDblClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    advance('wrong')
  }, [done, flash, advance])

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    if (done || !flash || !current) return
    const toggled = flash === 'correct' ? 'wrong' : 'correct'
    setResults(prev => ({ ...prev, [current.id]: toggled }))
    setFlash(toggled)
    scheduleAdvance()
  }, [done, flash, current, scheduleAdvance])

  // ── Hover ──────────────────────────────────────────────────────────────────
  const handleRegionHover = useCallback((id) => {
    if (flash) return
    setHovered(regionToCircuit(id) === activeCircuit)
  }, [flash, activeCircuit])

  // ── Skip ───────────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (done || flash) return
    setHovered(false)
    setIdx(i => i + 1)
  }, [done, flash])

  useEffect(() => {
    if (onRegisterSkip) onRegisterSkip(handleSkip)
  }, [handleSkip, onRegisterSkip])

  // ── New round ──────────────────────────────────────────────────────────────
  const startNewRound = useCallback(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats) {
      onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
    }
    setQueue(buildQueue())
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
  }, [results, onUpdateStats])

  return (
    <div className="w-full p-4 flex flex-col gap-3">

      {/* Yantra */}
      {!done && (
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
          style={{ paddingBottom: '100%', cursor: 'pointer' }}
          onMouseLeave={() => setHovered(false)}
          onClick={handleClick}
          onDoubleClick={handleDblClick}
          onContextMenu={handleContextMenu}
        >
          <div className="absolute inset-0">
            <SriYantraSVG
              className="w-full h-full"
              showTriangles={true}
              showLabels={false}
              showNumbers={false}
              filledRegions={yantraFills}
              onRegionHover={!flash ? handleRegionHover : null}
            />

            {/* Answer reveal overlay — SVG so it scales with the yantra */}
            {(hovered || flash) && name && (
              <svg
                viewBox="45 55 430 430"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              >
                <AnswerSVGLabel label={name} script={script} />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Completion */}
      {done && (
        <CompletionOverlay correct={correct} total={total} onRestart={startNewRound} sectionLabel={sectionLabel} />
      )}

    </div>
  )
}
