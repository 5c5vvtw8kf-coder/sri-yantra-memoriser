/**
 * MemoMapVisuals.jsx
 *
 * 14-panel spatial map carousel for the Memory Map view.
 *
 * Panels (stotra order):
 *   1  Nyasanga            -- Sri Yantra + body/gate dot overlay
 *   2  Tithi Nitya          -- Korvin central triangle, 16 dots
 *   3  Guravah              -- Korvin trapezoid, 19 dots
 *   4-10  1st-7th Avarana   -- Full Sri Yantra, target circuit status-coloured
 *   11 8th Avarana          -- Korvin inner triangle, 7 dots
 *   12 9th Avarana          -- Korvin inner triangle, bindu dot
 *   13 Nava Chakreshvari    -- Styled list (reversed: inner to outer)
 *   14 Sridevi Visesanani   -- Styled list (reversed)
 *
 * Filter: "All" shows all 14 panels; "X Only" hides panels with no
 * not-memorised items so the user can jump straight to weak spots.
 *
 * Tooltips: hovering a partial or not-memorised dot/region shows deity name.
 */

import { useState } from 'react'
import SriYantraSVG from './SriYantraSVG'
import data from '../data/khadgamala-canonical.json'
import {
  APEX, BASE_L, BASE_R, CENTROID, BINDU,
  CONTEXT_TRIS, CONTEXT_FILL_PATH, GURU_TRAPEZOID,
} from '../korvinGeometry'
import { displayName } from '../utils.js'

const { deities, sections } = data

// -- Status colours -----------------------------------------------------------
// partial = amber/orange (distinct from the gold palette used elsewhere)

const STATUS_FILL = {
  memorised:    'rgba(74,222,128,0.85)',
  partial:      'rgba(251,191,36,0.85)',
  notMemorised: 'rgba(248,113,113,0.85)',
  notAttempted: 'rgba(201,168,76,0.07)',
}
const DIM  = 'rgba(201,168,76,0.07)'
const GOLD = '#c9a84c'
const BG   = '#0f0805'

// -- Status helpers -----------------------------------------------------------

function statusFromHistory(store, key, allHistory) {
  const recent = allHistory[store]?.[key]
  if (!recent || recent.length === 0) return 'notAttempted'
  const hasCorrect          = recent.some(r => r === 'correct')
  const lastThreeAllCorrect = recent.length >= 3 && recent.every(r => r === 'correct')
  if (lastThreeAllCorrect) return 'memorised'
  if (hasCorrect)           return 'partial'
  return 'notMemorised'
}

function getDeityStatus(deity, allHistory) {
  const { sectionId, sequenceInSection: seq } = deity
  const ref = {
    'nyasa':        { store: 'nyasa',   key: seq       },
    'nitya':        { store: 'inner',   key: seq       },
    'guru-divya':   { store: 'gurava',  key: seq       },
    'guru-siddha':  { store: 'gurava',  key: 7  + seq  },
    'guru-manava':  { store: 'gurava',  key: 11 + seq  },
    'circuit-1':    { store: 'bhupura', key: seq       },
    'circuit-2':    { store: 'c2',      key: seq       },
    'circuit-3':    { store: 'c3',      key: seq       },
    'circuit-4':    { store: 'c4',      key: seq       },
    'circuit-5':    { store: 'c5',      key: seq       },
    'circuit-6':    { store: 'c6',      key: seq       },
    'circuit-7':    { store: 'c7',      key: seq       },
    'circuit-8':    { store: 'c8',      key: seq       },
    'circuit-9':    { store: 'c9',      key: 1         },
    'chakreshvari': { store: 'nc',      key: seq       },
    'closing':      { store: 'closing', key: seq       },
  }[sectionId]
  if (!ref) return 'notAttempted'
  return statusFromHistory(ref.store, ref.key, allHistory)
}

// -- Deity groupings and section lookup ---------------------------------------

const deityBySection = {}
for (const d of deities) {
  if (!deityBySection[d.sectionId]) deityBySection[d.sectionId] = []
  deityBySection[d.sectionId].push(d)
}
for (const k of Object.keys(deityBySection)) {
  deityBySection[k].sort((a, b) => a.sequenceInSection - b.sequenceInSection)
}

const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))
// -- IAST section metadata (diacritics for Svamini/Yogini tooltips) -----------

