# Sri Yantra Memoriser — Session Handoff

**Date:** 26 May 2026
**Status:** Active development. NavaChakreshvariView rebuilt this session — dots removed, whole-circuit interaction implemented.
**Next task suggestions below — see "Suggested next work items".**

---

## What the app is

A React/Vite/Tailwind web app for memorising the Khadgamala Stotra by spatial recall of the Sri Yantra geometry. The primary learning mode is **Memorise** — positions light up one at a time; the user double-clicks for "memorised", single-clicks for "not yet". Deities are drilled in chant order (outermost → innermost).

Run it: `cd app && npm run dev` (port 5173). No backend, no auth.

---

## ~~NEXT TASK: NavaChakreshvariView rebuild~~ — DONE (26 May 2026)

The rebuild was completed this session. Summary of what was done:

**`SriYantraSVG.jsx` — additive changes only:**
- `RegionFills` now accepts three new optional props: `onRegionHover`, `onRegionLeave`, `onRegionDoubleClick`.
- `onMouseEnter` / `onMouseLeave` / `onDoubleClick` wired to every interactive region: C1 bhupura polygon, C2–C8 masked regions, all triangle sub-region polygons (`tri-cN-NN`), C9 bindu dot, and all bhupura marker circles.
- C2 and C3 petal `path` elements also receive hover/leave/dblclick.
- C1 bhupura now renders with `fill="transparent"` when not highlighted (previously not rendered at all), so it is hit-testable for hover even when unselected.
- Triangle sub-region condition updated: renders when `fill || clickable || hoverable` (previously `fill || clickable`).
- `SriYantraSVG` component signature updated with the three new props (all default `null`); threaded into `RegionFills` and petal elements.
- No existing caller is affected — all new props default to `null`, existing behaviour unchanged.

**`NavaChakreshvariView.jsx` — full rebuild:**
- `DOT_POSITIONS`, `DeityDot`, dot-overlay `<svg>`, and all dot-rendering blocks removed.
- `regionToCircuit(id)` normalises any region id (`c1`, `bhupura-NN`, `petal-c2-NN`, `tri-c4-NN`, `c9`, etc.) to a circuit number 1–9.
- `CIRCUIT_TOOLTIP_POS` — lookup table of tooltip anchor points per circuit in SriYantraSVG SVG coordinates (viewBox `45 55 430 430`).
- Explore mode: `onRegionHover` → highlight whole circuit + show tooltip; `onRegionClick` → toggle selection; hovered circuit takes visual priority over selected.
- Memorise mode: `onRegionClick` / `onRegionDoubleClick` → normalise to circuit → derive sequenceInSection → drive `handleMemClick` / `handleMemDblClick`. Right-click uses `lastHoveredCircuit` ref (no extra prop needed on SriYantraSVG).
- Tooltip rendered in a `pointerEvents:'none'` overlay SVG with `viewBox="45 55 430 430"` — same coordinate space as SriYantraSVG, so `CIRCUIT_TOOLTIP_POS` values map directly.
- `buildFills` updated: `c1` key always emitted (`'transparent'` when unselected) for hit-testing; bindu `c9` stays black (`#000000`) or dark-red (`#8b0000`) when its circuit is active — never cream.
- Idle hint updated to: `"Hover or click from outside in towards the Bindu to reveal the Chakresvaris in order"`.

**Acceptance check (run manually):**
- No dots visible anywhere on the page.
- Hovering any circuit (including bhupura and petals) highlights the whole circuit and shows the correct Tripura-form tooltip.
- Clicking a circuit opens the form in the deity panel.
- Memorise mode drills 1→9 by circuit click/double-click; right-click on a past circuit toggles its result.
- Bindu is black throughout.
- `npm run build` on Windows — clean compile expected.

---

### Goal

`NavaChakreshvariView.jsx` currently places **nine dots** on the yantra — one per circuit — and the user taps a dot to reveal that circuit's Tripura form. Replace the dots entirely with **whole-circuit interaction**, consistent with how every other avarana page already works.

### Required behaviour

