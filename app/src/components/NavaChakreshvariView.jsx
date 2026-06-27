/**
 * NavaChakreshvariView.jsx
 *
 * Nine Tripura forms — one presiding over each āvaraṇa (circuit).
 *
 * Interaction model: whole-circuit hover/click, consistent with other avarana pages.
 *
 * Explore mode:
 *   Hover any circuit → highlights whole circuit + shows tooltip with Tripura form.
 *   Click a circuit   → reveals that form in the deity panel.
 *
 * Memorise mode:
 *   Click or double-click any part of a circuit → single-click = not yet,
 *   double-click = memorised. Right-click toggles a past result.
 *   Active circuit is highlighted via buildFills + activeCircuit.
 *
 * The bindu (c9) stays black throughout — buildFills enforces this.
 */

import { useState, useRef, useEffect } from 'react'
import SriYantraSVG, { C2_PETALS, C3_PETALS, BHUPURA_OUTER_PTS, BHUPURA_MAIN_PTS, BHUPURA_INNER_PTS } from './SriYantraSVG'
import triangleData from '../data/triangle-regions.json'
import data from '../data/khadgamala-canonical.json'
import { displayName } from '../utils.js'
import { MobileMemoriseInstr } from './MobileSvaminiButtons'

// ── Stroke-cover overlay data ─────────────────────────────────────────────────

const C2_PATHS = C2_PETALS.map(p => p.path)
const C3_PATHS = C3_PETALS.map(p => p.path)

const TRI_CIRCUIT_POLYS = {}
for (const t of triangleData) {
  if (t.id.startsWith('tri-c8-bg')) continue
  const c = t.circuit
  if (!TRI_CIRCUIT_POLYS[c]) TRI_CIRCUIT_POLYS[c] = []
  TRI_CIRCUIT_POLYS[c].push(t.points)
}

const BHUPURA_SQUARES = [BHUPURA_OUTER_PTS, BHUPURA_MAIN_PTS, BHUPURA_INNER_PTS]

// ── SriYantraSVG coordinate space ────────────────────────────────────────────
//   CX = 260, CY = 270, viewBox "45 55 430 430"

const SVG_CX = 260
const SVG_CY = 270

// Tooltip is always rendered at a fixed top-left position so it never
// overlaps the active circuit region or the bindu.
// Coordinates are in SriYantraSVG space: viewBox "45 55 430 430", CX=260, CY=270.
const TOOLTIP_ANCHOR = { x: 168, y: 100 }   // top-left bhupura corner area

// ── Region id → circuit number ────────────────────────────────────────────────
//
// Triangle sub-region polygons (tri-cN-NN) render on top of the masked circuit
// regions and intercept events first — normalisation is therefore required.

function regionToCircuit(id) {
  if (!id) return null
  if (id === 'c1' || id.startsWith('bhupura-')) return 1
  if (id === 'c2' || id.startsWith('petal-c2-')) return 2
  if (id === 'c3' || id.startsWith('petal-c3-')) return 3
  if (id === 'c4' || id.startsWith('tri-c4-')) return 4
  if (id === 'c5' || id.startsWith('tri-c5-')) return 5
  if (id === 'c6' || id.startsWith('tri-c6-')) return 6
  if (id === 'c7' || id.startsWith('tri-c7-')) return 7
  if (id === 'c8' || id.startsWith('tri-c8-')) return 8
  if (id === 'c9') return 9
  return null
}

// ── Fill builder ──────────────────────────────────────────────────────────────

const FILL_NORM   = 'rgba(201,168,76,0.70)'
const FILL_DIM    = 'rgba(201,168,76,0.18)'
const FILL_HI     = 'rgba(255,248,200,0.92)'   // hover — cream
const FILL_SEL    = 'rgba(200,70,70,0.85)'      // selected (clicked) — red
const GOLD        = '#c9a84c'
const RED         = '#c0392b'
const ACTIVE_FILL = 'rgba(255,248,200,0.92)'
const FILL_GOLD_HI = 'rgba(201,168,76,0.92)'  // bindu hover — gold (contrasts with c8 cream)