const SECTION_IAST = {
  'circuit-1': { svamini: 'Trailokya Mohana Cakra Svāminī',          yogini: 'Prakaṭa Yoginī'            },
  'circuit-2': { svamini: 'Sarvāśā Paripūraka Cakra Svāminī',        yogini: 'Gupta Yoginī'              },
  'circuit-3': { svamini: 'Sarva Saṃkṣobhaṇa Cakra Svāminī',         yogini: 'Guptataraṃ Yoginī'         },
  'circuit-4': { svamini: 'Sarva Saubhāgyadāyaka Cakra Svāminī',     yogini: 'Sampradāya Yoginī'         },
  'circuit-5': { svamini: 'Sarvārtha Sādhaka Cakra Svāminī',         yogini: 'Kulottīrṇa Yoginī'         },
  'circuit-6': { svamini: 'Sarva Rakṣākara Cakra Svāminī',           yogini: 'Nigarbhā Yoginī'           },
  'circuit-7': { svamini: 'Sarva Rogahara Cakra Svāminī',            yogini: 'Rahasya Yoginī'            },
  'circuit-8': { svamini: 'Sarva Siddhiprada Cakra Svāminī',         yogini: 'Atirahasyā Yoginī'         },
  'circuit-9': { svamini: 'Sarvānandamaya Cakra Svāminī',            yogini: 'Parāpararahasya Yoginī'    },
}


// -- Chant-seq to geometric-deitySeq maps for C4-C7 --------------------------

const C4_ORDER = [8, 7, 6, 5, 4, 3, 2, 1, 14, 13, 12, 11, 10, 9]
const C5_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C6_ORDER = [6, 5, 4, 3, 2, 1, 10, 9, 8, 7]
const C7_ORDER = [5, 4, 3, 2, 1, 8, 7, 6]

function regionKey(d) {
  const seq = d.sequenceInSection
  if (d.sectionId === 'circuit-1') return `bhupura-${String(seq).padStart(2, '0')}`
  if (d.sectionId === 'circuit-2') return `petal-c2-${String(seq).padStart(2, '0')}`
  if (d.sectionId === 'circuit-3') return `petal-c3-${String(seq).padStart(2, '0')}`
  const orders = { 'circuit-4': C4_ORDER, 'circuit-5': C5_ORDER, 'circuit-6': C6_ORDER, 'circuit-7': C7_ORDER }
  const cNums  = { 'circuit-4': 4, 'circuit-5': 5, 'circuit-6': 6, 'circuit-7': 7 }
  if (orders[d.sectionId]) {
    const gs = orders[d.sectionId][seq - 1]
    return `tri-c${cNums[d.sectionId]}-${String(gs).padStart(2, '0')}`
  }
  return null
}

// Reverse lookup: filledRegion key -> deity (for yantra hover tooltips)
const regionKeyToDeity = {}
for (const d of deities) {
  const key = regionKey(d)
  if (key) regionKeyToDeity[key] = d
}

// Pre-built dim fills for all circuit regions EXCEPT C1 bhupura.
// Bhupura dots excluded so they do not appear as dim markers on C2-C7 maps.
const ALL_YANTRA_DIM = {}
for (let i = 1; i <= 16; i++) ALL_YANTRA_DIM[`petal-c2-${String(i).padStart(2, '0')}`] = DIM
for (let i = 1; i <= 8;  i++) ALL_YANTRA_DIM[`petal-c3-${String(i).padStart(2, '0')}`] = DIM
for (let i = 1; i <= 14; i++) ALL_YANTRA_DIM[`tri-c4-${String(i).padStart(2, '0')}`]   = DIM
for (let i = 1; i <= 10; i++) ALL_YANTRA_DIM[`tri-c5-${String(i).padStart(2, '0')}`]   = DIM
for (let i = 1; i <= 10; i++) ALL_YANTRA_DIM[`tri-c6-${String(i).padStart(2, '0')}`]   = DIM
for (let i = 1; i <= 8;  i++) ALL_YANTRA_DIM[`tri-c7-${String(i).padStart(2, '0')}`]   = DIM

// -- Svamini / Yogini seq numbers per circuit (in the memorise-mode store) ----
// These are the seq values used by handleCxMarkResult for the two extra items
// that follow the deity sequence in each circuit's memorise round.

const CIRCUIT_STORE = {
  'circuit-1': 'bhupura', 'circuit-2': 'c2', 'circuit-3': 'c3',
  'circuit-4': 'c4',      'circuit-5': 'c5', 'circuit-6': 'c6',
  'circuit-7': 'c7',      'circuit-8': 'c8', 'circuit-9': 'c9',
}

const SVAMINI_YOGINI_SEQS = {
  'circuit-1': { svamini: 29, yogini: 30 },
  'circuit-2': { svamini: 17, yogini: 18 },
  'circuit-3': { svamini: 9,  yogini: 10 },
  'circuit-4': { svamini: 15, yogini: 16 },
  'circuit-5': { svamini: 11, yogini: 12 },
  'circuit-6': { svamini: 11, yogini: 12 },
  'circuit-7': { svamini: 9,  yogini: 10 },
  'circuit-8': { svamini: 8,  yogini: 9  },
  'circuit-9': { svamini: 2,  yogini: 3  },
}

