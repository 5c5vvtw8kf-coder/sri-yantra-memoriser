# Sri Yantra Memoriser — Session Handoff

**Date:** 2 June 2026
**Branch:** master
**Last commit:** Khadgamala Stotram page overhaul, UI polish, Devanagari content
**Live URL:** https://app-one-sigma-31.vercel.app (Vercel, Hobby plan)

---

## What Was Completed This Session

### Left sidebar
- Section headings reverted from saffron to `text-cream` (white); hover brightens to `text-white`.
- "SCRIPT" label likewise reverted to `text-cream`.
- Circuit nav items numbered 1.–9. in IAST/En; Devanagari uses १.–९.
- Nav collapse button `«`/`»` added to title block — hides nav + yantra controls, keeps script icons and title visible. "SCRIPT" label hides when collapsed; icon buttons remain.
- Script selector **removed** from sidebar entirely.
- English circuit nav labels updated: "Nth Enclosure Goddesses" (plural 1–8), "9th Enclosure Goddess" (singular).

### Spot Check
- SEGMENT and ROUND SIZE labels: 9px → 11px.
- Unfocused region fill: `BG_DIM` changed from `rgba(201,168,76,0.10)` to `rgba(138,117,96,0.35)` — warm grey, much better contrast against dark background and clearly distinct from the not-memorised gold.

### Activity Log
- Date, Time, Section, Score columns: Gentium Plus, 15px.

### Memo Map
- Section column: Gentium Plus, 15px.

### Closing View (Śrīdevī Viśeṣaṇāni)
- Hover tooltip names: 13px → 16px; IAST subtitle: 11px → 13px.

### References page
- New "Recordings" section added at top: "Khaḍgamālā Stotram authentic" by Sri Vidyalay (YouTube).
- Section order: Recordings → Canonical Text Source → Śrī Yantra Geometry → Courses.

### Sri Devi Khadgamala Stotram page — major overhaul
- Left panel: all group headings (Introduction, Preamble, Nine Āvaraṇas, Closing) removed. Flat uniform list. All items same muted light brown; gold-300 highlight on selection.
- Right panel: `max-w` constraint removed; fills available width.
- All sections now use consistent formatting: 12px muted uppercase label, gold `text-sm` boxes, 15px Gentium Plus translations indented with `pl-3`, italics removed.
- Custom render blocks added for: Prārthana, Dhyānam, Devī Sambodhanam, Nyāsa Devatās, Tithi Nitya Devatās, Divyaugha Gurus, Siddyaugha Gurus, Maanavaugha Gurus.
- CircuitMeta block (Āvaraṇa / Chakra Svāminī / Yoginī / Chakreshvarī) removed from avarana pages.
- Group labels (Siddhi Shakti, Ashta Matrikas etc.) removed from avarana pages.
- **Devanagari support**: all gold text blocks switch to Devanagari when देव script selected; IAST shown below as subtitle. Full text sourced from vignanam.org/samskritam. Devanagari is now **hardcoded** as the script for this page (global script selector removed).
- Tithi Nitya Devatās: Waxing Moon (☽) / Waning Moon (☾) toggle reverses order of first 15; Mahānityē always last.
- Section descriptions updated in `app/src/data/khadgamala-canonical.json`: circuits 1–9 now read "Devis of the Nth Avarana Chakra" (with Vagdevis on 7th, Bindu on 9th; 9th uses singular "Devi").
- Nava Chakreshvarī description: "Nine Enclosures".
- Guru section labels shortened: "Divine Gurus", "Siddha Gurus", "Human Gurus".
- "Āvaraṇa" consistently translated as "Enclosure" throughout English mode.
- "Deity List" → "Goddess List" across all 9 occurrences in App.jsx.

### Terminology
- "Āvaraṇa" = "Enclosure" (established this session as the preferred English translation).

---

## Data notes

### Deity count
The canonical dataset (Vignanam source) has **181 deity entries** across all sections. The tour step 1 text says "around 180 deity names" — do not change this back to "over 300" (which was incorrect).

### Script architecture
- Global `script` state in App.jsx still exists and drives the main explore/memorise views.
- `CircuitBrowser` (Stotram page) is **hardcoded** to `script="devanagari"` — it does not respond to global script state.
- The global script selector has been removed from the sidebar.

---

## Pending / suggested next
- Mobile layout refactor (was priority last session — still pending):
  1. Navigation — bottom tab bar or hamburger drawer on narrow screens
  2. Right panel — deity info as bottom sheet on mobile
  3. Touch events — SVG uses onMouseEnter/onMouseLeave; needs tap handling
  4. BhupuraView filter strip — hardcoded `left: 208` assumes sidebar
- Feedback from friends — iterate based on responses
- Khadgamala Stotram page: Telugu/Tamil scripts (data exists in vignanam.org)
- Lineage editing (deferred — Stage 2)
- Spot Check → Memo Map integration (deferred)
- Domain: sriyantramem.org when ready to go public

---

## Architecture notes

### Colour palette (tailwind.config.js)
- `saffron`: 400 (#e8790a), 600 (#c8600a), 700 (#a04d08) — tour step counter only (headings reverted to cream this session).
- `gold`: 300–700 — accents, active states, not-memorised fills.
- `surface`: 900–500 — backgrounds.
- `cream` (#f0e6d3), `muted` (#8a7560) — text.

### Font rules (as implemented)
- **Gentium Plus** (`iast` class): Sanskrit IAST names, nav labels, deity names in lists, translations in Stotram page.
- **Inter**: footer instructions, filter pill labels, UI buttons/controls.
- **Devanagari**: system font (no `iast` class applied).
- **Key pattern:** `script !== 'devanagari' ? 'iast' : ''` for nav items and right panel lists.

### CircuitBrowser.jsx
- Custom render blocks for 8 preamble sections (Prārthana, Dhyānam, Sambodhanam, Nyāsa, Nitya, 3× Gurus).
- `NityaSection` is a standalone component (needs `useState`) with waxing/waning toggle.
- Deity entries use `DeityEntry` component (gold box + translation sub-line).
- `SectionDetail` used for avarana + closing sections; `CircuitMeta` removed.
- Devanagari data is inline in CircuitBrowser.jsx for custom blocks; circuit deities pull from JSON.

### TourGuide.jsx
- `TOUR_KEY = 'sriYantra_tourSeen_v1'` — increment to force retrigger.
- To reset: `localStorage.removeItem('sriYantra_tourSeen_v1')` in browser console.

### File truncation pattern
- The sandbox writes files via Linux paths on an OneDrive-synced Windows folder.
- OneDrive can interrupt mid-write, truncating files.
- Fix: restore from `git show HEAD:app/src/App.jsx` and re-apply changes via Python.
- Prevention: commit frequently; verify `tail -6` after large edits.

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
