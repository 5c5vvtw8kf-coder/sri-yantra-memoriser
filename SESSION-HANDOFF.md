# Session Handoff — Śrī Yantra Memoriser

**Last session:** 23 May 2026
**Status:** React/Vite app running. Visual Explorer mode largely complete. All circuits interactive with correct deity ordering.

---

## Project Structure

```
app/                        React/Vite app (run: cd app && npm run dev)
  src/
    components/
      SriYantraSVG.jsx      All geometry + hit zones + region fills
      App.jsx               Main app shell, tab routing, circuit selection
      BhupuraView.jsx       C1 — bhupura (outer square)
      NyasaView.jsx         Nyāsāṅga Devatāḥ (6 deities, 9 dots)
      C2View.jsx            C2 — 16-petal lotus
      C3View.jsx            C3 — 8-petal lotus
      C4View.jsx            C4 — 14 triangles
      C5View.jsx            C5 — 10 outer triangles
      C6View.jsx            C6 — 10 inner triangles
      C7View.jsx            C7 — 8 triangles
      C8View.jsx            C8 — primary triangle
      ClosingView.jsx       Nava Chakreshvari + closing epithets
    data/
      khadgamala-canonical.json   All deity/circuit data
      triangle-regions.json       Pre-computed polygon points + centroids for C4–C8
  korvin-construction.html    Reference only — do not edit
  Sri Yantra B&W.jpg          B&W aesthetic reference
  Sri Yantra.jpg              Colour reference
  CLAUDE.md                   Full project brief — read this first
```

---

## SVG Coordinate System

- Centre: `CX=260, CY=270`
- Inner triangle circle: `R=110` (also Rin for C3 petals)
- y-down convention; angle 0° = top, increases clockwise
- viewBox: `"45 55 430 430"` — used by all circuit view overlay SVGs

---

## What's Complete

### Geometry
All 9 circuits rendered correctly. Triangles from Korvin construction intersections (`UFT_POLYS`, `DFT_POLYS`). Petals using cubic bezier per side. Bhupura from Korvin polygon point strings.

### Visual Explorer — all circuits wired
Each circuit tab shows the full Sri Yantra with deity dots. Tap a dot → slide-up panel with name (IAST / Devanagari / English). Hover on desktop → tooltip.

### Hit zones (main Yantra tab)
Tap any region → right panel shows circuit info. Fixed this session: was off by one (C4 showed C5 etc). Now uses exact per-triangle polygons from `triangle-regions.json` for circuits 4–8.

### Deity ordering — all circuits corrected this session
All circuits now start at the **bottom** and run **anti-clockwise**:

| Circuit | Count | Bottom deitySeq | Order array |
|---------|-------|-----------------|-------------|
| C2 | 16 | petal 1 (180°) | `[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]` |
| C4 | 14 | deitySeq 8 (180°) | `[8,7,6,5,4,3,2,1,14,13,12,11,10,9]` |
| C5 | 10 | deitySeq 6 (180°) | `[6,5,4,3,2,1,10,9,8,7]` |
| C6 | 10 | deitySeq 6 (180°) | `[6,5,4,3,2,1,10,9,8,7]` |
| C7 | 8  | deitySeq 5 (180°) | `[5,4,3,2,1,8,7,6]` |

C3 uses a separate petal-order system (already correct before this session).

### NyasaView — Netradevi dot
Corrected to (CX=250, CY=250) — true centre of the 0 0 500 500 overlay. The old `CY − 6` offset was from an earlier coordinate system and no longer applies.

### Bindu (C9) hit zone
Shrunk from r=8 to r=4 so the C8 selection area is more accessible.

---

## How the Deity-Order Mapping Works (C4–C7)

Each circuit view has:
1. `CX_DEITY_ORDER` — array mapping chant seq (index) → triangle deitySeq
2. `CX_SEQ_MAP` — deitySeq → {x, y} from triangle-regions.json
3. `CX_DOT_POSITIONS` — chant seq → {x, y} (derived from the two above)
4. `activeId` in filledRegions uses `CX_DEITY_ORDER[seq - 1]` to highlight the correct triangle

For C2: `C2_PETAL_ORDER` maps chant seq → SVG petal number, same pattern.

---

## What's Next (suggested)

1. **C3 deity ordering** — verify C3 starts at the correct position and runs the right direction (not checked this session)
2. **C8 View** — primary triangle, 7 deities (Bāṇinī, Cāpinī, Pāśinī, Aṅkuśinī + 3 Mahā deities). Check positions and ordering
3. **Spot Check mode** — random deity lights up on the yantra; user names it (or selects from options)
4. **Line Drill mode** — cross-circuit geometric lines; user recites all deities along a line in order
5. **Circuit Quiz mode** — shown a deity name, identify which circuit it belongs to
6. **Sequence Drill mode** — fill-in-the-blanks for the full chant in order
7. **Lineage editing** — inline name editing, stored in IndexedDB, export/import as JSON

---

## Notes

- `triangle-regions.json` is the source of truth for C4–C8 positions. The `deitySeq` field in that file is the geometric sequence (top = seq 1, clockwise), NOT the chant sequence.
- `khadgamala-canonical.json` `sequenceInSection` is the chant sequence.
- The mapping between them is handled by `CX_DEITY_ORDER` in each view — this is intentional and correct.
- `HIT_ZONE_POLYGONS` in `SriYantraSVG.jsx` is still used by `RegionFills` for circuit colour masks. Do not remove it. The click detection now uses `TRI_HIT_ZONES` instead.
- `korvin-construction.html` is reference only — do not edit.
