# Sri Yantra Memoriser — for the Khadgamala Stotram

## What This Is

A personal, cross-platform memorisation app to help Chris learn and internalise the structure of the Sri Yantra for chanting the Khadgamala Stotram. This is a fun weekend project — revenue potential is a secondary consideration. Enjoyment and learning come first.

**Name rationale:** The full title is *Sri Yantra Memoriser — for the Khadgamala Stotram*. The Sri Yantra leads because the interactive spatial geometry is the unique value proposition — something no existing app or PDF provides. The subtitle contextualises it for practitioners without demoting the yantra to a feature. "Khadgamala Stotram Memoriser" was considered and rejected: it sounds like a generic flashcard app, which this is not.

## Who Is Building It

Solo: Chris Hughes. Weekend-only work. No team, no deadlines, no client. The vibe is exploratory and iterative — ship something that works, then improve it.

## Target Users

Three development stages, each building on the previous:

**Stage 1 — Chris (primary user, now):**
1. **Maintenance mode:** Already has the stotra largely memorised. Needs a clean revision tool and interactive reference to keep knowledge sharp without printed sheets.
2. **Knowledge decay recovery:** A structured way to re-learn if the chant fades after a period without practice.

**Stage 2 — Western practitioners:**
People who have found the Khadgamala Stotram without a teacher or community, typically with no access to accessible learning tools. This group is motivated, will pay for a quality product, and is poorly served by existing resources (which assume Indian cultural context, Devanagari literacy, or access to a living teacher). This is the primary commercial target for Phase 1 commercialisation.

**Stage 3 — Indian practitioners globally:**
A large potential market but crowded with free content, recordings, and teachers. Commercialisation for this segment is a separate stage or project, to be considered only after Stage 2 is proven. Do not optimise for this group prematurely — it risks diluting the focus on what makes the app distinctive for Westerners.

## The Subject Matter

### Sri Yantra
The Sri Yantra (also Sri Chakra) is a sacred geometric diagram central to Shakta Tantra. It consists of nine interlocking triangles radiating from a central point (the bindu), surrounded by lotus petals, a circle, and an outer square enclosure (bhupura) with four T-shaped gates.

**The nine circuits (Avarana) from outermost to innermost:**

| # | Avarana Name | Description | Chakra Svamini | Yogini Type |
|---|------|-------------|----------------|-------------|
| 1 | Trailokya Mohana Chakra | Bhupura — outer square, 4 gates | Trailokya Mohana Chakra Svamini | Prakata Yogini |
| 2 | Sarva Aasha Paripuraka Chakra | 16-petal lotus | Sarvasha Paripuraka Chakra Svamini | Gupta Yogini |
| 3 | Sarva Sankshobhana Chakra | 8-petal lotus | Sarva Sankshobhana Chakra Svamini | Guptatara Yogini |
| 4 | Sarva Saubhagyadayaka Chakra | 14 triangles | Sarva Saubhagyadayaka Chakra Svamini | Sampradaya Yogini |
| 5 | Sarva Artha Sadhaka Chakra | 10 triangles (outer) | Sarvartha Sadhaka Chakra Svamini | Kulottirna Yogini |
| 6 | Sarva Rakshakara Chakra | 10 triangles (inner) | Sarva Rakshakara Chakra Svamini | Nigarbha Yogini |
| 7 | Sarva Rogahara Chakra | 8 triangles | Sarva Rogahara Chakra Svamini | Rahasya Yogini |
| 8 | Sarva Siddhiprada Chakra | Primary downward triangle | Sarva Siddhiprada Chakra Svamini | Ati Rahasya Yogini |
| 9 | Sarva Anandamaya Chakra | Bindu (central point) | Sarva Anandamaya Chakra Svamini | Para Para Rahasya Yogini |

The Yogini types escalate in secrecy from Prakata (manifest) toward the centre — this is pedagogically useful and should be surfaced in the app.

**Nava Chakreshvari** — the nine Tripura forms presiding over each circuit (outermost to innermost):
Tripura, Tripureshi, Tripura Sundari, Tripura Vasini, Tripura Shri, Tripura Malini, Tripura Siddhe, Tripuramba, Maha Tripura Sundari

