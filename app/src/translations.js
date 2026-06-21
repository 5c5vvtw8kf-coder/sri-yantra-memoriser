/**
 * translations.js — i18n for the Śrī Yantra Memoriser.
 *
 * LOCALE CONFIG
 * Each locale has:
 *   label    — short label shown in the picker (in the target language/script)
 *   script   — which script key to use for Sanskrit deity names (maps to JSON field)
 *   uiLang   — which UI language string set to use
 *   ruby     — (optional) secondary script shown as ruby/furigana above the primary
 *
 * ADDING A NEW LOCALE
 * 1. Add an entry to LOCALE_CONFIG below.
 * 2. Add a UI string object to UI_STRINGS with the matching uiLang key.
 * 3. Make sure the deity name script exists in khadgamala-canonical.json.
 *
 * TRANSLATION STATUS
 *   en  — complete (base)
 *   hi  — complete (AI-generated; needs native speaker review)
 *   te  — complete (AI-generated; needs native speaker review)
 *   ta  — complete (AI-generated; needs native speaker review)
 *   kn  — complete (AI-generated; needs native speaker review)
 *   ml  — complete (AI-generated; needs native speaker review)
 *   si  — stub (Sinhala; to be added)
 *   ne  — stub (Nepali; to be added)
 *   id  — stub (Indonesian; to be added)
 *   ja  — stub (Japanese; deity names in katakana with IAST furigana)
 */

// ── Locale registry ───────────────────────────────────────────────────────────

export const LOCALE_CONFIG = {
  // ── Script options (deity name rendering) ─────────────────────────────────
  // label:      shown in the desktop script picker (full native name)
  // shortLabel: shown in the mobile script dropdown (abbreviated)
  // script:     key used to look up displayName() in canonical data
  // uiLang:     reserved for future Language picker; always 'en' for now
  iast: {
    label:      'IAST',
    shortLabel: 'IAST',
    script:     'iast',
    uiLang:     'en',
  },
  devanagari: {
    label:      'देवनागरी',
    shortLabel: 'देव',
    script:     'devanagari',
    uiLang:     'en',
  },
  telugu: {
    label:      'తెలుగు',
    shortLabel: 'తెలు',
    script:     'telugu',
    uiLang:     'en',
  },
  tamil: {
    label:      'தமிழ்',
    shortLabel: 'தமி',
    script:     'tamil',
    uiLang:     'en',
  },
  kannada: {
    label:      'ಕನ್ನಡ',
    shortLabel: 'ಕನ್ನ',
    script:     'kannada',
    uiLang:     'en',
  },
  malayalam: {
    label:      'മലയാളം',
    shortLabel: 'മലയ',
    script:     'malayalam',
    uiLang:     'en',
  },
  english: {
    label:      'English',
    shortLabel: 'En',
    script:     'english',
    uiLang:     'en',
  },

  // ── New full-language locales ──────────────────────────────────────────────
  // Uncomment and add data as each is implemented.

  // ne: {
  //   label:   'नेपाली',
  //   script:  'devanagari',
  //   uiLang:  'ne',
  // },
  // si: {
  //   label:   'සිංහල',
  //   script:  'sinhala',
  //   uiLang:  'si',
  // },
  // id: {
  //   label:   'Indonesia',
  //   script:  'iast',
  //   uiLang:  'id',
  // },
  // ja: {
  //   label:   '日本語',
  //   script:  'kana',      // katakana (added to canonical JSON via indic-transliteration)
  //   uiLang:  'ja',
  //   ruby:    'iast',      // IAST shown as furigana above katakana
  // },
}

/** Returns the list of scripts in display order for the picker. */
export const LOCALE_ORDER = [
  'iast', 'devanagari', 'telugu', 'tamil', 'kannada', 'malayalam', 'english',
  // 'ne', 'si', 'id', 'ja',
]

/** Returns the script key for a given locale id (defaults to 'iast'). */
export function localeScript(locale) {
  return LOCALE_CONFIG[locale]?.script ?? 'iast'
}

/** Returns the ruby/furigana script for a locale (or null if none). */
export function localeRuby(locale) {
  return LOCALE_CONFIG[locale]?.ruby ?? null
}

/** Returns the UI language code for a given locale id (defaults to 'en'). */
export function localeUiLang(locale) {
  return LOCALE_CONFIG[locale]?.uiLang ?? 'en'
}

// ── UI string tables ──────────────────────────────────────────────────────────
// Keys use dot-notation: 'category.key'
// All new keys MUST be added to the 'en' table first, then other tables.
// Missing keys fall back to English automatically.

