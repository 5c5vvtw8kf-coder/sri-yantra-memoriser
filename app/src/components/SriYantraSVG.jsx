import TRIANGLE_REGIONS from '../data/triangle-regions.json'

/**
 * SriYantraSVG.jsx — Korvin-construction coordinate system.
 *
 * Coordinate system:
 *   SVG space only — no normalised math coords.
 *   Centre: CX=260, CY=270   Radius: R=110
 *   viewBox: "73.822 83.822 372.356 372.356"
 */

// ── Constants ────────────────────────────────────────────────────────────────

const CX       = 260
const CY       = 270
const R        = 110
const BINDU_CY = 270   // exact centre of yantra (CY)

// ── Triangle polygon strings (Korvin absolute SVG coords) ────────────────────

const UFT_POLYS = [
  { points: '260,160 154.021,299.47 365.979,299.47',       label: 'UFT1' },
  { points: '260,182.872 186.892,326.795 333.108,326.795', label: 'UFT2' },
  { points: '260,213.4 224.257,283.301 295.743,283.301',   label: 'UFT3' },
  { points: '260,236.76 210.849,350.38 309.151,350.38',    label: 'UFT4' },
]

const DFT_POLYS = [
  { points: '260,380 155.14,236.76 364.86,236.76',         label: 'DFT1' },
  { points: '260,350.385 187.866,213.4 332.134,213.4',     label: 'DFT2' },
  { points: '260,326.795 226.379,250.569 293.621,250.569', label: 'DFT3' },
  { points: '260,299.512 234.78,263.193 285.22,263.193',   label: 'DFT4' },
  { points: '260,283.301 202.888,182.872 317.112,182.872', label: 'DFT5' },
]

// ── Petal path generator ──────────────────────────────────────────────────────
//
// Each petal is ONE smooth cubic bezier per side, running from base corner to tip.
// No straight sections, no joints — fully organic curve throughout.
//
//   M iL  C(cp1L cp2L tip)  C(cp2R cp1R iR)  A(inner arc)  Z
//
// WIDTH CONDITION (structural invariant, not a guideline):
//   w = Rin * sin(halfSlot)  — base half-width, the absolute maximum lateral extent.
//   CP1 lateral = cp1W * w  (≤ w)
//   CP2 lateral = cp2W * w  (≤ w)
//   Bezier convex hull property: the curve cannot exceed max(control-point laterals).
//   ∴ petals NEVER exceed base width. Guaranteed regardless of parameter values.
//
// Coordinate convention: angle 0° = top, increases clockwise.

function _petalPt(r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)]
}
function _fp([x, y]) { return `${x.toFixed(3)},${y.toFixed(3)}` }

/**
 * petalPath — single smooth cubic bezier per side.
 *
 *   angleDeg : centre angle (0 = top, clockwise)
 *   Rin/Rout : inner / outer radii
 *   halfSlot : half angular slot
 *   cp1H     : height fraction (0–1) for CP1 — how high the full-width shoulder extends
 *              1.0 = side starts vertically from base and holds width all the way up
 *   cp1W     : lateral fraction (0–1) of base-width for CP1
 *              1.0 = side leaves base corner perfectly vertical (natural petal start)
 *   cp2H     : height fraction (0–1) for CP2 — where the sweep to the tip begins
 *   cp2W     : lateral fraction (0–1) of base-width for CP2
 *              near 0 = sharp point; 0.07–0.12 = natural curved tip
 */
function petalPath(angleDeg, Rin, Rout, halfSlot, cp1H, cp1W, cp2H, cp2W) {
  const theta  = angleDeg * Math.PI / 180
  const w      = Rin * Math.sin(halfSlot * Math.PI / 180)   // base half-width (CONDITION max)
  const hBase  = Rin * Math.cos(halfSlot * Math.PI / 180)
  const hTip   = Rout

  // Point at axis-height h, lateral distance lat (positive = left of axis at θ=0)
  function sp(h, lat) {
    return [CX + h * Math.sin(theta) - lat * Math.cos(theta),
            CY - h * Math.cos(theta) - lat * Math.sin(theta)]
  }

  const iL  = _petalPt(Rin,  angleDeg - halfSlot)
  const iR  = _petalPt(Rin,  angleDeg + halfSlot)
  const tip = _petalPt(Rout, angleDeg)

  const h1 = hBase + cp1H * (hTip - hBase)
  const h2 = hBase + cp2H * (hTip - hBase)

  // CP1: high lateral → shoulder holds near-full width through the petal body
  const cp1L = sp(h1,  cp1W * w)
  const cp1R = sp(h1, -cp1W * w)

  // CP2: low lateral → sweeps the side inward to the tip point
  const cp2L = sp(h2,  cp2W * w)
  const cp2R = sp(h2, -cp2W * w)

  return [
    `M ${_fp(iL)}`,
    `C ${_fp(cp1L)} ${_fp(cp2L)} ${_fp(tip)}`,   // left side — one smooth cubic
    `C ${_fp(cp2R)} ${_fp(cp1R)} ${_fp(iR)}`,    // right side (reverse)
    `A ${Rin} ${Rin} 0 0 0 ${_fp(iL)}`,           // inner arc closes the base
    `Z`,
  ].join(' ')
}