**Explore mode:**
- Hovering over **any circuit** (c1–c9) fills/highlights that whole circuit and shows a tooltip with its Nava Chakreshvarī form.
- Clicking a circuit reveals the form in the deity panel — **the form name, not a deity**: Tripurā, Tripureśī, Tripurasundarī, Tripuravāsinī, Tripuraśrī, Tripuramālinī, Tripurasiddhē, Tripurāmbā, Mahātripurasundarī (sequence 1→9, outermost→innermost).
- Idle-hint message: change the current text `"Tap any dot to reveal the Tripura form for that circuit"` (NavaChakreshvariView.jsx ~line 341) to:
  `"Hover or click from outside in towards the Bindu to reveal the Chakresvaris in order"`

**Memorise mode:**
- Click or double-click **any part of a circuit** — same functionality as the other avarana pages (single-click = not yet/wrong, double-click = memorised/correct, advances the sequence; right-click toggles a past result).
- The active circuit highlights on the yantra (this already works via `buildFills` + `activeCircuit`).

**Both modes:**
- The bindu (c9) stays **black** so it contrasts against the cream-filled C8 primary triangle. `buildFills` already does this — keep it.

### What to remove

- `DOT_POSITIONS` constant (lines ~35–45)
- The `DeityDot` component (lines ~133–152) and both dot-rendering blocks (Explore dots ~251–264, Memorise dots ~267–296)
- The dot-overlay `<svg viewBox="0 0 500 500">` wrapper (~243–306) — the tooltip currently lives inside it, so the tooltip needs a new home (see below)

### What to keep

- `buildFills(sel)` — already fills every circuit region (petals c2/c3, triangles c4–c8, c8-01 + black backgrounds, c9 bindu). It is the highlight engine. Keep it.
- `activeCircuit` / `selectedCircuit` logic and the `<SriYantraSVG ... filledRegions={filledRegions} />` base layer.
- Memorise handlers (`handleMemClick`, `handleMemDblClick`), completion overlay, context menu, legend, caption.
- The `Tooltip` component — but it must now be positioned from a circuit hover, not a dot.

### Recommended implementation approach

`SriYantraSVG.jsx` already has the circuit hit-geometry. The `RegionFills` component (lines ~354–545) renders each circuit region (c1–c9) and, when an `onRegionClick` prop is passed, makes each one **clickable** — it calls `onRegionClick('c1')` … `onRegionClick('c9')`, plus `onRegionClick('tri-cN-NN')` for triangle sub-regions and `onRegionClick('bhupura-NN')` for bhupura markers.

**It does NOT currently support hover or double-click.** Two options:

- **Option A (recommended):** Add `onRegionHover`, `onRegionLeave`, and `onRegionDoubleClick` callbacks to `RegionFills` and thread them through `SriYantraSVG`'s props, attaching them to each region polygon/circle the same way `onClick` is attached today. This is purely additive — no existing caller passes these, so nothing else changes. NavaChakreshvariView then passes all four callbacks and normalises the region id to a circuit number in its handler:
  - `c1`…`c9` → 1…9
  - `tri-cN-NN` → N
  - `bhupura-NN` → 1
  Note: the transparent triangle sub-region polygons render on top of the c4–c8 masked region polygons and will intercept the event first — hence the id-normalisation step is required, not optional.
- **Option B:** Overlay transparent hit-area polygons in NavaChakreshvariView (the `C4View.jsx` pattern — an overlay `<svg>` with `fill="transparent"` polygons carrying the handlers). Rejected as the recommended path because the c1–c9 region geometry is complex (masked rings, Korvin polygons) and re-deriving it in the overlay duplicates `RegionFills`. Reuse the geometry that already exists.

Go with Option A. Keep the change to `SriYantraSVG.jsx` strictly additive so no other view is affected.

### Tooltip placement after the dot overlay is removed

