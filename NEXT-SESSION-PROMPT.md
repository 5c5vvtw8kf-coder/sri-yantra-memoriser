# Sri Yantra Memoriser — Next Session Prompt

Paste the block between the lines below at the start of the next session.

---

Sri Yantra Memoriser — session handoff.
Project: React/Vite/Tailwind web app for memorising the Khadgamala Stotra by spatial recall of the Sri Yantra geometry. No backend, no auth.
Workspace: C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser
Start-of-session checklist:

1. Read CLAUDE.md and HANDOFF.md in the workspace root.
2. Check what files exist in the workspace folder.
3. Ask Chris to walk through the app on his phone and describe what's still broken BEFORE touching any code.

Last commit: Remove junk files created by terminal paste (2517693)
Live URL: https://app-one-sigma-31.vercel.app
Redeploy: cd app && npm run build && vercel --prod
Git: run from repo root (Sri Yantra Memoriser), not from app\ subfolder.

⚠️ IMPORTANT — outstanding bugs (unresolved at end of 8 June 2026 session):
Chris reported "Still lots to fix — things I've already mentioned but still not fixed" but was too tired to re-list them. Do not assume the app is working correctly on mobile. Ask Chris to test and list issues before doing anything.

Known pending item:
* Svāminī/Yoginī — pause before popup: timing issue where the completion panel appears before expected. Needs investigation in MobileSvaminiButtons clickTimer / currentSeq advancement flow.

UI/UX standards locked in (do not revert):
* Colour system: CREAM = current focus; GOLD = past visited / structural; RED = correct (Memorise only); TERRACOTTA #8b4513 = wrong (Memorise only); DIM_GOLD = not yet reached
* Mobile tap: single tap = reveal + mark correct; double-tap (300ms) = mark wrong; no two-step flow
* Sequence indicators: no arrows; use numbered labels on dots/petals/triangles + small text badges for direction

What's working:

* Full memorise chain across all sections (Explore + Memorise modes)
* SVG tooltips auto-show in Memorise mode across all circuits (C2–C9, GuravaView)
* Mobile top bar, hamburger drawer, swipe navigation, 14-segment position bar
* Memo Map with history tracking
* Activity Log with section + date filters
* Spot Check modes
* Khadgamala Stotram page, References page, Site tour
* Deployed live on Vercel (Hobby plan)

Other pending (lower priority):

* Feedback from friends — iterate based on responses
* Khadgamala Stotram page further refinement
* Lineage editing (deferred)
* Domain: sriyantramem.org when ready to go public

Environment note: git CANNOT be run from the Cowork sandbox — this folder is OneDrive-synced. All git commands must be run by Chris in a Windows terminal from the repo root (Sri Yantra Memoriser), not the app\ subfolder.

File truncation warning: OneDrive can truncate files mid-write during sandbox sessions. Pattern: file ends with null bytes or mid-JSX. After every sed operation: strip null bytes with python3, verify tail -6 shows clean closing structure, check line count matches git. Commit frequently.

Data note: The canonical dataset has 181 deity entries (Vignanam source). Tour says "around 180" — do not revert to "over 300".

---

## Run it (Windows terminal)

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173