// ── Petal arrays — computed from generators ───────────────────────────────────
//
// C3 (8 petals): wide crown shape, 45° apart.
// Stotra order [1,5,2,6,3,7,4,8] maps to angles [0°,45°,90°,135°,180°,225°,270°,315°].
//
// C2 (16 petals): pointed shape, 22.5° apart.
// Stotra order [9,8,7,...,10] maps to angles [0°, 22.5°, 45°, ...].
//
// Petal ring radii:
//   C3: Rin=110 (R), Rout=123.301
//   C2: Rin=123.301, Rout=143.24

const C3_RIN = R,       C3_ROUT = 123.301
const C2_RIN = 123.301, C2_ROUT = 143.24

const C3_PETALS = [
  { id: 'petal-c3-01', angle:   0 },
  { id: 'petal-c3-05', angle:  45 },
  { id: 'petal-c3-02', angle:  90 },
  { id: 'petal-c3-06', angle: 135 },
  { id: 'petal-c3-03', angle: 180 },
  { id: 'petal-c3-07', angle: 225 },
  { id: 'petal-c3-04', angle: 270 },
  { id: 'petal-c3-08', angle: 315 },
].map(({ id, angle }) => {
  const [cx, cy] = _petalPt((C3_RIN + C3_ROUT) / 2, angle)
  return {
    id, cx, cy,
    //                          halfSlot  cp1H   cp1W  cp2H   cp2W
    path: petalPath(angle, C3_RIN, C3_ROUT, 22.5,  0.75, 1.0,  0.86,  0.09),
  }
})

const C2_PETALS = [
  { id: 'petal-c2-09', angle:   0   },
  { id: 'petal-c2-08', angle:  22.5 },
  { id: 'petal-c2-07', angle:  45   },
  { id: 'petal-c2-06', angle:  67.5 },
  { id: 'petal-c2-05', angle:  90   },
  { id: 'petal-c2-04', angle: 112.5 },
  { id: 'petal-c2-03', angle: 135   },
  { id: 'petal-c2-02', angle: 157.5 },
  { id: 'petal-c2-01', angle: 180   },
  { id: 'petal-c2-16', angle: 202.5 },
  { id: 'petal-c2-15', angle: 225   },
  { id: 'petal-c2-14', angle: 247.5 },
  { id: 'petal-c2-13', angle: 270   },
  { id: 'petal-c2-12', angle: 292.5 },
  { id: 'petal-c2-11', angle: 315   },
  { id: 'petal-c2-10', angle: 337.5 },
].map(({ id, angle }) => {
  const [cx, cy] = _petalPt((C2_RIN + C2_ROUT) / 2, angle)
  return {
    id, cx, cy,
    //                          halfSlot   cp1H   cp1W  cp2H   cp2W
    path: petalPath(angle, C2_RIN, C2_ROUT, 11.25,  0.75, 1.0,  0.86,  0.07),
  }
})

// ── Bhupura geometry — Korvin construction polygon point strings ──────────────
//
// All coordinates are in SVG space (CX=260, CY=270).
// Three nested T-gate polygons trace the outer, main, and inner bhupura lines.
//
// Outer border ring  — offset ~3 units outward from the main polygon
// Main T-gate polygon — the primary bhupura outline (one square + 4 stepped gates)
// Inner border ring  — offset ~3 units inward from the main polygon

const BHUPURA_OUTER_PTS =
  '101.36,111.36 225.98,111.36 225.98,91.88 172.74,91.88 172.74,63.67 ' +
  '347.26,63.67 347.26,91.88 294.01,91.88 294.01,111.37 418.64,111.36 ' +
  '418.64,235.98 438.12,235.98 438.12,182.74 466.33,182.74 466.33,357.26 ' +
  '438.12,357.26 438.12,304.01 418.63,304.01 418.64,428.64 294.02,428.64 ' +
  '294.02,448.12 347.26,448.12 347.26,476.33 172.74,476.33 172.74,448.12 ' +
  '225.99,448.12 225.99,428.63 101.36,428.64 101.36,304.02 81.88,304.02 ' +
  '81.88,357.26 53.67,357.26 53.67,182.74 81.88,182.74 81.88,235.99 101.37,235.99'

const BHUPURA_MAIN_PTS =
  '175.810,66.747 344.190,66.747 344.190,88.804 290.940,88.804 290.940,114.437 ' +
  '415.563,114.437 415.563,239.056 441.198,239.056 441.198,185.810 463.253,185.810 ' +
  '463.253,354.190 441.196,354.190 441.196,300.940 415.563,300.940 415.563,425.563 ' +
  '290.944,425.563 290.944,451.198 344.190,451.198 344.190,473.253 175.810,473.253 ' +
  '175.810,451.196 229.060,451.196 229.060,425.563 104.437,425.563 104.437,300.944 ' +
  '78.802,300.944 78.802,354.190 56.747,354.190 56.747,185.810 78.804,185.810 ' +
  '78.804,239.060 104.437,239.060 104.437,114.437 229.056,114.437 229.056,88.802 ' +
  '175.810,88.802'

const BHUPURA_INNER_PTS =
  '107.51,117.51 232.13,117.51 232.13,85.73 178.88,85.73 178.88,69.82 ' +
  '341.12,69.82 341.12,85.73 287.87,85.73 287.87,117.51 412.49,117.51 ' +
  '412.49,242.13 444.27,242.13 444.27,188.88 460.18,188.88 460.18,351.12 ' +
  '444.27,351.12 444.27,297.87 412.49,297.87 412.49,422.49 287.87,422.49 ' +
  '287.87,454.27 341.12,454.27 341.12,470.18 178.88,470.18 178.88,454.27 ' +
  '232.13,454.27 232.13,422.49 107.51,422.49 107.51,297.87 75.73,297.87 ' +
  '75.73,351.12 59.82,351.12 59.82,188.88 75.73,188.88 75.73,242.13 107.51,242.13'