function getSvaminiYoginiStatus(sectionId, allHistory) {
  const sySeqs = SVAMINI_YOGINI_SEQS[sectionId]
  const store  = CIRCUIT_STORE[sectionId]
  if (!sySeqs || !store || !allHistory)
    return { svamini: 'notAttempted', yogini: 'notAttempted' }
  return {
    svamini: statusFromHistory(store, sySeqs.svamini, allHistory),
    yogini:  statusFromHistory(store, sySeqs.yogini,  allHistory),
  }
}

// -- Section status counting --------------------------------------------------

function getSectionStatusCounts(sectionIds, allHistory) {
  const counts = { memorised: 0, partial: 0, notMemorised: 0, notAttempted: 0 }
  for (const sid of sectionIds) {
    for (const d of (deityBySection[sid] || [])) {
      counts[getDeityStatus(d, allHistory)]++
    }
  }
  return counts
}

function hasNotMemorised(sectionIds, allHistory) {
  return getSectionStatusCounts(sectionIds, allHistory).notMemorised > 0
}

// -- 14 map definitions -------------------------------------------------------

const MAPS = [
  { id: 'nyasa',        label: 'Nyasanga',           trKey: 'sec.nyasa',  sectionIds: ['nyasa'],                                  type: 'nyasa'  },
  { id: 'nitya',        label: 'Tithi Nitya',         trKey: 'sec.inner',  sectionIds: ['nitya'],                                  type: 'nitya'  },
  { id: 'gurava',       label: 'Guravah',             trKey: 'sec.gurava', sectionIds: ['guru-divya','guru-siddha','guru-manava'], type: 'gurava' },
  { id: 'circuit-1',    label: '1st Avarana',         trKey: 'av.1',       sectionIds: ['circuit-1'],                              type: 'yantra' },
  { id: 'circuit-2',    label: '2nd Avarana',         trKey: 'av.2',       sectionIds: ['circuit-2'],                              type: 'yantra' },
  { id: 'circuit-3',    label: '3rd Avarana',         trKey: 'av.3',       sectionIds: ['circuit-3'],                              type: 'yantra' },
  { id: 'circuit-4',    label: '4th Avarana',         trKey: 'av.4',       sectionIds: ['circuit-4'],                              type: 'yantra' },
  { id: 'circuit-5',    label: '5th Avarana',         trKey: 'av.5',       sectionIds: ['circuit-5'],                              type: 'yantra' },
  { id: 'circuit-6',    label: '6th Avarana',         trKey: 'av.6',       sectionIds: ['circuit-6'],                              type: 'yantra' },
  { id: 'circuit-7',    label: '7th Avarana',         trKey: 'av.7',       sectionIds: ['circuit-7'],                              type: 'yantra' },
  { id: 'circuit-8',    label: '8th Avarana',         trKey: 'av.8',       sectionIds: ['circuit-8'],                              type: 'c8'     },
  { id: 'circuit-9',    label: '9th Avarana',         trKey: 'av.9',       sectionIds: ['circuit-9'],                              type: 'c9'     },
  { id: 'chakreshvari', label: 'Nava Chakreshvari',   trKey: 'sec.nc',     sectionIds: ['chakreshvari'],                           type: 'list'   },
  { id: 'closing',      label: 'Sridevi Visesanani',  trKey: 'sec.closing',sectionIds: ['closing'],                                type: 'list'   },
]

// -- Nyasa geometry (0 0 500 500 overlay coordinate space) --------------------

const CX_OVL = 250, CY_OVL = 250
const BODY_POSITIONS = [
  [CX_OVL + 218, CY_OVL - 218],
  [CX_OVL - 218, CY_OVL - 218],
  [CX_OVL + 218, CY_OVL + 218],
  [CX_OVL - 218, CY_OVL + 218],
  [CX_OVL,       CY_OVL      ],
]
const ASTRA_POSITIONS = [
  [CX_OVL,       CY_OVL - 212],
  [CX_OVL + 212, CY_OVL      ],
  [CX_OVL,       CY_OVL + 212],
  [CX_OVL - 212, CY_OVL      ],
]

// -- Korvin geometry helpers --------------------------------------------------

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

function outwardNormal(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy)
  let nx = dy / len, ny = -dx / len
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
  const dot = nx * (CENTROID[0] - mx) + ny * (CENTROID[1] - my)
  if (dot > 0) { nx = -nx; ny = -ny }
  return [nx, ny]
}

const N_R = outwardNormal(BASE_R, APEX)
const N_T = outwardNormal(BASE_L, BASE_R)
const N_L = outwardNormal(APEX,   BASE_L)

// -- Tithi Nitya positions ----------------------------------------------------

