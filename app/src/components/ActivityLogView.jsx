import { useState } from 'react'
import { loadSessionLog, clearSessionLog } from '../utils.js'

// ── Section label map (store key → display label) ─────────────────────────────

const SECTION_LABEL = {
  nyasa:   'Nyāsāṅga',
  inner:   'Tithi Nitya',
  gurava:  'Guravaḥ',
  bhupura: '1st Āvaraṇa',
  c2:      '2nd Āvaraṇa',
  c3:      '3rd Āvaraṇa',
  c4:      '4th Āvaraṇa',
  c5:      '5th Āvaraṇa',
  c6:      '6th Āvaraṇa',
  c7:      '7th Āvaraṇa',
  c8:      '8th Āvaraṇa',
  c9:      '9th Āvaraṇa',
  nc:      'Nava Chakreshvarī',
  closing: 'Śrīdevī Epithets',
}

// ── Date / time helpers ───────────────────────────────────────────────────────

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

// ── Shared colgroup ───────────────────────────────────────────────────────────

function Cols() {
  return (
    <colgroup>
      <col style={{ width: '6rem' }} />
      <col style={{ width: '4.5rem' }} />
      <col />
      <col style={{ width: '4rem' }} />
    </colgroup>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityLogView() {
  // Load newest-first; re-read when cleared
  const [log, setLog] = useState(() => [...loadSessionLog()].reverse())

  const handleClear = () => {
    if (!window.confirm('Clear activity log? This cannot be undone.')) return
    clearSessionLog()
    setLog([])
  }

  return (
    <div className="h-full flex flex-col px-4">

      {/* ── Frozen header ── */}
      <div className="flex-shrink-0 pt-6 pb-3 space-y-3">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-cream text-sm font-medium">Activity Log</h1>
            <p className="text-muted text-xs mt-0.5">
              {log.length} {log.length === 1 ? 'session' : 'sessions'}
            </p>
          </div>
          {log.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-surface-500 hover:text-red-400 border border-surface-700 hover:border-red-900/60 rounded px-2 py-1 transition-colors flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Frozen column headers */}
        <div className="border border-surface-700 rounded-t-lg overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <Cols />
            <thead>
              <tr className="bg-surface-800">
                <th className="px-3 py-2 text-left text-muted font-normal">Date</th>
                <th className="px-3 py-2 text-left text-muted font-normal">Time</th>
                <th className="px-3 py-2 text-left text-muted font-normal">Section</th>
                <th className="px-3 py-2 text-right text-muted font-normal">Score</th>
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
              No sessions yet — complete a Memo round to start logging.
            </p>
          ) : (
            <table className="w-full table-fixed text-xs">
              <Cols />
              <tbody>
                {log.map((entry, i) => {
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
                      <td className="px-3 py-2 text-muted">{fmtDate(entry.ts)}</td>
                      <td className="px-3 py-2 text-muted">{fmtTime(entry.ts)}</td>
                      <td className="px-3 py-2 iast text-gold-400 truncate">
                        {SECTION_LABEL[entry.section] ?? entry.section}
                      </td>
                      <td className={`px-3 py-2 text-right font-mono ${scoreClass}`}>
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