The tooltip currently sits inside the dot-overlay svg. After removal, render it inside `SriYantraSVG`'s own coordinate space, or place a thin tooltip-only overlay svg (`viewBox="0 0 500 500"`, `pointerEvents:'none'`) above the base yantra. Position it near a representative point of the hovered circuit (e.g. the circuit's outer-edge midpoint, or top-centre) rather than at a dot coordinate.

### Acceptance check

After the rebuild: no dots anywhere on the page; hovering any circuit highlights the whole circuit + shows the correct Tripura-form tooltip; clicking opens the form in the panel; memorise mode drills 1→9 by clicking circuits; bindu is black throughout; idle hint reads the new message. Then `npm run build` on Windows for a clean compile.

---

## Architecture overview

```
app/
  src/
    App.jsx                        — root: lifted state, tab routing, right-panel controls
    korvinGeometry.js              — shared geometry module (single source of truth)
    data/
      khadgamala-canonical.json    — canonical deity data (~200+ deities)
    components/
      SriYantraSVG.jsx             — the main yantra SVG
      [see component table below]
```

### korvinGeometry.js — single source of truth (NEW this session)

`app/src/korvinGeometry.js` is the canonical geometry module. It is derived from the Korvin construction (`korvin-construction.html`) — chosen deliberately as the one geometry to standardise on. It exports:

- `KORVIN` — the nine interlocking triangles (4 upward UFT1–4, 5 downward DFT1–5).
- `centralTriangle()` — the **central triangle**: apex of DFT5 + base of DFT4. This is the "main triangle" used as the focal figure on the InnerView, GuravaView, C8View and C9View pages.
- `SCALE = 8`, `toScreen()` — affine transform mapping Korvin coords → screen coords (uniform ×8).
- `APEX, BASE_L, BASE_R, CENTROID, BINDU` — the central triangle's key points.
- `CONTEXT_TRIS` — the surrounding eight context triangles as screen-space polygon point strings.
- `CONTEXT_FILL_PATH` — a single path for the even-odd light fill of the interlocking pattern.
- `GURU_TRAPEZOID` — the trapezoid above the central triangle, used to lay out the guru dots.

**IMPORTANT — do not "fix" this:** DFT3 and UFT4 base corners were deliberately *snapped* so the even-odd fill has no sliver artefacts (DFT3 base `[[260,326.795],[225.536,250.569],[294.464,250.569]]`; UFT4 `[[260,236.760],[211.992,350.380],[308.008,350.380]]`). A NOTE comment in the file warns against restoring the raw values. Leave them snapped.

---

### Component inventory

| File | Tab ID | Memorise? | Count | Notes |
|------|--------|-----------|-------|-------|
| NyasaView.jsx | `nyasa` | yes | 6 | Seq 6 (Astra) renders at 4 gate positions |
| InnerView.jsx | `inner` | yes | 16 | Tithi Nitya Devatas — central triangle + context |
| GuravaView.jsx | `gurava` | yes | 19 | Guru rows in the trapezoid above the central triangle |
| BhupuraView.jsx | `bhupura` | yes | 28 | Circuit 1; uses SriYantraSVG as background |
| C2View.jsx | `c2` | yes | 16+2 | 16 petals + Svamini + Chakreshvari |
| C3View.jsx | `c3` | yes | 8+2 | 8 petals + extras |
| C4View.jsx | `c4` | yes | 14+2 | 14 triangles; overlay transparent-hit-polygon pattern |
| C5View.jsx | `c5` | yes | 10+2 | 10 outer triangles |
| C6View.jsx | `c6` | yes | 10+2 | 10 inner triangles |
| C7View.jsx | `c7` | yes | 8+2 | 8 triangles; "Vagdevatas" |
| C8View.jsx | `c8` | yes | 7 | Central triangle as main figure; all 7 pure deities |
| C9View.jsx | `c9` | yes | 1 | Bindu; single point, cream flash on completion |
| NavaChakreshvariView.jsx | `chakreshvari` | yes | 9 | **REBUILD PENDING — see NEXT TASK above** |
| ClosingView.jsx | `closing` | yes | 10 | Card-based; completion offers "Start from beginning" |
| BinduView.jsx | (sub-view) | no | — | |
| CircuitBrowser.jsx | `browser` | no | — | Reference view, no drill |

