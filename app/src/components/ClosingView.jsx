/**
 * ClosingView.jsx
 *
 * Śrīdevī Viśēṣaṇāni — Namaskāra-navākṣarī ca
 *
 * Nine special epithets of Śrīdevī followed by the closing
 * triple Namaskāra salutation (namastē namastē namastē namaḥ).
 *
 * Explore mode:
 *   Hover a number → whole yantra illuminates cream, bindu black.
 *   Click a number → sends deity to right panel.
 *
 * Memorise mode:
 *   All labels permanently visible to the right of their number.
 *   Single-click = not memorised (gold). Double-click = memorised (red).
 *   Yantra glows cream while drilling; turns red when all 10 memorised.
 *   Completion overlay appears on the yantra when done.
 *
 * Deities:
 *   closing-001  mahāmahēśvarī
 *   closing-002  mahāmahārājñī
 *   closing-003  mahāmahāśaktē
 *   closing-004  mahāmahāguptē
 *   closing-005  mahāmahājñaptē
 *   closing-006  mahāmahānandē
 *   closing-007  mahāmahāskandhē
 *   closing-008  mahāmahāśayē
 *   closing-009  mahāmahā śrīcakranagarasāmrājñī
 *   closing-010  namastē namastē namastē namaḥ
 */

import { useState, useRef, useEffect } from 'react'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import SriYantraSVG from './SriYantraSVG'
import { MobileMemoriseInstr } from './MobileSvaminiButtons'

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data

const closingDeities = deities
  .filter(d => d.sectionId === 'closing')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

const TOTAL = closingDeities.length   // 10

// ── Colours ───────────────────────────────────────────────────────────────────

const GOLD        = '#c9a84c'
const RED_ACCENT  = '#c0392b'   // SVG accentColor (circuit fills, completion flash)
const RED_TEXT    = '#f87171'   // standard text red — matches text-red-400 across the app
const CREAM       = 'rgba(255,248,200,0.92)'
const CREAM_FILL  = 'rgba(255,248,200,0.85)'
const RED_FILL    = 'rgba(192,57,43,0.82)'
const BINDU_BLACK = '#080502'

const _pad = n => String(n).padStart(2, '0')

// All circuits cream, bindu black — explore hover + memorise drilling
const ALL_CREAM_FILLS = {
  'c1': 'transparent',
  'c1-outer':    CREAM_FILL,
  'c1-mid':      CREAM_FILL,
  'c1-inner':    'transparent',
  'outer-rings': CREAM_FILL,
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${_pad(i + 1)}`, CREAM_FILL])),
  ...Object.fromEntries(Array.from({ length: 8  }, (_, i) => [`petal-c3-${_pad(i + 1)}`, CREAM_FILL])),
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${_pad(i + 1)}`,   CREAM_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${_pad(i + 1)}`,   CREAM_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${_pad(i + 1)}`,   CREAM_FILL])),
  ...Object.fromEntries(Array.from({ length: 8  }, (_, i) => [`tri-c7-${_pad(i + 1)}`,   CREAM_FILL])),
  'tri-c8-01':    CREAM_FILL,
  'tri-c8-bg-01': BINDU_BLACK,
  'tri-c8-bg-02': BINDU_BLACK,
  'c9': BINDU_BLACK,
}

// All circuits red, bindu cream — memorise completion
const ALL_RED_FILLS = {
  'c1': 'transparent',
  'c1-outer':    RED_FILL,
  'c1-mid':      RED_FILL,
  'c1-inner':    'transparent',
  'outer-rings': RED_FILL,
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${_pad(i + 1)}`, RED_FILL])),
  ...Object.fromEntries(Array.from({ length: 8  }, (_, i) => [`petal-c3-${_pad(i + 1)}`, RED_FILL])),
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${_pad(i + 1)}`,   RED_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${_pad(i + 1)}`,   RED_FILL])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${_pad(i + 1)}`,   RED_FILL])),
  ...Object.fromEntries(Array.from({ length: 8  }, (_, i) => [`tri-c7-${_pad(i + 1)}`,   RED_FILL])),
  'tri-c8-01':    RED_FILL,
  'tri-c8-bg-01': '#0f0805',
  'tri-c8-bg-02': '#0f0805',
  'c9': CREAM,
}

// All circuits red, bindu darker red — list hover fill
const LIST_RED_FILLS = { ...ALL_RED_FILLS, 'c9': '#5a0f0f' }