const en = {
  // ── Language picker ────────────────────────────────────────────────────────
  'picker.label':       'Script',

  // ── Mode toggles ──────────────────────────────────────────────────────────
  'mode.explore':       'Explore',
  'mode.memorise':      'Memorise',

  // ── Memorise mode instructions ─────────────────────────────────────────────
  'instr.hover_reveal':       'hover to reveal',
  'instr.click_correct':      'click = memorised',
  'instr.dblclick_wrong':     'dbl-click = not memorised',
  'instr.right_click_toggle': 'right-click past = toggle',
  'instr.tap_reveal':         'tap to reveal',

  // ── Explore hints (footer bar) ─────────────────────────────────────────────
  'hint.dot':      'Hover or click any dot to reveal the deity',
  'hint.petal':    'Hover or click any petal to reveal the deity',
  'hint.triangle': 'Hover or click any triangle to reveal the deity',
  'hint.bindu':    'Hover or click the bindu to reveal the deity',
  'hint.tripura':  'Hover any circuit to reveal its Tripura form',
  'hint.closing':  'Hover a number to illuminate the Yantra · tap to reveal the epithet',
  'hint.circuit':  'Tap a circuit to explore',

  // ── Spot Check ────────────────────────────────────────────────────────────
  'spot.title':          'Spot Check',
  'spot.segment':        'Segment',
  'spot.round_size':     'Round size',
  'spot.whole':          'Whole',
  'spot.round_complete': 'Round complete',

  // ── Score / right panel ────────────────────────────────────────────────────
  'score.round':         'Round',
  'score.session':       'Session',
  'score.last_attempt':  'Last attempt',
  'score.not_memorised': 'Not memorised',
  'score.scores':        'Scores',
  'score.deity_list':    'Deity list',

  // ── Memory Map ────────────────────────────────────────────────────────────
  'map.title':           'Memory Map',
  'map.maps':            'Maps',
  'map.list':            'List',
  'map.progress':        'overall progress',
  'map.clear_all':       'Clear all',
  'map.all_sections':    'All sections',
  'map.col_num':         '#',
  'map.col_name':        'Name',
  'map.col_section':     'Section',
  'map.col_status':      'Status',
  'map.memorised':       '✓ Memorised',
  'map.partial':         '~ Partially memorised',
  'map.not_memorised':   '✗ Not memorised',
  'map.not_attempted':   '— Not attempted',
  'map.no_entries':      'No entries match',
  'map.clear_confirm':   'Clear all memo results and history? This cannot be undone.',
  'map.correct_last3':   'correct on last 3 attempts',
  'map.correct_partial': 'correct on < last 3 attempts',
  'map.none_correct':    'none of last 3 correct',
  'map.not_tried':       'not attempted',

  // ── Activity Log ──────────────────────────────────────────────────────────
  'log.title':        'Activity Log',
  'log.clear':        'Clear',
  'log.clear_confirm': 'Clear activity log? This cannot be undone.',
  'log.col_date':     'Date',
  'log.col_time':     'Time',
  'log.col_section':  'Section',
  'log.col_score':    'Score',
  'log.all_sections': 'All sections',
  'log.empty':        'No sessions yet — complete a Memo or Spot Check round to start logging.',
  'log.no_entries':   'No entries match',
  'log.session':      'session',
  'log.sessions':     'sessions',

  // ── Yantra explorer controls ───────────────────────────────────────────────
  'yantra.controls':     'Controls',
  'yantra.triangles':    'Triangles',
  'yantra.numbers':      'Numbers',
  'yantra.labels':       'Labels',
  'yantra.seed_of_life': 'Seed of Life',

  // ── Deity detail ───────────────────────────────────────────────────────────
  'deity.secrecy':        'Secrecy',
  'deity.chakra_svamini': 'Chakra Svāminī',
  'deity.yogini':         'Yoginī',
  'deity.chakreshvari':   'Chakreshvarī',
  'deity.singular':       'Deity',

  // ── Tithi Nitya moon phase toggle ─────────────────────────────────────────
  'inner.waxing': '☽ Waxing',
  'inner.waning': '☾ Waning',

  // ── Guravaḥ section group headings ────────────────────────────────────────
  'gurava.divya':  'divyaugha guravaḥ',
  'gurava.siddha': 'siddhaugha guravaḥ',
  'gurava.manava': 'mānavaugha guravaḥ',

  // ── Bhupura group labels ──────────────────────────────────────────────────
  'bhupura.siddhi':       'Siddhi Shaktis',
  'bhupura.matrika':      'Ashta Matrikas',
  'bhupura.mudra':        'Mudra Shaktis',
  'bhupura.outer_band':   'Outer Band',
  'bhupura.middle_band':  'Middle Band',
  'bhupura.inner_band':   'Inner Band',

  // ── Spot Check colour toggle ───────────────────────────────────────────────
  'toggle.plain':   'Plain',
  'toggle.colours': 'Colours',

  // ── Navigation ────────────────────────────────────────────────────────────
  'nav.open':      'Open navigation',
  'nav.expand':    'Expand navigation',
  'nav.collapse':  'Collapse navigation',
  'nav.take_tour': 'Take the tour',

  // ── Tab labels (non-Sanskrit only) ────────────────────────────────────────
  'tab.intro':       'Introduction',
  'tab.spotcheck':   'Spot Check',
  'tab.memomap':     'Memory Map',
  'tab.actlog':      'Activity Log',
  'tab.references':  'References',
  'tab.yantra':      'Śrī Yantra',
  'tab.browser':     'Khadgamala Stotram',

  // ── Common ────────────────────────────────────────────────────────────────
  'device.portrait':    'This app is designed for portrait mode',
  'btn.reset':          'Reset',
  'btn.reset_session':  'Reset session',
  'btn.reset_level':    'Reset whole level',
  'misc.all':              'All',
  'misc.entries':          'entries',
  'misc.entry':            'entry',
  'misc.filtered':         'filtered',
  'misc.all_memorised':    'All memorised — well done!',
  'misc.try_again':        'Try again',
  'misc.next':             'Next →',
  'misc.memorised':        'memorised',
  'btn.new_round':         'New round',
}

// ── Hindi / Devanagari ────────────────────────────────────────────────────────
// AI-generated — needs native speaker review.

