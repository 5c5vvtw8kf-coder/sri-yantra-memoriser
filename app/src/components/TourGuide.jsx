import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { iastToEnglish } from '../translations.js'

// ── Tour state key ────────────────────────────────────────────────────────────
const TOUR_KEY = 'sriYantra_tourSeen_v1'

// ── Layout constants ──────────────────────────────────────────────────────────
const PAD   = 8   // padding around the highlighted element (px)
const GAP   = 16  // gap between element edge and popover (px)
const POP_W = 290 // popover width (px)

// ── Tour step definitions ─────────────────────────────────────────────────────
const STEPS = [
  {
    // No selector = centred welcome modal
    title: 'Welcome to Śrī Yantra Memoriser',
    body:
      '<p>This app helps you learn the <em>Khadgamala Stotram</em>, around 180 deity ' +
      'names, by building spatial memory of the Śrī Yantra geometry.</p>' +
      '<p>Rather than drilling a word list, you learn <em>where</em> each deity lives ' +
      'in the yantra. Spatial memory makes sequential recall natural.</p>',
  },
  {
    // No selector — sidebar is hidden on mobile; centred modal works on all devices
    title: 'Navigation',
    body:
      'On desktop the sidebar is always visible on the left. On mobile, tap the ' +
      '<strong>☰</strong> button to open it.<br><br>' +
      'It lists every chant section — Nyāsa Deities, Gurus, all nine āvaraṇas through ' +
      'to the bindu — plus tools like Spot Check and Memory Map. Tap any item to open it.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'Explore and Memorise',
    body:
      'Every section has two modes:<br><br>' +
      '<strong>Explore</strong> — names are revealed as you tap through.<br>' +
      '<strong>Memorise</strong> — names are hidden; recall the name before hovering ' +
      'over then mark each one memorised or not.<br><br>' +
      'Work through each circuit from outer to inner.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'The Nine Āvaraṇas',
    body:
      'Each of the nine āvaraṇas is its own section. Start with the outermost, ' +
      'the Bhūpura square, and work inward toward the bindu. Progress dots appear next ' +
      'to sections as you complete them.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'Spot Check',
    body:
      '<strong>Spot Check</strong> picks a random position on the yantra and asks you ' +
      'to name the deity there. This builds flexible recall, not just rote sequence.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'Memory Map',
    body:
      'The <strong>Memory Map</strong> shows your progress across the entire yantra at a ' +
      'glance — <span class="syt-tour-green">✓ green</span> for memorised, ' +
      '<span class="syt-tour-amber">~ amber</span> for partially correct, ' +
      '<span class="syt-tour-red">✗ red</span> for not yet memorised.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'Śrī Yantra',
    body:
      'The <strong>Śrī Yantra</strong> tab shows the complete diagram as a reference — ' +
      'all nine circuits from the Bhūpura to the bindu.',
  },
  {
    selector: '[data-tour="nav-browser"]',
    title: 'Full Stotram Text',
    body:
      'The <strong>Khadgamala Stotram</strong> page has the complete chant with ' +
      'transliteration, Devanāgarī and English translation, for reading and reference.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: "You're all set",
    body:
      'Click the <strong>✈</strong> button here any time to revisit this tour.<br><br>' +
      'Begin with <em>Welcome and Introduction</em>, then work through the circuits in ' +
      'order. Take your time — this is a practice, not a race. 🙏',
  },
]

// ── Button styles ─────────────────────────────────────────────────────────────
const btnBase = {
  fontSize: 11,
  padding: '5px 14px',
  borderRadius: 5,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
  lineHeight: 1,
}

const btnSecondary = {
  ...btnBase,
  background: '#0f0a05',
  border: '1px solid #352415',
  color: '#8a7560',
}

const btnPrimary = {
  ...btnBase,
  background: '#251810',
  border: '1px solid #9a7820',
  color: '#d4b96a',
}