// ── Helpers ───────────────────────────────────────────────────────────────────


// ── Main component ────────────────────────────────────────────────────────────

export default function ClosingView({
  script = 'iast',
  onDeitySelect = () => {},
  listHighlight = false,
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
  const [hoveredEpithet,  setHoveredEpithet]  = useState(null)
  const [tappedEpithets, setTappedEpithets]   = useState(new Set())  // all tapped (past = cream label)
  const [lastTapped,     setLastTapped]       = useState(null)       // most recent tap (red label)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const clickTimer = useRef(null)

  // Reset accumulated labels when switching modes
  useEffect(() => {
    setTappedEpithets(new Set())
    setLastTapped(null)
  }, [memorise])

  // Flash the direction arrow on page open to draw attention
  const [arrowFlash, setArrowFlash] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setArrowFlash(false), 2800)
    return () => clearTimeout(t)
  }, [])

  // Track yantra position for the fixed number strip
  const yantraRef = useRef(null)
  const [yantraPos, setYantraPos] = useState({ top: 80, height: 300 })

  // Measure the sidebar's actual right edge so the strip always sits just past it
  const [sidebarRight, setSidebarRight] = useState(0)

  useEffect(() => {
    const update = () => {
      if (!yantraRef.current) return
      const r = yantraRef.current.getBoundingClientRect()
      setYantraPos({ top: r.top, height: r.height })
      // Measure sidebar right edge directly from DOM (sidebar has data-tour="sidebar")
      // On mobile the sidebar element may exist but is off-screen — always use 0 on mobile
      const sidebar = document.querySelector('[data-tour="sidebar"]')
      if (sidebar && window.innerWidth >= 768) setSidebarRight(sidebar.getBoundingClientRect().right)
      else setSidebarRight(0)
      setIsMobile(window.innerWidth < 768)
    }
    update()
    const t = setTimeout(update, 50)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [memorise])

  // ── Derived data ───────────────────────────────────────────────────────────

  const visesanani = closingDeities.filter(d => d.sequenceInSection <= 9)
  const namaskara  = closingDeities.find(d => d.sequenceInSection === 10)

  const deityForN = (n) => n === 10 ? namaskara : visesanani.find(d => d.sequenceInSection === n)

  const correctCount  = Object.values(results).filter(v => v === 'correct').length
  const allMemorised  = memorise && correctCount === TOTAL
  const done          = memorise && currentSeq > TOTAL

  // ── Pixel offset from strip top to centre of button slot ──────────────────
  // Strip: py-2 (8px) top/bottom padding; 10 equal slots for the remaining height.

  const slotH = (yantraPos.height - 16) / 10   // height of each number row

  const buttonCenterTop = (n) => {
    const pad = 8
    const idx = 10 - n   // n=10 → slot 0, n=1 → slot 9
    return pad + (idx + 0.5) * slotH
  }

  // ── Memorise click handlers ────────────────────────────────────────────────
  // Active (currentSeq): single = wrong/gold, double = correct/red.
  // Past (n < currentSeq): toggle via right-click context menu.
  // Future: no action.

  const handleMemClick = (n) => {
    if (clickTimer.current) return
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      if (currentSeq === n) onMarkResult(n, 'correct')
    }, 280)
  }

  const handleMemDblClick = (n) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === n) onMarkResult(n, 'wrong')
  }

  const handleMemContextMenu = (e, n) => {
    if (!memorise) return
    if (n >= currentSeq) return   // only past numbers
    e.preventDefault()
    onToggleResult(n)
  }

  // ── Yantra fills ───────────────────────────────────────────────────────────

  const memFills = allMemorised ? ALL_RED_FILLS : listHighlight ? LIST_RED_FILLS : ALL_CREAM_FILLS
  const exploreFills = listHighlight ? LIST_RED_FILLS : (!isMobile && hoveredEpithet) ? ALL_CREAM_FILLS : {}

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full p-4">


      {/* SVG filter: converts blue channel to red, leaves yellow/gold untouched.
          R'=R+B  G'=G  B'=0 — blue pixels become red, yellow/orange stay yellow/orange. */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <filter id="closing-blue-to-red">
            <feColorMatrix type="matrix" values="
              1 0 1 0 0
              0 1 0 0 0
              0 0 0 0 0
              0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* Yantra */}
      <div ref={yantraRef} className="relative w-full" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60"
             style={{ opacity: isMobile && !memorise ? 0.25 : 1, transition: 'opacity 0.3s' }}>
          <SriYantraSVG
            className="w-full h-full"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={memorise ? memFills : exploreFills}
            accentColor={allMemorised ? RED_ACCENT : null}
          />
        </div>

        {/* Completion overlay — memorise mode, all done */}
        {done && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(15,8,5,0.72)' }}
          >
            <div
              className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
              style={{ maxWidth: '15rem', margin: '0 1rem' }}
            >
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">
                khadgamālā sampūrṇā
              </p>
              <p className="text-cream text-sm">
                {correctCount === TOTAL ? 'Stotra complete — well done!' : 'Round complete.'}
              </p>
              <p className="text-muted text-xs">{correctCount}/{TOTAL} memorised</p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={() => onNavigate && onNavigate('nyasa')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
                >
                  Start from beginning
                </button>
              </div>
            </div>
          </div>
        )}
      </div>{/* end relative yantra wrapper */}

      {/* Number strip — fixed, just right of the sidebar (measured from DOM) */}
      <div
        className="pointer-events-none"
        style={{
          position: 'fixed',
          left: sidebarRight + 6,
          top: yantraPos.top,
          height: yantraPos.height,
          width: 26,
          zIndex: 30,
        }}
      >
        {/* Number buttons */}
        <div className="pointer-events-auto flex flex-col justify-between items-center h-full py-2">
          {[10,9,8,7,6,5,4,3,2,1].map(n => {
            const isActive   = memorise && n === currentSeq
            const isPast     = memorise && n < currentSeq   // revealed regardless of result stored
            const isCorrect  = results[n] === 'correct'
            const isFuture   = memorise && n > currentSeq

            const numColor = memorise
              ? isActive  ? CREAM
              : isPast && isCorrect ? RED_TEXT
              : isPast    ? GOLD
              : /* future */ 'rgba(201,168,76,0.28)'
              : isMobile
                ? (n === lastTapped ? RED_TEXT : CREAM)
                : (hoveredEpithet === n ? CREAM : GOLD)

            const emojiActive = (!memorise && (hoveredEpithet === n || (isMobile && n === lastTapped))) || (memorise && isPast && isCorrect)

            return (
              <button
                key={n}
                onMouseEnter={() => setHoveredEpithet(n)}
                onMouseLeave={() => setHoveredEpithet(null)}
                onClick={memorise
                  ? () => handleMemClick(n)
                  : () => { const d = deityForN(n); if (d) onDeitySelect(d); setTappedEpithets(prev => new Set([...prev, n])); setLastTapped(n) }
                }
                onDoubleClick={memorise ? () => handleMemDblClick(n) : undefined}
                onContextMenu={memorise ? e => handleMemContextMenu(e, n) : undefined}
                disabled={memorise && isFuture}
                className="flex-1 flex items-center justify-center transition-colors leading-none select-none"
                style={{
                  color: numColor,
                  fontSize: n === 10 ? '18px' : '15px',
                  fontFamily: n === 10 ? 'sans-serif' : 'monospace',
                  fontWeight: 700,
                  cursor: memorise && isFuture ? 'default' : 'pointer',
                  filter: n !== 10 ? 'none'
                    : emojiActive
                      ? 'url(#closing-blue-to-red)'
                      : 'sepia(1) saturate(3) hue-rotate(5deg) brightness(0.85)',
                }}
                title={n === 10 ? 'namastē namastē namastē namaḥ' : undefined}
              >
                {n === 10 ? '🙏' : n}
              </button>
            )
          })}
        </div>

        {/* Explore mode: transparent hover targets covering the label area */}
        {!memorise && [10,9,8,7,6,5,4,3,2,1].map(n => (
          <div
            key={`exp-ht-${n}`}
            className="pointer-events-auto"
            style={{
              position: 'absolute',
              left: 30,
              top: buttonCenterTop(n) - slotH / 2,
              width: 300,
              height: slotH,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHoveredEpithet(n)}
            onMouseLeave={() => setHoveredEpithet(null)}
            onClick={() => { const d = deityForN(n); if (d) onDeitySelect(d); setTappedEpithets(prev => new Set([...prev, n])); setLastTapped(n) }}
          />
        ))}

        {/* Memorise mode: transparent hover targets covering the label area */}
        {memorise && [10,9,8,7,6,5,4,3,2,1].map(n => {
          const isFuture = n > currentSeq
          return (
            <div
              key={`ht-${n}`}
              className="pointer-events-auto"
              style={{
                position: 'absolute',
                left: 30,
                top: buttonCenterTop(n) - slotH / 2,
                width: 300,
                height: slotH,
                cursor: isFuture ? 'default' : 'pointer',
              }}
              onMouseEnter={() => setHoveredEpithet(n)}
              onMouseLeave={() => setHoveredEpithet(null)}
              onClick={() => handleMemClick(n)}
              onDoubleClick={() => handleMemDblClick(n)}
              onContextMenu={e => handleMemContextMenu(e, n)}
            />
          )
        })}

        {/* Memorise mode: revealed labels — past numbers (n < currentSeq) */}
        {memorise && [10,9,8,7,6,5,4,3,2,1].map(n => {
          const isPast    = n < currentSeq
          const isCorrect = results[n] === 'correct'
          if (!isPast) return null
          const d = deityForN(n)
          if (!d) return null
          return (
            <div
              key={`lbl-${n}`}
              className="pointer-events-none"
              style={{
                position: 'absolute',
                left: 30,
                top: buttonCenterTop(n),
                transform: 'translateY(-50%)',
                zIndex: 31,
                whiteSpace: 'nowrap',
              }}
            >
              <p className="iast" style={{ color: isCorrect ? RED_TEXT : GOLD, fontSize: '16px', fontWeight: 700 }}>
                {displayName(d, script)}
              </p>
            </div>
          )
        })}

        {/* Mobile Explore: accumulated revealed labels — past = cream, lastTapped = red */}
        {isMobile && !memorise && [...tappedEpithets].map(n => {
          const d = deityForN(n)
          if (!d) return null
          const isLast = n === lastTapped
          return (
            <div
              key={`exp-lbl-${n}`}
              className="pointer-events-none"
              style={{
                position: 'absolute',
                left: 30,
                top: buttonCenterTop(n),
                transform: 'translateY(-50%)',
                zIndex: 31,
                whiteSpace: 'nowrap',
              }}
            >
              <p className="iast" style={{ color: isLast ? RED_TEXT : CREAM, fontSize: '16px', fontWeight: 700 }}>
                {displayName(d, script)}
              </p>
            </div>
          )
        })}

        {/* Tooltip — explore: always on hover; memorise: active + future only (past show label) */}
        {hoveredEpithet && (() => {
          const d = deityForN(hoveredEpithet)
          if (!d) return null
          const isPast = memorise && hoveredEpithet < currentSeq
          const isTapped = isMobile && !memorise && tappedEpithets.has(hoveredEpithet)
          if (isPast || isTapped) return null   // label already visible
          return (
            <div
              className="pointer-events-none"
              style={{
                position: 'absolute',
                left: 30,
                top: buttonCenterTop(hoveredEpithet),
                transform: 'translateY(-50%)',
                zIndex: 32,
                whiteSpace: 'nowrap',
              }}
            >
              <div
                className="px-2 py-1.5 rounded shadow-lg"
                style={{ background: 'rgba(15,8,5,0.95)', border: '0.6px solid rgba(255,248,200,0.6)' }}
              >
                <p className="iast" style={{ color: GOLD, fontSize: '16px', fontWeight: 700 }}>
                  {displayName(d, script)}
                </p>
                {script !== 'iast' && d.scripts.iast && (
                  <p className="iast mt-0.5" style={{ color: 'rgba(201,168,76,0.55)', fontSize: '13px' }}>
                    {d.scripts.iast}
                  </p>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Direction arrow — below the number strip, indicates chant flows upward (1→10) */}
      <div
        className="pointer-events-none"
        style={{
          position: 'fixed',
          left: sidebarRight + 6,
          top: yantraPos.top + yantraPos.height + 4,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          className={arrowFlash ? 'animate-pulse' : ''}
          style={{ color: arrowFlash ? CREAM : GOLD, fontSize: '22px', lineHeight: 1, transition: 'color 0.6s' }}
        >↑</span>
        {!done && (
          <span
            className={arrowFlash ? 'animate-pulse' : ''}
            style={{ color: arrowFlash ? CREAM : 'rgba(255,248,200,0.45)', fontSize: '0.75rem', whiteSpace: 'nowrap', transition: 'color 0.6s' }}
          >
            Ascent to the top from here
          </span>
        )}
      </div>

      {memorise && <MobileMemoriseInstr />}

      <div className="h-8" />
    </div>
  )
}