// tri-c7-03, tri-c7-05, tri-c7-07 are geometrically inside the c8 primary triangle.
// When c8 is lit (hovered or selected), c8's fill bleeds through their transparent
// area and the base yantra gold outlines make them appear as three filled triangles.
// Paint them background-dark (#0f0805) as cutouts — same mechanism as tri-c8-bg-01/02.
const C8_INNER_C7 = new Set(['tri-c7-03', 'tri-c7-05', 'tri-c7-07'])

// hovered  — transient, cream; only the hovered circuit fills
// selected — persistent after click, red
function buildFills(hovered, selected) {
  const c8Lit = (hovered === 8 || selected === 8)

  // f(n): fill for circuit n given hover/select state.
  const f = (n) => {
    if (n === selected)  return FILL_SEL  // clicked = red (priority over hover)
    if (n === hovered)   return FILL_HI   // cream — hovered
    if (hovered != null || selected != null) return FILL_DIM
    return FILL_NORM
  }

  // C1 bhupura: fill only the two wall bands (c1-outer + c1-mid).
  // c1-inner (space between bhupura and Valayam rings) stays transparent.
  const c1Color = f(1)
  const c1Fill  = (c1Color === FILL_NORM) ? 'transparent' : c1Color

  const pad2 = n => String(n).padStart(2, '0')

  return {
    'c1':       'transparent',   // hit-test only
    'c1-outer': c1Fill,
    'c1-mid':   c1Fill,
    'c1-inner': 'transparent',   // never fill space between bhupura and Valayam
    // Valayam rings — fill cream only when hovering circuit 1 (bhupura)
    'outer-rings': hovered === 1 ? FILL_HI
                  : selected != null ? FILL_DIM
                  : null,
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
      [`petal-c2-${pad2(i + 1)}`, f(2)])),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
      [`petal-c3-${pad2(i + 1)}`, f(3)])),
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
      [`tri-c4-${pad2(i + 1)}`, f(4)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c5-${pad2(i + 1)}`, f(5)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c6-${pad2(i + 1)}`, f(6)])),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => {
      const id = `tri-c7-${pad2(i + 1)}`
      if (c8Lit && C8_INNER_C7.has(id)) return [id, '#0f0805']
      return [id, f(7)]
    })),
    'tri-c8-01':    f(8),
    'tri-c8-bg-01': '#0f0805',
    'tri-c8-bg-02': '#0f0805',
    // Bindu: red when clicked, gold on hover (contrasts with c8 cream), black otherwise
    'c9': selected === 9 ? FILL_SEL : hovered === 9 ? FILL_GOLD_HI : '#000000',
  }
}

// Memorise-mode fill builder — colours each circuit independently based on drill results.
//   active (currentSeq) → cream
//   past correct        → red  (FILL_SEL)
//   past wrong          → gold (FILL_NORM)
//   future              → dim
//   flash               → all cream
// hoveredCircuit: hover glow only applies to future (dim) circuits — not to circuits
// already answered, so the result colour shows immediately on click without waiting
// for the user to hover away.