// ── Seed of Life overlay ──────────────────────────────────────────────────────

function circleCircleIntersections(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d > 2 * r + 0.01 || d < 0.01) return []
  const a = d / 2
  const h = Math.sqrt(Math.max(0, r * r - a * a))
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  if (h < 0.01) return [[mx, my]]
  return [
    [mx + h * dy / d, my - h * dx / d],
    [mx - h * dy / d, my + h * dx / d],
  ]
}

function dedupPoints(pts, eps = 1.0) {
  const out = []
  for (const p of pts) {
    if (!out.some(q => Math.abs(p[0] - q[0]) < eps && Math.abs(p[1] - q[1]) < eps))
      out.push(p)
  }
  return out
}

function SeedOfLife({ r }) {
  const centers = [
    [CX, CY],
    ...Array.from({ length: 6 }, (_, k) => {
      const a = (k * Math.PI) / 3 + Math.PI / 2
      return [CX + r * Math.cos(a), CY - r * Math.sin(a)]
    }),
  ]
  const rawPts = []
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      const [cx1, cy1] = centers[i]
      const [cx2, cy2] = centers[j]
      rawPts.push(...circleCircleIntersections(cx1, cy1, cx2, cy2, r))
    }
  }
  const pts = dedupPoints(rawPts, 1.5)
    .map(([px, py]) => {
      const dx = px - CX, dy = py - CY
      const angle = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI)
      const dist = Math.sqrt(dx * dx + dy * dy)
      return { px, py, angle, dist }
    })
    .sort((a, b) => {
      const da = a.angle - b.angle
      if (Math.abs(da) > 0.001) return da
      return a.dist - b.dist
    })
  return (
    <g>
      {centers.map(([cx, cy], i) => (
        <g key={`sol-c-${i}`}>
          <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={r}
            fill="none" stroke="#5b9bd5" strokeWidth={0.6} opacity={0.45} />
          <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={2.5}
            fill="#5b9bd5" opacity={0.5} />
          <text x={cx.toFixed(1)} y={(cy + 11).toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fill="#f87171" opacity={0.85} fontFamily="monospace" fontWeight="bold">
            S{i}
          </text>
        </g>
      ))}
      {pts.map(({ px, py, dist }, i) => {
        const dx = px - CX, dy = py - CY
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nudge = dist < 5 ? 10 : 8
        const lx = px + (dx / len) * nudge
        const ly = py + (dy / len) * nudge
        return (
          <g key={`sol-p-${i}`}>
            <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={3} fill="#5b9bd5" opacity={0.9} />
            <text x={lx.toFixed(1)} y={ly.toFixed(1)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#5b9bd5" opacity={0.95} fontFamily="monospace" fontWeight="bold">
              {i + 1}
            </text>
          </g>
        )
      })}
      <line x1={CX - 6} y1={CY} x2={CX + 6} y2={CY} stroke="#5b9bd5" strokeWidth={0.6} opacity={0.5} />
      <line x1={CX} y1={CY - 6} x2={CX} y2={CY + 6} stroke="#5b9bd5" strokeWidth={0.6} opacity={0.5} />
    </g>
  )
}

// ── Hit zones ─────────────────────────────────────────────────────────────────

// Approximate convex polygons used by RegionFills for circuit colour masks.
// Keys match circuit numbers 5–8 (nested outer-to-inner).
const HIT_ZONE_POLYGONS = {
  8: '260,299.512 234.78,263.193 285.22,263.193',
  7: '224.3,283.3 226.0,250.6 254.5,224.1 265.5,224.1 294.0,250.6 295.7,283.3 267.4,310.1 252.6,310.1',
  6: '207.4,250.6 210.0,213.4 252.2,198.2 267.8,198.2 310.0,213.4 312.6,250.6 311.0,283.3 298.9,326.8 265.7,339.6 254.3,339.6 221.1,326.8 209.0,283.3',
  5: '154.0,299.5 155.1,236.8 260.0,160.0 364.9,236.8 366.0,299.5 330.0,350.4 260.0,380.0 190.0,350.4',
}

const HIGHLIGHT_FILL = 'rgba(201,168,76,0.13)'

// Exact circuit hit zones for C4–C8, derived from the pre-computed triangle
// regions in triangle-regions.json.  Each triangle polygon fires its own
// circuit number, so there is no off-by-one between geometry and label.
//
// Rendering order: outer circuits first (bottom of stack), inner last (top),
// so inner circuits win in the rare case of shared boundary points.
//
// The C4 circle at r=R provides a fallback for thin inter-triangle seams that
// might otherwise fall through the individual polygons.
const TRI_HIT_ZONES = TRIANGLE_REGIONS
  .filter(t => t.circuit >= 4 && t.circuit <= 8 && t.points)
  .sort((a, b) => a.circuit - b.circuit)   // C4 first → C8 last (top)

function HitZones({ onCircuitSelect, selectedCircuit }) {
  const base = { cursor: 'pointer' }
  const fill = (n) => selectedCircuit === n ? HIGHLIGHT_FILL : 'transparent'

  return (
    <g aria-label="Circuit hit zones">
      {/* C1: full viewBox background */}
      <rect x={45} y={55} width={430} height={430}
        fill={fill(1)} style={base} onClick={() => onCircuitSelect(1)} />
      {/* C2: outer lotus ring */}
      <circle cx={CX} cy={CY} r={149.34}
        fill={fill(2)} style={base} onClick={() => onCircuitSelect(2)} />
      {/* C3: inner lotus ring */}
      <circle cx={CX} cy={CY} r={124.3}
        fill={fill(3)} style={base} onClick={() => onCircuitSelect(3)} />
      {/* C4 base circle — fallback for gaps between triangle polygons */}
      <circle cx={CX} cy={CY} r={R}
        fill={fill(4)} style={base} onClick={() => onCircuitSelect(4)} />
      {/* C4–C8: exact triangle hit polygons, inner circuits on top */}
      {TRI_HIT_ZONES.map(t => (
        <polygon key={t.id} points={t.points}
          fill={fill(t.circuit)} style={base}
          onClick={() => onCircuitSelect(t.circuit)} />
      ))}
      {/* C9: bindu */}
      <circle cx={CX} cy={BINDU_CY} r={4}
        fill={fill(9)} style={base} onClick={() => onCircuitSelect(9)} />
    </g>
  )
}

// ── Region fills ──────────────────────────────────────────────────────────────

function RegionFills({ filledRegions = {}, noStrokeRegions = {}, onRegionClick = null, onRegionHover = null, onRegionLeave = null, onRegionDoubleClick = null }) {
  const hoverable   = onRegionHover != null
  if (Object.keys(filledRegions).length === 0 && !onRegionClick && !hoverable) return null

  const clickable   = onRegionClick != null
  const interactive = clickable || hoverable
  const style       = interactive ? { cursor: 'pointer' } : undefined

  // S_INNER: outermost ring radius (between bhupura inner edge and C2 petals)
  const S_INNER = 147.34

  return (
    <g>
      <defs>
        {/* C1 mask: full bhupura T-gate area minus inner circle */}
        <mask id="mask-c1">
          <polygon points={BHUPURA_OUTER_PTS} fill="white" />
          <circle cx={CX} cy={CY} r={S_INNER} fill="black" />
        </mask>

        {/* C1 sub-band masks — three Korvin polygon bands */}
        <mask id="mask-c1-outer">
          <polygon points={BHUPURA_OUTER_PTS} fill="white" />
          <polygon points={BHUPURA_MAIN_PTS}  fill="black" />
        </mask>
        <mask id="mask-c1-mid">
          <polygon points={BHUPURA_MAIN_PTS}  fill="white" />
          <polygon points={BHUPURA_INNER_PTS} fill="black" />
        </mask>
        <mask id="mask-c1-inner">
          <polygon points={BHUPURA_INNER_PTS} fill="white" />
          <circle cx={CX} cy={CY} r={S_INNER} fill="black" />
        </mask>

        {/* Outer rings mask: annular zone between ring2 and ring3 */}
        <mask id="mask-outer-rings">
          <circle cx={CX} cy={CY} r={147.34} fill="white" />
          <circle cx={CX} cy={CY} r={143.24} fill="black" />
        </mask>

        {/* C2 mask: inside circle2 minus circle1 */}
        <mask id="mask-c2">
          <circle cx={CX} cy={CY} r={143.24} fill="white" />
          <circle cx={CX} cy={CY} r={123.301} fill="black" />
        </mask>

        {/* C3 mask: inside circle1 minus R */}
        <mask id="mask-c3">
          <circle cx={CX} cy={CY} r={123.301} fill="white" />
          <circle cx={CX} cy={CY} r={R} fill="black" />
        </mask>

        {/* C4 mask: inside R minus C5 polygon */}
        <mask id="mask-c4">
          <circle cx={CX} cy={CY} r={R} fill="white" />
          <polygon points={HIT_ZONE_POLYGONS[5]} fill="black" />
        </mask>

        {/* C5 mask: C5 polygon minus C6 polygon */}
        <mask id="mask-c5">
          <polygon points={HIT_ZONE_POLYGONS[5]} fill="white" />
          <polygon points={HIT_ZONE_POLYGONS[6]} fill="black" />
        </mask>

        {/* C6 mask: C6 polygon minus C7 polygon */}
        <mask id="mask-c6">
          <polygon points={HIT_ZONE_POLYGONS[6]} fill="white" />
          <polygon points={HIT_ZONE_POLYGONS[7]} fill="black" />
        </mask>

        {/* C7 mask: C7 polygon minus DFT4 triangle (C8) */}
        <mask id="mask-c7">
          <polygon points={HIT_ZONE_POLYGONS[7]} fill="white" />
          <polygon points={HIT_ZONE_POLYGONS[8]} fill="black" />
        </mask>

        {/* C8 mask: DFT4 (primary triangle surrounding bindu) minus bindu */}
        <mask id="mask-c8">
          <polygon points={HIT_ZONE_POLYGONS[8]} fill="white" />
          <circle cx={CX} cy={BINDU_CY} r={8} fill="black" />
        </mask>

      </defs>

      {/* Inner circle base fill */}
      {filledRegions['inner-circle'] && (
        <circle cx={CX} cy={CY} r={R} fill={filledRegions['inner-circle']} />
      )}

      {/* C1 full-ring fill */}
      {(filledRegions['c1'] || hoverable || clickable) && (
        <polygon points={BHUPURA_OUTER_PTS} fill={filledRegions['c1'] || 'transparent'}
          mask="url(#mask-c1)" style={style}
          onClick={clickable ? () => onRegionClick('c1') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c1') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c1') : undefined} />
      )}

      {/* C1 sub-band fills — also act as hover/click targets for the bhupura walls.
          All three fire 'c1' so any hover over these bands registers as circuit 1.
          c1-inner covers the zone between the inner bhupura square and the Valayam circles. */}
      {filledRegions['c1-outer'] && (
        <polygon points={BHUPURA_OUTER_PTS}
          fill={filledRegions['c1-outer']} mask="url(#mask-c1-outer)"
          style={style}
          onClick={clickable ? () => onRegionClick('c1') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c1') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c1') : undefined} />
      )}
      {filledRegions['c1-mid'] && (
        <polygon points={BHUPURA_MAIN_PTS}
          fill={filledRegions['c1-mid']} mask="url(#mask-c1-mid)"
          style={style}
          onClick={clickable ? () => onRegionClick('c1') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c1') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c1') : undefined} />
      )}
      {filledRegions['c1-inner'] && (
        <polygon points={BHUPURA_INNER_PTS}
          fill={filledRegions['c1-inner']} mask="url(#mask-c1-inner)"
          style={style}
          onClick={clickable ? () => onRegionClick('c1') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c1') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c1') : undefined} />
      )}

      {filledRegions['outer-rings'] && (
        <circle cx={CX} cy={CY} r={147.34} fill={filledRegions['outer-rings']}
          mask="url(#mask-outer-rings)" />
      )}

      {filledRegions['c2'] && (
        <circle cx={CX} cy={CY} r={143.24} fill={filledRegions['c2']}
          mask="url(#mask-c2)" style={style}
          onClick={clickable ? () => onRegionClick('c2') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c2') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c2') : undefined} />
      )}

      {filledRegions['c3'] && (
        <circle cx={CX} cy={CY} r={123.301} fill={filledRegions['c3']}
          mask="url(#mask-c3)" style={style}
          onClick={clickable ? () => onRegionClick('c3') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c3') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c3') : undefined} />
      )}

      {filledRegions['c4'] && (
        <circle cx={CX} cy={CY} r={R} fill={filledRegions['c4']}
          mask="url(#mask-c4)" style={style}
          onClick={clickable ? () => onRegionClick('c4') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c4') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c4') : undefined} />
      )}

      {filledRegions['c5'] && (
        <polygon points={HIT_ZONE_POLYGONS[5]} fill={filledRegions['c5']}
          mask="url(#mask-c5)" style={style}
          onClick={clickable ? () => onRegionClick('c5') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c5') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c5') : undefined} />
      )}

      {filledRegions['c6'] && (
        <polygon points={HIT_ZONE_POLYGONS[6]} fill={filledRegions['c6']}
          mask="url(#mask-c6)" style={style}
          onClick={clickable ? () => onRegionClick('c6') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c6') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c6') : undefined} />
      )}

      {filledRegions['c7'] && (
        <polygon points={HIT_ZONE_POLYGONS[7]} fill={filledRegions['c7']}
          mask="url(#mask-c7)" style={style}
          onClick={clickable ? () => onRegionClick('c7') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c7') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c7') : undefined} />
      )}

      {filledRegions['c8'] && (
        <polygon points={HIT_ZONE_POLYGONS[8]} fill={filledRegions['c8']}
          mask="url(#mask-c8)" style={style}
          onClick={clickable ? () => onRegionClick('c8') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c8') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c8') : undefined} />
      )}


      {/* Triangle sub-region fills / click targets (C4–C8)
          Render C8 first (background), C4 last (foreground) so inner fills don't overwrite outer */}
      {[...TRIANGLE_REGIONS].sort((a, b) => b.circuit - a.circuit).map(t => {
        const fill = filledRegions[t.id]
        if (!fill && !clickable && !hoverable) return null
        return (
          <polygon key={t.id} id={t.id} points={t.points}
            fill={fill || 'transparent'}
            stroke={fill && !noStrokeRegions[t.id] ? 'rgba(201,168,76,0.3)' : 'none'}
            strokeWidth={fill && !noStrokeRegions[t.id] ? '0.5' : '0'}
            style={style}
            onClick={clickable ? () => onRegionClick(t.id) : undefined}
            onMouseEnter={hoverable ? () => onRegionHover(t.id) : undefined}
            onMouseLeave={onRegionLeave || undefined}
            onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick(t.id) : undefined} />
        )
      })}

      {/* C9: Bindu dot */}
      {filledRegions['c9'] && (
        <circle cx={CX} cy={BINDU_CY} r={1.4} fill={filledRegions['c9']}
          style={style}
          onClick={clickable ? () => onRegionClick('c9') : undefined}
          onMouseEnter={hoverable ? () => onRegionHover('c9') : undefined}
          onMouseLeave={onRegionLeave || undefined}
          onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick('c9') : undefined} />
      )}

      {/* Bhupura dot click targets */}
      {BHUPURA_MARKERS.map(m => {
        const id = `bhupura-${String(m.n).padStart(2, '0')}`
        const fill = filledRegions[id]
        if (!fill && !clickable && !hoverable) return null
        return (
          <circle key={id} cx={m.x} cy={m.y} r={8}
            fill={fill || 'transparent'}
            stroke={fill ? 'rgba(201,168,76,0.4)' : 'none'}
            style={style}
            onClick={clickable ? () => onRegionClick(id) : undefined}
            onMouseEnter={hoverable ? () => onRegionHover(id) : undefined}
            onMouseLeave={onRegionLeave || undefined}
            onDoubleClick={onRegionDoubleClick ? () => onRegionDoubleClick(id) : undefined} />
        )
      })}
    </g>
  )
}

