# Sri Yantra Memoriser — Session Handoff

**Date:** 30 May 2026
**Branch:** master

---

## What Was Completed This Session

### 1. Memo Mode Hint Styling — All Views
Standardised the hint text below the diagram to `mt-3 text-center text-xs text-muted italic` across all circuit and section views (Nyāsa, Tithi Nitya, Guravah, Bhupura, C2–C9, Closing). Removed all inline `style={{ fontSize: '10px' }}` wrappers.

### 2. Deity List in Right Panel — All Explore Pages
Added a collapsible "Deity list" toggle (default open) to the right panel for every Explore page from Nyāsāṅga through Śrīdevī Viśēṣaṇāni:
- Hover a list item → corresponding dot/petal/triangle highlights red on the yantra
- For Bhupura: grouped by Siddhi Shaktis / Ashta Matrikas / Mudra Shaktis; Plain/Colours dot toggle
- For Guravah: grouped by Divyaugha / Siddhaugha / Mānavaugha with subheadings
- For Tithi Nitya: Waxing ☽ / Waning ☾ toggle (reverses 1–15; Mahā Nityē always last); also in Memo mode
- For Circuit 9: single deity shown as "Deity" (no toggle)
- For Chakreshvari: 9 Tripurā forms; hover highlights the whole circuit red on the full yantra
- For Closing: hover any item → entire yantra fills red, bindu dark red (`#5a0f0f`)

### 3. CircuitRows — Chakra Svāminī / Yoginī / Chakreshvarī Hover
All circuit right panels (C1–C9) have `CircuitRows` below the deity list. Hovering any row fills the whole circuit red on the yantra:
- C1 Bhupura: `c1-outer` + `c1-mid` bands fill red (with overlay masks for colour matching)
- C2–C7: petal/triangle overlay polygons with dark-red stroke cover gold lines
- C8: fills `tri-c8-01` (small primary triangle) via `buildFills`; C7 inner triangles correctly cutout
- C9: bindu dot turns red; gold triangle removed from C9 view permanently

### 4. Bhupura (Circuit 1) Memo Mode
- Group filter: All / Siddhi Shaktis / Ashta Matrikas / Mudra Shaktis (2×2 grid)
- Switching group resets drill progress; progress bar adjusts total accordingly
- Future dots hidden; counter above active dot removed

### 5. Tithi Nitya Memo Mode
- Waxing/Waning toggle in both Explore and Memo right panels
- In Memo mode, switches drill order (Citrā first for Waning); resets on toggle
- Future dots hidden; counter removed

### 6. C8 View
- Triangle always has solid gold fill with permanent black bindu dot
- Future dots hidden in Memo mode
- `fillAll` prop → triangle fills red on Chakreshvari row hover

### 7. Navacakresvari — Deity List Hover → Circuit Fills Red
- `listHighlightCircuit` prop (1–9) turns the corresponding circuit red via `buildFills(null, listHighlightCircuit)`
- Stroke-cover overlay SVG hides gold lines for C1–C7 (C8 excluded to avoid C7 bleed-through)
- `FILL_SEL` changed to `rgba(200,70,70,0.85)` to match overlay colour
- C1 bhupura overlay: double-layered fill + bright stroke for colour parity with other circuits
- C9 bindu turns red on Tripurambā hover

### 8. Closing View
- "Ascend to the top from here" text now shown in Explore mode (previously Memo-only)
- Right panel: removed Position / Count rows and old hint paragraph
- Deity list added (default open); hover fills entire yantra red with dark-red bindu
- Both hints reformatted to standard style

### 9. SectionInfo Improvements
- `showRows` prop added; circuit explore cases use `showRows={false}` + `<CircuitRows>` below list
- Chakra Svāminī / Yoginī / Chakreshvarī rows now appear below the deity list (C1, C2)
- `CircuitRows` accepts `onHoverFill` for all circuits

### 10. Guru Data
- Added translations and notes for all 19 gurus (Divyaugha, Siddhaugha, Mānavaugha)
- Removed two version notes ("Added per lineage correction v1.1", "Corrected from kālatāpaśamayī v1.1")
- `DeityDetail` subtitle fixed: now shows "Divyaugha Guravaḥ · N of 7" etc.
- Tithi Nitya subtitle fix: was checking wrong `sectionId` ('inner' → 'nitya')

---

## Pending — Next Session Priorities

1. **NavaChakreshvariView rebuild** — replace nine dots with whole-circuit interaction (still in NEXT-SESSION-PROMPT)
2. **Memo Map** — sequential run-through mapping memorised vs not
3. **References page** — YouTube link, āvaraṇa table, vignanam.org attribution
4. **Numbers mode retirement** — remove Numbers toggle from Yantra tab

---

## Key Files Modified This Session

| File | Change |
|------|--------|
| `app/src/App.jsx` | Deity lists, CircuitRows, rightPanel cases, states for all lists/highlights |
| `app/src/components/ClosingView.jsx` | listHighlight prop, LIST_RED_FILLS, hint styles, arrow text |
| `app/src/components/NavaChakreshvariView.jsx` | listHighlightCircuit, stroke overlays, FILL_SEL colour |
| `app/src/components/BhupuraView.jsx` | Group filter, fillAll, dynamic fills, future dots hidden |
| `app/src/components/InnerView.jsx` | Waning/Waxing drill order, future dots hidden |
| `app/src/components/C8View.jsx` | Gold fill, black bindu dot, fillAll, future dots hidden |
| `app/src/components/C9View.jsx` | Bindu size, triangle removed, hint styles |
| `app/src/components/C2View.jsx`–`C7View.jsx` | highlightId, fillAll, hint styles |
| `app/src/components/GuravaView.jsx` | highlightId, hint styles, labels in Memo |
| `app/src/components/SriYantraSVG.jsx` | Exported BHUPURA_OUTER/MAIN/INNER_PTS |
| `app/src/data/khadgamala-canonical.json` | Guru translations/notes |

---

## Git State

Run from Windows terminal:

```
cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
git add -A
git commit -m "Deity list with highlights, circuit fills, closing view, Navacakresvari hover fills"
```

---

*PTS Consulting (Australia) Pty Ltd — Sri Yantra Memoriser — internal*