// Progressive explore fill builder — outermost to innermost sequential reveal.
//   past (< exploreStep) → red   (priority over hover — stale mobile touch can't override)
//   active (=== exploreStep)    → cream
//   hovered future (desktop)    → cream
//   future (> exploreStep)      → dim
function buildExploreFills(exploreStep, hoveredCircuit) {
  const f = (n) => {
    if (n < exploreStep)      return FILL_SEL   // past — red (checked before hover)
    if (n === exploreStep)    return FILL_HI    // active — cream
    if (n === hoveredCircuit) return FILL_HI    // desktop hover glow (future only)
    return FILL_DIM
  }
  const c8Color = f(8)
  const c8Lit   = c8Color === FILL_HI || c8Color === FILL_SEL
  const pad2    = n => String(n).padStart(2, '0')
  const c1Color = f(1)
  return {
    'c1':       'transparent',
    'c1-outer': c1Color,
    'c1-mid':   c1Color,
    'c1-inner': 'transparent',
    'outer-rings': c1Color !== FILL_DIM ? c1Color : null,
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${pad2(i+1)}`, f(2)])),
    ...Object.fromEntries(Array.from({ length: 8 },  (_, i) => [`petal-c3-${pad2(i+1)}`, f(3)])),
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${pad2(i+1)}`, f(4)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${pad2(i+1)}`, f(5)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${pad2(i+1)}`, f(6)])),
    ...Object.fromEntries(Array.from({ length: 8 },  (_, i) => {
      const id      = `tri-c7-${pad2(i+1)}`
      const c7Color = f(7)
      // Only cut out when C7 is still dim — a solid C7 fill (active/past) covers C8 bleed naturally
      if (c8Lit && C8_INNER_C7.has(id) && c7Color === FILL_DIM) return [id, '#0f0805']
      return [id, c7Color]
    })),
    'tri-c8-01':    c8Color,
    'tri-c8-bg-01': '#0f0805',
    'tri-c8-bg-02': '#0f0805',
    // Bindu: active = cream; tapped/past = black (red is invisible inside red c8); future = black
    'c9': exploreStep > 9 ? '#000000'
        : exploreStep === 9 ? FILL_HI
        : hoveredCircuit === 9 ? FILL_GOLD_HI
        : '#000000',
  }
}

function buildMemFills(colorFn, hoveredCircuit) {
  const c = (n) => {
    const base = colorFn(n)
    // Only apply cream hover glow if the circuit is still in the future (dim)
    if (n === hoveredCircuit && base === FILL_DIM) return FILL_HI
    return base
  }
  const c1Color = c(1)
  // Bindu: only cream/red/black — never dim gold.
  // Apply hover gold only if the bindu is still in the future (dim); once answered, show result.
  const c9raw = colorFn(9)
  const c9 = c9raw === FILL_SEL ? '#000000'                                    // answered correct → black (red invisible on c8 red)
           : c9raw === FILL_HI  ? FILL_HI                                     // active → cream
           : hoveredCircuit === 9 && c9raw === FILL_DIM ? FILL_GOLD_HI        // future + hover → gold
           : '#000000'                                                         // future/not hovered → black

  // c8 is "lit" if it has any non-dim fill — active (FILL_HI), past-correct (FILL_SEL),
  // or past-wrong (FILL_NORM) all bleed through the three inner c7 triangles.
  // Only FILL_DIM (future, 18% opacity) is safe to leave unmasked.
  // Cutout is only applied when c7's own fill is also DIM — if c7 is active or
  // answered it has a solid-enough fill to cover c8's bleed naturally.
  const c8Color = c(8)
  const c8Lit   = c8Color === FILL_HI || c8Color === FILL_SEL || c8Color === FILL_NORM
  const c7Color = c(7)

  const pad2 = n => String(n).padStart(2, '0')
  return {
    'c1': 'transparent',
    'c1-outer': c1Color,
    'c1-mid':   c1Color,
    'c1-inner': 'transparent',
    // Valayam rings — cream only when hovering circuit 1 (bhupura)
    'outer-rings': hoveredCircuit === 1 ? FILL_HI : null,
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
      [`petal-c2-${pad2(i + 1)}`, c(2)])),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
      [`petal-c3-${pad2(i + 1)}`, c(3)])),
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
      [`tri-c4-${pad2(i + 1)}`, c(4)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c5-${pad2(i + 1)}`, c(5)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c6-${pad2(i + 1)}`, c(6)])),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => {
      const id = `tri-c7-${pad2(i + 1)}`
      if (c8Lit && C8_INNER_C7.has(id) && c7Color === FILL_DIM) return [id, '#0f0805']
      return [id, c7Color]
    })),
    'tri-c8-01':    c(8),
    'tri-c8-bg-01': '#0f0805',
    'tri-c8-bg-02': '#0f0805',
    'c9': c9,
  }
}

// ── Static data ───────────────────────────────────────────────────────────────

const { deities } = data
const deityById = Object.fromEntries(deities.map(d => [d.id, d]))

const ncDeities = deities
  .filter(d => d.sectionId === 'chakreshvari')
  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)