const hi = {
  'picker.label':       'भाषा',
  'mode.explore':       'अन्वेषण करें',
  'mode.memorise':      'कंठस्थ करें',
  'instr.hover_reveal':       'प्रकट करने के लिए होवर करें',
  'instr.click_correct':      'क्लिक = कंठस्थ',
  'instr.dblclick_wrong':     'दोहरा-क्लिक = कंठस्थ नहीं',
  'instr.right_click_toggle': 'राइट-क्लिक = बदलें',
  'instr.tap_reveal':         'प्रकट करने के लिए टैप करें',
  'hint.dot':      'देवता प्रकट करने के लिए किसी बिंदु पर टैप करें',
  'hint.petal':    'देवता प्रकट करने के लिए किसी दल पर टैप करें',
  'hint.triangle': 'देवता प्रकट करने के लिए किसी त्रिभुज पर टैप करें',
  'hint.bindu':    'देवता प्रकट करने के लिए बिंदु पर टैप करें',
  'hint.tripura':  'त्रिपुर रूप प्रकट करने के लिए किसी चक्र पर होवर करें',
  'hint.closing':  'यंत्र प्रकाशित करने के लिए संख्या पर होवर करें · विशेषण प्रकट करने के लिए टैप करें',
  'hint.circuit':  'अन्वेषण के लिए किसी आवरण पर टैप करें',
  'spot.title':          'स्पॉट चेक',
  'spot.segment':        'खंड',
  'spot.round_size':     'राउंड आकार',
  'spot.whole':          'संपूर्ण',
  'spot.round_complete': 'राउंड पूर्ण',
  'score.round':         'राउंड',
  'score.session':       'सत्र',
  'score.last_attempt':  'अंतिम प्रयास',
  'score.not_memorised': 'कंठस्थ नहीं',
  'score.scores':        'अंक',
  'score.deity_list':    'देवताओं की सूची',
  'map.title':           'स्मृति मानचित्र',
  'map.maps':            'मानचित्र',
  'map.list':            'सूची',
  'map.progress':        'समग्र प्रगति',
  'map.clear_all':       'सब मिटाएं',
  'map.all_sections':    'सभी खंड',
  'map.col_num':         '#',
  'map.col_name':        'नाम',
  'map.col_section':     'खंड',
  'map.col_status':      'स्थिति',
  'map.memorised':       '✓ कंठस्थ',
  'map.partial':         '~ आंशिक',
  'map.not_memorised':   '✗ कंठस्थ नहीं',
  'map.not_attempted':   '— प्रयास नहीं',
  'map.no_entries':      'कोई मिलान नहीं',
  'map.clear_confirm':   'सभी परिणाम मिटाएं? यह पूर्ववत नहीं किया जा सकता।',
  'map.correct_last3':   'अंतिम 3 प्रयासों में सही',
  'map.correct_partial': 'अंतिम 3 से कम प्रयासों में सही',
  'map.none_correct':    'अंतिम 3 में कोई सही नहीं',
  'map.not_tried':       'प्रयास नहीं किया',
  'log.title':        'गतिविधि लॉग',
  'log.clear':        'मिटाएं',
  'log.col_date':     'तिथि',
  'log.col_time':     'समय',
  'log.col_section':  'खंड',
  'log.col_score':    'अंक',
  'log.all_sections': 'सभी खंड',
  'log.empty':        'अभी तक कोई सत्र नहीं — एक मेमो या स्पॉट चेक राउंड पूरा करें।',
  'log.no_entries':   'कोई मिलान नहीं',
  'log.session':      'सत्र',
  'log.sessions':     'सत्र',
  'yantra.controls':     'नियंत्रण',
  'yantra.triangles':    'त्रिभुज',
  'yantra.numbers':      'संख्याएं',
  'yantra.labels':       'लेबल',
  'yantra.seed_of_life': 'जीवन बीज',
  'deity.secrecy':        'गोपनीयता स्तर',
  'deity.chakra_svamini': 'चक्र स्वामिनी',
  'deity.yogini':         'योगिनी',
  'deity.chakreshvari':   'चक्रेश्वरी',
  'deity.singular':       'देवता',
  'inner.waxing': '☽ शुक्ल पक्ष',
  'inner.waning': '☾ कृष्ण पक्ष',
  'gurava.divya':  'दिव्यौघ गुरवः',
  'gurava.siddha': 'सिद्धौघ गुरवः',
  'gurava.manava': 'मानवौघ गुरवः',
  'bhupura.siddhi':      'सिद्धि शक्तियां',
  'bhupura.matrika':     'अष्ट मातृकाएं',
  'bhupura.mudra':       'मुद्रा शक्तियां',
  'bhupura.outer_band':  'बाहरी पट्टी',
  'bhupura.middle_band': 'मध्य पट्टी',
  'bhupura.inner_band':  'आंतरिक पट्टी',
  'toggle.plain':   'सादा',
  'toggle.colours': 'रंग',
  'nav.open':      'नेविगेशन खोलें',
  'nav.expand':    'नेविगेशन फैलाएं',
  'nav.collapse':  'नेविगेशन सिकोड़ें',
  'nav.take_tour': 'भ्रमण करें',
  'tab.intro':      'परिचय',
  'tab.spotcheck':  'स्पॉट चेक',
  'tab.memomap':    'स्मृति मानचित्र',
  'tab.actlog':     'गतिविधि लॉग',
  'tab.references': 'संदर्भ',
  'device.portrait':   'यह ऐप पोर्ट्रेट मोड के लिए बनाया गया है',
  'btn.reset':         'रीसेट',
  'btn.reset_session': 'सत्र रीसेट',
  'btn.reset_level':   'संपूर्ण स्तर रीसेट',
  'misc.all':      'सभी',
  'misc.entries':  'प्रविष्टियां',
  'misc.entry':    'प्रविष्टि',
  'misc.filtered': 'फ़िल्टर्ड',
}

// ── Telugu ────────────────────────────────────────────────────────────────────
// AI-generated — needs native speaker review.

