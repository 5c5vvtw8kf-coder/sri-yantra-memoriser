# Sri Yantra Memoriser — Session Handoff

**Date:** 1 June 2026
**Branch:** master
**Last commit:** Corner dots, hover fills, footer instruction, tour
**Live URL:** https://app-one-sigma-31.vercel.app (Vercel, Hobby plan)

---

## What Was Completed This Session

### Site tour (TourGuide.jsx)
- **New file:** `app/src/components/TourGuide.jsx` — custom 9-step tour, zero external dependencies.
- **Auto-triggers** on first visit (1.2 s delay after load). State tracked in `localStorage` key `sriYantra_tourSeen_v1`. Clears itself correctly on `Done` or `×`.
- **Re-trigger button:** a small `?` button in the top-right corner of the sidebar header. `data-tour="tour-btn"`.
- **Tour steps** (in order):
  1. Welcome (centred modal)
  2. Sidebar navigation
  3. Śrī Yantra tab
  4. Explore & Memorise heading
  5. 1st Circuit / Bhūpura — the nine circuits
  6. Spot Check
  7. Memo Map
  8. Khadgamala Stotram full text
  9. You're all set (points at the `?` button)
- **Overlay technique:** 4-strip overlay with a rectangular hole revealing the highlighted element; gold focus ring (`outline: 2px solid rgba(201,168,76,0.85)`) around the hole.
- **Popover** positioned to the right of the highlighted element; falls back to left or centred if off-screen. Styled to match app palette (surface-800 BG, gold title, cream body).
- **CSS additions** in `index.css`: `.syt-tour-body`, `.syt-tour-red`, `.syt-tour-gold` classes for rich HTML in step bodies.
- **App.jsx changes:**
  - `import { useTour }` at top.
  - `TOUR_NAV_IDS` and `TOUR_HEADING_IDS` constants (module level).
  - `useTour({ onBeforeStart })` hook call; `onBeforeStart` forces all nav sections open so every `data-tour` element is in the DOM.
  - `{tourElement}` rendered at the top of the App return (createPortal renders to document.body regardless of position).
  - `data-tour="sidebar"` on `<aside>`.
  - `data-tour` spread on nav heading buttons (TOUR_HEADING_IDS lookup).
  - `data-tour` spread on nav item buttons (TOUR_NAV_IDS lookup).

### Previous session
- Spot Check: colour scheme, legend format, no-stroke answered regions, Activity Log integration
- Full memorise chain across all sections (Explore + Memorise modes)
- Memo Map with history tracking
- Activity Log with section + date filters
- Khadgamala Stotram page: Prārthana, Dhyānam, viniyoga, phalashruti, pancha puja + translations
- References page
- Base font 19px

---

## Pending / suggested next
- Test tour on mobile (viewport narrower than 600px — popover may need responsive tweaks)
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
- `PAD = 8, GAP = 16, POP_W = 290` — layout constants at top of file, easy to tweak.
- To add/edit/reorder steps: edit the `STEPS` array in TourGuide.jsx. Each step has `selector` (optional), `title`, and `body` (HTML allowed).
- To reset the tour during development: `localStorage.removeItem('sriYantra_tourSeen_v1')` in browser console.

### noStrokeRegions prop (SriYantraSVG)
Added `noStrokeRegions = {}` prop. Pass an object keyed by region ID to suppress gold stroke on specific petals, triangles, and C1 dots.

### Activity Log session logging
- `saveSessionLog` called from App.jsx's `onUpdateStats` handler for SpotCheck.
- Each spot check view fires `onUpdateStats` via a `done` useEffect (with `roundLoggedRef` guard).

---

## Run it (Windows terminal)

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173

Redeploy to Vercel:

    npm run build
    vercel --prod

---

*PTS Consulting (Australia) Pty Ltd — Sri Yantra Memoriser — internal*