### Khadgamala Stotra — Full Chant Structure
The stotra is not just the nine circuits. The full chant sequence, in order:

| Section | Count | Description |
|---------|-------|-------------|
| Devi Sambodhanam | 1 | Opening invocation |
| Nyasa Devatas | 6 | Limb deities: Hridaya, Shiro, Shikha, Kavacha, Netra, Astra |
| Tithi Nitya Devatas | 16 | The 16 Nitya goddesses (Kameshvari through Maha Nitye) |
| Divyaugha Gurus | 7 | Divine lineage (Parameshvara, Parameshvari, Mitreshmayi...) |
| Siddyaugha Gurus | 4 | Siddha lineage |
| Maanavaugha Gurus | 8 | Human lineage |
| Circuit 1 — Bhupura | ~30 | Siddhi Shaktis, Ashta Matrikas, Mudra Shaktis |
| Circuit 2 — 16-petal lotus | 16 | Kamakarshini and the 15 Akarshini deities |
| Circuit 3 — 8-petal lotus | 8 | Ananga Kusuma and 7 Ananga deities |
| Circuit 4 — 14 triangles | 14 | Sarva Sankshobhini and 13 Sarva... deities |
| Circuit 5 — 10 outer triangles | 10 | Sarva Siddhiprade and 9 Sarva... deities |
| Circuit 6 — 10 inner triangles | 10 | Sarvajna and 9 Sarva... deities |
| Circuit 7 — 8 triangles | 8 | Vasini and 7 Vagdevi deities |
| Circuit 8 — Primary triangle | 7 | Banini, Chapini, Pashini, Ankushini + 3 Maha deities |
| Circuit 9 — Bindu | 1 | Sri Sri Maha Bhattarike |
| Nava Chakreshvari | 9 | One Tripura form per circuit |
| Closing epithets | ~9 | Maha Maheshvari, Maha Maharajni... + Namaskara |

**Chanting sequence:** Outermost to innermost, ending at the bindu. Each name followed by "namaha."

### Lineage Variance
Different guru paramparas (transmission lineages) have minor variations in which names are included or excluded, and in spelling conventions. This is normal and expected — the stotra has been transmitted orally across centuries. The app must not treat any single version as definitively "correct." Users must be able to edit names to match their own lineage.

## App Concept

### Core Learning Objective
The ultimate goal is to chant the full Khadgamala Stotra in sequence from memory. However, the most effective path to that goal is **not** rote sequential drilling — it is building genuine spatial knowledge of where every deity lives within the 2D geometry of the yantra. A person who truly knows the yantra can be pointed to any location and name the deity there. Sequential recall then follows naturally.

This distinction shapes the entire app design. The app is primarily a **spatial memory tool**, not a sequential chant trainer.

### The "Line" Concept — Cross-Circuit Spatial Groupings
The inner triangular circuits (4–8) create a complex interlocking geometry. Physical lines drawn through the yantra cross multiple circuit boundaries, passing near specific deity positions. Practising along these lines — rather than circuit-by-circuit — builds faster, more flexible recall.

**Example horizontal line (left to right) across circuits 4–7:**
Sarvārthasādhikē (C4) → Sarvavighnanivāriṇī (C5) → Sarvapāpaharē (C6) → Jayinī (C7) → Vimalē (C7) → Sarvavyādhivināśinī (C6) → Sarvamaṅgalakāriṇī (C5) → Sarvasammōhinī (C4)

**Example vertical line (bottom to top) across circuits 4–7:**
Sarvasaṅkṣōbhiṇī (C4) → Sarvasiddhipradē (C5) → Sarvajñē (C6) → Vaśinī (C7) → Aruṇē (C7) → Sarvādhārasvarūpē (C6) → Sarvaduḥkhavimōchanī (C5) → Sarvavaśaṅkarī (C4)

These groupings reflect real geometric alignments in the yantra — they are not arbitrary. The app should support both pre-defined lines and random spot-check queries.