const te = {
  'picker.label':       'భాష',
  'mode.explore':       'అన్వేషించు',
  'mode.memorise':      'కంఠస్థం చేయి',
  'instr.hover_reveal':       'వెల్లడించడానికి హోవర్ చేయండి',
  'instr.click_correct':      'క్లిక్ = కంఠస్థమైంది',
  'instr.dblclick_wrong':     'డబుల్-క్లిక్ = కంఠస్థం కాలేదు',
  'instr.right_click_toggle': 'రైట్-క్లిక్ = మార్చు',
  'instr.tap_reveal':         'వెల్లడించడానికి నొక్కండి',
  'hint.dot':      'దేవతను వెల్లడించడానికి ఏదైనా బిందువుపై నొక్కండి',
  'hint.petal':    'దేవతను వెల్లడించడానికి ఏదైనా రేకుపై నొక్కండి',
  'hint.triangle': 'దేవతను వెల్లడించడానికి ఏదైనా త్రిభుజంపై నొక్కండి',
  'hint.bindu':    'దేవతను వెల్లడించడానికి బిందువుపై నొక్కండి',
  'hint.tripura':  'త్రిపుర రూపాన్ని వెల్లడించడానికి ఏదైనా చక్రంపై హోవర్ చేయండి',
  'hint.closing':  'యంత్రాన్ని వెలిగించడానికి సంఖ్యపై హోవర్ చేయండి · విశేషణాన్ని వెల్లడించడానికి నొక్కండి',
  'hint.circuit':  'అన్వేషించడానికి ఒక ఆవరణంపై నొక్కండి',
  'spot.title':          'స్పాట్ చెక్',
  'spot.segment':        'విభాగం',
  'spot.round_size':     'రౌండ్ పరిమాణం',
  'spot.whole':          'మొత్తం',
  'spot.round_complete': 'రౌండ్ పూర్తైంది',
  'score.round':         'రౌండ్',
  'score.session':       'సెషన్',
  'score.last_attempt':  'చివరి ప్రయత్నం',
  'score.not_memorised': 'కంఠస్థం కాలేదు',
  'score.scores':        'స్కోర్లు',
  'score.deity_list':    'దేవతల జాబితా',
  'map.title':           'జ్ఞాపక పటం',
  'map.maps':            'పటాలు',
  'map.list':            'జాబితా',
  'map.progress':        'మొత్తం పురోగతి',
  'map.clear_all':       'అన్నీ తొలగించు',
  'map.all_sections':    'అన్ని విభాగాలు',
  'map.col_num':         '#',
  'map.col_name':        'పేరు',
  'map.col_section':     'విభాగం',
  'map.col_status':      'స్థితి',
  'map.memorised':       '✓ కంఠస్థమైంది',
  'map.partial':         '~ పాక్షికంగా',
  'map.not_memorised':   '✗ కంఠస్థం కాలేదు',
  'map.not_attempted':   '— ప్రయత్నించలేదు',
  'map.no_entries':      'సరిపోయే నమోదులు లేవు',
  'map.clear_confirm':   'అన్ని ఫలితాలు తొలగించాలా? ఇది రద్దు చేయడం సాధ్యం కాదు.',
  'map.correct_last3':   'చివరి 3 ప్రయత్నాలలో సరైనవి',
  'map.correct_partial': 'చివరి 3 కంటే తక్కువ ప్రయత్నాలలో సరైనవి',
  'map.none_correct':    'చివరి 3 ప్రయత్నాలలో ఏదీ సరైనవి కాదు',
  'map.not_tried':       'ప్రయత్నించలేదు',
  'log.title':        'కార్యకలాప నమోదు',
  'log.clear':        'తొలగించు',
  'log.col_date':     'తేదీ',
  'log.col_time':     'సమయం',
  'log.col_section':  'విభాగం',
  'log.col_score':    'స్కోరు',
  'log.all_sections': 'అన్ని విభాగాలు',
  'log.empty':        'ఇంకా సెషన్లు లేవు — మెమో లేదా స్పాట్ చెక్ రౌండ్ పూర్తి చేయండి.',
  'log.no_entries':   'సరిపోయే నమోదులు లేవు',
  'log.session':      'సెషన్',
  'log.sessions':     'సెషన్లు',
  'yantra.controls':     'నియంత్రణలు',
  'yantra.triangles':    'త్రిభుజాలు',
  'yantra.numbers':      'సంఖ్యలు',
  'yantra.labels':       'శీర్షికలు',
  'yantra.seed_of_life': 'జీవన బీజం',
  'deity.secrecy':        'రహస్య స్తరం',
  'deity.chakra_svamini': 'చక్ర స్వామిని',
  'deity.yogini':         'యోగిని',
  'deity.chakreshvari':   'చక్రేశ్వరి',
  'deity.singular':       'దేవత',
  'inner.waxing': '☽ శుక్ల పక్షం',
  'inner.waning': '☾ కృష్ణ పక్షం',
  'gurava.divya':  'దివ్యౌఘ గురువులు',
  'gurava.siddha': 'సిద్ధౌఘ గురువులు',
  'gurava.manava': 'మానవౌఘ గురువులు',
  'bhupura.siddhi':      'సిద్ధి శక్తులు',
  'bhupura.matrika':     'అష్ట మాతృకలు',
  'bhupura.mudra':       'ముద్రా శక్తులు',
  'bhupura.outer_band':  'బయటి పట్టీ',
  'bhupura.middle_band': 'మధ్య పట్టీ',
  'bhupura.inner_band':  'లోపలి పట్టీ',
  'toggle.plain':   'సాదా',
  'toggle.colours': 'రంగులు',
  'nav.open':      'నావిగేషన్ తెరువు',
  'nav.expand':    'నావిగేషన్ విస్తరించు',
  'nav.collapse':  'నావిగేషన్ కుదించు',
  'nav.take_tour': 'పర్యటన చేయి',
  'tab.intro':      'పరిచయం',
  'tab.spotcheck':  'స్పాట్ చెక్',
  'tab.memomap':    'జ్ఞాపక పటం',
  'tab.actlog':     'కార్యకలాప నమోదు',
  'tab.references': 'సూచనలు',
  'device.portrait':   'ఈ యాప్ పోర్ట్రెయిట్ మోడ్ కోసం రూపొందించబడింది',
  'btn.reset':         'రీసెట్',
  'btn.reset_session': 'సెషన్ రీసెట్',
  'btn.reset_level':   'స్థాయి మొత్తం రీసెట్',
  'misc.all':      'అన్నీ',
  'misc.entries':  'నమోదులు',
  'misc.entry':    'నమోదు',
  'misc.filtered': 'వడపోయింది',
}

// ── Tamil ─────────────────────────────────────────────────────────────────────
// AI-generated — needs native speaker review.