// ── Triangle sub-region label colours ────────────────────────────────────────

const TRI_LABEL_BG = {
  4: 'rgba(160,100,200,0.82)',
  5: 'rgba(80,180,130,0.82)',
  6: 'rgba(210,140,70,0.82)',
  7: 'rgba(70,180,200,0.82)',
  8: 'rgba(220,70,70,0.82)',
}

// ── Bhupura corner markers ────────────────────────────────────────────────────

const BHUPURA_CORNER_COLOUR = {
  1: 'rgba(201,168,76,0.95)',
  2: 'rgba(210,100,120,0.95)',
  3: 'rgba(100,150,220,0.95)',
}

// Bhupura square parameters — gw/gd values from Korvin construction
// S values derived from bhupura polygon half-side distances (CX=260, CY=270):
//   outer  polygon non-gate side → 158.64 units from centre
//   main   polygon non-gate side → 155.56 units from centre
//   inner  polygon non-gate side → 152.49 units from centre
// GW values derived from gate-step x-coordinates in each polygon:
//   outer: step at x=225.99/294.02 → GW = 34.02
//   main:  step at x=229.06/290.94 → GW = 30.94
//   inner: step at x=232.13/287.87 → GW = 27.87
const _S1 = 159,    _GW1 = 34,    _GD1 = 27
const _S2 = 156,    _GW2 = 31,    _GD2 = 26
const _S3 = 152,    _GW3 = 28,    _GD3 = 25

