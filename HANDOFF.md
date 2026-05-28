# Sri Yantra Memoriser — Handoff Notes

**Date:** 28 May 2026

---

## Next task — START HERE

**Line Drill mode** — next major feature after Spot Check views are validated.

Open question to resolve before coding: how many pre-defined geometric lines across the triangular circuits, and who defines them — manually by Chris, or derived from SVG geometry?

If testing the Cakra Spot Check view, refer to the NavaCakraSpotCheckView notes below for the circuit geometry details.

---

## What was completed this session

### File changed
- `app/src/components/NavaCakraSpotCheckView.jsx` — significant rework (see below)

All other five Spot Check views (C89, Nyāsa, Nitya, Guravaḥ, plus SpotCheckView itself) were validated and are unchanged.

### NavaCakraSpotCheckView — full change log

**Circuit highlights — `computeFills` and `CIRCUIT_FILL_IDS`:**
- C4–C8 triangle sub-region DIM fills removed from the base fills. Those sub-regions now render `fill="transparent"` with no stroke, preventing inner-circuit gold outlines from showing over the active circuit's cream fill.
- `c9` base fill (`'#000000'`) removed — the default gold bindu in SriYantraSVG renders only when `filledRegions['c9']` is unset. Restoring it to unset lets the gold dot show; circuit 9 still turns cream when active.
- `CIRCUIT_FILL_IDS[1]` = `['c1-outer', 'c1-mid']` — fills only the two bhupura wall bands. `'c1-inner'` (the open space between the inner bhupura line and the Valayam circles) is no longer filled.
- `CIRCUIT_FILL_IDS[8]` = `[]` — no `filledRegions` fill for circuit 8. Instead a separate SVG overlay renders the correct shape (see below).

**Circuit 8 central triangle overlay:**

The correct circuit 8 region is the small central triangle formed by DFT5's apex clipped to DFT4's base line — NOT the full DFT4 triangle. Vertices in SriYantraSVG coordinate space:

```
"260,283.301 248.565,263.193 271.435,263.193"
```

Derivation: DFT5 apex = (260, 283.301); DFT4 base y = 263.193;
t = (263.193 − 283.301) / (182.872 − 283.301) ≈ 0.20022;
left x = 260 − 0.20022 × 57.112 ≈ 248.565, right x ≈ 271.435.

This matches the korvinGeometry.js `centralTriangle()` computation (KORVIN_CENTRAL), but in the raw Korvin/SriYantraSVG coordinate space (not the `toScreen` transformed space used by InnerView etc.).

The overlay is a second `<svg>` element with `viewBox="45 55 430 430"` (identical to SriYantraSVG) positioned `absolute inset-0 w-full h-full` with `pointerEvents: 'none'`. The polygon fill switches between HIGHLIGHT / FLASH_GREEN / FLASH_RED based on `flash` state. Hover detection for circuit 8 still works via the transparent `tri-c8-xx` polygons that the SriYantraSVG renders in hoverable mode.

**Hover detection:**
- `onMouseEnter` removed from the container div. Hover is now driven by `onRegionHover` passed to SriYantraSVG, which fires per SVG region.
- `regionToCircuit(id)` maps region IDs to circuit numbers (c1/c1-*, petal-c2-*, petal-c3-*, tri-c4-* … tri-c8-*, c8, c9).
- `handleRegionHover(id)` sets `hovered = true` only when `regionToCircuit(id) === parsed.circuitNumber`.
- Container `onMouseLeave` still resets hover when the mouse leaves the yantra entirely.

**Tooltip:**
- Positioned at `top-0 pt-5` (north gate), not bottom.
- Only shows when hovering the active circuit (not the whole yantra).
- Yoginī font size matched to Svāminī (both 15px).
- `parsed.type === 'both'`: two rows (Svāminī gold-300, Yoginī gold-500); single type: one row.

**Timing — `scheduleAdvance` + right-click toggle:**
- `advanceTimer` ref stores the advance-to-next timeout so it can be cancelled.
- Flash hold is **3 000 ms** (3 seconds).
- `handleContextMenu` (right-click during flash): toggles correct ↔ wrong, resets the 3-second clock.
- `scheduleAdvance()` extracted as a `useCallback` used by both `advance` and `handleContextMenu`.
- Both `clickTimer` and `advanceTimer` are cleared in the cleanup `useEffect`.

---

## App architecture reminder
- Sidebar: `w-52` (208px) | Main: `flex-1`, centered `maxWidth: min(100%, calc(100vh - 6rem))` | Right panel: `w-64` (256px)
- All pages: yantra outer = `relative w-full` + `paddingBottom:100%`; inner = `absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60`
- `displayName(deity, script)` lives in `app/src/utils.js` — import from there, never define locally
- **SC_FILTERS** exported from SpotCheckView.jsx — import in App.jsx for right panel rendering
- **Devanagari text:** never italicised, never fake-bolded — use colour or spacing for emphasis
- **OneDrive write truncation:** the Edit tool truncates large files on the OneDrive mount with null bytes. After every Edit call on a large file, run: `python3 -c "path='...'; f=open(path,'rb'); r=f.read(); f.close(); r=r.rstrip(b'\x00'); open(path,'wb').write(r)"`. Also verify line count with `wc -l`. If truncated mid-JSX, append the missing tail using Python read/strip/append pattern.
- **Git:** works from Windows terminal only. OneDrive blocks git write operations from Cowork sandbox.

