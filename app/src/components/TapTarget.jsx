/**
 * TapTarget — invisible, enlarged hit area for small SVG dots.
 *
 * The visible dot keeps its exact size; this layer sits on top of it and
 * catches taps/clicks/hovers over a larger area so dots register on a phone
 * without zooming.
 *
 * Two parts:
 *   1. A "fair share" cell around every dot — a circle of radius maxR, clipped
 *      against the perpendicular bisector with every neighbouring dot (i.e. a
 *      Voronoi cell capped at maxR). Cells never overlap, so a generous zone
 *      can never steal a tap from the neighbour that was actually nearer.
 *   2. For the dot the user is expected to tap next (Explore focus dot /
 *      Memorise active dot), a full circle of radius maxR on top — the
 *      ~44 px target recommended for touch, even where dots are tightly packed.
 *
 * The original visible-dot radius is always included as well, so no dot is
 * ever harder to hit than it was before.
 */

// Target tap radius in CSS px (44 px diameter — Apple HIG minimum touch target).
export const TAP_TARGET_PX = 22

// Convert the px target into SVG user units for a given viewBox width, assuming
// the yantra renders roughly full-width on a standard phone (~360 px).
export const tapRadiusFor = (viewBoxWidth, renderedPx = 360) =>
  TAP_TARGET_PX * (viewBoxWidth / renderedPx)

const keyOf = (x, y) => `${Math.round(Number(x) * 10)}|${Math.round(Number(y) * 10)}`

// Sutherland–Hodgman clip of a convex polygon against the half-plane a·x + b·y <= c
function clipHalfPlane(poly, a, b, c) {
  const out = []
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i]
    const Q = poly[(i + 1) % poly.length]
    const fp = a * P[0] + b * P[1] - c
    const fq = a * Q[0] + b * Q[1] - c
    if (fp <= 0) out.push(P)
    if ((fp <= 0) !== (fq <= 0)) {
      const t = fp / (fp - fq)
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])])
    }
  }
  return out
}

/**
 * Build non-overlapping tap cells for a set of dot positions.
 * @param {Array<[number, number]>} points  every dot position in the view
 * @param {number} maxR                     maximum cell radius (SVG units)
 * @returns {(x:number, y:number) => string|null}  polygon `points` string for a dot
 */
export function makeTapCells(points, maxR, { sides = 32, gap = 0.6 } = {}) {
  const cells = new Map()
  for (const [px, py] of points) {
    const k = keyOf(px, py)
    if (cells.has(k)) continue
    let poly = Array.from({ length: sides }, (_, i) => {
      const a = (2 * Math.PI * i) / sides
      return [px + maxR * Math.cos(a), py + maxR * Math.sin(a)]
    })
    for (const [qx, qy] of points) {
      const dx = qx - px, dy = qy - py
      const dist = Math.hypot(dx, dy)
      if (dist < 0.5 || dist >= 2 * maxR) continue   // same spot (shared position) or too far to matter
      const c = dx * (px + qx) / 2 + dy * (py + qy) / 2 - (gap / 2) * dist
      poly = clipHalfPlane(poly, dx, dy, c)
      if (poly.length < 3) break
    }
    cells.set(k, poly.length >= 3
      ? poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
      : null)
  }
  return (x, y) => cells.get(keyOf(x, y)) ?? null
}

/**
 * Invisible hit area. Pass the same event handlers the dot used to carry.
 * @param {number} r       visible dot radius (always included)
 * @param {string} cell    polygon points from makeTapCells
 * @param {number} focusR  if > 0, adds a full circle of this radius (focus/active dot)
 */
export default function TapTarget({ x, y, r, cell, focusR = 0, ...handlers }) {
  const cx = Number(x).toFixed(1), cy = Number(y).toFixed(1)
  return (
    <g
      fill="transparent"
      stroke="none"
      pointerEvents="all"
      style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
      {...handlers}
    >
      {cell && <polygon points={cell} />}
      {focusR > 0 && <circle cx={cx} cy={cy} r={focusR} />}
      <circle cx={cx} cy={cy} r={r} />
    </g>
  )
}
