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
 * Colour states (same as Memorise mode):
 *   DIM_GOLD  = not yet reached
 *   CREAM     = current stop (drill) / all stops (preview)
 *   RED       = answered correct
 *   TERRACOTTA = answered wrong
 */

const CREAM      = '#fff8c8'
const RED        = '#c0392b'
const TERRACOTTA = '#8b4513'
const DIM_GOLD   = 'rgba(201,168,76,0.35)'
const GOLD       = '#c9a84c'

const VIEWBOX = '45 55 430 430'

export default function LineDrillView({
  script = 'iast',
  lineId,
  phase,
  currentIndex,
  results,
  stops,
  revealed,
  onActiveTap,
  onPastTap,
  SriYantraSVG,
}) {
  const strokePoints = stops
    .filter(s => s.pos)
    .map(s => `${s.pos.x},${s.pos.y}`)
    .join(' ')

  return (
    <div className="w-full px-4 pt-3 pb-2">
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
        style={{ paddingBottom: '100%', WebkitTouchCallout: 'none', userSelect: 'none' }}
      >
        <div className="absolute inset-0">
          <SriYantraSVG className="w-full h-full" viewBox={VIEWBOX} showTriangles={true} />

          <svg
            viewBox={VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            style={{ background: 'transparent' }}
            aria-label={`Line Drill — ${lineId}`}
          >
            {strokePoints && (
              <polyline points={strokePoints} fill="none" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.55" style={{ pointerEvents: 'none' }} />
            )}

            {stops.map((s, i) => {
              if (!s.pos) return null
              let fill = DIM_GOLD
              let r = 4.5
              if (phase === 'preview') {
                fill = CREAM
              } else if (phase === 'drill' || phase === 'done') {
                if (i < currentIndex || results[i]) {
                  fill = results[i] === 'wrong' ? TERRACOTTA : (results[i] === 'correct' ? RED : DIM_GOLD)
                } else if (i === currentIndex) {
                  fill = CREAM
                  r = 5.5
                }
              }
              const isActive = phase === 'drill' && i === currentIndex
              const isPast   = phase === 'drill' && i < currentIndex
              return (
                <circle
                  key={s.id}
                  cx={s.pos.x}
                  cy={s.pos.y}
                  r={r}
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
