# Sri Yantra Memoriser — Session Handoff

**Date:** 1 June 2026
**Branch:** master
**Last commit:** Spot Check instruction moved to footer bar (06a96cc)
**Live URL:** https://app-one-sigma-31.vercel.app (Vercel, Hobby plan)

---

## What Was Completed This Session

### Site tour (TourGuide.jsx)
- New file `app/src/components/TourGuide.jsx` — custom 9-step guided tour, zero external dependencies.
- Auto-triggers 1.2 s after first load. Tracked in `localStorage` key `sriYantra_tourSeen_v1`.
- Re-trigger: small `?` button in top-right of sidebar header.
- Tour steps: Welcome → Navigation → Śrī Yantra → Explore & Memorise → Nine Āvaraṇas → Spot Check → Memo Map → Full Stotram → You're all set.
- Overlay cuts a rectangular hole revealing the highlighted element; gold focus ring around it.
- To reset during development: `localStorage.removeItem('sriYantra_tourSeen_v1')` in browser console.
- To add/edit steps: edit `STEPS` array in TourGuide.jsx.

### Hover fills — Explore mode
- Hovering any dot, petal, or triangle in Explore mode now fills it red (not just tooltip).
- BhupuraView: `isHovered` prop on DeityDot; hovered/highlighted dot rendered last (on top) for z-ordering.
- C2–C7: `hoveredDot` included in `filledRegions` explore calculation → fills petal/triangle red.
- C8: `isHovered` on DeityDot.
- C9: bindu fills red on hover.

### Footer instruction bar
- Removed `n/N` tab counter from footer.
- Added context-aware instruction text instead — specific per tab and mode:
  - Dot views (bhupura, nyasa, inner, gurava): "Hover or click any dot to reveal the deity"
  - Petal views (c2, c3): "Hover or click any petal to reveal the deity"
  - Triangle views (c4–c7): "Hover or click any triangle to reveal the deity"
  - c8: "Hover or click to reveal the deity"
  - c9: "Hover or click the bindu to reveal the deity"
  - chakreshvari: "Hover any circuit to reveal its Tripura form"
  - closing: "Hover a number to illuminate the Yantra · tap to reveal the epithet"
  - spotcheck: always shows memo instruction (Spot Check is always in recall mode)
- Memo mode instruction: `hover to reveal · click = memorised · dbl-click = not memorised`
- Special case: Nava Chakreshvarī memo mode shows two lines — "Proceed from the outer Bhūpura to the inner Bindu" above the standard memo instruction.
- Font size: `0.75rem` (matches footer nav label size).
- Instruction `<p>` blocks removed from all views: BhupuraView, C2–C9, NavaChakreshvariView, NyasaView, InnerView, GuravaView, ClosingView, SpotCheckView, NityaSpotCheckView, GuravahSpotCheckView, ChakreshvariSpotCheckView.

### ClosingView (Śrīdevī Epithets)
- "Ascent to the top from here" message restored next to the ↑ arrow; font increased to `0.75rem`.
- Old explore and memo instruction `<p>` blocks removed.

### BhupuraView corner dots
- Level 2 and 3 corner dots restored to original geometric positions (on their respective square lines).
- Z-ordering fix: hovered or list-highlighted dot is rendered last in SVG, so it always appears on top of neighbours regardless of overlap.

### File repairs (OneDrive sync truncations)
- Several files were truncated mid-code due to OneDrive sync interruptions during the session.
- Repaired: BhupuraView, C2View, C8View, C9View, GuravaView, InnerView, NyasaView, ClosingView, SpotCheckView, ChakreshvariSpotCheckView.
- Pattern: file ends mid-JSX → stripped null bytes → appended correct closing structure.
- **Recommendation:** After each session, run `git status` to confirm all files are fully written before closing the laptop.

---

## Data notes

### Deity count
The canonical dataset (Vignanam source) has **181 deity entries** across all sections. The tour step 1 text says "around 180 deity names" — do not change this back to "over 300" (which was incorrect). Breakdown: Circuit 1 (30), Circuit 2 (18), Nitya (16), Circuit 4 (16), Circuit 5 (12), Circuit 6 (12), Circuit 3 (10), Circuit 7 (10), Closing (10), Circuit 8 (9), Nava Chakreshvarī (9), Maanavaugha (8), Divyaugha (7), Nyāsa (6), Siddyaugha (4), Circuit 9 (3), Invocation (1).

---

## Pending / suggested next
- Test tour on mobile (popover may need responsive tweaks on narrow viewports)
- Feedback from friends — iterate based on responses
- Khadgamala Stotram page further refinement
- Lineage editing (deferred — feasible when needed for Stage 2)
- Spot Check → Memo Map integration (deferred)
- Domain: sriyantramem.org when ready to go public

---

## Architecture notes

### TourGuide.jsx
- `useTour({ onBeforeStart })` hook — call once in App, renders via `createPortal` to `document.body`.
- `TOUR_KEY = 'sriYantra_tourSeen_v1'` — increment version string to force retrigger for all users.
- `PAD = 8, GAP = 16, POP_W = 290` — layout constants at top of file.
- To reset the tour: `localStorage.removeItem('sriYantra_tourSeen_v1')` in browser console.

### Footer instruction
- Computed in App.jsx as `footerInstruction` JSX, rendered in the footer bar between prev/next buttons.
- `EXPLORE_TABS` set controls which tabs show an instruction.
- `isInMemoriseMode` boolean controls which instruction variant shows.
- `EXPLORE_HINT` object maps tab ID → explore-mode instruction string.
- Special case for `chakreshvari` memo: two-line instruction with `flex flex-col`.

### File truncation pattern
- The sandbox writes files via Linux paths on an OneDrive-synced Windows folder.
- OneDrive can interrupt mid-write, leaving files truncated with null bytes at the end.
- Fix: `raw.rstrip(b'\x00')` + append correct closing JSX.
- Prevention: commit frequently; don't close the laptop mid-session.

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
