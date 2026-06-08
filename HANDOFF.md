# Sri Yantra Memoriser — Session Handoff

**Date:** 8 June 2026 (updated end of day)
**Branch:** master
**Last commit:** Revert C4–C9 and GuravaView to SVG tooltips; increase top bar font size
**Live URL:** https://app-one-sigma-31.vercel.app (Vercel, Hobby plan) — **current and deployed**

---

## ⚠️ Outstanding bugs at session end (8 June 2026)

Chris reported "Still lots to fix — things I've already mentioned but still not fixed" but was too tired to re-list them. **Start next session by asking Chris to walk through the app on his phone and list what's still broken before touching any code.**

Known pending item (from mid-session feedback, not yet investigated):
- **Svāminī/Yoginī — pause before popup**: There's a timing issue where the Svāminī/Yoginī completion panel appears before the user expects it. Needs investigation — likely related to the `clickTimer`/`currentSeq` advancement flow in `MobileSvaminiButtons`.

---

## What Was Completed This Session (8 June 2026)

### UI/UX standards — captured in CLAUDE.md
New standards section added covering colour system, mobile tap behaviour, and sequence indicators:
- **Colour system**: CREAM = current focus (both modes); GOLD = past visited (Explore) / structural; RED = correct (Memorise only); TERRACOTTA `#8b4513` = wrong (Memorise only); DIM_GOLD = not yet reached
- **Mobile tap**: single tap = reveal + mark correct simultaneously; double-tap (300ms) = mark wrong; no two-step flow
- **Sequence/direction indicators**: arrows (green/red/gold) phased out; replaced with numbered labels on dots/petals/triangles and small text badges (e.g. "↺ anti-clockwise")

### Tooltip revert — C2–C9 and GuravaView Memorise mode
Previous session had added below-yantra text strips for Memorise mode. These were broken — the 280ms marking timer caused the strip to disappear before the user could read it. Reverted all circuits back to SVG tooltips:
- **C2, C3**: already done last session
- **C4–C7**: tooltip condition `!memorise && (…)` → `!flash && (…)`; `selectedId` fallback scoped to `!memorise`; strip removed
- **C8**: same changes (was `!memorise && !flash`)
- **C9**: tooltip condition extended to `(hovered || selected || (memorise && currentSeq === 1))` — auto-shows in Memorise; strip removed
- **GuravaView**: added `useEffect` to auto-set `hoveredDot` from `guruAll[currentSeq - 1]` in Memorise mode (mirrors C2–C8 pattern); tooltip condition `!memorise && !flash` → `!flash`; strip removed

### BhupuraView fixes
- `MobileSvaminiButtons` moved outside the `relative overflow-hidden` div — was being clipped by the fixed-height container
- SVG tooltip scoped to `!memorise` (suppressed in Memorise mode)
- Mobile strip (below yantra, tap-to-reveal) working

### MobileSvaminiButtons — one-tap alignment
Removed two-step tap flow (tap 1 = reveal, tap 2 = mark). Now: single tap = reveal + mark correct simultaneously, matching dot/petal/triangle behaviour.

### InnerView fixes
- Tooltip `below` prop added for positions 0–5 (right-side dots) — tooltip now appears below those dots rather than overlapping them
- Arrow direction labels swapped (were reversed): right arrow = "Anti-clockwise · waxing moon"; left arrow = "Clockwise · waning moon"

### App.jsx
- Removed duplicate section title floating above central image (was also shown in top bar)
- `pt-8` → `pt-2` on scrollable content div (more space below)
- Top bar section title font size: `text-xs` → `text-sm`

---

## What Was Completed This Session (3 June 2026 — second session)

### Memory Map — wrong-answer tracking fix
- `recordHistoryEntry(key, seq, result)` added to `app/src/utils.js`
- All 14 `handleXxxMarkResult` handlers in `App.jsx` now call `recordHistoryEntry(key, seq, 'wrong')` for wrong answers
- Previously, wrong answers were never written to history (`memo-history-*`) because state only tracked correct answers; Memory Map showed everything as "not attempted"

