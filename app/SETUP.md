# Setup — Śrī Yantra Memoriser

## First-time setup

```bash
cd app
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Deploy to Vercel

Option A — Vercel CLI:
```bash
npm install -g vercel
cd app
vercel
```

Option B — GitHub + Vercel dashboard:
1. Push the repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Set **Root Directory** to `app`
4. Click Deploy — Vercel auto-detects Vite

## Project structure

```
app/
├── src/
│   ├── components/
│   │   ├── CircuitBrowser.jsx   — text-based section/deity browser
│   │   └── SriYantraSVG.jsx     — SVG geometry component
│   ├── data/
│   │   └── khadgamala-canonical.json   — source of truth (copy of root JSON)
│   ├── App.jsx      — tab layout + root component
│   ├── index.css    — Tailwind + custom component classes
│   └── main.jsx     — React entry point
├── index.html       — HTML shell (loads Google Fonts)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

## Notes

- The JSON in `src/data/` is a copy of the root `khadgamala-canonical.json`.
  If you update the root JSON, re-copy it here.
- Deity `position.x` and `position.y` fields are currently `null` for circuits 4–8.
  These will be populated after the SVG geometry is confirmed.
- The SVG triangle coordinates are in `SriYantraSVG.jsx` → `SHIVA` and `SHAKTI` constants.
  They can be refined without touching any other file.
