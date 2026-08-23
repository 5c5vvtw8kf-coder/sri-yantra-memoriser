/**
 * deityPositions.js
 *
 * Unified lookup: deityId → { x, y } in the shared SVG coordinate space
 * (viewBox "45 55 430 430", CX=260, CY=270).
 *
 * Covers all circuit 'deity'-role entries (102 total):
 *   C1  (28) — BHUPURA_MARKERS
 *   C2  (16) — C2_PETALS centroids
 *   C3  ( 8) — C3_PETALS centroids
 *   C4  (14) — triangle-regions.json + C4_DEITY_ORDER
 *   C5  (10) — triangle-regions.json + C5_DEITY_ORDER
 *   C6  (10) — triangle-regions.json + C6_DEITY_ORDER
 *   C7  ( 8) — triangle-regions.json + C7_DEITY_ORDER
 *   C8  ( 7) — derived from the true central/primary triangle (korvinGeometry.js)
 *   C9  ( 1) — bindu (260, 270)
 *
 * Plus two non-circuit "inset" sections, added 2026-08-23 — small trikona +
 * dot diagrams in the yantra's empty top corners, outside the bhupura:
 *   Nitya       (16) — top-left corner, see NITYA_TRIKONA
 *   Guru-divya  ( 7) ─┐
 *   Guru-siddha ( 4) ─┼─ top-right corner, see GURU_TRIKONA
 *   Guru-manava ( 8) ─┘
 *
 * chakraSvamini, yoginiType, invocation, nyasa, chakreshvari, and closing
 * still have no entry — callers should treat a missing entry as "no yantra
 * position".
 */

import { BHUPURA_MARKERS, C2_PETALS, C3_PETALS } from './components/SriYantraSVG'
import triangleData from './data/triangle-regions.json'
import data from './data/activeDeities'
import { KORVIN_CENTRAL_RAW } from './korvinGeometry'

const { deities } = data

// ── Helpers ───────────────────────────────────────────────────────────────────

function lerp2(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/** Returns unit outward normal for edge a→b with respect to an interior centroid. */
function outwardNormal(a, b, centroid) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  let nx = dy / len, ny = -dx / len
  const midX = (a[0] + b[0]) / 2, midY = (a[1] + b[1]) / 2
  const dot = nx * (centroid[0] - midX) + ny * (centroid[1] - midY)
  if (dot > 0) { nx = -nx; ny = -ny }
  return [nx, ny]
}

// ── C1: BHUPURA_MARKERS — sequenceInSection 1–29 ─────────────────────────────
//
// Siddhi Shaktis (seq 1–11) do NOT map directly to marker n. garimāsiddhē
// (seq 3) shares laghimāsiddhē's physical dot (n=11, same coords as n=2),
// and everything from mahimāsiddhē (seq 4) onward shifts back one slot to
// fill the gap (seq 4→n3 ... seq 11→n10). Ashta Matrikas/Mudra Shaktis
// (seq 12–29) are unaffected — n = seq directly.
// Mirrors BhupuraView.jsx's siddhiDotN() — keep both in sync if this changes.

const markerByN = Object.fromEntries(
  BHUPURA_MARKERS.map(m => [m.n, { x: m.x, y: m.y }])
)

function siddhiDotN(seq) {
  if (seq <= 2) return seq
  if (seq === 3) return 11
  return seq - 1
}

const bhupuraBySeq = {}
for (let seq = 1; seq <= 11; seq++) {
  bhupuraBySeq[seq] = markerByN[siddhiDotN(seq)]
}
for (let seq = 12; seq <= 29; seq++) {
  bhupuraBySeq[seq] = markerByN[seq]
}

// ── C2: C2_PETALS centroids — petal number maps to sequenceInSection directly ─

// C2View: C2_PETAL_ORDER = [1..16], C2_DOT_POSITIONS[seq] = C2_PETAL_MAP[petalOrder[seq-1]]
const C2_PETAL_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const c2PetalByNum = Object.fromEntries(
  C2_PETALS.map(p => [parseInt(p.id.slice(-2), 10), { x: p.cx, y: p.cy }])
)
const c2BySeq = Object.fromEntries(
  C2_PETAL_ORDER.map((petalNum, idx) => [idx + 1, c2PetalByNum[petalNum]])
)

// ── C3: C3_PETALS centroids — petal number = sequenceInSection directly ────────

