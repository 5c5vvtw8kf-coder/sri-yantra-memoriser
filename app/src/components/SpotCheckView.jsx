/**
 * SpotCheckView.jsx
 *
 * Spot Check mode — flashcard drill across all 181 deities (or a filtered subset).
 *
 * Interaction (mirrors Memo mode):
 *   hover over card  → reveals the deity name
 *   single click     → not memorised (advances queue)
 *   double click     → memorised (marks correct, advances queue)
 *   skip button      → silently skips without marking
 *
 * Filter bar at the top allows focus on a specific section or circuit.
 * Progress bar shows completion through the current shuffled queue.
 * Completion screen summarises the round and offers restart.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'

const { deities, sections } = data
const deityById   = Object.fromEntries(deities.map(d => [d.id, d]))
const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))

// ── Filter definitions ────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',          label: 'All',        sectionIds: null },
  { id: 'preamble',     label: 'Preamble',   sectionIds: ['invocation','nyasa','nitya','guru-divya','guru-siddha','guru-manava'] },
  { id: 'circuit-1',    label: 'C1',         sectionIds: ['circuit-1'] },
  { id: 'circuit-2',    label: 'C2',         sectionIds: ['circuit-2'] },
  { id: 'circuit-3',    label: 'C3',         sectionIds: ['circuit-3'] },
  { id: 'circuit-4',    label: 'C4',         sectionIds: ['circuit-4'] },
  { id: 'circuit-5',    label: 'C5',         sectionIds: ['circuit-5'] },
  { id: 'circuit-6',    label: 'C6',         sectionIds: ['circuit-6'] },
  { id: 'circuit-7',    label: 'C7',         sectionIds: ['circuit-7'] },
  { id: 'circuit-8',    label: 'C8',         sectionIds: ['circuit-8'] },
  { id: 'circuit-9',    label: 'C9',         sectionIds: ['circuit-9'] },
  { id: 'nava',         label: 'Nava C.',    sectionIds: ['chakreshvari'] },
  { id: 'closing',      label: 'Closing',    sectionIds: ['closing'] },
]

// ── Section display labels ────────────────────────────────────────────────────

const SECTION_DISPLAY = {
  'invocation':   'Invocation',
  'nyasa':        'Nyāsa Deities',
  'nitya':        'Tithi Nitya Devatāḥ',
  'guru-divya':   'Divyaugha Gurus',
  'guru-siddha':  'Siddyaugha Gurus',
  'guru-manava':  'Mānavaugha Gurus',
  'circuit-1':    'Circuit 1 — Bhūpura',
  'circuit-2':    'Circuit 2 — 16 Petals',
  'circuit-3':    'Circuit 3 — 8 Petals',
  'circuit-4':    'Circuit 4 — 14 △',
  'circuit-5':    'Circuit 5 — 10 △ outer',
  'circuit-6':    'Circuit 6 — 10 △ inner',
  'circuit-7':    'Circuit 7 — 8 △',
  'circuit-8':    'Circuit 8 — Primary △',
  'circuit-9':    'Circuit 9 — Bindu',
  'chakreshvari': 'Nava Chakreshvarī',
  'closing':      'Śrīdevī Epithets',
}

// ── Group / role labels ───────────────────────────────────────────────────────

const GROUP_LABEL = {
  siddhiShakti:          'Siddhi Shakti',
  ashtaMatrika:          'Ashṭa Matrikā',
  mudraShakti:           'Mudrā Shakti',
  guptaYogini:           'Gupta Yoginī',
  guptataraYogini:       'Guptatarā Yoginī',
  sampradayaYogini:      'Sampradāya Yoginī',
  kulottirnaYogini:      'Kulottīrṇa Yoginī',
  nigarbhaYogini:        'Nigarbha Yoginī',
  rahasyaYogini:         'Rahasya Yoginī',
  atiRahasyaYogini:      'Ati Rahasya Yoginī',
  paraParaRahasyaYogini: 'Para Para Rahasya Yoginī',
}

function contextLabel(deity) {
  if (!deity) return ''
  const { role, group } = deity
  if (role === 'chakraSvamini') return 'Chakra Svāminī'
  if (role === 'yoginiType')    return 'Yoginī'
  if (group && GROUP_LABEL[group]) return GROUP_LABEL[group]
  return ''
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

function buildQueue(filterId) {
  const filter = FILTERS.find(f => f.id === filterId) ?? FILTERS[0]
  const pool = filter.sectionIds
    ? deities.filter(d => filter.sectionIds.includes(d.sectionId))
    : deities
  return shuffle(pool.map(d => d.id))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterBar({ active, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors
            ${active === f.id
              ? 'text-gold-300 bg-gold-900/30 border-gold-700/50'
              : 'text-muted border-surface-700 hover:text-cream'}`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function ProgressBar({ idx, total, correct, wrong }) {
  const pct = total > 0 ? (idx / total) * 100 : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-mono text-muted">
          {Math.min(idx + 1, total)} / {total}
        </span>
        <span className="text-xs">
          {correct > 0 && <span className="text-green-400">{correct} ✓</span>}
          {correct > 0 && wrong > 0 && <span className="text-muted"> · </span>}
          {wrong > 0  && <span className="text-red-400">{wrong} ✗</span>}
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #c9a84c, #e8c87a)',
          }}
        />
      </div>
    </div>
  )
}

function CompletionScreen({ correct, total, onRestart }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <p className="iast text-gold-400 text-lg">sarvaṁ paripūrṇam</p>
      <p className="text-cream text-sm">Round complete</p>
      <div>
        <p className="text-4xl font-medium">
          <span className="text-green-400">{correct}</span>
          <span className="text-muted text-2xl">/{total}</span>
        </p>
        <p className="text-xs text-muted mt-1">{pct}% memorised</p>
      </div>
      <button
        onClick={onRestart}
        className="px-5 py-2 bg-gold-800/40 border border-gold-700/50 text-gold-300 rounded-lg text-sm hover:bg-gold-800/60 transition-colors"
      >
        New round ↺
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpotCheckView({ script = 'iast', onUpdateStats }) {
  const [filter,      setFilter]      = useState('all')
  const [queue,       setQueue]       = useState(() => buildQueue('all'))
  const [idx,         setIdx]         = useState(0)
  const [results,     setResults]     = useState({})
  const [revealed,    setRevealed]    = useState(false)
  const [flash,       setFlash]       = useState(null) // 'correct' | 'wrong' | null
  const [prevResults, setPrevResults] = useState(null)
  const clickTimer = useRef(null)

  const total   = queue.length
  const done    = idx >= total
  const current = !done ? (deityById[queue[idx]] ?? null) : null
  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length

  // Clean up timer on unmount
  useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current) }, [])

  const startNewRound = useCallback((filterId) => {
    // Persist completed round to session stats before resetting
    const doneCount = Object.keys(results).length
    if (doneCount > 0) {
      setPrevResults({ ...results })
      if (onUpdateStats) {
        onUpdateStats(
          Object.values(results).filter(v => v === 'correct').length,
          doneCount
        )
      }
    }
    const fid = filterId ?? filter
    setQueue(buildQueue(fid))
    setIdx(0)
    setResults({})
    setRevealed(false)
    setFlash(null)
  }, [filter, results, onUpdateStats])

  const changeFilter = useCallback((filterId) => {
    setFilter(filterId)
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats) {
      onUpdateStats(
        Object.values(results).filter(v => v === 'correct').length,
        doneCount
      )
    }
    setQueue(buildQueue(filterId))
    setIdx(0)
    setResults({})
    setRevealed(false)
    setFlash(null)
    setPrevResults(null)
  }, [results, onUpdateStats])

  const advance = useCallback((result) => {
    if (!current || done) return
    const id = current.id
    setResults(prev => ({ ...prev, [id]: result }))
    setFlash(result)
    setTimeout(() => {
      setFlash(null)
      setRevealed(false)
      setIdx(i => i + 1)
    }, 380)
  }, [current, done])

  const handleClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      advance('wrong')
    }, 260)
  }, [done, flash, advance])

  const handleDblClick = useCallback(() => {
    if (done || flash) return
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    advance('correct')
  }, [done, flash, advance])

  const handleSkip = () => {
    if (done || flash) return
    setRevealed(false)
    setIdx(i => i + 1)
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const name        = current ? displayName(current, script) : ''
  const needsSerif  = script === 'devanagari' || script === 'telugu' || script === 'tamil'
  const sectionDisp = current ? (SECTION_DISPLAY[current.sectionId] ?? current.sectionId) : ''
  const ctxLabel    = current ? contextLabel(current) : ''

  const cardBg = flash === 'correct'
    ? 'rgba(22, 101, 52, 0.35)'
    : flash === 'wrong'
    ? 'rgba(120, 20, 20, 0.35)'
    : 'transparent'

  const cardBorderColor = flash === 'correct'
    ? '#4ade80'
    : flash === 'wrong'
    ? '#f87171'
    : '#3a3020'

  return (
    <div className="w-full p-4 flex flex-col gap-4">

      {/* Filter bar */}
      <FilterBar active={filter} onChange={changeFilter} />

      {/* Progress */}
      <ProgressBar idx={idx} total={total} correct={correct} wrong={wrong} />

      {done ? (
        <CompletionScreen
          correct={correct}
          total={total}
          onRestart={() => startNewRound(filter)}
        />
      ) : (
        <div className="flex flex-col gap-3">

          {/* Context badges */}
          <div className="flex items-center gap-2 flex-wrap min-h-[1.25rem]">
            <span className="iast text-xs font-mono text-muted uppercase tracking-widest">
              {sectionDisp}
            </span>
            <span className="text-xs text-surface-600">#{current?.sequenceInChant}</span>
            {ctxLabel && (
              <>
                <span className="text-xs text-surface-600">·</span>
                <span className="iast text-xs text-muted">{ctxLabel}</span>
              </>
            )}
          </div>

          {/* Main card — hover reveals, click/dblclick marks */}
          <div
            className="relative rounded-xl border p-6 flex flex-col items-center justify-center min-h-[160px] cursor-pointer select-none"
            style={{
              background: cardBg,
              borderColor: cardBorderColor,
              transition: 'background 0.25s, border-color 0.25s',
            }}
            onMouseEnter={() => { if (!flash) setRevealed(true) }}
            onMouseLeave={() => { if (!flash) setRevealed(false) }}
            onClick={handleClick}
            onDoubleClick={handleDblClick}
          >
            {revealed || flash ? (
              <div className="text-center pointer-events-none">
                <p className={`${needsSerif ? '' : 'iast'} text-gold-300 text-xl leading-snug mb-1`}>
                  {name}
                </p>
                {script !== 'iast' && current?.scripts?.iast && (
                  <p className="iast text-gold-600 text-sm mt-0.5">
                    {current.scripts.iast}
                  </p>
                )}
                {script !== 'english' && current?.scripts?.english && (
                  <p className="text-cream text-sm mt-0.5">
                    {current.scripts.english}
                  </p>
                )}
                {current?.scripts?.translation && (
                  <p className="text-muted text-xs italic mt-1.5">
                    {current.scripts.translation}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="w-20 h-1.5 rounded-full bg-surface-700" />
                <div className="w-28 h-1.5 rounded-full bg-surface-800" />
                <p className="text-xs text-surface-600 mt-2 font-mono">hover to reveal</p>
              </div>
            )}

            {/* Flash indicator */}
            {flash && (
              <div
                className="absolute inset-0 rounded-xl flex items-end justify-center pb-3 pointer-events-none"
              >
                <span className={`text-xs font-mono uppercase tracking-widest ${
                  flash === 'correct' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {flash === 'correct' ? 'memorised ✓' : 'not yet ✗'}
                </span>
              </div>
            )}
          </div>

          {/* Interaction hint */}
          <p className="text-xs text-surface-600 text-center font-mono">
            dbl-click = memorised · click = not memorised
          </p>

          {/* Skip */}
          <div className="flex justify-center">
            <button
              onClick={handleSkip}
              className="text-xs text-muted hover:text-cream transition-colors px-3 py-1 rounded"
            >
              skip →
            </button>
          </div>

          {/* Previous round summary (if available) */}
          {prevResults && (() => {
            const pCorrect = Object.values(prevResults).filter(v => v === 'correct').length
            const pTotal   = Object.keys(prevResults).length
            return (
              <div className="pt-2 border-t border-surface-800">
                <p className="text-xs text-muted font-mono uppercase tracking-widest mb-1">
                  Last round
                </p>
                <p className="text-xs">
                  <span className="text-green-400">{pCorrect}</span>
                  <span className="text-muted">/{pTotal} memorised</span>
                </p>
              </div>
            )
          })()}

        </div>
      )}

    </div>
  )
}
