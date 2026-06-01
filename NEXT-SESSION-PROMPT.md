# Sri Yantra Memoriser — Next Session Prompt

Paste the block between the lines below at the start of the next session.

---

Sri Yantra Memoriser — session handoff.
Project: React/Vite/Tailwind web app for memorising the Khadgamala Stotra by spatial recall of the Sri Yantra geometry. No backend, no auth.
Workspace: C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\
Start-of-session checklist:

1. Read CLAUDE.md and HANDOFF.md in the workspace root.
2. Check what files exist in the workspace folder.
3. Ask Chris what he wants to work on before starting anything.
Last commit: Spot Check instruction moved to footer bar + tour deity count corrected (around 180, not 300)
Live URL: https://app-one-sigma-31.vercel.app
Redeploy: cd app && npm run build && vercel --prod
Git: run from repo root (Sri Yantra Memoriser\), not from app\ subfolder.

What's working:

* Full memorise chain across all sections (Explore + Memorise modes)
* Memo Map with history tracking
* Activity Log with section + date filters (includes Spot Check sessions)
* Spot Check: correct colour scheme, legend, no-stroke answered regions
* Khadgamala Stotram page: Prārthana, Dhyānam, viniyoga, phalashruti, pancha puja + translations
* References page
* Site tour: 9-step guided tour, auto-triggers on first visit, ? button to replay
* Hover fills: hovering any dot/petal/triangle in Explore mode fills it red
* Footer instruction bar: context-aware per tab, replaces n/N counter; font 0.75rem
* Nava Chakreshvarī memo: two-line footer instruction
* ClosingView: ↑ arrow + "Ascent to the top from here" at 0.75rem
* BhupuraView: hovered/highlighted dot rendered on top (z-order fix)
* Base font 19px
* Deployed live on Vercel (Hobby plan)

Pending / suggested next:

* Test tour on mobile (popover may need responsive tweaks on narrow viewports)
* Feedback from friends — iterate based on responses
* Khadgamala Stotram page further refinement
* Lineage editing (deferred)
* Spot Check → Memo Map integration (deferred)
* Domain: sriyantramem.org when ready to go public

Environment note: git CANNOT be run from the Cowork sandbox — this folder is OneDrive-synced. All git commands must be run by Chris in a Windows terminal from the repo root (Sri Yantra Memoriser\), not the app\ subfolder.

File truncation warning: OneDrive can truncate files mid-write during sandbox sessions. Pattern: file ends with null bytes or mid-JSX. Fix: strip null bytes + append correct closing structure. Commit frequently to preserve working state.

Data note: The canonical dataset has 181 deity entries (Vignanam source). Tour says "around 180" — do not revert to "over 300".

---

## Run it (Windows terminal)

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173
