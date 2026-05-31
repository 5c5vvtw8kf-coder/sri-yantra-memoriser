import { useState } from 'react'
import data from '../data/khadgamala-canonical.json'
import { saveMemoStorage, loadMemoHistory, displayName } from '../utils.js'

const { deities, sections } = data

// ── Section column labels ─────────────────────────────────────────────────────

const SECTION_COL_LABEL = {
  nyasa:          'Nyāsāṅga',
  nitya:          'Tithi Nitya',
  'guru-divya':   'Guravaḥ',
  'guru-siddha':  'Guravaḥ',
  'guru-manava':  'Guravaḥ',
  'circuit-1':    '1st Āvaraṇa',
  'circuit-2':    '2nd Āvaraṇa',
  'circuit-3':    '3rd Āvaraṇa',
  'circuit-4':    '4th Āvaraṇa',
  'circuit-5':    '5th Āvaraṇa',
  'circuit-6':    '6th Āvaraṇa',
  'circuit-7':    '7th Āvaraṇa',
  'circuit-8':    '8th Āvaraṇa',
  'circuit-9':    '9th Āvaraṇa',
  chakreshvari:   'Nava Chakreshvarī',
  closing:        'Śrīdevī Epithets',
}

const STOTRA_SECTION_IDS = new Set(Object.keys(SECTION_COL_LABEL))
const GURU_IDS = new Set(['guru-divya', 'guru-siddha', 'guru-manava'])

// ── Filter dropdown options ───────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { id: 'nyasa',          label: 'Nyāsāṅga'        },
  { id: 'nitya',          label: 'Tithi Nitya'      },
  { id: 'gurava',         label: 'Guravaḥ'          },
  { id: 'circuit-1',      label: '1st Āvaraṇa'      },
  { id: 'circuit-2',      label: '2nd Āvaraṇa'      },
  { id: 'circuit-3',      label: '3rd Āvaraṇa'      },
  { id: 'circuit-4',      label: '4th Āvaraṇa'      },
  { id: 'circuit-5',      label: '5th Āvaraṇa'      },
  { id: 'circuit-6',      label: '6th Āvaraṇa'      },
  { id: 'circuit-7',      label: '7th Āvaraṇa'      },
  { id: 'circuit-8',      label: '8th Āvaraṇa'      },
  { id: 'circuit-9',      label: '9th Āvaraṇa'      },
  { id: 'chakreshvari',   label: 'Nava Chakreshvarī' },
  { id: 'closing',        label: 'Śrīdevī Epithets'  },
  { id: 'chakra-svamini', label: 'Chakra Svāminī'   },
  { id: 'yogini',         label: 'Yoginī'            },
]

// ── Circuit store and extra-row seq numbers ───────────────────────────────────

const CIRCUIT_STORE = {
  'circuit-1': 'bhupura', 'circuit-2': 'c2', 'circuit-3': 'c3',
  'circuit-4': 'c4',      'circuit-5': 'c5', 'circuit-6': 'c6',
  'circuit-7': 'c7',      'circuit-8': 'c8', 'circuit-9': 'c9',
}

const CIRCUIT_EXTRA_SEQS = {
  'circuit-1': { svamini: 29, yogini: 30 },
  'circuit-2': { svamini: 17, yogini: 18 },
  'circuit-3': { svamini:  9, yogini: 10 },
  'circuit-4': { svamini: 15, yogini: 16 },
  'circuit-5': { svamini: 11, yogini: 12 },
  'circuit-6': { svamini: 11, yogini: 12 },
  'circuit-7': { svamini:  9, yogini: 10 },
  'circuit-8': { svamini:  8, yogini:  9 },
  'circuit-9': { svamini:  2, yogini:  3 },
}

// ── Status helpers ────────────────────────────────────────────────────────────

function statusFromHistory(store, key, allHistory) {
  const recent = allHistory[store]?.[key]
  if (!recent || recent.length === 0) return 'notAttempted'
  const hasCorrect          = recent.some(r => r === 'correct')
  const lastThreeAllCorrect = recent.length >= 3 && recent.every(r => r === 'correct')
  if (lastThreeAllCorrect) return 'memorised'
  if (hasCorrect)          return 'partial'
  return 'notMemorised'
}

function getDeityStatus(deity, allHistory) {
  const { sectionId, sequenceInSection: seq } = deity
  const ref = {
    'nyasa':        { store: 'nyasa',   key: seq },
    'nitya':        { store: 'inner',   key: seq },
    'guru-divya':   { store: 'gurava',  key: seq },
    'guru-siddha':  { store: 'gurava',  key: 7  + seq },
    'guru-manava':  { store: 'gurava',  key: 11 + seq },
    'circuit-1':    { store: 'bhupura', key: seq },
    'circuit-2':    { store: 'c2',      key: seq },
    'circuit-3':    { store: 'c3',      key: seq },
    'circuit-4':    { store: 'c4',      key: seq },
    'circuit-5':    { store: 'c5',      key: seq },
    'circuit-6':    { store: 'c6',      key: seq },
    'circuit-7':    { store: 'c7',      key: seq },
    'circuit-8':    { store: 'c8',      key: seq },
    'circuit-9':    { store: 'c9',      key: 1  },
    'chakreshvari': { store: 'nc',      key: seq },
    'closing':      { store: 'closing', key: seq },
  }[sectionId]
  if (!ref) return 'notAttempted'
  return statusFromHistory(ref.store, ref.key, allHistory)
}

