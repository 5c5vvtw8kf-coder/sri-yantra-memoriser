/**
 * MobileSvaminiButtons.jsx — v2 two-step reveal
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

// ── Shared mobile memorise instruction strip ──────────────────────────────────

export function MobileMemoriseInstr({ tr = k => k }) {
  return (
    <div className="md:hidden flex flex-col items-center gap-0.5 pt-1 pb-0.5"
         style={{ fontSize: '11px', fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(201,168,76,0.55)', letterSpacing: '0.02em' }}>
      <span>{tr('instr.tap_reveal')} · <span style={{ color: '#f87171' }}>{tr('instr.tap_again_correct')}</span></span>
      <span><span style={{ color: '#c9a84c' }}>{tr('instr.dbltap_wrong')}</span> · <span style={{ color: '#c9a84c' }}>{tr('instr.dbltap_toggle')}</span></span>
    </div>
  )
}

// ── Name helper ───────────────────────────────────────────────────────────────

function getName(section, field, script) {
  if (!section) return ''
  const iastKey = field + 'Iast'
  const devKey  = field + 'Devanagari'
  if (script === 'english')    return section[field] || section[iastKey] || ''
  if (script === 'devanagari') return section[devKey] || section[iastKey] || section[field] || ''
  return section[iastKey] || section[field] || ''
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MobileSvaminiButtons({
  section        = null,
  script         = 'iast',
  tr             = k => k,
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
  const [hideDelayed,     setHideDelayed]     = useState(false)

  const svaminiTapRef = useRef({ time: 0 })
  const yoginiTapRef  = useRef({ time: 0 })
  const svaminiTimer  = useRef(null)
  const yoginiTimer   = useRef(null)
  const hideTimer     = useRef(null)

  // Reset revealed state whenever the active seq changes
  useEffect(() => {
    setRevealedSvamini(false)
    setRevealedYogini(false)
  }, [currentSeq])

  // Keep visible after yogini is answered so the user can toggle before completion overlay
  useEffect(() => {
    if (memorise && currentSeq > yoginiSeq) {
      setHideDelayed(false)
      hideTimer.current = setTimeout(() => setHideDelayed(true), 5000)
      return () => clearTimeout(hideTimer.current)
    } else {
      setHideDelayed(false)
      clearTimeout(hideTimer.current)
    }
  }, [memorise, currentSeq, yoginiSeq])

  const svaminiName = getName(section, 'chakraSvamini', script)
  const yoginiName  = getName(section, 'yoginiType', script)

  // ── Visibility ─────────────────────────────────────────────────────────────

  if (memorise && currentSeq < svaminiSeq)  return null   // dots phase — not time yet
  if (memorise && currentSeq > yoginiSeq && hideDelayed) return null   // done — completion panel handles

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
      if (!revealed) {
        // First tap: reveal only
        setRevealed(true)
        tapRef.current.time = Date.now()
        return
      }
      // Already revealed: second tap = correct, double-tap = wrong
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
      // Past: double-tap toggles; single tap does nothing
      const now      = Date.now()
      const isDouble = (now - tapRef.current.time) < 300
      tapRef.current.time = now
      if (isDouble) {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        onToggleResult(seq)
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
        : <span className="text-gold-600/60 italic text-sm">{tr('instr.tap_reveal')}</span>
    }
    if (isActive && !revealed) {
      return <span className="text-gold-300 italic text-sm">{tr('instr.tap_reveal')}</span>
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
    if (isLocked) return 'border-surface-700/30 bg-surface-900/40 opacity-40 cursor-default'
    if (isActive) return 'border-gold-600/50 bg-gold-900/20'
    if (isPast)   return 'border-surface-700/40 bg-surface-800/40'   // text colour only distinguishes correct/wrong
    return 'border-surface-600/40 bg-surface-800/40 hover:border-gold-700/40 hover:bg-surface-700/40'
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const isIndic = !['iast', 'english'].includes(script)
  const labelClass = isIndic
    ? 'text-sm text-muted font-medium shrink-0'
    : 'text-[11px] uppercase tracking-widest text-muted font-medium shrink-0'

  return (
    <div className="md:hidden mt-2 flex flex-col gap-1.5 px-0">

      {/* Svāminī */}
      <button
        className={[
          'w-full rounded-lg border px-3 py-2 text-left transition-colors',
          buttonStyle(svaminiActive, svaminiPast, svaminiCorrect, false),
        ].join(' ')}
        style={svaminiActive ? { boxShadow: '0 0 0 1px rgba(255,248,200,0.25)' } : undefined}
        onClick={handleSvaminiClick}
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <span className={labelClass}>{tr('sc.svamini')}</span>
          <span className="text-sm leading-snug min-w-0">
            {renderNameContent(svaminiActive, svaminiPast, svaminiCorrect, false,
                               revealedSvamini, svaminiName)}
          </span>
        </div>
      </button>

      {/* Yoginī */}
      <button
        className={[
          'w-full rounded-lg border px-3 py-2 text-left transition-colors',
          buttonStyle(yoginiActive, yoginiPast, yoginiCorrect, yoginiLocked),
        ].join(' ')}
        style={yoginiActive ? { boxShadow: '0 0 0 1px rgba(255,248,200,0.25)' } : undefined}
        onClick={handleYoginiClick}
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <span className={labelClass}>{tr('sc.yogini_lbl')}</span>
          <span className="text-sm leading-snug min-w-0">
            {renderNameContent(yoginiActive, yoginiPast, yoginiCorrect, yoginiLocked,
                               revealedYogini, yoginiName)
}
          </span>
        </div>
      </button>

    </div>
  )
}