const ta = {
  'picker.label':       'மொழி',
  'mode.explore':       'ஆராயுங்கள்',
  'mode.memorise':      'மனப்பாடம்',
  'instr.hover_reveal':       'வெளிப்படுத்த மேலே நகர்த்துங்கள்',
  'instr.click_correct':      'கிளிக் = மனப்பாடமானது',
  'instr.dblclick_wrong':     'இரட்டை-கிளிக் = மனப்பாடமாகவில்லை',
  'instr.right_click_toggle': 'வலது-கிளிக் = மாற்று',
  'instr.tap_reveal':         'வெளிப்படுத்த தட்டுங்கள்',
  'hint.dot':      'தேவதையை வெளிப்படுத்த எந்த புள்ளியையும் தட்டுங்கள்',
  'hint.petal':    'தேவதையை வெளிப்படுத்த எந்த இதழையும் தட்டுங்கள்',
  'hint.triangle': 'தேவதையை வெளிப்படுத்த எந்த முக்கோணத்தையும் தட்டுங்கள்',
  'hint.bindu':    'தேவதையை வெளிப்படுத்த பிந்துவைத் தட்டுங்கள்',
  'hint.tripura':  'திரிபுர வடிவை வெளிப்படுத்த எந்த சக்கரத்திலும் நகர்த்துங்கள்',
  'hint.closing':  'யந்திரத்தை ஒளிர வைக்க எண்ணில் நகர்த்துங்கள் · பெயரை வெளிப்படுத்த தட்டுங்கள்',
  'hint.circuit':  'ஆராய ஒரு சக்கரத்தைத் தட்டுங்கள்',
  'spot.title':          'ஸ்பாட் செக்',
  'spot.segment':        'பிரிவு',
  'spot.round_size':     'சுற்று அளவு',
  'spot.whole':          'முழுவதும்',
  'spot.round_complete': 'சுற்று முடிந்தது',
  'score.round':         'சுற்று',
  'score.session':       'அமர்வு',
  'score.last_attempt':  'கடைசி முயற்சி',
  'score.not_memorised': 'மனப்பாடமாகவில்லை',
  'score.scores':        'மதிப்பெண்கள்',
  'score.deity_list':    'தேவதை பட்டியல்',
  'map.title':           'நினைவு வரைபடம்',
  'map.maps':            'வரைபடங்கள்',
  'map.list':            'பட்டியல்',
  'map.progress':        'மொத்த முன்னேற்றம்',
  'map.clear_all':       'அனைத்தும் அழி',
  'map.all_sections':    'அனைத்து பிரிவுகளும்',
  'map.col_num':         '#',
  'map.col_name':        'பெயர்',
  'map.col_section':     'பிரிவு',
  'map.col_status':      'நிலை',
  'map.memorised':       '✓ மனப்பாடமானது',
  'map.partial':         '~ பகுதியளவு',
  'map.not_memorised':   '✗ மனப்பாடமாகவில்லை',
  'map.not_attempted':   '— முயற்சிக்கவில்லை',
  'map.no_entries':      'பொருந்தும் பதிவுகள் இல்லை',
  'map.clear_confirm':   'அனைத்து முடிவுகளையும் அழிக்கவா? இதை மீளவியலாது.',
  'map.correct_last3':   'கடைசி 3 முயற்சிகளில் சரியானவை',
  'map.correct_partial': 'கடைசி 3க்கும் குறைவான முயற்சிகளில் சரியானவை',
  'map.none_correct':    'கடைசி 3 முயற்சிகளில் எதுவும் சரியில்லை',
  'map.not_tried':       'முயற்சிக்கவில்லை',
  'log.title':        'செயல்பாட்டு பதிவு',
  'log.clear':        'அழி',
  'log.col_date':     'தேதி',
  'log.col_time':     'நேரம்',
  'log.col_section':  'பிரிவு',
  'log.col_score':    'மதிப்பெண்',
  'log.all_sections': 'அனைத்து பிரிவுகளும்',
  'log.empty':        'இதுவரை அமர்வுகள் இல்லை — ஒரு மெமோ அல்லது ஸ்பாட் செக் சுற்றை முடிக்கவும்.',
  'log.no_entries':   'பொருந்தும் பதிவுகள் இல்லை',
  'log.session':      'அமர்வு',
  'log.sessions':     'அமர்வுகள்',
  'yantra.controls':     'கட்டுப்பாடுகள்',
  'yantra.triangles':    'முக்கோணங்கள்',
  'yantra.numbers':      'எண்கள்',
  'yantra.labels':       'பெயர்ச்சீட்டுகள்',
  'yantra.seed_of_life': 'உயிரின் விதை',
  'deity.secrecy':        'இரகசிய நிலை',
  'deity.chakra_svamini': 'சக்ர ஸ்வாமினி',
  'deity.yogini':         'யோகினி',
  'deity.chakreshvari':   'சக்ரேஶ்வரி',
  'deity.singular':       'தேவதை',
  'inner.waxing': '☽ வளர்பிறை',
  'inner.waning': '☾ தேய்பிறை',
  'gurava.divya':  'திவ்யௌக குருக்கள்',
  'gurava.siddha': 'சித்தௌக குருக்கள்',
  'gurava.manava': 'மானவௌக குருக்கள்',
  'bhupura.siddhi':      'சித்தி சக்திகள்',
  'bhupura.matrika':     'அஷ்ட மாதிரிகள்',
  'bhupura.mudra':       'முத்திரை சக்திகள்',
  'bhupura.outer_band':  'வெளி வலயம்',
  'bhupura.middle_band': 'நடு வலயம்',
  'bhupura.inner_band':  'உள் வலயம்',
  'toggle.plain':   'வெளிர்',
  'toggle.colours': 'வண்ணங்கள்',
  'nav.open':      'வழிசெலுத்தல் திற',
  'nav.expand':    'வழிசெலுத்தல் விரி',
  'nav.collapse':  'வழிசெலுத்தல் சுருக்கு',
  'nav.take_tour': 'சுற்றுப்பயணம்',
  'tab.intro':      'அறிமுகம்',
  'tab.spotcheck':  'ஸ்பாட் செக்',
  'tab.memomap':    'நினைவு வரைபடம்',
  'tab.actlog':     'செயல்பாட்டு பதிவு',
  'tab.references': 'குறிப்புகள்',
  'device.portrait':   'இந்த ஆப் போர்ட்ரெய்ட் பயன்முறைக்காக வடிவமைக்கப்பட்டுள்ளது',
  'btn.reset':         'மீட்டமை',
  'btn.reset_session': 'அமர்வை மீட்டமை',
  'btn.reset_level':   'நிலை முழுவதையும் மீட்டமை',
  'misc.all':      'அனைத்தும்',
  'misc.entries':  'பதிவுகள்',
  'misc.entry':    'பதிவு',
  'misc.filtered': 'வடிகட்டியது',
}

// ── Kannada ───────────────────────────────────────────────────────────────────
// AI-generated — needs native speaker review.

