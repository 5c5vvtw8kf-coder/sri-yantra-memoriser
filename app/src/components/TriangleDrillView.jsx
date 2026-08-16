import { useState, useEffect } from 'react'
import { displayName, measureTooltipWidth } from '../utils.js'

/**
 * TriangleDrillView.jsx — Triangle Drill
 *
 * Same drill mechanics, state shape, and rendering approach as SegmentDrillView
 * and LineDrillView (this file is a close mirror of both — see SegmentDrillView's
 * header comment for the full rationale on preview/drill phases, region vs dot
 * fills, and colour palette). The structural difference: a "triangle" here is
 * one of the 9 primary (foundational) mūla triangles whose mutual intersections
 * construct the Śrī Yantra — 4 upward-facing "Śiva" triangles + 5 downward-facing
 * "Śakti" triangles — so the "true geometry" reveal is a single closed polygon
 * (the primary triangle itself), not a wedge fill + two boundary rays.
 *
 * Presentational component: all state (phase, triangle selection, drill index,
 * results) lives in App.jsx, same pattern as Segment/Line Drill.
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
const CX = 260

const pad = n => String(n).padStart(2, '0')

// Desktop hover tooltip — identical to SegmentDrillView's/LineDrillView's
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

// C1/C8 point dots — Memorise-mode palette, current-cream matches SC_ACTIVE
function dotColor(i, phase, previewStage, currentIndex, results) {
  if (phase === 'preview') return previewStage === 'fills' ? SC_ACTIVE : null
  if (phase === 'drill' || phase === 'done') {
    if (i < currentIndex || results[i]) {
      return results[i] === 'wrong' ? TERRACOTTA : (results[i] === 'correct' ? RED : DIM_GOLD)
    }
    if (i === currentIndex) return SC_ACTIVE
    return DIM_GOLD
  }
  return null
}

export default function TriangleDrillView({
  script = 'iast',
  triangleId,
  triangleLabel,
  phase,
  previewStage,
  currentIndex,
  results,
  stops,
  geometry,
  revealed,
  onActiveTap,
  onPastTap,
  SriYantraSVG,
  tr = k => k,
}) {
  const triShowing = phase === 'preview' && previewStage === 'line'
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [tapFocusIndex, setTapFocusIndex] = useState(null)

  useEffect(() => {
    setTapFocusIndex(null)
  }, [revealed, currentIndex])

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

  function handleRegionClick(regionId) {
    const i = regionToIndex[regionId]
    if (i === undefined) return
    if (i === currentIndex && phase === 'drill') onActiveTap(i)
    else if (i < currentIndex && phase === 'drill') onPastTap(i)
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
            aria-label={`Triangle Drill — ${triangleLabel || triangleId}`}
          >
            {/* True primary-triangle geometry — prominent for the first 2s, then a faint reference */}
            {geometry && (
              <polygon
                points={geometry.points}
                fill={CREAM}
                fillOpacity={triShowing ? 0.28 : 0.07}
                stroke={triShowing ? CREAM : GOLD}
                strokeWidth={triShowing ? 2.2 : 0.8}
                strokeOpacity={triShowing ? 1 : 0.4}
                style={{ pointerEvents: 'none', transition: 'fill-opacity 500ms ease, stroke-opacity 500ms ease, stroke-width 500ms ease' }}
              />
            )}

            {/* Transparent hover targets for region-based stops — rendered BEFORE the
                point-based dots below, same bindu-occlusion fix as Line/Segment Drill. */}
            {!triShowing && stops.map((s, i) => {
              if (!s.regionId || !s.pos) return null
              const hasColor = regionColor(i, phase, previewStage, currentIndex, results)
              if (!hasColor) return null
              return (
                <circle
                  key={`hit-${s.id}`}
                  cx={s.pos.x}
                  cy={s.pos.y}
                  r={16}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    setTapFocusIndex(i)
                    handleRegionClick(s.regionId)
                  }}
                />
              )
            })}

            {/* Point-based stops (C8 triangle's shared-shape deities) */}
            {!triShowing && stops.map((s, i) => {
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
                />
              )
            })}

            {/* Desktop hover tooltip */}
            {!triShowing && hoveredIndex != null && stops[hoveredIndex] && (
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
          <p className="text-xs text-muted font-mono">{tr('triangledrill.use_controls_below')}</p>
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
