# Sri Yantra Memoriser — Handoff Notes

**Date:** 26 May 2026

---

## Next task — START HERE
**BhupuraView (Circuit 1 / 1st Avarana) — Memorise mode:**
- Review and sign off Memorise mode now that the full 30-item sequence is working
- The right panel font standardisation was the last thing done — needs visual review before signing off

---

## What was completed this session

### Files changed
- `app/src/components/ClosingView.jsx`
- `app/src/components/BhupuraView.jsx`
- `app/src/App.jsx`

---

### ClosingView.jsx — changes

**Up arrow (both modes):**
- Added `↑` in GOLD (`#c9a84c`), `fontSize: 22px`, fixed below the number strip at `yantraPos.top + yantraPos.height + 4`
- No `width` constraint — extends naturally rightward

**"Start here and move to the top" instruction (Memo mode only):**
- Cream (`rgba(255,248,200,0.92)`), `fontSize: 10px`, sits to the right of the arrow
- Only shows when `memorise && !done`
- No full stop

**Explore-mode hover targets:**
- Added transparent `div`s at `left: 30` covering 300px width for each of the 10 rows
- These trigger `setHoveredEpithet` and `onDeitySelect` on hover/click
- Previously tooltips only fired when hovering the number itself; now fires over the hidden label area too

---

### BhupuraView.jsx — changes

**Instruction text:**
- Removed SVG `<text>` element ("double-tap = memorised · single-tap = not yet")
- Replaced with HTML `<p>` below yantra (matching other pages): *"hover to reveal · dbl-click = memorised · click = not memorised"*
- Only shows in Memorise mode when `!done`

**BHUPURA_TOTAL = 30:**
```js
const C1_TOTAL     = c1Deities.length  // 28 — dot-phase deities only
const BHUPURA_TOTAL = 30               // 28 deities + Chakra Svāminī (29) + Yoginī (30)
```
- `done` now uses `BHUPURA_TOTAL` (was `C1_TOTAL`)
- Completion overlay score/count use `BHUPURA_TOTAL`
- Dot phase, position counter, and tooltip are guarded to `currentSeq <= C1_TOTAL` (28)

**Tooltip:**
- Hover-only in both modes (an auto-show attempt was reverted — it caused the next deity's name to appear immediately on click)

---

### App.jsx — changes

**New component: `BhupuraMemoriseInfo`**
- Added before `C2MemoriseInfo`, same pattern as C2–C7
- Phases: 1–28 = dot phase (values show `···`); 29 = Chakra Svāminī active; 30 = Yoginī active; > 30 = completion
- Hover-to-reveal, single-click = wrong, double-click = correct, right-click = context menu
- "Next circuit →" navigates to C2

**Right panel wiring:**
```js
if (activeTab === 'bhupura' && bhupuraMemorise) return <BhupuraMemoriseInfo ... />
```
Inserted before the `c2` case.

**handleBhupuraMarkResult — updated:**
- `nextSeq > 28` → `> 30`
- `total + 28` → `+ 30`
- `Array.from({ length: 28 })` → `length: 30`
- Flash (all-correct) checks all 30 items

**Progress bar / last attempt / not-memorised list — updated:**
- All `28` hardcodes changed to `30`
- Not-memorised list now appends Chakra Svāminī (seq 29) and Yoginī (seq 30) if not correct

**Right panel font standardisation:**

| Component | Change |
|---|---|
| `DeityDetail` | Primary name: `text-base` → `text-sm`; secondary IAST + English: `text-sm` → `text-xs` |
| `SectionInfo` (circuits) | Removed Geometry row; moved Deities to top; added `pt-px` to all label spans |
| `SectionInfo` (closing) | `w-20` → `w-24`; added `pt-px` to label spans |
| `CircuitDetail` | Removed Geometry row |
| All data row values | Removed `iast` class (serif) from Chakra Svāminī, Yoginī, Chakreshvarī values — now all sans-serif, consistent with "28" / "Manifest" etc. |
| All `CnMemoriseInfo` + `BhupuraMemoriseInfo` | Removed `iast` from all three `renderRow` value states (`text-gold-800`, `text-red-400`, `text-muted`) — applied via `replace_all` |

---

## App architecture reminder
- Sidebar: `w-52` (208px) | Main: `flex-1`, centered `maxWidth: min(100%, calc(100vh - 6rem))` | Right panel: `w-64` (256px)
- Scrollable area: `flex-1 flex flex-col items-center justify-start overflow-y-auto pt-8`
- Fixed strips: `position:fixed; left:208px` sits in the centering margin without affecting yantra size
- All pages: yantra outer = `relative w-full` + `paddingBottom:100%`; inner = `absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60`

---

## Pending / known issues
- `guravaMemorse` typo in App.jsx → should be `guravaMemorise` (deferred, low priority)
- Build verification fails in Linux sandbox (missing `@rollup/rollup-linux-x64-gnu`) — sandbox limitation only; builds fine on user's machine
- BhupuraView Memorise mode: needs sign-off after visual review of font changes