const kn = {
  'picker.label':       'ಭಾಷೆ',
  'mode.explore':       'ಅನ್ವೇಷಿಸು',
  'mode.memorise':      'ಕಂಠಸ್ಥ ಮಾಡು',
  'instr.hover_reveal':       'ಬಹಿರಂಗಪಡಿಸಲು ಹೋವರ್ ಮಾಡಿ',
  'instr.click_correct':      'ಕ್ಲಿಕ್ = ಕಂಠಸ್ಥವಾಗಿದೆ',
  'instr.dblclick_wrong':     'ಡಬಲ್-ಕ್ಲಿಕ್ = ಕಂಠಸ್ಥವಾಗಿಲ್ಲ',
  'instr.right_click_toggle': 'ರೈಟ್-ಕ್ಲಿಕ್ = ಬದಲಾಯಿಸು',
  'instr.tap_reveal':         'ಬಹಿರಂಗಪಡಿಸಲು ತಟ್ಟಿ',
  'hint.dot':      'ದೇವತೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸಲು ಯಾವುದಾದರೂ ಬಿಂದುವನ್ನು ತಟ್ಟಿ',
  'hint.petal':    'ದೇವತೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸಲು ಯಾವುದಾದರೂ ದಳವನ್ನು ತಟ್ಟಿ',
  'hint.triangle': 'ದೇವತೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸಲು ಯಾವುದಾದರೂ ತ್ರಿಭುಜವನ್ನು ತಟ್ಟಿ',
  'hint.bindu':    'ದೇವತೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸಲು ಬಿಂದುವನ್ನು ತಟ್ಟಿ',
  'hint.tripura':  'ತ್ರಿಪುರ ರೂಪವನ್ನು ಬಹಿರಂಗಪಡಿಸಲು ಯಾವುದಾದರೂ ಚಕ್ರದ ಮೇಲೆ ಹೋವರ್ ಮಾಡಿ',
  'hint.closing':  'ಯಂತ್ರವನ್ನು ಬೆಳಗಿಸಲು ಸಂಖ್ಯೆಯ ಮೇಲೆ ಹೋವರ್ ಮಾಡಿ · ಉಪಾಧಿಯನ್ನು ಬಹಿರಂಗಪಡಿಸಲು ತಟ್ಟಿ',
  'hint.circuit':  'ಅನ್ವೇಷಿಸಲು ಒಂದು ಚಕ್ರವನ್ನು ತಟ್ಟಿ',
  'spot.title':          'ಸ್ಪಾಟ್ ಚೆಕ್',
  'spot.segment':        'ವಿಭಾಗ',
  'spot.round_size':     'ಸುತ್ತಿನ ಗಾತ್ರ',
  'spot.whole':          'ಸಂಪೂರ್ಣ',
  'spot.round_complete': 'ಸುತ್ತು ಪೂರ್ಣಗೊಂಡಿದೆ',
  'score.round':         'ಸುತ್ತು',
  'score.session':       'ಸೆಷನ್',
  'score.last_attempt':  'ಕೊನೆಯ ಪ್ರಯತ್ನ',
  'score.not_memorised': 'ಕಂಠಸ್ಥವಾಗಿಲ್ಲ',
  'score.scores':        'ಅಂಕಗಳು',
  'score.deity_list':    'ದೇವತೆಗಳ ಪಟ್ಟಿ',
  'map.title':           'ಸ್ಮೃತಿ ಪಟ',
  'map.maps':            'ಪಟಗಳು',
  'map.list':            'ಪಟ್ಟಿ',
  'map.progress':        'ಒಟ್ಟಾರೆ ಪ್ರಗತಿ',
  'map.clear_all':       'ಎಲ್ಲ ತೆರವು',
  'map.all_sections':    'ಎಲ್ಲ ವಿಭಾಗಗಳು',
  'map.col_num':         '#',
  'map.col_name':        'ಹೆಸರು',
  'map.col_section':     'ವಿಭಾಗ',
  'map.col_status':      'ಸ್ಥಿತಿ',
  'map.memorised':       '✓ ಕಂಠಸ್ಥವಾಗಿದೆ',
  'map.partial':         '~ ಭಾಗಶಃ',
  'map.not_memorised':   '✗ ಕಂಠಸ್ಥವಾಗಿಲ್ಲ',
  'map.not_attempted':   '— ಪ್ರಯತ್ನಿಸಿಲ್ಲ',
  'map.no_entries':      'ಹೊಂದಾಣಿಕೆ ನಮೂದುಗಳಿಲ್ಲ',
  'map.clear_confirm':   'ಎಲ್ಲ ಫಲಿತಾಂಶಗಳನ್ನು ತೆರವು ಮಾಡಬೇಕೇ? ಇದನ್ನು ರದ್ದು ಮಾಡಲಾಗದು.',
  'map.correct_last3':   'ಕೊನೆಯ 3 ಪ್ರಯತ್ನಗಳಲ್ಲಿ ಸರಿಯಾದವು',
  'map.correct_partial': 'ಕೊನೆಯ 3ಕ್ಕಿಂತ ಕಡಿಮೆ ಪ್ರಯತ್ನಗಳಲ್ಲಿ ಸರಿಯಾದವು',
  'map.none_correct':    'ಕೊನೆಯ 3 ಪ್ರಯತ್ನಗಳಲ್ಲಿ ಯಾವುದೂ ಸರಿಯಿಲ್ಲ',
  'map.not_tried':       'ಪ್ರಯತ್ನಿಸಿಲ್ಲ',
  'log.title':        'ಚಟುವಟಿಕೆ ದಾಖಲೆ',
  'log.clear':        'ತೆರವು',
  'log.col_date':     'ದಿನಾಂಕ',
  'log.col_time':     'ಸಮಯ',
  'log.col_section':  'ವಿಭಾಗ',
  'log.col_score':    'ಅಂಕ',
  'log.all_sections': 'ಎಲ್ಲ ವಿಭಾಗಗಳು',
  'log.empty':        'ಇನ್ನೂ ಸೆಷನ್‌ಗಳಿಲ್ಲ — ಮೆಮೊ ಅಥವಾ ಸ್ಪಾಟ್ ಚೆಕ್ ಸುತ್ತನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
  'log.no_entries':   'ಹೊಂದಾಣಿಕೆ ನಮೂದುಗಳಿಲ್ಲ',
  'log.session':      'ಸೆಷನ್',
  'log.sessions':     'ಸೆಷನ್‌ಗಳು',
  'yantra.controls':     'ನಿಯಂತ್ರಣಗಳು',
  'yantra.triangles':    'ತ್ರಿಭುಜಗಳು',
  'yantra.numbers':      'ಸಂಖ್ಯೆಗಳು',
  'yantra.labels':       'ಲೇಬಲ್‌ಗಳು',
  'yantra.seed_of_life': 'ಜೀವನ ಬೀಜ',
  'deity.secrecy':        'ರಹಸ್ಯ ಸ್ತರ',
  'deity.chakra_svamini': 'ಚಕ್ರ ಸ್ವಾಮಿನಿ',
  'deity.yogini':         'ಯೋಗಿನಿ',
  'deity.chakreshvari':   'ಚಕ್ರೇಶ್ವರಿ',
  'deity.singular':       'ದೇವತೆ',
  'inner.waxing': '☽ ಶುಕ್ಲ ಪಕ್ಷ',
  'inner.waning': '☾ ಕೃಷ್ಣ ಪಕ್ಷ',
  'gurava.divya':  'ದಿವ್ಯೌಘ ಗುರುಗಳು',
  'gurava.siddha': 'ಸಿದ್ಧೌಘ ಗುರುಗಳು',
  'gurava.manava': 'ಮಾನವೌಘ ಗುರುಗಳು',
  'bhupura.siddhi':      'ಸಿದ್ಧಿ ಶಕ್ತಿಗಳು',
  'bhupura.matrika':     'ಅಷ್ಟ ಮಾತೃಕೆಗಳು',
  'bhupura.mudra':       'ಮುದ್ರಾ ಶಕ್ತಿಗಳು',
  'bhupura.outer_band':  'ಹೊರ ಪಟ್ಟಿ',
  'bhupura.middle_band': 'ಮಧ್ಯ ಪಟ್ಟಿ',
  'bhupura.inner_band':  'ಒಳ ಪಟ್ಟಿ',
  'toggle.plain':   'ಸಾದಾ',
  'toggle.colours': 'ಬಣ್ಣಗಳು',
  'nav.open':      'ನ್ಯಾವಿಗೇಷನ್ ತೆರೆ',
  'nav.expand':    'ನ್ಯಾವಿಗೇಷನ್ ವಿಸ್ತರಿಸು',
  'nav.collapse':  'ನ್ಯಾವಿಗೇಷನ್ ಕುಗ್ಗಿಸು',
  'nav.take_tour': 'ಪ್ರವಾಸ ಮಾಡು',
  'tab.intro':      'ಪರಿಚಯ',
  'tab.spotcheck':  'ಸ್ಪಾಟ್ ಚೆಕ್',
  'tab.memomap':    'ಸ್ಮೃತಿ ಪಟ',
  'tab.actlog':     'ಚಟುವಟಿಕೆ ದಾಖಲೆ',
  'tab.references': 'ಉಲ್ಲೇಖಗಳು',
  'device.portrait':   'ಈ ಆ್ಯಪ್ ಪೋರ್ಟ್ರೇಟ್ ಮೋಡ್‌ಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ',
  'btn.reset':         'ಮರುಹೊಂದಿಸು',
  'btn.reset_session': 'ಸೆಷನ್ ಮರುಹೊಂದಿಸು',
  'btn.reset_level':   'ಹಂತ ಸಂಪೂರ್ಣ ಮರುಹೊಂದಿಸು',
  'misc.all':      'ಎಲ್ಲ',
  'misc.entries':  'ನಮೂದುಗಳು',
  'misc.entry':    'ನಮೂದು',
  'misc.filtered': 'ಫಿಲ್ಟರ್ ಮಾಡಲಾಗಿದೆ',
}

