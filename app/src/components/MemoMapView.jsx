import { useState } from 'react'
import data from '../data/khadgamala-canonical.json'
import { saveMemoStorage, loadMemoHistory, displayName } from '../utils.js'
import MemoMapVisuals from './MemoMapVisuals'

const { deities, sections } = data

// ── Section column labels ─────────────────────────────────────────────────────

function buildSectionColLabel(tr) {
  return {
    nyasa:          tr('sec.nyasa'),
    nitya:          tr('sec.inner'),
    'guru-divya':   tr('sec.gurava'),
    'guru-siddha':  tr('sec.gurava'),
    'guru-manava':  tr('sec.gurava'),
    'circuit-1':    tr('av.1'),
    'circuit-2':    tr('av.2'),
    'circuit-3':    tr('av.3'),
    'circuit-4':    tr('av.4'),
    'circuit-5':    tr('av.5'),
    'circuit-6':    tr('av.6'),
    'circuit-7':    tr('av.7'),
    'circuit-8':    tr('av.8'),
    'circuit-9':    tr('av.9'),
    chakreshvari:   tr('sec.nc'),
    closing:        tr('sec.closing'),
  }
}

const SECTION_COL_LABEL_EN = {
  nyasa:          'Nyasanga',
  nitya:          'Tithi Nitya',
  'guru-divya':   'Gurus',
  'guru-siddha':  'Gurus',
  'guru-manava':  'Gurus',
  'circuit-1':    '1st Enclosure',
  'circuit-2':    '2nd Enclosure',
  'circuit-3':    '3rd Enclosure',
  'circuit-4':    '4th Enclosure',
  'circuit-5':    '5th Enclosure',
  'circuit-6':    '6th Enclosure',
  'circuit-7':    '7th Enclosure',
  'circuit-8':    '8th Enclosure',
  'circuit-9':    '9th Enclosure',
  chakreshvari:   'Nava Chakreshvari',
  closing:        'Sridevi Epithets',
}

const STOTRA_SECTION_IDS = new Set(Object.keys(SECTION_COL_LABEL))
const GURU_IDS = new Set(['guru-divya', 'guru-siddha', 'guru-manava'])

// ── Filter dropdown options ───────────────────────────────────────────────────

function buildFilterOptions(tr, script) {
  const l = (iast, en) => script === 'english' ? (en || iast) : iast
  return [
    { id: 'nyasa',          label: tr('sec.nyasa')    },
    { id: 'nitya',          label: tr('sec.inner')    },
    { id: 'gurava',         label: tr('sec.gurava')   },
    { id: 'circuit-1',      label: tr('av.1')         },
    { id: 'circuit-2',      label: tr('av.2')         },
    { id: 'circuit-3',      label: tr('av.3')         },
    { id: 'circuit-4',      label: tr('av.4')         },
    { id: 'circuit-5',      label: tr('av.5')         },
    { id: 'circuit-6',      label: tr('av.6')         },
    { id: 'circuit-7',      label: tr('av.7')         },
    { id: 'circuit-8',      label: tr('av.8')         },
    { id: 'circuit-9',      label: tr('av.9')         },
    { id: 'chakreshvari',   label: tr('sec.nc')       },
    { id: 'closing',        label: tr('sec.closing')  },
    { id: 'chakra-svamini', label: l('Cakra Svāminī', 'Chakra Swamini') },
    { id: 'yogini',         label: l('Yoginī', 'Yogini')                },
  ]
}

// ── Circuit store and extra-row seq numbers ───────────────────────────────────

const CIRCUIT_STORE = {
  'circuit-1': 'bhupura', 'circuit-2': 'c2', 'circuit-3': 'c3',
  'circuit-4': 'c4',      'circuit-5': 'c5', 'circuit-6': 'c6',
  'circuit-7': 'c7',      'circuit-8': 'c8', 'circuit-9': 'c9',
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
  memorised:    { symbol: '✓', className: 'text-green-400 font-semibold' },
  partial:      { symbol: '~', className: 'text-amber-400 font-semibold' },
  notMemorised: { symbol: '✗', className: 'text-red-400 font-semibold'   },
  notAttempted: { symbol: '—', className: 'text-surface-600'             },
}

// ── Build combined row list ───────────────────────────────────────────────────

const DEITY_ROWS = deities
  .filter(d => STOTRA_SECTION_IDS.has(d.sectionId))
  .sort((a, b) => a.sequenceInChant - b.sequenceInChant)
  .map(d => ({
    rowType: 'deity', rowKey: d.id, sectionId: d.sectionId,
    seqNum: d.sequenceInChant - 1, scripts: d.scripts, deity: d,
    sortKey: d.sequenceInChant, store: null, resultKey: null,
  }))


const ALL_STATIC_ROWS = [...DEITY_ROWS]
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