// C3View: C3_DOT_POSITIONS[num] maps petal number → position (seq = petal num)
const c3BySeq = Object.fromEntries(
  C3_PETALS.map(p => {
    const num = parseInt(p.id.slice(-2), 10)
    return [num, { x: p.cx, y: p.cy }]
  })
)

// ── C4–C7: triangle-regions.json centroids ────────────────────────────────────

function buildCircuitCentroidMap(circuit) {
  return Object.fromEntries(
    triangleData
      .filter(t => t.circuit === circuit && t.deitySeq != null)
      .map(t => [t.deitySeq, { x: t.cx, y: t.cy }])
  )
}

// chantSeq - 1 → geometric deitySeq (copied from the individual CxView components)
export const C4_DEITY_ORDER = [8, 7, 6, 5, 4, 3, 2, 1, 14, 13, 12, 11, 10, 9]
export const C5_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
export const C6_DEITY_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
export const C7_DEITY_ORDER = [5, 4, 3, 2, 1, 8, 7, 6]

function buildSeqMap(deityOrder, centroidMap) {
  return Object.fromEntries(
    deityOrder.map((deitySeq, idx) => [idx + 1, centroidMap[deitySeq]])
  )
}

const c4BySeq = buildSeqMap(C4_DEITY_ORDER, buildCircuitCentroidMap(4))
const c5BySeq = buildSeqMap(C5_DEITY_ORDER, buildCircuitCentroidMap(5))
const c6BySeq = buildSeqMap(C6_DEITY_ORDER, buildCircuitCentroidMap(6))
const c7BySeq = buildSeqMap(C7_DEITY_ORDER, buildCircuitCentroidMap(7))

// ── C8: 7 positions derived from the true central (primary) triangle ─────────
//
// FIXED 2026-08-08: this used to anchor to DFT4 directly, which is one ring
// further from the bindu than the real primary triangle — visibly wrong once
// Line Drill started showing multiple C8 dots at once. C8View.jsx's own
// Explore/Memorise rendering already used the correct shape (apex = DFT5's
// apex, base = DFT4's base line — the actual Korvin-construction definition
// of the primary downward triangle); this now imports that same geometry
// (raw, un-zoomed) from korvinGeometry.js instead of hardcoding DFT4, so the
// two can't drift apart again.
//
// Chant order:
//   1 Bāṇinī         — left edge, offset outward
//   2 Chāpinī        — right edge, offset outward
//   3 Pāśinī         — top edge, toward right, offset upward
//   4 Aṅkuśinī       — top edge, toward left, offset upward
//   5 Mahākāmēśvarī  — apex vertex
//   6 Mahāvajrēśvarī — base-right vertex
//   7 Mahābhagamālinī — base-left vertex
//
// Formulas mirror C8View.jsx's exactly (same lerp points/fractions, same
// outward-normal construction); only the offset constant differs, scaled
// down by korvinGeometry's SCALE (8) since C8View's 45 is a screen-space
// (zoomed) distance and this file works in raw/un-zoomed coordinates.

const [CT_APEX, CT_BASE_L, CT_BASE_R] = KORVIN_CENTRAL_RAW
const CT_CTR = [
  (CT_APEX[0] + CT_BASE_L[0] + CT_BASE_R[0]) / 3,
  (CT_APEX[1] + CT_BASE_L[1] + CT_BASE_R[1]) / 3,
]
const OFFSET = 45 / 8   // C8View's screen-space offset (45), converted to raw units

const nLeft  = outwardNormal(CT_APEX,   CT_BASE_L, CT_CTR)
const nRight = outwardNormal(CT_BASE_R, CT_APEX,   CT_CTR)
const nTop   = outwardNormal(CT_BASE_L, CT_BASE_R, CT_CTR)

const banini  = lerp2(CT_BASE_L, CT_APEX, 0.6)
const chapini = lerp2(CT_BASE_R, CT_APEX, 0.6)
const pasini  = lerp2(CT_BASE_L, CT_BASE_R, 0.72)
const ankush  = lerp2(CT_BASE_L, CT_BASE_R, 0.28)

