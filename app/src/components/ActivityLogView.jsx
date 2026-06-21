import { useState } from 'react'
import { loadSessionLog, clearSessionLog } from '../utils.js'
import { iastToEnglish } from '../translations.js'

// ── Section label map (store key → display label) ─────────────────────────────

const SECTION_LABEL = {
  nyasa:       'Nyāsāṅga',
  inner:       'Tithi Nitya',
  gurava:      'Guravaḥ',
  bhupura:     '1st Āvaraṇa',
  c2:          '2nd Āvaraṇa',
  c3:          '3rd Āvaraṇa',
  c4:          '4th Āvaraṇa',
  c5:          '5th Āvaraṇa',
  c6:          '6th Āvaraṇa',
  c7:          '7th Āvaraṇa',
  c8:          '8th Āvaraṇa',
  c9:          '9th Āvaraṇa',
  nc:          'Nava Chakreshvarī',
  closing:     'Śrīdevī Epithets',
  'spot-check': 'Spot Check',
}

// ── Date / time helpers ───────────────────────────────────────────────────────

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ── Shared colgroup ───────────────────────────────────────────────────────────

function Cols() {
  return (
    <colgroup>
      <col style={{ width: '6.5rem' }} />
      <col style={{ width: '3rem' }} />
      <col />
      <col style={{ width: '4rem' }} />
    </colgroup>
  )
}

const SPOT_FILTER_LABEL = {
  'all':          'All',
  'nyasa':        'Nyāsa',
  'nitya':        'Nitya',
  'guravah':      'Guruvah',
  'circuit-1':    '1st Āvaraṇa',
  'circuit-2':    '2nd Āvaraṇa',
  'circuit-3':    '3rd Āvaraṇa',
  'circuit-4':    '4th Āvaraṇa',
  'circuit-5':    '5th Āvaraṇa',
  'circuit-6':    '6th Āvaraṇa',
  'circuit-7':    '7th Āvaraṇa',
  'c8-c9':        '8th & 9th',
  'nava-cakra':   'Cakra',
  'chakreshvari': 'Tripurā',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityLogView({ tr = k => k, script = 'iast' }) {
  // Load newest-first; re-read when cleared
  const [log, setLog] = useState(() => [...loadSessionLog()].reverse())
  const [sectionFilter, setSectionFilter] = useState('all')

  // Script-aware label helpers
  const label = str => script === 'english' ? iastToEnglish(str) : str
  const sectionLabel = key => label(SECTION_LABEL[key] ?? key)
  const spotLabel    = key => label(SPOT_FILTER_LABEL[key] ?? key)
  const [dateSearch,    setDateSearch]    = useState('')

  const handleClear = () => {
    if (!window.confirm(tr('log.clear_confirm'))) return
    clearSessionLog()
    setLog([])
  }

  const filtered = log.filter(entry => {
    if (sectionFilter !== 'all' && entry.section !== sectionFilter) return false
    if (dateSearch.trim()) {
      const dateStr = fmtDate(entry.ts).toLowerCase()
      if (!dateStr.includes(dateSearch.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="h-full flex flex-col px-4">

      {/* ── Frozen header ── */}
      <div className="flex-shrink-0 pt-6 pb-3 space-y-3">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-cream text-sm font-medium">{tr('log.title')}</h1>
            <p className="text-muted text-xs mt-0.5">
              {filtered.length}{filtered.length !== log.length ? ` of ${log.length}` : ''} {log.length === 1 ? tr('log.session') : tr('log.sessions')}
            </p>
            <div className="flex gap-3 mt-1.5 text-[11px] font-mono">
              <span className="text-red-400">100%</span>
              <span className="text-gold-500">≥ 75%</span>
              <span className="text-muted">&lt; 75%</span>
            </div>
          </div>
          {log.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-surface-500 hover:text-red-400 border border-surface-700 hover:border-red-900/60 rounded px-2 py-1 transition-colors flex-shrink-0"
            >
              {tr('log.clear')}
            </button>
          )}
        </div>

        {/* Filters */}
        {log.length > 0 && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search date…"
              value={dateSearch}
              onChange={e => setDateSearch(e.target.value)}
              className="w-28 flex-shrink-0 text-xs bg-surface-800 border border-surface-700 text-cream rounded-lg px-2 py-1.5 placeholder:text-surface-500 focus:outline-none focus:border-gold-700 transition-colors"
            />
            <select
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
              className="flex-1 min-w-0 text-xs bg-surface-800 border border-surface-700 text-cream rounded-lg px-2 py-1.5 focus:outline-none focus:border-gold-700 transition-colors"
            >
              <option value="all">{tr('log.all_sections')}</option>
              {Object.keys(SECTION_LABEL).map(id => (
                <option key={id} value={id}>{sectionLabel(id)}</option>
              ))}
            </select>
          </div>
        )}

        {/* Frozen column headers */}
        <div className="border border-surface-700 rounded-t-lg overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <Cols />
            <thead>
              <tr className="bg-surface-800">
                <th className="px-1 py-2 text-left text-muted font-normal">{tr('log.col_date')}</th>
                <th className="px-1 py-2 text-left text-muted font-normal">{tr('log.col_time')}</th>
                <th className="px-1 py-2 text-left text-muted font-normal">{tr('log.col_section')}</th>
                <th className="px-1 py-2 text-right text-muted font-normal">{tr('log.col_score')}</th>
              </tr>
            </thead>
          </table>
        </div>

      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto -mt-px pb-4">
        <div className="border-x border-b border-surface-700 rounded-b-lg overflow-hidden">
          {log.length === 0 ? (
            <p className="px-3 py-8 text-center text-muted italic text-xs">
              {tr('log.empty')}
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-muted italic text-xs">
              {tr('log.no_entries')}
            </p>
          ) : (
            <table className="w-full table-fixed text-xs">
              <Cols />
              <tbody>
                {filtered.map((entry, i) => {
                  const pct = entry.total > 0 ? entry.correct / entry.total : 0
                  const scoreClass = pct === 1
                    ? 'text-red-400'
                    : pct >= 0.75
                    ? 'text-gold-500'
                    : 'text-muted'
                  return (
                    <tr
                      key={i}
                      className="border-b border-surface-700/40 last:border-b-0 hover:bg-surface-800/50 transition-colors"
                    >
                      <td className="px-1 py-2 iast text-muted text-[15px]">{fmtDate(entry.ts)}</td>
                      <td className="px-1 py-2 iast text-muted text-[15px]">{fmtTime(entry.ts)}</td>
                      <td className="px-1 py-2 iast text-gold-400 truncate text-[15px]">
                        {sectionLabel(entry.section)}
                        {entry.section === 'spot-check' && entry.filter && entry.filter !== 'all' && (
                          <span> – {spotLabel(entry.filter)}</span>
                        )}
                      </td>
                      <td className={`px-1 py-2 iast text-right text-[15px] ${scoreClass}`}>
                        {entry.correct}/{entry.total}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