// ── Status display ────────────────────────────────────────────────────────────

const STATUS_DISPLAY = {
  memorised:    { symbol: '✓', className: 'text-red-400 font-semibold'   },
  partial:      { symbol: '~', className: 'text-gold-500 font-semibold'  },
  notMemorised: { symbol: '✗', className: 'text-slate-400 font-semibold' },
  notAttempted: { symbol: '—', className: 'text-surface-600'             },
}

// ── Build combined row list ───────────────────────────────────────────────────

const circuitSections = sections.filter(s => s.type === 'circuit')

const allCircuitsMaxChant = deities
  .filter(d => d.sectionId in CIRCUIT_STORE)
  .reduce((max, d) => Math.max(max, d.sequenceInChant), 0)

const DEITY_ROWS = deities
  .filter(d => STOTRA_SECTION_IDS.has(d.sectionId))
  .sort((a, b) => a.sequenceInChant - b.sequenceInChant)
  .map(d => ({
    rowType: 'deity', rowKey: d.id, sectionId: d.sectionId,
    seqNum: d.sequenceInChant, scripts: d.scripts, deity: d,
    sortKey: d.sequenceInChant, store: null, resultKey: null,
  }))

const EXTRA_ROWS = circuitSections.flatMap(section => {
  const sectionId = `circuit-${section.circuitNumber}`
  const store     = CIRCUIT_STORE[sectionId]
  const seqs      = CIRCUIT_EXTRA_SEQS[sectionId]
  if (!store || !seqs) return []
  const base = allCircuitsMaxChant + section.circuitNumber * 2
  return [
    {
      rowType: 'svamini', rowKey: `svamini-${sectionId}`, sectionId,
      seqNum: null,
      scripts: { iast: section.chakraSvaminiIast || section.chakraSvamini, english: section.chakraSvamini, devanagari: section.chakraSvaminiIast || section.chakraSvamini },
      sortKey: base, store, resultKey: seqs.svamini,
    },
    {
      rowType: 'yogini', rowKey: `yogini-${sectionId}`, sectionId,
      seqNum: null,
      scripts: { iast: section.yoginiTypeIast || section.yoginiType, english: section.yoginiType, devanagari: section.yoginiTypeIast || section.yoginiType },
      sortKey: base + 1, store, resultKey: seqs.yogini,
    },
  ]
})

const ALL_STATIC_ROWS = [...DEITY_ROWS, ...EXTRA_ROWS]
  .sort((a, b) => a.sortKey - b.sortKey)

// ── Store keys ────────────────────────────────────────────────────────────────

const HISTORY_STORES = [
  'nyasa', 'inner', 'gurava', 'bhupura',
  'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9',
  'nc', 'closing',
]

// ── Shared colgroup (header + body tables must use identical widths) ──────────