const NITYA_OFF  = 22
const TOP_Y      = BASE_L[1] + N_T[1] * NITYA_OFF
const LDXDY      = (BASE_L[0] - APEX[0]) / (BASE_L[1] - APEX[1])
const NILAPAT_X  = BASE_L[0] + LDXDY * (TOP_Y - BASE_L[1])
const SHIVAD_X   = lerp(BASE_R, BASE_L, 0.05)[0]

const NITYA_POSITIONS = [
  ...Array.from({ length: 5 }, (_, i) => {
    const t = 0.10 + 0.80 * (i / 4)
    const [x, y] = lerp(APEX, BASE_R, t)
    return [x + N_R[0] * NITYA_OFF, y + N_R[1] * NITYA_OFF]
  }),
  (() => {
    const bx = N_T[0] + N_R[0], by = N_T[1] + N_R[1], bl = Math.sqrt(bx * bx + by * by)
    return [BASE_R[0] + (bx / bl) * NITYA_OFF, BASE_R[1] + (by / bl) * NITYA_OFF]
  })(),
  (() => { const [x, y] = lerp(BASE_R, BASE_L, 0.05); return [x + N_T[0] * NITYA_OFF, y + N_T[1] * NITYA_OFF] })(),
  ...Array.from({ length: 3 }, (_, i) => {
    const x = NILAPAT_X + (SHIVAD_X - NILAPAT_X) * (3 - i) / 4
    return [x, TOP_Y]
  }),
  [NILAPAT_X, TOP_Y],
  (() => { const [x, y] = lerp(BASE_L, APEX, 0.05); return [x + N_L[0] * NITYA_OFF, y + N_L[1] * NITYA_OFF] })(),
  ...Array.from({ length: 3 }, (_, i) => {
    const t = 0.05 + 0.83 * (i + 1) / 3
    const [x, y] = lerp(BASE_L, APEX, t)
    return [x + N_L[0] * NITYA_OFF, y + N_L[1] * NITYA_OFF]
  }),
  [CENTROID[0], CENTROID[1]],
]

// -- Guravah positions --------------------------------------------------------

const TZ      = GURU_TRAPEZOID
const ROW_GAP = 16
const H_INSET = 10

function trapEdgeX(y, side) {
  const t   = (y - TZ.yTop) / (TZ.yBottom - TZ.yTop)
  const top = side === 'L' ? TZ.topLeft[0]    : TZ.topRight[0]
  const bot = side === 'L' ? TZ.bottomLeft[0] : TZ.bottomRight[0]
  return top + (bot - top) * t
}

const GURU_Y = {
  manava: TZ.yBottom - 8.4,
  siddha: TZ.yBottom - 8.4 - ROW_GAP,
  divya:  TZ.yBottom - 8.4 - 2 * ROW_GAP,
}

function rowXY(count, y) {
  const left  = trapEdgeX(y, 'L') + H_INSET
  const right = trapEdgeX(y, 'R') - H_INSET
  return Array.from({ length: count }, (_, i) => [
    count === 1 ? (left + right) / 2 : left + ((right - left) / (count - 1)) * i,
    y,
  ])
}

const divyaRow  = rowXY(7, GURU_Y.divya)
const siddhaL   = (divyaRow[0][0] + divyaRow[1][0]) / 2
const siddhaR   = (divyaRow[5][0] + divyaRow[6][0]) / 2
const siddhaRow = Array.from({ length: 4 }, (_, i) => [
  siddhaL + ((siddhaR - siddhaL) / 3) * i, GURU_Y.siddha,
])
const manavaRow = rowXY(8, GURU_Y.manava)

const GURU_POSITIONS = {
  'guru-divya':  divyaRow,
  'guru-siddha': siddhaRow,
  'guru-manava': manavaRow,
}
const GURU_SECTION_IDS = ['guru-divya', 'guru-siddha', 'guru-manava']

// -- C8 dot positions ---------------------------------------------------------

const C8_OFF = 45
const C8_DOT_POSITIONS = [
  (() => { const [x, y] = lerp(BASE_L, APEX, 0.6);    return [x + N_L[0] * C8_OFF, y + N_L[1] * C8_OFF] })(),
  (() => { const [x, y] = lerp(BASE_R, APEX, 0.6);    return [x + N_R[0] * C8_OFF, y + N_R[1] * C8_OFF] })(),
  (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.72); return [x + N_T[0] * C8_OFF, y + N_T[1] * C8_OFF] })(),
  (() => { const [x, y] = lerp(BASE_L, BASE_R, 0.28); return [x + N_T[0] * C8_OFF, y + N_T[1] * C8_OFF] })(),
  [APEX[0],   APEX[1]  ],
  [BASE_R[0], BASE_R[1]],
  [BASE_L[0], BASE_L[1]],
]