---

## Memorise mode — how it works

Pattern is identical across all memorise-enabled views.

```
State (in App.jsx), per tab:
  [tab]Memorise      bool    — is memorise mode active?
  [tab]CurrentSeq    int     — which position is currently active (1-indexed)
  [tab]Results       {}      — { [seq]: 'correct' } per memorised position
  [tab]PrevResults   {}|null — results from the last completed round
  [tab]Flash         bool    — all-correct flash (cream, 1 s, blocks interaction)

Colours:
  Active        → ACTIVE_FILL = 'rgba(255,248,200,0.92)' (cream)
  Past correct  → RED  = '#c0392b'
  Past wrong    → GOLD = '#c9a84c'
  Future        → dim / 15% opacity, no interaction
  Flash         → all cream

Interactions:
  double-click  → mark correct, advance
  single-click  → mark wrong, advance
  right-click   → context menu to toggle a past result
  hover         → tooltip with deity name (suppressed during flash)

Completion:
  currentSeq > TOTAL → overlay with score, "Try again" + "Next →"
```

**The "Next →" chain:**
`nyasa → inner → gurava → bhupura → c2 → c3 → c4 → c5 → c6 → c7 → c8 → c9 → chakreshvari → closing → "Start from beginning" (→ nyasa)`

---

## What was done this session (26 May 2026)

**NavaChakreshvariView rebuilt.** Dots replaced with whole-circuit interaction. Full details in the completed task section above.

**SriYantraSVG extended (additive).** Three new optional props — `onRegionHover`, `onRegionLeave`, `onRegionDoubleClick` — wired to every region type. No existing callers affected.

---

## What was done in the previous session (25 May 2026)

**Shared geometry module created.** `app/src/korvinGeometry.js` — single source of truth, derived from the Korvin construction (see section above).

**Four views rebuilt on the central triangle.** InnerView, GuravaView, C8View and C9View now import from `korvinGeometry.js`. The focal figure is the **central triangle** (apex of DFT5 + base of DFT4) — previously these pages mistakenly used the whole of DFT5. The central triangle is enlarged and centred; the eight surrounding context triangles overflow/clip the viewport rather than being shrunk to fit, all at one consistent scale (`SCALE = 8`).

**Even-odd context fill.** The interlocking-triangle pattern gets a light even-odd fill via `CONTEXT_FILL_PATH` rendered at `fillOpacity={0.1}`. DFT3 / UFT4 base corners were snapped to remove two sliver fill artefacts (do not un-snap — see the korvinGeometry section).

**Viewport re-centred.** All four views use `viewBox="-30 181 560 500"`.

**C8 / C9 line treatment.** The central-triangle stroke width on C8View and C9View was matched to InnerView/GuravaView; C9's triangle colour matched the others; the ring/circle around the bindu is hidden.

**GuravaView trapezoid layout.** The 19 guru dots are laid out in the bottom half of `GURU_TRAPEZOID` in three rows (7 / 4 / 8), `DOT_R = 6`. The middle row's outer dots align under the gaps between the top row's end pairs. Row labels shrunk (fontSize 17 → 12).

**Uniform cream deity dots.** All explore-mode deity dots across the app now use `fill="#fff8c8"` (cream — matching the petal/triangle fill `rgba(255,248,200,0.92)`). The Sri Yantra overview page is untouched; memorise-mode state colours (red/gold/cream) are untouched.

**NavaChakreshvari bhupura.** The bhupura on the Nava Chakreshvarī page now renders as plain gold lines (not filled), matching the other pages — `c1-outer` / `c1-mid` were removed from `buildFills`. (The full rebuild of this page is the NEXT TASK.)

---

## Known issues / gotchas

