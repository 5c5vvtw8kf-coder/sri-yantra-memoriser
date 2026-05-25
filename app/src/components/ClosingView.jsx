/**
 * ClosingView.jsx
 *
 * Śrīdevī Viśēṣaṇāni — Namaskāra-navākṣarī ca
 *
 * Nine special epithets of Śrīdevī followed by the closing
 * triple Namaskāra salutation (namastē namastē namastē namaḥ).
 *
 * Supports Explore mode (tap-to-reveal cards) and Memorise mode
 * (active card highlighted, single-click = not yet, double-click = memorised).
 *
 * Deities:
 *   closing-001  mahāmahēśvarī              — Great Great Goddess
 *   closing-002  mahāmahārājñī              — Great Great Queen
 *   closing-003  mahāmahāśaktē              — Great Great Power
 *   closing-004  mahāmahāguptē              — Great Great Secret
 *   closing-005  mahāmahājñaptē             — Great Great Known One
 *   closing-006  mahāmahānandē              — Great Great Bliss
 *   closing-007  mahāmahāskandhē            — Great Great Trunk/Support
 *   closing-008  mahāmahāśayē               — Great Great Resting Place
 *   closing-009  mahāmahā śrīcakranagarasāmrājñī — Great Great Empress of the Śrī Chakra City
 *   closing-010  namastē namastē namastē namaḥ  — Namaskāra Navākṣarī
 */

import { useState, useRef } from 'react'
import data from '../data/khadgamala-canonical.json'

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data

const closingDeities = deities
  .filter(d => d.sectionId === 'closing')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

const TOTAL = closingDeities.length   // 10

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD = '#c9a84c'

// ── Helpers ───────────────────────────────────────────────────────────────────

