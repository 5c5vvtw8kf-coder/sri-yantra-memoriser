/**
 * korvinGeometry.js
 *
 * Single source of truth for the Sri Yantra geometry used by the four
 * "central triangle" views: InnerView (Tithi Nitya Devatas), GuravaView,
 * C8View (8th avarana) and C9View (9th avarana / bindu).
 *
 * THE APPROACH
 * ------------
 * The nine triangles of the Sri Yantra come from the Korvin construction
 * (korvin-construction.html) — the authoritative geometry for this project.
 *
 * The MAIN triangle for these four views is the CENTRAL triangle of the
 * yantra — the small downward triangle that holds the bindu. Its apex is
 * DFT5's apex; its lid (top edge) lies on DFT4's base line; its two sides
 * run along DFT5's sides.
 *
 * The central triangle is ENLARGED and centred in the viewport. Every other
 * triangle is drawn at the SAME scale, in its true position relative to the
 * central triangle. Because the others are far larger, they run off the
 * edges of the viewBox and are clipped. The scale is locked to the central
 * triangle — the surrounding triangles are never shrunk to fit. One
 * transform, applied to all nine triangles.
 *
 * To resize the whole figure, change SCALE and nothing else.
 */

// ── The nine Korvin triangles, construction coordinates ───────────────────────
// Format: [apex, baseCornerA, baseCornerB]. Source: korvin-construction.html
// NOTE: DFT3 and UFT4 base corners were snapped (~1 unit) from their raw
// korvin-construction.html values so DFT3's edge, UFT4's edge and UFT3's base
// meet at one point — removing two tiny spurious triangles in the even-odd
// fill. Do not restore the raw values without re-checking that concurrency.
const KORVIN = {
  UFT1: [[260, 160.000], [154.021, 299.470], [365.979, 299.470]],
  UFT2: [[260, 182.872], [186.892, 326.795], [333.108, 326.795]],
  UFT3: [[260, 213.400], [224.257, 283.301], [295.743, 283.301]],
  UFT4: [[260, 236.760], [211.992, 350.380], [308.008, 350.380]],
  DFT1: [[260, 380.000], [155.140, 236.760], [364.860, 236.760]],
  DFT2: [[260, 350.385], [187.866, 213.400], [332.134, 213.400]],
  DFT3: [[260, 326.795], [225.536, 250.569], [294.464, 250.569]],
  DFT4: [[260, 299.512], [234.780, 263.193], [285.220, 263.193]],
  DFT5: [[260, 283.301], [202.888, 182.872], [317.112, 182.872]],
}

const KORVIN_BINDU = [260, 270]

// ── Derive the central triangle from DFT5 and DFT4 ────────────────────────────
// Apex    = DFT5's apex.
// Lid     = DFT4's base line.
// Corners = where DFT5's two sides cross that line.
function centralTriangle() {
  const [apex, dft5L, dft5R] = KORVIN.DFT5
  const lidY = KORVIN.DFT4[1][1]
  const cross = (corner) => {
    const t = (lidY - apex[1]) / (corner[1] - apex[1])
    return [apex[0] + (corner[0] - apex[0]) * t, lidY]
  }
  return [apex, cross(dft5L), cross(dft5R)]
}
const KORVIN_CENTRAL = centralTriangle()

// ── Korvin → screen transform ─────────────────────────────────────────────────
// Uniform scale, no rotation. The central triangle is enlarged so it sits
// where the previous main triangle sat: centroid at (250, 431), on-screen
// height ~161. Every triangle uses this one transform.
const SCALE = 8

const centroidOf = (tri) => [
  (tri[0][0] + tri[1][0] + tri[2][0]) / 3,
  (tri[0][1] + tri[1][1] + tri[2][1]) / 3,
]
const KORVIN_REF = centroidOf(KORVIN_CENTRAL)
const SCREEN_REF = [250, 431]

const toScreen = ([x, y]) => [
  SCALE * (x - KORVIN_REF[0]) + SCREEN_REF[0],
  SCALE * (y - KORVIN_REF[1]) + SCREEN_REF[1],
]

const triToPoints = (tri) =>
  tri.map(toScreen).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

// ── Exports — screen-space geometry the views consume ─────────────────────────
// The central (main) triangle:
const [APEX, BASE_L, BASE_R] = KORVIN_CENTRAL.map(toScreen)
const CENTROID = [...SCREEN_REF]
const BINDU    = toScreen(KORVIN_BINDU)

// All nine triangles as SVG "points" strings, for the faint context geometry.
// Most run well beyond the viewBox and are clipped — that is expected.
const CONTEXT_TRIS = Object.values(KORVIN).map(triToPoints)

// All nine triangles as one SVG path. Render with fillRule="evenodd" and a low
// fill opacity: regions inside an odd number of triangles are filled, which
// reproduces the Sri Yantra's interior shading around the central triangle.
const CONTEXT_FILL_PATH = Object.values(KORVIN)
  .map((tri) => {
    const [a, b, c] = tri
      .map(toScreen)
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    return `M${a} L${b} L${c} Z`
  })
  .join(' ')

// ── The Guravah trapezoid ─────────────────────────────────────────────────────
// The dark even-odd cell directly above the central triangle: UFT4's two edges
// are the sloping sides, the central triangle's base (DFT4's base line) is the
// bottom, and DFT3's base line is the top. GuravaView lays the 19 guru-lineage
// dots inside its lower half.
const GURU_TRAPEZOID = (() => {
  const lineX = (p, q, y) => p[0] + (q[0] - p[0]) * ((y - p[1]) / (q[1] - p[1]))
  const u4 = KORVIN.UFT4.map(toScreen)        // [apex, baseL, baseR]
  const yBottom = BASE_L[1]                    // central triangle base = DFT4 base line
  const yTop = toScreen(KORVIN.DFT3[1])[1]     // DFT3 base line
  return {
    yTop, yBottom,
    topLeft:     [lineX(u4[0], u4[1], yTop), yTop],
    topRight:    [lineX(u4[0], u4[2], yTop), yTop],
    bottomLeft:  [lineX(u4[0], u4[1], yBottom), yBottom],
    bottomRight: [lineX(u4[0], u4[2], yBottom), yBottom],
  }
})()

export { APEX, BASE_L, BASE_R, CENTROID, BINDU, CONTEXT_TRIS, CONTEXT_FILL_PATH, GURU_TRAPEZOID }