// -- Korvin SVG dot tooltip ---------------------------------------------------

function DotTooltip({ tooltip }) {
  if (!tooltip) return null
  const tx  = Math.min(Math.max(tooltip.x, 70), 430)
  const ty  = tooltip.y - 20
  const w   = Math.max(60, tooltip.text.length * 8.5 + 16)
  const h   = 22
  return (
    <g pointerEvents="none">
      <rect
        x={(tx - w / 2).toFixed(1)} y={(ty - h / 2).toFixed(1)}
        width={w.toFixed(1)} height={h} rx={3}
        fill="rgba(0,0,0,0.88)"
      />
      <text x={tx.toFixed(1)} y={ty.toFixed(1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={15} fill="white"
        fontFamily="'Gentium Plus', Georgia, serif"
        pointerEvents="none">
        {tooltip.text}
      </text>
    </g>
  )
}

// -- Circuit aggregate status (for Svamini/Yogini box colour) ----------------

function circuitAggregateStatus(sectionId, allHistory) {
  const counts = getSectionStatusCounts([sectionId], allHistory)
  if (counts.notMemorised > 0) return 'notMemorised'
  if (counts.memorised > 0 && counts.partial === 0 && counts.notAttempted === 0) return 'memorised'
  if (counts.partial > 0 || counts.memorised > 0) return 'partial'
  return 'notAttempted'
}

// -- Svamini / Yogini side boxes (left/right of each circuit map) -------------
// Coloured by circuit aggregate status. Hover shows full name only when
// partial or not memorised. Tooltip appears opposite the containing side.

function CircuitSideBox({ label, tipText, status, tooltipSide }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const attempted = status !== 'notAttempted'
  const fill      = attempted ? STATUS_FILL[status] : 'transparent'
  const textCol   = attempted ? 'rgba(15,8,5,0.9)' : 'rgba(201,168,76,0.75)'
  const border    = attempted ? 'none' : '1px solid rgba(201,168,76,0.35)'
  const showTip   = status === 'partial' || status === 'notMemorised'
  return (
    <div className="relative rounded-md px-2 py-1 text-[13px] font-semibold cursor-default select-none iast"
         style={{ background: fill, color: textCol, border }}
         onMouseEnter={showTip ? () => setShowTooltip(true) : undefined}
         onMouseLeave={showTip ? () => setShowTooltip(false) : undefined}>
      {label}
      {showTooltip && (
        <div className={`absolute z-20 top-full mt-1 pointer-events-none
                         ${tooltipSide === 'right' ? 'left-0' : 'right-0'}
                         bg-surface-900 border border-surface-700 rounded px-2 py-1.5
                         text-xs iast text-cream whitespace-nowrap bg-surface-900/95 border border-surface-700/60 shadow-xl`}>
          {tipText}
        </div>
      )}
    </div>
  )
}

// -- Shared Korvin SVG base ---------------------------------------------------

const MAIN_TRI_PTS = [APEX, BASE_L, BASE_R]
  .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

function KorvinBase({ children, sectionId, allHistory }) {
  const section  = sectionId ? sectionById[sectionId] : null
  const svYog    = sectionId ? getSvaminiYoginiStatus(sectionId, allHistory) : { svamini: 'notAttempted', yogini: 'notAttempted' }
  const showBoxes = !!section
  return (
    <div>
      {showBoxes && (
        <div className="flex justify-between items-end pb-2">
          <CircuitSideBox label="Svāminī" tipText={SECTION_IAST[sectionId]?.svamini || section.chakraSvamini || ''} status={svYog.svamini} tooltipSide="right" />
          <CircuitSideBox label="Yoginī" tipText={SECTION_IAST[sectionId]?.yogini || section.yoginiType || ''} status={svYog.yogini} tooltipSide="left" />
        </div>
      )}
      <div className="w-full rounded-lg overflow-hidden" style={{ background: BG }}>
        <svg viewBox="-30 181 560 400" style={{ display: 'block', width: '100%' }}
             xmlns="http://www.w3.org/2000/svg">
          <path d={CONTEXT_FILL_PATH} fillRule="evenodd" fill={GOLD} fillOpacity={0.07} stroke="none" />
          {CONTEXT_TRIS.map((pts, i) => (
            <polygon key={`ctx-${i}`} points={pts}
              fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.14} />
          ))}
          <polygon points={MAIN_TRI_PTS}
            fill="rgba(201,168,76,0.04)" stroke={GOLD} strokeWidth={2.5} strokeLinejoin="miter" />
          {children}
        </svg>
      </div>
    </div>
  )
}

// -- Yantra container (fixed max size, no scrolling) --------------------------

function YantraContainer({ children, sectionId, allHistory }) {
  const section  = sectionId ? sectionById[sectionId] : null
  const svYog    = sectionId ? getSvaminiYoginiStatus(sectionId, allHistory) : { svamini: 'notAttempted', yogini: 'notAttempted' }
  const showBoxes = !!section
  return (
    <div className="w-full">
      {showBoxes && (
        <div className="flex justify-between items-end pb-2">
          <CircuitSideBox label="Svāminī" tipText={SECTION_IAST[sectionId]?.svamini || section.chakraSvamini || ''} status={svYog.svamini} tooltipSide="right" />
          <CircuitSideBox label="Yoginī" tipText={SECTION_IAST[sectionId]?.yogini || section.yoginiType || ''} status={svYog.yogini} tooltipSide="left" />
        </div>
      )}
      <div className="relative w-[90%] mx-auto rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
        {children}
      </div>
    </div>
  )
}

// -- Map panel components -----------------------------------------------------

function NyasaMap({ allHistory, script = 'iast' }) {
  const [tooltips, setTooltips] = useState([])
  const nyasaDeities = deityBySection['nyasa'] || []
  return (
    <YantraContainer>
      <SriYantraSVG className="w-full h-full" />
      {/* pointer-events-none on the SVG; interactive circles opt-in via pointerEvents="all" */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
           viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        {nyasaDeities.map(d => {
          const status = getDeityStatus(d, allHistory)
          const fill   = STATUS_FILL[status]
          const r      = status === 'notAttempted' ? 6 : 10
          const op     = status === 'notAttempted' ? 0.4 : 0.92
          const tip    = status === 'partial' || status === 'notMemorised'
          const seq    = d.sequenceInSection
          const dots   = seq >= 1 && seq <= 5
            ? [BODY_POSITIONS[seq - 1]]
            : seq === 6 ? ASTRA_POSITIONS : []
          const text   = displayName(d, script)
          // Astra (seq 6): hovering any dot shows tooltips at all 4 positions
          const handleEnter = tip ? () => setTooltips(
            seq === 6
              ? ASTRA_POSITIONS.map(([cx, cy]) => ({ text, x: cx, y: cy }))
              : [{ text, x: dots[0][0], y: dots[0][1] }]
          ) : undefined
          const handleLeave = tip ? () => setTooltips([]) : undefined
          return dots.map(([cx, cy], i) => (
            <circle key={`${d.id}-${i}`}
              cx={cx} cy={cy} r={r} fill={fill} opacity={op}
              pointerEvents={tip ? 'all' : 'none'}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave} />
          ))
        })}
        {tooltips.map((t, i) => <DotTooltip key={i} tooltip={t} />)}
      </svg>
    </YantraContainer>
  )
}

function YantraCircuitMap({ sectionId, allHistory, script = 'iast' }) {
  const [hoveredName, setHoveredName] = useState(null)
  const [mousePos,    setMousePos]    = useState(null)  // { x, y } as 0..1 fractions
  const targetDeities = deityBySection[sectionId] || []

  const filledRegions = { ...ALL_YANTRA_DIM }
  for (const d of targetDeities) {
    const key = regionKey(d)
    if (key) filledRegions[key] = STATUS_FILL[getDeityStatus(d, allHistory)]
  }

  const handleRegionHover = (regionId) => {
    const d = regionKeyToDeity[regionId]
    if (d && d.sectionId === sectionId) {
      const st = getDeityStatus(d, allHistory)
      if (st === 'partial' || st === 'notMemorised') {
        setHoveredName(displayName(d, script))
        return
      }
    }
    setHoveredName(null)
  }

  // Position tooltip: above cursor when cursor is in lower 80%, below when near top
  const tipTop = mousePos
    ? mousePos.y > 0.15
      ? `${(mousePos.y * 100 - 2).toFixed(1)}%`
      : `${(mousePos.y * 100 + 8).toFixed(1)}%`
    : '50%'
  const tipTransform = mousePos && mousePos.y > 0.15 ? 'translateY(-100%)' : 'translateY(0)'
  const tipLeft = mousePos ? `${Math.min(Math.max(mousePos.x * 100, 2), 60).toFixed(1)}%` : '50%'

  return (
    <YantraContainer sectionId={sectionId} allHistory={allHistory}>
      <div className="w-full h-full"
           onMouseMove={e => {
             const r = e.currentTarget.getBoundingClientRect()
             setMousePos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
           }}>
        <SriYantraSVG
          className="w-full h-full"
          filledRegions={filledRegions}
          onRegionHover={handleRegionHover}
          onRegionLeave={() => { setHoveredName(null); setMousePos(null) }}
        />
      </div>
      {hoveredName && mousePos && (
        <div className="absolute pointer-events-none z-10"
             style={{ left: tipLeft, top: tipTop, transform: tipTransform }}>
          <span className="iast text-sm text-cream bg-surface-900/95 border border-surface-700/60 px-2 py-1 rounded whitespace-nowrap shadow-lg">
            {hoveredName}
          </span>
        </div>
      )}
    </YantraContainer>
  )
}

function NityaMap({ allHistory, script = 'iast' }) {
  const [tooltip, setTooltip] = useState(null)
  const nityaDeities = deityBySection['nitya'] || []
  return (
    <KorvinBase>
      {nityaDeities.map((d, i) => {
        const pos    = NITYA_POSITIONS[i]
        if (!pos) return null
        const status = getDeityStatus(d, allHistory)
        const tip    = status === 'partial' || status === 'notMemorised'
        return (
          <circle key={d.id}
            cx={pos[0].toFixed(1)} cy={pos[1].toFixed(1)}
            r={status === 'notAttempted' ? 7 : 10}
            fill={STATUS_FILL[status]}
            opacity={status === 'notAttempted' ? 0.4 : 0.92}
            onMouseEnter={tip ? () => setTooltip({ text: displayName(d, script), x: pos[0], y: pos[1] }) : undefined}
            onMouseLeave={tip ? () => setTooltip(null) : undefined} />
        )
      })}
      <DotTooltip tooltip={tooltip} />
    </KorvinBase>
  )
}

function GuravahMap({ allHistory, script = 'iast' }) {
  const [tooltip, setTooltip] = useState(null)
  const allDots = []
  for (const sid of GURU_SECTION_IDS) {
    const ds    = deityBySection[sid] || []
    const poses = GURU_POSITIONS[sid] || []
    ds.forEach((d, i) => {
      if (poses[i]) allDots.push({ pos: poses[i], d, status: getDeityStatus(d, allHistory) })
    })
  }
  return (
    <KorvinBase>
      {allDots.map(({ pos, d, status }, i) => {
        const tip = status === 'partial' || status === 'notMemorised'
        return (
          <circle key={i}
            cx={pos[0].toFixed(1)} cy={pos[1].toFixed(1)}
            r={status === 'notAttempted' ? 7 : 10}
            fill={STATUS_FILL[status]}
            opacity={status === 'notAttempted' ? 0.4 : 0.92}
            onMouseEnter={tip ? () => setTooltip({ text: displayName(d, script), x: pos[0], y: pos[1] }) : undefined}
            onMouseLeave={tip ? () => setTooltip(null) : undefined} />
        )
      })}
      <DotTooltip tooltip={tooltip} />
    </KorvinBase>
  )
}

function C8Map({ allHistory, script = 'iast' }) {
  const [tooltip, setTooltip] = useState(null)
  const c8Deities = deityBySection['circuit-8'] || []
  return (
    <KorvinBase sectionId="circuit-8" allHistory={allHistory}>
      {c8Deities.map((d, i) => {
        const pos    = C8_DOT_POSITIONS[i]
        if (!pos) return null
        const status = getDeityStatus(d, allHistory)
        const tip    = status === 'partial' || status === 'notMemorised'
        return (
          <circle key={d.id}
            cx={pos[0].toFixed(1)} cy={pos[1].toFixed(1)}
            r={status === 'notAttempted' ? 7 : 11}
            fill={STATUS_FILL[status]}
            opacity={status === 'notAttempted' ? 0.4 : 0.92}
            onMouseEnter={tip ? () => setTooltip({ text: displayName(d, script), x: pos[0], y: pos[1] }) : undefined}
            onMouseLeave={tip ? () => setTooltip(null) : undefined} />
        )
      })}
      <DotTooltip tooltip={tooltip} />
    </KorvinBase>
  )
}

function C9Map({ allHistory, script = 'iast' }) {
  const c9Deities = deityBySection['circuit-9'] || []
  const status    = c9Deities.length > 0 ? getDeityStatus(c9Deities[0], allHistory) : 'notAttempted'
  const d         = c9Deities[0]
  const showName  = d && (status === 'partial' || status === 'notMemorised')
  return (
    <KorvinBase sectionId="circuit-9" allHistory={allHistory}>
      <circle
        cx={BINDU[0].toFixed(1)} cy={BINDU[1].toFixed(1)}
        r={status === 'notAttempted' ? 8 : 14}
        fill={STATUS_FILL[status]}
        opacity={status === 'notAttempted' ? 0.4 : 0.95} />
      {showName && (
        <text
          x={BINDU[0].toFixed(1)} y={(BINDU[1] - 22).toFixed(1)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={15} fill={GOLD}
          fontFamily="'Gentium Plus', Georgia, serif"
          style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,1))' }}
          pointerEvents="none">
          {displayName(d, script)}
        </text>
      )}
    </KorvinBase>
  )
}