// Gate-adjacent offset for level-1 dots n=1–4 (Siddhi Shaktis at gate openings).
// Placing them _GOFF1 units outward from the outer polygon step corner snaps
// the dot to its correct gate corner and keeps it clear of the middle bhupura line.
// Outer polygon step corners: (294.02,428.64) (101.36,304.02) (225.98,111.36) (418.64,235.98)
// Main polygon is ~3 units inward from outer; DOT_R_NORMAL=5 needs ≥5 clearance → offset=3.
const _GOFF1 = 3

const BHUPURA_MARKERS = [
  // Level 1 — outer square
  // n=1–4: gate-adjacent Siddhi Shaktis — aligned to outer polygon step corners, offset outward
  { level: 1, n:  1, x: 295,                   y: 430,               corner: false },  // bottom gate right step — manual
  { level: 1, n:  2, x: 100,                   y: 306,               corner: false },  // left gate bottom step — manual
  { level: 1, n:  3, x: 225,                   y: 110,               corner: false },  // top gate left step — manual
  { level: 1, n:  4, x: 420,                   y: 235,               corner: false },  // right gate top step — manual
  { level: 1, n:  5, x: CX - _S1,                       y: CY + _S1,  corner: true  },
  { level: 1, n:  6, x: CX - _S1,                       y: CY - _S1,  corner: true  },
  { level: 1, n:  7, x: CX + _S1,                       y: CY - _S1,  corner: true  },
  { level: 1, n:  8, x: CX + _S1,                       y: CY + _S1,  corner: true  },
  { level: 1, n:  9, x: CX + _S1 - (_S1 - _GW1) / 3,   y: CY + _S1,  corner: false },
  { level: 1, n: 10, x: CX - _S1 + (_S1 - _GW1) / 4,   y: CY - _S1,  corner: false },
  // Level 2 — mid square
  { level: 2, n: 11, x: 229,                   y: 426,               corner: false },  // manual
  { level: 2, n: 12, x: 103,                   y: 238,               corner: false },  // manual
  { level: 2, n: 13, x: 292,                   y: 114,               corner: false },  // manual
  { level: 2, n: 14, x: 416,                   y: 302,               corner: false },  // manual
  { level: 2, n: 15, x: 105,                   y: 425,               corner: true  },  // manual
  { level: 2, n: 16, x: 105,                   y: 115,               corner: true  },  // manual
  { level: 2, n: 17, x: 415,                   y: 115,               corner: true  },  // manual
  { level: 2, n: 18, x: 415,                   y: 425,               corner: true  },  // manual
  // Level 3 — inner square
  { level: 3, n: 19, x: 288,                   y: 423,               corner: false },  // manual
  { level: 3, n: 20, x: 107,                   y: 298,               corner: false },  // manual
  { level: 3, n: 21, x: 232,                   y: 117,               corner: false },  // manual
  { level: 3, n: 22, x: 413,                   y: 242,               corner: false },  // manual
  { level: 3, n: 23, x: 109,                   y: 421,               corner: true  },  // manual
  { level: 3, n: 24, x: 109,                   y: 119,               corner: true  },  // manual
  { level: 3, n: 25, x: 411,                   y: 119,               corner: true  },  // manual
  { level: 3, n: 26, x: 411,                   y: 421,               corner: true  },  // manual
  { level: 3, n: 27, x: 338,                   y: 422,               corner: false },  // manual
  { level: 3, n: 28, x: CX - _S3 + 0.33 * (_S3 - _GW3), y: CY - _S3, corner: false },
]

