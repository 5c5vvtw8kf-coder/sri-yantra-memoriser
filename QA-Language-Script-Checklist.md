# QA Checklist — Language & Script Options
*Sri Yantra Memoriser — for the Khadgamala Stotram*

Last reviewed: —
Reviewed by: Chris Hughes
App version (commit): —

---

## Definitions

| Term | Definition |
|---|---|
| **View** | Desktop or Mobile |
| **Mode** | Explore or Memorise |
| **Left Panel** | Sidebar navigation on desktop; menu popout on mobile |
| **Main Section** | Central content area on both views (the yantra diagram and its immediate controls) |
| **Lower Main Section** | Area directly below the yantra image. On mobile: where Right Panel content is repositioned. On desktop: present in specific views only (e.g. Circuit 1 filter buttons). Not present in all views. |
| **Right Panel** | Info and score panel — desktop only |
| **Bottom Bar** | Fixed strip at the bottom of the screen on both desktop and mobile |
| **Language** | UI language selection — controls interface strings (labels, buttons, headings, tooltips) |
| **Script** | Script selection — controls how deity names are rendered (transliteration or Indic script) |

**Checklist convention:** items marked *[also: Lower Main Section / Mobile]* must be verified in both the Right Panel (desktop) and the Lower Main Section (mobile), as the same content appears in both locations.

---

## Known Bugs — Pending Fix

| # | View | Location | Description | Status |
|---|---|---|---|---|
| B-001 | Mobile | Bottom Bar | Bottom Bar scrolls on some pages instead of remaining fixed (e.g. Nyasa Deities vs Circuit 1). Must be fixed at the bottom of the screen consistently across all sections. | Fixed 2026-06-21 |
| B-002 | Desktop | Right Panel | Section title and subtitle (e.g. "nyāsāṅga dēvatāḥ" / "ṣaḍ-aṅga nyāsa") are hardcoded to IAST (`section.avaranaIast`) and do not respond to Script selection. Should use `sectionName()` so English script shows anglicised form. | Fixed 2026-06-21 (commit bad0693) |
| B-003 | Desktop | Right Panel | Section breadcrumb (e.g. "Nyāsāṅga · 1 of 6") is hardcoded to IAST and does not respond to Script selection. | Fixed 2026-06-21 (commit 5f2bbe5) |

---

## Content Type Allocation — LANGUAGE vs SCRIPT

Defines which picker controls each content type. Use this to guide development decisions.

| Content Type | Controlled by | Notes |
|---|---|---|
| Button labels (Explore, Memorise, Reset, Reveal, Next, etc.) | LANGUAGE | |
| Section headings in Left Panel | LANGUAGE | |
| Mode names | LANGUAGE | |
| Tooltips | LANGUAGE | |
| Score panel labels | LANGUAGE | |
| Error and feedback messages | LANGUAGE | |
| Circuit descriptions (e.g. "10 outer triangles") | LANGUAGE | |
| Tour text | LANGUAGE | |
| Deity names | SCRIPT | |
| Chakra Svamini names | SCRIPT | |
| Yogini type labels | IAST always | Section metadata has no Indic script data — always renders in IAST regardless of Script selection |
| Avarana names (e.g. "Sarva Artha Sadhaka Chakra") | IAST always | Same as above. Exception: English script renders as "1st Āvaraṇa" etc. |
| Chakreshvari names (Tripura, Tripureshi, etc.) | SCRIPT | |
| "namaha" suffix | SCRIPT | |
| Circuit numbers | Neither — fixed numerals | |

---

## How to Use

Work through each section in order. Test on **Desktop** first, then **Mobile**. Mark each item ✅ pass, ❌ fail, or ⚠️ needs attention. Add notes where relevant. Record the commit hash and date at the top when signing off a full pass.

---

## Section 1 — UI Language

Controls all interface strings. Currently only English is active.

### 1.1 English (active)

Baseline: UI Language = English, Script = IAST, Mode = Explore.

**Left Panel — Desktop**
- [ ] All section headings render (Nyasa Devatas, Tithi Nitya Devatas, Circuit 1 … Circuit 9, etc.)
- [ ] Active section highlight correct
- [ ] Globe icon tooltip reads "Language"
- [ ] Plane icon tooltip reads "Take the tour"
- [ ] Collapse button tooltip reads "Collapse Navigation" — fully visible, not clipped
- [ ] Expand button tooltip reads "Expand Navigation"
- [ ] Script picker label reads "Script"
- [ ] Script picker collapsed display is muted/discreet colour

**Left Panel — Mobile**
- [ ] Menu popout opens correctly
- [ ] All section headings render
- [ ] Language and Script controls render and function

**Main Section — Both Views, Both Modes**
- [ ] Mode toggle labels correct (Explore / Memorise)
- [ ] All interactive control labels correct

**Right Panel — Desktop** *(also: Lower Main Section / Mobile)*
- [ ] Circuit metadata labels correct (Avarana, Chakra Svamini, Yogini Type, Chakreshvari)
- [ ] Score panel labels correct (Session, Not Memorised, etc.)
- [ ] Round counter label correct

