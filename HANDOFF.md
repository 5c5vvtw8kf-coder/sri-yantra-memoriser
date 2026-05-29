# Sri Yantra Memoriser — Session Handoff

**Date:** 29 May 2026
**Branch:** master

---

## What Was Completed This Session

### 1. Sri Yantra Tab — Pure Display
The Sri Yantra tab is now a clean, uninterrupted display of the fully coloured yantra geometry. All click targets, interaction hints, right panel, and footer navigation have been removed. The intent is that the yantra draws the user in visually before they begin studying.

### 2. Welcome and Introduction Page (IntroView.jsx)
New component at `app/src/components/IntroView.jsx`. Appears as the second tab, immediately after the Sri Yantra.

Content structure:
- Opening invocation: Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ (larger gold text)
- Salutation: Namastripurasundari (IAST, larger)
- Welcome paragraph (gold-400, IAST font): "Namaskaram and welcome to the Śrī Yantra Memoriser..."
- **The Śrī Yantra** section: geometry, nine āvaraṇas or 'veils', Śrī Vidyā school
- **The Khadgamala Stotram** section: 102 circuit deities, ~160 total including Nyāsa Devatāḥ, Tithi Nitya Devatāḥ, Divyaugha/Siddaugha/Mānavaugha gurus, Nava (nine) Cakreśvarī
- **How this app works** section: spatial memory approach, feature descriptions, YouTube chanting link
- Watermark: full SriYantraSVG at opacity 0.07, 160% width centred via `left: 50%; transform: translateX(-50%)`

Design decisions:
- No em-dashes (replaced with commas throughout)
- Feature names (Explore, Memorise, Spot Check, Memo Map) in gold-400, not cream
- "most revered sacred geometric diagrams in Hinduism, especially within the Śrī Vidyā school"
- Nine circuits described as "nine circuits or 'veils' (āvaraṇas)"
- No āvaraṇa table on Intro page (will live in References)

### 3. Nav Sidebar Restructure
Section headings added:
- **EXPLORE AND MEMORISE** — between Sri Yantra and Nyāsa Devatāḥ
- **SPOT CHECK AND MEMO MAP** — before Spot Check
- **REFERENCES** — before References

`NAVIGABLE_TABS = TABS.filter(t => !t.heading)` used for all sequential nav logic so headings do not break the footer prev/next sequence.

### 4. Nav Progress Dots
Small dot to the right of each nav label:
- No dot: never started
- Gold dot: in progress
- Red dot: last round was 100% correct

### 5. New Placeholder Pages
Memo Map, References, and Circuit Browser added as "Coming soon" placeholders.

### 6. Click/Double-Click Reversal
Single click = memorised (red), double-click = not memorised (gold). Applied across all circuit views.

### 7. Colour Standardisation
Gold/red scheme standardised across all circuit views.

---

## Pending — Next Session Priorities

### High Priority
1. **Memo Map** — Sequential run-through of the full stotram mapping memorised vs. not. Needs design thinking before coding.
2. **References page** — YouTube link, āvaraṇa table, Nava Cakreśvarī details, vignanam.org attribution.

### Backlog
3. **Numbers mode retirement** — Remove Numbers toggle from Yantra tab (decided, not yet done).
4. **Circuit Browser** — Keep, repurpose, or remove?
5. **American English variant** — UI strings only (Memorizer, Memorize). Future.
6. **Preamble sections** (Prarthana, Dhyanam) — After core spatial modes are stable.

---

## Git State

A stale `.git/index.lock` is blocking commits from the sandbox. All changes are saved. To commit manually from your terminal:

```
cd "C:\Users\ChrisHughes\PTS AUS\PTS Australia - Management\Claude\Workspace\projects\Sri Yantra\Sri Yantra Memoriser"
del .git\index.lock
git add -A
git commit -m "Add IntroView, nav headings, progress dots, Sri Yantra display tab, and UX refinements"
```

---

## Key Files Modified

| File | Change |
|------|--------|
| `app/src/components/IntroView.jsx` | New — Welcome and Introduction page |
| `app/src/App.jsx` | Nav headings, progress dots, NAVIGABLE_TABS, new tab renders, Sri Yantra pure display |
| All `*View.jsx` circuit components | Click/double-click reversal, colour standardisation |
| `app/src/data/khadgamala-canonical.json` | Data updates |

---

*PTS Consulting (Australia) Pty Ltd — Sri Yantra Memoriser — internal*
