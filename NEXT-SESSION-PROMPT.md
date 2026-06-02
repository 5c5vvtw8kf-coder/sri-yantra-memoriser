# Sri Yantra Memoriser — Next Session Prompt

Paste the block between the lines below at the start of the next session.

---

Sri Yantra Memoriser — session handoff.
Project: React/Vite/Tailwind web app for memorising the Khadgamala Stotra by spatial recall of the Sri Yantra geometry. No backend, no auth.
Workspace: C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser
Start-of-session checklist:

1. Read CLAUDE.md and HANDOFF.md in the workspace root.
2. Check what files exist in the workspace folder.
3. Ask Chris what he wants to work on before starting anything.

Last commit: Typography and colour polish: saffron headings, Gentium Plus consistency, font size fixes (1bbcc89)
Live URL: https://app-one-sigma-31.vercel.app
Redeploy: cd app && npm run build && vercel --prod
Git: run from repo root (Sri Yantra Memoriser), not from app\ subfolder.

What's working:

* Full memorise chain across all sections (Explore + Memorise modes)
* Memo Map with history tracking
* Activity Log with section + date filters (includes Spot Check sessions)
* Spot Check: correct colour scheme, legend, no-stroke answered regions
* Khadgamala Stotram page: Prārthana, Dhyānam, viniyoga, phalashruti, pancha puja + translations
* References page
* Site tour: 9-step guided tour, auto-triggers on first visit, ? button to replay
* Hover fills: hovering any dot/petal/triangle in Explore mode fills it red
* Footer instruction bar: context-aware per tab, Inter font, 0.75rem
* Typography: saffron sidebar headings (11px), Gentium Plus across nav + right panel deity lists, SVG tooltips
* Base font 19px
* Deployed live on Vercel (Hobby plan)

Priority for next session — Mobile layout refactor:

The app is hard to use on mobile in its current state (Chris tested live URL on phone). Layout assumes desktop (sidebar + main + right panel simultaneously). On ~375px the yantra is too small to use.

Four things needed for minimum viable mobile:
1. Navigation — left sidebar collapses on narrow screens; replace with bottom tab bar or hamburger drawer
2. Right panel — disappears on mobile; deity info slides up as a bottom sheet (C2View's DeityPanel already works this way — extend to all other views)
3. Touch events — SVG uses onMouseEnter/onMouseLeave which don't fire on touch; tap needs to handle reveal and dismiss
4. BhupuraView filter strip — hardcoded left: 208 assumes sidebar; needs repositioning on mobile

Suggested breakpoint: 768px (Tailwind md:). The yantra SVG itself scales fine via viewBox — everything around it needs rethinking.

Other pending:

* Feedback from friends — iterate based on responses
* Khadgamala Stotram page further refinement
* Lineage editing (deferred)
* Spot Check → Memo Map integration (deferred)
* Domain: sriyantramem.org when ready to go public

Environment note: git CANNOT be run from the Cowork sandbox — this folder is OneDrive-synced. All git commands must be run by Chris in a Windows terminal from the repo root (Sri Yantra Memoriser), not the app\ subfolder.

File truncation warning: OneDrive can truncate files mid-write during sandbox sessions. Pattern: file ends with null bytes or mid-JSX. After every sed operation: strip null bytes with python3, verify tail -6 shows clean closing structure, check line count matches git. Commit frequently.

Data note: The canonical dataset has 181 deity entries (Vignanam source). Tour says "around 180" — do not revert to "over 300".

---

## Run it (Windows terminal)

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173