**Lower Main Section — Desktop (Circuit 1 only)**
- [ ] Filter button labels render correctly

**Bottom Bar — Both Views**
- [ ] Tap-to-reveal prompt text correct
- [ ] Fixed at bottom on Desktop ✅ / Mobile ✅

**Spot Check — Both Views**
- [ ] Question prompt text correct
- [ ] Answer option labels correct
- [ ] Result feedback text correct

**Memory Map — Both Views**
- [ ] All headings and labels render

**Activity Log — Both Views**
- [ ] Column headings render
- [ ] Entry text renders

---

### 2.7 English script — Desktop QA results (2026-06-21, Explore mode)

| Page | Location | Result | Notes |
|---|---|---|---|
| Welcome / Introduction | Left Panel | ✅ | All good |
| Welcome / Introduction | Main Section | ⚠️ | Uses IAST — expected for static intro content |
| Welcome / Introduction | Lower Main Section | N/A | |
| Welcome / Introduction | Right Panel | N/A | Vacant |
| Welcome / Introduction | Bottom Bar | ✅ | English script |
| Nyasa Deities | Left Panel | ✅ | No change from Introduction |
| Nyasa Deities | Main Section | ✅ | Tooltips in English |
| Nyasa Deities | Lower Main Section | N/A | Vacant |
| Nyasa Deities | Right Panel — section header | ✅ | "Nyasa Devatas" / "Six-Limb Nyasa" confirmed |
| Nyasa Deities | Right Panel — breadcrumb | ✅ | "Nyasa Devatas · 1 of 6" confirmed |
| Nyasa Deities | Right Panel — deity detail | ✅ | "Hridaya Devi" (English), secondary IAST "hṛdayadēvī" correct, "Heart Goddess" ✅, "Nyasa of the heart" ✅ |
| Nyasa Deities | Bottom Bar | ✅ | English |

---

### 2.8 Devanagari script — Desktop QA results (2026-06-21, Explore mode)

**Scope note:** UI strings (labels, buttons, headings) remain in English — this is expected and correct. Indian UI language (Hindi etc.) is a future task. QA here focuses on deity name rendering in Devanagari script.

| Page | Location | Result | Notes |
|---|---|---|---|
| Welcome / Introduction | Left Panel | ✅ | English UI — correct |
| Welcome / Introduction | Main Section | ✅ | Fine |
| Welcome / Introduction | Lower Main Section | N/A | |
| Welcome / Introduction | Right Panel | N/A | Vacant |
| Welcome / Introduction | Bottom Bar | ✅ | OK for now |

---

### 1.2 Hindi — हिन्दी (not yet built)
- [ ] Option visible but greyed out in Language picker
- [ ] Selecting it has no effect — stays on English

### 1.3 Telugu — తెలుగు (not yet built)
- [ ] Option visible but greyed out
- [ ] Selecting it has no effect

### 1.4 Tamil — தமிழ் (not yet built)
- [ ] Option visible but greyed out
- [ ] Selecting it has no effect

### 1.5 Kannada — ಕನ್ನಡ (not yet built)
- [ ] Option visible but greyed out
- [ ] Selecting it has no effect

### 1.6 Malayalam — മലയാളം (not yet built)
- [ ] Option visible but greyed out
- [ ] Selecting it has no effect

---

## Section 2 — Script

Controls deity name rendering only. UI Language stays English throughout. Test each script across all active views.

### Common checks for every script option

For each script, verify the following across Main Section, Right Panel (desktop), Lower Main Section (mobile), Bottom Bar, and Spot Check:

| Check | What to look for |
|---|---|
| **Renders** | No missing glyphs, empty boxes, or fallback squares |
| **Font** | Correct font applied (IAST uses Gentium Plus; Indic scripts use configured serif) |
| **No overflow** | Names don't push layout or overflow containers |
| **No truncation** | Long names not clipped mid-character |
| **Consistent** | Same name rendered identically in every location it appears |

---

### 2.1 IAST (default)

Romanised Sanskrit with diacritics: ā, ī, ū, ṇ, ṭ, ś, ṣ, ṃ, ḥ, etc.

**Desktop**
- [ ] Main Section: diacritics render correctly in circuit diagram
- [ ] Right Panel: diacritics render in name display and metadata
- [ ] Lower Main Section: diacritics render in Circuit 1 filter area
- [ ] Bottom Bar: IAST name renders when revealed
- [ ] Spot Check: all answer options render in IAST with diacritics
- [ ] Memory Map: names render in IAST
- [ ] Activity Log: names render in IAST
- [ ] Long names don't overflow (e.g. *sarvavighnanivāriṇī*, *kāmākarṣiṇī*)

**Mobile**
- [ ] Main Section: diacritics render at yantra scale
- [ ] Lower Main Section: diacritics render below yantra
- [ ] Bottom Bar: IAST name renders when revealed (fixed position ✅)
- [ ] Spot Check: answer options render in IAST
- [ ] Left Panel (menu): section labels in IAST where applicable