function displayName(deity, script) {
  if (!deity) return ''
  const s = deity.scripts
  if (script === 'devanagari') return s.devanagari || s.iast
  if (script === 'english')    return s.english    || s.iast
  return s.iast
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EpithetCard({ deity, script, revealed, onToggle }) {
  const primary   = displayName(deity, script)
  const isDevPrim = script === 'devanagari'

  return (
    <button
      onClick={onToggle}
      className="w-full text-left px-4 py-3 rounded-lg border border-surface-700 bg-surface-900 hover:border-gold-700 active:border-gold-500 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-mono text-gold-700 flex-shrink-0">
              #{deity.sequenceInChant}
            </span>
            {revealed ? (
              <span className={`${isDevPrim ? '' : 'iast'} text-gold-400 text-base leading-snug`}>
                {primary}
              </span>
            ) : (
              <span className="text-muted text-base leading-snug tracking-widest">· · ·</span>
            )}
          </div>
          {revealed && script !== 'iast' && deity.scripts.iast && (
            <p className="iast text-gold-600 text-xs mt-0.5 ml-8">{deity.scripts.iast}</p>
          )}
          {revealed && deity.scripts.translation && (
            <p className="text-muted text-xs italic mt-1 ml-8">{deity.scripts.translation}</p>
          )}
        </div>
        <span className="text-muted text-lg leading-none flex-shrink-0 mt-0.5 select-none">
          {revealed ? '−' : '+'}
        </span>
      </div>
    </button>
  )
}

function NamaskaraCard({ deity, script, revealed, onToggle }) {
  const primary   = displayName(deity, script)
  const isDevPrim = script === 'devanagari'

  return (
    <button
      onClick={onToggle}
      className="w-full text-left px-5 py-4 rounded-xl border-2 bg-surface-900 transition-colors"
      style={{ borderColor: revealed ? GOLD : 'rgba(201,168,76,0.35)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono text-gold-700 uppercase tracking-widest mb-1">
            Namaskāra Navākṣarī · #{deity.sequenceInChant}
          </p>
          {revealed ? (
            <>
              <p className={`${isDevPrim ? '' : 'iast'} text-gold-300 text-lg font-medium leading-snug`}>
                {primary}
              </p>
              {script !== 'iast' && deity.scripts.iast && (
                <p className="iast text-gold-600 text-sm mt-0.5">{deity.scripts.iast}</p>
              )}
              {deity.scripts.translation && (
                <p className="text-muted text-xs italic mt-1">{deity.scripts.translation}</p>
              )}
            </>
          ) : (
            <p className="text-muted text-lg tracking-widest">· · · · · · · · ·</p>
          )}
        </div>
        <span className="text-muted text-xl leading-none flex-shrink-0 mt-1 select-none">
          {revealed ? '−' : '+'}
        </span>
      </div>
    </button>
  )
}

// ── Memorise card ─────────────────────────────────────────────────────────────

function MemoriseCard({ deity, script, seq, isActive, isPast, isCorrect, isFuture, onSingleClick, onDoubleClick, onContextMenu }) {
  const primary   = displayName(deity, script)
  const isDevPrim = script === 'devanagari'
  const isNamaskara = deity.sequenceInSection === 10

  let borderColor, bgColor, textOpacity
  if (isActive)        { borderColor = 'rgba(255,248,200,0.7)'; bgColor = 'rgba(255,248,200,0.07)'; textOpacity = 1 }
  else if (isCorrect)  { borderColor = 'rgba(192,57,43,0.5)';   bgColor = 'rgba(192,57,43,0.05)';  textOpacity = 0.75 }
  else if (isPast)     { borderColor = 'rgba(201,168,76,0.3)';  bgColor = 'transparent';            textOpacity = 0.55 }
  else                 { borderColor = 'rgba(100,90,70,0.2)';   bgColor = 'transparent';            textOpacity = 0.25 }

  return (
    <button
      onClick={onSingleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      disabled={isFuture}
      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${isNamaskara ? 'border-2 px-5 py-4 rounded-xl' : ''}`}
      style={{ borderColor, background: bgColor, opacity: isFuture ? 0.35 : 1, cursor: isFuture ? 'default' : 'pointer' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1" style={{ opacity: textOpacity }}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-mono text-gold-700 flex-shrink-0">
              {isNamaskara ? 'Namaskāra · ' : ''} #{deity.sequenceInChant}
            </span>
            {(isActive || isPast) ? (
              <span className={`${isDevPrim ? '' : 'iast'} ${isActive ? 'text-gold-200' : 'text-gold-400'} ${isNamaskara ? 'text-lg font-medium' : 'text-base'} leading-snug`}>
                {primary}
              </span>
            ) : (
              <span className="text-muted text-base leading-snug tracking-widest">· · ·</span>
            )}
          </div>
          {(isActive || isPast) && script !== 'iast' && deity.scripts.iast && (
            <p className="iast text-gold-600 text-xs mt-0.5 ml-8">{deity.scripts.iast}</p>
          )}
        </div>
        {isActive && (
          <span className="text-gold-500 text-xs flex-shrink-0 mt-1 font-mono">{seq}/{TOTAL}</span>
        )}
        {isPast && (
          <span className="flex-shrink-0 mt-1" style={{ color: isCorrect ? '#c0392b' : '#c9a84c', fontSize: '12px' }}>
            {isCorrect ? '✓' : '·'}
          </span>
        )}
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClosingView({
  script = 'iast',
  onDeitySelect = () => {},
  memorise = false,
  currentSeq = 1,
  results = {},
  onStartMemorise,
  onExitMemorise,
  onMarkResult,
  onToggleResult,
  flash = false,
  onNavigate,
}) {
  // Explore mode state
  const [revealed, setRevealed] = useState(new Set())
  const [contextMenu, setContextMenu] = useState(null)
  const clickTimer = useRef(null)

  const toggle = (id) => {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        onDeitySelect(null)
      } else {
        next.add(id)
        const deity = closingDeities.find(d => d.id === id)
        onDeitySelect(deity ?? null)
      }
      return next
    })
  }

  const allRevealed = closingDeities.every(d => revealed.has(d.id))

  const toggleAll = () => {
    if (allRevealed) {
      setRevealed(new Set())
      onDeitySelect(null)
    } else {
      setRevealed(new Set(closingDeities.map(d => d.id)))
    }
  }

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = (seq) => {
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (currentSeq === seq) onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleMemDblClick = (seq) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === seq) onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const done = memorise && currentSeq > TOTAL

  // ── Render ─────────────────────────────────────────────────────────────────

  // ── Memorise mode ──────────────────────────────────────────────────────────
  if (memorise) {
    return (
      <div className="w-full p-4">

        {/* Context menu */}
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <div className="fixed z-50 bg-surface-800 border border-surface-600 rounded-lg shadow-xl py-1"
                 style={{ left: contextMenu.x, top: contextMenu.y }}>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-cream hover:bg-surface-700 transition-colors"
                onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}>
                {results[contextMenu.seq] === 'correct' ? 'Mark as not memorised' : 'Mark as memorised'}
              </button>
            </div>
          </>
        )}

        {/* Section header */}
        <div className="mb-4">
          <p className="iast text-gold-600 text-xs">śrīdevī viśēṣaṇāni</p>
          {!done && (
            <p className="text-muted mt-0.5 text-xs italic" style={{ fontFamily: 'serif' }}>
              double-tap = memorised · single-tap = not yet
            </p>
          )}
        </div>

        {/* Cards */}
        <div className="space-y-2 mb-6">
          {closingDeities.map((deity) => {
            const seq       = deity.sequenceInSection
            const isActive  = currentSeq === seq
            const isPast    = currentSeq > seq
            const isFuture  = !isActive && !isPast
            const isCorrect = results[seq] === 'correct'

            return (
              <MemoriseCard
                key={deity.id}
                deity={deity}
                script={script}
                seq={seq}
                isActive={isActive}
                isPast={isPast}
                isCorrect={isCorrect}
                isFuture={isFuture}
                onSingleClick={!done && (isActive || isPast) ? () => handleMemClick(seq) : undefined}
                onDoubleClick={!done && (isActive || isPast) ? () => handleMemDblClick(seq) : undefined}
                onContextMenu={!done && isPast ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) } : undefined}
              />
            )
          })}
        </div>

        {/* Completion panel */}
        {done && (
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-xl text-center space-y-3 mt-2">
            <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">khadgamālā sampūrṇā</p>
            <p className="text-cream text-base font-medium">
              {Object.values(results).filter(v => v === 'correct').length === TOTAL
                ? 'Stotra complete — well done!'
                : 'Round complete.'}
            </p>
            <p className="text-muted text-xs">
              {Object.values(results).filter(v => v === 'correct').length}/{TOTAL} memorised
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button onClick={onStartMemorise}
                className="w-full py-2 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                Try again
              </button>
              <button onClick={() => onNavigate && onNavigate('nyasa')}
                className="w-full py-2 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                Start from beginning
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="iast text-gold-600 text-xs">śrīdevī viśēṣaṇāni — namaskāra-navākṣarī ca</p>
        </div>

        <div className="h-8" />
      </div>
    )
  }

  // ── Explore mode ───────────────────────────────────────────────────────────
  const visesanani = closingDeities.filter(d => d.sequenceInSection <= 9)
  const namaskara  = closingDeities.find(d => d.sequenceInSection === 10)

  return (
    <div className="w-full p-4">

      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="iast text-gold-600 text-xs">śrīdevī viśēṣaṇāni</p>
          <p className="text-muted mt-0.5" style={{ fontSize: '10px' }}>
            Nine epithets of the Goddess — chanted after the Nava Chakreshvarī
          </p>
        </div>
        <button
          onClick={toggleAll}
          className="text-xs text-muted hover:text-cream transition-colors px-2 py-1 rounded border border-surface-700 hover:border-surface-500"
        >
          {allRevealed ? 'Hide all' : 'Reveal all'}
        </button>
      </div>

      {/* Viśeṣaṇāni cards */}
      <div className="space-y-2 mb-6">
        {visesanani.map(deity => (
          <EpithetCard
            key={deity.id}
            deity={deity}
            script={script}
            revealed={revealed.has(deity.id)}
            onToggle={() => toggle(deity.id)}
          />
        ))}
      </div>

      {/* Divider with label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 border-t border-surface-700" />
        <span className="iast text-gold-700 text-xs flex-shrink-0">namaskāranavākṣarī ca</span>
        <div className="flex-1 border-t border-surface-700" />
      </div>

      {/* Namaskāra card */}
      {namaskara && (
        <NamaskaraCard
          deity={namaskara}
          script={script}
          revealed={revealed.has(namaskara.id)}
          onToggle={() => toggle(namaskara.id)}
        />
      )}

      {/* Caption */}
      <div className="mt-6 text-center">
        <p className="iast text-gold-600 text-xs">śrīdevī viśēṣaṇāni — namaskāra-navākṣarī ca</p>
        <p className="text-muted mt-1" style={{ fontSize: '10px' }}>
          Tap each card to reveal · tap again to conceal
        </p>
      </div>

      <div className="h-8" />
    </div>
  )
}
