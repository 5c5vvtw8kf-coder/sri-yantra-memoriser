# Sri Yantra Memoriser — Handoff Notes

**Date:** 27 May 2026

---

## Next task — START HERE

**Spot Check validation** — test on the app:
1. Segment filter: selecting 1st shows sub-filter row (Outer · Middle · Inner · Whole)
2. Sub-filter correctly limits queue to Siddhi (10), Aṣṭa (8), or Mudra (10) deities
3. Round size buttons (10 · 20 · 50 · Whole) correctly slice the queue
4. Answered regions stay green/red for the rest of the round
5. Right-click on an answered region toggles it between green and red
6. Scores section (Round / Session) appears after first answer
7. Right panel skip button advances without marking

**Line Drill mode** — next major feature after Spot Check is validated.
Open question: how many pre-defined geometric lines, and who defines them (manually by Chris, or derived from SVG geometry)? Resolve before coding.

---

## What was completed this session

### Files changed
- `CLAUDE.md` — project brief updated (name, target users, resolved decisions)
- `app/src/App.jsx` — Spot Check right panel; footer labels; title subtitle
- `app/src/components/SpotCheckView.jsx` — major Spot Check overhaul (see below)
- `app/src/components/BhupuraView.jsx` — DeityPanel bottom popup removed
- `app/src/components/C8View.jsx` — DeityPanel removed; explore dot red on select
- `app/src/components/C9View.jsx` — DeityPanel removed; explore dot red on select
- `app/src/components/ClosingView.jsx` — text change: "Ascend to the top from here"
- `app/src/components/GuravaView.jsx` — DeityPanel removed; guru label italics removed; explore dot red on select
- `app/src/components/InnerView.jsx` — DeityPanel removed; explore dot red on select
- `app/src/components/NyasaView.jsx` — explore dot red on select

### Spot Check overhaul (SpotCheckView.jsx + App.jsx)

**Controls moved to right panel:**
- Segment filter buttons (All · 1st–7th) with gold highlight on active
- Sub-filter row — appears only when the active segment has sub-groups:
  - 1st āvaraṇa: Outer · Middle · Inner · Whole
  - Designed to extend to Guravah sets and other groupings later
  - Architecture: SC_FILTERS entries carry an optional `subFilters` array
- Round size buttons (10 · 20 · 50 · Whole)
- Progress bar + correct/wrong counters
- Skip button
- Scores section (Round and Session, with percentages)
- Legend: dbl-click · click · right-click

**Yantra behaviour:**
- C2–C7 focus: fills the actual petal or triangle cream (not a dot)
- C1 focus: dot (no discrete SVG region per bhupura deity)
- C8 and C9 excluded from Spot Check queue — all C8 deities share one triangle region; C9 has one bindu. Both need dedicated card-based views (future work). Same for Tithi Nitya and Guravah sections.
- When a circuit filter is active, all regions of that circuit show at gold (50% opacity); focus region stays cream; answered regions stay green/red
- Past results persist as green/red fills for the rest of the round
- Right-click any answered region to toggle correct ↔ not memorised

**Sub-filter logic (`buildQueue`):**
- Accepts `filterId` and `subFilterId`
- Filters pool by `sectionId` first, then by `groupIds` if a sub-filter is active
- Queue resets on any change to filter, subFilter, or limit

**SC_FILTERS structure (for future extension):**
```js
{
  id: 'circuit-1', label: '1st', sectionIds: ['circuit-1'],
  subFilters: [
    { id: 'c1-siddhi', label: 'Outer',  groupIds: ['siddhiShakti'] },
    { id: 'c1-ashta',  label: 'Middle', groupIds: ['ashtaMatrika'] },
    { id: 'c1-mudra',  label: 'Inner',  groupIds: ['mudraShakti'] },
    { id: 'c1-whole',  label: 'Whole',  groupIds: null },
  ],
}
```
To add sub-filters to Guravah or other sections, add a `subFilters` array to the relevant SC_FILTERS entry and match `groupIds` to the `group` field in the canonical JSON.

### CLAUDE.md updates
- **App name confirmed:** *Sri Yantra Memoriser — for the Khadgamala Stotram*
- **Target users restated** as three explicit stages: Chris → Western practitioners → Indian practitioners globally
- **Resolved decisions added:** app name rationale, app focus (Sri Yantra spatial geometry is the differentiator), preamble sections (add after core spatial modes are stable), commercialisation sequence

### Other changes
- **Footer navigation:** "Circuit N" → "Nth Āvaraṇa" across all nine circuits
- **App title subtitle:** bīja mantras replaced with *for the Khadgamala Stotram* (italic, muted)
- **SPOT CHECK heading:** bolded
- **Guravah guru row labels:** italics removed (Devanagari should never be italicised)
- **Bottom pop-up panel removed** from: BhupuraView, C8View, C9View, InnerView, GuravaView — deity detail now shows in right panel via existing `onDeitySelect` callback
- **Explore mode dot colour:** clicking a dot now turns it red in C8, C9, Nyāsa, Tithi Nitya, Guravah — consistent with C2–C7
- **ClosingView:** "Start here and move to the top" → "Ascend to the top from here"

---

## App architecture reminder
- Sidebar: `w-52` (208px) | Main: `flex-1`, centered `maxWidth: min(100%, calc(100vh - 6rem))` | Right panel: `w-64` (256px)
- All pages: yantra outer = `relative w-full` + `paddingBottom:100%`; inner = `absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60`
- `displayName(deity, script)` lives in `app/src/utils.js` — import from there, never define locally
- **SC_FILTERS** exported from SpotCheckView.jsx — import in App.jsx for right panel rendering
- **Devanagari text:** never italicised, never fake-bolded — use colour or spacing for emphasis
- **OneDrive write truncation:** never use `sed -i` or `Write` tool for large files on the OneDrive mount. Use Python `open(path,'r')` → modify in memory → `open(path,'w')` for replacements, or `cp` from `/tmp` for full rewrites. Verify with `wc -l` after every write.
- **Git:** works from Windows terminal only. OneDrive blocks git write operations from Cowork sandbox.

---

## Outstanding to-do list

### Pending feature work — Spot Check
- **C8 dedicated view** — 7 deities share one triangle; needs card-based spot check (not yantra)
- **C9 dedicated view** — 1 deity at bindu; simple but deserves its own moment
- **Tithi Nitya spot check** — 16 Nitya goddesses; sequence-based, no yantra position
- **Guravah spot check** — three lineage sets; sequence-based, no yantra position
- **Sub-filters for Guravah** — when Guravah spot check is built, add `subFilters` to its SC_FILTERS entry (Divyaugha · Siddyaugha · Maanavaugha · Whole)

### Feature work — learning modes
- **Line Drill mode** ← NEXT (needs geometric line definitions first)
- **Circuit Quiz mode**
- **Sequence Drill mode**
- **Preamble sections** (Sri Devi Prarthana, Dhyanam) — after core spatial modes are stable

### Feature work — analytics
- **Memo Map** — overlay persisted performance data on the Sri Yantra. Requires IndexedDB layer first (results currently ephemeral). See previous HANDOFF for full spec.

### Tech debt
- `guravaMemorse` typo in App.jsx → `guravaMemorise` (low priority)

### Data
- Multi-script: remaining vignanam.org scripts (research scraping approach before doing manually)

### Phase 2
- PWA manifest + service worker (offline support)

---

## Git baseline
Last commit before this session: `cefa963` — "Remove temp .restored file"
Git works from Windows terminal. Run from the project root:
```
git add -A
git commit -m "Spot Check overhaul; right panel controls; UI consistency pass"
```
