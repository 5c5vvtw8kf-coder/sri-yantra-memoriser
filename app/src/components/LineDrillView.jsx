import { useState, useEffect } from 'react'
import { displayName, measureTooltipWidth } from '../utils.js'

/**
 * LineDrillView.jsx — Line Drill alpha (diagram only)
 *
 * Presentational component: all state (phase, line selection, drill index,
 * results) lives in App.jsx, same pattern as C4View/C4MemoriseInfo etc.
 * Picker, shuffle, start/back, progress and name-reveal controls live in the
 * desktop right panel and the mirrored mobile block in App.jsx.
 *
 * Sized and positioned identically to SpotCheckView's diagram: fixed
 * viewBox, square via padding-bottom 100%, no per-viewport switching.
 *
 * Preview reveal: the line's true straight geometry (edge-to-edge, same as
 * the design tool) shows alone for ~2s, then fades back as every stop on
 * the line fills in cream — real petal/triangle shapes for C2-C7/C9 (via
 * SriYantraSVG's filledRegions, same mechanism SpotCheckView uses), dots
 * only for C1/C8 where several deities can share one physical shape.
 *
 * Colour states:
 *   Petal/triangle/bindu fills use SpotCheckView's exact palette (SC_* below)
 *   so Line Drill's shapes look identical to Spot Check's.
 *   C1/C8 dots (several deities sharing one physical shape) keep the
 *   Memorise-mode DIM_GOLD/CREAM/RED/TERRACOTTA palette.
 */

const CREAM      = '#fff8c8'
const RED        = '#c0392b'
const TERRACOTTA = '#8b4513'
const DIM_GOLD   = 'rgba(201,168,76,0.35)'
const GOLD       = '#c9a84c'
const BG         = '#0f0805'

// SpotCheckView's exact fill colours (see computeFills() in SpotCheckView.jsx)
const SC_BG_DIM     = 'rgba(138,117,96,0.35)'   // not yet reached
const SC_ACTIVE     = 'rgba(255,248,200,0.90)'  // current stop
const SC_RESULT_RED  = 'rgba(248,113,113,0.55)' // answered correct
const SC_RESULT_GOLD = 'rgba(201,168,76,0.80)'  // answered wrong

// Focus highlight — same red used elsewhere for hover/selected (BhupuraView,
// C2View etc.), not to be confused with SC_RESULT_RED's softer "correct" tone.
const FOCUS_RED_DOT    = '#c0392b'
const FOCUS_RED_REGION = 'rgba(200,70,70,0.85)'

const VIEWBOX = '45 55 430 430'
const CY = 270

const pad = n => String(n).padStart(2, '0')

// Desktop hover tooltip — ported from SpotCheckView's Tooltip so both modes match
function Tooltip({ x, y, label, script, clearance = 22 }) {
  if (!label) return null
  const fontSize = script === 'devanagari' ? 26 : script === 'english' ? 25 : 24
  const h        = script === 'devanagari' ? 52 : script === 'english' ? 50 : 48
  const w = measureTooltipWidth(label, fontSize, 18, 60)
  const tx = Math.min(Math.max(x, w / 2 + 49), 471 - w / 2)
  const rawTy = y > CY ? y - h / 2 - clearance : y + h / 2 + clearance
  const ty = Math.min(Math.max(rawTy, 55 + h / 2 + 4), 485 - h / 2 - 4)
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(15,8,5,0.93)" stroke="#c9a84c" strokeWidth={0.6}
      />
      <text
        x={tx.toFixed(1)} y={ty.toFixed(1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill="#c9a84c" fontFamily="'Gentium Plus', Georgia, serif"
      >
        {label}
      </text>
    </g>
  )
}

function tooltipClearance(sectionId) {
  if (sectionId === 'circuit-1') return 22
  if (sectionId === 'circuit-2') return 75
  if (sectionId === 'circuit-3') return 62
  if (sectionId === 'circuit-7') return 52
  if (sectionId === 'circuit-8') return 22
  return 65 // C4, C5, C6
}

// Static baseline — every fillable region starts "not yet reached".
// C8's own triangle stays a plain backdrop (the 7 C8 deities are drawn as
// individual dots on top of it, since they share one physical triangle).
const BASE_REGION_FILLS = {
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${pad(i + 1)}`, SC_BG_DIM])),
  ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`petal-c3-${pad(i + 1)}`, SC_BG_DIM])),
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${pad(i + 1)}`, SC_BG_DIM])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${pad(i + 1)}`, SC_BG_DIM])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${pad(i + 1)}`, SC_BG_DIM])),
  ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`tri-c7-${pad(i + 1)}`, SC_BG_DIM])),
  'tri-c8-01':    SC_BG_DIM,
  'tri-c8-bg-01': BG,
  'tri-c8-bg-02': BG,
  'c9':           '#000000',
}