// ── Overlay + popover component ───────────────────────────────────────────────
function TourOverlay({ onDone, script = 'iast' }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect]   = useState(null)

  const rawStep = STEPS[stepIndex]
  const step = script === 'english'
    ? { ...rawStep, title: iastToEnglish(rawStep.title), body: iastToEnglish(rawStep.body) }
    : rawStep
  const isLast  = stepIndex === STEPS.length - 1
  const isFirst = stepIndex === 0

  // Recompute the highlighted element's bounding rect whenever the step changes
  const updateRect = useCallback(() => {
    if (!step.selector) { setRect(null); return }
    // On mobile the sidebar is hidden — skip highlighting, use centred modal for all steps
    if (window.innerWidth < 768) { setRect(null); return }
    const el = document.querySelector(step.selector)
    if (!el) { setRect(null); return }
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    const r = el.getBoundingClientRect()
    if (r.right <= 0 || r.left >= window.innerWidth || r.bottom <= 0 || r.top >= window.innerHeight) {
      setRect(null); return
    }
    setRect(r)
  }, [step.selector])

  useEffect(() => {
    updateRect()
    // Recompute once more after the scroll settles
    const t = setTimeout(updateRect, 320)
    return () => clearTimeout(t)
  }, [updateRect])

  useEffect(() => {
    const h = () => updateRect()
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [updateRect])

  // Navigation
  const goNext = () => stepIndex < STEPS.length - 1 ? setStepIndex(i => i + 1) : onDone()
  const goPrev = () => stepIndex > 0 && setStepIndex(i => i - 1)

  // Padded rect around the highlighted element
  const r = rect ? {
    t: rect.top    - PAD,
    l: rect.left   - PAD,
    r: rect.right  + PAD,
    b: rect.bottom + PAD,
  } : null

  // Shared overlay strip style
  const S = {
    position: 'fixed',
    zIndex: 9997,
    background: 'rgba(0,0,0,0.80)',
    pointerEvents: 'all',
  }

  // Popover position — always to the right of the element; fall back to centred
  const popStyle = (() => {
    const base = { position: 'fixed', zIndex: 9999, width: POP_W }
    if (!r) return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const vH   = window.innerHeight
    const vW   = window.innerWidth
    const top  = Math.max(8, Math.min(r.t, vH - 360))
    const left = r.r + GAP

    // If popover would bleed off the right edge, place it to the left instead
    if (left + POP_W > vW - 8) {
      return { ...base, top, right: vW - r.l + GAP }
    }
    return { ...base, top, left }
  })()

  return createPortal(
    <>
      {/* ── Dark overlay with rectangular hole for the highlighted element ── */}
      {r ? (
        <>
          {/* Top strip */}
          <div style={{ ...S, top: 0, left: 0, right: 0, height: Math.max(0, r.t) }} />
          {/* Left strip */}
          <div style={{ ...S, top: Math.max(0, r.t), left: 0, width: Math.max(0, r.l), height: r.b - Math.max(0, r.t) }} />
          {/* Right strip */}
          <div style={{ ...S, top: Math.max(0, r.t), left: r.r, right: 0, height: r.b - Math.max(0, r.t) }} />
          {/* Bottom strip */}
          <div style={{ ...S, top: r.b, left: 0, right: 0, bottom: 0 }} />
          {/* Gold focus ring */}
          <div style={{
            position: 'fixed',
            zIndex: 9998,
            pointerEvents: 'none',
            top: r.t, left: r.l,
            width: r.r - r.l,
            height: r.b - r.t,
            borderRadius: 6,
            outline: '2px solid rgba(201,168,76,0.85)',
            outlineOffset: 0,
            boxShadow: '0 0 20px rgba(201,168,76,0.30)',
          }} />
        </>
      ) : (
        /* Full-screen overlay for centred steps */
        <div style={{ ...S, inset: 0 }} />
      )}

      {/* ── Popover ─────────────────────────────────────────────────────── */}
      <div style={{
        ...popStyle,
        background: '#1a1008',
        border: '1px solid #352415',
        borderRadius: 8,
        padding: '16px 18px',
        boxShadow: '0 10px 48px rgba(0,0,0,0.75)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>

        {/* Close (×) button */}
        <button
          onClick={onDone}
          aria-label="Close tour"
          style={{
            position: 'absolute', top: 9, right: 12,
            background: 'none', border: 'none',
            color: '#4a3420', fontSize: 18, cursor: 'pointer', lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Step counter */}
        <p style={{
          fontSize: 10, color: '#c8600a',
          fontFamily: 'monospace', textTransform: 'uppercase',
          letterSpacing: '0.10em', marginBottom: 10,
        }}>
          Step {stepIndex + 1} of {STEPS.length}
        </p>

        {/* Title — use IAST serif font */}
        <h3
          className="iast"
          style={{
            fontSize: 14, fontWeight: 600, color: '#d4b96a',
            marginBottom: 10, lineHeight: 1.35, paddingRight: 18,
          }}
        >
          {step.title}
        </h3>

        {/* Body — HTML allowed for <strong>, <em>, <br> */}
        <div
          className="syt-tour-body"
          style={{ fontSize: 12.5, color: '#c8bca8', lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: step.body }}
        />

        {/* Navigation buttons */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 16,
          justifyContent: isFirst ? 'flex-end' : 'space-between',
          alignItems: 'center',
        }}>
          {!isFirst && (
            <button onClick={goPrev} style={btnSecondary}>
              ← Back
            </button>
          )}
          <button onClick={goNext} style={isLast ? btnPrimary : btnSecondary}>
            {isLast ? 'Done ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

// ── Hook — call this once in App ──────────────────────────────────────────────
/**
 * useTour({ onBeforeStart })
 *
 * Returns:
 *   startTour   — call to launch the tour manually (e.g. from a "?" button)
 *   tourElement — JSX to render anywhere in the component tree (uses createPortal)
 *
 * Auto-triggers once on first visit (checks localStorage).
 * onBeforeStart fires before the overlay mounts — use it to ensure all nav
 * sections are open so every data-tour element is present in the DOM.
 */
export function useTour({ onBeforeStart, script = 'iast' } = {}) {
  const [active, setActive] = useState(false)
  const cbRef = useRef(onBeforeStart)
  useEffect(() => { cbRef.current = onBeforeStart })

  const startTour = useCallback(() => {
    cbRef.current?.()
    // Brief delay lets any state changes (e.g. opening sections) settle
    setTimeout(() => setActive(true), 150)
    localStorage.setItem(TOUR_KEY, '1')
  }, [])

  const endTour = useCallback(() => setActive(false), [])

  // Auto-trigger on first visit
  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const t = setTimeout(startTour, 1200)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    startTour,
    tourElement: active ? <TourOverlay onDone={endTour} script={script} /> : null,
  }
}