**Notes:**

---

### 2.2 Devanagari — देवनागरी

**Desktop**
- [ ] Main Section: all names in Devanagari, no IAST fallback
- [ ] Right Panel: Devanagari renders in name and metadata panels
- [ ] Bottom Bar: Devanagari name renders when revealed
- [ ] Spot Check: all answer options in Devanagari
- [ ] Conjunct consonants render correctly (क्ष, त्र, ज्ञ, etc.)
- [ ] No overflow from wider Devanagari glyphs

**Mobile**
- [ ] Main Section: Devanagari legible at yantra scale
- [ ] Lower Main Section: Devanagari renders below yantra
- [ ] Bottom Bar: Devanagari renders (fixed position ✅)
- [ ] Spot Check: all options in Devanagari

**Notes:**

---

### 2.3 Telugu — తెలుగు

**Desktop**
- [ ] Main Section: all names in Telugu script
- [ ] Right Panel: Telugu renders
- [ ] Bottom Bar: Telugu name renders when revealed
- [ ] Spot Check: all options in Telugu
- [ ] No overflow

**Mobile**
- [ ] Main Section: Telugu legible at yantra scale
- [ ] Lower Main Section: Telugu renders below yantra
- [ ] Bottom Bar: Telugu renders (fixed position ✅)
- [ ] Spot Check: all options in Telugu

**Notes:**

---

### 2.4 Tamil — தமிழ்

**Desktop**
- [ ] Main Section: all names in Tamil script
- [ ] Right Panel: Tamil renders
- [ ] Bottom Bar: Tamil name renders when revealed
- [ ] Spot Check: all options in Tamil
- [ ] Retroflex and aspirated sounds render acceptably in Tamil encoding
- [ ] No overflow

**Mobile**
- [ ] Main Section: Tamil legible at yantra scale
- [ ] Lower Main Section: Tamil renders below yantra
- [ ] Bottom Bar: Tamil renders (fixed position ✅)
- [ ] Spot Check: all options in Tamil

**Notes:**

---

### 2.5 Kannada — ಕನ್ನಡ

**Desktop**
- [ ] Main Section: all names in Kannada script
- [ ] Right Panel: Kannada renders
- [ ] Bottom Bar: Kannada name renders when revealed
- [ ] Spot Check: all options in Kannada
- [ ] No overflow

**Mobile**
- [ ] Main Section: Kannada legible at yantra scale
- [ ] Lower Main Section: Kannada renders below yantra
- [ ] Bottom Bar: Kannada renders (fixed position ✅)
- [ ] Spot Check: all options in Kannada

**Notes:**

---

### 2.6 Malayalam — മലയാളം

**Desktop**
- [ ] Main Section: all names in Malayalam script
- [ ] Right Panel: Malayalam renders
- [ ] Bottom Bar: Malayalam name renders when revealed
- [ ] Spot Check: all options in Malayalam
- [ ] Complex ligatures form correctly
- [ ] No overflow

**Mobile**
- [ ] Main Section: Malayalam legible at yantra scale
- [ ] Lower Main Section: Malayalam renders below yantra
- [ ] Bottom Bar: Malayalam renders (fixed position ✅)
- [ ] Spot Check: all options in Malayalam

**Notes:**

---

### 2.7 English (anglicised romanisation)

Simplified romanisation without diacritics, for users unfamiliar with IAST notation.

**Desktop**
- [ ] Main Section: names in plain ASCII, no diacritics
- [ ] Right Panel: English romanisation renders
- [ ] Bottom Bar: English romanisation renders when revealed
- [ ] Spot Check: all options in English romanisation
- [ ] Capitalisation consistent across all locations
- [ ] No name renders as empty or undefined
- [ ] Names visibly distinct from IAST (e.g. "Sarva Vighnanivarini" not "sarvavighnanivāriṇī")

**Mobile**
- [ ] Main Section: English romanisation renders at yantra scale
- [ ] Lower Main Section: English romanisation renders below yantra
- [ ] Bottom Bar: English romanisation renders (fixed position ✅)
- [ ] Spot Check: all options in English romanisation

**Notes:**

---

## Section 3 — Cross-cutting Checks

Run after completing Sections 1 and 2.

**Switching behaviour**
- [ ] Switching Script mid-session updates all visible name instances immediately — no stale display
- [ ] Switching Script in Explore mode does not reset circuit progress
- [ ] Switching Script in Memorise mode does not reset score
- [ ] Switching Language mid-session updates all UI strings immediately
- [ ] Script picker dropdown closes when clicking/tapping outside it
- [ ] Language picker dropdown closes when clicking/tapping outside it

**Both Views**
- [ ] Script and Language pickers function correctly on Desktop
- [ ] Script and Language pickers function correctly on Mobile

---

## Sign-off Log

| Date | Commit | Tester | Sections passed | Notes |
|---|---|---|---|---|
| | | | | |
