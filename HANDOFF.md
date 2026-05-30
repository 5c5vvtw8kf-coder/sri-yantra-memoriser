# Sri Yantra Memoriser — Session Handoff

**Date:** 30 May 2026
**Branch:** master

---

## What Was Completed This Session

### 1. Nav Section Collapsing
The three section headings in the left nav (EXPLORE AND MEMORISE, SPOT CHECK AND MEMO MAP, REFERENCES) are now clickable toggles with ▾/▸ chevrons. Sri Yantra and Introduction always remain visible (they sit before the first heading). State: `openSections` in App.jsx.

### 2. SCRIPT Label Styling
The "SCRIPT" label above the script selector now matches the section heading style (`text-[10px] font-mono text-surface-500 uppercase tracking-[0.12em]`).

### 3. Memo Results Persistence — HALF DONE
All 14 memo result states now persist across refreshes via localStorage.

**Completed:**
- `utils.js`: Added `loadMemoStorage(key)` and `saveMemoStorage(key, data)` helpers
- `App.jsx`: All 14 result `useState({})` changed to `useState(() => loadMemoStorage('...'))`
- `App.jsx`: 14 `useEffect` hooks sync results back to localStorage on each change

**Keys used:** `memo-nyasa`, `memo-inner`, `memo-gurava`, `memo-bhupura`, `memo-c2` through `memo-c9`, `memo-nc`, `memo-closing`

---

## THE NEXT TASK — Memo Map View

Build `MemoMapView.jsx` and wire it into App.jsx for the `memomap` tab.

### Spec

**Table columns:** # (sequenceInChant), Name (IAST), Section, Status

**Sections covered:** Full stotra — Nyāsa → Tithi Nitya → Guravah → Bhūpura → C2–C9 → Chakreshvarī → Closing

**Status values:** ✓ Memorised (correct) / — Not yet (not in results)

**Filters:** Section dropdown (All + each section) + Status dropdown (All / Memorised / Not yet)

**Persistence:** Reads from the 14 localStorage-backed result states passed as props from App.jsx

### Result key mapping

Each deity's result key within its section:

| sectionId | store key | result key |
|-----------|-----------|------------|
| nyasa | nyasa | sequenceInSection (1–6) |
| nitya | inner | sequenceInSection (1–16) |
| guru-divya | gurava | sequenceInSection (1–7) |
| guru-siddha | gurava | 7 + sequenceInSection (8–11) |
| guru-manava | gurava | 11 + sequenceInSection (12–19) |
| circuit-1 | bhupura | sequenceInSection (1–28) |
| circuit-2 | c2 | sequenceInSection |
| circuit-3 | c3 | sequenceInSection |
| circuit-4 | c4 | sequenceInSection |
| circuit-5 | c5 | sequenceInSection |
| circuit-6 | c6 | sequenceInSection |
| circuit-7 | c7 | sequenceInSection |
| circuit-8 | c8 | sequenceInSection (1–7) |
| circuit-9 | c9 | 1 |
| chakreshvari | nc | sequenceInSection |
| closing | closing | sequenceInSection |

### Section display labels

```js
const SECTION_LABELS = {
  nyasa:        'Nyāsāṅga',
  nitya:        'Tithi Nitya',
  'guru-divya': 'Divyaugha Guravaḥ',
  'guru-siddha':'Siddhaugha Guravaḥ',
  'guru-manava':'Mānavaugha Guravaḥ',
  'circuit-1':  'Bhūpura',
  'circuit-2':  '16-petal lotus',
  'circuit-3':  '8-petal lotus',
  'circuit-4':  '14 triangles',
  'circuit-5':  '10 triangles (outer)',
  'circuit-6':  '10 triangles (inner)',
  'circuit-7':  '8 triangles',
  'circuit-8':  'Primary triangle',
  'circuit-9':  'Bindu',
  chakreshvari: 'Nava Chakreshvarī',
  closing:      'Śrīdevī Epithets',
}
```

### Props to pass from App.jsx to MemoMapView

Pass a single `allResults` object:

```js
const allResults = {
  nyasa:   nyasaResults,
  inner:   innerResults,
  gurava:  guravaResults,
  bhupura: bhupuraResults,
  c2: c2Results, c3: c3Results, c4: c4Results,
  c5: c5Results, c6: c6Results, c7: c7Results,
  c8: c8Results, c9: c9Results,
  nc:      ncResults,
  closing: closingResults,
}
```

### Wiring in App.jsx

Add import: `import MemoMapView from './components/MemoMapView'`

In the main content render (near 'memomap' tab):
```jsx
{activeTab === 'memomap' && <MemoMapView allResults={allResults} />}
```

Also add a "Clear all results" button somewhere in MemoMapView that calls:
```js
Object.keys(allResults).forEach(k => saveMemoStorage(k, {}))
// then force re-read — simplest: window.location.reload()
```

---

## Git State

```
cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
git add -A
git commit -m "Nav collapsing, SCRIPT label, memo result persistence (localStorage)"
```

---

*PTS Consulting (Australia) Pty Ltd — Sri Yantra Memoriser — internal*