export default function MemoMapView({ allResults, script = 'iast', tr = k => k }) {
  const [view,          setView]          = useState('maps')   // 'maps' | 'list'
  const [sectionFilter, setSectionFilter] = useState('all')
  const [statusFilter,  setStatusFilter]  = useState('all')

  const SECTION_COL_LABEL = buildSectionColLabel(tr)
  const FILTER_OPTIONS    = buildFilterOptions(tr, script)

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
    if (!window.confirm(tr('map.clear_confirm'))) return
    HISTORY_STORES.forEach(k => saveMemoStorage(k, {}, { clearHistory: true }))
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
            <h1 className="text-cream text-sm font-medium">{tr('map.title')}</h1>
            <div className="flex gap-1 mt-2">
              <button onClick={() => setView('maps')}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${view === 'maps' ? 'bg-gold-900/40 text-gold-400 border-gold-700/40' : 'text-muted border-transparent hover:text-cream'}`}>
                {tr('map.maps')}
              </button>
              <button onClick={() => setView('list')}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${view === 'list' ? 'bg-gold-900/40 text-gold-400 border-gold-700/40' : 'text-muted border-transparent hover:text-cream'}`}>
                {tr('map.list')}
              </button>
            </div>
            {view === 'list' && (
            <div className="space-y-0.5 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-green-400 w-3 flex-shrink-0">✓</span>
                <span className="text-muted w-5 flex-shrink-0">{memorisedCount}</span>
                <span className="text-muted">{tr('map.correct_last3')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 w-3 flex-shrink-0">~</span>
                <span className="text-muted w-5 flex-shrink-0">{partialCount}</span>
                <span className="text-muted">{tr('map.correct_partial')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 w-3 flex-shrink-0">✗</span>
                <span className="text-muted w-5 flex-shrink-0">{notMemoisedCount}</span>
                <span className="text-muted">{tr('map.none_correct')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-surface-500 w-3 flex-shrink-0">—</span>
                <span className="text-muted w-5 flex-shrink-0">{notAttemptedCount}</span>
                <span className="text-muted">{tr('map.not_tried')}</span>
              </div>
            </div>
            )}
          </div>
          <button
            onClick={handleClearAll}
            className="text-xs text-surface-500 hover:text-red-400 border border-surface-700 hover:border-red-900/60 rounded px-2 py-1 transition-colors flex-shrink-0"
          >
            {tr('map.clear_all')}
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-end mb-0.5">
            <span className="text-[10px] font-mono text-surface-500">{tr('map.progress')}</span>
          </div>
          <div className="h-1 bg-surface-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-400 transition-all duration-300"  style={{ width: `${memorisedPct}%`   }} />
            <div className="h-full bg-amber-400 transition-all duration-300"  style={{ width: `${partialPct}%`     }} />
            <div className="h-full bg-red-400   transition-all duration-300"  style={{ width: `${notMemoisedPct}%` }} />
          </div>
        </div>

        {/* Filters -- list mode only */}
        {view === 'list' && <div className="flex gap-2">
          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            className="flex-1 min-w-0 text-xs bg-surface-800 border border-surface-700 text-cream rounded-lg px-2 py-1.5 focus:outline-none focus:border-gold-700 transition-colors"
          >
            <option value="all">{tr('map.all_sections')}</option>
            {FILTER_OPTIONS.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-surface-800 border border-surface-700 text-cream rounded-lg px-2 py-1.5 focus:outline-none focus:border-gold-700 transition-colors flex-shrink-0"
          >
            <option value="all">{tr('misc.all')}</option>
            <option value="memorised">{tr('map.memorised')}</option>
            <option value="partial">{tr('map.partial')}</option>
            <option value="notMemorised">{tr('map.not_memorised')}</option>
            <option value="notAttempted">{tr('map.not_attempted')}</option>
          </select>
        </div>}

        {/* Frozen table header row -- list mode only */}
        {view === 'list' && <div className="border border-surface-700 rounded-t-lg overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <SharedColgroup />
            <thead>
              <tr className="bg-surface-800">
                <th className="px-3 py-2 text-left text-muted font-normal">{tr('map.col_num')}</th>
                <th className="px-3 py-2 text-left text-muted font-normal">{tr('map.col_name')}</th>
                <th className="px-3 py-2 text-left text-muted font-normal">{tr('map.col_section')}</th>
                <th className="px-3 py-2 text-right text-muted font-normal">{tr('map.col_status')}</th>
              </tr>
            </thead>
          </table>
        </div>}

      </div>{/* end frozen */}

      {/* -- Scrollable body -- */}
      <div className="flex-1 overflow-y-auto pb-4">

        {/* Maps view */}
        {view === 'maps' && (
          <MemoMapVisuals allHistory={allHistory} script={script} tr={tr} />
        )}

        {/* List view */}
        {view === 'list' && <>
        <div className="border-x border-b border-surface-700 rounded-b-lg overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <SharedColgroup />
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted italic">
                    {tr('map.no_entries')}
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
                    <td className="px-3 py-2 iast text-muted truncate text-[15px]">
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
        </d