### Memory Map — visual fixes
- **NyasaMap tooltips**: Overlay SVG had `pointer-events-none` blocking hover. Individual circles now opt-in with `pointerEvents="all"`. Astrādevī hover shows all 4 dot tooltips simultaneously.
- **YantraCircuitMap tooltip position**: Was pinned to bottom of image. Now follows mouse cursor (tracks via `onMouseMove` on wrapper div).
- **NC/Closing ListMap**: Changed from subtle tinted rows to solid `STATUS_FILL` background with `rgba(15,8,5,0.9)` black text — matching the Svāminī/Yoginī pills.
- **renderRow wrong-answer colour**: Changed `text-muted` (brown) to `text-gold-600` in all 9 CxMemoriseInfo right-panel functions.
- **Circuit number badges removed** from NC list in Memory Map.
- **Svāminī/Yoginī pills** now read their own dedicated history entries rather than the circuit aggregate. `getSvaminiYoginiStatus(sectionId, allHistory)` uses `SVAMINI_YOGINI_SEQS` map (seqs: C1=29/30, C2=17/18, C3=9/10, C4=15/16, C5=11/12, C6=11/12, C7=9/10, C8=8/9, C9=2/3).
- **Colour unification**: Progress bar, List view key, and table status symbols all changed to green/amber/red (was red/gold/slate).
- **"overall progress" label** added above progress bar (right-aligned, mono).
- **"(last 3 attempts)" label** added to status counts in carousel.
- **Activity Log score key** added: `100%` / `≥ 75%` / `< 75%` in matching colours.

### Memory Map — Tithi Nitya seq order fix
- `nityaDeities` in `InnerView.jsx` was not sorted by `sequenceInSection`. Added `.sort((a, b) => a.sequenceInSection - b.sequenceInSection)`. Mahāvajrēśvarī (seq 6) and Vijayē (seq 12) were at wrong array positions → history was written at wrong keys → Memory Map showed them as "not attempted" rather than "not memorised". Mahā Nityē (seq 16) coincidentally matched in both modes.

### Mobile Phase 1 — responsive layout
- Root div changed to `flex-col`; 3-column content row wrapped in `flex-1 flex min-h-0 overflow-hidden`
- **Mobile top bar** (`flex md:hidden`, `h-11`): hamburger ☰ + current section name + script selector buttons
- **Sidebar drawer**: `fixed inset-y-0 left-0 z-50 transition-transform` on mobile; slides in via `mobileNavOpen` state; `md:relative md:translate-x-0` restores desktop behaviour
- **Mobile drawer backdrop**: `fixed inset-0 z-40 bg-black/60 md:hidden` — tap to close
- **Right panel**: `hidden md:flex` — hidden on mobile
- **`viewport-fit=cover`** added to `index.html` meta viewport
- **Safe-area padding** on footer nav: `paddingBottom: 'max(6px, env(safe-area-inset-bottom))'`
- **Mobile Explore/Memorise bar**: `mobileCtrl` lookup maps all 14 explore/memorise tabs to their handlers; rendered as two-button bar (`flex md:hidden`) above the footer nav
- **Swipe navigation**: `handleSwipeStart`/`handleSwipeEnd` on `<main>`; only fires within the 14 `EXPLORE_TAB_IDS`; threshold ≥ 60px horizontally with `|dx| > |dy|`
- **14-segment position bar**: `EXPLORE_NAV_TABS` (module-level, distinct from the existing component-level `EXPLORE_TABS = new Set(...)`) — renders 14 tappable `h-2` rounded segments; active tab gold, others `bg-surface-600`

### Tooltip size increase
- All explore/memorise view `Tooltip` components updated: fontSize `17/18/19` → `24/25/26`; rect height `34/36/38` → `48/50/52`; charW `10.5/11.5/14` → `13.5/14.5/18` (and Telugu/Tamil proportionally)
- Applied via Python script across 19 component files
- **InnerView.jsx** was found to have a pre-existing truncation (missing 4 closing lines). Fixed by appending `</div></div>)}`

