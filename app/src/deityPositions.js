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
 * chakraSvamini, yoginiType, and all non-circuit sections have no entry —
 * callers should treat a missing entry as "no yantra position".
 */

import { BHUPURA_MARKERS, C2_PETALS, C3_PETALS } from './components/SriYantraSVG'
import triangleData from './data/triangle-regions.json'
import data from './data/khadgamala-canonical.json'
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
}

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