// circuitNumber → deity
const deityByCircuit = Object.fromEntries(ncDeities.map(d => [d.circuitNumber, d]))

const TOTAL = 9


// ── Tooltip ───────────────────────────────────────────────────────────────────
//
// Rendered inside an overlay SVG with viewBox "45 55 430 430" — same as SriYantraSVG.
// Always placed at TOOLTIP_ANCHOR (top-left corner) so it never overlaps the active
// circuit or the bindu.

function Tooltip({ circuitNum, script }) {
  if (!circuitNum) return null
  const deity = deityByCircuit[circuitNum]
  if (!deity) return null
  const label = `${circuitNum}. ${displayName(deity, script)}`
  if (!label) return null

  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const charW    = script === 'devanagari' ? 18 : script === 'telugu' ? 21 : script === 'tamil' ? 22 : script === 'english' ? 14.5 : 13.5
  const w        = Math.max(60, label.length * charW + 18)

  // Centred horizontally on the bindu (SVG_CX = 260); y fixed at top-left area
  const tx = SVG_CX
  const ty = TOOLTIP_ANCHOR.y

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

// ── Main component ────────────────────────────────────────────────────────────

export default function NavaChakreshvariView({
  script = 'iast',
  onDeitySelect = () => {},
  listHighlightCircuit = null,
  memorise = false,
  currentSeq = 1,
  results = {},
  onStartMemorise,
  onExitMemorise,
  onMarkResult,
  onToggleResult,
  flash = false,
  onNavigate,
  tr               = k => k,
  uiLang           = 'en',
}) {
  const [exploreStep,        setExploreStep]        = useState(1)
  const [lastTappedCircuit,  setLastTappedCircuit]  = useState(null)
  const [hoveredCircuit,     setHoveredCircuit]     = useState(null)
  const [mobileRevealedSeq,  setMobileRevealedSeq]  = useState(null)
  const clickTimer         = useRef(null)
  const lastHoveredCircuit = useRef(null)   // used by right-click handler
  const lastTapRef         = useRef({ seq: null, time: 0 })

  // Reset mobile reveal when active sequence changes
  useEffect(() => { setMobileRevealedSeq(null) }, [currentSeq, memorise])

  // ── Explore mode handlers ──────────────────────────────────────────────────

  const handleRegionHover = (id) => {
    const c = regionToCircuit(id)
    if (c) {
      setHoveredCircuit(c)
      lastHoveredCircuit.current = c
    }
  }

  const handleRegionLeave = () => {
    setHoveredCircuit(null)
  }

  const handleRegionClick = (id) => {
    const c = regionToCircuit(id)
    if (!c) return
    // Once c8 is past (exploreStep === 9), tapping the c8 area advances to c9 — bindu is tiny
    const effectiveC = (c === 8 && exploreStep === 9) ? 9 : c
    if (effectiveC !== exploreStep) return
    setLastTappedCircuit(effectiveC)
    setExploreStep(prev => Math.min(prev + 1, 10))
    onDeitySelect(deityByCircuit[effectiveC] ?? null)
  }

  // ── Memorise mode handlers ─────────────────────────────────────────────────

  const handleMemClick = (seq) => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      // Mobile: first tap on active seq reveals name only; subsequent double-tap=wrong, single-tap=correct
      if (currentSeq === seq && mobileRevealedSeq !== seq) {
        setMobileRevealedSeq(seq)
        lastTapRef.current = { seq: null, time: 0 }
        return
      }
      const now = Date.now()
      const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
      lastTapRef.current = { seq, time: now }
      if (isDoubleTap) {
        if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
        if (currentSeq === seq)          onMarkResult(seq, 'wrong')
        else if (results[seq] === 'correct') onToggleResult(seq)
      } else {
        if (clickTimer.current) return
        clickTimer.current = setTimeout(() => {
          clickTimer.current = null
          if (currentSeq === seq)              onMarkResult(seq, 'correct')
          else if (results[seq] !== 'correct') onToggleResult(seq)
        }, 280)
      }
    } else {
      // Desktop: onDoubleClick handles wrong; single click fires after 280ms
      if (clickTimer.current) return
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null
        if (currentSeq === seq)              onMarkResult(seq, 'correct')
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const handleMemDblClick = (seq) => {
    // Desktop only — onRegionDoubleClick not attached on mobile
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    if (currentSeq === seq)          onMarkResult(seq, 'wrong')
    else if (results[seq] === 'correct') onToggleResult(seq)
  }

  const handleMemRegionClick = (id) => {
    const c = regionToCircuit(id)
    if (!c) return
    const deity = deityByCircuit[c]
    if (!deity) return
    const seq = deity.sequenceInSection
    if (currentSeq === seq || currentSeq > seq) handleMemClick(seq)
  }

  const handleMemRegionDblClick = (id) => {
    const c = regionToCircuit(id)
    if (!c) return
    const deity = deityByCircuit[c]
    if (!deity) return
    const seq = deity.sequenceInSection
    if (currentSeq === seq || currentSeq > seq) handleMemDblClick(seq)
  }

  // Right-click: uses lastHoveredCircuit so we know which region was under the cursor.
  const handleContextMenu = (e) => {
    if (!memorise || flash) return
    const c = lastHoveredCircuit.current
    if (!c) return
    const deity = deityByCircuit[c]
    if (!deity) return
    const seq = deity.sequenceInSection
    if (currentSeq > seq) {
      e.preventDefault()
      onToggleResult(seq)
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const done = memorise && currentSeq > TOTAL

  const [showCompletion, setShowCompletion] = useState(false)
  const completionTimer = useRef(null)
  useEffect(() => {
    if (done) {
      completionTimer.current = setTimeout(() => setShowCompletion(true), 3000)
    } else {
      clearTimeout(completionTimer.current)
      setShowCompletion(false)
    }
    return () => clearTimeout(completionTimer.current)
  }, [done])

  const activeCircuit = memorise && !done && !flash
    ? ncDeities.find(d => d.sequenceInSection === currentSeq)?.circuitNumber ?? null
    : null

  // Explore: hovered (cream) takes visual priority over selected (red).
  const filledRegions = memorise
    // Memorise: each circuit coloured independently — active=cream, correct=red, wrong=gold, future=dim.
    ? buildMemFills((circuitNum) => {
        const deity = deityByCircuit[circuitNum]
        if (!deity) return FILL_DIM
        const seq = deity.sequenceInSection
        if (flash)             return FILL_HI
        if (seq === currentSeq) return FILL_HI
        if (seq < currentSeq)   return results[seq] === 'correct' ? FILL_SEL : FILL_NORM
        return FILL_DIM
      }, flash ? null : hoveredCircuit)
    : listHighlightCircuit
      ? buildFills(hoveredCircuit, listHighlightCircuit)
      : buildExploreFills(exploreStep, hoveredCircuit)

  // Tooltip: hover in both modes (suppressed during flash).
  // Explore mobile: fall back to last tapped circuit so name persists after tap.
  // Memorise mobile: show for the seq that was just revealed by first tap.
  const mobileRevealCircuit = mobileRevealedSeq != null
    ? (ncDeities.find(d => d.sequenceInSection === mobileRevealedSeq)?.circuitNumber ?? null)
    : null
  const tooltipCircuit = flash ? null
    : memorise ? (hoveredCircuit ?? (window.innerWidth < 768 ? mobileRevealCircuit : null))
    : (hoveredCircuit ?? lastTappedCircuit)

  return (
    <div className="w-full px-4 pt-3 pb-0 md:p-4 flex-1 flex flex-col md:block md:flex-none">


      <div
        className="relative w-full flex-1 min-h-0 md:flex-none md:[padding-bottom:100%]"
        onContextMenu={handleContextMenu}
      >

        {/* Base yantra with whole-circuit interaction */}
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          <SriYantraSVG
            className="w-full h-full"
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
            filledRegions={filledRegions}
            onRegionClick={
              flash ? null
              : memorise ? handleMemRegionClick
              : handleRegionClick
            }
            onRegionHover={flash ? null : handleRegionHover}
            onRegionLeave={flash ? null : handleRegionLeave}
            onRegionDoubleClick={
              memorise && !flash && window.innerWidth >= 768 ? handleMemRegionDblClick : null
            }
          />
        </div>

        {/* Stroke-cover overlay — hides gold lines when a circuit is list-highlighted */}
        {!memorise && listHighlightCircuit && (
          <svg className="absolute inset-0 w-full h-full" viewBox="45 55 430 430"
            style={{ pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
            {listHighlightCircuit === 1 && (
              <>
                <defs>
                  <mask id="nc-c1-outer-mask">
                    <polygon points={BHUPURA_OUTER_PTS} fill="white" />
                    <polygon points={BHUPURA_MAIN_PTS}  fill="black" />
                  </mask>
                  <mask id="nc-c1-mid-mask">
                    <polygon points={BHUPURA_MAIN_PTS}  fill="white" />
                    <polygon points={BHUPURA_INNER_PTS} fill="black" />
                  </mask>
                </defs>
                <polygon points={BHUPURA_OUTER_PTS} fill="#7a1a1a" stroke="none" mask="url(#nc-c1-outer-mask)" />
                <polygon points={BHUPURA_MAIN_PTS}  fill="#7a1a1a" stroke="none" mask="url(#nc-c1-mid-mask)" />
                {BHUPURA_SQUARES.map((pts, i) => (
                  <polygon key={i} points={pts} fill="none" stroke="rgba(200,70,70,0.85)" strokeWidth={2.5} />
                ))}
              </>
            )}
            {listHighlightCircuit === 2 && C2_PATHS.map((d, i) => (
              <path key={i} d={d} fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75} />
            ))}
            {listHighlightCircuit === 3 && C3_PATHS.map((d, i) => (
              <path key={i} d={d} fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75} />
            ))}
            {listHighlightCircuit >= 4 && listHighlightCircuit <= 7 &&
              (TRI_CIRCUIT_POLYS[listHighlightCircuit] || []).map((pts, i) => (
                <polygon key={i} points={pts} fill="rgba(200,70,70,0.85)" stroke="#7a1a1a" strokeWidth={0.75} />
              ))
            }
          </svg>
        )}

        {/* Tooltip overlay — same viewBox as SriYantraSVG so coordinates match */}
        {tooltipCircuit && (
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="45 55 430 430"
            style={{ pointerEvents: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <Tooltip circuitNum={tooltipCircuit} script={script} />
          </svg>
        )}

        {/* Completion overlay (delayed 700 ms) */}
        {showCompletion && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
               style={{ background: 'rgba(15,8,5,0.82)' }}>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl text-center space-y-3"
                 style={{ maxWidth: '15rem', margin: '0 1rem' }}>
              <p className="iast text-gold-500 text-xs font-mono uppercase tracking-widest">navacakrēśvarī</p>
              <p className="text-cream text-sm">
                {Object.values(results).filter(v => v === 'correct').length === TOTAL
                  ? tr('misc.all_memorised')
                  : tr('spot.round_complete')}
              </p>
              <p className="text-muted text-xs">
                {Object.values(results).filter(v => v === 'correct').length}/{TOTAL} memorised
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={onStartMemorise}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors">
                  Try again
                </button>
                <button onClick={() => onNavigate && onNavigate('closing')}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile name strip — Explore mode — replaces SVG tooltip on touch */}
      {!memorise && lastTappedCircuit && (
        <div className="md:hidden text-center mt-2 px-2 min-h-[1.5rem]">
          <span className="iast text-cream text-sm leading-snug">
            {lastTappedCircuit}. {displayName(deityByCircuit[lastTappedCircuit], script)}
          </span>
        </div>
      )}

      {!memorise && exploreStep <= 9 && (
        <p className="md:hidden text-center text-xs mt-1.5 text-muted">
          {tr('nc.proceed')}
        </p>
      )}
      {memorise && <MobileMemoriseInstr tr={tr} />}

      <div className="h-0 md:h-8" />
    </div>
  )
}