---

## Architecture notes (updated)

### Name collision warning
`EXPLORE_TABS` is used as a `Set` inside the App component function (for footer hint logic). The module-level navigation array of the 14 stotra sections is named **`EXPLORE_NAV_TABS`** to avoid shadowing. Do not rename.

### File truncation pattern (reminder)
The sandbox writes files via Linux paths on an OneDrive-synced Windows folder. Python bulk writes can truncate files mid-write. Fix: restore with `git checkout HEAD -- <file>` from Windows terminal, then use the Edit tool for targeted changes. Prevention: commit frequently; verify `tail -6` after any Python file write.

### Mobile layout structure
```
<div h-screen flex-col>
  {tourElement}          ← portal, no layout impact
  {backdrop}             ← fixed overlay, md:hidden
  <div mobile-top-bar>   ← h-11, md:hidden
  <div flex-1 flex>      ← 3-column row
    <aside sidebar>      ← fixed on mobile (drawer), relative on desktop
    <main>               ← flex-1, swipe handlers
      scrollable content
      mobile control bar ← md:hidden
      segment bar        ← md:hidden, 14 segments
      footer nav         ← safe-area padding
    </main>
    <aside right-panel>  ← hidden md:flex
  </div>
</div>
```

### Colour palette (memory map status — now unified)
- **Memorised**: `rgba(74,222,128,0.85)` = `bg-green-400`
- **Partial**: `rgba(251,191,36,0.85)` = `bg-amber-400`
- **Not memorised**: `rgba(248,113,113,0.85)` = `bg-red-400`
- **Not attempted**: `rgba(201,168,76,0.07)` = barely visible gold

---

## Pending / suggested next

### Mobile (Phase 2)
- **Touch tooltips**: First-touch on iOS Safari fires `mouseenter` briefly then fires `mouseleave` immediately — tooltip flashes and disappears. User is evaluating whether larger tooltips (now deployed) fix this sufficiently, or whether a different approach is needed.
- **Proposed name-box approach** (if tooltips don't work): Persistent text box above each diagram showing the last-touched deity name. Mobile-only. Discussed but not yet built.
- **Sequential guided explore mode** (mobile-only, discussed): One cream dot visible at a time; tap → turns red → name revealed in name box → next dot appears. Replaces simultaneous dot display in explore mode. Significant rework — separate session.
- **Chakrasvamini/Yogini reveal buttons** on avarana pages (mobile): buttons below Sri Yantra to reveal in name box on tap.
- **Zoom in** on triangle pages: Tithi Nitya, Guravaḥ, C8, C9 — adjust SVG viewBox to fill more of the screen.
- **Right panel** as bottom sheet on mobile (Phase 2).
- **BhupuraView filter strip**: still uses hardcoded `left: 208` — apply `sidebarRight` DOM-measurement pattern when mobile refactor continues.
- **Portrait-only enforcement**: considered for initial mobile release; not yet implemented.

### Commercialisation (deferred)
- Complete mobile refactor before charging
- Domain: sriyantramem.org when ready to go public
- Payment: Gumroad/LemonSqueezy one-time purchase (~USD $15–25), no auth required initially
- vignanam.org content licensing: check terms before public launch
- Register domain before announcing publicly

### Data / content
- Khadgamala Stotram page: Telugu/Tamil scripts (data exists in vignanam.org)
- Lineage editing (deferred — Stage 2)
- Feedback from friends — iterate based on responses

---

## Run it (Windows terminal)

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173

Redeploy to Vercel:

    npm run build
    vercel --prod

Git (run from the repo root, not the app subfolder):

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
    git add -A
    git commit -m "message"

---

*PTS Consulting (Australia) Pty Ltd — Sri Yantra Memoriser — internal*
