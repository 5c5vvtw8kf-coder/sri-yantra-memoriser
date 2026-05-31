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

Last commit: 05dc696 — Nav collapsing, SCRIPT label, memo result persistence (localStorage)

THE NEXT TASK — Memo Map View:
Build MemoMapView.jsx — a full table of all ~160 deities in chant order
showing memorisation status. FULL SPEC including result key mappings, section
labels, props structure, and wiring instructions is in HANDOFF.md — read it first.

Summary:
- Table columns: # (chant sequence), Name (IAST), Section, Status (✓ / —)
- Covers full stotra: Nyāsa → Tithi Nitya → Guravah → Bhūpura → C2–C9 → Chakreshvarī → Closing
- Filter by section and by status
- Reads from allResults prop (14 result objects passed from App.jsx)
- Persistence is already wired: localStorage sync added last session

What's working:
- Full memorise chain across all sections, with Explore and Memorise modes
- Deity list in right panel for all sections (Explore mode), with dot/triangle highlights
- Circuit fills red on hover in Navacakresvari list and Closing list
- Nav section collapsing (EXPLORE AND MEMORISE, SPOT CHECK AND MEMO MAP, REFERENCES)
- Memo results persist across refresh via localStorage
- All hint text standardised to text-xs text-muted italic style

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
