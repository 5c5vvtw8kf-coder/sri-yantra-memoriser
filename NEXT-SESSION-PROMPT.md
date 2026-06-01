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

Last commit: b2e10df — MemoMapView, ActivityLogView, App wiring updates

What's working:
- Full memorise chain across all sections, with Explore and Memorise modes
- Deity list in right panel for all sections (Explore mode), with dot/triangle highlights
- Circuit fills red on hover in Navacakresvari list and Closing list
- Nav section collapsing (EXPLORE AND MEMORISE, SPOT CHECK AND MEMO MAP, REFERENCES)
- Memo results persist across refresh via localStorage
- Memo Map with progress tracking (history bug fixed — accumulates correctly going forward)
- Activity Log with section + date filters
- C8/C9 completion overlay now fires only after all items done (deities + svamini + yogini)
- Navacakresvari Memo mode: circuit colour updates immediately on click (no hover-off needed)
- Śrīdevī Epithets text uses standard red (#f87171 / text-red-400)

Pending / suggested next:
- Spot Check results → Memo Map / Activity Log (not yet implemented; feasible, raise if wanted)
- Any other UX polish

Environment note: git CANNOT be run from the Cowork sandbox — this folder is
OneDrive-synced and the mount blocks git's file operations. All git commands
must be run by Chris in a Windows terminal.

---

## Run it (Windows terminal)

Start the Vite dev server:

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173

Useful:
- `npm run build` — catches compile errors
- git commands must be run by Chris in Windows terminal, not from Cowork sandbox