// Petal/triangle/bindu region fills — Spot Check's palette
function regionColor(i, phase, previewStage, currentIndex, results) {
  if (phase === 'preview') return previewStage === 'fills' ? SC_ACTIVE : null
  if (phase === 'drill' || phase === 'done') {
    if (i < currentIndex || results[i]) {
      return results[i] === 'wrong' ? SC_RESULT_GOLD : (results[i] === 'correct' ? SC_RESULT_RED : SC_BG_DIM)
    }
    if (i === currentIndex) return SC_ACTIVE
    return SC_BG_DIM
  }
  return null
}

// C1/C8 point dots — the "current" cream fill matches SC_ACTIVE exactly so
// dots read as the same cream as the petal/triangle regions, not a slightly
// different solid hex. Wrong-answer fill matches regionColor's SC_RESULT_GOLD
// (gold, not Memorise-mode's brown TERRACOTTA) so dots and regions read
// consistently within Drill views.
function dotColor(i, phase, previewStage, currentIndex, results) {
  if (phase === 'preview') return previewStage === 'fills' ? SC_ACTIVE : null
  if (phase === 'drill' || phase === 'done') {
    if (i < currentIndex || results[i]) {
      return results[i] === 'wrong' ? SC_RESULT_GOLD : (results[i] === 'correct' ? RED : DIM_GOLD)
    }
    if (i === currentIndex) return SC_ACTIVE
    return DIM_GOLD
  }
  return null
}

