# Sri Yantra Memoriser — Session Handoff

**Date:** 1 June 2026
**Branch:** master
**Last commit:** ab7317b
**Live URL:** https://app-one-sigma-31.vercel.app (Vercel, Hobby plan)

---

## What Was Completed This Session

### Bug fixes
- **Memo Map history bug** — `saveMemoStorage({})` was wiping history on every round start. Fixed with `clearHistory` flag — history now accumulates correctly going forward.
- **Memo Map: Hridayadevi now #1** — sequence numbers offset by 1 to account for excluded invocation (seq 1).
- **Memo Map: removed unnumbered svamini/yogini rows** — EXTRA_ROWS and CIRCUIT_EXTRA_SEQS removed entirely. Table now shows deity rows only.
- **C8/C9 premature "Memorised" overlay** — fixed by passing `done` prop from App.jsx (waits for svamini + yogini right-panel steps).
- **C2 svamini/yogini click convention** — was reversed vs all other views. Fixed: single-click = correct (red), double-click = skip.
- **NavaChakreshvarī Memo mode** — circuits now show result colour immediately on click (no hover-off needed).
- **Closing view text red** — changed from `#c0392b` to standard `text-red-400` (`#f87171`).

### UX / nav
- **Nav dot** — red ✓ replaced with muted brown •; partial shows left-half SVG circle in gold.
- **Footer arrows** — `←` / `→` enlarged to `text-base`.
- **NC page** — legend removed; Memo mode shows "Proceed from outer Bhūpura to inner Bindu" instruction on two rows.
- **Closing arrow flash** — `↑` and "Ascend to the top from here" pulse cream for 2.8s on page open.
- **Arrow heads** — solid (opacity removed) in Nyāsa, Tithi Nitya, Guravah; shafts shortened 30%; triangles moved to line end (refX=0).

### Activity Log
- Section filter dropdown + date search text input added.

### References page (ReferencesView.jsx)
- Courses: Dr. Anya Golovkova (YS 133 Śrīvidyā) and Dr. Antonia Ruppel (SKT 101-103).
- Geometry: Zak Korvin YouTube, SriYantraResearch.com.
- Canonical text source: Vaidika Vignanam.

### Khadgamala Stotram page (formerly Circuit Browser)
- Tab renamed to "śrī devī khaḍgamālā stōtram"; moved above References in nav.
- Left panel: INTRODUCTION heading with Prārthana and Dhyānam as selectable items (section-item style); NINE ĀVARAṆAS heading (was "Nine Circuits").
- Prārthana content: verse + translation + viniyoga paragraph + translation.
- Dhyānam content: phalashruti verse + translation + dhyāna verse + translation + pañcopacāra pūjā + translation.

### Deployment
- Deployed to Vercel Hobby plan.
- **Live URL:** https://app-one-sigma-31.vercel.app
- To redeploy: `npm run build` then `vercel --prod` from the `app` folder.
- Base font size increased to 19px (was 16px default — app had been viewed at 120% zoom).

### Lineage variation research (documented, not implemented)
- Garimāsiddhe: only in Dakṣiṇāmūrti Sampradāya; not a swap for Mahimāsiddhe.
- Closing epithets: Sringeri adds mahāmahāspandē (our canonical has 8, Sringeri has 9).
- Guru Paramparā: biggest variation between lineages.
- Lineage editing deferred — feasible but non-trivial.

---

## Spot Check → Memo Map
Not implemented. SpotCheckView makes no calls to `saveMemoStorage`. Feasible to add — deferred.

---

## Run it (Windows terminal)

    cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser\app"
    npm run dev

Then open: http://localhost:5173

Redeploy to Vercel:

    npm run build
    vercel --prod

---

*PTS Consulting (Australia) Pty Ltd — Sri Yantra Memoriser — internal*