const C8_POSITIONS = [
  { x: banini[0]  + nLeft[0]  * OFFSET, y: banini[1]  + nLeft[1]  * OFFSET  }, // 1 Bāṇinī
  { x: chapini[0] + nRight[0] * OFFSET, y: chapini[1] + nRight[1] * OFFSET  }, // 2 Chāpinī
  { x: pasini[0]  + nTop[0]   * OFFSET, y: pasini[1]  + nTop[1]   * OFFSET  }, // 3 Pāśinī
  { x: ankush[0]  + nTop[0]   * OFFSET, y: ankush[1]  + nTop[1]   * OFFSET  }, // 4 Aṅkuśinī
  { x: CT_APEX[0],   y: CT_APEX[1]   },                                        // 5 Mahākāmēśvarī
  { x: CT_BASE_R[0], y: CT_BASE_R[1] },                                        // 6 Mahāvajrēśvarī
  { x: CT_BASE_L[0], y: CT_BASE_L[1] },                                        // 7 Mahābhagamālinī
]

const c8BySeq = Object.fromEntries(C8_POSITIONS.map((pos, idx) => [idx + 1, pos]))

// ── C9: bindu ─────────────────────────────────────────────────────────────────
// The bindu is the centre of the Sri Yantra diagram.
const C9_BINDU = { x: 260, y: 270 }

// ── Nitya / Guru insets (top corners, outside the bhupura) ────────────────────
// Chris's design, 2026-08-23: the Tithi Nitya Devatas and the three Guru
// lineages have no yantra position at all — they're preamble/lineage sections,
// not part of the geometric diagram. Locate Drill's pairing feature exposed
// this: Kāmeśvarī and Mahāvajreśvarī each recur once in Nitya and once in a
// circuit, but only the circuit half had anywhere to click. Fix: two small
// insets in the yantra's empty top corners (outside the bhupura's outer
// square, which spans roughly x:[101,419] y:[111,429] within this file's
// viewBox) — a small downward trikona with a dot per deity, Nitya top-left,
// the three Guru groups together top-right. First version: coordinates are
// evenly-spaced approximations of Chris's reference sketch (a loop of dots
// around the Nitya trikona; three stacked rows above the Guru trikona), not
// yet visually verified live — flagged for a follow-up pass once he can see
// it rendered and fine-tune spacing.
//
// Resized 2026-08-23 (Chris: "50% larger" after seeing the first live
// screenshot) and pushed toward the literal outer corners of the viewBox
// (45,55)–(475,485) rather than left where they were — he's planning to add
// the 6 Nyasa Devatas (Hridaya, Shiro, etc.) somewhere in this same general
// area later, and the original placement would have collided with wherever
// those land. Since that placement isn't decided yet, this maximises
// clearance in every direction rather than guessing a specific spot — worth
// a joint look once Nyasa positions are actually being designed.
function evenRow(n, x0, x1, y) {
  if (n === 1) return [{ x: (x0 + x1) / 2, y }]
  const pts = []
  for (let i = 0; i < n; i++) pts.push({ x: x0 + (x1 - x0) * (i / (n - 1)), y })
  return pts
}
function evenSide(n, from, to) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const [x, y] = lerp2(from, to, (i + 1) / (n + 1))
    pts.push({ x, y })
  }
  return pts
}

// Nitya: 16 deities forming a loop around the small trikona's three edges —
// a dot at each of the 3 vertices, 4 evenly-spaced dots along each edge
// (nudged slightly outward so they read as their own ring rather than
// sitting on the outline), plus a 16th dot at the centroid for "the bindu in
// the middle" (Chris's reference image, 2026-08-23 — the previous version's
// detached top row + two side fans didn't read as "around the trikona").
const NITYA_APEX   = [74, 110]
const NITYA_BASE_L = [52, 72]
const NITYA_BASE_R = [96, 72]
const NITYA_CENTROID = [
  (NITYA_APEX[0] + NITYA_BASE_L[0] + NITYA_BASE_R[0]) / 3,
  (NITYA_APEX[1] + NITYA_BASE_L[1] + NITYA_BASE_R[1]) / 3,
]
const NITYA_EDGE_OFFSET = 3
function edgeDots(n, from, to) {
  const [nx, ny] = outwardNormal(from, to, NITYA_CENTROID)
  return evenSide(n, from, to).map(p => ({ x: p.x + nx * NITYA_EDGE_OFFSET, y: p.y + ny * NITYA_EDGE_OFFSET }))
}
const NITYA_POSITIONS = [
  { x: NITYA_BASE_L[0], y: NITYA_BASE_L[1] },   // 1  — top-left vertex
  ...edgeDots(4, NITYA_BASE_L, NITYA_BASE_R),   // 2–5  — across the top edge
  { x: NITYA_BASE_R[0], y: NITYA_BASE_R[1] },   // 6  — top-right vertex
  ...edgeDots(4, NITYA_BASE_R, NITYA_APEX),     // 7–10 — down the right edge
  { x: NITYA_APEX[0], y: NITYA_APEX[1] },       // 11 — apex (bottom point)
  ...edgeDots(4, NITYA_APEX, NITYA_BASE_L),     // 12–15 — up the left edge
  { x: NITYA_CENTROID[0], y: NITYA_CENTROID[1] }, // 16 — centre (the bindu)
]
const nityaBySeq = Object.fromEntries(NITYA_POSITIONS.map((p, i) => [i + 1, p]))

