# Sri Yantra Memoriser — Next Session Prompt

Paste the block between the lines below at the start of the next session.

---

Sri Yantra Memoriser — session handoff.

Project: React/Vite/Tailwind web app for memorising the Khadgamala Stotra by
spatial recall of the Sri Yantra geometry. No backend, no auth.

Workspace: C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\

Start-of-session checklist:
1. Read CLAUDE.md and HANDOFF.md in the workspace root.
2. Run: git status  — confirm git is set up (handed to Chris; may still be pending).
3. Start the NEXT TASK below, scoped to a 1-4 hour window.

THE NEXT TASK — NavaChakreshvariView rebuild:
Replace the nine dots on the Nava Chakreshvarī page with whole-circuit
interaction, consistent with the other avarana pages. In Explore mode,
hovering any circuit (c1-c9) highlights the whole circuit and shows a
tooltip; clicking reveals that circuit's Tripura form (Tripurā, Tripureśī,
...). In Memorise mode, click/double-click any part of a circuit works
exactly like the other avaranas. The bindu (c9) stays black. Change the
idle hint from "Tap any dot to reveal the Tripura form for that circuit"
to "Hover or click from outside in towards the Bindu to reveal the
Chakresvaris in order". FULL SPEC with the recommended implementation
approach is at the top of HANDOFF.md — read it first.

What's working:
- Full memorise chain: nyasa -> inner -> gurava -> bhupura -> c2 -> c3 -> c4 ->
  c5 -> c6 -> c7 -> c8 -> c9 -> chakreshvari -> closing -> "Start from
  beginning" -> nyasa.
- Every view has an Explore mode and a Memorise mode.
- Geometry is now driven by app/src/korvinGeometry.js (single source of truth).
  InnerView, GuravaView, C8View, C9View are built on the central triangle.

Other suggested work (after the next task):
- Finish git setup (Chris, Windows). Avoid large App.jsx edits until done.
- Live browser walkthrough of the memorise chain.
- Fix the guravaMemorse typo -> guravaMemorise (only after git is set up).
- Session stats panel; PWA manifest + service worker (Phase 2).

Known gotcha — App.jsx truncation:
The Edit tool silently truncates App.jsx on large insertions. After ANY
App.jsx edit, verify:
  wc -l app/src/App.jsx     (must stay at 4075)
  tail -5 app/src/App.jsx   (must end with </aside> </div> ) })
If git is set up, recover a bad edit with: git checkout -- app/src/App.jsx

Environment note: git CANNOT be run from the Cowork sandbox — this folder is
OneDrive-synced and the mount blocks git's file operations. All git commands
must be run by Chris in a Windows terminal.

---

## Run it (Windows terminal)

Start the Vite dev server:

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open the app in a browser at:

    http://localhost:5173

Useful variations:
- `npm run dev -- --open`  — starts the server AND opens the browser automatically
- `Ctrl + C` in the terminal — stops the server
- `npm install`  — run once first if node_modules is missing, or after pulling changes
- `npm run build`  — production build; also catches compile errors

Standalone preview pages (just double-click the file in Explorer — no server needed):
korvin-construction.html, petal-preview.html, verify_triangles.html, face_picker.html