### Primary Learning Modes (to be built incrementally)
1. **Visual Explorer** — Interactive Sri Yantra diagram; tap/click any circuit or deity position to reveal its name, circuit, and classification
2. **Spot Check** — A random deity position lights up on the yantra; user names the deity (or selects from options)
3. **Line Drill** — User selects a geometric line across the yantra and recites all deities along it in order
4. **Circuit Quiz** — Shown a circuit label or deity name, identify which circuit or section it belongs to
5. **Sequence Drill** — Fill in the blanks of the full chant in order; progressive reveal
6. **Audio Mode** — Play audio of the chant with visual highlighting of the active position (stretch goal)

### Platform Targets
- **Phase 1 (MVP):** Web app — works on PC, Mac, and mobile browser without install friction. This is the target until the core learning modes are working well.
- **Phase 2:** PWA (Progressive Web App) — add a service worker and manifest for offline use and home screen install on iOS/Android. Minimal extra work once the web app is solid.
- **Phase 3 (stretch):** Native mobile app — only if PWA proves limiting for the use case (unlikely).

**Decision rationale:** A responsive web app already runs on every device via the browser. Convert to PWA when the core is stable; go native only if there's a compelling reason.

### Tech Stack
- **Frontend:** React with Vite
- **Styling:** Tailwind CSS
- **SVG:** Custom interactive SVG of the Sri Yantra (SVG not canvas — allows click targets per circuit)
- **State:** React state / Context
- **Data:** JSON files for canonical stotra data (deity names, IAST transliteration, circuit metadata)
- **Local persistence:** IndexedDB (via a thin wrapper) for user lineage edits — more robust than localStorage for structured data
- **Hosting:** Vercel or Netlify (free tier)
- No database. No auth. No server backend.

### Data Architecture

**Two-layer data model:**
1. **Canonical dataset** — shipped with the app, based on IAST transliteration from the Vignanam source (vignanam.org). Read-only. Always restorable.
2. **User overlay** — stored in IndexedDB. Contains only the fields the user has changed. Merged with canonical data at runtime.

**Lineage editing (MVP approach — Option A):**
- Any name in the app can be tapped/clicked to enter edit mode
- Edited names save immediately to the user overlay in IndexedDB
- A "reset to default" option restores the canonical value for any edited field
- The user can **export** their full custom dataset as a JSON file
- The user can **import** a JSON lineage file (for sharing between community members)

**Why this matters:** Lineage files become portable and shareable. A community using a specific guru's transmission can share a single JSON file rather than everyone re-editing from scratch.

### Multi-language Support
The app should support Sanskrit names in multiple scripts. IAST is the primary internal format (it is ASCII-safe, unambiguous, and the standard used by Vignanam and academic sources). Rendering in other scripts is a display layer concern.

**Scripts supported by Vignanam (reference for future scope):**
Devanagari, Telugu, Tamil, Kannada, Malayalam, Gujarati, Odia, Bengali, Marathi, Assamese, Punjabi, Hindi, Konkani, Nepali, Sinhala, Grantha

**MVP approach:** IAST romanisation plus Devanagari. Other scripts can be added later — the data model should accommodate them without structural changes (i.e., each name entry has a `scripts` object with keys per script).

**Do not assume users can read Devanagari.** IAST romanisation is the fallback for all users.

### Design Principles
- Mobile-first: most chanting practice happens away from a desk
- Clean, respectful aesthetic — this is sacred geometry; avoid gamification clichés
- Spaced repetition and progressive reveal are appropriate; streaks and confetti are not
- Fast to load, works offline once cached (Phase 2)
- Sanskrit names in both IAST and Devanagari as minimum

### UI/UX Standards

#### Colour System

These constants are the source of truth. Use them consistently across all circuit view components.

| Constant | Hex | Usage |
|----------|-----|-------|
| `GOLD` | `#c9a84c` | Yantra structural colour; Explore: past-visited elements |
| `CREAM` | `#fff8c8` | Current focus — the active element in both modes |
| `RED` | `#c0392b` | Memorise only: correctly memorised |
| `TERRACOTTA` | `#8b4513` | Memorise only: answered wrong (not memorised) |
| `DIM_GOLD` | `rgba(201,168,76,0.35)` | Not yet reached — fades into background in both modes |

**Explore mode states:**

