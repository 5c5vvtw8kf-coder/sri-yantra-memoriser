/**
 * SpotCheckView.jsx
 *
 * Spot Check mode — yantra-based spatial drill across all 102 circuit deities.
 *
 * Active deity highlighting:
 *   C2-C3  — the petal fills bright
 *   C4-C8  — the triangle fills bright
 *   C9     — the bindu fills bright
 *   C1     — a dot (bhupura has no discrete region per deity)
 *
 * Controls (filter bar, progress, skip) live in the App right panel.
 * This component is responsible for the yantra + completion overlay only.
 *
 * Props:
 *   script          — active script ('iast'|'devanagari'|'telugu'|'tamil'|'english')
 *   filter          — controlled filter id (string)
 *   onProgressSync  — (stats: { idx, total, correct, wrong }) => void
 *   onRegisterSkip  — (skipFn: () => void) => void
 *   onUpdateStats   — (correct, total) => void  (end-of-round callback)
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { getPosition, DEITY_POSITIONS } from '../deityPositions.js'
import SriYantraSVG from './SriYantraSVG'
import C89SpotCheckView from './C89SpotCheckView'
import NavaCakraSpotCheckView from './NavaCakraSpotCheckView'
import NyasaSpotCheckView from './NyasaSpotCheckView'
import NityaSpotCheckView from './NityaSpotCheckView'
import GuravahSpotCheckView from './GuravahSpotCheckView'
import ChakreshvariSpotCheckView from './ChakreshvariSpotCheckView'

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

// Only circuit deities with yantra positions (102 total, C1-C7)
const positionedDeities = deities.filter(d =>
  DEITY_POSITIONS[d.id] != null &&
  d.sectionId !== 'circuit-8' &&
  d.sectionId !== 'circuit-9'
)

// Card-mode sections — no unique yantra position; displayed as cards not yantra highlights
const CARD_SECTION_IDS = ['circuit-8', 'circuit-9', 'nitya', 'guru-divya', 'guru-siddha', 'guru-manava']
const cardDeities = deities.filter(d => CARD_SECTION_IDS.includes(d.sectionId))

// ── Filter definitions (circuit-only — no preamble/nava/closing) ──────────────

// C8 and C9 share a single SVG region (the central triangle / bindu) so all
// deities within each circuit highlight the same shape — not useful for spatial
// recall. They'll get card-based spot-check views when their dedicated pages
// are built. Tithi Nitya and Guravah likewise need dedicated pages.
export const SC_FILTERS = [
  { id: 'nyasa',     label: 'Nyāsa', labelEn: 'Nyasa', visualMode: 'nyasa', trKey: 'sec.nyasa' },
  { id: 'nitya',     label: 'Nitya', visualMode: 'nitya', trKey: 'sec.inner' },
  {
    id: 'guravah', label: 'Gurus', trKey: 'sec.gurava',
    sectionIds: ['guru-divya', 'guru-siddha', 'guru-manava'],
    visualMode: 'guravah',
    defaultSubFilter: null,
    subFilters: [
      { id: 'gurus-divya',  label: 'Divya',  filterSectionIds: ['guru-divya'],  trKey: 'gurava.divya'  },
      { id: 'gurus-siddha', label: 'Siddha', filterSectionIds: ['guru-siddha'], trKey: 'gurava.siddha' },
      { id: 'gurus-manava', label: 'Manava', filterSectionIds: ['guru-manava'], trKey: 'gurava.manava' },
      { id: 'gurus-whole',  label: 'Whole',  groupIds: null,                    trKey: 'sc.whole'      },
    ],
  },
  {
    id: 'circuit-1', label: '1st', sectionIds: ['circuit-1'], trKey: 'av.1',
    subFilters: [
      { id: 'c1-siddhi', label: 'Outer',  groupIds: ['siddhiShakti'], trKey: 'sc.outer'  },
      { id: 'c1-ashta',  label: 'Middle', groupIds: ['ashtaMatrika'], trKey: 'sc.middle' },
      { id: 'c1-mudra',  label: 'Inner',  groupIds: ['mudraShakti'],  trKey: 'sc.inner2' },
      { id: 'c1-whole',  label: 'Whole',  groupIds: null,             trKey: 'sc.whole'  },
    ],
  },
  { id: 'circuit-2', label: '2nd', sectionIds: ['circuit-2'], trKey: 'av.2' },
  { id: 'circuit-3', label: '3rd', sectionIds: ['circuit-3'], trKey: 'av.3' },
  { id: 'circuit-4', label: '4th', sectionIds: ['circuit-4'], trKey: 'av.4' },
  { id: 'circuit-5', label: '5th', sectionIds: ['circuit-5'], trKey: 'av.5' },
  { id: 'circuit-6', label: '6th', sectionIds: ['circuit-6'], trKey: 'av.6' },
  { id: 'circuit-7', label: '7th', sectionIds: ['circuit-7'], trKey: 'av.7' },
  // ── Card-mode sections (no unique yantra position) ──────────────────────
  {
    id: 'c8-c9', label: '8·9', trKey: 'av.89',
    sectionIds: ['circuit-8', 'circuit-9'],
    visualMode: 'c8c9',
    defaultSubFilter: null,
    subFilters: [
      { id: 'c8c9-8th',   label: '8th',   filterSectionIds: ['circuit-8'], trKey: 'av.8'    },
      { id: 'c8c9-9th',   label: '9th',   filterSectionIds: ['circuit-9'], trKey: 'av.9'    },
      { id: 'c8c9-whole', label: 'Whole', groupIds: null,                  trKey: 'sc.whole' },
    ],
  },
  {
    id: 'nava-cakra', label: 'Cakra', labelEn: 'Chakra', trKey: 'sec.nc',
    visualMode: 'navaCakra',
    defaultSubFilter: null,
    subFilters: [
      { id: 'nc-svamini', label: 'Svāminī', labelEn: 'Swamini', trKey: 'sc.svamini'   },
      { id: 'nc-yogini',  label: 'Yoginī',  labelEn: 'Yogini',  trKey: 'sc.yogini_lbl' },
      { id: 'nc-both',    label: 'Both',    groupIds: null,      trKey: 'sc.both'       },
    ],
  },
  { id: 'chakreshvari', label: 'Tripurā', labelEn: 'Tripura', visualMode: 'chakreshvari', trKey: 'sc.tripura' },
  { id: 'all',       label: 'All', sectionIds: null, trKey: 'misc.all' },
]

// ── Section label for completion overlay ─────────────────────────────────────

function getSectionLabel(filter, subFilter, tr = k => k) {
  const AV = {
    'circuit-1': tr('av.1'), 'circuit-2': tr('av.2'), 'circuit-3': tr('av.3'),
    'circuit-4': tr('av.4'), 'circuit-5': tr('av.5'), 'circuit-6': tr('av.6'),
    'circuit-7': tr('av.7'),
  }
  if (AV[filter]) return AV[filter]
  if (filter === 'nyasa')         return tr('sec.nyasa')
  if (filter === 'nitya')         return tr('sec.inner')
  if (filter === 'chakreshvari')  return tr('sec.nc')
  if (filter === 'all')           return tr('misc.all')
  if (filter === 'guravah') {
    if (subFilter === 'gurus-divya')  return tr('gurava.divya')
    if (subFilter === 'gurus-siddha') return tr('gurava.siddha')
    if (subFilter === 'gurus-manava') return tr('gurava.manava')
    return tr('sec.gurava')
  }
  if (filter === 'c8-c9') {
    if (subFilter === 'c8c9-8th') return tr('av.8')
    if (subFilter === 'c8c9-9th') return tr('av.9')
    return tr('av.89')
  }
  if (filter === 'nava-cakra') {
    if (subFilter === 'nc-svamini') return 'Cakra Svāminī'
    if (subFilter === 'nc-yogini')  return 'Cakra Yoginī'
    return 'Cakra Svāminī & Yoginī'
  }
  return tr('spot.round_complete')
}

// ── Region-ID lookup ──────────────────────────────────────────────────────────

const C4_DEITY_ORDER = [8, 7, 6, 5, 4, 3, 2, 1, 14, 13, 12, 11, 10, 9]
const C5_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C6_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C7_DEITY_ORDER = [5, 4, 3, 2, 1, 8, 7, 6]

function getRegionId(deity) {
  if (!deity || deity.role !== 'deity') return null
  const { sectionId, sequenceInSection: seq } = deity
  const pad = n => String(n).padStart(2, '0')

  if (sectionId === 'circuit-2') return `petal-c2-${pad(seq)}`
  if (sectionId === 'circuit-3') return `petal-c3-${pad(seq)}`
  if (sectionId === 'circuit-4') return `tri-c4-${pad(C4_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-5') return `tri-c5-${pad(C5_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-6') return `tri-c6-${pad(C6_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-7') return `tri-c7-${pad(C7_DEITY_ORDER[seq - 1])}`
  if (sectionId === 'circuit-8') return 'tri-c8-01'
  if (sectionId === 'circuit-9') return 'c9'
  return null  // circuit-1: dot only
}

// ── Dynamic fill computation ──────────────────────────────────────────────────

const ACTIVE_FILL  = 'rgba(255,248,200,0.90)'
const ACTIVE_RED   = 'rgba(248,113,113,0.88)'   // correct = memorised = red
const ACTIVE_GOLD  = 'rgba(201,168,76,0.80)'    // wrong = not memorised = gold
const BG_DIM       = 'rgba(138,117,96,0.35)'
const BG_NORMAL    = 'rgba(201,168,76,0.80)'
const SEGMENT_GOLD   = 'rgba(201,168,76,0.55)'
const RESULT_RED     = 'rgba(248,113,113,0.55)'  // past correct = red dot
const RESULT_GOLD    = 'rgba(201,168,76,0.80)'   // past wrong = gold dot

// All SVG region IDs per circuit (for segment highlight)
const pad = n => String(n).padStart(2, '0')
const CIRCUIT_REGIONS = {
  'circuit-2': Array.from({ length: 16 }, (_, i) => `petal-c2-${pad(i+1)}`),
  'circuit-3': Array.from({ length:  8 }, (_, i) => `petal-c3-${pad(i+1)}`),
  'circuit-4': Array.from({ length: 14 }, (_, i) => `tri-c4-${pad(i+1)}`),
  'circuit-5': Array.from({ length: 10 }, (_, i) => `tri-c5-${pad(i+1)}`),
  'circuit-6': Array.from({ length: 10 }, (_, i) => `tri-c6-${pad(i+1)}`),
  'circuit-7': Array.from({ length:  8 }, (_, i) => `tri-c7-${pad(i+1)}`),
}

function computeFills(activeRegionId, flashState, filterId, results) {
  const segmentIds = filterId && filterId !== 'all' ? (CIRCUIT_REGIONS[filterId] ?? []) : []
  const bg = BG_DIM
  const activeColor = flashState === 'correct' ? ACTIVE_RED
                    : flashState === 'wrong'   ? ACTIVE_GOLD
                    : ACTIVE_FILL

  const fills = {
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`petal-c3-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${String(i+1).padStart(2,'0')}`, bg])),
    ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`tri-c7-${String(i+1).padStart(2,'0')}`, bg])),
    'tri-c8-01':    bg,
    'tri-c8-bg-01': '#0f0805',
    'tri-c8-bg-02': '#0f0805',
    'c9':           activeRegionId === 'c9' ? activeColor : '#000000',
  }

  // Non-answered regions in the active circuit use BG_DIM (brown) —
  // SEGMENT_GOLD is indistinguishable from RESULT_GOLD (not memorised).
  segmentIds.forEach(id => {
    if (id !== activeRegionId) fills[id] = BG_DIM
  })

  // Persistent result colours for answered regions (overrides segment gold)
  if (results) {
    Object.entries(results).forEach(([deityId, verdict]) => {
      const regionId = getRegionId(deityById[deityId])
      if (regionId && regionId !== activeRegionId) {
        fills[regionId] = verdict === 'correct' ? RESULT_RED : RESULT_GOLD
      }
    })
  }

  // Active region always on top
  if (activeRegionId && activeRegionId !== 'c9') {
    fills[activeRegionId] = activeColor
  }

  return fills
}

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD  = '#c9a84c'
const CY    = 270

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(filterId, subFilterId) {
  const filter     = SC_FILTERS.find(f => f.id === filterId) ?? SC_FILTERS[0]
  const sourcePool = filter.cardMode ? cardDeities : positionedDeities
  let pool = filter.sectionIds
    ? sourcePool.filter(d => filter.sectionIds.includes(d.sectionId))
    : positionedDeities
  if (subFilterId && filter.subFilters) {
    const sub = filter.subFilters.find(s => s.id === subFilterId)
    if (sub?.groupIds)              pool = pool.filter(d => sub.groupIds.includes(d.group))
    else if (sub?.filterSectionIds) pool = pool.filter(d => sub.filterSectionIds.includes(d.sectionId))
  }
  return shuffle(pool.map(d => d.id))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Tooltip({ x, y, label, script, clearance = 22 }) {
  if (!label) return null
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'english' ? 14.5 : 13.5
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const w = Math.max(60, label.length * charW + 18)
  const tx = Math.min(Math.max(x, w / 2 + 49), 471 - w / 2)
  // Keep tooltip above/below element by `clearance` SVG units from the element centre,
  // clamped so it never escapes the viewBox (y range 55–485).
  const rawTy = y > CY ? y - h / 2 - clearance : y + h / 2 + clearance
  const ty = Math.min(Math.max(rawTy, 55 + h / 2 + 4), 485 - h / 2 - 4)
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
        fontSize={fontSize} fill={GOLD} fontFamily="'Gentium Plus', Georgia, serif"
      >
        {label}
      </text>
    </g>
  )
}

function CompletionOverlay({ correct, total, onRestart, sectionLabel, tr = k => k }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <p className="text-gold-400 text-lg">{sectionLabel || tr('spot.round_complete')}</p>
      <p className="text-cream text-sm">{tr('spot.round_complete')}</p>
      <div>
        <p className="text-4xl font-medium">
          <span className="text-red-400">{correct}</span>
          <span className="text-muted text-2xl">/{total}</span>
        </p>
        <p className="text-xs text-muted mt-1">{pct}% {tr('misc.memorised')}</p>
      </div>
      <button
        onClick={onRestart}
        className="px-5 py-2 bg-gold-800/40 border border-gold-700/50 text-gold-300 rounded-lg text-sm hover:bg-gold-800/60 transition-colors"
      >
        {tr('btn.new_round')}
      </button>
    </div>
  )
}

// ── Card-mode section metadata ────────────────────────────────────────────────

const CARD_SECTION_META = {
  'circuit-8':  { iastLabel: 'aṣṭama āvaraṇa',     enLabel: '8th Āvaraṇa', context: 'Primary Triangle', total: 9  },
  'circuit-9':  { iastLabel: 'navama āvaraṇa',      enLabel: '9th Āvaraṇa', context: 'Bindu',            total: 3  },
  'nitya':      { iastLabel: 'tithi nitya dēvatāḥ', enLabel: 'Tithi Nitya', context: 'Nitya Devatā',     total: 16 },
  'guru-divya': { iastLabel: 'divyaugha guravaḥ',   enLabel: 'Divyaugha',   context: 'Divine Lineage',   total: 7  },
  'guru-siddha':{ iastLabel: 'siddhaugha guravaḥ',  enLabel: 'Siddhaugha',  context: 'Siddha Lineage',   total: 4  },
  'guru-manava':{ iastLabel: 'mānavaugha guravaḥ',  enLabel: 'Mānavaugha',  context: 'Human Lineage',    total: 8  },
}

function roleHint(deity) {
  if (deity.role === 'chakraSvamini') return 'Cakra Svāminī'
  if (deity.role === 'yoginiType')    return 'Yoginī Type'
  if (deity.sectionId === 'circuit-8') {
    return deity.sequenceInSection <= 4 ? 'Weapon Shakti' : 'Mahā Shakti'
  }
  return null
}

function CardPrompt({ deity, script, hovered, onMouseEnter, onMouseLeave, onClick, onDoubleClick, flash }) {
  const meta = CARD_SECTION_META[deity.sectionId]
  const hint = roleHint(deity)
  const name = displayName(deity, script)

  const flashBg     = flash === 'correct' ? 'rgba(248,113,113,0.10)'
                    : flash === 'wrong'   ? 'rgba(201,168,76,0.08)'
                    : 'transparent'
  const flashBorder = flash === 'correct' ? 'rgba(248,113,113,0.55)'
                    : flash === 'wrong'   ? 'rgba(201,168,76,0.35)'
                    : 'rgba(201,168,76,0.18)'

  return (
    <div className="relative w-full" style={{ paddingBottom: '100%' }}>
      <div
        className="absolute inset-0 rounded-xl shadow-2xl shadow-black/60"
        style={{
          background: 'rgba(15,8,5,0.97)',
          border: `1px solid ${flashBorder}`,
          transition: 'border-color 0.25s',
        }}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer select-none px-8"
          style={{ background: flashBg, transition: 'background 0.25s', borderRadius: '0.75rem' }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          {meta && (
            <p className="iast text-gold-600" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
              {meta.iastLabel}
            </p>
          )}
          {meta && (
            <p className="text-muted text-xs">{meta.context}</p>
          )}

          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-5xl font-light text-cream">{deity.sequenceInSection}</span>
            <span className="text-xl text-muted">/ {meta?.total ?? '?'}</span>
          </div>

          {hint && (
            <p className="text-xs text-muted italic">{hint}</p>
          )}

          <div className="mt-6 min-h-[2rem] flex items-center justify-center text-center">
            {(hovered || flash) ? (
              <p className="iast text-gold-300 text-xl leading-snug">{name}</p>
            ) : (
              <p className="text-muted italic hidden md:block" style={{ fontSize: '11px' }}>{tr('instr.hover_reveal')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpotCheckView({ script = 'iast', filter = 'all', subFilter = null, limit = null, onProgressSync, onRegisterSkip, onUpdateStats, tr = k => k }) {
  const [queue,          setQueue]          = useState(() => { const q = buildQueue(filter, subFilter); return limit ? q.slice(0, limit) : q })
  const [idx,            setIdx]            = useState(0)
  const [results,        setResults]        = useState({})
  const [hovered,        setHovered]        = useState(false)
  const [flash,          setFlash]          = useState(null)
  const [prevResults,    setPrevResults]    = useState(null)
  // Mobile tap-to-reveal: first tap reveals name; only after 1s can user mark correct/wrong
  const [mobileRevealed, setMobileRevealed] = useState(false)
  const [revealedAt,     setRevealedAt]     = useState(null)
  const clickTimer     = useRef(null)
  const lastPastTap    = useRef({ id: null, time: 0 })  // for double-tap toggle of past results
  const roundLoggedRef = useRef(false)

  const total   = queue.length
  const done    = idx >= total
  const current = !done ? (deityById[queue[idx]] ?? null) : null
  const pos     = current ? getPosition(current.id) : null
  const hasPos  = pos != null

  const isCardMode     = !!SC_FILTERS.find(f => f.id === filter)?.cardMode
  const activeRegionId = current && !isCardMode ? getRegionId(current) : null
  const hasRegion      = activeRegionId != null
  const showDot        = hasPos && !hasRegion   // C1 only

  const correct = Object.values(results).filter(v => v === 'correct').length
  const wrong   = Object.values(results).filter(v => v === 'wrong').length

  const yantraFills = computeFills(activeRegionId, flash, filter, results)

  // Regions with an answer (correct or wrong) get no gold outline
  const noStrokeRegions = Object.fromEntries(
    Object.keys(results)
      .map(id => [getRegionId(deityById[id]), true])
      .filter(([regionId]) => regionId != null)
  )

  // Reset reveal state when deity changes
  useEffect(() => {
    setMobileRevealed(false)
    setRevealedAt(null)
  }, [idx])

  // Reset queue when filter or limit changes
  useEffect(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0 && onUpdateStats) {
      onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
    }
    const q = buildQueue(filter, subFilter)
    setQueue(limit ? q.slice(0, limit) : q)
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
    setPrevResults(null)
  }, [filter, subFilter, limit]) // eslint-disable-line

  // Sync progress to right panel — skip when delegating to a visualMode sub-component
  // (the sub-component calls onProgressSync itself; parent fires after child and would overwrite)
  useEffect(() => {
    const activeFilterDef = SC_FILTERS.find(f => f.id === filter)
    if (activeFilterDef?.visualMode) return
    if (onProgressSync) {
      onProgressSync({ idx, total, correct, wrong })
    }
  }, [idx, total, correct, wrong, onProgressSync, filter])

  // Clean up timers
  useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current) }, [])

  // Log session as soon as the round completes — don't wait for "New round" click
  useEffect(() => {
    if (!done) { roundLoggedRef.current = false; return }
    if (roundLoggedRef.current) return
    const doneCount = Object.keys(results).length
    if (doneCount === 0) return
    roundLoggedRef.current = true
    if (onUpdateStats) onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
  }, [done]) // eslint-disable-line

  const finishRound = useCallback(() => {
    const doneCount = Object.keys(results).length
    if (doneCount > 0) {
      setPrevResults({ ...results })
      // onUpdateStats already fired from the done useEffect — skip to avoid double-logging
      if (onUpdateStats && !roundLoggedRef.current) {
        onUpdateStats(Object.values(results).filter(v => v === 'correct').length, doneCount)
      }
    }
  }, [results, onUpdateStats])

  const startNewRound = useCallback(() => {
    finishRound()
    const q = buildQueue(filter, subFilter)
    setQueue(limit ? q.slice(0, limit) : q)
    setIdx(0)
    setResults({})
    setHovered(false)
    setFlash(null)
  }, [filter, subFilter, limit, finishRound])


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

  const isMobile = () => window.innerWidth < 768

  const handleClick = useCallback(() => {
    if (done || flash) return
    if (isMobile()) {
      // Step 1: first tap reveals the name (no mark yet)
      if (!mobileRevealed) {
        setMobileRevealed(true)
        setRevealedAt(Date.now())
        return
      }
      // Step 2: after 1-second lockout, tap marks correct
      if (Date.now() - (revealedAt ?? 0) < 1000) return
      if (clickTimer.current) return
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null
        advance('correct')
      }, 260)
      return
    }
    // Desktop: original single-click = correct
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      advance('correct')
    }, 260)
  }, [done, flash, mobileRevealed, revealedAt, advance])

  const handleDblClick = useCallback(() => {
    if (done || flash) return
    if (isMobile()) {
      // Double-tap marks wrong — only after reveal + 1s lockout
      if (!mobileRevealed || Date.now() - (revealedAt ?? 0) < 1000) return
      if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
      advance('wrong')
      return
    }
    // Desktop: double-click = wrong
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    advance('wrong')
  }, [done, flash, mobileRevealed, revealedAt, advance])

  const handleRightClick = useCallback((e, deityId) => {
    e.preventDefault()
    if (!results[deityId]) return
    setResults(prev => ({
      ...prev,
      [deityId]: prev[deityId] === 'correct' ? 'wrong' : 'correct',
    }))
  }, [results])

  // Mobile double-tap (within 350ms) to toggle a past answer — mirrors right-click on desktop
  const handlePastDoubleTap = useCallback((deityId) => {
    const now  = Date.now()
    const last = lastPastTap.current
    if (last.id === deityId && now - last.time < 350) {
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

  // Register skip with parent (right panel skip button)
  useEffect(() => {
    if (onRegisterSkip) onRegisterSkip(handleSkip)
  }, [handleSkip, onRegisterSkip])

  const name   = current ? displayName(current, script) : ''
  const dotFill = flash === 'correct' ? ACTIVE_RED : flash === 'wrong' ? ACTIVE_GOLD : 'rgba(255,248,200,0.95)'

  // Delegate to dedicated visual components for special-mode filters
  const activeFilterDef = SC_FILTERS.find(f => f.id === filter)
  if (activeFilterDef?.visualMode === 'c8c9') {
    return (
      <C89SpotCheckView
        script={script}
        subFilter={subFilter}
        onProgressSync={onProgressSync}
        onRegisterSkip={onRegisterSkip}
        onUpdateStats={onUpdateStats}
        sectionLabel={getSectionLabel(filter, subFilter, tr)}
      />
    )
  }
  if (activeFilterDef?.visualMode === 'navaCakra') {
    return (
      <NavaCakraSpotCheckView
        script={script}
        subFilter={subFilter}
        onProgressSync={onProgressSync}
        onRegisterSkip={onRegisterSkip}
        onUpdateStats={onUpdateStats}
        sectionLabel={getSectionLabel(filter, subFilter, tr)}
      />
    )
  }
  if (activeFilterDef?.visualMode === 'nyasa') {
    return (
      <NyasaSpotCheckView
        script={script}
        onProgressSync={onProgressSync}
        onRegisterSkip={onRegisterSkip}
        onUpdateStats={onUpdateStats}
        sectionLabel={getSectionLabel(filter, subFilter, tr)}
      />
    )
  }
  if (activeFilterDef?.visualMode === 'nitya') {
    return (
      <NityaSpotCheckView
        script={script}
        onProgressSync={onProgressSync}
        onRegisterSkip={onRegisterSkip}
        onUpdateStats={onUpdateStats}
        sectionLabel={getSectionLabel(filter, subFilter, tr)}
      />
    )
  }
  if (activeFilterDef?.visualMode === 'guravah') {
    return (
      <GuravahSpotCheckView
        script={script}
        subFilter={subFilter}
        onProgressSync={onProgressSync}
        onRegisterSkip={onRegisterSkip}
        onUpdateStats={onUpdateStats}
        sectionLabel={getSectionLabel(filter, subFilter, tr)}
      />
    )
  }
  if (activeFilterDef?.visualMode === 'chakreshvari') {
    return (
      <ChakreshvariSpotCheckView
        script={script}
        onProgressSync={onProgressSync}
        onRegisterSkip={onRegisterSkip}
        onUpdateStats={onUpdateStats}
        sectionLabel={getSectionLabel(filter, subFilter, tr)}
      />
    )
  }

  return (
    <div className="w-full p-4 flex flex-col gap-3">

      {/* Sri Yantra — always at top */}
      {!done && (
        <>
        {isCardMode ? (
          <CardPrompt
            deity={current}
            script={script}
            hovered={hovered}
            flash={flash}
            onMouseEnter={() => { if (!flash) setHovered(true) }}
            onMouseLeave={() => { if (!flash) setHovered(false) }}
            onClick={handleClick}
            onDoubleClick={handleDblClick}
          />
        ) : (
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
          style={{ paddingBottom: '100%', WebkitTouchCallout: 'none', userSelect: 'none' }}
        >
          <div className="absolute inset-0">
            <SriYantraSVG
              className="w-full h-full"
              showTriangles={true}
              showLabels={false}
              showNumbers={false}
              filledRegions={yantraFills}
              noStrokeRegions={noStrokeRegions}
            />
            <svg
              viewBox="45 55 430 430"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full"
              style={{ background: 'transparent' }}
            >
              {/* Background result dots — C1 only (C2-C9 use region fills) */}
              {positionedDeities.map(d => {
                if (d.id === current?.id) return null
                if (getRegionId(d) != null) return null
                const p = getPosition(d.id)
                if (!p) return null
                const res = results[d.id]
                const fill = res === 'correct' ? RESULT_RED
                           : res === 'wrong'   ? RESULT_GOLD
                           : 'rgba(201,168,76,0.22)'
                const answered = !!res
                return (
                  <g key={d.id}>
                    {/* Visual dot */}
                    <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={answered ? 6 : 4}
                      fill={fill} stroke="none" style={{ pointerEvents: 'none' }} />
                    {/* Larger transparent hit area for touch/click — answered dots only */}
                    {answered && (
                      <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={18}
                        fill="transparent" stroke="none"
                        style={{ cursor: 'context-menu', WebkitTouchCallout: 'none', userSelect: 'none' }}
                        onContextMenu={e => handleRightClick(e, d.id)}
                        onTouchEnd={e => { e.preventDefault(); handlePastDoubleTap(d.id) }} />
                    )}
                  </g>
                )
              })}

              {/* C1 active dot */}
              {showDot && pos && (
                <circle
                  cx={pos.x.toFixed(1)} cy={pos.y.toFixed(1)}
                  r={9}
                  fill={dotFill} stroke="none"
                  style={{ cursor: 'pointer', transition: 'fill 0.25s, stroke 0.25s' }}
                  onMouseEnter={() => { if (!flash) setHovered(true) }}
                  onMouseLeave={() => { if (!flash) setHovered(false) }}
                  onClick={handleClick}
                  onDoubleClick={handleDblClick}
                />
              )}

              {/* C2-C9 right-click hit areas for past answered deities */}
              {positionedDeities.map(d => {
                if (d.id === current?.id) return null
                if (!results[d.id]) return null
                const regionId = getRegionId(d)
                if (!regionId) return null
                const p = getPosition(d.id)
                if (!p) return null
                return (
                  <circle key={`rc-${d.id}`}
                    cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={16}
                    fill="transparent" stroke="none"
                    style={{ cursor: 'context-menu', WebkitTouchCallout: 'none', userSelect: 'none' }}
                    onContextMenu={e => handleRightClick(e, d.id)}
                    onTouchEnd={e => { e.preventDefault(); handlePastDoubleTap(d.id) }} />
                )
              })}

              {/* C2-C9 transparent hit area */}
              {hasRegion && pos && (
                <circle
                  cx={pos.x.toFixed(1)} cy={pos.y.toFixed(1)}
                  r={16}
                  fill="transparent" stroke="none"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => { if (!flash) setHovered(true) }}
                  onMouseLeave={() => { if (!flash) setHovered(false) }}
                  onClick={handleClick}
                  onDoubleClick={handleDblClick}
                />
              )}

              {/* Tooltip — desktop: hover/flash; mobile: after tap-to-reveal */}
              {hasPos && pos && (hovered || flash || mobileRevealed) && (
                <Tooltip
                  x={pos.x} y={pos.y} label={name} script={script}
                  clearance={
                    current?.sectionId === 'circuit-1' ? 22
                    : current?.sectionId === 'circuit-2' ? 75
                    : current?.sectionId === 'circuit-3' ? 62
                    : current?.sectionId === 'circuit-7' ? 52
                    : 65   // C4, C5, C6
                  }
                />
              )}


            </svg>
          </div>
        </div>
        )}

        {/* Mobile instruction — hidden on desktop; content varies by mode */}
        <div className="md:hidden flex flex-col items-center gap-0.5 pt-1"
             style={{ fontSize: '11px', fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(201,168,76,0.55)', letterSpacing: '0.02em' }}>
          {isCardMode ? (
            <>
              <span>tap to reveal · <span style={{ color: '#f87171' }}>tap again</span> = memorised</span>
              <span><span style={{ color: '#c9a84c' }}>dbl-tap</span> = not memorised</span>
            </>
          ) : (
            <>
              <span>tap to reveal · <span style={{ color: '#f87171' }}>tap</span> = memorised</span>
              <span><span style={{ color: '#c9a84c' }}>dbl-tap</span> = not memorised · <span style={{ color: '#c9a84c' }}>dbl-tap</span> past = toggle</span>
            </>
          )}
        </div>
        </>
      )}

      {done && (
        <CompletionOverlay
          correct={correct} total={total}
          onRestart={startNewRound}

          sectionLabel={getSectionLabel(filter, subFilter, tr)}
          tr={tr}
        />
      )}

    </div>
  )
}