function SharedColgroup() {
  return (
    <colgroup>
      <col style={{ width: '2rem' }} />
      <col />
      <col style={{ width: '8rem' }} />
      <col style={{ width: '3rem' }} />
    </colgroup>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
// Parent (App.jsx) renders this inside:
//   <div className="flex-1 min-h-0 w-full max-w-lg flex flex-col">
// That gives a real defined height, so h-full works.
// The frozen header is flex-shrink-0; the table body is flex-1 overflow-y-auto.
// No sticky positioning needed — internal scroll handles everything.

export default function MemoMapView({ allResults, script = 'iast' }) {
  const [sectionFilter, setSectionFilter] = useState('all')
  const [statusFilter,  setStatusFilter]  = useState('all')

  const allHistory = Object.fromEntries(
    HISTORY_STORES.map(k => [k, loadMemoHistory(k)])
  )

  const rows = ALL_STATIC_ROWS.map(row => ({
    ...row,
    status: row.rowType === 'deity'
      ? getDeityStatus(row.deity, allHistory)
      : statusFromHistory(row.store, row.resultKey, allHistory),
  }))

  const totalCount        = rows.length
  const memorisedCount    = rows.filter(r => r.status === 'memorised').length
  const partialCount      = rows.filter(r => r.status === 'partial').length
  const notMemoisedCount  = rows.filter(r => r.status === 'notMemorised').length
  const notAttemptedCount = totalCount - memorisedCount - partialCount - notMemoisedCount

  const filtered = rows.filter(({ sectionId, rowType, status }) => {
    if (sectionFilter !== 'all') {
      let match = false
      if      (sectionFilter === 'gurava')         match = GURU_IDS.has(sectionId)
      else if (sectionFilter === 'chakra-svamini') match = rowType === 'svamini'
      else if (sectionFilter === 'yogini')         match = rowType === 'yogini'
      else                                         match = sectionId === sectionFilter
      if (!match) return false
    }
    if (statusFilter !== 'all' && status !== statusFilter) return false
    return true
  })

  const handleClearAll = () => {
    if (!window.confirm('Clear all memo results and history? This cannot be undone.')) return
    HISTORY_STORES.forEach(k => saveMemoStorage(k, {}))
    window.location.reload()
  }

  const memorisedPct   = totalCount > 0 ? (memorisedCount   / totalCount) * 100 : 0
  const partialPct     = totalCount > 0 ? (partialCount     / totalCount) * 100 : 0
  const notMemoisedPct = totalCount > 0 ? (notMemoisedCount / totalCount) * 100 : 0

  return (
    // h-full fills the flex-1 min-h-0 wrapper in App.jsx
    <div className="h-full flex flex-col px-4">

      {/* ── Frozen top section (never scrolls) ── */}
      <div className="flex-shrink-0 pt-6 pb-3 space-y-3">

        {/* Title + key + clear */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-cream text-sm font-medium">Memo Map</h1>
            <div className="space-y-0.5 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-red-400 w-3 flex-shrink-0">✓</span>
                <span className="text-muted w-5 flex-shrink-0">{memorisedCount}</span>
                <span className="text-muted">correct on last 3 attempts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gold-500 w-3 flex-shrink-0">~</span>
                <span className="text-muted w-5 flex-shrink-0">{partialCount}</span>
                <span className="text-muted">correct on &lt; last 3 attempts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-3 flex-shrink-0">✗</span>
                <span className="text-muted w-5 flex-shrink-0">{notMemoisedCount}</span>
                <span className="text-muted">none of last 3 correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-surface-500 w-3 flex-shrink-0">—</span>
                <span className="text-muted w-5 flex-shrink-0">{notAttemptedCount}</span>
                <span className="text-muted">not attempted</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearAll}
            className="text-xs text-surface-500 hover:text-red-400 border border-surface-700 hover:border-red-900/60 rounded px-2 py-1 transition-colors flex-shrink-0"
          >
            Clear all
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-surface-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-red-500 transition-all duration-300"   style={{ width: `${memorisedPct}%`   }} />
          <div className="h-full bg-gold-600 transition-all duration-300"  style={{ width: `${partialPct}%`     }} />
          <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: `${notMemoisedPct}%` }} />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            className="flex-1 min-w-0 text-xs bg-surface-800 border border-surface-700 text-cream rounded-lg px-2 py-1.5 focus:outline-none focus:border-gold-700 transition-colors"
          >
            <option value="all">All sections</option>
            {FILTER_OPTIONS.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-surface-800 border border-surface-700 text-cream rounded-lg px-2 py-1.5 focus:outline-none focus:border-gold-700 transition-colors flex-shrink-0"
          >
            <option value="all">All</option>
            <option value="memorised">✓ Memorised</option>
            <option value="partial">~ Partially memorised</option>
            <option value="notMemorised">✗ Not memorised</option>
            <option value="notAttempted">— Not attempted</option>
          </select>
        </div>

        {/* Frozen table header row */}
        <div className="border border-surface-700 rounded-t-lg overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <SharedColgroup />
            <thead>
              <tr className="bg-surface-800">
                <th className="px-3 py-2 text-left text-muted font-normal">#</th>
                <th className="px-3 py-2 text-left text-muted font-normal">Name</th>
                <th className="px-3 py-2 text-left text-muted font-normal">Section</th>
                <th className="px-3 py-2 text-right text-muted font-normal">Status</th>
              </tr>
            </thead>
          </table>
        </div>

      </div>{/* end frozen */}

      {/* ── Scrollable table body ── */}
      <div className="flex-1 overflow-y-auto -mt-px pb-4">
        <div className="border-x border-b border-surface-700 rounded-b-lg overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <SharedColgroup />
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted italic">
                    No entries match
                  </td>
                </tr>
              ) : filtered.map(row => {
                const { symbol, className } = STATUS_DISPLAY[row.status]
                const isExtra = row.rowType !== 'deity'
                return (
                  <tr
                    key={row.rowKey}
                    className={`border-b border-surface-700/40 hover:bg-surface-800/50 transition-colors last:border-b-0${isExtra ? ' bg-surface-900/30' : ''}`}
                  >
                    <td className="px-3 py-2 text-muted font-mono tabular-nums">
                      {row.seqNum ?? ''}
                    </td>
                    <td className={`px-3 py-2 text-sm leading-snug${isExtra ? ' text-gold-600 italic' : ' text-gold-400'}${script === 'iast' ? ' iast' : ''}`}>
                      {displayName({ scripts: row.scripts }, script)}
                    </td>
                    <td className="px-3 py-2 text-muted truncate">
                      {SECTION_COL_LABEL[row.sectionId]}
                    </td>
                    <td className={`px-3 py-2 text-right ${className}`}>
                      {symbol}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <p className="text-muted text-xs text-center mt-3">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            {sectionFilter !== 'all' || statusFilter !== 'all' ? ' (filtered)' : ''}
          </p>
        )}
      </div>

    </div>
  )
}