// ── Circuit label positions (Korvin SVG coords) ───────────────────────────────

const CIRCUIT_NUMBER_POSITIONS = [
  { id: 'c1', label: 'C1', svgX: 260,   svgY: 102   },
  { id: 'c2', label: 'C2', svgX: 260,   svgY: 136   },
  { id: 'c3', label: 'C3', svgX: 260,   svgY: 154   },
  { id: 'c4', label: 'C4', svgX: 180,   svgY: 270   },
  { id: 'c5', label: 'C5', svgX: 207,   svgY: 270   },
  { id: 'c6', label: 'C6', svgX: 226,   svgY: 270   },
  { id: 'c7', label: 'C7', svgX: 239,   svgY: 270   },
  { id: 'c8', label: 'C8', svgX: 260,   svgY: 228   },
  { id: 'c9', label: 'C9', svgX: 260,   svgY: 265   },
]

// ── Named exports — geometry data for circuit view dot positioning ─────────────
// Imported by BhupuraView (BHUPURA_MARKERS), C2View (C2_PETALS), C3View (C3_PETALS).
// Centroids (cx, cy) are in the same SVG coordinate space as the main yantra
// (CX=260, CY=270, viewBox "45 55 430 430").
export { BHUPURA_MARKERS, C2_PETALS, C3_PETALS, BHUPURA_OUTER_PTS, BHUPURA_MAIN_PTS, BHUPURA_INNER_PTS }