// Gurus: three stacked rows (7 divyaugha, 4 siddhaugha, 8 mānavaugha) above a
// small trikona, apex pointing down, pushed into the true top-right corner.
// Siddhaugha's row widened 2026-08-23 (Chris: it read as visibly cramped next
// to the wider divyaugha/mānavaugha rows above/below it) to roughly match
// their span instead of sitting in a narrow ~24-unit band.
const guruDivyaBySeq  = Object.fromEntries(evenRow(7, 421, 471, 60).map((p, i) => [i + 1, p]))
const guruSiddhaBySeq = Object.fromEntries(evenRow(4, 422, 470, 68).map((p, i) => [i + 1, p]))
const guruManavaBySeq = Object.fromEntries(evenRow(8, 420, 472, 76).map((p, i) => [i + 1, p]))

// ── Assemble the full map ─────────────────────────────────────────────────────

const bySeqMap = {
  'circuit-1': bhupuraBySeq,
  'circuit-2': c2BySeq,
  'circuit-3': c3BySeq,
  'circuit-4': c4BySeq,
  'circuit-5': c5BySeq,
  'circuit-6': c6BySeq,
  'circuit-7': c7BySeq,
  'circuit-8': c8BySeq,
  'nitya': nityaBySeq,
  'guru-divya': guruDivyaBySeq,
  'guru-siddha': guruSiddhaBySeq,
  'guru-manava': guruManavaBySeq,
}

// Trikona outlines for the two insets — exported so any consumer that wants
// to draw them (Locate Drill's own overlay, for now) doesn't have to
// duplicate these coordinates.
export const NITYA_TRIKONA = { apex: NITYA_APEX, baseL: NITYA_BASE_L, baseR: NITYA_BASE_R }
// Base widened to match the mānavaugha row's own span (420–472) — Chris's
// report, 2026-08-23: the trikona read as too small under the much wider
// dot rows above it. Height set to true equilateral (base·sin60° ≈ 45.03,
// apex y 80+45.03) at the same base width, per Chris: "should be equilateral
// maintaining the current width" (a same-value height/width square wasn't
// actually equilateral — this replaces that first pass).
export const GURU_TRIKONA  = { apex: [446, 125], baseL: [420, 80], baseR: [472, 80] }

// Tight crop boxes around each inset's own dots/trikona — used once the
// insets are pulled out of the main yantra viewBox into their own standalone
// <svg> panels (2026-08-23 desktop/mobile repositioning; see roadmap memory).
// No longer a matched pair since GURU_TRIKONA grew taller (2026-08-23) — Guru's
// box is now 64×74 to fit its apex at y=125 with a little breathing room.
export const NITYA_INSET_VIEWBOX = '42 59 64 58'
export const GURU_INSET_VIEWBOX  = '414 55 64 74'

export const DEITY_POSITIONS = (() => {
  const map = {}

  for (const deity of deities) {
    const { id, sectionId, sequenceInSection, role } = deity

    // C9 bindu — single position regardless of sequenceInSection
    if (sectionId === 'circuit-9' && role === 'deity') {
      map[id] = C9_BINDU
      continue
    }

    // All other circuits: look up by sequenceInSection
    const seqMap = bySeqMap[sectionId]
    if (seqMap && role === 'deity') {
      const pos = seqMap[sequenceInSection]
      if (pos) map[id] = pos
    }
  }

  return map
})()

/**
 * Returns { x, y } for a deity, or null if no yantra position exists.
 * @param {string} deityId
 * @returns {{ x: number, y: number } | null}
 */
export function getPosition(deityId) {
  return DEITY_POSITIONS[deityId] ?? null
}