### SriYantraSVG filledRegions — key region IDs
| ID pattern | What it fills |
|---|---|
| `c1` | Full bhupura ring (with mask-c1) |
| `c1-outer` | Outer bhupura wall band (OUTER→MAIN polygon) |
| `c1-mid` | Middle bhupura wall band (MAIN→INNER polygon) |
| `c1-inner` | Open space inside INNER polygon down to Valayam circle |
| `petal-c2-01…16` | Individual C2 petals (applied directly to `<path>`, via c2PetalFills) |
| `petal-c3-01…08` | Individual C3 petals |
| `tri-c4-01…14` | C4 triangle sub-regions (non-overlapping) |
| `tri-c5-01…10` | C5 triangle sub-regions |
| `tri-c6-01…10` | C6 triangle sub-regions |
| `tri-c7-01…08` | C7 triangle sub-regions |
| `tri-c8-01` | Full DFT4 triangle polygon (too large for C8 highlight — use overlay instead) |
| `tri-c8-bg-01/02` | Sub-polygons inside DFT4; render ON TOP of tri-c8-01 — do not set unless setting all three |
| `c8` | DFT4 hit zone with mask-c8 (bindu cut out) — also too large for C8 highlight |
| `c9` | Bindu circle r=1.4. When unset, default gold bindu renders. Set only to cream/flash or leave unset. |

C8 correct highlight = SVG overlay polygon `"260,283.301 248.565,263.193 271.435,263.193"` (central triangle).

### SC_FILTERS current state
```js
export const SC_FILTERS = [
  { id: 'nyasa',     label: 'Nyāsa', visualMode: 'nyasa' },
  { id: 'nitya',     label: 'Nitya', visualMode: 'nitya' },
  { id: 'guravah',   label: 'Gurus', sectionIds: [...], visualMode: 'guravah', subFilters: [...] },
  { id: 'circuit-1', label: '1st',   sectionIds: ['circuit-1'], subFilters: [...] },
  { id: 'circuit-2', label: '2nd',   sectionIds: ['circuit-2'] },
  { id: 'circuit-3', label: '3rd',   sectionIds: ['circuit-3'] },
  { id: 'circuit-4', label: '4th',   sectionIds: ['circuit-4'] },
  { id: 'circuit-5', label: '5th',   sectionIds: ['circuit-5'] },
  { id: 'circuit-6', label: '6th',   sectionIds: ['circuit-6'] },
  { id: 'circuit-7', label: '7th',   sectionIds: ['circuit-7'] },
  { id: 'c8-c9',     label: '8·9',   sectionIds: [...], visualMode: 'c8c9', defaultSubFilter: null, subFilters: [...] },
  { id: 'nava-cakra',label: 'Cakra',                   visualMode: 'navaCakra', defaultSubFilter: null, subFilters: [...] },
  { id: 'all',       label: 'All',   sectionIds: null },
]
```

---

## Outstanding to-do list

### Feature work — learning modes
- **Line Drill mode** ← NEXT (resolve geometric line definitions first)
- **Circuit Quiz mode**
- **Sequence Drill mode**
- **Preamble sections** (Sri Devi Prarthana, Dhyanam) — after core spatial modes are stable

### Feature work — analytics
- **Memo Map** — overlay persisted performance data on the Sri Yantra. Requires IndexedDB layer first (results currently ephemeral).

### Tech debt
- `guravaMemorse` typo in App.jsx → `guravaMemorise` (low priority)

### Data
- Multi-script: remaining vignanam.org scripts (research scraping approach before doing manually)

### Phase 2
- PWA manifest + service worker (offline support)

---

## Git baseline
Last commit: `fc415df` — "Spot Check overhaul; right panel controls; UI consistency pass"
One file modified this session: `app/src/components/NavaCakraSpotCheckView.jsx`

Suggested commit message:
```
NavaCakra Spot Check: circuit fills, hover, tooltip, timing fixes

- Circuit 8: SVG overlay for correct central triangle shape
- Circuit 1: fill bhupura walls only (remove c1-inner)
- Remove C4–C8 DIM fills from base to prevent stroke bleed-through
- Remove c9 black fill; default gold bindu now visible
- Hover restricted to active circuit via onRegionHover
- Tooltip moved to north gate (top-0)
- Yogini font size matched to Svamini (15px)
- 3-second flash hold; right-click toggles correct/wrong
```

Git works from Windows terminal only.
