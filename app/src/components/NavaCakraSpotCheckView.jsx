/**
 * NavaCakraSpotCheckView.jsx
 *
 * Spot check for Chakra Svāminī and Yoginī type across all 9 āvaraṇas.
 *
 * The full Sri Yantra is shown with ONE circuit highlighted at a time.
 * The user recalls either the Chakra Svāminī name or the Yoginī type
 * for that circuit. Hover to reveal the answer.
 *
 * Queue items are strings: '1-svamini', '3-yogini', etc.
 *
 * Props (same interface as SpotCheckView):
 *   script         — 'iast' | 'devanagari' | 'english' | …
 *   subFilter      — 'nc-svamini' | 'nc-yogini' | null (both)
 *   onProgressSync — ({ idx, total, correct, wrong }) => void
 *   onRegisterSkip — (skipFn) => void
 *   onUpdateStats  — (correct, total) => void
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import SriYantraSVG from './SriYantraSVG'
import data from '../data/khadgamala-canonical.json'

// ── Static data ───────────────────────────────────────────────────────────────

const circuitSections = data.sections.filter(s => s.type === 'circuit')
const sectionByCircuit = Object.fromEntries(
  circuitSections.map(s => [s.circuitNumber, s])
)

// ── Circuit fill region IDs ───────────────────────────────────────────────────

const pad = n => String(n).padStart(2, '0')

const CIRCUIT_FILL_IDS = {
  1: ['c1-outer', 'c1-mid'],
  2: Array.from({ length: 16 }, (_, i) => `petal-c2-${pad(i + 1)}`),
  3: Array.from({ length:  8 }, (_, i) => `petal-c3-${pad(i + 1)}`),
  4: Array.from({ length: 14 }, (_, i) => `tri-c4-${pad(i + 1)}`),
  5: Array.from({ length: 10 }, (_, i) => `tri-c5-${pad(i + 1)}`),
  6: Array.from({ length: 10 }, (_, i) => `tri-c6-${pad(i + 1)}`),
  7: Array.from({ length:  8 }, (_, i) => `tri-c7-${pad(i + 1)}`),
  8: [],   // central triangle rendered via SVG overlay (not filledRegions)
  9: ['c9'],
}

// ── Colours ───────────────────────────────────────────────────────────────────

const DIM          = 'rgba(201,168,76,0.07)'
const HIGHLIGHT    = 'rgba(255,248,200,0.90)'
const FLASH_RED    = 'rgba(248,113,113,0.62)'   // correct = memorised = red
const FLASH_GOLD   = 'rgba(201,168,76,0.52)'    // wrong = not memorised = gold

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
  const circuits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  if (subFilter === 'nc-svamini') return shuffle(circuits.map(c => `${c}-svamini`))
  if (subFilter === 'nc-yogini')  return shuffle(circuits.map(c => `${c}-yogini`))
  // null = Both → one item per circuit, tooltip shows both answers
  return shuffle(circuits.map(c => `${c}-both`))
}

function parseItem(item) {
  const dash = item.indexOf('-')
  return {
    circuitNumber: parseInt(item.slice(0, dash)),
    type: item.slice(dash + 1), // 'svamini' | 'yogini'
  }
}

function getAnswer(section, type, script) {
  if (!section) return ''
  if (type === 'svamini') {
    return script === 'english'
      ? section.chakraSvamini
      : section.chakraSvaminiIast || section.chakraSvamini
  }
  return script === 'english'
    ? section.yoginiType
    : section.yoginiTypeIast || section.yoginiType
}

const CIRCUIT_LABELS_SHORT = {
  1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th',
  6: '6th', 7: '7th', 8: '8th', 9: '9th',
}

function regionToCircuit(id) {
  if (!id) return null
  if (id === 'c1' || id.startsWith('c1-')) return 1
  if (id.startsWith('petal-c2-')) return 2
  if (id.startsWith('petal-c3-')) return 3
  if (id.startsWith('tri-c4-')) return 4
  if (id.startsWith('tri-c5-')) return 5
  if (id.startsWith('tri-c6-')) return 6
  if (id.startsWith('tri-c7-')) return 7
  if (id === 'c8' || id.startsWith('tri-c8-')) return 8
  if (id === 'c9') return 9
  return null
}

function computeFills(activeCircuit, flashState) {
  const activeColor = flashState === 'correct' ? FLASH_RED
                    : flashState === 'wrong'   ? FLASH_GOLD
                    : HIGHLIGHT

  // Dim the outer circuits; leave triangle sub-regions unfilled so they render
  // transparent with no stroke — prevents inner-circuit strokes overlaying the
  // active circuit's cream fill.
  const fills = {
    'c1': DIM,
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${pad(i+1)}`, DIM])),
    ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`petal-c3-${pad(i+1)}`, DIM])),
  }

  // Highlight active circuit
  if (activeCircuit) {
    ;(CIRCUIT_FILL_IDS[activeCircuit] ?? []).forEach(id => { fills[id] = activeColor })
    // C9 bindu needs to be non-black to be visible
    if (activeCircuit === 9) fills['c9'] = activeColor
  }

  return fills
}

// ── Completion overlay ────────────────────────────────────────────────────────

function CompletionOverlay({ correct, total, onRestart }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <p className="iast text-gold-400 text-lg">sarvam paripurnam</p>
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

export default function NavaCakraSpotCheckView({
  script = 'iast',
  subFilter = null,
  onProgressSync,
  onRegisterSkip,
  onUpdateStats,
}) {
  const [queue,   setQueue]   = useState(() => buildQueue(subFilter))
  const [idx,     setIdx]     = useState(0)
  const [results, setResults] = useState({})
  const [hovered, setHovered] = useState(false)
  const [flash,   setFlash]   = useState(null)
  const clickTimer   = useRef(null)
  const advanceTimer = useRef(null)

  const total   = queue.length
  const done    = idx >= total
  const current = !done ? queue[idx] : null
  const parsed  = current ? parseItem(current) : null
  const section = parsed ? sectionByCircuit[parsed.circuitNumber] : null

  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length

  const svaminiAnswer = section ? getAnswer(section, 'svamini', script) : ''
  const yoginiAnswer  = section ? getAnswer(section, 'yogini',  script) : ''
  const answer = parsed?.type === 'svamini' ? svaminiAnswer
               : parsed?.type === 'yogini'  ? yoginiAnswer
               : svaminiAnswer  // 'both' — primary used for flash condition only

  const yantraFills = parsed ? computeFills(parsed.circuitNumber, flash) : {}

  // Reset on subFilter change
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

  // Sync progress
  useEffect(() => {
    if (onProgressSync) onProgressSync({ idx, total, correct, wrong })
  }, [idx, total, correct, wrong, onProgressSync])

  // Cleanup timers
  useEffect(() => () => {
    if (clickTimer.current)   clearTimeout(clickTimer.current)
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
  }, [])

  const scheduleAdvance = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null
      setFlash(null)
      setHovered(false)
      setIdx(i => i + 1)
    }, 3000)
  }, [])

  const advance = useCallback((result) => {
    if (!current || done) return
    setResults(prev => ({ ...prev, [current]: result }))
    setFlash(result)
    scheduleAdvance()
  }, [current, done, scheduleAdvance])

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
    setResults(prev => ({ ...prev, [current]: toggled }))
    setFlash(toggled)
    scheduleAdvance()
  }, [done, flash, current, scheduleAdvance])

  const handleSkip = useCallback(() => {
    if (done || flash) return
    setHovered(false)
    setIdx(i => i + 1)
  }, [done, flash])

  useEffect(() => {
    if (onRegisterSkip) onRegisterSkip(handleSkip)
  }, [handleSkip, onRegisterSkip])

  const handleRegionHover = useCallback((id) => {
    if (flash) return
    setHovered(regionToCircuit(id) === parsed?.circuitNumber)
  }, [flash, parsed])

  const startNewRound = useCallback(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats) {
      onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
    }
    setQueue(buildQueue(subFilter))
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
  }, [subFilter, results, onUpdateStats])

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
              onRegionHover={!done ? handleRegionHover : null}
            />

            {/* Circuit 8: central triangle overlay (DFT5 apex clipped to DFT4 base) */}
            {parsed?.circuitNumber === 8 && (
              <svg viewBox="45 55 430 430" xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}>
                <polygon
                  points="260,283.301 248.565,263.193 271.435,263.193"
                  fill={flash === 'correct' ? FLASH_RED : flash === 'wrong' ? FLASH_GOLD : HIGHLIGHT}
                />
              </svg>
            )}

            {/* Answer reveal overlay */}
            {(hovered || flash) && answer && (
              <div className="absolute inset-x-0 top-0 flex justify-center pt-5 pointer-events-none">
                <div
                  className="px-4 py-2 rounded-lg text-center"
                  style={{
                    background: 'rgba(15,8,5,0.92)',
                    border: '1px solid rgba(201,168,76,0.45)',
                    maxWidth: '85%',
                  }}
                >
                  {parsed?.type === 'both' ? (
                    <>
                      <p className={`${script === 'devanagari' ? '' : 'iast'} text-gold-300`}
                         style={{ fontSize: '15px', lineHeight: 1.4 }}>
                        {svaminiAnswer}
                      </p>
                      <p className={`${script === 'devanagari' ? '' : 'iast'} text-gold-500`}
                         style={{ fontSize: '15px', lineHeight: 1.4, marginTop: '2px' }}>
                        {yoginiAnswer}
                      </p>
                    </>
                  ) : (
                    <p className={`${script === 'devanagari' ? '' : 'iast'} text-gold-300`}
                       style={{ fontSize: '15px', lineHeight: 1.4 }}>
                      {answer}
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Instruction */}
      {!done && (
        <p className="text-muted mt-1 text-center" style={{ fontSize: '10px' }}>
          hover to reveal · <span className="text-red-400">click</span> = memorised · <span className="text-gold-400">dbl-click</span> = not memorised · right-click = change answer
        </p>
      )}

      {/* Completion */}
      {done && (
        <CompletionOverlay correct={correct} total={total} onRestart={startNewRound} />
      )}

    </div>
  )
}
