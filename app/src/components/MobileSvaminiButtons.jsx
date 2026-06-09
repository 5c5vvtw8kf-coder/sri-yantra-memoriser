/**
 * MobileSvaminiButtons.jsx
 *
 * Mobile-only (md:hidden) Svāminī / Yoginī buttons displayed below the
 * yantra diagram in every circuit view.
 *
 * Explore mode  — always visible; tap reveals / hides the name (toggle).
 * Memorise mode — visible once currentSeq reaches svaminiSeq.
 *   Active button: tap-to-reveal → single tap = correct, double-tap = wrong.
 *   Past button:   shows name in result colour; double-tap toggles result.
 *   Pending button (yoginī while svāminī is active): locked / greyed out.
 */

import { useState, useRef, useEffect } from 'react'

// ── Name helper ───────────────────────────────────────────────────────────────

function getName(section, field, script) {
  if (!section) return ''
  const iastKey = field + 'Iast'
  if (script === 'english') return section[field] || section[iastKey] || ''
  return section[iastKey] || section[field] || ''
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MobileSvaminiButtons({
  section        = null,
  script         = 'iast',
  svaminiSeq,
  yoginiSeq,
  memorise       = false,
  currentSeq     = 1,
  results        = {},
  onMarkResult   = () => {},
  onToggleResult = () => {},
}) {
  const [revealedSvamini, setRevealedSvamini] = useState(false)
  const [revealedYogini,  setRevealedYogini]  = useState(false)

  const svaminiTapRef = useRef({ time: 0 })
  const yoginiTapRef  = useRef({ time: 0 })
  const svaminiTimer  = useRef(null)
  const yoginiTimer   = useRef(null)

  // Reset revealed state whenever the active seq changes
  useEffect(() => {
    setRevealedSvamini(false)
    setRevealedYogini(false)
  }, [currentSeq])

  const svaminiName = getName(section, 'chakraSvamini', script)
  const yoginiName  = getName(section, 'yoginiType', script)

  // ── Visibility ─────────────────────────────────────────────────────────────

  if (memorise && currentSeq < svaminiSeq)  return null   // dots phase — not time yet
  if (memorise && currentSeq > yoginiSeq)   return null   // done — completion panel handles

  // ── State flags ─────────────────────────────────────────────────────────────

  const svaminiActive  = memorise && currentSeq === svaminiSeq
  const yoginiActive   = memorise && currentSeq === yoginiSeq
  const svaminiPast    = memorise && currentSeq > svaminiSeq
  const yoginiPast     = memorise && currentSeq > yoginiSeq
  const svaminiCorrect = results[svaminiSeq] === 'correct'
  const yoginiCorrect  = results[yoginiSeq]  === 'correct'
  // Locked: yoginī button while svāminī is still active
  const yoginiLocked   = memorise && currentSeq === svaminiSeq

  // ── Click handlers ──────────────────────────────────────────────────────────

  const handleClick = (isActive, isPast, isCorrect, isLocked, revealed, setRevealed,
                       seq, tapRef, timerRef) => {
    if (isLocked) return

    if (!memorise) {
      // Explore mode: toggle reveal
      setRevealed(r => !r)
      return
    }

    if (isActive) {
      // Single tap = reveal + mark correct; double-tap = mark wrong
      setRevealed(true)
      const now      = Date.now()
      const isDouble = (now - tapRef.current.time) < 300
      tapRef.current.time = now
      if (isDouble) {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        onMarkResult(seq, 'wrong')
      } else {
        if (timerRef.current) return
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          onMarkResult(seq, 'correct')
        }, 280)
      }
    } else if (isPast) {
      // Past result — double-tap toggles
      const now      = Date.now()
      const isDouble = (now - tapRef.current.time) < 300
      tapRef.current.time = now
      if (isDouble) {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        if (isCorrect) onToggleResult(seq)
      } else {
        if (timerRef.current) return
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          if (!isCorrect) onToggleResult(seq)
        }, 280)
      }
    }
  }

  const handleSvaminiClick = () =>
    handleClick(svaminiActive, svaminiPast, svaminiCorrect, false,
                revealedSvamini, setRevealedSvamini,
                svaminiSeq, svaminiTapRef, svaminiTimer)

  const handleYoginiClick = () =>
    handleClick(yoginiActive, yoginiPast, yoginiCorrect, yoginiLocked,
                revealedYogini, setRevealedYogini,
                yoginiSeq, yoginiTapRef, yoginiTimer)

  // ── Label content ───────────────────────────────────────────────────────────

  const nameClass = script === 'iast' || script === 'devanagari' ? 'iast' : ''

  function renderNameContent(isActive, isPast, isCorrect, isLocked, revealed, name) {
    if (isLocked) {
      return <span className="text-surface-600 tracking-widest text-xs">···</span>
    }
    if (!memorise) {
      // Explore: toggle
      return revealed
        ? <span className={`${nameClass} text-gold-400`}>{name || '—'}</span>
        : <span className="text-gold-600/60 italic text-xs">tap to reveal</span>
    }
    if (isActive && !revealed) {
      return <span className="text-gold-300 italic text-xs">tap to reveal</span>
    }
    if (isActive && revealed) {
      return <span className={`${nameClass} text-gold-200`}>{name || '—'}</span>
    }
    if (isPast && isCorrect) {
      return <span className={`${nameClass} text-red-400`}>{name || '—'}</span>
    }
    if (isPast) {
      return <span className={`${nameClass} text-gold-600`}>{name || '—'}</span>
    }
    return <span className="text-surface-600 tracking-widest text-xs">···</span>
  }

  // ── Button styling ──────────────────────────────────────────────────────────

  function buttonStyle(isActive, isPast, isCorrect, isLocked) {
    if (isLocked)               return 'border-surface-700/30 bg-surface-900/40 opacity-40 cursor-default'
    if (isActive)               return 'border-gold-600/50 bg-gold-900/20'
    if (isPast && isCorrect)    return 'border-red-800/40 bg-red-900/15'
    if (isPast)                 return 'border-gold-800/25 bg-surface-800/50'
    // Explore default
    return 'border-surface-600/40 bg-surface-800/40 hover:border-gold-700/40 hover:bg-surface-700/40'
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="md:hidden mt-2 flex flex-col gap-1.5 px-0">

      {/* Svāminī */}
      <button
        className={[
          'w-full rounded-lg border px-3 py-1 text-left transition-colors',
          buttonStyle(svaminiActive, svaminiPast, svaminiCorrect, false),
        ].join(' ')}
        style={svaminiActive ? { boxShadow: '0 0 0 1px rgba(255,248,200,0.25)' } : undefined}
        onClick={handleSvaminiClick}
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[9px] uppercase tracking-widest text-muted font-medium shrink-0">Svāminī</span>
          <span className="text-xs leading-snug truncate">
            {renderNameContent(svaminiActive, svaminiPast, svaminiCorrect, false,
                               revealedSvamini, svaminiName)}
          </span>
        </div>
      </button>

      {/* Yoginī */}
      <button
        className={[
          'w-full rounded-lg border px-3 py-1 text-left transition-colors',
          buttonStyle(yoginiActive, yoginiPast, yoginiCorrect, yoginiLocked),
        ].join(' ')}
        style={yoginiActive ? { boxShadow: '0 0 0 1px rgba(255,248,200,0.25)' } : undefined}
        onClick={handleYoginiClick}
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[9px] uppercase tracking-widest text-muted font-medium shrink-0">Yoginī</span>
          <span className="text-xs leading-snug truncate">
            {renderNameContent(yoginiActive, yoginiPast, yoginiCorrect, yoginiLocked,
                               revealedYogini, yoginiName)}
          </span>
        </div>
      </button>

    </div>
  )
}