function ListMap({ sectionId, allHistory, script }) {
  const ds = [...(deityBySection[sectionId] || [])].reverse()

  return (
    <div className="space-y-1 py-1">
      {ds.map(d => {
        const status    = getDeityStatus(d, allHistory)
        const attempted = status !== 'notAttempted'
        const bg        = attempted ? STATUS_FILL[status] : 'rgba(201,168,76,0.07)'
        const textCol   = attempted ? 'rgba(15,8,5,0.9)' : '#8a7560'
        return (
          <div key={d.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${script !== 'devanagari' ? 'iast' : ''}`}
            style={{ background: bg }}>
            <span className="text-sm leading-snug flex-1 font-semibold" style={{ color: textCol }}>
              {displayName(d, script)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// -- Status counts summary ----------------------------------------------------

function StatusCounts({ counts, tr = k => k }) {
  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <span className="text-green-400">✓ {counts.memorised}</span>
      <span className="text-amber-400">~ {counts.partial}</span>
      <span className="text-red-400">✗ {counts.notMemorised}</span>
      <span className="text-surface-600">— {counts.notAttempted}</span>
      <span className="text-surface-600">({tr('map.last3')})</span>
    </div>
  )
}

// -- Legend -------------------------------------------------------------------

function Legend({ tr = k => k }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-mono pt-2 border-t border-surface-800 text-center justify-center">
      <span className="text-green-400">✓ {tr('map.leg_mem')}</span>
      <span className="text-amber-400">~ {tr('map.leg_part')}</span>
      <span className="text-red-400">✗ {tr('map.leg_not')}</span>
      <span className="text-surface-600">— {tr('map.leg_none')}</span>
    </div>
  )
}

// -- Main carousel ------------------------------------------------------------

export default function MemoMapVisuals({ allHistory, script = 'iast', tr = k => k, navCollapsed = false }) {
  const [mapIdx, setMapIdx] = useState(0)

  const map   = MAPS[mapIdx] || MAPS[0]
  const total = MAPS.length

  const prev = () => setMapIdx(i => Math.max(0, i - 1))
  const next = () => setMapIdx(i => Math.min(total - 1, i + 1))

  const counts = getSectionStatusCounts(map.sectionIds, allHistory)

  const nav = (
    <div className="flex-shrink-0">
      <div className="flex items-center gap-2">
        <button onClick={prev} disabled={mapIdx === 0}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded text-cream text-xl hover:bg-surface-800 disabled:opacity-20 transition-colors">
          ←
        </button>
        <div className="flex-1 text-center min-w-0">
          <div className="text-cream text-sm font-medium truncate">{map.trKey ? tr(map.trKey) : map.label}</div>
        </div>
        <button onClick={next} disabled={mapIdx === total - 1}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded text-cream text-xl hover:bg-surface-800 disabled:opacity-20 transition-colors">
          →
        </button>
      </div>
      <div className="flex items-center justify-between text-[11px] font-mono text-muted -mt-2">
        <span className="w-10 text-center">{tr('map.previous')}</span>
        <span>{mapIdx + 1} / {total}</span>
        <span className="w-10 text-center">{tr('map.next')}</span>
      </div>
    </div>
  )

  const mapPanel = (
    <>
      {map.type === 'nyasa'  && <NyasaMap allHistory={allHistory} script={script} />}
      {map.type === 'nitya'  && <NityaMap allHistory={allHistory} script={script} />}
      {map.type === 'gurava' && <GuravahMap allHistory={allHistory} script={script} />}
      {map.type === 'yantra' && <YantraCircuitMap sectionId={map.id} allHistory={allHistory} script={script} />}
      {map.type === 'c8'     && <C8Map allHistory={allHistory} script={script} />}
      {map.type === 'c9'     && <C9Map allHistory={allHistory} script={script} />}
      {map.type === 'list'   && <ListMap sectionId={map.id} allHistory={allHistory} script={script} />}
    </>
  )

  // navCollapsed: cap map width to viewport height so 1:1 ratio fits without scroll
  if (navCollapsed) {
    return (
      <div className="h-full flex flex-col gap-2 overflow-hidden">
        {nav}
        <StatusCounts counts={counts} tr={tr} />
        {/* maxWidth = 100vh − chrome so the square map never exceeds available height */}
        <div className="flex-shrink-0 w-full" style={{ maxWidth: 'calc(100vh - 200px)', margin: '0 auto' }}>
          {mapPanel}
        </div>
        <Legend tr={tr} />
      </div>
    )
  }

  // Default stacked layout — entire panel constrained so prev/next align with image edges
  return (
    <div className="space-y-3" style={{ maxWidth: 'calc(100dvh - 340px)', margin: '0 auto' }}>
      {nav}
      <StatusCounts counts={counts} tr={tr} />
      {mapPanel}
      <Legend tr={tr} />
    </div>
  )
}
