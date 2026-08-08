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
 * Colour states (same as Memorise mode):
 *   DIM_GOLD  = not yet reached
 *   CREAM     = current stop (drill) / all stops (preview fills stage)
 *   RED       = answered correct
 *   TERRACOTTA = answered wrong
 */

const CREAM      = '#fff8c8'
const RED        = '#c0392b'
const TERRACOTTA = '#8b4513'
const DIM_GOLD   = 'rgba(201,168,76,0.35)'
const GOLD       = '#c9a84c'
const BG         = '#0f0805'

const VIEWBOX = '45 55 430 430'

const pad = n => String(n).padStart(2, '0')

// Static baseline — every fillable region starts "not yet reached".
// C8's own triangle stays a plain backdrop (the 7 C8 deities are drawn as
// individual dots on top of it, since they share one physical triangle).
const BASE_REGION_FILLS = {
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`petal-c2-${pad(i + 1)}`, DIM_GOLD])),
  ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`petal-c3-${pad(i + 1)}`, DIM_GOLD])),
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`tri-c4-${pad(i + 1)}`, DIM_GOLD])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c5-${pad(i + 1)}`, DIM_GOLD])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tri-c6-${pad(i + 1)}`, DIM_GOLD])),
  ...Object.fromEntries(Array.from({ length:  8 }, (_, i) => [`tri-c7-${pad(i + 1)}`, DIM_GOLD])),
  'tri-c8-01':    DIM_GOLD,
  'tri-c8-bg-01': BG,
  'tri-c8-bg-02': BG,
  'c9':           BG,
}

function stopColor(i, phase, previewStage, currentIndex, results) {
  if (phase === 'preview') return previewStage === 'fills' ? CREAM : null
  if (phase === 'drill' || phase === 'done') {
    if (i < currentIndex || results[i]) {
      return results[i] === 'wrong' ? TERRACOTTA : (results[i] === 'correct' ? RED : DIM_GOLD)
    }
    if (i === currentIndex) return CREAM
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
  SriYantraSVG,
}) {
  const lineShowing = phase === 'preview' && previewStage === 'line'

  // Region-based fills (C2/C3 petals, C4-C7 triangles, C9 bindu)
  const regionFills = { ...BASE_REGION_FILLS }
  const regionToIndex = {}
  stops.forEach((s, i) => {
    if (!s.regionId) return
    regionToIndex[s.regionId] = i
    const color = stopColor(i, phase, previewStage, currentIndex, results)
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
            aria-label={`Line Drill — ${lineId}`}
          >
            {/* True straight line — prominent for the first 2s, then a faint reference */}
            {geometry && (
              <line
                x1={geometry.x1} y1={geometry.y1} x2={geometry.x2} y2={geometry.y2}
                stroke={GOLD}
                strokeWidth={lineShowing ? 1.4 : 0.8}
                strokeOpacity={lineShowing ? 0.9 : 0.4}
                style={{ pointerEvents: 'none', transition: 'stroke-opacity 500ms ease, stroke-width 500ms ease' }}
              />
            )}

            {/* Point-based stops (C1 markers, C8 triangle's 7 shared-shape deities) */}
            {!lineShowing && stops.map((s, i) => {
              if (s.regionId || !s.pos) return null
              const fill = stopColor(i, phase, previewStage, currentIndex, results)
              if (!fill) return null
              const isActive = phase === 'drill' && i === currentIndex
              const isPast   = phase === 'drill' && i < currentIndex
              return (
                <circle
                  key={s.id}
                  cx={s.pos.x}
                  cy={s.pos.y}
                  r={isActive ? 5.5 : 4.5}
                  fill={fill}
                  stroke="#0f0805"
                  strokeWidth="0.6"
                  style={{ cursor: (isActive || isPast) ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (isActive) onActiveTap(i)
                    else if (isPast) onPastTap(i)
                  }}
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* Mobile-only name-reveal strip — desktop uses the right panel instead */}
      <div className="mt-2 min-h-[2.5rem] flex items-center justify-center text-center px-2 md:hidden">
        {phase === 'preview' && (
          <p className="text-xs text-muted font-mono">Use the controls below to start, pick, or shuffle a line.</p>
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
          <p className="text-xs text-muted font-mono absolute">tap to reveal</p>
        )}
      </div>
    </div>
  )
}