| Element state | Colour |
|---|---|
| Not yet visited | `DIM_GOLD` (low opacity) |
| Current focus / selected | `CREAM` |
| Past visited / revealed | `GOLD` (full opacity) |

**Memorise mode states:**

| Element state | Colour |
|---|---|
| Not yet reached | `DIM_GOLD` |
| Current focus (active) | `CREAM` |
| Answered correct | `RED` |
| Answered wrong | `TERRACOTTA` |

The yantra's structural SVG lines/outlines remain gold at their existing low opacities — these are geometry, not interactive state.

#### Mobile Interaction Standards

**Tap behaviour (all interactive elements — dots, petals, triangles, Svāminī/Yoginī buttons):**
- **Explore mode:** Single tap = reveal name in below-yantra strip (tap-to-reveal, not auto-reveal)
- **Memorise mode — active element:** Single tap = reveal name AND mark correct simultaneously. No two-step flow.
- **Memorise mode — active element:** Double-tap (within 300ms) = mark wrong
- **Memorise mode — past element:** Single tap = no action; double-tap = toggle result

**Name reveal:**
- Name is always shown in a below-yantra HTML strip, not as an SVG tooltip
- SVG tooltips are desktop-only (hover state)
- Strip shows "tap to reveal" until tapped; never auto-reveals
- Strip is `md:hidden` — invisible on desktop, which uses the right-panel MemoriseInfo

**Desktop interaction (unchanged):**
- Single click = correct
- Double click = wrong

#### Sequence Indicators and Direction Labels

Arrows (green, red, gold) are being phased out. Replace with:
- **Sequence order:** Numbered labels on the dots/petals/triangles themselves, or rely on the focus highlighting + planned auto-animation
- **Direction (clockwise/anti-clockwise):** Small text badge adjacent to the diagram, e.g. "↺ anti-clockwise" / "↻ clockwise"
- **Row direction (Guruvah):** Numbered sequence on nodes; no directional arrow needed

Do not introduce new arrow-based navigation. The planned auto-animation feature (Explore mode) will make sequence direction self-evident once built.

## Data Schema

**Per deity/name entry:**
```json
{
  "id": "c5-sarvavighnanivaarini",
  "section": "circuit",
  "circuitNumber": 5,
  "sequenceInSection": 8,
  "sequenceInChant": 112,
  "group": "kulottirnaYogini",
  "position": {
    "x": -0.42,
    "y": 0.18,
    "angleDeg": 156
  },
  "scripts": {
    "iast": "sarvavighnanivāriṇī",
    "devanagari": "सर्वविघ्ननिवारिणी",
    "english": "Sarva Vighnanivarini"
  }
}
```

Notes on `position`:
- `x` and `y` are normalised coordinates in the range [-1, 1], with (0,0) at the bindu
- `angleDeg` is the angular position within the circuit (0° = top, clockwise)
- For circuits 1–3 (bhupura, lotus petals), position is derived from `angleDeg` alone
- For circuits 4–8 (triangular), `x` and `y` are needed to support geometric line queries
- Position data will be mapped from the reference SVG geometry — to be confirmed against the physical yantra

**Section-level metadata (per circuit):**
```json
{
  "circuitNumber": 5,
  "avarana": "Sarva Artha Sadhaka Chakra",
  "chakraSvamini": "Sarvartha Sadhaka Chakra Svamini",
  "yoginiType": "Kulottirna Yogini",
  "chakreshvari": "Tripura Shri",
  "description": "10 outer triangles",
  "petalCount": null,
  "triangleCount": 10
}
```

**User-defined groupings (stored in IndexedDB alongside lineage edits):**
```json
{
  "id": "user-line-horizontal-mid",
  "label": "Horizontal mid-line",
  "type": "line",
  "direction": "left-to-right",
  "createdBy": "user",
  "deityIds": [
    "c4-sarvarthasaadhike",
    "c5-sarvavighnanivaarini",
    "c6-sarvapaapahare",
    "c7-jayini",
    "c7-vimale",
    "c6-sarvavyaadhinaashini",
    "c5-sarvamangalakaarini",
    "c4-sarvasammohini"
  ]
}
```