// ── Malayalam ─────────────────────────────────────────────────────────────────
// AI-generated — needs native speaker review.

const ml = {
  'picker.label':       'ഭാഷ',
  'mode.explore':       'പര്യവേഷണം',
  'mode.memorise':      'മനഃപ്പാഠം ചെയ്യുക',
  'instr.hover_reveal':       'വെളിപ്പെടുത്തുന്നതിന് ഹോവർ ചെയ്യുക',
  'instr.click_correct':      'ക്ലിക്ക് = മനഃപ്പാഠമായി',
  'instr.dblclick_wrong':     'ഡബ്ൾ-ക്ലിക്ക് = മനഃപ്പാഠമായില്ല',
  'instr.right_click_toggle': 'റൈറ്റ്-ക്ലിക്ക് = മാറ്റുക',
  'instr.tap_reveal':         'വെളിപ്പെടുത്തുന്നതിന് ടാപ്പ് ചെയ്യുക',
  'hint.dot':      'ദേവതയെ വെളിപ്പെടുത്തുന്നതിന് ഏതെങ്കിലും ബിന്ദു ടാപ്പ് ചെയ്യുക',
  'hint.petal':    'ദേവതയെ വെളിപ്പെടുത്തുന്നതിന് ഏതെങ്കിലും ദളം ടാപ്പ് ചെയ്യുക',
  'hint.triangle': 'ദേവതയെ വെളിപ്പെടുത്തുന്നതിന് ഏതെങ്കിലും ത്രികോണം ടാപ്പ് ചെയ്യുക',
  'hint.bindu':    'ദേവതയെ വെളിപ്പെടുത്തുന്നതിന് ബിന്ദു ടാപ്പ് ചെയ്യുക',
  'hint.tripura':  'ത്രിപുര രൂപം വെളിപ്പെടുത്തുന്നതിന് ഏതെങ്കിലും ചക്രത്തിൽ ഹോവർ ചെയ്യുക',
  'hint.closing':  'യന്ത്രം പ്രകാശിക്കുന്നതിന് ഒരു സംഖ്യക്ക് മേൽ ഹോവർ ചെയ്യുക · വിശേഷണം വെളിപ്പെടുത്തുന്നതിന് ടാപ്പ് ചെയ്യുക',
  'hint.circuit':  'പര്യവേഷണം ചെയ്യുന്നതിന് ഒരു ആവരണം ടാപ്പ് ചെയ്യുക',
  'spot.title':          'സ്പോട്ട് ചെക്ക്',
  'spot.segment':        'വിഭാഗം',
  'spot.round_size':     'റൗണ്ട് വലുപ്പം',
  'spot.whole':          'മുഴുവൻ',
  'spot.round_complete': 'റൗണ്ട് പൂർത്തിയായി',
  'score.round':         'റൗണ്ട്',
  'score.session':       'സെഷൻ',
  'score.last_attempt':  'അവസാന ശ്രമം',
  'score.not_memorised': 'മനഃപ്പാഠമായില്ല',
  'score.scores':        'സ്കോറുകൾ',
  'score.deity_list':    'ദേവതകളുടെ പട്ടിക',
  'map.title':           'ഓർമ്മ മാപ്പ്',
  'map.maps':            'മാപ്പുകൾ',
  'map.list':            'പട്ടിക',
  'map.progress':        'മൊത്തം പുരോഗതി',
  'map.clear_all':       'എല്ലാം മായ്ക്കുക',
  'map.all_sections':    'എല്ലാ വിഭാഗങ്ങളും',
  'map.col_num':         '#',
  'map.col_name':        'പേര്',
  'map.col_section':     'വിഭാഗം',
  'map.col_status':      'നില',
  'map.memorised':       '✓ മനഃപ്പാഠമായി',
  'map.partial':         '~ ഭാഗികമായി',
  'map.not_memorised':   '✗ മനഃപ്പാഠമായില്ല',
  'map.not_attempted':   '— ശ്രമിച്ചിട്ടില്ല',
  'map.no_entries':      'യോജിക്കുന്ന ഒരു ഇനവുമില്ല',
  'map.clear_confirm':   'എല്ലാ ഫലങ്ങളും മായ്ക്കണോ? ഇത് പഴയ അവസ്ഥയിലേക്ക് കൊണ്ടുവരാൻ കഴിയില്ല.',
  'map.correct_last3':   'അവസാന 3 ശ്രമങ്ങളിൽ ശരിയായവ',
  'map.correct_partial': 'അവസാന 3-ൽ കുറഞ്ഞ ശ്രമങ്ങളിൽ ശരിയായവ',
  'map.none_correct':    'അവസാന 3 ശ്രമങ്ങളിൽ ഒന്നും ശരിയില്ല',
  'map.not_tried':       'ശ്രമിച്ചിട്ടില്ല',
  'log.title':        'പ്രവർത്തന ലോഗ്',
  'log.clear':        'മായ്ക്കുക',
  'log.col_date':     'തീയതി',
  'log.col_time':     'സമയം',
  'log.col_section':  'വിഭാഗം',
  'log.col_score':    'സ്കോർ',
  'log.all_sections': 'എല്ലാ വിഭാഗങ്ങളും',
  'log.empty':        'ഇതുവരെ സെഷനുകളൊന്നുമില്ല — ഒരു മെമ്മോ അല്ലെങ്കിൽ സ്പോട്ട് ചെക്ക് റൗണ്ട് പൂർത്തിയാക്കുക.',
  'log.no_entries':   'യോജിക്കുന്ന ഒരു ഇനവുമില്ല',
  'log.session':      'സെഷൻ',
  'log.sessions':     'സെഷനുകൾ',
  'yantra.controls':     'നിയന്ത്രണങ്ങൾ',
  'yantra.triangles':    'ത്രികോണങ്ങൾ',
  'yantra.numbers':      'സംഖ്യകൾ',
  'yantra.labels':       'ലേബലുകൾ',
  'yantra.seed_of_life': 'ജീവന്റെ ബീജം',
  'deity.secrecy':        'രഹസ്യ തലം',
  'deity.chakra_svamini': 'ചക്ര സ്വാമിനി',
  'deity.yogini':         'യോഗിനി',
  'deity.chakreshvari':   'ചക്രേശ്വരി',
  'deity.singular':       'ദേവത',
  'inner.waxing': '☽ ശുക്ലപക്ഷം',
  'inner.waning': '☾ കൃഷ്ണപക്ഷം',
  'gurava.divya':  'ദിവ്യൗഘ ഗുരുക്കൾ',
  'gurava.siddha': 'സിദ്ധൗഘ ഗുരുക്കൾ',
  'gurava.manava': 'മാനവൗഘ ഗുരുക്കൾ',
  'bhupura.siddhi':      'സിദ്ധി ശക്തികൾ',
  'bhupura.matrika':     'അഷ്ട മാതൃകകൾ',
  'bhupura.mudra':       'മുദ്രാ ശക്തികൾ',
  'bhupura.outer_band':  'പുറം ബാൻഡ്',
  'bhupura.middle_band': 'മധ്യ ബാൻഡ്',
  'bhupura.inner_band':  'അകം ബാൻഡ്',
  'toggle.plain':   'ലളിതം',
  'toggle.colours': 'നിറങ്ങൾ',
  'nav.open':      'നാവിഗേഷൻ തുറക്കുക',
  'nav.expand':    'നാവിഗേഷൻ വിപുലമാക്കുക',
  'nav.collapse':  'നാവിഗേഷൻ ചുരുക്കുക',
  'nav.take_tour': 'ടൂർ ആരംഭിക്കുക',
  'tab.intro':      'ആമുഖം',
  'tab.spotcheck':  'സ്പോട്ട് ചെക്ക്',
  'tab.memomap':    'ഓർമ്മ മാപ്പ്',
  'tab.actlog':     'പ്രവർത്തന ലോഗ്',
  'tab.references': 'അവലംബം',
  'device.portrait':   'ഈ ആപ്പ് പോർട്രെയ്റ്റ് മോഡിനായി ഡിസൈൻ ചെയ്തതാണ്',
  'btn.reset':         'പുനഃക്രമീകരിക്കുക',
  'btn.reset_session': 'സെഷൻ പുനഃക്രമീകരിക്കുക',
  'btn.reset_level':   'ലെവൽ പൂർണ്ണമായും പുനഃക്രമീകരിക്കുക',
  'misc.all':      'എല്ലാം',
  'misc.entries':  'ഇനങ്ങൾ',
  'misc.entry':    'ഇനം',
  'misc.filtered': 'ഫിൽട്ടർ ചെയ്തത്',
}

// ── String table registry ─────────────────────────────────────────────────────

const UI_STRINGS = { en, hi, te, ta, kn, ml }

// ── Public translation function ───────────────────────────────────────────────

/**
 * translate(locale, key) → string
 *
 * Returns the UI string for `key` in the language appropriate for `locale`.
 * Falls back to English if the key is missing in the target language.
 * Returns the key itself if not found in English either (safe fallback).
 */
export function translate(locale, key) {
  const lang   = localeUiLang(locale)
  const table  = UI_STRINGS[lang] ?? UI_STRINGS.en
  return table[key] ?? UI_STRINGS.en[key] ?? key
}
