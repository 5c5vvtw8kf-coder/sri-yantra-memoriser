# Sri Yantra Memoriser — Next Session Prompt

Paste the block between the lines below at the start of the next session.

---

Sri Yantra Memoriser — session handoff.

Project: React/Vite/Tailwind web app for memorising the Khadgamala Stotra by
spatial recall of the Sri Yantra geometry. No backend, no auth.

Workspace: C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\

Start-of-session checklist:
1. Read CLAUDE.md and HANDOFF.md in the workspace root.
2. Check what files exist in the workspace folder.
3. Ask Chris what he wants to work on before starting anything.

Last commit: ab7317b — Base font size 19px; Khadgamala Stotram page complete; deployed to Vercel
Live URL: https://app-one-sigma-31.vercel.app
Redeploy: cd app && npm run build && vercel --prod

What's working:
- Full memorise chain across all sections (Explore + Memorise modes)
- Memo Map with history tracking (history bug fixed)
- Activity Log with section + date filters
- Khadgamala Stotram page (formerly Circuit Browser): Introduction/Prārthana/Dhyānam
  as left nav items; complete with viniyoga, phalashruti, pancha puja + translations
- References page: courses, geometry resources, text source
- Deployed live on Vercel (Hobby plan)
- Base font 19px

Pending / suggested next:
- Feedback from friends — iterate based on responses
- Khadgamala Stotram page further refinement (Chris noted this)
- Lineage editing (deferred — feasible when needed for Stage 2)
- Spot Check → Memo Map integration (deferred)
- Domain: sriyantramem.org when ready to go public

Environment note: git CANNOT be run from the Cowork sandbox — this folder is
OneDrive-synced. All git commands must be run by Chris in a Windows terminal.

---

## Run it (Windows terminal)

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173