// ── Main SVG component ────────────────────────────────────────────────────────

export default function SriYantraSVG({
  className           = '',
  viewBox             = '45 55 430 430',
  showLabels          = false,
  showTriangles       = true,
  showSeedOfLife      = false,
  seedOfLifeR         = 52,
  onCircuitSelect     = null,
  selectedCircuit     = null,
  showNumbers         = false,
  filledRegions       = {},
  onRegionClick       = null,
  onRegionHover       = null,
  onRegionLeave       = null,
  onRegionDoubleClick = null,
  accentColor         = null,
  noStrokeRegions     = {},
}) {
  const gold             = accentColor || '#c9a84c'
  const bhupuraGold      = accentColor || '#b89840'   // slightly richer to match petal stroke appearance
  const bhupuraInnerGold = '#ffeb3c'   // matches c1-mid fill (bright yellow band) — model yantra only
  const goldFill         = 'rgba(201,168,76,0.07)'
  const bg               = '#0f0805'

  // Inner bhupura strokes: yellow only when the model yantra's yellow c1-mid band is active;
  // otherwise use bhupuraGold so circuit-view pages show consistent all-gold bhupura lines.
  // Inner bhupura lines go yellow only when c1-mid is explicitly the model-yantra yellow.
  // Other fill values (cream, red, dim) keep the normal gold stroke.
  const bhupuraInnerStroke = accentColor
    ? accentColor
    : filledRegions['c1-mid'] === bhupuraInnerGold ? bhupuraInnerGold : bhupuraGold

  const c2PetalFills = {}
  const c3PetalFills = {}
  for (const [id, col] of Object.entries(filledRegions)) {
    if (id.startsWith('petal-c2-')) c2PetalFills[id] = col
    if (id.startsWith('petal-c3-')) c3PetalFills[id] = col
  }

  const handlePetalClick    = onRegionClick       ? (id) => onRegionClick(id)       : null
  const handlePetalHover    = onRegionHover       ? (id) => onRegionHover(id)       : null
  const handlePetalLeave    = onRegionLeave       ? onRegionLeave                   : null
  const handlePetalDblClick = onRegionDoubleClick ? (id) => onRegionDoubleClick(id) : null

  return (
    <svg
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ background: bg }}
      aria-label="Sri Yantra - nine circuits from bhupura to bindu"
    >
      <rect x="-9999" y="-9999" width="99999" height="99999" fill={bg} />

      {/* Region fills rendered before strokes so lines stay visible on top */}
      <RegionFills filledRegions={filledRegions} noStrokeRegions={noStrokeRegions}
        onRegionClick={onRegionClick} onRegionHover={onRegionHover}
        onRegionLeave={onRegionLeave} onRegionDoubleClick={onRegionDoubleClick} />

      {/* Circuit 1: Bhupura — Korvin construction: outer square + 4 stepped T-gates */}
      {/* Three concentric stepped-cross polygons: outer border, main outline, inner border */}
      <polygon points={BHUPURA_OUTER_PTS} fill="none" stroke={bhupuraGold}
        strokeWidth={0.75} strokeLinejoin="miter" />
      <polygon points={BHUPURA_MAIN_PTS}  fill="none" stroke={bhupuraInnerStroke}
        strokeWidth={0.75} strokeLinejoin="miter" />
      <polygon points={BHUPURA_INNER_PTS} fill="none" stroke={bhupuraInnerStroke}
        strokeWidth={0.75} strokeLinejoin="miter" />

      {/* Three border rings between inner and mid bhupura squares.
          Clipped to the mid bhupura shape so they don't cross outside it. */}
      <defs>
        <clipPath id="clip-mid-bhupura">
          <polygon points={BHUPURA_INNER_PTS} />
        </clipPath>
      </defs>
      <g clipPath="url(#clip-mid-bhupura)">
        {[147.34, 145.29, 143.24].map((r, i) => (
          <circle key={`oc-${i}`} cx={CX} cy={CY} r={r}
            fill="none" stroke={bhupuraGold} strokeWidth={0.75} />
        ))}
      </g>

      {/* Circuit 2: 16-petal lotus */}
      <g>
        {C2_PETALS.map(({ id, path, cx, cy }) => {
          const petalFill = c2PetalFills[id] || goldFill
          return (
            <g key={id}>
              <path id={id} d={path} fill={petalFill} stroke={noStrokeRegions[id] ? 'none' : gold} strokeWidth={0.75}
                style={(handlePetalClick || handlePetalHover) ? { cursor: 'pointer' } : undefined}
                onClick={handlePetalClick ? () => handlePetalClick(id) : undefined}
                onMouseEnter={handlePetalHover ? () => handlePetalHover(id) : undefined}
                onMouseLeave={handlePetalLeave || undefined}
                onDoubleClick={handlePetalDblClick ? () => handlePetalDblClick(id) : undefined} />
              {showNumbers && (
                <text x={cx.toFixed(1)} y={cy.toFixed(1)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="6.5" fill="rgba(201,168,76,0.9)"
                  fontFamily="monospace" fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {parseInt(id.slice(-2), 10)}
                </text>
              )}
            </g>
          )
        })}
      </g>
      <circle cx={CX} cy={CY} r={123.301} fill="none" stroke={gold} strokeWidth={0.75} />

      {/* Circuit 3: 8-petal lotus */}
      <g>
        {C3_PETALS.map(({ id, path, cx, cy }) => {
          const petalFill = c3PetalFills[id] || goldFill
          return (
            <g key={id}>
              <path id={id} d={path} fill={petalFill} stroke={noStrokeRegions[id] ? 'none' : gold} strokeWidth={0.75}
                style={(handlePetalClick || handlePetalHover) ? { cursor: 'pointer' } : undefined}
                onClick={handlePetalClick ? () => handlePetalClick(id) : undefined}
                onMouseEnter={handlePetalHover ? () => handlePetalHover(id) : undefined}
                onMouseLeave={handlePetalLeave || undefined}
                onDoubleClick={handlePetalDblClick ? () => handlePetalDblClick(id) : undefined} />
              {showNumbers && (
                <text x={cx.toFixed(1)} y={cy.toFixed(1)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="6.5" fill="rgba(201,168,76,0.9)"
                  fontFamily="monospace" fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {parseInt(id.slice(-2), 10)}
                </text>
              )}
            </g>
          )
        })}
      </g>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={gold} strokeWidth={0.75} />

      {/* Circuits 4–8: nine interlocking triangles */}
      {showTriangles && (
        <>
          {DFT_POLYS.map(({ points, label }) => (
            <polygon key={label} points={points}
              fill="none" stroke={gold} strokeWidth={1.0} strokeLinejoin="miter" />
          ))}
          {UFT_POLYS.map(({ points, label }) => (
            <polygon key={label} points={points}
              fill="none" stroke={gold} strokeWidth={1.0} strokeLinejoin="miter" />
          ))}
        </>
      )}

      {/* Circuit 9: Bindu */}
      {!filledRegions['c9'] && (
        <circle cx={CX} cy={BINDU_CY} r={1.4} fill="rgba(255,230,50,0.92)" />
      )}

      {/* Seed of Life overlay */}
      {showSeedOfLife && <SeedOfLife r={seedOfLifeR} />}

      {/* Hit zones */}
      {onCircuitSelect && (
        <HitZones onCircuitSelect={onCircuitSelect} selectedCircuit={selectedCircuit} />
      )}

      {/* showNumbers overlay: bhupura markers, circuit labels, triangle labels */}
      {showNumbers && (
        <g>
          {BHUPURA_MARKERS.map(({ level, n, x, y, corner }) => {
            const id = `bhupura-${String(n).padStart(2, '0')}`
            return (
              <g key={`bhupura-m-${level}-${n}`}
                style={onRegionClick ? { cursor: 'pointer' } : undefined}
                onClick={onRegionClick ? () => onRegionClick(id) : undefined}
              >
                {corner
                  ? <circle cx={x} cy={y} r={5.5}
                      fill={BHUPURA_CORNER_COLOUR[level]} opacity={0.9} />
                  : <rect x={x - 4.5} y={y - 4.5} width={9} height={9} rx={1}
                      fill={BHUPURA_CORNER_COLOUR[level]} opacity={0.85} />
                }
                <text x={x} y={y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={n >= 10 ? '4' : '4.5'} fill="rgba(15,8,5,0.9)"
                  fontFamily="monospace" fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {n}
                </text>
              </g>
            )
          })}

          {CIRCUIT_NUMBER_POSITIONS.map(({ id, label, svgX, svgY }) => (
            <g key={id}
              style={onRegionClick ? { cursor: 'pointer' } : undefined}
              onClick={onRegionClick ? () => onRegionClick(id) : undefined}
            >
              <circle cx={svgX} cy={svgY} r={9} fill="rgba(15,8,5,0.75)" />
              <text x={svgX} y={svgY}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fill="rgba(201,168,76,0.95)"
                fontFamily="monospace" fontWeight="bold"
                style={{ userSelect: 'none' }}>
                {label}
              </text>
            </g>
          ))}

          {TRIANGLE_REGIONS.map(t => (
            <g key={`lbl-${t.id}`}
              style={onRegionClick ? { cursor: 'pointer' } : undefined}
              onClick={onRegionClick ? () => onRegionClick(t.id) : undefined}
            >
              <circle cx={t.cx} cy={t.cy} r={5.5}
                fill={TRI_LABEL_BG[t.circuit] || 'rgba(15,8,5,0.75)'} />
              <text x={t.cx} y={t.cy}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="5.5" fill="rgba(255,255,255,0.95)"
                fontFamily="monospace" fontWeight="bold"
                style={{ userSelect: 'none', pointerEvents: 'none' }}>
                {t.deitySeq ?? t.circuit}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Dev labels */}
      {showLabels && CIRCUIT_NUMBER_POSITIONS.map(({ label, svgX, svgY }) => (
        <text key={label} x={svgX} y={svgY}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="rgba(201,168,76,0.55)" fontFamily="monospace">
          {label}
        </text>
      ))}

    </svg>
  )
}
