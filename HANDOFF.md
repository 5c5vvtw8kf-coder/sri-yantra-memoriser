# Sri Yantra Memoriser — Handoff Notes

**Date:** 27 May 2026

---

## Next task — START HERE
**Line Drill mode** — needs geometric line definitions before building.
Open question: how many pre-defined lines, and who defines them (manually by Chris, or derived from SVG geometry)? Resolve this before coding.

---

## What was completed this session

### Files changed
- `app/src/App.jsx` — SpotCheckView import + tab + render + right panel; null bytes cleaned
- `app/src/components/SpotCheckView.jsx` ← NEW — Spot Check mode
- `app/src/data/khadgamala-canonical.json` — restored from git (was truncated mid-circuit-5); all 181 deities, all scripts intact

### Changes summary
- **JSON repair:** khadgamala-canonical.json was truncated at circuit-5 (144 of 181 deities). Restored from git commit `636da68` using `git show 636da68:... > file`. No data lost.
- **App.jsx null bytes:** 203 null bytes removed from App.jsx before editing this session.
- **Spot Check mode:** New tab "spot check" added to sidebar. Self-contained flashcard drill across all 181 deities (or filtered subset). Hover-to-reveal interaction, click=not memorised, dbl-click=memorised, skip button. Filter bar: All · Preamble · C1–C9 · Nava C. · Closing. Session stats wired up. Right panel shows control reference card.

### Previous session (for context)
- **Right panel colour fix:** Chakra Svāminī and Yoginī values now `text-gold-500` (matching Chakreshvarī). Deities count and Secrecy values now `text-muted`.
- **Multi-script support:** Telugu and Tamil added to all deity entries. Script selector: IAST · देव · తె · த · En.
- **shared displayName:** Extracted to `app/src/utils.js`. All components import from there.

### Known gotcha — null bytes on deletion
When the Edit tool replaces content with an empty string on OneDrive-mounted files, it can leave null bytes. After any such deletion, run:
```python
python3 -c "
path = 'app/src/components/FILENAME.jsx'
with open(path,'rb') as f: c=f.read()
open(path,'wb').write(c.replace(b'\x00',b''))"
```

### Known gotcha — JSON truncation
`khadgamala-canonical.json` was truncated once when a Node script wrote to it. If it happens again, restore with:
```bash
# From Windows terminal, project root:
git show 636da68:app/src/data/khadgamala-canonical.json > app/src/data/khadgamala-canonical.json
```
(Or use the latest commit that has the complete file.)

---

## App architecture reminder
- Sidebar: `w-52` (208px) | Main: `flex-1`, centered `maxWidth: min(100%, calc(100vh - 6rem))` | Right panel: `w-64` (256px)
- Scrollable area: `flex-1 flex flex-col items-center justify-start overflow-y-auto pt-8`
- All pages: yantra outer = `relative w-full` + `paddingBottom:100%`; inner = `absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60`
- `displayName(deity, script)` lives in `app/src/utils.js` — import from there, never define locally
- SpotCheckView is fully self-contained — no lifted state in App.jsx, no bottom-panel controls needed

---

## Outstanding to-do list

### Tech debt
- `guravaMemorse` typo in App.jsx → `guravaMemorise` (low priority)

### Feature work — learning modes
- **Line Drill mode** ← NEXT (needs geometric line definitions first — resolve the open question)
- **Circuit Quiz mode**
- **Sequence Drill mode**

### Feature work — analytics
- **Memo Map** — overlay performance data on the Sri Yantra diagram and/or circuit views. Colour-code each deity position: green = consistently memorised, amber = sometimes correct, red = not yet memorised. Draws from both Memo mode and Spot Check results.
  - **Prerequisite:** results are currently ephemeral session state — they are lost on tab change / refresh. Memo Map requires persisted results (per deity, across sessions). Build a thin IndexedDB layer first (already specified in the architecture as the user-overlay store). Store `{ deityId, attempts, correct }` records and merge with canonical data at runtime.
  - Once persisted, the map itself is a visual layer on SriYantraSVG (for circuits 2–9 with position data) + a grid/list view for sections without SVG positions (nyasa, nitya, gurus, closing).
  - Consider: decay over time (older results count less) vs. simple cumulative — decide before implementing.

### Data
- Multi-script: remaining vignanam.org scripts (research scraping approach before doing manually)

### Phase 2
- PWA manifest + service worker (offline support)

---

## Git baseline
Last commit: `f2fa9c7` — "Spot Check mode; restore canonical JSON from truncation"

Cleanup still needed (harmless but untidy):
```
del "app\src\data\khadgamala-canonical.json.restored"
git add -A
git commit -m "Remove temp .restored file"
```

Git works from Windows terminal. OneDrive mount blocks git write operations from the Cowork sandbox (read-only git commands like `git log` work fine from sandbox).