### App.jsx truncation bug (CRITICAL — has happened twice)
The Edit tool can silently truncate App.jsx on large insertions. **Never trust the tool's success message for App.jsx.** Verify:
```bash
wc -l app/src/App.jsx      # expect ~4075 lines
tail -5 app/src/App.jsx    # should end with </aside> </div> ) }
```
Once git is set up, a bad edit reverts with `git checkout -- app/src/App.jsx`. For large App.jsx edits, prefer writing a tail file and concatenating via bash. The recovery artefact is `mnt/outputs/app_tail.jsx`.

### `guravaMemorse` typo
State variable is `guravaMemorse` (missing an 'i'). Consistent throughout App.jsx, so it works. Fix it (rename to `guravaMemorise`) only once git is in place so it is a safe, revertable edit.

---

## Environment constraints (read before working)

**Git cannot run in the Cowork sandbox.** The workspace folder is OneDrive-synced; the sandbox mount disallows the unlink/atomic-rename operations git needs (it produced a corrupted, all-zero `.git/config`). **Git must be run by Chris in a Windows terminal.** It is **not yet set up.** Chris to run, from the workspace root:
```
rmdir /s /q .git
git init
git add -A
git commit -m "Initial commit: Sri Yantra Memoriser working state"
```
If git asks who you are: `git config --global user.name "Chris Hughes"` and `git config --global user.email "chris.hughes@pts.com.au"`, then re-commit. A `.gitignore` already exists at the workspace root.

**The sandbox mount serves stale/corrupted content** after host-side edits — `node` evals on workspace files fail intermittently. **Verify code with host-side Read/Grep, not sandbox `node`.**

**npm build / esbuild cannot run in the sandbox** — the Windows-built `node_modules` lacks Linux binaries and a fresh install times out. **Chris runs `npm run build` and `npm run dev` on Windows.**

**Diagnostic rendering that does work in the sandbox:** generate an SVG, convert to PNG with ImageMagick (`convert`), write to the outputs mount, then Read the PNG.

---

## Suggested next work items

**High priority:**
- **Finish git setup** — Chris to run the Windows commands in the Environment constraints section. Do this before large App.jsx edits.
- **Live browser walkthrough** — `npm run dev`, run the full memorise chain nyasa → … → chakreshvari → closing. Confirm: NavaChakreshvari hover highlights, tooltip appears, memorise drills correctly, bindu stays black, idle hint reads correctly.
- **`npm run build`** — clean compile check after today's changes.

**Medium:**
- Fix the `guravaMemorse` typo (once git is in place).
- Cumulative session-stats panel on the yantra overview tab.
- PWA manifest + service worker (Phase 2 per CLAUDE.md).
- Devanagari audit — some closing/chakreshvari entries may lack devanagari values.

**Low / stretch:**
- Lineage editing (IndexedDB overlay + JSON export/import).
- Audio mode.
- Line Drill mode (cross-circuit geometric lines).

---

## Data schema (brief)

```json
{
  "id": "c5-sarvavighnanivaarini",
  "sectionId": "circuit-5",
  "circuitNumber": 5,
  "sequenceInSection": 8,
  "sequenceInChant": 112,
  "group": "kulottirnaYogini",
  "scripts": { "iast": "...", "devanagari": "...", "english": "..." }
}
```
`sectionId` values: `nyasa`, `nitya`, `guru-divya`, `guru-siddha`, `guru-manava`, `circuit-1`…`circuit-9`, `chakreshvari`, `closing`.

Nava Chakreshvarī forms are `sectionId: 'chakreshvari'`, sorted by `sequenceInSection` 1→9, keyed to circuits via `circuitNumber`.

---

## File paths (Windows)

```
Workspace:  C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\
App root:   [workspace]\app\
Main file:  [workspace]\app\src\App.jsx
Geometry:   [workspace]\app\src\korvinGeometry.js
Components: [workspace]\app\src\components\
Data:       [workspace]\app\src\data\khadgamala-canonical.json
```

## Session startup checklist

1. Read `CLAUDE.md` (project brief) and this `HANDOFF.md`.
2. Confirm git status with Chris — if set up, work normally; if not, avoid large App.jsx edits.
3. Start the NavaChakreshvariView rebuild (spec at the top of this file).
4. Keep the session scoped to a 1–4 hour window.