export default function LineDrillView({
  script = 'iast',
  lineId,
  phase,
  previewStage,
  currentIndex,
  results,
  stops,
  geometry,
  revealed,
  onActiveTap,
  onPastTap,
  onPastRightClick,
  SriYantraSVG,
  tr = k => k,
}) {
  const lineShowing = phase === 'preview' && previewStage === 'line'
  const [hoveredIndex, setHoveredIndex] = useState(null)
  // Mobile/iPad have no hover — tapping the focus deity sets this immediately
  // (before the tap-vs-double-tap debounce resolves into a result), so touch
  // gets the same instant red highlight desktop hover gives.
  const [tapFocusIndex, setTapFocusIndex] = useState(null)

  useEffect(() => {
    setTapFocusIndex(null)
  }, [revealed, currentIndex])

  // Any visible stop turns red on hover (desktop) or tap (mobile/iPad) —
  // matches the hover/selected convention used on the other view pages
  // (BhupuraView, C2View etc.), regardless of whether it's the current
  // quiz target or a past stop.
  const isFocusHighlighted = i => hoveredIndex === i || tapFocusIndex === i

  // Region-based fills (C2/C3 petals, C4-C7 triangles, C9 bindu)
  const regionFills = { ...BASE_REGION_FILLS }
  const regionToIndex = {}
  stops.forEach((s, i) => {
    if (!s.regionId) return
    regionToIndex[s.regionId] = i
    const color = isFocusHighlighted(i) ? FOCUS_RED_REGION : regionColor(i, phase, previewStage, currentIndex, results)
    if (color) regionFills[s.regionId] = color
  })

  // See TriangleDrillView's hitRadiusFor comment: caps a region-based stop's
  // invisible hover/click hit-circle so it can never overlap a neighbouring
  // stop's own hit-circle (some inner-circuit triangles sit as little as ~11
  // units apart, well inside the default 16-unit radius).
  function hitRadiusFor(index) {
    const s = stops[index]
    if (!s?.pos) return 16
    let r = 16
    stops.forEach((other, j) => {
      if (j === index || !other.pos) return
      const d = Math.hypot(other.pos.x - s.pos.x, other.pos.y - s.pos.y)
      r = Math.min(r, d / 2 - 1)
    })
    return Math.max(r, 4)
  }

  function handleRegionClick(regionId) {
    const i = regionToIndex[regionId]
    if (i === undefined) return
    if (i === currentIndex && phase === 'drill') onActiveTap(i)
    else if (i < currentIndex && phase === 'drill') onPastTap(i)
  }

  // Desktop right-click on a past stop toggles it immediately — see
  // TriangleDrillView's handleRegionRightClick comment for why this is separate
  // from onPastTap's double-invocation (mobile double-tap) logic.
  function handleRegionRightClick(regionId) {
    const i = regionToIndex[regionId]
    if (i === undefined) return
    if (i < currentIndex && phase === 'drill' && onPastRightClick) onPastRightClick(i)
  }

  return (
    <div className="w-full px-4 pt-3 pb-2">
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
        style={{ paddingBottom: '100%', WebkitTouchCallout: 'none', userSelect: 'none' }}
      >
        <div className="absolute inset-0">
          <SriYantraSVG
            className="w-full h-full"
            viewBox={VIEWBOX}
            showTriangles={true}
            filledRegions={regionFills}
            onRegionClick={handleRegionClick}
          />

          <svg
            viewBox={VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label={`Line Drill — ${lineId}`}
          >
            {/* True straight line — prominent for the first 2s, then a faint reference */}
            {geometry && (
              <line
                x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2}
                stroke={lineShowing ? CREAM : GOLD}
                strokeWidth={lineShowing ? 2.2 : 0.8}
                strokeOpacity={lineShowing ? 1 : 0.4}
                style={{ pointerEvents: 'none', transition: 'stroke-opacity 500ms ease, stroke-width 500ms ease' }}
              />
            )}

            {/* Transparent hover targets for region-based stops (petals/triangles/bindu) —
                desktop-only tooltip; the region fill itself already handles clicks.
                Rendered BEFORE the point-based dots below: the bindu's hit-circle
                (r=16) is large enough to blanket the tiny C8 triangle next to it,
                so C8's dots must paint on top to win the hit-test, not the other
                way round. */}
            {!lineShowing && stops.map((s, i) => {
              if (!s.regionId || !s.pos) return null
              const hasColor = regionColor(i, phase, previewStage, currentIndex, results)
              if (!hasColor) return null
              return (
                <circle
                  key={`hit-${s.id}`}
                  cx={s.pos.x}
                  cy={s.pos.y}
                  r={hitRadiusFor(i)}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    setTapFocusIndex(i)
                    handleRegionClick(s.regionId)
                  }}
                  onContextMenu={e => { e.preventDefault(); handleRegionRightClick(s.regionId) }}
                />
              )
            })}

            {/* Point-based stops (C1 markers, C8 triangle's 7 shared-shape deities) */}
            {!lineShowing && stops.map((s, i) => {
              if (s.regionId || !s.pos) return null
              const isActive = phase === 'drill' && i === currentIndex
              const isPast   = phase === 'drill' && i < currentIndex
              const fill = isFocusHighlighted(i) ? FOCUS_RED_DOT : dotColor(i, phase, previewStage, currentIndex, results)
              if (!fill) return null
              return (
                <circle
                  key={s.id}
                  cx={s.pos.x}
                  cy={s.pos.y}
                  r={isActive ? 4 : 3.2}
                  fill={fill}
                  stroke={GOLD}
                  strokeWidth="0.6"
                  style={{ cursor: (isActive || isPast) ? 'pointer' : 'default' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    setTapFocusIndex(i)
                    if (isActive) onActiveTap(i)
                    else if (isPast) onPastTap(i)
                  }}
                  onContextMenu={e => {
                    e.preventDefault()
                    if (isPast && onPastRightClick) onPastRightClick(i)
                  }}
                />
              )
            })}

            {/* Desktop hover tooltip */}
            {!lineShowing && hoveredIndex != null && stops[hoveredIndex] && (
              <Tooltip
                x={stops[hoveredIndex].pos.x}
                y={stops[hoveredIndex].pos.y}
                label={displayName(stops[hoveredIndex].deity, script)}
                script={script}
                clearance={tooltipClearance(stops[hoveredIndex].deity?.sectionId)}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Mobile-only name-reveal strip — desktop uses the right panel instead */}
      <div className="mt-2 min-h-[2.5rem] flex flex-col items-center justify-center text-center px-2 md:hidden">
        {phase === 'preview' && (
          <p className="text-xs text-muted font-mono">{tr('linedrill.use_controls_below')}</p>
        )}
        {phase === 'drill' && (() => {
          const stripDeity = stops[currentIndex]?.deity
          return (
            <p className="text-sm font-serif" style={{ color: revealed ? CREAM : 'transparent', fontFamily: "'Gentium Plus', Georgia, serif" }}>
              {stripDeity ? `${stripDeity.scripts[script] || stripDeity.scripts.iast} — ${stripDeity.scripts.devanagari}` : ''}
            </p>
          )
        })()}
        {phase === 'drill' && !revealed && (
          <p className="text-xs text-muted font-mono absolute">{tr('instr.tap_reveal')}</p>
        )}
        {phase === 'drill' && (
          <div className="flex flex-col items-center gap-0.5 pt-1 pb-0.5"
               style={{ fontSize: '11px', fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(201,168,76,0.55)', letterSpacing: '0.02em' }}>
            <span>{tr('instr.tap_reveal')} · <span style={{ color: '#f87171' }}>{tr('instr.tap_again_correct')}</span></span>
            <span><span style={{ color: '#c9a84c' }}>{tr('instr.dbltap_wrong')}</span> · <span style={{ color: '#c9a84c' }}>{tr('instr.dbltap_toggle')}</span></span>
          </div>
        )}
      </div>
    </div>
  )
}