Users can create their own lines, cross-circuit groups, or any arbitrary selection of deities and save it as a named drill set. This allows both geometric lines and thematic groupings (e.g. "all Sarva... deities", "the eight Matrikas"). User-defined groupings are stored in IndexedDB and included in the lineage export JSON.

## Project Constraints & Working Style

- **Time:** Weekend sessions only; Chris has limited focus windows — keep tasks scoped to 1–4 hour chunks
- **Scope discipline:** Features are additive. Get the core working before adding complexity.
- **Fun first:** If a session stops being enjoyable, stop. This project should feel like practice, not work.
- **Revenue:** Not the primary driver, but if the app is genuinely useful, a simple App Store release or Gumroad page is not out of the question later.

## Files in This Folder

| File | Purpose |
|------|---------|
| `Sri Yantra.jpg` | Reference image of the Sri Yantra for visual design |
| `CLAUDE.md` | This file — project brief and working context |

## Session Startup Checklist

At the start of each session, Claude should:
1. Read this CLAUDE.md to re-orient
2. Check what files exist in the workspace folder
3. Ask Chris what he wants to work on today before starting
4. Scope the session to something completable in 1–4 hours

## Open Questions

- **SVG geometry:** The Sri Yantra should be generated mathematically, not traced from an image. There is well-documented geometry for constructing it correctly, including methods using the Flower of Life as a foundation. Research resources include YouTube tutorials on geometric construction and academic sources on Sri Yantra proportions. This ensures accurate x/y coordinates for deity positions.
- **Line definitions:** How many pre-defined geometric lines will there be across the triangular circuits, and who defines them — Chris manually, or derived from the geometry? These need to be mapped before Line Drill mode can be built.
- **Devanagari from day one?** IAST-only is sufficient for MVP; Devanagari can layer in after.
- **Circuit 1 sequence:** The exact order of Siddhi Shaktis, Ashta Matrikas, and Mudra Shaktis within Circuit 1 needs to be confirmed against Chris's source (the YouTube reference recording).
- **Import/export:** Should lineage JSON export/import be in MVP or Phase 2?
- **Non-circuit sections:** Do the preamble sections (Nyasa Devatas, Nitya Devis, Guru lineages) need spatial positions in the yantra, or are they chant-sequence-only?

## Resolved Decisions

| Decision | Resolution |
|----------|------------|
| Transliteration standard | IAST (International Alphabet of Sanskrit Transliteration) |
| Platform strategy | Web app first → PWA → native only if needed |
| Lineage editing | Option A: inline editing with IndexedDB overlay + JSON export/import |
| Data source | vignanam.org Khadgamala Stotra (IAST version) as canonical baseline |
| Backend | None — no database, no auth, no server |
| App name | *Sri Yantra Memoriser — for the Khadgamala Stotram*. Sri Yantra leads; Khadgamala Stotram is the subtitle. |
| App focus | The Sri Yantra spatial geometry is the unique differentiator. Keep it central. Do not let the app drift into a generic Khadgamala flashcard tool. |
| Preamble sections (Prarthana, Dhyanam) | Include eventually for completeness, but only after the core spatial learning modes (Spot Check, Line Drill) are stable. They are text/sequence-based and require no yantra geometry work. |
| Commercialisation sequence | Stage 1: build for Chris. Stage 2: Western practitioners (primary commercial target — motivated, underserved, will pay). Stage 3: Indian practitioners globally (separate stage; do not optimise for this group prematurely). |
| Colour system | CREAM = current focus (both modes). GOLD = past visited (Explore) / structural yantra. RED = correct (Memorise only). TERRACOTTA (#8b4513) = wrong (Memorise only). DIM_GOLD = not yet reached. See UI/UX Standards section. |
| Mobile tap behaviour | Single tap = reveal + mark correct. Double-tap = mark wrong. No two-step reveal-then-mark flow. Strip is tap-to-reveal, never auto-reveals. Desktop unchanged (single click = correct, double click = wrong). |
| Sequence/direction indicators | Arrows (green/red/gold) being phased out. Replace with numbered labels and text badges. Auto-animation (planned) will handle sequence direction in Explore. |
