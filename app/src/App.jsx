import { useState, useRef, useEffect, useMemo } from 'react'
import { useTour } from './components/TourGuide'
import CircuitBrowser from './components/CircuitBrowser'
import ReferencesView from './components/ReferencesView'
import IntroView from './components/IntroView'
import SriYantraSVG from './components/SriYantraSVG'
import NyasaView from './components/NyasaView'
import InnerView from './components/InnerView'
import GuravaView from './components/GuravaView'
import YantraThemeCustomiser from './components/YantraThemeCustomiser'
import BhupuraView, { C1_TOTAL as BHUPURA_C1_TOTAL, SIDDHI_TOTAL as BHUPURA_SIDDHI_TOTAL } from './components/BhupuraView'
import FuriganaName from './components/FuriganaName'
import C2View from './components/C2View'
import C3View from './components/C3View'
import C4View from './components/C4View'
import C5View from './components/C5View'
import C6View from './components/C6View'
import C7View from './components/C7View'
import C8View from './components/C8View'
import C9View from './components/C9View'
import NavaChakreshvariView from './components/NavaChakreshvariView'
import ClosingView from './components/ClosingView'
import SpotCheckView, { SC_FILTERS } from './components/SpotCheckView'
import LocateDrillView, { LOCATE_SCOPES, LOCATE_TIMER_OPTIONS } from './components/LocateDrillView'
import MemoMapView from './components/MemoMapView'
import ActivityLogView from './components/ActivityLogView'
import SyncView from './components/SyncView'
import { getSyncCode, pullNow, hasLocalProgress, flushPendingPush } from './sync.js'
import LineDrillView from './components/LineDrillView'
import SegmentDrillView from './components/SegmentDrillView'
import TriangleDrillView from './components/TriangleDrillView'
import data from './data/activeDeities'
import lineDrillData from './data/lineDrillLines.json'
import segmentDrillData from './data/segmentDrillLines.json'
import triangleDrillData from './data/triangleDrillLines.json'
import { getPosition, C4_DEITY_ORDER, C5_DEITY_ORDER, C6_DEITY_ORDER, C7_DEITY_ORDER } from './deityPositions.js'
import { displayName, loadMemoStorage, saveMemoStorage, saveSessionLog, recordHistoryEntry, sectionIdToMemoKey, loadCustomYantraTheme, loadCustomYantraThemes, saveCustomYantraThemes } from './utils.js'
import { translate, LOCALE_ORDER, LOCALE_CONFIG, iastToEnglish } from './translations.js'

const LANG_OPTIONS = [
  { code: 'en', label: 'English',    englishName: null,         beta: false, defaultScript: 'iast'       },
  { code: 'bn', label: 'বাংলা',     englishName: 'Bengali',    beta: true,  defaultScript: 'bengali'    },
  { code: 'de', label: 'Deutsch',    englishName: 'German',     beta: true,  defaultScript: 'iast'       },
  { code: 'es', label: 'Español',    englishName: 'Spanish',    beta: true,  defaultScript: 'iast'       },
  { code: 'fr', label: 'Français',   englishName: 'French',     beta: true,  defaultScript: 'iast'       },
  { code: 'gu', label: 'ગુજરાતી',    englishName: 'Gujarati',   beta: true,  defaultScript: 'gujarati'   },
  { code: 'hi', label: 'हिन्दी',      englishName: 'Hindi',      beta: true,  defaultScript: 'devanagari' },
  { code: 'it', label: 'Italiano',   englishName: 'Italian',    beta: true,  defaultScript: 'iast'       },
  { code: 'ja', label: '日本語',      englishName: 'Japanese',   beta: true,  defaultScript: 'iast'       },
  { code: 'kn', label: 'ಕನ್ನಡ',       englishName: 'Kannada',    beta: true,  defaultScript: 'kannada'    },
  { code: 'ml', label: 'മലയാളം',      englishName: 'Malayalam',  beta: true,  defaultScript: 'malayalam'  },
  { code: 'mr', label: 'मराठी',       englishName: 'Marathi',    beta: true,  defaultScript: 'devanagari' },
  { code: 'ne', label: 'नेपाली',    englishName: 'Nepali',     beta: true,  defaultScript: 'devanagari' },
  { code: 'pt', label: 'Português',  englishName: 'Portuguese', beta: true,  defaultScript: 'iast'       },
  { code: 'ru', label: 'Русский',    englishName: 'Russian',    beta: true,  defaultScript: 'iast'       },
  { code: 'ta', label: 'தமிழ்',       englishName: 'Tamil',      beta: true,  defaultScript: 'tamil'      },
  { code: 'te', label: 'తెలుగు',      englishName: 'Telugu',     beta: true,  defaultScript: 'telugu'     },
]
import { Globe, Plane, PenLine, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'

const { sections, deities } = data
const circuitSections = sections.filter(s => s.type === 'circuit')

// Native-numeral helper: digit-by-digit map — browser-independent, works for all Indian scripts
const NUMERAL_DIGITS = {
  hi: ['०','१','२','३','४','५','६','७','८','९'],
  mr: ['०','१','२','३','४','५','६','७','८','९'],
  gu: ['૦','૧','૨','૩','૪','૫','૬','૭','૮','૯'],
  kn: ['೦','೧','೨','೩','೪','೫','೬','೭','೮','೯'],
  ta: ['௦','௧','௨','௩','௪','௫','௬','௭','௮','௯'],
  te: ['౦','౧','౨','౩','౪','౫','౬','౭','౮','౯'],
  ml: ['൦','൧','൨','൩','൪','൫','൬','൭','൮','൯'],
  ja: ['〇','一','二','三','四','五','六','七','八','九'],
  ne: ['०','१','२','३','४','५','६','७','८','९'],
  bn: ['০','১','২','৩','৪','৫','৬','৭','৮','৯'],
}
function localNum(n, uiLang) {
  const digits = NUMERAL_DIGITS[uiLang]
  if (!digits) return n
  return String(n).replace(/[0-9]/g, d => digits[+d])
}
// Returns '.' for Western scripts, '' for Indic/Japanese where a trailing dot looks wrong
function numDot(uiLang) {
  return ['en','fr','es','it','pt','de','ru'].includes(uiLang) ? '.' : ''
}


// Script variants for section-level Sanskrit metadata (chakraSvamini, yoginiType, chakreshvari)
// Keyed by circuitNumber → field → script.  Augments what is in the JSON (which has only IAST + Devanagari).
const SECTION_SCRIPTS = {
  1: {
    chakraSvamini: {
      gujarati:  'ત્રૈલોક્યમોહન ચક્રસ્વામિની',
      kannada:   'ತ್ರೈಲೋಕ್ಯಮೋಹನ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'ത്രൈലോക്യമോഹന ചക്രസ്വാമിനീ',
      tamil:     'த்ரைலோக்யமோஹந சக்ரஸ்வாமினீ',
      telugu:    'త్రైలోక్యమోహన చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'પ્રકટ-યોગિની',
      kannada:   'ಪ್ರಕಟಯೋಗಿನೀ',
      malayalam: 'പ്രകടയോഗിനീ',
      tamil:     'ப்ரகடயோகினீ',
      telugu:    'ప్రకటయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરે',
      kannada:   'ತ್ರಿಪುರೇ',
      malayalam: 'ത്രിപുരേ',
      tamil:     'த்ரிபுரே',
      telugu:    'త్రిపురే',
    },
  },
  2: {
    chakraSvamini: {
      gujarati:  'સર્વાશાપરિપૂરક ચક્રસ્વામિની',
      kannada:   'ಸರ್ವಾಶಾಪರಿಪೂರಕ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവാശാപരിപൂരക ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வாஶாபரிபூரக சக்ரஸ்வாமினீ',
      telugu:    'సర్వాశాపరిపూరక చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'ગુપ્ત-યોગિની',
      kannada:   'ಗುಪ್ತಯೋಗಿನೀ',
      malayalam: 'ഗുപ്തയോഗിനീ',
      tamil:     'குப்தயோகினீ',
      telugu:    'గుప్తయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરેશી',
      kannada:   'ತ್ರಿಪುರೇಶೀ',
      malayalam: 'ത്രിപുരേശീ',
      tamil:     'த்ரிபுரேஶீ',
      telugu:    'త్రిపురేశీ',
    },
  },
  3: {
    chakraSvamini: {
      gujarati:  'સર્વસંક્ષોભણ ચક્રસ્વામિની',
      kannada:   'ಸರ್ವಸಂಕ್ಷೋಭಣ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവസങ്ക്ഷോഭണ ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வஸங்க்ஷோபண சக்ரஸ்வாமினீ',
      telugu:    'సర్వసంక్షోభణ చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'ગુપ્તતર-યોગિની',
      kannada:   'ಗುಪ್ತತರಯೋಗಿನೀ',
      malayalam: 'ഗുപ്തതരയോഗിനീ',
      tamil:     'குப்ததரயோகினீ',
      telugu:    'గుప్తతరయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરસુંદરી',
      kannada:   'ತ್ರಿಪುರಸುಂದರೀ',
      malayalam: 'ത്രിപുരസുന്ദരീ',
      tamil:     'த்ரிபுரஸுந்தரீ',
      telugu:    'త్రిపురసుందరీ',
    },
  },
  4: {
    chakraSvamini: {
      gujarati:  'સર્વસૌભાગ્યદાયક ચક્રસ્વામિની',
      kannada:   'ಸರ್ವಸೌಭಾಗ್ಯದಾಯಕ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവസൗഭാഗ്യദായക ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வஸௌபாக்யதாயக சக்ரஸ்வாமினீ',
      telugu:    'సర్వసౌభాగ్యదాయక చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'સમ્પ્રદાય-યોગિની',
      kannada:   'ಸಂಪ್ರದಾಯಯೋಗಿನೀ',
      malayalam: 'സമ്പ്രദായയോഗിനീ',
      tamil:     'ஸம்ப்ரதாயயோகினீ',
      telugu:    'సంప్రదాయయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરવાસિની',
      kannada:   'ತ್ರಿಪುರವಾಸಿನೀ',
      malayalam: 'ത്രിപുരവാസിനീ',
      tamil:     'த்ரிபுரவாஸினீ',
      telugu:    'త్రిపురవాసినీ',
    },
  },
  5: {
    chakraSvamini: {
      gujarati:  'સર્વાર્થસાધક ચક્રસ્વામિની',
      kannada:   'ಸರ್ವಾರ್ಥಸಾಧಕ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവാർഥസാധക ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வார்தஸாதக சக்ரஸ்வாமினீ',
      telugu:    'సర్వార్థసాధక చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'કુલોત્તીર્ણ-યોગિની',
      kannada:   'ಕುಲೋತ್ತೀರ್ಣಯೋಗಿನೀ',
      malayalam: 'കുലോത്തീർണ്ണയോഗിനീ',
      tamil:     'குலோத்தீர்ணயோகினீ',
      telugu:    'కులోత్తీర్ణయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરાશ્રીઃ',
      kannada:   'ತ್ರಿಪುರಾಶ್ರೀಃ',
      malayalam: 'ത്രിപുരാശ്രീഃ',
      tamil:     'த்ரிபுராஶ்ரீஃ',
      telugu:    'త్రిపురాశ్రీః',
    },
  },
  6: {
    chakraSvamini: {
      gujarati:  'સર્વરક્ષાકર ચક્રસ્વામિની',
      kannada:   'ಸರ್ವರಕ್ಷಾಕರ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവരക്ഷാകര ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வரக்ஷாகர சக்ரஸ்வாமினீ',
      telugu:    'సర్వరక్షాకర చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'નિગર્ભ-યોગિની',
      kannada:   'ನಿಗರ್ಭಯೋಗಿನೀ',
      malayalam: 'നിഗർഭയോഗിനീ',
      tamil:     'நிகர்பயோகினீ',
      telugu:    'నిగర్భయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરમાલિની',
      kannada:   'ತ್ರಿಪುರಮಾಲಿನೀ',
      malayalam: 'ത്രിപുരമാലിനീ',
      tamil:     'த்ரிபுரமாலினீ',
      telugu:    'త్రిపురమాలినీ',
    },
  },
  7: {
    chakraSvamini: {
      gujarati:  'સર્વરોગહર ચક્રસ્વામિની',
      kannada:   'ಸರ್ವರೋಗಹರ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവരോഗഹര ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வரோகஹர சக்ரஸ்வாமினீ',
      telugu:    'సర్వరోగహర చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'રહસ્ય-યોગિની',
      kannada:   'ರಹಸ್ಯಯೋಗಿನೀ',
      malayalam: 'രഹസ്യയോഗിനീ',
      tamil:     'ரஹஸ்யயோகினீ',
      telugu:    'రహస్యయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરસિદ્ધે',
      kannada:   'ತ್ರಿಪುರಸಿದ್ಧೇ',
      malayalam: 'ത്രിപുരസിദ്ധേ',
      tamil:     'த்ரிபுரஸித்தே',
      telugu:    'త్రిపురసిద్ధే',
    },
  },
  8: {
    chakraSvamini: {
      gujarati:  'સર્વસિદ્ધિપ્રદ ચક્રસ્વામિની',
      kannada:   'ಸರ್ವಸಿದ್ಧಿಪ್ರದ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവസിദ്ധിപ്രദ ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வஸித்திப்ரத சக்ரஸ்வாமினீ',
      telugu:    'సర్వసిద్ధిప్రద చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'અતિ-રહસ્ય-યોગિની',
      kannada:   'ಅತಿರಹಸ್ಯಯೋಗಿನೀ',
      malayalam: 'അതിരഹസ്യയോഗിനീ',
      tamil:     'அதிரஹஸ்யயோகினீ',
      telugu:    'అతిరహస్యయోగినీ',
    },
    chakreshvari: {
      gujarati:  'ત્રિપુરાંબા',
      kannada:   'ತ್ರಿಪುರಾಂಬಾ',
      malayalam: 'ത്രിപുരാംബാ',
      tamil:     'த்ரிபுராம்பா',
      telugu:    'త్రిపురాంబా',
    },
  },
  9: {
    chakraSvamini: {
      gujarati:  'સર્વાનંદ-મય ચક્રસ્વામિની',
      kannada:   'ಸರ್ವಾನಂದಮಯ ಚಕ್ರಸ್ವಾಮಿನೀ',
      malayalam: 'സർവാനന്ദമയ ചക്രസ്വാമിനീ',
      tamil:     'ஸர்வானந்தமய சக்ரஸ்வாமினீ',
      telugu:    'సర్వానందమయ చక్రస్వామినీ',
    },
    yoginiType: {
      gujarati:  'પરા-પર-રહસ્ય-યોગિની',
      kannada:   'ಪರಾಪರರಹಸ್ಯಯೋಗಿನೀ',
      malayalam: 'പരാപരരഹസ്യയോഗിനീ',
      tamil:     'பராபரரஹஸ்யயோகினீ',
      telugu:    'పరాపరరహస్యయోగినీ',
    },
    chakreshvari: {
      gujarati:  'મહા-ત્રિપુરસુંદરી',
      kannada:   'ಮಹಾತ್ರಿಪುರಸುಂದರೀ',
      malayalam: 'മഹാത്രിപുരസുന്ദരീ',
      tamil:     'மஹாத்ரிபுரஸுந்தரீ',
      telugu:    'మహాత్రిపురసుందరీ',
    },
  },
}


// Kana for section-level names — derived from deity JSON data at module load
const SECTION_KANA = (() => {
  const cakDeities = deities.filter(d => d.sectionId === 'chakreshvari')
  const map = {}
  for (let c = 1; c <= 9; c++) {
    const sv = deities.find(d => d.sectionId === `circuit-${c}` && d.role === 'chakraSvamini')
    const yo = deities.find(d => d.sectionId === `circuit-${c}` && d.role === 'yoginiType')
    const ck = cakDeities.find(d => d.sequenceInSection === c)
    const svKana = sv?.scripts?.kana ?? null
    map[c] = {
      chakraSvamini: svKana,
      yoginiType:    yo?.scripts?.kana ?? null,
      chakreshvari:  ck?.scripts?.kana ?? null,
      avarana:       svKana ? svKana.replace(/・チャクラスヴァーミニー$/, '・チャクラ') : null,
    }
  }
  return map
})()

// Russian (Cyrillic) section metadata — mirrors the shape of SECTION_KANA
const SECTION_RU = {
  1: { avarana: 'Трайлокья-Мохана-Чакра',          chakraSvamini: 'Трайлокья-Мохана-Чакра-Свамини',          yoginiType: 'Праката Йогини',              chakreshvari: 'Трипура'               },
  2: { avarana: 'Сарва-Аша-Парипурака-Чакра',       chakraSvamini: 'Сарваша-Парипурака-Чакра-Свамини',        yoginiType: 'Гупта Йогини',                chakreshvari: 'Трипурешвари'          },
  3: { avarana: 'Сарва-Санкшобхана-Чакра',          chakraSvamini: 'Сарва-Санкшобхана-Чакра-Свамини',         yoginiType: 'Гупта-Тара Йогини',           chakreshvari: 'Трипура Сундари'       },
  4: { avarana: 'Сарва-Саубхагьядайака-Чакра',      chakraSvamini: 'Сарва-Саубхагьядайака-Чакра-Свамини',     yoginiType: 'Сампрадайя Йогини',           chakreshvari: 'Трипура Васини'        },
  5: { avarana: 'Сарва-Артха-Садхака-Чакра',        chakraSvamini: 'Сарвартха-Садхака-Чакра-Свамини',         yoginiType: 'Кулоттирна Йогини',           chakreshvari: 'Трипура Шри'           },
  6: { avarana: 'Сарва-Ракшакара-Чакра',            chakraSvamini: 'Сарва-Ракшакара-Чакра-Свамини',           yoginiType: 'Нигарбха Йогини',             chakreshvari: 'Трипура Малини'        },
  7: { avarana: 'Сарва-Рогахара-Чакра',             chakraSvamini: 'Сарва-Рогахара-Чакра-Свамини',            yoginiType: 'Рахасья Йогини',              chakreshvari: 'Трипура Сиддхе'        },
  8: { avarana: 'Сарва-Сиддхипрада-Чакра',          chakraSvamini: 'Сарва-Сиддхипрада-Чакра-Свамини',         yoginiType: 'Ати-Рахасья Йогини',          chakreshvari: 'Трипурамба'            },
  9: { avarana: 'Сарва-Анандамайя-Чакра',           chakraSvamini: 'Сарва-Анандамайя-Чакра-Свамини',          yoginiType: 'Пара-Пара-Рахасья Йогини',    chakreshvari: 'Маха-Трипура-Сундари'  },
}

// Bengali script section metadata
const SECTION_BN = {
  1: { avarana: 'ত্রৈলোক্য মোহন চক্র',          chakraSvamini: 'ত্রৈলোক্য মোহন চক্র স্বামিনী',          yoginiType: 'প্রকট যোগিনী',            chakreshvari: 'ত্রিপুরা'                    },
  2: { avarana: 'সর্বাশা পরিপূরক চক্র',          chakraSvamini: 'সর্বাশা পরিপূরক চক্র স্বামিনী',          yoginiType: 'গুপ্ত যোগিনী',            chakreshvari: 'ত্রিপুরেশী'                   },
  3: { avarana: 'সর্ব সংক্ষোভণ চক্র',            chakraSvamini: 'সর্ব সংক্ষোভণ চক্র স্বামিনী',            yoginiType: 'গুপ্ততর যোগিনী',          chakreshvari: 'ত্রিপুরা সুন্দরী'            },
  4: { avarana: 'সর্ব সৌভাগ্যদায়ক চক্র',         chakraSvamini: 'সর্ব সৌভাগ্যদায়ক চক্র স্বামিনী',         yoginiType: 'সম্প্রদায় যোগিনী',         chakreshvari: 'ত্রিপুরা বাসিনী'             },
  5: { avarana: 'সর্বার্থ সাধক চক্র',             chakraSvamini: 'সর্বার্থ সাধক চক্র স্বামিনী',             yoginiType: 'কুলোত্তীর্ণ যোগিনী',       chakreshvari: 'ত্রিপুরা শ্রী'               },
  6: { avarana: 'সর্ব রক্ষাকর চক্র',              chakraSvamini: 'সর্ব রক্ষাকর চক্র স্বামিনী',              yoginiType: 'নিগর্ভ যোগিনী',           chakreshvari: 'ত্রিপুরা মালিনী'             },
  7: { avarana: 'সর্ব রোগহর চক্র',               chakraSvamini: 'সর্ব রোগহর চক্র স্বামিনী',               yoginiType: 'রহস্য যোগিনী',            chakreshvari: 'ত্রিপুরা সিদ্ধে'             },
  8: { avarana: 'সর্ব সিদ্ধিপ্রদ চক্র',            chakraSvamini: 'সর্ব সিদ্ধিপ্রদ চক্র স্বামিনী',            yoginiType: 'অতি রহস্য যোগিনী',         chakreshvari: 'ত্রিপুরাম্বা'                },
  9: { avarana: 'সর্ব আনন্দময় চক্র',              chakraSvamini: 'সর্ব আনন্দময় চক্র স্বামিনী',              yoginiType: 'পর পর রহস্য যোগিনী',       chakreshvari: 'মহা ত্রিপুরা সুন্দরী'        },
}

// Gujarati script section metadata
const SECTION_GU = {
  1: { avarana: 'ત્રૈલોક્યમોહન ચક્ર',         chakraSvamini: 'ત્રૈલોક્યમોહન ચક્રસ્વામિની',         yoginiType: 'પ્રકટ-યોગિની',            chakreshvari: 'ત્રિપુરે'             },
  2: { avarana: 'સર્વાશાપરિપૂરક ચક્ર',         chakraSvamini: 'સર્વાશાપરિપૂરક ચક્રસ્વામિની',         yoginiType: 'ગુપ્ત-યોગિની',            chakreshvari: 'ત્રિપુરેશી'            },
  3: { avarana: 'સર્વસંક્ષોભણ ચક્ર',           chakraSvamini: 'સર્વસંક્ષોભણ ચક્રસ્વામિની',           yoginiType: 'ગુપ્તતર-યોગિની',          chakreshvari: 'ત્રિપુરસુંદરી'        },
  4: { avarana: 'સર્વસૌભાગ્યદાયક ચક્ર',        chakraSvamini: 'સર્વસૌભાગ્યદાયક ચક્રસ્વામિની',        yoginiType: 'સમ્પ્રદાય-યોગિની',        chakreshvari: 'ત્રિપુરવાસિની'        },
  5: { avarana: 'સર્વાર્થસાધક ચક્ર',            chakraSvamini: 'સર્વાર્થસાધક ચક્રસ્વામિની',            yoginiType: 'કુલોત્તીર્ણ-યોગિની',     chakreshvari: 'ત્રિપુરાશ્રીઃ'         },
  6: { avarana: 'સર્વરક્ષાકર ચક્ર',             chakraSvamini: 'સર્વરક્ષાકર ચક્રસ્વામિની',             yoginiType: 'નિગર્ભ-યોગિની',           chakreshvari: 'ત્રિપુરમાલિની'        },
  7: { avarana: 'સર્વરોગહર ચક્ર',              chakraSvamini: 'સર્વરોગહર ચક્રસ્વામિની',              yoginiType: 'રહસ્ય-યોગિની',            chakreshvari: 'ત્રિપુરસિદ્ધે'        },
  8: { avarana: 'સર્વસિદ્ધિપ્રદ ચક્ર',           chakraSvamini: 'સર્વસિદ્ધિપ્રદ ચક્રસ્વામિની',           yoginiType: 'અતિ-રહસ્ય-યોગિની',       chakreshvari: 'ત્રિપુરાંબા'          },
  9: { avarana: 'સર્વાનંદ-મય ચક્ર',             chakraSvamini: 'સર્વાનંદ-મય ચક્રસ્વામિની',             yoginiType: 'પરા-પર-રહસ્ય-યોગિની',    chakreshvari: 'મહા-ત્રિપુરસુંદરી'    },
}

const YOGINI_SECRECY = {
  'Prakata Yogini':           'secrecy.prakata',
  'Gupta Yogini':             'secrecy.gupta',
  'Guptatara Yogini':         'secrecy.guptatara',
  'Sampradaya Yogini':        'secrecy.sampradaya',
  'Kulottirna Yogini':        'secrecy.kulottirna',
  'Nigarbha Yogini':          'secrecy.nigarbha',
  'Rahasya Yogini':           'secrecy.rahasya',
  'Ati Rahasya Yogini':       'secrecy.ati_rahasya',
  'Para Para Rahasya Yogini': 'secrecy.para_para',
}

const TABS = [
  { id: 'intro',        trKey: 'tab.intro',    navLabel: 'Welcome and Introduction',      navLabelEn: 'Welcome and Introduction',  navLabelDev: 'Welcome and Introduction', footerLabel: 'Introduction' },
  { id: 'h-explore-memorise', heading: 'EXPLORE AND MEMORISE', trKey: 'heading.explore' },
  { id: 'nyasa', trKey: 'nav.nyasa',
    navLabel:    'nyāsāṅga-devatāḥ',         navLabelEn: 'Nyāsa Deities',
    navLabelDev: 'न्यासांगदेवताः',            navLabelGu: 'ન્યાસાંગદેવતાઃ',
    navLabelTe:  'న్యాసాంగదేవతాః',           navLabelTa: 'ந்யாஸாங்கதேவதாஃ',
    navLabelKn:  'ನ್ಯಾಸಾಂಗದೇವತಾಃ',           navLabelMl: 'ന്യാസാംഗദേവതാഃ',
    footerLabel: 'Nyāsa Deities' },
  { id: 'inner', trKey: 'nav.inner',
    navLabel:    'tithi-nitya-devatāḥ',       navLabelEn: 'Tithi Nitya Deities',
    navLabelDev: 'तिथिनित्यदेवताः',            navLabelGu: 'તિથિનિત્યદેવતાઃ',
    navLabelTe:  'తిథినిత్యదేవతాః',           navLabelTa: 'திதிநித்யதேவதாஃ',
    navLabelKn:  'ತಿಥಿನಿತ್ಯದೇವತಾಃ',           navLabelMl: 'തിഥിനിത്യദേവതാഃ',
    footerLabel: 'Tithi Nitya' },
  { id: 'gurava', trKey: 'nav.gurava',
    navLabel:    'guravaḥ',                   navLabelEn: 'Gurus',
    navLabelDev: 'गुरवः',                     navLabelGu: 'ગુરવઃ',
    navLabelTe:  'గురవః',                     navLabelTa: 'குரவஃ',
    navLabelKn:  'ಗುರವಃ',                     navLabelMl: 'ഗുരവഃ',
    footerLabel: 'Guravaḥ' },
  { id: 'bhupura', trKey: 'av.1',
    navLabel:    '1. cakra-prathamāvaraṇa-devatāḥ', navLabelEn: '1st Enclosure Deities',
    navLabelDev: '१. चक्रप्रथमावरणदेवताः',    navLabelGu: '૧. ચક્રપ્રથમાવરણદેવતાઃ',
    navLabelTe:  '౧. చక్రప్రథమావరణదేవతాః',   navLabelTa: '௧. சக்ரப்ரதமாவரணதேவதாஃ',
    navLabelKn:  '೧. ಚಕ್ರಪ್ರಥಮಾವರಣದೇವತಾಃ',   navLabelMl: '൧. ചക്രപ്രഥമാവരണദേവതാഃ',
    footerLabel: '1st Āvaraṇa' },
  { id: 'c2', trKey: 'av.2',
    navLabel:    '2. cakra-dvitīyāvaraṇa-devatāḥ',  navLabelEn: '2nd Enclosure Deities',
    navLabelDev: '२. चक्रद्वितीयावरणदेवताः',   navLabelGu: '૨. ચક્રદ્વિતીયાવરણદેવતાઃ',
    navLabelTe:  '౨. చక్రద్వితీయావరణదేవతాః',  navLabelTa: '௨. சக்ரத்விதீயாவரணதேவதாஃ',
    navLabelKn:  '೨. ಚಕ್ರದ್ವಿತೀಯಾವರಣದೇವತಾಃ',  navLabelMl: '൨. ചക്രദ്വിതീയാവരണദേവതാഃ',
    footerLabel: '2nd Āvaraṇa' },
  { id: 'c3', trKey: 'av.3',
    navLabel:    '3. cakra-tṛtīyāvaraṇa-devatāḥ',   navLabelEn: '3rd Enclosure Deities',
    navLabelDev: '३. चक्रतृतीयावरणदेवताः',    navLabelGu: '૩. ચક્રતૃતીયાવરણદેવતાઃ',
    navLabelTe:  '౩. చక్రతృతీయావరణదేవతాః',   navLabelTa: '௩. சக்ரத்ருதீயாவரணதேவதாஃ',
    navLabelKn:  '೩. ಚಕ್ರತೃತೀಯಾವರಣದೇವತಾಃ',   navLabelMl: '൩. ചക്രതൃതീയാവരണദേവതാഃ',
    footerLabel: '3rd Āvaraṇa' },
  { id: 'c4', trKey: 'av.4',
    navLabel:    '4. cakra-caturthāvaraṇa-devatāḥ',  navLabelEn: '4th Enclosure Deities',
    navLabelDev: '४. चक्रचतुर्थावरणदेवताः',   navLabelGu: '૪. ચક્રચતુર્થાવરણદેવતાઃ',
    navLabelTe:  '౪. చక్రచతుర్థావరణదేవతాః',   navLabelTa: '௪. சக்ரசதுர்தாவரணதேவதாஃ',
    navLabelKn:  '೪. ಚಕ್ರಚತುರ್ಥಾವರಣದೇವತಾಃ',   navLabelMl: '൪. ചക്രചതുർഥാവരണദേവതാഃ',
    footerLabel: '4th Āvaraṇa' },
  { id: 'c5', trKey: 'av.5',
    navLabel:    '5. cakra-pañcamāvaraṇa-devatāḥ',   navLabelEn: '5th Enclosure Deities',
    navLabelDev: '५. चक्रपञ्चमावरणदेवताः',    navLabelGu: '૫. ચક્રપઞ્ચમાવરણદેવતાઃ',
    navLabelTe:  '౫. చక్రపంచమావరణదేవతాః',    navLabelTa: '௫. சக்ரபஞ்சமாவரணதேவதாஃ',
    navLabelKn:  '೫. ಚಕ್ರಪಂಚಮಾವರಣದೇವತಾಃ',    navLabelMl: '൫. ചക്രപഞ്ചമാവരണദേവതാഃ',
    footerLabel: '5th Āvaraṇa' },
  { id: 'c6', trKey: 'av.6',
    navLabel:    '6. cakra-ṣaṣṭhāvaraṇa-devatāḥ',   navLabelEn: '6th Enclosure Deities',
    navLabelDev: '६. चक्रषष्ठावरणदेवताः',     navLabelGu: '૬. ચક્રષષ્ઠાવરણદેવતાઃ',
    navLabelTe:  '౬. చక్రషష్ఠావరణదేవతాః',    navLabelTa: '௬. சக்ரஷஷ்டாவரணதேவதாஃ',
    navLabelKn:  '೬. ಚಕ್ರಷಷ್ಠಾವರಣದೇವತಾಃ',    navLabelMl: '൬. ചക്രഷഷ്ഠാവരണദേവതാഃ',
    footerLabel: '6th Āvaraṇa' },
  { id: 'c7', trKey: 'av.7',
    navLabel:    '7. cakra-saptamāvaraṇa-devatāḥ',   navLabelEn: '7th Enclosure Deities',
    navLabelDev: '७. चक्रसप्तमावरणदेवताः',    navLabelGu: '૭. ચક્રસપ્તમાવરણદેવતાઃ',
    navLabelTe:  '౭. చక్రసప్తమావరణదేవతాః',   navLabelTa: '௭. சக்ரஸப்தமாவரணதேவதாஃ',
    navLabelKn:  '೭. ಚಕ್ರಸಪ್ತಮಾವರಣದೇವತಾಃ',   navLabelMl: '൭. ചക്രസപ്തമാവരണദേവതാഃ',
    footerLabel: '7th Āvaraṇa' },
  { id: 'c8', trKey: 'av.8',
    navLabel:    '8. cakra-aṣṭamāvaraṇa-devatāḥ',    navLabelEn: '8th Enclosure Deities',
    navLabelDev: '८. चक्राष्टमावरणदेवताः',    navLabelGu: '૮. ચક્રાષ્ટમાવરણદેવતાઃ',
    navLabelTe:  '౮. చక్రాష్టమావరణదేవతాః',   navLabelTa: '௮. சக்ராஷ்டமாவரணதேவதாஃ',
    navLabelKn:  '೮. ಚಕ್ರಾಷ್ಟಮಾವರಣದೇವತಾಃ',   navLabelMl: '൮. ചക്രാഷ്ടമാവരണദേവതാഃ',
    footerLabel: '8th Āvaraṇa' },
  { id: 'c9', trKey: 'av.9',
    navLabel:    '9. cakra-navamāvaraṇa-devatāḥ',    navLabelEn: '9th Enclosure Deity',
    navLabelDev: '९. चक्रनवमावरणदेवताः',      navLabelGu: '૯. ચક્રનવમાવરણદેવતાઃ',
    navLabelTe:  '౯. చక్రనవమావరణదేవతాః',    navLabelTa: '௯. சக்ரநவமாவரணதேவதாஃ',
    navLabelKn:  '೯. ಚಕ್ರನವಮಾವರಣದೇವತಾಃ',    navLabelMl: '൯. ചക്രനവമാവരണദേവതാഃ',
    footerLabel: '9th Āvaraṇa' },
  { id: 'chakreshvari', trKey: 'nav.nc',
    navLabel:    'navacakrēśvarī nāmāni',     navLabelEn: 'Names of the Nine Chakras',
    navLabelDev: 'नवचक्रेश्वरी नामानि',        navLabelGu: 'નવચક્રેશ્વરી નામાનિ',
    navLabelTe:  'నవచక్రేశ్వరీ నామాని',       navLabelTa: 'நவசக்ரேஶ்வரீ நாமானி',
    navLabelKn:  'ನವಚಕ್ರೇಶ್ವರೀ ನಾಮಾನಿ',       navLabelMl: 'നവചക്രേശ്വരീ നാമാനി',
    footerLabel: 'Nava Chakreshvarī' },
  { id: 'closing', trKey: 'nav.closing',
    navLabel:    'śrīdevī-viśēṣaṇāni',        navLabelEn: 'Śrīdevī Epithets and Namaskāra',
    navLabelDev: 'श्रीदेवी विशेषणानि',         navLabelGu: 'શ્રીદેવી વિશેષણાનિ',
    navLabelTe:  'శ్రీదేవీ విశేషణాని',         navLabelTa: 'ஶ்ரீதேவீ விஶேஷணானி',
    navLabelKn:  'ಶ್ರೀದೇವೀ ವಿಶೇಷಣಾನಿ',         navLabelMl: 'ശ്രീദേവീ വിശേഷണാനി',
    footerLabel: 'Śrīdevī Epithets' },
  { id: 'h-spotcheck',  heading: 'DRILLS AND MEMORY MAP', trKey: 'heading.spot' },
  { id: 'locate',       trKey: 'tab.locate',    navLabel: 'Location Match', navLabelEn: 'Location Match', navLabelDev: 'Location Match', footerLabel: 'Location Match' },
  { id: 'spotcheck',    trKey: 'tab.spotcheck', navLabel: 'Spot Check',   navLabelEn: 'Spot Check',   navLabelDev: 'Spot Check',   footerLabel: 'Spot Check'   },
  { id: 'triangledrill', trKey: 'tab.triangledrill', navLabel: 'Triangle Drills', navLabelEn: 'Triangle Drills', navLabelDev: 'Triangle Drills', footerLabel: 'Triangle Drills' },
  { id: 'segmentdrill', trKey: 'tab.segmentdrill', navLabel: 'Segment Drills', navLabelEn: 'Segment Drills', navLabelDev: 'Segment Drills', footerLabel: 'Segment Drills' },
  { id: 'linedrill',    trKey: 'tab.linedrill', navLabel: 'Line Drills',  navLabelEn: 'Line Drills',  navLabelDev: 'Line Drills',  footerLabel: 'Line Drills'  },
  { id: 'memomap',      trKey: 'tab.memomap',   navLabel: 'Memory Map',   navLabelEn: 'Memory Map',   navLabelDev: 'Memory Map',   footerLabel: 'Memory Map'   },
  { id: 'activity-log', trKey: 'tab.actlog',    navLabel: 'Activity Log', navLabelEn: 'Activity Log', navLabelDev: 'Activity Log', footerLabel: 'Activity Log' },
  { id: 'h-references', heading: 'RESOURCES', trKey: 'heading.resources' },
  { id: 'yantra',
    navLabel:    'śrī yantra',                navLabelEn: 'Śrī Yantra',
    navLabelDev: 'श्री यन्त्र',
    navLabelTe:  'శ్రీ యన్త్ర',               navLabelTa: 'ஶ்ரீ யந்த்ர',
    navLabelKn:  'ಶ್ರೀ ಯಂತ್ರ',               navLabelMl: 'ശ്രീ യന്ത്ര',
    navLabelBn:  'শ্রী যন্ত্র',               navLabelGu: 'શ્રી યન્ત્ર',               navLabelJa: 'シュリー・ヤントラ',
    footerLabel: 'Śrī Yantra' },
  { id: 'browser',      englishOnly: true,
    navLabel:    'śrī devī khaḍgamālā stōtram', navLabelEn: 'Sri Devi Khadgamala Stotram',
    navLabelDev: 'श्री देवी खड्गमाला स्तोत्रम्',
    navLabelTe:  'శ్రీ దేవీ ఖడ్గమాలా స్తోత్రమ్', navLabelTa: 'ஶ்ரீ தேவீ கட்கமாலா ஸ்தோத்ரம்',
    navLabelKn:  'ಶ್ರೀ ದೇವೀ ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರಮ್', navLabelMl: 'ശ്രീ ദേവീ ഖഡ്ഗമാലാ സ്തോത്രം',
    navLabelBn:  'শ্রী দেবী খড়গমালা স্তোত্রম্', navLabelGu: 'શ્રી દેવી ખડ્ગમાલા સ્તોત્રમ્', navLabelJa: 'シュリー・デーヴィー・カドゥガマーラー',
    footerLabel: 'Khadgamala Stotram' },
  { id: 'references',   englishOnly: true, trKey: 'tab.references', navLabel: 'References',   navLabelEn: 'References',   navLabelDev: 'References',   footerLabel: 'References'   },
  { id: 'h-sync', heading: 'DEVICE SYNC', trKey: 'heading.sync' },
  { id: 'sync', trKey: 'tab.sync', navLabel: 'Sync', navLabelEn: 'Sync', navLabelDev: 'Sync', footerLabel: 'Sync' },
]

// Navigable tabs only (excludes heading entries — used for footer prev/next)
const NAVIGABLE_TABS = TABS.filter(t => !t.heading)

// The 14 Explore & Memorise sections — used for swipe navigation and segment bar
const EXPLORE_TAB_IDS  = ['nyasa','inner','gurava','bhupura','c2','c3','c4','c5','c6','c7','c8','c9','chakreshvari','closing']
const EXPLORE_NAV_TABS = NAVIGABLE_TABS.filter(t => EXPLORE_TAB_IDS.includes(t.id))

// Triangle/Segment/Line Drill — get the same single-panel (left nav only)
// iPad collapse hint as Spot Check and the Explore tabs (Chris, 2026-08-25).
const DRILL_TAB_IDS = ['triangledrill', 'segmentdrill', 'linedrill']

// The 5 precision-tapping drill modes — Chris, 2026-08-25: closely spaced
// dots/triangles are hard to hit accurately on a phone touchscreen, so
// mobile gets a dismissible hint nudging toward tablet/desktop + a stylus,
// or pinch-zooming if staying on mobile. Scoped to just these 5 for now.
const MOBILE_DRILL_HINT_TAB_IDS = ['spotcheck', 'locate', 'triangledrill', 'segmentdrill', 'linedrill']

// data-tour IDs for the site tour (TourGuide.jsx)
const TOUR_NAV_IDS = {
  yantra:    'nav-yantra',
  bhupura:   'nav-bhupura',
  spotcheck: 'nav-spotcheck',
  locate:    'nav-locate',
  triangledrill: 'nav-triangledrill',
  memomap:   'nav-memomap',
  browser:   'nav-browser',
}
const TOUR_HEADING_IDS = {
  'h-explore-memorise': 'heading-explore',
}

// Maps tab id → circuit number (for right-panel SectionInfo)
const TAB_TO_CIRCUIT = {
  bhupura: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7, c8: 8, c9: 9
}

// Maps circuit number → tab id (for "Go to circuit" button)
const CIRCUIT_TO_TAB = {
  1: 'bhupura', 2: 'c2', 3: 'c3', 4: 'c4', 5: 'c5', 6: 'c6', 7: 'c7', 8: 'c8', 9: 'c9'
}

// Returns dot state for a nav tab based on session results.
//   null   → never started (no dot)
//   'gold' → in progress or partial complete
//   'red'  → last completed round was 100%
function getTabDot(results, prevResults) {
  if (prevResults === null && Object.keys(results).length === 0) return null
  if (prevResults !== null && Object.values(prevResults).every(v => v === 'correct')) return 'red'
  return 'gold'
}

// ── Circuit colour palette (for region fills) ─────────────────────────────────

const CIRCUIT_COLOURS = {
  c1: 'rgba(201,168,76,0.28)',
  c2: 'rgba(210,100,120,0.28)',
  c3: 'rgba(100,150,220,0.28)',
  c4: 'rgba(160,100,200,0.28)',
  c5: 'rgba(80,180,130,0.28)',
  c6: 'rgba(210,140,70,0.28)',
  c7: 'rgba(70,180,200,0.28)',
  c8: 'rgba(220,70,70,0.28)',
  c9: 'rgba(255,220,80,0.60)',
}

// ── Region info lookup — maps clickable IDs → { iast, label } ─────────────────

const REGION_INFO = (() => {
  const info = {}

  circuitSections.forEach(s => {
    info[`c${s.circuitNumber}`] = {
      iast:  s.avaranaIast || s.avarana,
      label: `Circuit ${s.circuitNumber}`,
    }
  })

  deities
    .filter(e => e.sectionId === 'circuit-1' && e.sequenceInSection >= 1 && e.sequenceInSection <= 28)
    .forEach(e => {
      info[`bhupura-${String(e.sequenceInSection).padStart(2,'0')}`] = {
        iast:  e.scripts.iast,
        label: `C1 · ${e.sequenceInSection}`,
      }
    })

  deities
    .filter(e => e.sectionId === 'circuit-2' && e.sequenceInSection >= 1 && e.sequenceInSection <= 16)
    .forEach(e => {
      info[`petal-c2-${String(e.sequenceInSection).padStart(2,'0')}`] = {
        iast:  e.scripts.iast,
        label: `C2 · ${e.sequenceInSection}`,
      }
    })

  deities
    .filter(e => e.sectionId === 'circuit-3' && e.sequenceInSection >= 1 && e.sequenceInSection <= 8)
    .forEach(e => {
      info[`petal-c3-${String(e.sequenceInSection).padStart(2,'0')}`] = {
        iast:  e.scripts.iast,
        label: `C3 · ${e.sequenceInSection}`,
      }
    })

  ;[[4,14],[5,10],[6,10],[7,8]].forEach(([c, max]) => {
    deities
      .filter(e => e.sectionId === `circuit-${c}` && e.sequenceInSection >= 1 && e.sequenceInSection <= max)
      .forEach(e => {
        info[`tri-c${c}-${String(e.sequenceInSection).padStart(2,'0')}`] = {
          iast:  e.scripts.iast,
          label: `C${c} · ${e.sequenceInSection}`,
        }
      })
  })

  const c8Names = deities
    .filter(e => e.sectionId === 'circuit-8' && e.sequenceInSection >= 1 && e.sequenceInSection <= 7)
    .map(e => e.scripts.iast)
  if (c8Names.length) {
    info['tri-c8-01'] = { iast: c8Names.join(' · '), label: 'C8' }
  }

  return info
})()

function regionColour(id) {
  if (id.startsWith('bhupura-'))  return CIRCUIT_COLOURS.c1
  if (id.startsWith('petal-c2-')) return CIRCUIT_COLOURS.c2
  if (id.startsWith('petal-c3-')) return CIRCUIT_COLOURS.c3
  if (id.startsWith('tri-c4-'))   return CIRCUIT_COLOURS.c4
  if (id.startsWith('tri-c5-'))   return CIRCUIT_COLOURS.c5
  if (id.startsWith('tri-c6-'))   return CIRCUIT_COLOURS.c6
  if (id.startsWith('tri-c7-'))   return CIRCUIT_COLOURS.c7
  if (id.startsWith('tri-c8-'))   return CIRCUIT_COLOURS.c8
  return CIRCUIT_COLOURS[id] ?? 'rgba(201,168,76,0.25)'
}

// ── Model yantra colour themes ──────────────────────────────────────────────
//
// A "theme" is a compact, one-colour-per-band palette (16 keys) rather than
// the ~60 individual region ids the SVG actually wants (per-petal, per-
// triangle). buildFills() expands a compact palette into that full shape —
// the same Array.from-per-circuit pattern the original hand-written
// MODEL_YANTRA_FILLS used, just parameterised so new themes are cheap to add.
//
// Compact palette keys:
//   c1Outer, c1Mid, c1Inner   — the three bhupura bands
//   outerRings                — ring zone between bhupura and C2 petals
//   c2Ring, c2Petals          — C2 (16-petal lotus) background ring + petals
//   c3Ring, c3Petals          — C3 (8-petal lotus) background ring + petals
//   innerCircle               — disc behind circuits 4–9
//   c4, c5, c6, c7            — triangle rings (uniform colour per ring)
//   c8                         — primary triangle (its two small background
//                                sub-fills follow innerCircle, same as the
//                                rest of the "triangles background" area)
//   c9                        — bindu

function buildFills(p) {
  return {
    'c1-outer':    p.c1Outer,
    'c1-mid':      p.c1Mid,
    'c1-inner':    p.c1Inner,
    'outer-rings': p.outerRings,
    'c2':          p.c2Ring,
    ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
      [`petal-c2-${String(i + 1).padStart(2, '0')}`, p.c2Petals]
    )),
    'c3':          p.c3Ring,
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
      [`petal-c3-${String(i + 1).padStart(2, '0')}`, p.c3Petals]
    )),
    'inner-circle': p.innerCircle,
    ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
      [`tri-c4-${String(i + 1).padStart(2, '0')}`, p.c4]
    )),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c5-${String(i + 1).padStart(2, '0')}`, p.c5]
    )),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
      [`tri-c6-${String(i + 1).padStart(2, '0')}`, p.c6]
    )),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
      [`tri-c7-${String(i + 1).padStart(2, '0')}`, p.c7]
    )),
    'tri-c8-01':    p.c8,
    'tri-c8-bg-01': p.innerCircle,
    'tri-c8-bg-02': p.innerCircle,
    'c9':           p.c9,
  }
}

const YANTRA_THEMES = [
  {
    id: 'traditional', label: 'Traditional',
    accentColor: '#c9a84c', bgColor: '#0f0805',
    palette: {
      c1Outer: 'rgba(201,168,76,0.85)', c1Mid: 'rgba(255,235,60,0.85)', c1Inner: 'rgba(80,200,80,0.85)',
      outerRings: 'rgba(215,220,228,0.90)',
      c2Ring: 'rgba(201,168,76,0.85)', c2Petals: 'rgba(255,235,60,0.85)',
      c3Ring: 'rgba(215,220,228,0.90)', c3Petals: 'rgba(235,45,45,0.92)',
      innerCircle: 'rgba(255,255,255,1.0)',
      c4: 'rgba(35,65,185,0.92)', c5: 'rgba(235,45,45,0.92)', c6: 'rgba(20,20,20,0.92)', c7: 'rgba(50,170,80,0.90)',
      c8: 'rgba(255,230,50,0.92)',
      c9: 'rgba(235,45,45,0.95)',
    },
  },
].map(t => ({ ...t, fills: buildFills(t.palette) }))

// Kept for the unrelated click-to-fill `filledRegions` state's initial value
// (App.jsx's own region-highlight tool — see handleRegionClick) — not used
// by the Śrī Yantra page itself, which now drives off YANTRA_THEMES.
const MODEL_YANTRA_FILLS = YANTRA_THEMES[0].fills

// Seeds the "Custom" theme's default palette from Traditional — the built-in
// palettes are rgba (with alpha), the custom picker works in solid hex, so
// this drops the alpha channel rather than trying to expose it in the UI.
function rgbaToHex(rgba) {
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(rgba || '')
  if (!m) return '#c9a84c'
  const c = n => Math.max(0, Math.min(255, parseInt(n, 10))).toString(16).padStart(2, '0')
  return `#${c(m[1])}${c(m[2])}${c(m[3])}`
}

const DEFAULT_CUSTOM_PALETTE = Object.fromEntries(
  Object.entries(YANTRA_THEMES[0].palette).map(([k, v]) => [k, rgbaToHex(v)])
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const CIRCUIT_LABELS = {
  1: { iast: 'prathamāvaraṇa',  dev: 'प्रथमावरण'    },
  2: { iast: 'dvitīyāvaraṇa',   dev: 'द्वितीयावरण'  },
  3: { iast: 'tṛtīyāvaraṇa',    dev: 'तृतीयावरण'   },
  4: { iast: 'caturthāvaraṇa',  dev: 'चतुर्थावरण'  },
  5: { iast: 'pañcamāvaraṇa',   dev: 'पञ्चमावरण'   },
  6: { iast: 'ṣaṣṭhāvaraṇa',    dev: 'षष्ठावरण'    },
  7: { iast: 'saptamāvaraṇa',   dev: 'सप्तमावरण'   },
  8: { iast: 'aṣṭamāvaraṇa',   dev: 'अष्टमावरण'   },
  9: { iast: 'navamāvaraṇa',    dev: 'नवमावरण'     },
}

function circuitLabel(circuitNumber, script) {
  if (script === 'english') return `${ordinal(circuitNumber)} Avarana`
  const labels = CIRCUIT_LABELS[circuitNumber]
  if (!labels) return `Circuit ${circuitNumber}`
  return script === 'devanagari' ? labels.dev : labels.iast
}

function sectionName(section, field, script) {
  if (!section) return ''
  const iastKey = field + 'Iast'
  const devKey  = field + 'Devanagari'
  if (script === 'english') {
    if (field === 'avarana' && section.circuitNumber)
      return `${ordinal(section.circuitNumber)} Enclosure`
    return section[field] || section[iastKey] || ''
  }
  if (script === 'devanagari' && section[devKey])
    return section[devKey]
  // Indian script lookup (kannada / malayalam / tamil / telugu)
  const cn = section.circuitNumber
  if (cn && SECTION_SCRIPTS[cn]?.[field]?.[script])
    return SECTION_SCRIPTS[cn][field][script]
  return section[iastKey] || section[field] || ''
}

// Returns names of items not marked correct in a completed round.
// Handles both deity seqs (1…n) and the trailing Chakra Svāminī / Yoginī seqs.
function getNotMemorisedNames(circuitNumber, prevResults, total, script) {
  if (!prevResults) return []
  const section        = circuitSections.find(s => s.circuitNumber === circuitNumber)
  const circuitDeities = deities
    .filter(d => d.sectionId === `circuit-${circuitNumber}` && d.role === 'deity')
    .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
  const svaminiSeq = total - 1
  const yoginiSeq  = total
  const names = []
  for (let seq = 1; seq <= total; seq++) {
    if (prevResults[seq] === 'correct') continue
    if (seq === svaminiSeq) {
      names.push(sectionName(section, 'chakraSvamini', script))
    } else if (seq === yoginiSeq) {
      names.push(sectionName(section, 'yoginiType', script))
    } else {
      const deity = circuitDeities.find(d => d.sequenceInSection === seq)
      if (deity) names.push(displayName(deity, script))
    }
  }
  return names
}

// ── Left sidebar components ───────────────────────────────────────────────────

function ToggleRow({ label, active, onClick, colour = 'gold' }) {
  const activeClass = colour === 'blue'
    ? 'text-blue-300 bg-blue-900/20'
    : 'text-gold-300 bg-gold-900/20'
  const dotClass = active
    ? (colour === 'blue' ? 'bg-blue-400' : 'bg-gold-400')
    : 'bg-surface-600'
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors flex items-center gap-2
        ${active ? activeClass : 'text-muted hover:text-cream'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${dotClass}`} />
      {label}
    </button>
  )
}

// ── Right panel components ────────────────────────────────────────────────────

function DeityDetail({ deity, script = 'iast', uiLang = 'en' }) {
  if (!deity) return null
  // Co-located deities (e.g. laghimā + garimā on the same bhupura dot) — render both
  if (Array.isArray(deity)) {
    return (
      <div>
        {deity.map((d, i) => (
          <div key={d.id}>
            {i > 0 && <div className="border-t border-surface-700 mx-4" />}
            <DeityDetail deity={d} script={script} uiLang={uiLang} />
          </div>
        ))}
      </div>
    )
  }
  const { scripts, sequenceInSection, sectionId, sequenceInChant, note } = deity
  const section       = circuitSections.find(s => `circuit-${s.circuitNumber}` === sectionId)
  const nonCircuitSec = !section ? sections.find(s => s.id === sectionId) : null
  const primary       = displayName(deity, script)
  const isDevPrim     = script === 'devanagari'
  const secrecy       = section ? YOGINI_SECRECY[section.yoginiType] : null
  const engLabel      = nonCircuitSec?.label || ''

  let subtitle = ''
  const AVARANA_ORDINAL = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th']
  const C1_DOT_COUNT = '28/29'
  if (section) {
    const ordinal = AVARANA_ORDINAL[section.circuitNumber] || `${section.circuitNumber}th`
    const total   = section.circuitNumber === 1 ? C1_DOT_COUNT : (section.triangleCount || section.petalCount || '?')
    subtitle = `${ordinal} Āvaraṇa · ${sequenceInSection} of ${total}`
  }
  else if (sectionId === 'nyasa')       subtitle = `${script === 'english' ? engLabel : 'Nyāsāṅga'} · ${sequenceInSection} of 6`
  else if (sectionId === 'nitya')       subtitle = `${script === 'english' ? engLabel : 'Tithi Nitya'} · ${sequenceInSection} of 16`
  else if (sectionId === 'guru-divya')  subtitle = `${script === 'english' ? engLabel : 'Divyaugha Guravaḥ'} · ${sequenceInSection} of 7`
  else if (sectionId === 'guru-siddha') subtitle = `${script === 'english' ? engLabel : 'Siddhaugha Guravaḥ'} · ${sequenceInSection} of 4`
  else if (sectionId === 'guru-manava') subtitle = `${script === 'english' ? engLabel : 'Mānavaugha Guravaḥ'} · ${sequenceInSection} of 8`
  else                                  subtitle = sectionId?.replace('circuit-', 'Circuit ') ?? ''

  return (
    <div className="p-4 space-y-2">
      <p className="text-xs font-mono text-gold-700 uppercase tracking-widest leading-tight">
        {subtitle}
      </p>
      <h2 className={`${isDevPrim ? '' : 'iast'} text-gold-400 text-sm font-medium leading-snug`}>
        <FuriganaName deity={deity} script={script} uiLang={uiLang} />
      </h2>
      {script !== 'iast' && scripts.iast && (
        <p className="iast text-gold-600 text-xs">{scripts.iast}</p>
      )}
      {script !== 'english' && scripts.english && (
        <p className="text-cream text-xs">{scripts.english}</p>
      )}
      {(deity.translations?.[uiLang] || deity.translations?.en || scripts.translation) && (
        <p className="text-muted text-xs italic mt-1">{deity.translations?.[uiLang] || deity.translations?.en || scripts.translation}</p>
      )}
      {(deity.notes?.[uiLang] || deity.notes?.en || note) && (
        <p className="text-muted text-xs mt-1">{deity.notes?.[uiLang] || deity.notes?.en || note}</p>
      )}
    </div>
  )
}

function CircuitDetail({ circuitNumber, script = 'iast', uiLang = 'en', onNavigate, tr = k => k }) {
  const section = circuitSections.find(s => s.circuitNumber === circuitNumber)
  if (!section) return null
  const secrecy = YOGINI_SECRECY[section.yoginiType]
  const targetTab = CIRCUIT_TO_TAB[circuitNumber]

  return (
    <div className="p-4 space-y-2">
      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(circuitNumber, script)}
      </p>
      <h2 className={`${script === 'english' ? '' : 'iast '}text-gold-400 text-sm font-medium leading-snug`}>
        {sectionName(section, 'avarana', script)}
      </h2>
      {script === 'iast' && (
        <p className="text-cream text-xs">
          {uiLang === 'ja' ? (SECTION_KANA[section.circuitNumber]?.avarana ?? section.avarana)
           : uiLang === 'ru' ? (SECTION_RU[section.circuitNumber]?.avarana ?? section.avarana)
           : uiLang === 'bn' ? (SECTION_BN[section.circuitNumber]?.avarana ?? section.avarana)
           : uiLang === 'gu' ? (SECTION_GU[section.circuitNumber]?.avarana ?? section.avarana)
           : section.avarana}
        </p>
      )}
      <div className="pt-3 border-t border-surface-700 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakra_svamini')}</span>
          <span className={`${script !== 'devanagari' ? 'iast ' : ''}${['kannada','malayalam','tamil','telugu'].includes(script) ? 'text-xs leading-snug break-words min-w-0' : 'text-sm'} text-gold-500`}>
            {uiLang === 'ja' && SECTION_KANA[section.circuitNumber]?.chakraSvamini && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[section.circuitNumber].chakraSvamini}</span>
            )}
            {uiLang === 'ru' && SECTION_RU[section.circuitNumber]?.chakraSvamini && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[section.circuitNumber].chakraSvamini}</span>
            )}
            {uiLang === 'bn' && SECTION_BN[section.circuitNumber]?.chakraSvamini && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[section.circuitNumber].chakraSvamini}</span>
            )}
            {uiLang === 'gu' && SECTION_GU[section.circuitNumber]?.chakraSvamini && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_GU[section.circuitNumber].chakraSvamini}</span>
            )}
            {sectionName(section, 'chakraSvamini', script)}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.yogini')}</span>
          <span className={`${script !== 'devanagari' ? 'iast ' : ''}${['kannada','malayalam','tamil','telugu'].includes(script) ? 'text-xs leading-snug break-words min-w-0' : 'text-sm'} text-gold-500`}>
            {uiLang === 'ja' && SECTION_KANA[section.circuitNumber]?.yoginiType && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[section.circuitNumber].yoginiType}</span>
            )}
            {uiLang === 'ru' && SECTION_RU[section.circuitNumber]?.yoginiType && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[section.circuitNumber].yoginiType}</span>
            )}
            {uiLang === 'bn' && SECTION_BN[section.circuitNumber]?.yoginiType && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[section.circuitNumber].yoginiType}</span>
            )}
            {uiLang === 'gu' && SECTION_GU[section.circuitNumber]?.yoginiType && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_GU[section.circuitNumber].yoginiType}</span>
            )}
            {sectionName(section, 'yoginiType', script)}
            {secrecy && <span className="text-muted block mt-0.5">{tr(secrecy)}</span>}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakreshvari')}</span>
          <span className={`${script !== 'devanagari' ? 'iast ' : ''}${['kannada','malayalam','tamil','telugu'].includes(script) ? 'text-xs leading-snug break-words min-w-0' : 'text-sm'} text-gold-500`}>
            {uiLang === 'ja' && SECTION_KANA[section.circuitNumber]?.chakreshvari && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[section.circuitNumber].chakreshvari}</span>
            )}
            {uiLang === 'ru' && SECTION_RU[section.circuitNumber]?.chakreshvari && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[section.circuitNumber].chakreshvari}</span>
            )}
            {uiLang === 'bn' && SECTION_BN[section.circuitNumber]?.chakreshvari && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[section.circuitNumber].chakreshvari}</span>
            )}
            {uiLang === 'gu' && SECTION_GU[section.circuitNumber]?.chakreshvari && (
              <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_GU[section.circuitNumber].chakreshvari}</span>
            )}
            {sectionName(section, 'chakreshvari', script)}
          </span>
        </div>
      </div>
      {onNavigate && targetTab && (
        <button
          onClick={() => onNavigate(targetTab)}
          className="mt-3 w-full text-left text-xs text-gold-500 hover:text-gold-300 py-2 px-3 border border-gold-800/40 hover:border-gold-700/60 rounded-lg transition-colors bg-gold-900/10 hover:bg-gold-900/20"
        >
          {uiLang === 'en' ? `Explore ${ordinal(circuitNumber)} Enclosure →` : `${tr('mode.explore')} ${circuitLabel(circuitNumber, script)} →`}
        </button>
      )}
    </div>
  )
}

function CircuitRows({ circuitNumber, script, uiLang = 'en', onHoverFill = null, tr = k => k }) {
  const section = circuitSections.find(s => s.circuitNumber === circuitNumber)
  if (!section) return null
  const secrecy = YOGINI_SECRECY[section.yoginiType]
  const fillProps = onHoverFill
    ? { onMouseEnter: () => onHoverFill(true), onMouseLeave: () => onHoverFill(false), style: { cursor: 'default' } }
    : {}
  return (
    <div className="border-t border-surface-700 px-4 pb-4 pt-3 space-y-1.5 text-xs">
      <div className="flex gap-2 rounded px-1 -mx-1 hover:bg-surface-700 transition-colors" {...fillProps}>
        <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakra_svamini')}</span>
        <span className={`${script !== 'devanagari' ? 'iast ' : ''}${['kannada','malayalam','tamil','telugu'].includes(script) ? 'text-xs leading-snug break-words min-w-0' : 'text-sm'} text-gold-500`}>
          {uiLang === 'ja' && SECTION_KANA[section.circuitNumber]?.chakraSvamini && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[section.circuitNumber].chakraSvamini}</span>
          )}
          {uiLang === 'ru' && SECTION_RU[section.circuitNumber]?.chakraSvamini && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[section.circuitNumber].chakraSvamini}</span>
          )}
          {uiLang === 'bn' && SECTION_BN[section.circuitNumber]?.chakraSvamini && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[section.circuitNumber].chakraSvamini}</span>
          )}
          {sectionName(section, 'chakraSvamini', script)}
        </span>
      </div>
      <div className="flex gap-2 rounded px-1 -mx-1 hover:bg-surface-700 transition-colors" {...fillProps}>
        <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.yogini')}</span>
        <span className={`${script !== 'devanagari' ? 'iast ' : ''}${['kannada','malayalam','tamil','telugu'].includes(script) ? 'text-xs leading-snug break-words min-w-0' : 'text-sm'} text-gold-500`}>
          {uiLang === 'ja' && SECTION_KANA[section.circuitNumber]?.yoginiType && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[section.circuitNumber].yoginiType}</span>
          )}
          {uiLang === 'ru' && SECTION_RU[section.circuitNumber]?.yoginiType && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[section.circuitNumber].yoginiType}</span>
          )}
          {uiLang === 'bn' && SECTION_BN[section.circuitNumber]?.yoginiType && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[section.circuitNumber].yoginiType}</span>
          )}
          {sectionName(section, 'yoginiType', script)}
          {secrecy && <span className="text-muted block mt-0.5">{tr(secrecy)}</span>}
        </span>
      </div>
      <div className="flex gap-2 rounded px-1 -mx-1 hover:bg-surface-700 transition-colors" {...fillProps}>
        <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakreshvari')}</span>
        <span className={`${script !== 'devanagari' ? 'iast ' : ''}${['kannada','malayalam','tamil','telugu'].includes(script) ? 'text-xs leading-snug break-words min-w-0' : 'text-sm'} text-gold-500`}>
          {uiLang === 'ja' && SECTION_KANA[section.circuitNumber]?.chakreshvari && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[section.circuitNumber].chakreshvari}</span>
          )}
          {uiLang === 'ru' && SECTION_RU[section.circuitNumber]?.chakreshvari && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[section.circuitNumber].chakreshvari}</span>
          )}
          {uiLang === 'bn' && SECTION_BN[section.circuitNumber]?.chakreshvari && (
            <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[section.circuitNumber].chakreshvari}</span>
          )}
          {sectionName(section, 'chakreshvari', script)}
        </span>
      </div>
    </div>
  )
}

function SectionInfo({ tabId, script = 'iast', uiLang = 'en', showRows = true, tr = k => k }) {
  const circuitNumber = TAB_TO_CIRCUIT[tabId]
  const section       = circuitNumber
    ? circuitSections.find(s => s.circuitNumber === circuitNumber)
    : null

  if (!section) {
    // Closing tab gets a dedicated description panel
    if (tabId === 'closing') {
      return (
        <div className="p-4 space-y-2">
          <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script !== 'english' ? ' iast' : ''}`}>
            {script === 'english' ? 'Sridevi Epithets' : 'śrīdevī viśēṣaṇāni'}
          </p>
          <h2 className={`${script === 'english' ? '' : 'iast '}text-gold-400 text-sm font-medium leading-snug`}>
            {script === 'english' ? 'Closing Namaskara' : 'namaskāra-navākṣarī ca'}
          </h2>
          <p className="text-cream text-xs leading-relaxed">{tr('desc.closing')}</p>
        </div>
      )
    }

    if (tabId === 'inner') {
      return (
        <div className="p-4 space-y-2">
          <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script !== 'english' ? ' iast' : ''}`}>
            {script === 'english' ? 'Tithi Nitya Devatas' : 'tithi nitya dēvatāḥ'}
          </p>
          <h2 className={`${script === 'english' ? '' : 'iast '}text-gold-400 text-sm font-medium leading-snug`}>
            {script === 'english' ? 'Sixteen Nitya Devis' : 'ṣoḍaśa nitya dēvī'}
          </h2>
          <p className="text-cream text-xs leading-relaxed">{tr('desc.inner')}</p>
        </div>
      )
    }

    if (tabId === 'gurava') {
      return (
        <div className="p-4 space-y-2">
          <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script !== 'english' ? ' iast' : ''}`}>
            {script === 'english' ? 'Gurus' : 'guravaḥ'}
          </p>
          <h2 className={`${script === 'english' ? '' : 'iast '}text-gold-400 text-sm font-medium leading-snug`}>
            {script === 'english' ? 'Divine · Siddha · Human' : 'divyaugha · siddhaugha · mānavaugha'}
          </h2>
          <p className="text-cream text-xs leading-relaxed">{tr('desc.gurava')}</p>
        </div>
      )
    }

    if (tabId === 'nyasa') {
      return (
        <div className="p-4 space-y-2">
          <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script !== 'english' ? ' iast' : ''}`}>
            {script === 'english' ? 'Nyasa Devatas' : 'nyāsāṅga dēvatāḥ'}
          </p>
          <h2 className={`${script === 'english' ? '' : 'iast '}text-gold-400 text-sm font-medium leading-snug`}>
            {script === 'english' ? 'Six-Limb Nyasa' : 'ṣaḍ-aṅga nyāsa'}
          </h2>
          <p className="text-cream text-xs leading-relaxed">{tr('desc.nyasa')}</p>
        </div>
      )
    }

    if (tabId === 'chakreshvari') {
      return (
        <div className="p-4 space-y-2">
          <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script !== 'english' ? ' iast' : ''}`}>
            {script === 'english' ? 'Nava Chakreshvari' : 'navacakrēśvarī nāmāni'}
          </p>
          <h2 className={`${script === 'english' ? '' : 'iast '}text-gold-400 text-sm font-medium leading-snug`}>
            {script === 'english' ? 'Nine Tripura Forms' : 'nava tripurā rūpāṇi'}
          </h2>
          <p className="text-cream text-xs leading-relaxed">{tr('desc.chakreshvari')}</p>
        </div>
      )
    }

    const hints = {
      c8:           'Tap a position to reveal one of the 7 deities of Circuit 8',
      c9:           'Tap the bindu to reveal the deity of Circuit 9',
      browser: null,
    }
    const hint = hints[tabId]
    return hint ? (
      <div className="p-4">
        <p className="text-muted text-xs italic leading-relaxed">{hint}</p>
      </div>
    ) : null
  }

  const deityCount = deities.filter(
    d => d.sectionId === `circuit-${circuitNumber}` && d.role === 'deity'
  ).length
  const secrecy = YOGINI_SECRECY[section.yoginiType]

  return (
    <div className="p-4 space-y-2">
      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(circuitNumber, script)}
      </p>
      <h2 className={`${script === 'english' ? '' : 'iast '}text-gold-400 text-sm font-medium leading-snug`}>
        {sectionName(section, 'avarana', script)}
      </h2>
      {script === 'iast' && (
        <p className="text-cream text-xs">
          {uiLang === 'ja' ? (SECTION_KANA[circuitNumber]?.avarana ?? section.avarana)
           : uiLang === 'ru' ? (SECTION_RU[circuitNumber]?.avarana ?? section.avarana)
           : uiLang === 'bn' ? (SECTION_BN[circuitNumber]?.avarana ?? section.avarana)
           : uiLang === 'gu' ? (SECTION_GU[circuitNumber]?.avarana ?? section.avarana)
           : section.avarana}
        </p>
      )}
      {showRows && (
        <div className="pt-3 border-t border-surface-700 space-y-1.5 text-xs">
          <div className="flex gap-2">
            <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakra_svamini')}</span>
            <span className="text-gold-500">
              {uiLang === 'ja' && SECTION_KANA[circuitNumber]?.chakraSvamini && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[circuitNumber].chakraSvamini}</span>
              )}
              {uiLang === 'ru' && SECTION_RU[circuitNumber]?.chakraSvamini && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[circuitNumber].chakraSvamini}</span>
              )}
              {uiLang === 'bn' && SECTION_BN[circuitNumber]?.chakraSvamini && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[circuitNumber].chakraSvamini}</span>
              )}
              {uiLang === 'gu' && SECTION_GU[circuitNumber]?.chakraSvamini && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_GU[circuitNumber].chakraSvamini}</span>
              )}
              {sectionName(section, 'chakraSvamini', script)}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.yogini')}</span>
            <span className="text-gold-500">
              {uiLang === 'ja' && SECTION_KANA[circuitNumber]?.yoginiType && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[circuitNumber].yoginiType}</span>
              )}
              {uiLang === 'ru' && SECTION_RU[circuitNumber]?.yoginiType && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[circuitNumber].yoginiType}</span>
              )}
              {uiLang === 'bn' && SECTION_BN[circuitNumber]?.yoginiType && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[circuitNumber].yoginiType}</span>
              )}
              {uiLang === 'gu' && SECTION_GU[circuitNumber]?.yoginiType && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_GU[circuitNumber].yoginiType}</span>
              )}
              {sectionName(section, 'yoginiType', script)}
            </span>
          </div>
          {secrecy && (
            <div className="flex gap-2">
              <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.secrecy')}</span>
              <span className="text-muted">{tr(secrecy)}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakreshvari')}</span>
            <span className="text-gold-500">
              {uiLang === 'ja' && SECTION_KANA[circuitNumber]?.chakreshvari && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_KANA[circuitNumber].chakreshvari}</span>
              )}
              {uiLang === 'ru' && SECTION_RU[circuitNumber]?.chakreshvari && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_RU[circuitNumber].chakreshvari}</span>
              )}
              {uiLang === 'bn' && SECTION_BN[circuitNumber]?.chakreshvari && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_BN[circuitNumber].chakreshvari}</span>
              )}
              {uiLang === 'gu' && SECTION_GU[circuitNumber]?.chakreshvari && (
                <span className="block font-sans" style={{ fontSize: '11px', opacity: 0.72, lineHeight: 1.2, marginBottom: '1px' }}>{SECTION_GU[circuitNumber].chakreshvari}</span>
              )}
              {sectionName(section, 'chakreshvari', script)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function CircuitTable({ selectedCircuit, onCircuitSelect, tr = k => k }) {
  return (
    <div className="p-3">
      <div className="border border-surface-600 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-600 bg-surface-800">
              <th className="px-2 py-2 text-left text-muted font-normal w-5">#</th>
              <th className="px-2 py-2 text-left text-muted font-normal">Āvaraṇa</th>
              <th className="px-2 py-2 text-right text-muted font-normal">n</th>
            </tr>
          </thead>
          <tbody>
            {circuitSections.map(s => (
              <tr
                key={s.circuitNumber}
                className={`border-b border-surface-700/50 transition-colors cursor-pointer
                  ${selectedCircuit === s.circuitNumber
                    ? 'bg-gold-900/20 text-gold-400'
                    : 'hover:bg-surface-800'}`}
                onClick={() => onCircuitSelect(s.circuitNumber)}
              >
                <td className="px-2 py-1.5 text-gold-700 font-mono">{s.circuitNumber}</td>
                <td className="px-2 py-1.5 iast text-cream">{s.avarana}</td>
                <td className="px-2 py-1.5 text-right text-muted">
                  {deities.filter(e => e.sectionId === `circuit-${s.circuitNumber}`).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!selectedCircuit && (
        <p className="text-muted text-xs text-center mt-2 italic">{tr('hint.circuit')}</p>
      )}
    </div>
  )
}

// ── Bhupura (Circuit 1) Memorise right-panel info ────────────────────────────
//
// Shown instead of SectionInfo when the bhupura tab is in Memorise mode.
//
// Phases (driven by currentSeq from App state):
//   1–28  : dot phase — heading visible, Chakra Svāminī + Yoginī labels
//           shown but values hidden (···)
//   29    : Chakra Svāminī active — hover to reveal, click/dbl-click to mark
//   30    : Yoginī active — same
//   > 30  : all done

function BhupuraMemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, svaminiSeq = 29, yoginiSeq = 30, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 1)
  if (!section) return null

  const dotsDone = currentSeq >= svaminiSeq

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!dotsDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = dotsDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !dotsDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">

      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(1, script)}
      </p>

      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', svaminiSeq)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    yoginiSeq)}
      </div>

      {currentSeq > yoginiSeq && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === yoginiSeq
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c2')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── C2 Memorise right-panel info ──────────────────────────────────────────────
//
// Shown instead of SectionInfo when the C2 tab is in Memorise mode.
//
// Phases (driven by currentSeq from App state):
//   1–16  : petal phase — heading visible, Chakra Svāminī + Yoginī labels
//           shown but values hidden (···)
//   17    : Chakra Svāminī active — highlighted row, hover to reveal,
//           single-click = skip, double-click = memorised
//   18    : Yoginī active — same interaction; Chakra Svāminī shows its result
//   > 18  : all done — both rows show final result state

function C2MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 2)
  if (!section) return null

  const petalsDone = currentSeq > 16

  // Single-tap: memorised (red) if active; mark if past-skipped. Double-tap: skip/unmark.
  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!petalsDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = petalsDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !petalsDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">

      {/* Circuit heading — always visible; avarana name hidden (would be a giveaway) */}
      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(2, script)}
      </p>

      {/* Chakra Svāminī + Yoginī rows */}
      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 17)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    18)}
      </div>

      {/* Hint during active extra phases */}
      {/* Completion — show once all 18 items have been attempted */}
      {currentSeq > 18 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 18
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c3')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── C3 Memorise right-panel info ──────────────────────────────────────────────
//
// Identical pattern to C2MemoriseInfo but for the 8-petal lotus (C3).
// Phases:  1–8  = petal phase
//          9    = Chakra Svāminī active
//          10   = Yoginī active
//          > 10 = done

function C3MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 3)
  if (!section) return null

  const petalsDone = currentSeq > 8

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!petalsDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = petalsDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !petalsDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">

      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(3, script)}
      </p>

      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 9)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    10)}
      </div>

      {currentSeq > 10 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 10
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c4')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── C4 Memorise right-panel info ──────────────────────────────────────────────
//
// Identical pattern to C3MemoriseInfo but for the 14-triangle circuit (C4).
// Phases:  1–14 = triangle phase
//          15   = Chakra Svāminī active
//          16   = Yoginī active
//          > 16 = done

function C4MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 4)
  if (!section) return null

  const trianglesDone = currentSeq > 14

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = trianglesDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !trianglesDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">

      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(4, script)}
      </p>

      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 15)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    16)}
      </div>

      {currentSeq > 16 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 16
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c5')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── C5 Memorise right-panel info ──────────────────────────────────────────────
//
// Phases:  1–10 = triangle phase
//          11   = Chakra Svāminī active
//          12   = Yoginī active
//          > 12 = done

function C5MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 5)
  if (!section) return null

  const trianglesDone = currentSeq > 10

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = trianglesDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !trianglesDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">

      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(5, script)}
      </p>

      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 11)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    12)}
      </div>

      {currentSeq > 12 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 12
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c6')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── C6 Memorise right-panel info ──────────────────────────────────────────────
//
// Phases:  1–10 = triangle phase
//          11   = Chakra Svāminī active
//          12   = Yoginī active
//          > 12 = done

function C6MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 6)
  if (!section) return null

  const trianglesDone = currentSeq > 10

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = trianglesDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !trianglesDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">

      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(6, script)}
      </p>

      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 11)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    12)}
      </div>

      {currentSeq > 12 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 12
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c7')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── C7 Memorise right-panel info ──────────────────────────────────────────────
//
// Phases:  1–8  = triangle phase
//          9    = Chakra Svāminī active
//          10   = Yoginī active
//          > 10 = done

function C7MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 7)
  if (!section) return null

  const trianglesDone = currentSeq > 8

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = trianglesDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !trianglesDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">

      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(7, script)}
      </p>

      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 9)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    10)}
      </div>

      {currentSeq > 10 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 10
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c8')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Simplified Yantra view (props driven) ─────────────────────────────────────

// ── C8 Memorise right-panel info ──────────────────────────────────────────────
//
// Phases:  1–7  = triangle phase (handled by C8View dots)
//          8    = Chakra Svāminī active
//          9    = Yoginī active
//          > 9  = done

function C8MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 8)
  if (!section) return null

  const trianglesDone = currentSeq > 7

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = trianglesDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !trianglesDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">
      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(8, script)}
      </p>
      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 8)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    9)}
      </div>
      {currentSeq > 9 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 9
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('c9')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── C9 Memorise right-panel info ──────────────────────────────────────────────
//
// Phases:  1    = bindu (handled by C9View)
//          2    = Chakra Svāminī active
//          3    = Yoginī active
//          > 3  = done

function C9MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script, tr = k => k }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [revealedSeq,  setRevealedSeq]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 9)
  if (!section) return null

  const binduDone = currentSeq > 1

  const lastTapRef = useRef({ seq: null, time: 0 })
  const handleItemClick = (seq) => {
    // First tap on active seq: reveal the name (no mark yet)
    if (currentSeq === seq && revealedSeq !== seq && hoveredField === null) {
      setRevealedSeq(seq)
      lastTapRef.current = { seq: null, time: 0 }
      return
    }
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.seq === seq && (now - lastTapRef.current.time) < 300
    lastTapRef.current = { seq, time: now }
    if (isDoubleTap) {
      if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
      if (currentSeq === seq)              { onMarkResult(seq, 'wrong');   setRevealedSeq(null) }
      else if (results[seq] === 'correct') onToggleResult(seq)
    } else {
      if (extraTimer.current) return
      extraTimer.current = setTimeout(() => {
        extraTimer.current = null
        if (currentSeq === seq)              { onMarkResult(seq, 'correct'); setRevealedSeq(null) }
        else if (results[seq] !== 'correct') onToggleResult(seq)
      }, 280)
    }
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isRevealed = hoveredField === fieldKey || revealedSeq === seq
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!binduDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isRevealed) {
      valueContent = <span className="text-gold-300 italic text-xs">{tr('instr.tap_reveal')}</span>
    } else if (isActive && isRevealed) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-gold-600">{value}</span>
    } else {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    }

    const interactive = binduDone

    return (
      <div
        key={fieldKey}
        className={[
          'flex gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors',
          interactive ? 'cursor-pointer' : '',
          !binduDone && !isActive ? 'opacity-40' : '',
        ].join(' ')}
        style={isActive ? {
          background: 'rgba(255,248,200,0.10)',
          boxShadow:  '0 0 0 1px rgba(255,248,200,0.35)',
        } : undefined}
        onClick={interactive ? () => handleItemClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); onToggleResult(seq) }
          : undefined}
      >
        <span
          className={`w-24 flex-shrink-0 pt-px text-xs ${isActive ? '' : 'text-muted'}`}
          style={isActive ? { color: 'rgba(255,248,200,0.92)' } : undefined}
        >
          {labelText}
        </span>
        <span className="text-xs flex-1">{valueContent}</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">
      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(9, script)}
      </p>
      <div className="pt-3 border-t border-surface-700 space-y-1">
        {renderRow(tr('deity.chakra_svamini'), 'chakraSvamini', 2)}
        {renderRow(tr('deity.yogini'), 'yoginiType',    3)}
      </div>
      {currentSeq > 3 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 3
              ? tr('misc.all_memorised')
              : tr('spot.round_complete')}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              {tr('misc.try_again')}
            </button>
            <button
              onClick={() => onNavigate('chakreshvari')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              {tr('misc.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function YantraView({
  showTriangles, showNumbers, showLabels, showSeedOfLife, seedR,
  selectedCircuit, onCircuitSelect,
  filledRegions, onRegionClick,
  lastTapped,
}) {
  const yantraCircuitSelect = showNumbers ? null : onCircuitSelect
  const yantraRegionClick   = showNumbers ? onRegionClick : null

  return (
    <div className="p-4">
      {/* Yantra */}
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
           style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          <SriYantraSVG
            className="w-full h-full"
            showLabels={showLabels}
            showTriangles={showTriangles}
            showSeedOfLife={showSeedOfLife}
            seedOfLifeR={seedR}
            onCircuitSelect={yantraCircuitSelect}
            selectedCircuit={selectedCircuit}
            showNumbers={showNumbers}
            filledRegions={filledRegions}
            onRegionClick={yantraRegionClick}
          />
        </div>
      </div>

      {/* Tapped region display (numbers mode) */}
      {showNumbers && (
        <div className="mt-2 min-h-[2rem] flex flex-col items-center justify-center gap-0.5">
          {lastTapped ? (
            <>
              <p className="iast text-gold-300 text-sm text-center leading-snug">{lastTapped.iast}</p>
              <p className="text-muted text-xs text-center">{lastTapped.label}</p>
            </>
          ) : (
            <p className="text-muted text-xs text-center italic">
              Tap a region to fill · tap again to clear
            </p>
          )}
        </div>
      )}

      {/* Idle hint (normal mode) */}
      {!showNumbers && !selectedCircuit && (
        <p className="text-center text-xs text-muted mt-2 italic">
          Tap any region to explore its circuit
        </p>
      )}

      {/* Caption */}
      <p className="iast text-gold-500 text-sm text-center mt-3">śrī yantra · śrī chakra</p>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

// -- Section IAST labels for Explore/Memorise header -------------------------

const SECTION_IAST_LABELS = {
  nyasa:       'Nyāsāṅga Devatāḥ',
  inner:       'Tithi Nitya Devatāḥ',
  gurava:      'Guravaḥ',
  bhupura:     '1st Āvaraṇa',
  c2:          '2nd Āvaraṇa',
  c3:          '3rd Āvaraṇa',
  c4:          '4th Āvaraṇa',
  c5:          '5th Āvaraṇa',
  c6:          '6th Āvaraṇa',
  c7:          '7th Āvaraṇa',
  c8:          '8th Āvaraṇa',
  c9:          '9th Āvaraṇa',
  chakreshvari:'Nava Chakreshvarī',
  closing:     'Śrīdevī Viśeṣaṇāni',
}

// Geometric name + local-language description for each of the 9 āvaraṇas
// name.iast = used for all alphabet-based languages (en/de/es/fr/it/pt/ja)
// name[lang] = local script for Indic languages
// desc[lang]  = local-language description; falls back to desc.en
const AVARANA_GEOM = {
  bhupura: {
    name: { iast: 'bhūpura',            hi: 'भूपुर',         mr: 'भूपुर',         ne: 'भूपुर',         bn: 'ভূপুর',         gu: 'ભૂપુર',        kn: 'ಭೂಪುರ',       ml: 'ഭൂപുര',        ta: 'பூபுர',         te: 'భూపుర'        },
    desc: { en: 'outer square',         de: 'äußeres Quadrat',        es: 'cuadrado exterior',     fr: 'carré extérieur',       it: 'quadrato esterno',   pt: 'quadrado externo',   ru: 'внешний квадрат',
            bn: 'বাইরের চতুর্ভুজ',      gu: 'બાહ્ય વર્ગ',    hi: 'बाह्य वर्ग',      mr: 'बाह्य वर्ग',    kn: 'ಹೊರ ಚೌಕ',     ml: 'പുറം ചതുരം',   ta: 'வெளி சதுரம்',  te: 'బాహ్య చతురస్రం', ja: '外側の四角'       },
  },
  c2: {
    name: { iast: 'ṣoḍaśadalapadma', hi: 'षोडश दल पद्म',  mr: 'षोडश दल पद्म',  ne: 'षोडश दल पद्म',  bn: 'ষোডশদলপদ্ম',   gu: 'ષોડશ દલ પદ્મ', kn: 'ಷೋಡಶ ದಳ ಪದ್ಮ', ml: 'ഷോഡശ ദള പദ്മ', ta: 'ஷோடச தள பத்ம',  te: 'షోడశ దళ పద్మ' },
    desc: { en: '16 petalled lotus',    de: '16-blättriger Lotus',    es: 'loto de 16 pétalos',    fr: 'lotus à 16 pétales',    it: 'loto a 16 petali',   pt: 'lótus de 16 pétalas',   ru: '16-лепестковый лотос',
            bn: '১৬ পাপড়ির পদ্ম',      gu: '૧૬ દલ કમલ',    hi: '१६ दल कमल',       mr: '१६ दल कमल',     kn: '೧೬ ದಳದ ತಾವರೆ', ml: '൧൬ ഇതൾ താമര',  ta: '௧௬ இதழ் தாமரை', te: '౧౬ రేకుల కమలం',  ja: '十六弁の蓮'       },
  },
  c3: {
    name: { iast: 'aṣṭadalapadma',   hi: 'अष्ट दल पद्म',  mr: 'अष्ट दल पद्म',  ne: 'अष्ट दल पद्म',  bn: 'অষ্টদলপদ্ম',    gu: 'અષ્ટ દલ પદ્મ', kn: 'ಅಷ್ಟ ದಳ ಪದ್ಮ', ml: 'അഷ്ട ദള പദ്മ', ta: 'அஷ்ட தள பத்ம',  te: 'అష్ట దళ పద్మ'  },
    desc: { en: '8 petalled lotus',     de: '8-blättriger Lotus',     es: 'loto de 8 pétalos',     fr: 'lotus à 8 pétales',     it: 'loto a 8 petali',    pt: 'lótus de 8 pétalas',    ru: '8-лепестковый лотос',
            bn: '৮ পাপড়ির পদ্ম',       gu: '૮ દલ કમલ',     hi: '८ दल कमल',        mr: '८ दल कमल',      kn: '೮ ದಳದ ತಾವರೆ',  ml: '൮ ഇതൾ താമര',   ta: '௮ இதழ் தாமரை',   te: '౮ రేకుల కమలం',   ja: '八弁の蓮'         },
  },
  c4: {
    name: { iast: 'caturdaśa',          hi: 'चतुर्दश',        mr: 'चतुर्दश',        ne: 'चतुर्दश',        bn: 'চতুর্দশ',        gu: 'ચતુર્દશ',      kn: 'ಚತುರ್ದಶ',     ml: 'ചതുർദശ',       ta: 'சதுர்தச',        te: 'చతుర్దశ'       },
    desc: { en: '14 triangles',         de: '14 Dreiecke',            es: '14 triángulos',         fr: '14 triangles',          it: '14 triangoli',       pt: '14 triângulos',      ru: '14 треугольников',
            bn: '১৪টি ত্রিভুজ',         gu: '૧૪ ત્રિકોણ',   hi: '१४ त्रिकोण',      mr: '१४ त्रिकोण',    kn: '೧೪ ತ್ರಿಕೋಣಗಳು', ml: '൧൪ ത്രികോണങ്ങൾ', ta: '௧௪ முக்கோணங்கள்', te: '౧౪ త్రికోణాలు',  ja: '十四の三角形'     },
  },
  c5: {
    name: { iast: 'bahirdaśa',          hi: 'बहिर्दश',        mr: 'बहिर्दश',        ne: 'बहिर्दश',        bn: 'বহির্দশ',        gu: 'બહિર્દશ',      kn: 'ಬಹಿರ್ದಶ',     ml: 'ബഹിർദശ',       ta: 'பஹிர்தச',        te: 'బహిర్దశ'       },
    desc: { en: 'outer 10 triangles',   de: '10 äußere Dreiecke',     es: '10 triángulos exteriores', fr: '10 triangles extérieurs', it: '10 triangoli esterni', pt: '10 triângulos externos', ru: '10 внешних треугольников',
            bn: 'বাইরের ১০টি ত্রিভুজ',  gu: 'બાહ્ય ૧૦ ત્રિકોણ', hi: 'बाह्य १० त्रिकोण', mr: 'बाह्य १० त्रिकोण', kn: 'ಹೊರ ೧೦ ತ್ರಿಕೋಣಗಳು', ml: 'പുറം ൧൦ ത്രികോണങ്ങൾ', ta: 'வெளி ௧௦ முக்கோணங்கள்', te: 'బాహ్య ౧౦ త్రికోణాలు', ja: '外側の十の三角形'  },
  },
  c6: {
    name: { iast: 'antardaśa',          hi: 'अन्तर्दश',       mr: 'अन्तर्दश',       ne: 'अन्तर्दश',       bn: 'অন্তর্দশ',       gu: 'અન્તર્દશ',     kn: 'ಅಂತರ್ದಶ',     ml: 'അന്തർദശ',       ta: 'அந்தர்தச',       te: 'అంతర్దశ'       },
    desc: { en: 'inner 10 triangles',   de: '10 innere Dreiecke',     es: '10 triángulos interiores', fr: '10 triangles intérieurs', it: '10 triangoli interni', pt: '10 triângulos internos', ru: '10 внутренних треугольников',
            bn: 'ভেতরের ১০টি ত্রিভুজ', gu: 'આંતરિક ૧૦ ત્રિકોણ', hi: 'आंतरिक १० त्रिकोण', mr: 'आंतरिक १० त्रिकोण', kn: 'ಒಳ ೧೦ ತ್ರಿಕೋಣಗಳು', ml: 'അകം ൧൦ ത്രികോണങ്ങൾ', ta: 'உள் ௧௦ முக்கோணங்கள்', te: 'అంతర ౧౦ త్రికోణాలు', ja: '内側の十の三角形'  },
  },
  c7: {
    name: { iast: 'aṣṭakoṇa',          hi: 'अष्टकोण',        mr: 'अष्टकोण',        ne: 'अष्टकोण',        bn: 'অষ্টকোণ',        gu: 'અષ્ટકોણ',      kn: 'ಅಷ್ಟಕೋಣ',     ml: 'അഷ്ടകോണ',      ta: 'அஷ்டகோண',       te: 'అష్టకోణ'       },
    desc: { en: '8 triangles',          de: '8 Dreiecke',             es: '8 triángulos',          fr: '8 triangles',           it: '8 triangoli',        pt: '8 triângulos',       ru: '8 треугольников',
            bn: '৮টি ত্রিভুজ',          gu: '૮ ત્રિકોણ',     hi: '८ त्रिकोण',       mr: '८ त्रिकोण',      kn: '೮ ತ್ರಿಕೋಣಗಳು',  ml: '൮ ത്രികോണങ്ങൾ',  ta: '௮ முக்கோணங்கள்',  te: '౮ త్రికోణాలు',   ja: '八の三角形'       },
  },
  c8: {
    name: { iast: 'trikoṇa',           hi: 'त्रिकोण',         mr: 'त्रिकोण',         ne: 'त्रिकोण',         bn: 'ত্রিকোণ',         gu: 'ત્રિકોણ',       kn: 'ತ್ರಿಕೋಣ',      ml: 'ത്രികോണ',      ta: 'த்ரிகோண',        te: 'త్రికోణ'        },
    desc: { en: 'triangle',             de: 'Dreieck',                es: 'triángulo',             fr: 'triangle',              it: 'triangolo',          pt: 'triângulo',          ru: 'треугольник',
            bn: 'ত্রিভুজ',              gu: 'ત્રિભુજ',       hi: 'त्रिभुज',          mr: 'त्रिभुज',          kn: 'ತ್ರಿಭುಜ',         ml: 'ത്രിഭുജം',       ta: 'முக்கோணம்',      te: 'త్రిభుజం',       ja: '三角形'           },
  },
  c9: {
    name: { iast: 'bindu',             hi: 'बिंदु',           mr: 'बिंदु',           ne: 'बिन्दु',          bn: 'বিন্দু',          gu: 'બિંદુ',          kn: 'ಬಿಂದು',         ml: 'ബിന്ദു',        ta: 'பிந்து',          te: 'బిందువు'       },
    desc: { en: 'dot',                  de: 'Punkt',                  es: 'punto',                 fr: 'point',                 it: 'punto',              pt: 'ponto',              ru: 'точка',
            bn: 'বিন্দু',               gu: 'કેન્દ્ર બિંદુ',  hi: 'केन्द्र बिंदु',   mr: 'केंद्र बिंदु',   kn: 'ಕೇಂದ್ರ ಬಿಂದು',  ml: 'കേന്ദ്ര ബിന്ദു',  ta: 'மையப் புள்ளி',  te: 'కేంద్ర బిందువు',  ja: '点'              },
  },
}
const INDIC_LANGS    = new Set(['hi','mr','ne','bn','gu','kn','ml','ta','te'])
const DEVANAGARI_LANGS = new Set(['hi','mr','ne'])
// Returns {name, desc} for the given tab and UI language
// Devanagari languages get the script name only (desc = null — no parenthetical)
function geomParts(tab, lang) {
  const g = AVARANA_GEOM[tab]
  if (!g) return null
  return {
    name: INDIC_LANGS.has(lang) ? (g.name[lang] ?? g.name.iast) : g.name.iast,
    desc: DEVANAGARI_LANGS.has(lang) ? null : (g.desc[lang] ?? g.desc.en),
  }
}

// Katakana furigana for each avarana's IAST name (Japanese mode only)
const AVARANA_KANA = {
  bhupura: 'ブープラ',
  c2:      'ショーダシャ・ダラ・パドマ',
  c3:      'アシュタ・ダラ・パドマ',
  c4:      'チャトゥルダシャ',
  c5:      'バヒルダシャ',
  c6:      'アンタルダシャ',
  c7:      'アシュタコーナ',
  c8:      'トリコーナ',
  c9:      'ビンドゥ',
}

export default function App() {
  // Normally starts on Introduction. Exception: a sync action (Link, Pull
  // latest, Push this device) reloads the whole page to guarantee every
  // view's state is fresh — see SyncView.jsx/PullLatestButton.jsx, which
  // stash the tab the user was actually on into sessionStorage right before
  // calling reload(). Read once, then cleared immediately, so it only
  // affects the one reload it was set for.
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = sessionStorage.getItem('sy-post-sync-tab')
      if (saved) {
        sessionStorage.removeItem('sy-post-sync-tab')
        return saved
      }
    } catch {}
    return 'intro'
  })
  const [script,   setScript]   = useState('iast') // script key for deity name display
  const [uiLang,   setUiLang]   = useState('en')   // UI language
  const [usEnglish, setUsEnglish] = useState(false) // American English spelling variant
  const handleLangChange = (lang) => {
    setUiLang(lang)
    const opt = LANG_OPTIONS.find(o => o.code === lang)
    if (opt?.defaultScript) setScript(opt.defaultScript)
    setShowLangMenu(false)
    setShowSidebarLangMenu(false)
  }
  const [showLangMenu,         setShowLangMenu]         = useState(false)
  const [showSidebarLangMenu,  setShowSidebarLangMenu]  = useState(false)
  const [showScriptMenu,       setShowScriptMenu]       = useState(false)
  const [showMobileScriptMenu, setShowMobileScriptMenu] = useState(false)

  // Close mobile top-bar dropdowns on any outside tap — iOS-safe (no covering div)
  const mobileDropdownRef = useRef(null)
  useEffect(() => {
    if (!showLangMenu && !showMobileScriptMenu) return
    const close = (e) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setShowLangMenu(false)
        setShowMobileScriptMenu(false)
      }
    }
    // Small delay so the opening tap doesn't immediately fire the handler
    const t = setTimeout(() => document.addEventListener('touchstart', close, { passive: true }), 50)
    return () => { clearTimeout(t); document.removeEventListener('touchstart', close) }
  }, [showLangMenu, showMobileScriptMenu])

  // Close sidebar language dropdown on outside click
  const sidebarLangRef = useRef(null)
  useEffect(() => {
    if (!showSidebarLangMenu) return
    const close = (e) => {
      if (sidebarLangRef.current && !sidebarLangRef.current.contains(e.target)) {
        setShowSidebarLangMenu(false)
      }
    }
    const t = setTimeout(() => document.addEventListener('mousedown', close), 50)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', close) }
  }, [showSidebarLangMenu])

  // ── Device sync — pull-on-load (new devices only) ─────────────────────────
  // Only auto-pulls when this device has zero local progress — i.e. a
  // genuinely new install picking up an existing code for the first time.
  // A device that already has memo results, history, or a session log is
  // never silently overwritten on mount; that unconditional-pull behaviour
  // is what wiped a real Activity Log on 2026-08-22 (mount ran on every
  // load and replaced a fuller local dataset with a leaner cloud one).
  // From here on, pulling into a device that already has progress only
  // happens via an explicit, confirmed action (Link, Sync now — see
  // SyncView.jsx). Push-on-change is wired separately, at the point of
  // writing (see utils.js's saveMemoStorage/recordHistoryEntry/
  // saveSessionLog, each of which calls sync.js's schedulePush()).
  useEffect(() => {
    if (!getSyncCode()) return
    if (hasLocalProgress()) return
    // Reload once the pull lands: this app's per-section state (bhupuraResults,
    // c2Results, etc.) is only ever read from localStorage at initial mount, so
    // without a reload a brand-new device's first pull would write correct data
    // into storage while every already-rendered view kept showing its initial
    // (empty) state. Safe against a reload loop — hasLocalProgress() will be
    // true next time this effect runs, since the pull just populated storage.
    //
    // Stash the current tab before reloading, same as every other sync-triggered
    // reload (see SyncView.jsx / PullLatestButton.jsx) — otherwise the reload
    // lands back on the default tab instead of wherever the user actually was.
    // Missing this was the cause of the Śrī Yantra page's "Customise" panel
    // showing correctly on arrival, then appearing to vanish moments later on a
    // brand-new device that still had an unresolved pull-on-load pending.
    pullNow()
      .then(blob => {
        if (blob) {
          try { sessionStorage.setItem('sy-post-sync-tab', activeTab) } catch {}
          window.location.reload()
        }
      })
      .catch(err => console.error('sync: pull-on-load failed', err))
  }, [])

  // Flush any pending debounced push the instant the tab is backgrounded or
  // closed, rather than waiting on the 3s debounce timer — a normal tab
  // close/switch can happen well inside that window and silently drop the
  // push (see flushPendingPush's comment in sync.js for the incident this
  // fixes). visibilitychange covers backgrounding/switching apps; pagehide
  // is the more reliable signal for an actual close on iOS Safari.
  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState === 'hidden') flushPendingPush() }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pagehide', flushPendingPush)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pagehide', flushPendingPush)
    }
  }, [])

  const tr = key => translate(uiLang !== 'en' ? uiLang : (usEnglish ? 'en-us' : script), key)  // uses uiLang when set, en-us if US variant, else script (for IAST overrides)
  const [openSections, setOpenSections] = useState({
    'h-explore-memorise': true,
    'h-spotcheck':        true,
    'h-sync':             true,
    'h-references':       true,
  })

  // ── Site tour ──────────────────────────────────────────────────────────────
  const { startTour, tourElement } = useTour({
    onBeforeStart: () => setOpenSections({
      'h-explore-memorise': true,
      'h-spotcheck':        true,
      'h-sync':             true,
      'h-references':       true,
    }),
    script,
    uiLang,
    onLanguageChange: handleLangChange,
    usEnglish,
    onUsEnglishChange: setUsEnglish,
  })

  // ── Yantra-tab state ───────────────────────────────────────────────────────
  const [showTriangles,   setShowTriangles]   = useState(true)
  const [showNumbers,     setShowNumbers]     = useState(false)
  const [showLabels,      setShowLabels]      = useState(false)
  const [showSeedOfLife,  setShowSeedOfLife]  = useState(false)
  const [seedR,           setSeedR]           = useState(66)
  const [selectedCircuit, setSelectedCircuit] = useState(null)
  const [lastTapped,      setLastTapped]      = useState(null)
  const [filledRegions,   setFilledRegions]   = useState(MODEL_YANTRA_FILLS)
  // Traditional (index 0) is the landing theme on the Śrī Yantra page, editor
  // closed — Custom 1 is the first of 3 custom slots, appended after the
  // presets in allThemes (index YANTRA_THEMES.length..+2), reached only by
  // stepping/shuffling or hitting Customise, not by default.
  // (Cut from 5 slots to 3 on 2026-08-23 — Chris's call: this is a memorisation
  // app, and five saved palettes was more choice than the feature needed.
  // Reversed the Custom-1-by-default landing state the same day — start on
  // the plain diagram, not mid-edit.)
  const [yantraThemeIdx,  setYantraThemeIdx]  = useState(0)
  const [showCustomiser,  setShowCustomiser]  = useState(false)
  const CUSTOM_SLOT_COUNT = 3
  const DEFAULT_CUSTOM_SLOT = {
    palette: DEFAULT_CUSTOM_PALETTE,
    accentColor: YANTRA_THEMES[0].accentColor,
    bgColor: YANTRA_THEMES[0].bgColor,
  }
  const [customThemes,    setCustomThemes]    = useState(() => {
    const saved = loadCustomYantraThemes()
    if (saved) return saved
    // First run after upgrading from the single-slot version — migrate
    // whatever was there into Custom 1, leave the others fresh.
    const legacy = loadCustomYantraTheme()
    const slot0 = legacy ? {
      palette:     legacy.palette     ?? DEFAULT_CUSTOM_PALETTE,
      accentColor: legacy.accentColor ?? YANTRA_THEMES[0].accentColor,
      bgColor:     legacy.bgColor     ?? YANTRA_THEMES[0].bgColor,
    } : { ...DEFAULT_CUSTOM_SLOT, palette: { ...DEFAULT_CUSTOM_SLOT.palette } }
    return [
      slot0,
      ...Array.from({ length: CUSTOM_SLOT_COUNT - 1 }, () => ({ ...DEFAULT_CUSTOM_SLOT, palette: { ...DEFAULT_CUSTOM_SLOT.palette } })),
    ]
  })
  // One undo stack per custom slot — editing Custom 3 shouldn't affect Custom 1's history.
  const [customHistories, setCustomHistories] = useState(() => Array.from({ length: CUSTOM_SLOT_COUNT }, () => []))

  // ── Sidebar UI state ───────────────────────────────────────────────────────
  const [controlsOpen, setControlsOpen] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // ── Phone landscape-lock (2026-08-25) ───────────────────────────────────
  // JS-based (not a CSS media query) — navigator.maxTouchPoints for touch
  // detection instead of the `pointer` media feature, and screen.width/
  // height's SHORTER side (orientation-invariant, since min() doesn't care
  // which is width vs height) for phone-vs-tablet sizing. Confirmed working
  // on Chris's phone, 2026-08-25 — the earlier reports of it not appearing
  // turned out to be testing the production URL instead of a dev/preview
  // deployment with these commits on it, not a code bug.
  const [showLandscapeLock, setShowLandscapeLock] = useState(false)
  useEffect(() => {
    const checkOrientation = () => {
      const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
      const shortSide = Math.min(window.screen.width, window.screen.height)
      const isPhoneSize = shortSide < 700   // phones' short side stays well under this; tablets don't
      const isLandscape = window.innerWidth > window.innerHeight
      setShowLandscapeLock(isTouch && isPhoneSize && isLandscape)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  // ── Mobile drill precision hint (2026-08-25) ────────────────────────────
  // Nudge toward tablet/desktop (+ stylus) or pinch-zooming, since closely
  // spaced dots/triangles in the drills are hard to hit accurately on a
  // phone touchscreen. See MOBILE_DRILL_HINT_TAB_IDS above for scope.
  // Dismissal is session-only by default (closing with × just hides it for
  // now — it'll be back next visit); checking "Don't show this message
  // again" before dismissing is what persists to localStorage permanently
  // (Chris, 2026-08-25).
  const MOBILE_DRILL_HINT_KEY = 'sy-mobile-drill-hint-dismissed'
  const [mobileDrillHintDismissed, setMobileDrillHintDismissed] = useState(() => {
    try { return localStorage.getItem(MOBILE_DRILL_HINT_KEY) === 'true' } catch { return false }
  })
  const [mobileDrillHintDontShowAgain, setMobileDrillHintDontShowAgain] = useState(false)
  const dismissMobileDrillHint = () => {
    setMobileDrillHintDismissed(true)
    if (mobileDrillHintDontShowAgain) {
      try { localStorage.setItem(MOBILE_DRILL_HINT_KEY, 'true') } catch {}
    }
  }

  // ── Global deity selection ─────────────────────────────────────────────────
  const [selectedDeity, setSelectedDeity] = useState(null)

  // ── C2 Memorise mode (lifted so right panel can render controls) ───────────
  const [c2Memorise,    setC2Memorise]    = useState(false)
  const [c2CurrentSeq,  setC2CurrentSeq]  = useState(1)
  const [c2Results,     setC2Results]     = useState(() => loadMemoStorage('c2'))
  const [c2PrevResults, setC2PrevResults] = useState(null)  // null = no attempt yet
  const [c2Flash,       setC2Flash]       = useState(false)  // true during all-correct flash
  const [c2HighlightId, setC2HighlightId] = useState(null)
  const [c2ShowList,    setC2ShowList]    = useState(true)

  const handleC2StartMemorise = () => {
    setC2Memorise(true)
    setC2CurrentSeq(1)
    setC2Results({})
    setC2Flash(false)
  }
  const handleC2ExitMemorise = () => setC2Memorise(false)
  const handleC2MarkResult = (seq, result) => {
    // Compute new results synchronously so we can check all-correct before setState resolves
    const newResults = result === 'correct'
      ? { ...c2Results, [seq]: 'correct' }
      : { ...c2Results }
    if (result === 'correct') setC2Results(newResults)
    else recordHistoryEntry('c2', seq, 'wrong')
    const nextSeq = seq + 1
    setC2CurrentSeq(nextSeq)
    if (nextSeq > 18) {
      setC2PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 18, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c2', correct: Object.keys(newResults).length, total: 18 })
      const allCorrect = Array.from({ length: 18 }, (_, i) => i + 1)
        .every(s => newResults[s] === 'correct')
      if (allCorrect) {
        setC2Flash(true)
        setTimeout(() => setC2Flash(false), 1000)
      }
    }
  }
  const handleC2ToggleResult = (seq) => {
    setC2Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── C3 Memorise mode ───────────────────────────────────────────────────────
  const [c3HighlightId, setC3HighlightId] = useState(null)
  const [c3ShowList,    setC3ShowList]    = useState(true)
  const [c3Memorise,    setC3Memorise]    = useState(false)
  const [c3CurrentSeq,  setC3CurrentSeq]  = useState(1)
  const [c3Results,     setC3Results]     = useState(() => loadMemoStorage('c3'))
  const [c3PrevResults, setC3PrevResults] = useState(null)
  const [c3Flash,       setC3Flash]       = useState(false)

  const handleC3StartMemorise = () => {
    setC3Memorise(true)
    setC3CurrentSeq(1)
    setC3Results({})
    setC3Flash(false)
  }
  const handleC3ExitMemorise = () => setC3Memorise(false)
  const handleC3MarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...c3Results, [seq]: 'correct' }
      : { ...c3Results }
    if (result === 'correct') setC3Results(newResults)
    else recordHistoryEntry('c3', seq, 'wrong')
    const nextSeq = seq + 1
    setC3CurrentSeq(nextSeq)
    if (nextSeq > 10) {
      setC3PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 10, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c3', correct: Object.keys(newResults).length, total: 10 })
      const allCorrect = Array.from({ length: 10 }, (_, i) => i + 1)
        .every(s => newResults[s] === 'correct')
      if (allCorrect) {
        setC3Flash(true)
        setTimeout(() => setC3Flash(false), 1000)
      }
    }
  }
  const handleC3ToggleResult = (seq) => {
    setC3Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── C4 Memorise mode ───────────────────────────────────────────────────────
  const [c4HighlightId, setC4HighlightId] = useState(null)
  const [c4ShowList,    setC4ShowList]    = useState(true)
  const [c4Memorise,    setC4Memorise]    = useState(false)
  const [c4CurrentSeq,  setC4CurrentSeq]  = useState(1)
  const [c4Results,     setC4Results]     = useState(() => loadMemoStorage('c4'))
  const [c4PrevResults, setC4PrevResults] = useState(null)
  const [c4Flash,       setC4Flash]       = useState(false)

  const handleC4StartMemorise = () => {
    setC4Memorise(true)
    setC4CurrentSeq(1)
    setC4Results({})
    setC4Flash(false)
  }
  const handleC4ExitMemorise = () => setC4Memorise(false)
  const handleC4MarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...c4Results, [seq]: 'correct' }
      : { ...c4Results }
    if (result === 'correct') setC4Results(newResults)
    else recordHistoryEntry('c4', seq, 'wrong')
    const nextSeq = seq + 1
    setC4CurrentSeq(nextSeq)
    if (nextSeq > 16) {
      setC4PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 16, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c4', correct: Object.keys(newResults).length, total: 16 })
      const allCorrect = Array.from({ length: 16 }, (_, i) => i + 1)
        .every(s => newResults[s] === 'correct')
      if (allCorrect) {
        setC4Flash(true)
        setTimeout(() => setC4Flash(false), 1000)
      }
    }
  }
  const handleC4ToggleResult = (seq) => {
    setC4Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── C5 Memorise mode ───────────────────────────────────────────────────────
  const [c5HighlightId, setC5HighlightId] = useState(null)
  const [c5ShowList,    setC5ShowList]    = useState(true)
  const [c5Memorise,    setC5Memorise]    = useState(false)
  const [c5CurrentSeq,  setC5CurrentSeq]  = useState(1)
  const [c5Results,     setC5Results]     = useState(() => loadMemoStorage('c5'))
  const [c5PrevResults, setC5PrevResults] = useState(null)
  const [c5Flash,       setC5Flash]       = useState(false)

  const handleC5StartMemorise = () => {
    setC5Memorise(true)
    setC5CurrentSeq(1)
    setC5Results({})
    setC5Flash(false)
  }
  const handleC5ExitMemorise = () => setC5Memorise(false)
  const handleC5MarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...c5Results, [seq]: 'correct' }
      : { ...c5Results }
    if (result === 'correct') setC5Results(newResults)
    else recordHistoryEntry('c5', seq, 'wrong')
    const nextSeq = seq + 1
    setC5CurrentSeq(nextSeq)
    if (nextSeq > 12) {
      setC5PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 12, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c5', correct: Object.keys(newResults).length, total: 12 })
      const allCorrect = Array.from({ length: 12 }, (_, i) => i + 1)
        .every(s => newResults[s] === 'correct')
      if (allCorrect) {
        setC5Flash(true)
        setTimeout(() => setC5Flash(false), 1000)
      }
    }
  }
  const handleC5ToggleResult = (seq) => {
    setC5Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── C6 Memorise mode ───────────────────────────────────────────────────────
  const [c6HighlightId, setC6HighlightId] = useState(null)
  const [c6ShowList,    setC6ShowList]    = useState(true)
  const [c6Memorise,    setC6Memorise]    = useState(false)
  const [c6CurrentSeq,  setC6CurrentSeq]  = useState(1)
  const [c6Results,     setC6Results]     = useState(() => loadMemoStorage('c6'))
  const [c6PrevResults, setC6PrevResults] = useState(null)
  const [c6Flash,       setC6Flash]       = useState(false)

  const handleC6StartMemorise = () => {
    setC6Memorise(true)
    setC6CurrentSeq(1)
    setC6Results({})
    setC6Flash(false)
  }
  const handleC6ExitMemorise = () => setC6Memorise(false)
  const handleC6MarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...c6Results, [seq]: 'correct' }
      : { ...c6Results }
    if (result === 'correct') setC6Results(newResults)
    else recordHistoryEntry('c6', seq, 'wrong')
    const nextSeq = seq + 1
    setC6CurrentSeq(nextSeq)
    if (nextSeq > 12) {
      setC6PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 12, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c6', correct: Object.keys(newResults).length, total: 12 })
      const allCorrect = Array.from({ length: 12 }, (_, i) => i + 1)
        .every(s => newResults[s] === 'correct')
      if (allCorrect) {
        setC6Flash(true)
        setTimeout(() => setC6Flash(false), 1000)
      }
    }
  }
  const handleC6ToggleResult = (seq) => {
    setC6Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── C7 Memorise mode ───────────────────────────────────────────────────────
  const [c7HighlightId, setC7HighlightId] = useState(null)
  const [c7ShowList,    setC7ShowList]    = useState(true)
  const [c7Memorise,    setC7Memorise]    = useState(false)
  const [c7CurrentSeq,  setC7CurrentSeq]  = useState(1)
  const [c7Results,     setC7Results]     = useState(() => loadMemoStorage('c7'))
  const [c7PrevResults, setC7PrevResults] = useState(null)
  const [c7Flash,       setC7Flash]       = useState(false)

  const handleC7StartMemorise = () => {
    setC7Memorise(true)
    setC7CurrentSeq(1)
    setC7Results({})
    setC7Flash(false)
  }
  const handleC7ExitMemorise = () => setC7Memorise(false)
  const handleC7MarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...c7Results, [seq]: 'correct' }
      : { ...c7Results }
    if (result === 'correct') setC7Results(newResults)
    else recordHistoryEntry('c7', seq, 'wrong')
    const nextSeq = seq + 1
    setC7CurrentSeq(nextSeq)
    if (nextSeq > 10) {
      setC7PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 10, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c7', correct: Object.keys(newResults).length, total: 10 })
      const allCorrect = Array.from({ length: 10 }, (_, i) => i + 1)
        .every(s => newResults[s] === 'correct')
      if (allCorrect) {
        setC7Flash(true)
        setTimeout(() => setC7Flash(false), 1000)
      }
    }
  }
  const handleC7ToggleResult = (seq) => {
    setC7Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── C8 Memorise mode ───────────────────────────────────────────────────────
  const [c8HighlightId, setC8HighlightId] = useState(null)
  const [c8ShowList,    setC8ShowList]    = useState(true)
  const [c8Memorise,    setC8Memorise]    = useState(false)
  const [c8CurrentSeq,  setC8CurrentSeq]  = useState(1)
  const [c8Results,     setC8Results]     = useState(() => loadMemoStorage('c8'))
  const [c8PrevResults, setC8PrevResults] = useState(null)
  const [c8Flash,       setC8Flash]       = useState(false)

  const handleC8StartMemorise = () => {
    setC8Memorise(true)
    setC8CurrentSeq(1)
    setC8Results({})
    setC8Flash(false)
  }
  const handleC8ExitMemorise = () => setC8Memorise(false)
  const handleC8MarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...c8Results, [seq]: 'correct' }
      : { ...c8Results }
    if (result === 'correct') setC8Results(newResults)
    else recordHistoryEntry('c8', seq, 'wrong')
    const nextSeq = seq + 1
    setC8CurrentSeq(nextSeq)
    if (nextSeq > 9) {
      setC8PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 9, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c8', correct: Object.keys(newResults).length, total: 9 })
      const allCorrect = Array.from({ length: 9 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
      if (allCorrect) { setC8Flash(true); setTimeout(() => setC8Flash(false), 1000) }
    }
  }
  const handleC8ToggleResult = (seq) => {
    setC8Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── C9 Memorise mode ───────────────────────────────────────────────────────
  const [c9Memorise,    setC9Memorise]    = useState(false)
  const [c9CurrentSeq,  setC9CurrentSeq]  = useState(1)
  const [c9Results,     setC9Results]     = useState(() => loadMemoStorage('c9'))
  const [c9PrevResults, setC9PrevResults] = useState(null)
  const [c9Flash,       setC9Flash]       = useState(false)

  const handleC9StartMemorise = () => {
    setC9Memorise(true)
    setC9CurrentSeq(1)
    setC9Results({})
    setC9Flash(false)
  }
  const handleC9ExitMemorise = () => setC9Memorise(false)
  const handleC9MarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...c9Results, [seq]: 'correct' }
      : { ...c9Results }
    if (result === 'correct') setC9Results(newResults)
    else recordHistoryEntry('c9', seq, 'wrong')
    const nextSeq = seq + 1
    setC9CurrentSeq(nextSeq)
    if (nextSeq > 3) {
      setC9PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 3, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'c9', correct: Object.keys(newResults).length, total: 3 })
      const allCorrect = Array.from({ length: 3 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
      if (allCorrect) { setC9Flash(true); setTimeout(() => setC9Flash(false), 1000) }
    }
  }
  const handleC9ToggleResult = (seq) => {
    setC9Results(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── Nava Chakreshvari Memorise mode ────────────────────────────────────────
  const [ncHighlightId,      setNcHighlightId]      = useState(null)
  const [ncHighlightCircuit, setNcHighlightCircuit] = useState(null)
  const [ncShowList,         setNcShowList]         = useState(true)
  const [ncMemorise,    setNcMemorise]    = useState(false)
  const [ncCurrentSeq,  setNcCurrentSeq]  = useState(1)
  const [ncResults,     setNcResults]     = useState(() => loadMemoStorage('nc'))
  const [ncPrevResults, setNcPrevResults] = useState(null)
  const [ncFlash,       setNcFlash]       = useState(false)

  const handleNcStartMemorise = () => {
    setNcMemorise(true)
    setNcCurrentSeq(1)
    setNcResults({})
    setNcFlash(false)
  }
  const handleNcExitMemorise = () => setNcMemorise(false)
  const handleNcMarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...ncResults, [seq]: 'correct' }
      : { ...ncResults }
    if (result === 'correct') setNcResults(newResults)
    else recordHistoryEntry('nc', seq, 'wrong')
    const nextSeq = seq + 1
    setNcCurrentSeq(nextSeq)
    if (nextSeq > 9) {
      setNcPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 9, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'nc', correct: Object.keys(newResults).length, total: 9 })
      const allCorrect = Array.from({ length: 9 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
      if (allCorrect) { setNcFlash(true); setTimeout(() => setNcFlash(false), 1000) }
    }
  }
  const handleNcToggleResult = (seq) => {
    setNcResults(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── Closing Memorise mode ──────────────────────────────────────────────────
  const [closingShowList,      setClosingShowList]      = useState(true)
  const [closingListHighlight, setClosingListHighlight] = useState(false)
  const [closingMemorise,      setClosingMemorise]      = useState(false)
  const [closingCurrentSeq,  setClosingCurrentSeq]  = useState(1)
  const [closingResults,     setClosingResults]     = useState(() => loadMemoStorage('closing'))
  const [closingPrevResults, setClosingPrevResults] = useState(null)
  const [closingFlash,       setClosingFlash]       = useState(false)

  const handleClosingStartMemorise = () => {
    setClosingMemorise(true)
    setClosingCurrentSeq(1)
    setClosingResults({})
    setClosingFlash(false)
  }
  const handleClosingExitMemorise = () => setClosingMemorise(false)
  const handleClosingMarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...closingResults, [seq]: 'correct' }
      : { ...closingResults }
    if (result === 'correct') setClosingResults(newResults)
    else recordHistoryEntry('closing', seq, 'wrong')
    const nextSeq = seq + 1
    setClosingCurrentSeq(nextSeq)
    if (nextSeq > 10) {
      setClosingPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 10, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'closing', correct: Object.keys(newResults).length, total: 10 })
      const allCorrect = Array.from({ length: 10 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
      if (allCorrect) { setClosingFlash(true); setTimeout(() => setClosingFlash(false), 1000) }
    }
  }
  const handleClosingToggleResult = (seq) => {
    setClosingResults(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── Nyasa Memorise mode ────────────────────────────────────────────────────
  const [nyasaMemorise,    setNyasaMemorise]    = useState(false)
  const [nyasaCurrentSeq,  setNyasaCurrentSeq]  = useState(1)
  const [nyasaResults,     setNyasaResults]     = useState(() => loadMemoStorage('nyasa'))
  const [nyasaPrevResults, setNyasaPrevResults] = useState(null)
  const [nyasaFlash,       setNyasaFlash]       = useState(false)
  const [nyasaHighlightId, setNyasaHighlightId] = useState(null)
  const [nyasaShowList,    setNyasaShowList]    = useState(true)

  const handleNyasaStartMemorise = () => {
    setNyasaMemorise(true)
    setNyasaCurrentSeq(1)
    setNyasaResults({})
    setNyasaFlash(false)
  }
  const handleNyasaExitMemorise = () => setNyasaMemorise(false)
  const handleNyasaMarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...nyasaResults, [seq]: 'correct' }
      : { ...nyasaResults }
    if (result === 'correct') setNyasaResults(newResults)
    else recordHistoryEntry('nyasa', seq, 'wrong')
    const nextSeq = seq + 1
    setNyasaCurrentSeq(nextSeq)
    if (nextSeq > 6) {
      setNyasaPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 6, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'nyasa', correct: Object.keys(newResults).length, total: 6 })
      const allCorrect = Array.from({ length: 6 }, (_, i) => i + 1)
        .every(s => newResults[s] === 'correct')
      if (allCorrect) {
        setNyasaFlash(true)
        setTimeout(() => setNyasaFlash(false), 1000)
      }
    }
  }
  const handleNyasaToggleResult = (seq) => {
    setNyasaResults(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── Inner (Nitya Devatas) Memorise mode ────────────────────────────────────
  const [innerMemorise,    setInnerMemorise]    = useState(false)
  const [innerCurrentSeq,  setInnerCurrentSeq]  = useState(1)
  const [innerResults,     setInnerResults]     = useState(() => loadMemoStorage('inner'))
  const [innerPrevResults, setInnerPrevResults] = useState(null)
  const [innerFlash,       setInnerFlash]       = useState(false)
  const [innerHighlightId, setInnerHighlightId] = useState(null)
  const [innerShowList,    setInnerShowList]    = useState(true)
  const [innerWaning,      setInnerWaning]      = useState(false)

  const handleInnerStartMemorise = () => {
    setInnerMemorise(true)
    setInnerCurrentSeq(1)
    setInnerResults({})
    setInnerFlash(false)
    setInnerWaning(false)
  }
  const handleInnerExitMemorise = () => setInnerMemorise(false)
  const handleInnerMarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...innerResults, [seq]: 'correct' }
      : { ...innerResults }
    if (result === 'correct') setInnerResults(newResults)
    else recordHistoryEntry('inner', seq, 'wrong')
    const nextSeq = seq + 1
    setInnerCurrentSeq(nextSeq)
    if (nextSeq > 16) {
      setInnerPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 16, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'inner', correct: Object.keys(newResults).length, total: 16 })
      const allCorrect = Array.from({ length: 16 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
      if (allCorrect) { setInnerFlash(true); setTimeout(() => setInnerFlash(false), 1000) }
    }
  }
  const handleInnerToggleResult = (seq) => {
    setInnerResults(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }
  const handleInnerSetWaning = (val) => {
    setInnerWaning(val)
    if (innerMemorise) { setInnerCurrentSeq(1); setInnerResults({}); setInnerFlash(false) }
  }

  // ── Gurava (Guru lineage) Memorise mode ────────────────────────────────────
  const [guravaMemorse,     setGuravaMemorse]     = useState(false)
  const [guravaCurrentSeq,  setGuravaCurrentSeq]  = useState(1)
  const [guravaResults,     setGuravaResults]     = useState(() => loadMemoStorage('gurava'))
  const [guravaPrevResults, setGuravaPrevResults] = useState(null)
  const [guravaFlash,       setGuravaFlash]       = useState(false)
  const [guravaHighlightId, setGuravaHighlightId] = useState(null)
  const [guravaShowList,    setGuravaShowList]    = useState(true)

  const handleGuravaStartMemorise = () => {
    setGuravaMemorse(true)
    setGuravaCurrentSeq(1)
    setGuravaResults({})
    setGuravaFlash(false)
  }
  const handleGuravaExitMemorise = () => setGuravaMemorse(false)
  const handleGuravaMarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...guravaResults, [seq]: 'correct' }
      : { ...guravaResults }
    if (result === 'correct') setGuravaResults(newResults)
    else recordHistoryEntry('gurava', seq, 'wrong')
    const nextSeq = seq + 1
    setGuravaCurrentSeq(nextSeq)
    if (nextSeq > 19) {
      setGuravaPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 19, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'gurava', correct: Object.keys(newResults).length, total: 19 })
      const allCorrect = Array.from({ length: 19 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
      if (allCorrect) { setGuravaFlash(true); setTimeout(() => setGuravaFlash(false), 1000) }
    }
  }
  const handleGuravaToggleResult = (seq) => {
    setGuravaResults(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }

  // ── Bhupura (Circuit 1) Memorise mode ─────────────────────────────────────
  const [bhupuraMemorise,    setBhupuraMemorise]    = useState(false)
  const [bhupuraCurrentSeq,  setBhupuraCurrentSeq]  = useState(1)
  const [bhupuraResults,     setBhupuraResults]     = useState(() => loadMemoStorage('bhupura'))
  const [bhupuraPrevResults, setBhupuraPrevResults] = useState(null)
  const [bhupuraFlash,       setBhupuraFlash]       = useState(false)
  const [bhupuraHighlightId, setBhupuraHighlightId] = useState(null)
  const [bhupuraShowList,    setBhupuraShowList]    = useState(true)
  const [bhupuraShowColors,  setBhupuraShowColors]  = useState(false)
  const [bhupuraMemoGroup,   setBhupuraMemoGroup]   = useState('all')

  const handleBhupuraStartMemorise = () => {
    setBhupuraMemorise(true)
    setBhupuraCurrentSeq(1)
    setBhupuraResults({})
    setBhupuraFlash(false)
  }
  const handleBhupuraExitMemorise = () => setBhupuraMemorise(false)
  const handleBhupuraMarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...bhupuraResults, [seq]: 'correct' }
      : { ...bhupuraResults }
    if (result === 'correct') setBhupuraResults(newResults)
    else recordHistoryEntry('bhupura', seq, 'wrong')
    const nextSeq = seq + 1
    setBhupuraCurrentSeq(nextSeq)
    const groupTotal = (bhupuraMemoGroup === 'all' ? BHUPURA_C1_TOTAL
      : bhupuraMemoGroup === 'siddhiShakti' ? BHUPURA_SIDDHI_TOTAL
      : bhupuraMemoGroup === 'ashtaMatrika' ? 8
      : 10) + 2
    if (nextSeq > groupTotal) {
      setBhupuraPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + groupTotal, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'bhupura', correct: Object.keys(newResults).length, total: groupTotal })
      const allCorrect = Array.from({ length: groupTotal }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
      if (allCorrect) { setBhupuraFlash(true); setTimeout(() => setBhupuraFlash(false), 1000) }
    }
  }
  const handleBhupuraToggleResult = (seq) => {
    setBhupuraResults(prev => {
      const next = { ...prev }
      if (next[seq] === 'correct') delete next[seq]
      else next[seq] = 'correct'
      return next
    })
  }
  const handleBhupuraSetMemoGroup = (group) => {
    setBhupuraMemoGroup(group)
    if (bhupuraMemorise) { setBhupuraCurrentSeq(1); setBhupuraResults({}); setBhupuraFlash(false) }
  }

  // ── Show not-memorised list toggle (shared; reset on tab change) ──────────
  const [showErrors,      setShowErrors]      = useState(false)
  const [circuitFillAll,  setCircuitFillAll]  = useState(false)

  // ── Persist memo results to localStorage ──────────────────────────────────
  useEffect(() => { saveMemoStorage('nyasa',   nyasaResults)   }, [nyasaResults])
  useEffect(() => { saveMemoStorage('inner',   innerResults)   }, [innerResults])
  useEffect(() => { saveMemoStorage('gurava',  guravaResults)  }, [guravaResults])
  useEffect(() => { saveMemoStorage('bhupura', bhupuraResults) }, [bhupuraResults])
  useEffect(() => { saveMemoStorage('c2',      c2Results)      }, [c2Results])
  useEffect(() => { saveMemoStorage('c3',      c3Results)      }, [c3Results])
  useEffect(() => { saveMemoStorage('c4',      c4Results)      }, [c4Results])
  useEffect(() => { saveMemoStorage('c5',      c5Results)      }, [c5Results])
  useEffect(() => { saveMemoStorage('c6',      c6Results)      }, [c6Results])
  useEffect(() => { saveMemoStorage('c7',      c7Results)      }, [c7Results])
  useEffect(() => { saveMemoStorage('c8',      c8Results)      }, [c8Results])
  useEffect(() => { saveMemoStorage('c9',      c9Results)      }, [c9Results])
  useEffect(() => { saveMemoStorage('nc',      ncResults)      }, [ncResults])
  useEffect(() => { saveMemoStorage('closing', closingResults) }, [closingResults])

  // ── Session stats (cumulative across all circuits and rounds) ──────────────
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, rounds: 0 })
  const handleResetSession = () => setSessionStats({ correct: 0, total: 0, rounds: 0 })

  // ── Spot Check: filter, progress, skip ref ────────────────────────────────
  const [scFilter,    setScFilter]    = useState('all')
  const [scSubFilter, setScSubFilter] = useState(null)
  const [scLimit,     setScLimit]     = useState(null)
  const [scProgress, setScProgress] = useState({ idx: 0, total: 0, correct: 0, wrong: 0 })

  // ── Locate Drill: scope, round size, timer, progress ──────────────────────
  // (Chris's wife's idea, 2026-08-23 — reverse Spot Check: name shown, tap the
  // location. Timer options are Fibonacci because Chris likes them; off by default.)
  const [ldScope,   setLdScope]   = useState('all')
  const [ldLimit,   setLdLimit]   = useState(null)
  const [ldTimer,   setLdTimer]   = useState(null)
  const [ldProgress, setLdProgress] = useState({ idx: 0, total: 0, correct: 0, wrong: 0, timeouts: 0, streak: 0, timeLeft: null, timerSeconds: null })

  const scSkipRef      = useRef(null)
  const swipeStartX    = useRef(null)
  const swipeStartY    = useRef(null)

  // ── Line Drill: line selection + sequential drill state ────────────────────
  const LD_LINE_IDS = Object.keys(lineDrillData.LINES)
  const [ldLineId,   setLdLineId]   = useState(LD_LINE_IDS[0])
  const [ldPhase,    setLdPhase]    = useState('preview') // 'preview' | 'drill' | 'done'
  const [ldPreviewStage, setLdPreviewStage] = useState('line') // 'line' | 'fills' — only used during 'preview'
  const [ldIndex,    setLdIndex]    = useState(0)
  const [ldRevealed, setLdRevealed] = useState(false)
  const [ldResults,  setLdResults]  = useState({})
  const ldTapRef        = useRef({ index: null, time: 0 })
  const ldPastTapRef    = useRef({ index: null, time: 0 })
  const ldClickTimer    = useRef(null)
  const ldAdvanceTimer  = useRef(null)
  const ldPreviewTimer  = useRef(null)

  // Kick off the initial 2s "straight line first" reveal for the default line on mount
  useEffect(() => {
    ldPreviewTimer.current = setTimeout(() => setLdPreviewStage('fills'), 2000)
    return () => { if (ldPreviewTimer.current) clearTimeout(ldPreviewTimer.current) }
  }, []) // eslint-disable-line

  // ── Segment Drill: segment selection + sequential drill state ──────────────
  // Mirrors Line Drill's state shape exactly (see above) — a "segment" is a
  // wedge (one aṣṭadalapadma petal) instead of a straight line, but the
  // preview/drill/done phase machine, tap semantics, and result tracking are
  // identical.
  const SD_SEGMENT_IDS = Object.keys(segmentDrillData.SEGMENTS)
  // Start on a random segment rather than always Segment 1 — Segment Drill is
  // meant to be practised in randomised order, not worked through sequentially.
  const [sdSegmentId, setSdSegmentId] = useState(() => SD_SEGMENT_IDS[Math.floor(Math.random() * SD_SEGMENT_IDS.length)])
  const [sdPhase,     setSdPhase]     = useState('preview') // 'preview' | 'drill' | 'done'
  const [sdPreviewStage, setSdPreviewStage] = useState('line') // 'line' | 'fills' — only used during 'preview'
  const [sdIndex,     setSdIndex]     = useState(0)
  const [sdRevealed,  setSdRevealed]  = useState(false)
  const [sdResults,   setSdResults]   = useState({})
  const sdTapRef        = useRef({ index: null, time: 0 })
  const sdPastTapRef    = useRef({ index: null, time: 0 })
  const sdClickTimer    = useRef(null)
  const sdAdvanceTimer  = useRef(null)
  const sdPreviewTimer  = useRef(null)

  // Kick off the initial 2s "true wedge first" reveal for the default segment on mount
  useEffect(() => {
    sdPreviewTimer.current = setTimeout(() => setSdPreviewStage('fills'), 2000)
    return () => { if (sdPreviewTimer.current) clearTimeout(sdPreviewTimer.current) }
  }, []) // eslint-disable-line

  // ── Triangle Drill: triangle selection + sequential drill state ────────────
  // Mirrors Segment Drill's state shape exactly (see above) — a "triangle" here
  // is one of the 9 primary (foundational) mūla triangles instead of a C3 petal
  // wedge, but the preview/drill/done phase machine and tap semantics are
  // identical. The "true geometry" reveal is the primary triangle's own 3 edges
  // (a single closed polygon) rather than a wedge fill + two boundary rays.
  const TD_TRIANGLE_IDS = Object.keys(triangleDrillData.TRIANGLES)
  const [tdTriangleId, setTdTriangleId] = useState(TD_TRIANGLE_IDS[0])
  const [tdPhase,        setTdPhase]        = useState('preview') // 'preview' | 'drill' | 'done'
  const [tdPreviewStage, setTdPreviewStage] = useState('line') // 'line' | 'fills' — only used during 'preview'
  const [tdIndex,        setTdIndex]        = useState(0)
  const [tdRevealed,     setTdRevealed]     = useState(false)
  const [tdResults,      setTdResults]      = useState({})
  const tdTapRef        = useRef({ index: null, time: 0 })
  const tdPastTapRef    = useRef({ index: null, time: 0 })
  const tdClickTimer    = useRef(null)
  const tdAdvanceTimer  = useRef(null)
  const tdPreviewTimer  = useRef(null)

  // Kick off the initial 2s "true triangle first" reveal for the default triangle on mount
  useEffect(() => {
    tdPreviewTimer.current = setTimeout(() => setTdPreviewStage('fills'), 2000)
    return () => { if (tdPreviewTimer.current) clearTimeout(tdPreviewTimer.current) }
  }, []) // eslint-disable-line

  function sdGetRegionId(deity) {
    if (!deity) return null
    const { sectionId, sequenceInSection: seq } = deity
    const pad = n => String(n).padStart(2, '0')
    if (sectionId === 'circuit-2') return `petal-c2-${pad(seq)}`
    if (sectionId === 'circuit-3') return `petal-c3-${pad(seq)}`
    if (sectionId === 'circuit-4') return `tri-c4-${pad(C4_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-5') return `tri-c5-${pad(C5_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-6') return `tri-c6-${pad(C6_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-7') return `tri-c7-${pad(C7_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-9') return 'c9'
    // circuit-1 and circuit-8: multiple deities can share one region shape, so these
    // stay point/dot-based (via getPosition) to keep simultaneous stops distinguishable
    return null
  }

  const sdDeityById = data.deities.length ? Object.fromEntries(data.deities.map(d => [d.id, d])) : {}
  // A segment's fixed ID list (segmentDrillLines.json) is built from Chris's own
  // confirmed candidates, so it shouldn't normally reference an excluded optional
  // deity — but filter defensively anyway, same guard as Line Drill.
  const sdStops = (segmentDrillData.SEGMENTS[sdSegmentId] || [])
    .filter(id => sdDeityById[id])
    .map(id => {
      const deity = sdDeityById[id]
      return { id, deity, pos: getPosition(id), regionId: sdGetRegionId(deity) }
    })
  const sdGeometry = segmentDrillData.SEGMENT_GEOMETRY[sdSegmentId]

  function sdPickSegment(id) {
    if (sdAdvanceTimer.current) { clearTimeout(sdAdvanceTimer.current); sdAdvanceTimer.current = null }
    if (sdPreviewTimer.current) { clearTimeout(sdPreviewTimer.current); sdPreviewTimer.current = null }
    setSdSegmentId(id)
    setSdPhase('preview')
    setSdPreviewStage('line')
    setSdIndex(0)
    setSdRevealed(false)
    setSdResults({})
    sdPreviewTimer.current = setTimeout(() => setSdPreviewStage('fills'), 2000)
  }

  function sdShuffle() {
    let next = sdSegmentId
    if (SD_SEGMENT_IDS.length > 1) {
      while (next === sdSegmentId) next = SD_SEGMENT_IDS[Math.floor(Math.random() * SD_SEGMENT_IDS.length)]
    }
    sdPickSegment(next)
  }

  function sdStartDrill() {
    setSdPhase('drill')
    setSdIndex(0)
    setSdRevealed(false)
    setSdResults({})
  }

  function sdMarkResult(index, result) {
    // Computed synchronously (not via the setSdResults updater) so the round-complete
    // branch below can read the just-marked answer without racing React's state update.
    const newResults = { ...sdResults, [index]: result }
    setSdResults(newResults)
    setSdRevealed(true)
    // Link into Memory Map / Activity Log: each deity in a Segment Drill round may
    // belong to a different circuit, so route the result to *that* deity's own
    // memo-history store, tagged 'drill' (see PERSISTENCE-AND-SYNC-DESIGN.md Part A).
    const sdStop = sdStops[index]
    if (sdStop?.deity) {
      const memoKey = sectionIdToMemoKey(sdStop.deity.sectionId)
      if (memoKey) recordHistoryEntry(memoKey, sdStop.deity.sequenceInSection, result, 'drill')
    }
    if (sdAdvanceTimer.current) clearTimeout(sdAdvanceTimer.current)
    const total = sdStops.length
    sdAdvanceTimer.current = setTimeout(() => {
      setSdRevealed(false)
      setSdIndex(i => {
        const nextI = i + 1
        if (nextI >= total) {
          setSdPhase('done')
          const correctCount = Object.values(newResults).filter(v => v === 'correct').length
          saveSessionLog({ ts: Date.now(), section: 'segmentdrill', correct: correctCount, total })
          return i
        }
        return nextI
      })
    }, 550)
  }

  function sdHandleActiveTap(index) {
    const now = Date.now()
    const isDouble = sdTapRef.current.index === index && (now - sdTapRef.current.time) < 300
    sdTapRef.current = { index, time: now }
    if (isDouble) {
      if (sdClickTimer.current) { clearTimeout(sdClickTimer.current); sdClickTimer.current = null }
      sdMarkResult(index, 'wrong')
    } else {
      if (sdClickTimer.current) return
      sdClickTimer.current = setTimeout(() => {
        sdClickTimer.current = null
        sdMarkResult(index, 'correct')
      }, 280)
    }
  }

  function sdHandlePastTap(index) {
    const now = Date.now()
    const isDouble = sdPastTapRef.current.index === index && (now - sdPastTapRef.current.time) < 300
    sdPastTapRef.current = { index, time: now }
    if (isDouble) {
      sdToggleResult(index)
    }
  }

  // Desktop right-click — see tdHandleRightClick's comment for why this is separate
  // from sdHandlePastTap's mobile double-tap logic.
  function sdHandleRightClick(index) {
    sdToggleResult(index)
  }

  function sdToggleResult(index) {
    setSdResults(r => {
      if (!r[index]) return r
      const next = r[index] === 'correct' ? 'wrong' : 'correct'
      const stop = sdStops[index]
      if (stop?.deity) {
        const memoKey = sectionIdToMemoKey(stop.deity.sectionId)
        if (memoKey) recordHistoryEntry(memoKey, stop.deity.sequenceInSection, next, 'drill')
      }
      return { ...r, [index]: next }
    })
  }

  function sdRestartSameSegment() {
    setSdPhase('drill')
    setSdIndex(0)
    setSdRevealed(false)
    setSdResults({})
  }

  const sdCorrectCount = Object.values(sdResults).filter(v => v === 'correct').length

  function renderSegmentDrillControls() {
    return (
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold">{tr('segmentdrill.heading')}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={sdShuffle}
            className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-gold-400 border border-surface-700 hover:border-gold-600"
          >
            {tr('segmentdrill.shuffle')}
          </button>
          {sdPhase === 'preview' && (
            <button
              onClick={sdStartDrill}
              className="px-2.5 py-1 rounded text-xs font-mono bg-gold-400 text-surface-900 font-bold"
            >
              {tr('segmentdrill.start_drill')}
            </button>
          )}
          {sdPhase !== 'preview' && (
            <button
              onClick={() => sdPickSegment(sdSegmentId)}
              className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-muted hover:text-cream border border-surface-700"
            >
              {tr('segmentdrill.back_to_preview')}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {SD_SEGMENT_IDS.map(id => (
            <button
              key={id}
              onClick={() => sdPickSegment(id)}
              className={[
                'px-2 py-0.5 rounded text-xs font-mono transition-colors',
                id === sdSegmentId ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream',
              ].join(' ')}
            >
              {id} ({segmentDrillData.SEGMENTS[id].filter(did => sdDeityById[did]).length})
            </button>
          ))}
        </div>

        {sdPhase === 'preview' && (
          <p className="text-xs text-muted font-mono">
            {isTouchDevice ? tr('segmentdrill.instr_preview_touch') : tr('segmentdrill.instr_preview_desktop')}
          </p>
        )}

        {sdPhase === 'drill' && (() => {
          const stripDeity = sdStops[sdIndex]?.deity
          return (
            <p className="text-sm font-serif" style={{ color: sdRevealed ? '#fff8c8' : 'transparent', fontFamily: "'Gentium Plus', Georgia, serif", minHeight: '1.5rem' }}>
              {stripDeity ? `${displayName(stripDeity, script)} — ${displayName(stripDeity, 'devanagari')}` : ''}
            </p>
          )
        })()}
        {sdPhase === 'drill' && !sdRevealed && (
          <p className="text-xs text-muted font-mono">{tr('segmentdrill.tap_current_reveal')}</p>
        )}

        {sdPhase === 'done' && (
          <div className="text-sm font-mono space-y-2">
            <span className="text-red-400">{sdCorrectCount}/{sdStops.length} {tr('misc.memorised')}</span>
            <div className="flex gap-2">
              <button onClick={sdShuffle} className="px-2 py-0.5 rounded text-xs bg-gold-400 text-surface-900 font-bold">
                {tr('segmentdrill.shuffle_next')}
              </button>
              <button onClick={sdRestartSameSegment} className="px-2 py-0.5 rounded text-xs bg-surface-800 text-muted hover:text-cream border border-surface-700">
                {tr('segmentdrill.redrill')}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function tdGetRegionId(deity) {
    if (!deity) return null
    const { sectionId, sequenceInSection: seq } = deity
    const pad = n => String(n).padStart(2, '0')
    if (sectionId === 'circuit-2') return `petal-c2-${pad(seq)}`
    if (sectionId === 'circuit-3') return `petal-c3-${pad(seq)}`
    if (sectionId === 'circuit-4') return `tri-c4-${pad(C4_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-5') return `tri-c5-${pad(C5_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-6') return `tri-c6-${pad(C6_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-7') return `tri-c7-${pad(C7_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-9') return 'c9'
    // circuit-1 and circuit-8: multiple deities can share one region shape, so these
    // stay point/dot-based (via getPosition) to keep simultaneous stops distinguishable
    return null
  }

  const tdDeityById = data.deities.length ? Object.fromEntries(data.deities.map(d => [d.id, d])) : {}
  // A triangle's fixed ID list (triangleDrillLines.json) is built from Chris's own
  // confirmed candidates, so it shouldn't normally reference an excluded optional
  // deity — but filter defensively anyway, same guard as Line/Segment Drill.
  const tdStops = (triangleDrillData.TRIANGLES[tdTriangleId] || [])
    .filter(id => tdDeityById[id])
    .map(id => {
      const deity = tdDeityById[id]
      return { id, deity, pos: getPosition(id), regionId: tdGetRegionId(deity) }
    })
  const tdGeometry = triangleDrillData.TRIANGLE_GEOMETRY[tdTriangleId]

  function tdPickTriangle(id) {
    if (tdAdvanceTimer.current) { clearTimeout(tdAdvanceTimer.current); tdAdvanceTimer.current = null }
    if (tdPreviewTimer.current) { clearTimeout(tdPreviewTimer.current); tdPreviewTimer.current = null }
    setTdTriangleId(id)
    setTdPhase('preview')
    setTdPreviewStage('line')
    setTdIndex(0)
    setTdRevealed(false)
    setTdResults({})
    tdPreviewTimer.current = setTimeout(() => setTdPreviewStage('fills'), 2000)
  }

  function tdShuffle() {
    let next = tdTriangleId
    if (TD_TRIANGLE_IDS.length > 1) {
      while (next === tdTriangleId) next = TD_TRIANGLE_IDS[Math.floor(Math.random() * TD_TRIANGLE_IDS.length)]
    }
    tdPickTriangle(next)
  }

  function tdStartDrill() {
    setTdPhase('drill')
    setTdIndex(0)
    setTdRevealed(false)
    setTdResults({})
  }

  function tdMarkResult(index, result) {
    const newResults = { ...tdResults, [index]: result }
    setTdResults(newResults)
    setTdRevealed(true)
    const tdStop = tdStops[index]
    if (tdStop?.deity) {
      const memoKey = sectionIdToMemoKey(tdStop.deity.sectionId)
      if (memoKey) recordHistoryEntry(memoKey, tdStop.deity.sequenceInSection, result, 'drill')
    }
    if (tdAdvanceTimer.current) clearTimeout(tdAdvanceTimer.current)
    const total = tdStops.length
    tdAdvanceTimer.current = setTimeout(() => {
      setTdRevealed(false)
      setTdIndex(i => {
        const nextI = i + 1
        if (nextI >= total) {
          setTdPhase('done')
          const correctCount = Object.values(newResults).filter(v => v === 'correct').length
          saveSessionLog({ ts: Date.now(), section: 'triangledrill', correct: correctCount, total })
          return i
        }
        return nextI
      })
    }, 550)
  }

  function tdHandleActiveTap(index) {
    const now = Date.now()
    const isDouble = tdTapRef.current.index === index && (now - tdTapRef.current.time) < 300
    tdTapRef.current = { index, time: now }
    if (isDouble) {
      if (tdClickTimer.current) { clearTimeout(tdClickTimer.current); tdClickTimer.current = null }
      tdMarkResult(index, 'wrong')
    } else {
      if (tdClickTimer.current) return
      tdClickTimer.current = setTimeout(() => {
        tdClickTimer.current = null
        tdMarkResult(index, 'correct')
      }, 280)
    }
  }

  function tdHandlePastTap(index) {
    const now = Date.now()
    const isDouble = tdPastTapRef.current.index === index && (now - tdPastTapRef.current.time) < 300
    tdPastTapRef.current = { index, time: now }
    if (isDouble) {
      tdToggleResult(index)
    }
  }

  // Desktop right-click on a past stop toggles it immediately (no double-invocation
  // needed, unlike tdHandlePastTap above which exists for mobile's double-tap gesture
  // on the same onClick handler). Mirrors SpotCheckView's handleRightClick. Was
  // previously missing entirely — right-clicking a past Triangle/Segment/Line Drill
  // stop just opened the browser's context menu and did nothing.
  function tdHandleRightClick(index) {
    tdToggleResult(index)
  }

  function tdToggleResult(index) {
    setTdResults(r => {
      if (!r[index]) return r
      const next = r[index] === 'correct' ? 'wrong' : 'correct'
      const stop = tdStops[index]
      if (stop?.deity) {
        const memoKey = sectionIdToMemoKey(stop.deity.sectionId)
        if (memoKey) recordHistoryEntry(memoKey, stop.deity.sequenceInSection, next, 'drill')
      }
      return { ...r, [index]: next }
    })
  }

  function tdRestartSameTriangle() {
    setTdPhase('drill')
    setTdIndex(0)
    setTdRevealed(false)
    setTdResults({})
  }

  const tdCorrectCount = Object.values(tdResults).filter(v => v === 'correct').length

  function renderTriangleDrillControls() {
    return (
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold">{tr('triangledrill.heading')}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={tdShuffle}
            className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-gold-400 border border-surface-700 hover:border-gold-600"
          >
            {tr('triangledrill.shuffle')}
          </button>
          {tdPhase === 'preview' && (
            <button
              onClick={tdStartDrill}
              className="px-2.5 py-1 rounded text-xs font-mono bg-gold-400 text-surface-900 font-bold"
            >
              {tr('triangledrill.start_drill')}
            </button>
          )}
          {tdPhase !== 'preview' && (
            <button
              onClick={() => tdPickTriangle(tdTriangleId)}
              className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-muted hover:text-cream border border-surface-700"
            >
              {tr('triangledrill.back_to_preview')}
            </button>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted font-mono">{tr('triangledrill.upward')}</p>
          <div className="flex flex-wrap gap-1">
            {triangleDrillData.UPWARD_IDS.map(id => (
              <button
                key={id}
                onClick={() => tdPickTriangle(id)}
                className={[
                  'px-2 py-0.5 rounded text-xs font-mono transition-colors',
                  id === tdTriangleId ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream',
                ].join(' ')}
              >
                {triangleDrillData.DISPLAY_NAMES[id] || id} ({triangleDrillData.TRIANGLES[id].filter(did => tdDeityById[did]).length})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted font-mono">{tr('triangledrill.downward')}</p>
          <div className="flex flex-wrap gap-1">
            {triangleDrillData.DOWNWARD_IDS.map(id => (
              <button
                key={id}
                onClick={() => tdPickTriangle(id)}
                className={[
                  'px-2 py-0.5 rounded text-xs font-mono transition-colors',
                  id === tdTriangleId ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream',
                ].join(' ')}
              >
                {triangleDrillData.DISPLAY_NAMES[id] || id} ({triangleDrillData.TRIANGLES[id].filter(did => tdDeityById[did]).length})
              </button>
            ))}
          </div>
        </div>

        {tdPhase === 'preview' && (
          <p className="text-xs text-muted font-mono">
            {isTouchDevice ? tr('triangledrill.instr_preview_touch') : tr('triangledrill.instr_preview_desktop')}
          </p>
        )}

        {tdPhase === 'drill' && (() => {
          const stripDeity = tdStops[tdIndex]?.deity
          return (
            <p className="text-sm font-serif" style={{ color: tdRevealed ? '#fff8c8' : 'transparent', fontFamily: "'Gentium Plus', Georgia, serif", minHeight: '1.5rem' }}>
              {stripDeity ? `${displayName(stripDeity, script)} — ${displayName(stripDeity, 'devanagari')}` : ''}
            </p>
          )
        })()}
        {tdPhase === 'drill' && !tdRevealed && (
          <p className="text-xs text-muted font-mono">{tr('triangledrill.tap_current_reveal')}</p>
        )}

        {tdPhase === 'done' && (
          <div className="text-sm font-mono space-y-2">
            <span className="text-red-400">{tdCorrectCount}/{tdStops.length} {tr('misc.memorised')}</span>
            <div className="flex gap-2">
              <button onClick={tdRestartSameTriangle} className="px-2 py-0.5 rounded text-xs bg-surface-800 text-gold-400 border border-surface-700">
                {tr('triangledrill.redrill')}
              </button>
              <button onClick={tdShuffle} className="px-2 py-0.5 rounded text-xs bg-surface-800 text-gold-400 border border-surface-700">
                {tr('triangledrill.shuffle_next')}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function ldGetRegionId(deity) {
    if (!deity) return null
    const { sectionId, sequenceInSection: seq } = deity
    const pad = n => String(n).padStart(2, '0')
    if (sectionId === 'circuit-2') return `petal-c2-${pad(seq)}`
    if (sectionId === 'circuit-3') return `petal-c3-${pad(seq)}`
    if (sectionId === 'circuit-4') return `tri-c4-${pad(C4_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-5') return `tri-c5-${pad(C5_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-6') return `tri-c6-${pad(C6_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-7') return `tri-c7-${pad(C7_DEITY_ORDER[seq - 1])}`
    if (sectionId === 'circuit-9') return 'c9'
    // circuit-1 and circuit-8: multiple deities can share one region shape, so these
    // stay point/dot-based (via getPosition) to keep simultaneous stops distinguishable
    return null
  }

  const ldDeityById = data.deities.length ? Object.fromEntries(data.deities.map(d => [d.id, d])) : {}
  // A line's fixed ID list (lineDrillLines.json) can include an optional deity
  // (e.g. garimāsiddhē on L6/L9) that isn't in the currently active set — skip
  // that stop rather than rendering a blank one.
  const ldStops = (lineDrillData.LINES[ldLineId] || [])
    .filter(id => ldDeityById[id])
    .map(id => {
      const deity = ldDeityById[id]
      return { id, deity, pos: getPosition(id), regionId: ldGetRegionId(deity) }
    })
  const ldGeometry = lineDrillData.LINE_GEOMETRY[ldLineId]

  function ldPickLine(id) {
    if (ldAdvanceTimer.current) { clearTimeout(ldAdvanceTimer.current); ldAdvanceTimer.current = null }
    if (ldPreviewTimer.current) { clearTimeout(ldPreviewTimer.current); ldPreviewTimer.current = null }
    setLdLineId(id)
    setLdPhase('preview')
    setLdPreviewStage('line')
    setLdIndex(0)
    setLdRevealed(false)
    setLdResults({})
    ldPreviewTimer.current = setTimeout(() => setLdPreviewStage('fills'), 2000)
  }

  function ldShuffle() {
    let next = ldLineId
    if (LD_LINE_IDS.length > 1) {
      while (next === ldLineId) next = LD_LINE_IDS[Math.floor(Math.random() * LD_LINE_IDS.length)]
    }
    ldPickLine(next)
  }

  function ldStartDrill() {
    setLdPhase('drill')
    setLdIndex(0)
    setLdRevealed(false)
    setLdResults({})
  }

  function ldMarkResult(index, result) {
    const newResults = { ...ldResults, [index]: result }
    setLdResults(newResults)
    setLdRevealed(true)
    const ldStop = ldStops[index]
    if (ldStop?.deity) {
      const memoKey = sectionIdToMemoKey(ldStop.deity.sectionId)
      if (memoKey) recordHistoryEntry(memoKey, ldStop.deity.sequenceInSection, result, 'drill')
    }
    if (ldAdvanceTimer.current) clearTimeout(ldAdvanceTimer.current)
    const total = ldStops.length
    ldAdvanceTimer.current = setTimeout(() => {
      setLdRevealed(false)
      setLdIndex(i => {
        const nextI = i + 1
        if (nextI >= total) {
          setLdPhase('done')
          const correctCount = Object.values(newResults).filter(v => v === 'correct').length
          saveSessionLog({ ts: Date.now(), section: 'linedrill', correct: correctCount, total })
          return i
        }
        return nextI
      })
    }, 550)
  }

  function ldHandleActiveTap(index) {
    const now = Date.now()
    const isDouble = ldTapRef.current.index === index && (now - ldTapRef.current.time) < 300
    ldTapRef.current = { index, time: now }
    if (isDouble) {
      if (ldClickTimer.current) { clearTimeout(ldClickTimer.current); ldClickTimer.current = null }
      ldMarkResult(index, 'wrong')
    } else {
      if (ldClickTimer.current) return
      ldClickTimer.current = setTimeout(() => {
        ldClickTimer.current = null
        ldMarkResult(index, 'correct')
      }, 280)
    }
  }

  function ldHandlePastTap(index) {
    const now = Date.now()
    const isDouble = ldPastTapRef.current.index === index && (now - ldPastTapRef.current.time) < 300
    ldPastTapRef.current = { index, time: now }
    if (isDouble) {
      ldToggleResult(index)
    }
  }

  // Desktop right-click — see tdHandleRightClick's comment for why this is separate
  // from ldHandlePastTap's mobile double-tap logic.
  function ldHandleRightClick(index) {
    ldToggleResult(index)
  }

  function ldToggleResult(index) {
    setLdResults(r => {
      if (!r[index]) return r
      const next = r[index] === 'correct' ? 'wrong' : 'correct'
      const stop = ldStops[index]
      if (stop?.deity) {
        const memoKey = sectionIdToMemoKey(stop.deity.sectionId)
        if (memoKey) recordHistoryEntry(memoKey, stop.deity.sequenceInSection, next, 'drill')
      }
      return { ...r, [index]: next }
    })
  }

  function ldRestartSameLine() {
    setLdPhase('drill')
    setLdIndex(0)
    setLdRevealed(false)
    setLdResults({})
  }

  const ldCorrectCount = Object.values(ldResults).filter(v => v === 'correct').length

  function renderLineDrillControls() {
    return (
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold">{tr('linedrill.heading')}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={ldShuffle}
            className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-gold-400 border border-surface-700 hover:border-gold-600"
          >
            {tr('linedrill.shuffle')}
          </button>
          {ldPhase === 'preview' && (
            <button
              onClick={ldStartDrill}
              className="px-2.5 py-1 rounded text-xs font-mono bg-gold-400 text-surface-900 font-bold"
            >
              {tr('linedrill.start_drill')}
            </button>
          )}
          {ldPhase !== 'preview' && (
            <button
              onClick={() => ldPickLine(ldLineId)}
              className="px-2.5 py-1 rounded text-xs font-mono bg-surface-800 text-muted hover:text-cream border border-surface-700"
            >
              {tr('linedrill.back_to_preview')}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {LD_LINE_IDS.map(id => (
            <button
              key={id}
              onClick={() => ldPickLine(id)}
              className={[
                'px-2 py-0.5 rounded text-xs font-mono transition-colors',
                id === ldLineId ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream',
              ].join(' ')}
            >
              {id} ({lineDrillData.LINES[id].filter(did => ldDeityById[did]).length})
            </button>
          ))}
        </div>

        {ldPhase === 'preview' && (
          <p className="text-xs text-muted font-mono">
            {isTouchDevice ? tr('linedrill.instr_preview_touch') : tr('linedrill.instr_preview_desktop')}
          </p>
        )}

        {ldPhase === 'drill' && (() => {
          const stripDeity = ldStops[ldIndex]?.deity
          return (
            <p className="text-sm font-serif" style={{ color: ldRevealed ? '#fff8c8' : 'transparent', fontFamily: "'Gentium Plus', Georgia, serif", minHeight: '1.5rem' }}>
              {stripDeity ? `${displayName(stripDeity, script)} — ${displayName(stripDeity, 'devanagari')}` : ''}
            </p>
          )
        })()}
        {ldPhase === 'drill' && !ldRevealed && (
          <p className="text-xs text-muted font-mono">{tr('linedrill.tap_current_reveal')}</p>
        )}

        {ldPhase === 'done' && (
          <div className="text-sm font-mono space-y-2">
            <span className="text-red-400">{ldCorrectCount}/{ldStops.length} {tr('misc.memorised')}</span>
            <div className="flex gap-2">
              <button onClick={ldRestartSameLine} className="px-2 py-0.5 rounded text-xs bg-surface-800 text-gold-400 border border-surface-700">
                {tr('linedrill.redrill')}
              </button>
              <button onClick={ldShuffle} className="px-2 py-0.5 rounded text-xs bg-surface-800 text-gold-400 border border-surface-700">
                {tr('linedrill.shuffle_next')}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Nav progress dots ──────────────────────────────────────────────────────
  const tabDotMap = {
    yantra:       null,
    nyasa:        getTabDot(nyasaResults,    nyasaPrevResults),
    inner:        getTabDot(innerResults,    innerPrevResults),
    gurava:       getTabDot(guravaResults,   guravaPrevResults),
    bhupura:      getTabDot(bhupuraResults,  bhupuraPrevResults),
    c2:           getTabDot(c2Results,       c2PrevResults),
    c3:           getTabDot(c3Results,       c3PrevResults),
    c4:           getTabDot(c4Results,       c4PrevResults),
    c5:           getTabDot(c5Results,       c5PrevResults),
    c6:           getTabDot(c6Results,       c6PrevResults),
    c7:           getTabDot(c7Results,       c7PrevResults),
    c8:           getTabDot(c8Results,       c8PrevResults),
    c9:           getTabDot(c9Results,       c9PrevResults),
    chakreshvari: getTabDot(ncResults,       ncPrevResults),
    closing:      getTabDot(closingResults,  closingPrevResults),
    spotcheck:    null,
    triangledrill: null,
    browser:      null,
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSelectedDeity(null)
    setSelectedCircuit(null)
    setShowErrors(false)
    // Traditional is the default every time you arrive on the Śrī Yantra page —
    // not just on first app load (reversed 2026-08-23, was Custom 1 with the
    // editor open — Chris's call: start on the plain diagram, not mid-edit).
    // Done here (synchronously, as part of the same navigation) rather than in
    // a useEffect keyed on activeTab, which fires after render and can race
    // with other mount-time effects (the sync pull-on-load reload, in
    // particular) — that was the cause of "shows correctly, then reverts a
    // moment later" back when this defaulted to Custom 1.
    if (tabId === 'yantra') {
      setYantraThemeIdx(0)
      setShowCustomiser(false)
    }
    if (tabId !== 'nyasa')   setNyasaMemorise(false)
    if (tabId !== 'inner')   setInnerMemorise(false)
    if (tabId !== 'gurava')  setGuravaMemorse(false)
    if (tabId !== 'bhupura') setBhupuraMemorise(false)
    if (tabId !== 'c2') setC2Memorise(false)
    if (tabId !== 'c3') setC3Memorise(false)
    if (tabId !== 'c4') setC4Memorise(false)
    if (tabId !== 'c5') setC5Memorise(false)
    if (tabId !== 'c6') setC6Memorise(false)
    if (tabId !== 'c7') setC7Memorise(false)
    if (tabId !== 'c8') setC8Memorise(false)
    if (tabId !== 'c9') setC9Memorise(false)
    if (tabId !== 'chakreshvari') setNcMemorise(false)
    if (tabId !== 'closing') setClosingMemorise(false)
    setMobileNavOpen(false)
  }

  const handleSwipeStart = (e) => {
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
  }
  const handleSwipeEnd = (e) => {
    if (swipeStartX.current === null) return
    const dx = e.changedTouches[0].clientX - swipeStartX.current
    const dy = e.changedTouches[0].clientY - swipeStartY.current
    swipeStartX.current = null
    swipeStartY.current = null
    // Only act on predominantly horizontal swipes ≥ 60 px within the 14 explore sections
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return
    const idx = EXPLORE_TAB_IDS.indexOf(activeTab)
    if (idx === -1) return
    if (dx < 0 && idx < EXPLORE_TAB_IDS.length - 1) handleTabChange(EXPLORE_TAB_IDS[idx + 1])
    if (dx > 0 && idx > 0) handleTabChange(EXPLORE_TAB_IDS[idx - 1])
  }

  const handleDeitySelect = (deity) => setSelectedDeity(deity)

  const handleCircuitSelect = (n) =>
    setSelectedCircuit(prev => prev === n ? null : n)

  const handleRegionClick = (id) => {
    setLastTapped(REGION_INFO[id] ?? null)
    setFilledRegions(prev => {
      const next = { ...prev }
      if (next[id]) { delete next[id] }
      else          { next[id] = regionColour(id) }
      return next
    })
  }

  const hasFills = Object.keys(filledRegions).length > 0

  // ── Śrī Yantra page colour theme controls ─────────────────────────────────
  // allThemes = the 5 built-in presets + 5 user-editable Custom slots (10
  // total). Which custom slot is "active" for editing is just whichever one
  // yantraThemeIdx currently points at — stepping/shuffling through the
  // rotation IS the slot picker, no separate UI needed for that.
  const allThemes = useMemo(() => [
    ...YANTRA_THEMES.map(t => ({ ...t, label: tr('yantra.theme_traditional') })),
    ...customThemes.map((ct, i) => ({
      id: `custom-${i}`, label: `${tr('yantra.custom_slot_prefix')} ${i + 1}`,
      accentColor: ct.accentColor, bgColor: ct.bgColor,
      palette: ct.palette, fills: buildFills(ct.palette),
    })),
  ], [customThemes, tr])
  const isOnCustomSlot = yantraThemeIdx >= YANTRA_THEMES.length
  const activeCustomSlot = isOnCustomSlot ? yantraThemeIdx - YANTRA_THEMES.length : 0

  useEffect(() => { saveCustomYantraThemes(customThemes) }, [customThemes])

  // Prev/Next/Shuffle always land showCustomiser on whatever's correct for the
  // destination — open on a Custom slot, closed on a preset — rather than
  // hardcoding it closed. Stepping onto Custom 2 should show its editor
  // without a separate click; stepping onto Traditional should hide it.
  const handleYantraThemePrev = () => {
    const next = (yantraThemeIdx - 1 + allThemes.length) % allThemes.length
    setYantraThemeIdx(next)
    setShowCustomiser(next >= YANTRA_THEMES.length)
  }
  const handleYantraThemeNext = () => {
    const next = (yantraThemeIdx + 1) % allThemes.length
    setYantraThemeIdx(next)
    setShowCustomiser(next >= YANTRA_THEMES.length)
  }
  const handleYantraThemeShuffle = () => {
    if (allThemes.length < 2) return
    let next
    do { next = Math.floor(Math.random() * allThemes.length) } while (next === yantraThemeIdx)
    setYantraThemeIdx(next)
    setShowCustomiser(next >= YANTRA_THEMES.length)
  }
  const handleYantraCustomise = () => {
    // Already on some Custom slot → just open the editor for it. Otherwise
    // (on a preset) → land on Custom 1, don't force a specific "last edited" slot.
    setYantraThemeIdx(i => (i >= YANTRA_THEMES.length ? i : YANTRA_THEMES.length))
    setShowCustomiser(true)
    setRightPanelOpen(true)
  }
  // Undo — a plain in-memory stack per slot (not persisted; resets on
  // reload, which is the expected behaviour for undo). Every edit (palette,
  // accent, background, or Reset) pushes that slot's theme as it was
  // *before* the edit, so Undo always steps back one whole change on
  // whichever slot is currently active.
  const pushCustomHistory = () => setCustomHistories(hs => {
    const next = [...hs]
    next[activeCustomSlot] = [...next[activeCustomSlot], customThemes[activeCustomSlot]].slice(-20)
    return next
  })
  const handleCustomUndo = () => {
    const stack = customHistories[activeCustomSlot]
    if (stack.length === 0) return
    const prev = stack[stack.length - 1]
    setCustomThemes(ts => { const next = [...ts]; next[activeCustomSlot] = prev; return next })
    setCustomHistories(hs => { const next = [...hs]; next[activeCustomSlot] = next[activeCustomSlot].slice(0, -1); return next })
  }
  const handleYantraCustomReset = () => {
    pushCustomHistory()
    setCustomThemes(ts => {
      const next = [...ts]
      next[activeCustomSlot] = { palette: { ...DEFAULT_CUSTOM_PALETTE }, accentColor: YANTRA_THEMES[0].accentColor, bgColor: YANTRA_THEMES[0].bgColor }
      return next
    })
  }
  const handleCustomPaletteChange = newPalette => {
    pushCustomHistory()
    setCustomThemes(ts => { const next = [...ts]; next[activeCustomSlot] = { ...next[activeCustomSlot], palette: newPalette }; return next })
  }
  const handleCustomAccentChange = hex => {
    pushCustomHistory()
    setCustomThemes(ts => { const next = [...ts]; next[activeCustomSlot] = { ...next[activeCustomSlot], accentColor: hex }; return next })
  }
  const handleCustomBgChange = hex => {
    pushCustomHistory()
    setCustomThemes(ts => { const next = [...ts]; next[activeCustomSlot] = { ...next[activeCustomSlot], bgColor: hex }; return next })
  }

  // ── Navigate to a tab AND start Memorise mode there ───────────────────────
  //    Used by "Next circuit →" completion buttons so the user lands in
  //    Memorise mode, not Explore mode.
  const handleNavigateToMemorise = (tabId) => {
    handleTabChange(tabId)
    if (tabId === 'nyasa')        handleNyasaStartMemorise()
    else if (tabId === 'inner')   handleInnerStartMemorise()
    else if (tabId === 'gurava')  handleGuravaStartMemorise()
    else if (tabId === 'bhupura') handleBhupuraStartMemorise()
    else if (tabId === 'c2')      handleC2StartMemorise()
    else if (tabId === 'c3')      handleC3StartMemorise()
    else if (tabId === 'c4')      handleC4StartMemorise()
    else if (tabId === 'c5')           handleC5StartMemorise()
    else if (tabId === 'c6')           handleC6StartMemorise()
    else if (tabId === 'c7')           handleC7StartMemorise()
    else if (tabId === 'c8')           handleC8StartMemorise()
    else if (tabId === 'c9')           handleC9StartMemorise()
    else if (tabId === 'chakreshvari') handleNcStartMemorise()
    else if (tabId === 'closing')      handleClosingStartMemorise()
  }

  // ── Sequential navigation ──────────────────────────────────────────────────
  // visibleNavTabs excludes englishOnly tabs when a non-English language is active
  const visibleNavTabs = NAVIGABLE_TABS.filter(t => !t.englishOnly || uiLang === 'en')
  const currentTabIdx = visibleNavTabs.findIndex(t => t.id === activeTab)
  const prevTab = currentTabIdx > 0 ? visibleNavTabs[currentTabIdx - 1] : null
  const nextTab = currentTabIdx < visibleNavTabs.length - 1 ? visibleNavTabs[currentTabIdx + 1] : null

  // Redirect away from englishOnly tabs if language switches
  useEffect(() => {
    if (uiLang !== 'en' && NAVIGABLE_TABS.find(t => t.id === activeTab)?.englishOnly) {
      handleTabChange('intro')
    }
  }, [uiLang])

  // ── Footer instruction (replaces n/N counter) ─────────────────────────────
  // Shows context-appropriate hint in the footer bar so individual views don't
  // need instruction text below the SVG (freeing vertical space).
  const isInMemoriseMode =
    (activeTab === 'bhupura'      && bhupuraMemorise)  ||
    (activeTab === 'c2'           && c2Memorise)        ||
    (activeTab === 'c3'           && c3Memorise)        ||
    (activeTab === 'c4'           && c4Memorise)        ||
    (activeTab === 'c5'           && c5Memorise)        ||
    (activeTab === 'c6'           && c6Memorise)        ||
    (activeTab === 'c7'           && c7Memorise)        ||
    (activeTab === 'c8'           && c8Memorise)        ||
    (activeTab === 'c9'           && c9Memorise)        ||
    (activeTab === 'chakreshvari' && ncMemorise)        ||
    (activeTab === 'closing'      && closingMemorise)   ||
    (activeTab === 'nyasa'        && nyasaMemorise)     ||
    (activeTab === 'inner'        && innerMemorise)     ||
    (activeTab === 'gurava'       && guravaMemorse)  ||
    activeTab === 'spotcheck'    // Spot Check is always in recall mode

  const EXPLORE_TABS = new Set([
    'bhupura','c2','c3','c4','c5','c6','c7','c8','c9',
    'chakreshvari','closing','nyasa','inner','gurava','spotcheck',
  ])
  const EXPLORE_HINT = {
    bhupura:      tr('hint.dot'),
    nyasa:        tr('hint.dot'),
    inner:        tr('hint.dot'),
    gurava:       tr('hint.dot'),
    c2:           tr('hint.petal'),
    c3:           tr('hint.petal'),
    c4:           tr('hint.triangle'),
    c5:           tr('hint.triangle'),
    c6:           tr('hint.triangle'),
    c7:           tr('hint.triangle'),
    c8:           tr('hint.dot'),
    c9:           tr('hint.bindu'),
    chakreshvari: tr('hint.tripura'),
    closing:      tr('hint.closing'),
  }
  const INSTR_STYLE = { fontSize: '0.75rem', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.03em' }
  // pointer:fine = mouse (desktop), pointer:coarse = touch (iPad/phone)
  const isTouchDevice = navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches
  // Desktop (mouse) memorise instructions
  const memoInstr = (
    <span className="text-muted" style={INSTR_STYLE}>
      {tr('instr.hover_reveal')} ·{' '}
      <span className="text-red-400">click</span> = {tr('instr.click_correct').replace('click = ', '')} ·{' '}
      <span className="text-gold-400">dbl-click</span> = {tr('instr.dblclick_wrong').replace('dbl-click = ', '')} ·{' '}
      {tr('instr.right_click_toggle')}
    </span>
  )
  // Touch (iPad) memorise instructions — same wording as mobile strip
  const memoInstrTouch = (
    <span className="text-center flex flex-col gap-0.5 text-muted" style={INSTR_STYLE}>
      <span>{tr('instr.tap_reveal')} · <span className="text-red-400">{tr('instr.tap_again_correct')}</span></span>
      <span><span className="text-gold-400">{tr('instr.dbltap_wrong')}</span> · <span className="text-gold-400">{tr('instr.dbltap_toggle')}</span></span>
    </span>
  )
  const footerInstruction = activeTab === 'linedrill'
    ? (ldPhase === 'drill' ? (isTouchDevice ? memoInstrTouch : memoInstr) : null)
    : activeTab === 'segmentdrill'
    ? (sdPhase === 'drill' ? (isTouchDevice ? memoInstrTouch : memoInstr) : null)
    : activeTab === 'triangledrill'
    ? (tdPhase === 'drill' ? (isTouchDevice ? memoInstrTouch : memoInstr) : null)
    : !EXPLORE_TABS.has(activeTab) ? null
    : isInMemoriseMode
      ? activeTab === 'chakreshvari'
        ? <span className="text-center flex flex-col gap-0.5" style={INSTR_STYLE}>
            <span className="text-muted">Proceed from the outer Bhūpura to the inner Bindu</span>
            <span className="text-muted">
              {isTouchDevice
                ? <>{tr('instr.tap_reveal')} · <span className="text-red-400">{tr('instr.tap_again_correct')}</span> · <span className="text-gold-400">{tr('instr.dbltap_wrong')}</span></>
                : <>{tr('instr.hover_reveal')} · <span className="text-red-400">click</span> = {tr('instr.click_correct').replace('click = ', '')} · <span className="text-gold-400">dbl-click</span> = {tr('instr.dblclick_wrong').replace('dbl-click = ', '')}</>
              }
            </span>
          </span>
        : activeTab === 'spotcheck'
          ? <span className="hidden md:inline">{isTouchDevice ? memoInstrTouch : memoInstr}</span>
          : isTouchDevice ? memoInstrTouch : memoInstr
      : null

  // ── Right panel ────────────────────────────────────────────────────────────
  const rightPanel = (() => {
    if (activeTab === 'yantra') {
      if (!showCustomiser) return (
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold">{tr('tab.yantra')}</p>
          <p className="text-xs text-muted font-mono leading-relaxed">{tr('yantra.instr')}</p>
        </div>
      )
      return (
        <YantraThemeCustomiser
          variant="panel"
          tr={tr}
          slotLabel={allThemes[YANTRA_THEMES.length + activeCustomSlot].label}
          palette={customThemes[activeCustomSlot].palette}
          accentColor={customThemes[activeCustomSlot].accentColor}
          bgColor={customThemes[activeCustomSlot].bgColor}
          onPaletteChange={handleCustomPaletteChange}
          onAccentChange={handleCustomAccentChange}
          onBgChange={handleCustomBgChange}
          onReset={handleYantraCustomReset}
          onClose={() => setShowCustomiser(false)}
          onUndo={handleCustomUndo}
          canUndo={customHistories[activeCustomSlot].length > 0}
        />
      )
    }
    if (['intro', 'memomap', 'references'].includes(activeTab)) return null
    if (activeTab === 'linedrill') return renderLineDrillControls()
    if (activeTab === 'segmentdrill') return renderSegmentDrillControls()
    if (activeTab === 'triangledrill') return renderTriangleDrillControls()
    if (activeTab === 'bhupura' && bhupuraMemorise) {
      const bhupuraDotCount = bhupuraMemoGroup === 'all' ? BHUPURA_C1_TOTAL
        : bhupuraMemoGroup === 'siddhiShakti' ? BHUPURA_SIDDHI_TOTAL
        : bhupuraMemoGroup === 'ashtaMatrika' ? 8
        : 10 // mudraShakti
      return (
        <BhupuraMemoriseInfo
          currentSeq={bhupuraCurrentSeq}
          results={bhupuraResults}
          onMarkResult={handleBhupuraMarkResult}
          onToggleResult={handleBhupuraToggleResult}
          onRestart={handleBhupuraStartMemorise}
          onNavigate={handleNavigateToMemorise}
          script={script}
          svaminiSeq={bhupuraDotCount + 1}
          yoginiSeq={bhupuraDotCount + 2}
          tr={tr}
        />
      )
    }
    if (activeTab === 'c2' && c2Memorise) return (
      <C2MemoriseInfo
        currentSeq={c2CurrentSeq}
        results={c2Results}
        onMarkResult={handleC2MarkResult}
        onToggleResult={handleC2ToggleResult}
        onRestart={handleC2StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'c3' && c3Memorise) return (
      <C3MemoriseInfo
        currentSeq={c3CurrentSeq}
        results={c3Results}
        onMarkResult={handleC3MarkResult}
        onToggleResult={handleC3ToggleResult}
        onRestart={handleC3StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'c4' && c4Memorise) return (
      <C4MemoriseInfo
        currentSeq={c4CurrentSeq}
        results={c4Results}
        onMarkResult={handleC4MarkResult}
        onToggleResult={handleC4ToggleResult}
        onRestart={handleC4StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'c5' && c5Memorise) return (
      <C5MemoriseInfo
        currentSeq={c5CurrentSeq}
        results={c5Results}
        onMarkResult={handleC5MarkResult}
        onToggleResult={handleC5ToggleResult}
        onRestart={handleC5StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'c6' && c6Memorise) return (
      <C6MemoriseInfo
        currentSeq={c6CurrentSeq}
        results={c6Results}
        onMarkResult={handleC6MarkResult}
        onToggleResult={handleC6ToggleResult}
        onRestart={handleC6StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'c7' && c7Memorise) return (
      <C7MemoriseInfo
        currentSeq={c7CurrentSeq}
        results={c7Results}
        onMarkResult={handleC7MarkResult}
        onToggleResult={handleC7ToggleResult}
        onRestart={handleC7StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'c8' && c8Memorise) return (
      <C8MemoriseInfo
        currentSeq={c8CurrentSeq}
        results={c8Results}
        onMarkResult={handleC8MarkResult}
        onToggleResult={handleC8ToggleResult}
        onRestart={handleC8StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'c9' && c9Memorise) return (
      <C9MemoriseInfo
        currentSeq={c9CurrentSeq}
        results={c9Results}
        onMarkResult={handleC9MarkResult}
        onToggleResult={handleC9ToggleResult}
        onRestart={handleC9StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
        tr={tr}
      />
    )
    if (activeTab === 'locate') return (
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold">{tr('locate.title')}</p>

        <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.segment')}</p>
        <div className="flex flex-wrap gap-1">
          {LOCATE_SCOPES.map(s => (
            <button key={s.id} onClick={() => setLdScope(s.id)}
              className={['px-2 py-0.5 rounded text-xs font-mono transition-colors',
                ldScope === s.id ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream'].join(' ')}>
              {tr(s.trKey)}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.round_size')}</p>
          <div className="flex gap-1">
            {[10, 20, 50, 'whole'].map(n => (
              <button key={n} onClick={() => setLdLimit(n === 'whole' ? null : n)}
                className={['px-2 py-0.5 rounded text-xs font-mono transition-colors',
                  (n === 'whole' ? ldLimit === null : ldLimit === n)
                    ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream'].join(' ')}>
                {n === 'whole' ? tr('spot.whole') : n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('locate.timer')}</p>
          <div className="flex gap-1">
            {LOCATE_TIMER_OPTIONS.map(n => (
              <button key={n ?? 'off'} onClick={() => setLdTimer(n)}
                className={['px-2 py-0.5 rounded text-xs font-mono transition-colors',
                  ldTimer === n ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream'].join(' ')}>
                {n == null ? tr('locate.timer_off') : `${n}s`}
              </button>
            ))}
          </div>
        </div>

        {ldProgress.total > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-surface-800">
            <div className="flex justify-between text-xs text-muted">
              <span>{ldProgress.idx} / {ldProgress.total}</span>
              <span>
                <span style={{ color: '#c0392b' }}>{ldProgress.correct}✓</span>{' '}
                <span className="text-gold-400">{ldProgress.wrong}✗</span>{' '}
                <span style={{ color: '#8b4513' }}>{ldProgress.timeouts}⏱</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div className="h-full bg-gold-400 rounded-full transition-all"
                style={{ width: `${Math.round((ldProgress.idx / ldProgress.total) * 100)}%` }} />
            </div>
            <p className="text-xs text-muted">{tr('locate.streak')}: <span className="text-cream font-mono">{ldProgress.streak}</span></p>
          </div>
        )}

        <p className="text-xs text-muted font-mono leading-relaxed">{tr('locate.instr')}</p>
      </div>
    )
    if (activeTab === 'spotcheck') return (
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold">{tr('spot.title')}</p>

        {/* Instructions — mirrors the interaction hint shown in Segment/Line/Triangle Drill's right panel */}
        <p className="text-xs text-muted font-mono leading-relaxed">
          {isTouchDevice ? memoInstrTouch : memoInstr}
        </p>

        {/* Filter buttons */}
        <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.segment')}</p>
        <div className="flex flex-wrap gap-1">
          {SC_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => { setScFilter(f.id); const filt = SC_FILTERS.find(sf => sf.id === f.id); const def = 'defaultSubFilter' in (filt ?? {}) ? filt.defaultSubFilter : (filt?.subFilters?.find(s => s.groupIds !== null)?.id ?? null); setScSubFilter(def) }}
              className={[
                'px-2 py-0.5 rounded text-xs font-mono transition-colors',
                scFilter === f.id
                  ? 'bg-gold-400 text-surface-900 font-bold'
                  : 'bg-surface-800 text-muted hover:text-cream',
              ].join(' ')}
            >
              {f.trKey && uiLang !== 'en' ? tr(f.trKey) : (script === 'english' ? (f.labelEn || f.label) : f.label)}
            </button>
          ))}
        </div>

        {/* Sub-filter row — shown when active segment has sub-groups */}
        {(() => {
          const activeFilt = SC_FILTERS.find(f => f.id === scFilter)
          if (!activeFilt?.subFilters) return null
          return (
            <div className="flex gap-1">
              {activeFilt.subFilters.map(s => (
                <button
                  key={s.id}
                  onClick={() => setScSubFilter(s.groupIds === null ? null : s.id)}
                  className={[
                    'flex-1 py-0.5 rounded text-xs font-mono transition-colors text-center',
                    (s.groupIds === null ? scSubFilter === null : scSubFilter === s.id)
                      ? 'bg-gold-400 text-surface-900 font-bold'
                      : 'bg-surface-800 text-muted hover:text-cream',
                  ].join(' ')}
                >
                  {s.trKey && uiLang !== 'en' ? tr(s.trKey) : (script === 'english' ? (s.labelEn || s.label) : s.label)}
                </button>
              ))}
            </div>
          )
        })()}

        {/* Limit buttons */}
        <div className="space-y-1">
          <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.round_size')}</p>
          <div className="flex gap-1">
            {[10, 20, 50, 'whole'].map(n => (
              <button
                key={n}
                onClick={() => setScLimit(n === 'whole' ? null : n)}
                className={[
                  'px-2 py-0.5 rounded text-xs font-mono transition-colors',
                  (n === 'whole' ? scLimit === null : scLimit === n)
                    ? 'bg-gold-400 text-surface-900 font-bold'
                    : 'bg-surface-800 text-muted hover:text-cream',
                ].join(' ')}
              >
                {n === 'whole' ? tr('spot.whole') : n}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        {scProgress.total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted">
              <span>{scProgress.idx} / {scProgress.total}</span>
              <span>
                <span className="text-red-400">{scProgress.correct}✓</span>
                {' '}
                <span className="text-gold-400">{scProgress.wrong}✗</span>
              </span>
            </div>
            <div className="w-full h-1 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-400 rounded-full transition-all"
                style={{ width: `${Math.round((scProgress.idx / scProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={() => scSkipRef.current?.()}
          className="w-full py-1 rounded bg-surface-800 text-xs text-muted hover:text-cream hover:bg-surface-700 transition-colors font-mono"
        >
          {tr('btn.skip')}
        </button>

        {/* Scores */}
        {(scProgress.idx > 0 || sessionStats.total > 0) && (() => {
          const roundPct  = scProgress.idx > 0 ? Math.round((scProgress.correct / scProgress.idx) * 100) : null
          const sesCorrect = sessionStats.correct + scProgress.correct
          const sesTotal   = sessionStats.total   + scProgress.idx
          const sesPct     = sesTotal > 0 ? Math.round((sesCorrect / sesTotal) * 100) : null
          return (
            <div className="space-y-1 pt-1 border-t border-surface-800">
              <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold" style={{ fontSize: '9px' }}>{tr('score.scores')}</p>
              {scProgress.idx > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">{tr('score.round')}</span>
                  <span>
                    <span className="text-cream font-mono">{scProgress.correct}/{scProgress.idx}</span>
                    <span className="text-muted ml-1.5">{roundPct}%</span>
                  </span>
                </div>
              )}
              {sesTotal > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">{tr('score.session')}</span>
                  <span>
                    <span className="text-cream font-mono">{sesCorrect}/{sesTotal}</span>
                    <span className="text-muted ml-1.5">{sesPct}%</span>
                  </span>
                </div>
              )}
            </div>
          )
        })()}

      </div>
    )
    if (selectedDeity) return <DeityDetail deity={selectedDeity} script={script} uiLang={uiLang} />

    // Inner (Tithi Nitya) memo — moon toggle in same position as explore
    if (activeTab === 'inner' && innerMemorise) {
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="inner" script={script}
                                          uiLang={uiLang} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3">
            <div className="flex gap-1.5 pt-2">
              <button
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${!innerWaning ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}
                onClick={() => handleInnerSetWaning(false)}
              >{tr('inner.waxing')}</button>
              <button
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${innerWaning ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}
                onClick={() => handleInnerSetWaning(true)}
              >{tr('inner.waning')}</button>
            </div>
          </div>
        </div>
      )
    }

    // Inner (Tithi Nitya) explore list
    if (activeTab === 'inner' && !innerMemorise) {
      const allNitya  = deities.filter(d => d.sectionId === 'nitya').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      const maha      = allNitya[15]
      const first15   = allNitya.slice(0, 15)
      const innerList = innerWaning ? [...first15.slice().reverse(), maha] : allNitya
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="inner" script={script}
                                          uiLang={uiLang} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-1">
            <div className="flex gap-1.5 pt-2 pb-1">
              <button
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${!innerWaning ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}
                onClick={() => setInnerWaning(false)}
              >{tr('inner.waxing')}</button>
              <button
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${innerWaning ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}
                onClick={() => setInnerWaning(true)}
              >{tr('inner.waning')}</button>
            </div>
          </div>
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setInnerShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{innerShowList ? '↑' : '↓'}</span>
            </button>
            {innerShowList && (
              <div className="space-y-0.5">
                {innerList.map((d, i) => (
                  <div key={d.id}
                    className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setInnerHighlightId(d.id)}
                    onMouseLeave={() => setInnerHighlightId(null)}
                  >
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(i + 1, uiLang)}{numDot(uiLang)}</span>
                    <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                      <FuriganaName deity={d} script={script} uiLang={uiLang} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Gurava explore list
    if (activeTab === 'gurava' && !guravaMemorse) {
      const guravaGroups = [
        { sectionId: 'guru-divya',  label: tr('gurava.divya')  },
        { sectionId: 'guru-siddha', label: tr('gurava.siddha') },
        { sectionId: 'guru-manava', label: tr('gurava.manava') },
      ].map(g => ({
        ...g,
        list: deities.filter(d => d.sectionId === g.sectionId).sort((a, b) => a.sequenceInSection - b.sequenceInSection),
      }))
      let runningIdx = 0
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="gurava" script={script}
                                          uiLang={uiLang} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setGuravaShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{guravaShowList ? '↑' : '↓'}</span>
            </button>
            {guravaShowList && (
              <div className="space-y-2">
                {guravaGroups.map(({ label, list }) => (
                  <div key={label}>
                    <p className="iast text-xs font-mono text-muted uppercase tracking-widest pb-0.5">{label}</p>
                    <div>
                      {list.map(d => {
                        const n = ++runningIdx
                        return (
                          <div key={d.id}
                            className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                            onMouseEnter={() => setGuravaHighlightId(d.id)}
                            onMouseLeave={() => setGuravaHighlightId(null)}
                          >
                            <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(n, uiLang)}{numDot(uiLang)}</span>
                            <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                              <FuriganaName deity={d} script={script} uiLang={uiLang} />
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Nyasa explore list
    if (activeTab === 'nyasa' && !nyasaMemorise) {
      const nyasaList = deities
        .filter(d => d.sectionId === 'nyasa')
        .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="nyasa" script={script}
                                          uiLang={uiLang} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setNyasaShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{nyasaShowList ? '↑' : '↓'}</span>
            </button>
            {nyasaShowList && (
              <div className="space-y-0.5">
                {nyasaList.map(d => (
                  <div key={d.id}
                    className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setNyasaHighlightId(d.id)}
                    onMouseLeave={() => setNyasaHighlightId(null)}
                  >
                    <span className="text-muted font-mono w-4 flex-shrink-0 text-right text-xs">{localNum(d.sequenceInSection, uiLang)}{numDot(uiLang)}</span>
                    <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                      <FuriganaName deity={d} script={script} uiLang={uiLang} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Circuits 3–7 explore lists
    for (const [tab, cNum, total, hSet, showList, setShowList, setHighlight, isMem] of [
      ['c3', 3,  8, setC3HighlightId, c3ShowList, setC3ShowList, setC3HighlightId, c3Memorise],
      ['c4', 4, 14, setC4HighlightId, c4ShowList, setC4ShowList, setC4HighlightId, c4Memorise],
      ['c5', 5, 10, setC5HighlightId, c5ShowList, setC5ShowList, setC5HighlightId, c5Memorise],
      ['c6', 6, 10, setC6HighlightId, c6ShowList, setC6ShowList, setC6HighlightId, c6Memorise],
      ['c7', 7,  8, setC7HighlightId, c7ShowList, setC7ShowList, setC7HighlightId, c7Memorise],
    ]) {
      if (activeTab === tab && !isMem) {
        const list = deities
          .filter(d => d.sectionId === `circuit-${cNum}` && d.role === 'deity')
          .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
        return (
          <div className="overflow-y-auto">
            <SectionInfo tabId={tab} script={script}
                                          uiLang={uiLang} showRows={false} tr={tr} />
            <div className="border-t border-surface-700 px-3 pb-3">
              <button
                className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
                onClick={() => setShowList(l => !l)}
              >
                <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
                <span>{showList ? '↑' : '↓'}</span>
              </button>
              {showList && (
                <div>
                  {list.map((d, i) => (
                    <div key={d.id}
                      className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                      onMouseEnter={() => setHighlight(d.id)}
                      onMouseLeave={() => setHighlight(null)}
                    >
                      <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(i + 1, uiLang)}{numDot(uiLang)}</span>
                      <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                        <FuriganaName deity={d} script={script} uiLang={uiLang} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <CircuitRows circuitNumber={cNum} script={script}
                                           uiLang={uiLang} onHoverFill={setCircuitFillAll} tr={tr} />
          </div>
        )
      }
    }

    // Circuit 2 explore list
    if (activeTab === 'c2' && !c2Memorise) {
      const c2List = deities
        .filter(d => d.sectionId === 'circuit-2' && d.role === 'deity')
        .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="c2" script={script}
                                          uiLang={uiLang} showRows={false} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setC2ShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{c2ShowList ? '↑' : '↓'}</span>
            </button>
            {c2ShowList && (
              <div>
                {c2List.map((d, i) => (
                  <div key={d.id}
                    className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setC2HighlightId(d.id)}
                    onMouseLeave={() => setC2HighlightId(null)}
                  >
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(i + 1, uiLang)}{numDot(uiLang)}</span>
                    <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                      <FuriganaName deity={d} script={script} uiLang={uiLang} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CircuitRows circuitNumber={2} script={script}
                                           uiLang={uiLang} onHoverFill={setCircuitFillAll} tr={tr} />
        </div>
      )
    }

    // Nava Chakreshvari explore list
    if (activeTab === 'chakreshvari' && !ncMemorise) {
      const ncList = deities
        .filter(d => d.sectionId === 'chakreshvari')
        .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="chakreshvari" script={script}
                                          uiLang={uiLang} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setNcShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{ncShowList ? '↑' : '↓'}</span>
            </button>
            {ncShowList && (
              <div>
                {ncList.map((d, i) => (
                  <div key={d.id}
                    className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setNcHighlightCircuit(d.circuitNumber ?? d.sequenceInSection)}
                    onMouseLeave={() => setNcHighlightCircuit(null)}
                  >
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(i + 1, uiLang)}{numDot(uiLang)}</span>
                    <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                      <FuriganaName deity={d} script={script} uiLang={uiLang} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Circuit 9 explore — single deity
    if (activeTab === 'c9' && !c9Memorise) {
      const c9d = deities.find(d => d.sectionId === 'circuit-9' && d.role === 'deity')
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="c9" script={script}
                                          uiLang={uiLang} showRows={false} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3 pt-2">
            <p className="font-mono uppercase tracking-widest text-xs text-muted pb-1.5">{tr('deity.singular')}</p>
            {c9d && (
              <p
                className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-400 rounded px-1 -mx-1 hover:bg-surface-700 transition-colors cursor-default`}
                onMouseEnter={() => setCircuitFillAll(true)}
                onMouseLeave={() => setCircuitFillAll(false)}
              >
                <FuriganaName deity={c9d} script={script} uiLang={uiLang} />
              </p>
            )}
          </div>
          <CircuitRows circuitNumber={9} script={script}
                                           uiLang={uiLang} onHoverFill={setCircuitFillAll} tr={tr} />
        </div>
      )
    }

    // Circuit 8 explore list
    if (activeTab === 'c8' && !c8Memorise) {
      const c8List = deities
        .filter(d => d.sectionId === 'circuit-8' && d.role === 'deity')
        .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="c8" script={script}
                                          uiLang={uiLang} showRows={false} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setC8ShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{c8ShowList ? '↑' : '↓'}</span>
            </button>
            {c8ShowList && (
              <div>
                {c8List.map((d, i) => (
                  <div key={d.id}
                    className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setC8HighlightId(d.id)}
                    onMouseLeave={() => setC8HighlightId(null)}
                  >
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(i + 1, uiLang)}{numDot(uiLang)}</span>
                    <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                      <FuriganaName deity={d} script={script} uiLang={uiLang} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CircuitRows circuitNumber={8} script={script}
                                           uiLang={uiLang} onHoverFill={setCircuitFillAll} tr={tr} />
        </div>
      )
    }

    // Bhupura (Circuit 1) explore list
    if (activeTab === 'bhupura' && !bhupuraMemorise) {
      const siddhiList  = deities.filter(d => d.sectionId === 'circuit-1' && d.group === 'siddhiShakti').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      const matrikaList = deities.filter(d => d.sectionId === 'circuit-1' && d.group === 'ashtaMatrika').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      const mudraList   = deities.filter(d => d.sectionId === 'circuit-1' && d.group === 'mudraShakti').sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      const groups = [
        { label: tr('bhupura.siddhi'),  list: siddhiList  },
        { label: tr('bhupura.matrika'), list: matrikaList },
        { label: tr('bhupura.mudra'),   list: mudraList   },
      ]
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="bhupura" script={script}
                                          uiLang={uiLang} showRows={false} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-1">
            <div className="flex gap-1.5 pt-2 pb-1">
              <button
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${!bhupuraShowColors ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}
                onClick={() => setBhupuraShowColors(false)}
              >{tr('toggle.plain')}</button>
              <button
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${bhupuraShowColors ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}
                onClick={() => setBhupuraShowColors(true)}
              >{tr('toggle.colours')}</button>
            </div>
          </div>
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setBhupuraShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{bhupuraShowList ? '↑' : '↓'}</span>
            </button>
            {bhupuraShowList && (
              <div className="space-y-2">
                {groups.map(({ label, list }) => (
                  <div key={label}>
                    <p className="text-xs font-mono text-muted uppercase tracking-widest pb-0.5">{label}</p>
                    <div>
                      {list.map(d => (
                        <div key={d.id}
                          className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                          onMouseEnter={() => setBhupuraHighlightId(d.id)}
                          onMouseLeave={() => setBhupuraHighlightId(null)}
                        >
                          <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(d.sequenceInSection, uiLang)}{numDot(uiLang)}</span>
                          <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                            <FuriganaName deity={d} script={script} uiLang={uiLang} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CircuitRows circuitNumber={1} script={script}
                                           uiLang={uiLang} onHoverFill={setCircuitFillAll} tr={tr} />
        </div>
      )
    }

    // Closing explore list
    if (activeTab === 'closing' && !closingMemorise) {
      const closingList = deities
        .filter(d => d.sectionId === 'closing')
        .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="closing" script={script}
                                          uiLang={uiLang} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3">
            <button
              className="w-full flex items-center justify-between py-2 text-xs text-muted hover:text-cream transition-colors"
              onClick={() => setClosingShowList(l => !l)}
            >
              <span className="font-mono uppercase tracking-widest">{tr('score.deity_list')}</span>
              <span>{closingShowList ? '↑' : '↓'}</span>
            </button>
            {closingShowList && (
              <div>
                {closingList.map((d, i) => (
                  <div key={d.id}
                    className="px-2 py-px rounded-lg text-sm transition-colors hover:bg-surface-700 flex items-center gap-2 cursor-default"
                    onMouseEnter={() => setClosingListHighlight(true)}
                    onMouseLeave={() => setClosingListHighlight(false)}
                  >
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{localNum(i + 1, uiLang)}{numDot(uiLang)}</span>
                    <span className={`${script === 'devanagari' ? 'text-sm ' : ['kannada','malayalam','tamil','telugu'].includes(script) ? 'iast text-xs ' : 'iast text-base '}text-gold-400`}>
                      <FuriganaName deity={d} script={script} uiLang={uiLang} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    return <SectionInfo tabId={activeTab} script={script}
                                          uiLang={uiLang} tr={tr} />
  })()

  // ── Yantra-tab sidebar controls (removed — Yantra tab is now a pure display) ─
  const yantraControls = false && activeTab === 'yantra' && (
    <div className="border-t border-surface-800 flex-shrink-0">
      {/* Collapsible header */}
      <button
        onClick={() => setControlsOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-2 text-xs text-muted uppercase tracking-widest font-mono hover:text-cream transition-colors"
      >
        <span>{tr('yantra.controls')}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          width="10" height="10"
          fill="currentColor"
          style={{ transform: controlsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M6 8.5 L1 3.5 L11 3.5 Z" />
        </svg>
      </button>
      {/* Collapsible body */}
      {controlsOpen && (
        <div className="px-3 pb-2">
          <ToggleRow label={tr('yantra.triangles')} active={showTriangles}
            onClick={() => setShowTriangles(t => !t)} />
          <ToggleRow label={tr('yantra.numbers')} active={showNumbers}
            onClick={() => { setShowNumbers(n => !n); setLastTapped(null); if (selectedCircuit) setSelectedCircuit(null) }} />
          <ToggleRow label={tr('yantra.labels')} active={showLabels}
            onClick={() => setShowLabels(l => !l)} />
          <ToggleRow label={tr('yantra.seed_of_life')} active={showSeedOfLife} colour="blue"
            onClick={() => setShowSeedOfLife(s => !s)} />
          {showSeedOfLife && (
            <div className="flex items-center gap-2 mt-1 px-2">
              <span className="text-xs text-muted flex-shrink-0">r={seedR}</span>
              <input
                type="range" min={40} max={120} step={1} value={seedR}
                onChange={e => setSeedR(Number(e.target.value))}
                className="flex-1 accent-blue-500"
                style={{ height: '4px' }}
              />
            </div>
          )}
          {hasFills && (
            <button
              onClick={() => { setFilledRegions({}); setLastTapped(null) }}
              className="w-full text-left text-xs px-2 py-1.5 text-muted hover:text-cream transition-colors rounded-md flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-surface-600 flex-shrink-0" />
              Clear fills
            </button>
          )}
        </div>
      )}
    </div>
  )

  // ── Mobile Explore/Memorise control lookup ───────────────────────────────
  const mobileCtrl = {
    nyasa:        { isMemorise: nyasaMemorise,   onExplore: handleNyasaExitMemorise,   onMemorise: handleNyasaStartMemorise   },
    inner:        { isMemorise: innerMemorise,   onExplore: handleInnerExitMemorise,   onMemorise: handleInnerStartMemorise   },
    gurava:       { isMemorise: guravaMemorse,   onExplore: handleGuravaExitMemorise,  onMemorise: handleGuravaStartMemorise  },
    bhupura:      { isMemorise: bhupuraMemorise, onExplore: handleBhupuraExitMemorise, onMemorise: handleBhupuraStartMemorise },
    c2:           { isMemorise: c2Memorise,      onExplore: handleC2ExitMemorise,      onMemorise: handleC2StartMemorise      },
    c3:           { isMemorise: c3Memorise,      onExplore: handleC3ExitMemorise,      onMemorise: handleC3StartMemorise      },
    c4:           { isMemorise: c4Memorise,      onExplore: handleC4ExitMemorise,      onMemorise: handleC4StartMemorise      },
    c5:           { isMemorise: c5Memorise,      onExplore: handleC5ExitMemorise,      onMemorise: handleC5StartMemorise      },
    c6:           { isMemorise: c6Memorise,      onExplore: handleC6ExitMemorise,      onMemorise: handleC6StartMemorise      },
    c7:           { isMemorise: c7Memorise,      onExplore: handleC7ExitMemorise,      onMemorise: handleC7StartMemorise      },
    c8:           { isMemorise: c8Memorise,      onExplore: handleC8ExitMemorise,      onMemorise: handleC8StartMemorise      },
    c9:           { isMemorise: c9Memorise,      onExplore: handleC9ExitMemorise,      onMemorise: handleC9StartMemorise      },
    chakreshvari: { isMemorise: ncMemorise,      onExplore: handleNcExitMemorise,      onMemorise: handleNcStartMemorise      },
    closing:      { isMemorise: closingMemorise, onExplore: handleClosingExitMemorise, onMemorise: handleClosingStartMemorise },
  }[activeTab] ?? null

  return (
    <div className={`h-[100dvh] flex flex-col bg-surface-950 text-cream overflow-hidden${uiLang === 'ja' ? ' lang-ja' : ''}`}>

      {/* ── Portrait lock overlay — tablet only, shown via #portrait-lock-overlay's
          CSS rule in index.css (orientation:portrait + pointer:coarse), not
          Tailwind classes — inline display:none by default, overridden with
          !important there. Same message/treatment as the mobile landscape-lock
          overlay below (Chris, 2026-08-25: "add the 'Please rotate your device'
          message from mobile view to iPad view").
          Bug fix (2026-08-25, from Chris's iPad screenshot): background was
          `bg-surface-950`, a shade that was never defined in tailwind.config.js
          (surface only goes up to 900) — Tailwind silently drops unknown
          classes, so the overlay had NO background at all, letting the page
          underneath show through and burying the gold icon in the page's own
          gold text. Now set as an inline style so it can't silently vanish
          again if the Tailwind scale ever changes. */}
      <div id="portrait-lock-overlay"
           className="fixed inset-0 z-[9999] flex-col items-center justify-center gap-4 text-center px-8"
           style={{ display: 'none', backgroundColor: '#0f0a05' }}>
        <svg viewBox="0 0 24 24" className="w-16 h-16 text-gold-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <p className="iast text-lg font-medium px-4 py-1.5 rounded-lg bg-black/40" style={{ color: '#c0392b' }}>Please rotate your device</p>
        <p className="text-muted text-sm">{tr('device.landscape')}</p>
      </div>

      {/* ── Site tour portal (renders to document.body via createPortal) ──── */}
      {tourElement}

      {/* ── Landscape lock overlay — phone only, driven by the showLandscapeLock
          JS state above, not a CSS media query any more.
          Bug history (2026-08-25): first version used Tailwind's `md:!hidden`
          (768px width), which large phones can exceed in landscape — fixed
          to a height-based CSS media query, but that STILL didn't fire on
          Chris's actual phone (confirmed via screenshot: normal unlocked
          layout showing in landscape) even though the near-identical CSS
          approach works fine for the tablet overlay above. Rather than guess
          at a third CSS threshold, moved the whole check to JS — directly
          testable/debuggable, and not dependent on the `pointer` media
          feature, which is the most likely culprit for the mismatch. */}
      <div id="landscape-lock-overlay"
           className="fixed inset-0 z-[9999] flex-col items-center justify-center gap-4 px-8 text-center"
           style={{ display: showLandscapeLock ? 'flex' : 'none', backgroundColor: '#0f0a05' }}>
        <svg viewBox="0 0 24 24" className="w-16 h-16 text-gold-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <p className="iast text-lg font-medium px-4 py-1.5 rounded-lg bg-black/40" style={{ color: '#c0392b' }}>Please rotate your device</p>
        <p className="text-muted text-sm">{tr('device.portrait')}</p>
      </div>

      {/* ── Mobile drawer backdrop ───────────────────────────────────────── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden"
             onClick={() => setMobileNavOpen(false)} />
      )}


      {/* ── Mobile top bar (portrait only) ──────────────────────────────── */}
      <div className="flex md:hidden flex-shrink-0 min-h-[2.75rem] items-center px-3 gap-2 bg-surface-950 border-b border-surface-800 z-30" style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem' }}>
        <button
          onClick={() => setMobileNavOpen(o => !o)}
          className="w-8 h-8 flex items-center justify-center text-muted hover:text-cream transition-colors"
          style={{ fontSize: 20 }}
          aria-label={tr('nav.open')}
        >
          ☰
        </button>
        <div className={`flex-1 min-w-0 flex flex-col justify-center ${uiLang === 'en' ? 'iast' : ''}`}>
          <span className="text-sm font-medium truncate text-gold-400">
            {(() => {
              const tab = TABS.find(t => t.id === activeTab)
              if (!tab) return ''
              if (tab.trKey) return tr(tab.trKey)
              if (uiLang === 'hi' || uiLang === 'mr' || uiLang === 'ne') return tab.navLabelDev || tab.navLabel
              if (uiLang === 'te') return tab.navLabelTe  || tab.navLabel
              if (uiLang === 'ta') return tab.navLabelTa  || tab.navLabel
              if (uiLang === 'kn') return tab.navLabelKn  || tab.navLabel
              if (uiLang === 'ml') return tab.navLabelMl  || tab.navLabel
              if (uiLang === 'bn') return tab.navLabelBn  || tab.navLabel
              if (uiLang === 'gu') return tab.navLabelGu  || tab.navLabel
              if (uiLang === 'ja') return tab.navLabelJa  || tab.navLabel
              if (uiLang === 'en' || uiLang === 'fr' || uiLang === 'es' || uiLang === 'it' || uiLang === 'pt' || uiLang === 'de' || uiLang === 'ru') return tab.navLabelEn  || tab.navLabel
              return tab.navLabel
            })()}
          </span>
          {(() => {
            const parts = geomParts(activeTab, uiLang)
            if (!parts) return null
            if (uiLang === 'ja' && AVARANA_KANA[activeTab]) {
              return (
                <span className="iast text-[11px] text-muted leading-none mt-0.5">
                  <ruby>{parts.name}<rt style={{ fontSize: '9px', opacity: 0.75 }}>{AVARANA_KANA[activeTab]}</rt></ruby>
                  {parts.desc && <> ({parts.desc})</>}
                </span>
              )
            }
            return (
              <span className="iast text-[11px] text-muted truncate leading-none mt-0.5">
                {parts.name}{parts.desc && ` (${parts.desc})`}
              </span>
            )
          })()}
        </div>
        <div ref={mobileDropdownRef} className="flex items-center gap-1.5 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(m => !m); setShowMobileScriptMenu(false) }}
              title={tr('btn.lang_picker')}
              className="w-7 h-7 flex items-center justify-center rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-500 transition-colors"
            >
              <Globe size={13} />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-8 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50 py-1 min-w-[210px]">
                <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted border-b border-surface-700 mb-1">Language</p>
                {uiLang === 'en' && (
                  <label className="flex items-center gap-2 pl-5 pr-3 py-1 cursor-pointer hover:bg-surface-700 border-b border-surface-700"
                    onClick={() => { setUsEnglish(v => !v); setShowLangMenu(false) }}>
                    <span className={`w-2.5 h-2.5 rounded-sm border flex-shrink-0 flex items-center justify-center
                      ${usEnglish ? 'bg-amber-500 border-amber-500' : 'border-cream/40 bg-transparent'}`}>
                      {usEnglish && <span className="text-[7px] text-black font-bold leading-none">✓</span>}
                    </span>
                    <span className={`text-[11px] ${usEnglish ? 'text-gold-300' : 'text-muted'}`}>American English</span>
                  </label>
                )}
                {LANG_OPTIONS.map(opt => (
                  <button key={opt.code} onClick={() => handleLangChange(opt.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-surface-700 flex items-center justify-between
                      ${uiLang === opt.code ? 'text-cream' : 'text-muted'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {opt.label}
                      {opt.englishName && <span className="text-[11px] opacity-60">({opt.englishName})</span>}
                      {opt.beta && <span className="text-[9px] text-amber-500 font-mono">β</span>}
                    </span>
                    {uiLang === opt.code && <span className="text-gold-400">✓</span>}
                  </button>
                ))}
                <p className="px-3 pt-1 pb-0.5 text-[9px] text-muted border-t border-surface-700 mt-1">β = AI translation, needs review</p>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setShowMobileScriptMenu(m => !m); setShowLangMenu(false) }}
              title={tr('ui.script')}
              className="w-7 h-7 flex items-center justify-center rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-500 transition-colors"
            >
              <PenLine size={13} />
            </button>
            {showMobileScriptMenu && (
              <div className="absolute right-0 top-8 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
                <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted border-b border-surface-700 mb-1">{tr('ui.script')}</p>
                {LOCALE_ORDER.map(id => (
                  <button key={id} onClick={() => { setScript(id); setShowMobileScriptMenu(false) }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center justify-between
                      ${id === script ? 'text-gold-300 bg-gold-900/20' : 'text-muted hover:text-gold-300 hover:bg-surface-700'}`}>
                    {LOCALE_CONFIG[id].label}
                    {id === script && <span className="text-gold-400 text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile drill precision hint (2026-08-25) ─────────────────────────
          Banner (see MOBILE_DRILL_HINT_KEY above) — nudges toward tablet/
          desktop + stylus, or pinch-zooming, since closely spaced dots/
          triangles are hard to tap accurately on a phone touchscreen.
          Scoped to the 5 precision-tapping drill tabs only. × closes it for
          this visit only; the checkbox is what makes it permanent. */}
      {!mobileDrillHintDismissed && MOBILE_DRILL_HINT_TAB_IDS.includes(activeTab) && (
        <div className="md:hidden flex-shrink-0 flex flex-col gap-1.5 px-3 py-2 bg-gold-900/20 border-b border-gold-700/30">
          <div className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" width="14" height="14" className="flex-shrink-0 mt-0.5" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="flex-1 text-[11px] text-muted leading-snug">
              {tr('mobile.drill_hint')}
            </p>
            <button
              onClick={dismissMobileDrillHint}
              aria-label={tr('btn.dismiss')}
              className="text-muted hover:text-cream text-sm leading-none px-1 flex-shrink-0"
            >
              ✕
            </button>
          </div>
          <label className="flex items-center gap-1.5 pl-6 cursor-pointer">
            <input
              type="checkbox"
              checked={mobileDrillHintDontShowAgain}
              onChange={e => setMobileDrillHintDontShowAgain(e.target.checked)}
              className="w-3 h-3 accent-gold-500"
            />
            <span className="text-[10px] text-muted">{tr('mobile.drill_hint_dont_show_again')}</span>
          </label>
        </div>
      )}

      {/* ── 3-column content row ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside data-tour="sidebar"
        className={`flex-shrink-0 flex flex-col border-r border-surface-800 bg-surface-900
          fixed inset-y-0 left-0 z-50 transition-all duration-300
          md:relative md:translate-x-0 md:z-auto
          w-72 ${navCollapsed ? 'md:w-12' : 'md:w-72'}
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Title block */}
        <div className={`${navCollapsed ? 'px-1.5 pt-3 pb-3' : 'px-4 pt-4 pb-3'} border-b border-surface-800 flex-shrink-0`}>
          <div className={`flex gap-1 ${navCollapsed ? 'items-center justify-center' : 'items-start justify-between'}`}>
            {!navCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="iast text-gold-400 text-base font-semibold tracking-wide leading-tight">
                  śrī yantra memoriser
                </h1>
                <p className="iast mt-1 text-muted italic" style={{ fontSize: '13px', letterSpacing: '0.03em' }}>
                  for the Khadgamala Stotram
                </p>
              </div>
            )}
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              {!navCollapsed && (<>
                {/* Language picker */}
                <div ref={sidebarLangRef} className="relative group/lang">
                  <button
                    onClick={() => setShowSidebarLangMenu(m => !m)}
                    className="w-5 h-5 rounded-full border border-surface-600 text-muted hover:text-cream hover:border-gold-500 transition-colors flex items-center justify-center"
                  >
                    <Globe size={11} />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-6 px-1.5 py-0.5 rounded text-[10px] bg-surface-700 text-cream whitespace-nowrap opacity-0 group-hover/lang:opacity-100 transition-opacity z-50">
                    Language
                  </div>
                  {showSidebarLangMenu && (
                    <div className="absolute left-0 top-6 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50 py-1 min-w-[210px]">
                      {uiLang === 'en' && (
                        <label className={`flex items-center gap-2 pl-5 pr-3 py-1 cursor-pointer hover:bg-surface-700 border-b border-surface-700`}
                          onClick={() => { setUsEnglish(v => !v); setShowSidebarLangMenu(false) }}>
                          <span className={`w-2.5 h-2.5 rounded-sm border flex-shrink-0 flex items-center justify-center
                            ${usEnglish ? 'bg-amber-500 border-amber-500' : 'border-cream/40 bg-transparent'}`}>
                            {usEnglish && <span className="text-[7px] text-black font-bold leading-none">✓</span>}
                          </span>
                          <span className={`text-[11px] ${usEnglish ? 'text-gold-300' : 'text-muted'}`}>American English</span>
                        </label>
                      )}
                      {LANG_OPTIONS.map(opt => (
                        <button key={opt.code} onClick={() => handleLangChange(opt.code)}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-surface-700 flex items-center justify-between
                            ${uiLang === opt.code ? 'text-cream' : 'text-muted'}`}
                        >
                          <span className="flex items-center gap-1.5">
                            {opt.label}
                            {opt.englishName && <span className="text-[11px] opacity-60">({opt.englishName})</span>}
                            {opt.beta && <span className="text-[9px] text-amber-500 font-mono">β</span>}
                          </span>
                          {uiLang === opt.code && <span className="text-gold-400">✓</span>}
                        </button>
                      ))}
                      <p className="px-3 pt-1 pb-0.5 text-[9px] text-muted border-t border-surface-700 mt-1">β = AI translation, needs review</p>
                    </div>
                  )}
                </div>
                {/* Tour trigger button */}
                <div className="relative group/tour">
                  <button
                    data-tour="tour-btn"
                    onClick={startTour}
                    className="w-5 h-5 rounded-full border border-surface-600 text-muted hover:text-cream hover:border-gold-500 transition-colors flex items-center justify-center"
                  >
                    <Plane size={11} />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-6 px-1.5 py-0.5 rounded text-[10px] bg-surface-700 text-cream whitespace-nowrap opacity-0 group-hover/tour:opacity-100 transition-opacity z-50">
                    {tr('nav.take_tour')}
                  </div>
                </div>
              </>)}
              {/* Collapse toggle */}
              <div className="relative group/collapse">
                <button
                  onClick={() => setNavCollapsed(c => !c)}
                  className="w-5 h-5 rounded border border-surface-600 text-muted hover:text-cream hover:border-gold-500 transition-colors flex items-center justify-center"
                  style={{ fontSize: 11, fontFamily: 'monospace' }}
                >
                  {navCollapsed ? '»' : '«'}
                </button>
                <div className="ipad-collapse-tooltip pointer-events-none absolute right-0 top-6 px-1.5 py-0.5 rounded text-[10px] bg-surface-700 text-cream whitespace-nowrap opacity-0 group-hover/collapse:opacity-100 transition-opacity z-50">
                  {navCollapsed ? tr('nav.expand') : tr('nav.collapse')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation — hidden when collapsed */}
        {!navCollapsed && (<>
        <nav className="flex-1 overflow-y-auto py-2 px-2 min-h-0">
          {(() => {
            let currentHeadingId = null
            return TABS.map((tab, i) => {
              if (tab.heading) {
                currentHeadingId = tab.id
                const isOpen = openSections[tab.id]
                return (
                  <button
                    key={tab.id}
                    onClick={() => setOpenSections(s => ({ ...s, [tab.id]: !s[tab.id] }))}
                    className={`w-full flex items-center justify-between px-2 pb-0.5 select-none hover:text-white transition-colors ${i === 0 ? 'pt-1' : 'pt-3'}`}
                    {...(TOUR_HEADING_IDS[tab.id] ? { 'data-tour': TOUR_HEADING_IDS[tab.id] } : {})}
                  >
                    <span className={`flex-1 text-left text-cream leading-tight tracking-[0.05em] ${uiLang === 'ja' ? 'text-[13px]' : 'text-[11px] font-mono uppercase'}`}>
                      {tab.trKey ? tr(tab.trKey) : tab.heading}
                    </span>
                    <span className="text-cream text-[11px]">{isOpen ? '▾' : '▸'}</span>
                  </button>
                )
              }
              if (currentHeadingId !== null && !openSections[currentHeadingId]) return null
              if (tab.englishOnly && uiLang !== 'en') return null
              const dot = tabDotMap[tab.id]
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left ${script === 'iast' || script === 'english' || script === 'devanagari' ? 'text-sm' : 'text-sm md:text-xs'} px-2 py-1.5 rounded-md transition-colors flex items-center justify-between gap-1
                    ${(script === 'iast' || script === 'english' || (tab.trKey && uiLang === 'en')) ? 'iast' : ''}
                    ${activeTab === tab.id
                      ? 'text-gold-300 bg-gold-900/30'
                      : 'text-muted hover:text-cream'}`}
                  {...(TOUR_NAV_IDS[tab.id] ? { 'data-tour': TOUR_NAV_IDS[tab.id] } : {})}
                >
                  <span className="flex-1 min-w-0">
                    {tab.trKey ? tr(tab.trKey)
                      : uiLang === 'hi' || uiLang === 'mr' || uiLang === 'ne' ? (tab.navLabelDev || tab.navLabel)
                      : uiLang === 'te' ? (tab.navLabelTe  || tab.navLabel)
                      : uiLang === 'ta' ? (tab.navLabelTa  || tab.navLabel)
                      : uiLang === 'kn' ? (tab.navLabelKn  || tab.navLabel)
                      : uiLang === 'ml' ? (tab.navLabelMl  || tab.navLabel)
                      : uiLang === 'bn' ? (tab.navLabelBn  || tab.navLabel)
                      : uiLang === 'gu' ? (tab.navLabelGu  || tab.navLabel)
                      : uiLang === 'ja' ? (tab.navLabelJa  || tab.navLabel)
                      : uiLang === 'en' || uiLang === 'fr' || uiLang === 'es' || uiLang === 'it' || uiLang === 'pt' || uiLang === 'de' || uiLang === 'ru' ? (tab.navLabelEn  || tab.navLabel)
                      : tab.navLabel}
                  </span>
                  {dot && (
                    <svg width="9" height="9" viewBox="0 0 9 9" className="flex-shrink-0" style={{ overflow: 'visible' }}>
                      {dot === 'red' ? (
                        /* Full dot — memorised */
                        <circle cx="4.5" cy="4.5" r="4" fill="#8a7560" />
                      ) : (
                        /* Left-half dot — partial */
                        <>
                          <circle cx="4.5" cy="4.5" r="4" fill="none" stroke="#c9a84c" strokeWidth="0.8" />
                          <path d="M 4.5 0.5 A 4 4 0 0 0 4.5 8.5 Z" fill="#c9a84c" />
                        </>
                      )}
                    </svg>
                  )}
                </button>
              )
            })
          })()}
        </nav>
        {/* Yantra controls (yantra tab only) */}
        {yantraControls}
        </>)} {/* end !navCollapsed */}

        {/* Script selector — always visible; collapses to Aa icon when sidebar is narrow */}
        <div className={`mt-auto ${navCollapsed ? 'px-1 py-2' : 'px-3 py-3'} border-t border-surface-800 flex-shrink-0`}>
          {navCollapsed ? (
            <button
              onClick={() => setNavCollapsed(false)}
              className="w-full flex items-center justify-center py-1.5 text-muted hover:text-gold-400 transition-colors rounded text-xs font-mono"
              title={tr('nav.script_expand')}
            >Aa</button>
          ) : (
          <>
          <p className="text-[11px] font-mono text-cream uppercase tracking-[0.12em] px-2 mb-1.5">{tr('ui.script')}</p>
          <div className="relative">
            <button
              onClick={() => setShowScriptMenu(m => !m)}
              className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded border border-surface-700 bg-surface-800 hover:border-gold-600 transition-colors"
            >
              <span className="text-xs text-muted font-mono">
                {LOCALE_CONFIG[script]?.label ?? script}
                {LOCALE_CONFIG[script]?.englishName && (
                  <span className="text-[11px] opacity-70"> ({LOCALE_CONFIG[script].englishName})</span>
                )}
              </span>
              <span className="text-muted text-[10px]">▾</span>
            </button>
            {showScriptMenu && (
              <div className="absolute bottom-full left-0 mb-1 w-full bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50 py-1">
                {LOCALE_ORDER.map(id => (
                  <button
                    key={id}
                    onClick={() => { setScript(id); setShowScriptMenu(false) }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center justify-between
                      ${id === script
                        ? 'text-gold-300 bg-gold-900/20'
                        : 'text-muted hover:text-gold-300 hover:bg-surface-700'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {LOCALE_CONFIG[id].label}
                      {LOCALE_CONFIG[id].englishName && (
                        <span className="text-[11px] opacity-70">({LOCALE_CONFIG[id].englishName})</span>
                      )}
                    </span>
                    {id === script && <span className="text-gold-400 text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          </>
          )} {/* end !navCollapsed script picker */}
        </div>

      </aside>

      {/* ── Centre (active view) ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}>

        {/* Scrollable content area */}
        <div className={`flex-1 min-h-0 flex flex-col items-center justify-start pt-2 relative ${['memomap', 'activity-log', 'sync'].includes(activeTab) ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className={`w-full flex flex-col md:block md:h-auto ${['memomap', 'activity-log', 'sync'].includes(activeTab) ? '' : 'h-full'}`} style={{ maxWidth: activeTab === 'intro' ? '100%' : activeTab === 'locate' ? 'min(100%, calc(100dvh - 120px + 320px))' : 'min(100%, calc(100dvh - 120px))' }}>
            {activeTab === 'yantra'  && (
              <div className="w-full p-4">
                <div
                  className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60"
                  style={{ paddingBottom: '100%' }}
                >
                  <div className="absolute inset-0">
                    <SriYantraSVG
                      className="w-full h-full"
                      showTriangles={true}
                      showLabels={false}
                      showNumbers={false}
                      filledRegions={allThemes[yantraThemeIdx].fills}
                      accentColor={allThemes[yantraThemeIdx].accentColor}
                      bgColor={allThemes[yantraThemeIdx].bgColor}
                    />
                  </div>
                </div>
                {/* Mobile only — desktop has these pinned to the bottom of the right panel instead */}
                <div className="md:hidden flex items-center justify-center gap-3 mt-3 flex-wrap">
                  <button
                    onClick={handleYantraThemePrev}
                    title={tr('yantra.theme_prev_title')}
                    className="w-7 h-7 flex items-center justify-center rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-500 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-mono text-gold-400 min-w-[9rem] text-center select-none">
                    {allThemes[yantraThemeIdx].label}
                  </span>
                  <button
                    onClick={handleYantraThemeNext}
                    title={tr('yantra.theme_next_title')}
                    className="w-7 h-7 flex items-center justify-center rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-500 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={handleYantraThemeShuffle}
                    title={tr('yantra.theme_shuffle_title')}
                    className="ml-2 px-2 py-1 rounded text-xs bg-surface-800 text-gold-400 border border-surface-700 hover:border-gold-600 transition-colors flex items-center gap-1.5"
                  >
                    <Shuffle size={13} />
                    {tr('yantra.theme_shuffle')}
                  </button>
                  <button
                    onClick={handleYantraCustomise}
                    title={tr('yantra.theme_customise_title')}
                    className={`px-2 py-1 rounded text-xs border transition-colors ${
                      isOnCustomSlot
                        ? 'bg-gold-700 text-black border-gold-700'
                        : 'bg-surface-800 text-gold-400 border-surface-700 hover:border-gold-600'
                    }`}
                  >
                    {tr('yantra.theme_customise')}
                  </button>
                </div>
                {/* Mobile only — desktop uses the collapsible right panel instead */}
                {showCustomiser && isOnCustomSlot && (
                  <div className="md:hidden">
                    <YantraThemeCustomiser
                      variant="inline"
                      tr={tr}
                      slotLabel={allThemes[yantraThemeIdx].label}
                      palette={customThemes[activeCustomSlot].palette}
                      accentColor={customThemes[activeCustomSlot].accentColor}
                      bgColor={customThemes[activeCustomSlot].bgColor}
                      onPaletteChange={handleCustomPaletteChange}
                      onAccentChange={handleCustomAccentChange}
                      onBgChange={handleCustomBgChange}
                      onReset={handleYantraCustomReset}
                      onClose={() => setShowCustomiser(false)}
                      onUndo={handleCustomUndo}
                      canUndo={customHistories[activeCustomSlot].length > 0}
                    />
                  </div>
                )}
              </div>
            )}
            {activeTab === 'nyasa'   && <NyasaView
                                          script={script}
                                          uiLang={uiLang}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={nyasaMemorise}
                                          currentSeq={nyasaCurrentSeq}
                                          results={nyasaResults}
                                          onStartMemorise={handleNyasaStartMemorise}
                                          onExitMemorise={handleNyasaExitMemorise}
                                          onMarkResult={handleNyasaMarkResult}
                                          onToggleResult={handleNyasaToggleResult}
                                          flash={nyasaFlash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={nyasaHighlightId}
                                          tr={tr}
                                        />}
            {activeTab === 'inner'   && <InnerView
                                          script={script}
                                          uiLang={uiLang}
                                          tr={tr}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={innerMemorise}
                                          currentSeq={innerCurrentSeq}
                                          results={innerResults}
                                          onStartMemorise={handleInnerStartMemorise}
                                          onExitMemorise={handleInnerExitMemorise}
                                          onMarkResult={handleInnerMarkResult}
                                          onToggleResult={handleInnerToggleResult}
                                          flash={innerFlash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={innerHighlightId}
                                          waning={innerWaning}
                                          onSetWaning={handleInnerSetWaning}
                                        />}
            {activeTab === 'gurava'  && <GuravaView
                                          script={script}
                                          uiLang={uiLang}
                                          tr={tr}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={guravaMemorse}
                                          currentSeq={guravaCurrentSeq}
                                          results={guravaResults}
                                          onStartMemorise={handleGuravaStartMemorise}
                                          onExitMemorise={handleGuravaExitMemorise}
                                          onMarkResult={handleGuravaMarkResult}
                                          onToggleResult={handleGuravaToggleResult}
                                          flash={guravaFlash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={guravaHighlightId}
                                        />}
            {activeTab === 'bhupura' && <BhupuraView
                                          script={script}
                                          uiLang={uiLang}
                                          tr={tr}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={bhupuraMemorise}
                                          currentSeq={bhupuraCurrentSeq}
                                          results={bhupuraResults}
                                          onStartMemorise={handleBhupuraStartMemorise}
                                          onExitMemorise={handleBhupuraExitMemorise}
                                          onMarkResult={handleBhupuraMarkResult}
                                          onToggleResult={handleBhupuraToggleResult}
                                          flash={bhupuraFlash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={bhupuraHighlightId}
                                          showColors={bhupuraShowColors}
                                          fillAll={circuitFillAll}
                                          memoGroup={bhupuraMemoGroup}
                                        />}
            {activeTab === 'c2'      && <C2View
                                          script={script}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={c2Memorise}
                                          currentSeq={c2CurrentSeq}
                                          results={c2Results}
                                          onStartMemorise={handleC2StartMemorise}
                                          onExitMemorise={handleC2ExitMemorise}
                                          onMarkResult={handleC2MarkResult}
                                          onToggleResult={handleC2ToggleResult}
                                          flash={c2Flash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={c2HighlightId}
                                          fillAll={circuitFillAll}
                                          tr={tr}
                                          uiLang={uiLang}
                                        />}
            {activeTab === 'c3'      && <C3View
                                          script={script}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={c3Memorise}
                                          currentSeq={c3CurrentSeq}
                                          results={c3Results}
                                          onStartMemorise={handleC3StartMemorise}
                                          onExitMemorise={handleC3ExitMemorise}
                                          onMarkResult={handleC3MarkResult}
                                          onToggleResult={handleC3ToggleResult}
                                          flash={c3Flash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={c3HighlightId}
                                          fillAll={circuitFillAll}
                                          tr={tr}
                                          uiLang={uiLang}
                                        />}
            {activeTab === 'c4'      && <C4View
                                          script={script}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={c4Memorise}
                                          currentSeq={c4CurrentSeq}
                                          results={c4Results}
                                          onStartMemorise={handleC4StartMemorise}
                                          onExitMemorise={handleC4ExitMemorise}
                                          onMarkResult={handleC4MarkResult}
                                          onToggleResult={handleC4ToggleResult}
                                          flash={c4Flash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={c4HighlightId}
                                          fillAll={circuitFillAll}
                                          tr={tr}
                                          uiLang={uiLang}
                                        />}
            {activeTab === 'c5'      && <C5View
                                          script={script}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={c5Memorise}
                                          currentSeq={c5CurrentSeq}
                                          results={c5Results}
                                          onStartMemorise={handleC5StartMemorise}
                                          onExitMemorise={handleC5ExitMemorise}
                                          onMarkResult={handleC5MarkResult}
                                          onToggleResult={handleC5ToggleResult}
                                          flash={c5Flash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={c5HighlightId}
                                          fillAll={circuitFillAll}
                                          tr={tr}
                                          uiLang={uiLang}
                                        />}
            {activeTab === 'c6'      && <C6View
                                          script={script}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={c6Memorise}
                                          currentSeq={c6CurrentSeq}
                                          results={c6Results}
                                          onStartMemorise={handleC6StartMemorise}
                                          onExitMemorise={handleC6ExitMemorise}
                                          onMarkResult={handleC6MarkResult}
                                          onToggleResult={handleC6ToggleResult}
                                          flash={c6Flash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={c6HighlightId}
                                          fillAll={circuitFillAll}
                                          tr={tr}
                                          uiLang={uiLang}
                                        />}
            {activeTab === 'c7'      && <C7View
                                          script={script}
                                          onDeitySelect={handleDeitySelect}
                                          memorise={c7Memorise}
                                          currentSeq={c7CurrentSeq}
                                          results={c7Results}
                                          onStartMemorise={handleC7StartMemorise}
                                          onExitMemorise={handleC7ExitMemorise}
                                          onMarkResult={handleC7MarkResult}
                                          onToggleResult={handleC7ToggleResult}
                                          flash={c7Flash}
                                          onNavigate={handleNavigateToMemorise}
                                          highlightId={c7HighlightId}
                                          fillAll={circuitFillAll}
                                          tr={tr}
                                          uiLang={uiLang}
                                        />}
            {activeTab === 'c8' && (
              <C8View
                script={script}
                onDeitySelect={handleDeitySelect}
                memorise={c8Memorise}
                currentSeq={c8CurrentSeq}
                results={c8Results}
                onStartMemorise={handleC8StartMemorise}
                onExitMemorise={handleC8ExitMemorise}
                onMarkResult={handleC8MarkResult}
                onToggleResult={handleC8ToggleResult}
                flash={c8Flash}
                onNavigate={handleNavigateToMemorise}
                highlightId={c8HighlightId}
                fillAll={circuitFillAll}
                done={c8Memorise && c8CurrentSeq > 9}
                tr={tr}
                uiLang={uiLang}
              />
            )}
            {activeTab === 'c9' && (
              <C9View
                script={script}
                onDeitySelect={handleDeitySelect}
                memorise={c9Memorise}
                currentSeq={c9CurrentSeq}
                results={c9Results}
                onStartMemorise={handleC9StartMemorise}
                onExitMemorise={handleC9ExitMemorise}
                onMarkResult={handleC9MarkResult}
                onToggleResult={handleC9ToggleResult}
                flash={c9Flash}
                onNavigate={handleNavigateToMemorise}
                fillAll={circuitFillAll}
                done={c9Memorise && c9CurrentSeq > 3}
                tr={tr}
                uiLang={uiLang}
              />
            )}
            {activeTab === 'chakreshvari' && (
              <NavaChakreshvariView
                script={script}
                onDeitySelect={handleDeitySelect}
                memorise={ncMemorise}
                currentSeq={ncCurrentSeq}
                results={ncResults}
                onStartMemorise={handleNcStartMemorise}
                onExitMemorise={handleNcExitMemorise}
                onMarkResult={handleNcMarkResult}
                onToggleResult={handleNcToggleResult}
                flash={ncFlash}
                onNavigate={handleNavigateToMemorise}
                listHighlightCircuit={ncHighlightCircuit}
                tr={tr}
                uiLang={uiLang}
              />
            )}
            {activeTab === 'closing' && (
              <ClosingView
                script={script}
                                          uiLang={uiLang}
                tr={tr}
                onDeitySelect={handleDeitySelect}
                memorise={closingMemorise}
                currentSeq={closingCurrentSeq}
                results={closingResults}
                onStartMemorise={handleClosingStartMemorise}
                onExitMemorise={handleClosingExitMemorise}
                onMarkResult={handleClosingMarkResult}
                onToggleResult={handleClosingToggleResult}
                flash={closingFlash}
                onNavigate={handleNavigateToMemorise}
                listHighlight={closingListHighlight}
              />
            )}
            {activeTab === 'spotcheck' && (
              <SpotCheckView
                script={script}
                filter={scFilter}
                subFilter={scSubFilter}
                limit={scLimit}
                onProgressSync={p => setScProgress(p)}
                onRegisterSkip={fn => { scSkipRef.current = fn }}
                onUpdateStats={(c, t) => {
                  setSessionStats(prev => ({
                    correct: prev.correct + c,
                    total:   prev.total   + t,
                    rounds:  prev.rounds  + 1,
                  }))
                  saveSessionLog({ ts: Date.now(), section: 'spot-check', filter: scFilter, correct: c, total: t })
                }}
                tr={tr}
              />
            )}

            {/* Collapse hint below Spot Check yantra — iPad only, when nav is expanded */}
            {activeTab === 'spotcheck' && !navCollapsed && (
              <div className="ipad-collapse-hint hidden md:hidden flex-shrink-0 px-4 pb-2 pt-1">
                <button
                  onClick={() => setNavCollapsed(true)}
                  className="w-full py-1.5 rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-600 transition-colors text-xs text-center font-mono"
                >
                  {tr('nav.collapse_enlarge')}
                </button>
              </div>
            )}

            {activeTab === 'locate' && (
              <LocateDrillView
                script={script}
                scope={ldScope}
                limit={ldLimit}
                timerSeconds={ldTimer}
                onProgressSync={p => setLdProgress(p)}
                onUpdateStats={(c, t, timeouts, ms) => {
                  setSessionStats(prev => ({
                    correct: prev.correct + c,
                    total:   prev.total   + t,
                    rounds:  prev.rounds  + 1,
                  }))
                  saveSessionLog({ ts: Date.now(), section: 'locate-drill', filter: ldScope, correct: c, total: t })
                }}
                tr={tr}
              />
            )}

            {/* ── Mobile Locate Drill controls — mirrors right panel, hidden on desktop ── */}
            {activeTab === 'locate' && (
              <div className="md:hidden px-4 pb-4 space-y-4">
                {ldProgress.total > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted">
                      <span>{ldProgress.idx} / {ldProgress.total}</span>
                      <span>
                        <span style={{ color: '#c0392b' }}>{ldProgress.correct}✓</span>{' '}
                        <span className="text-gold-400">{ldProgress.wrong}✗</span>{' '}
                        <span style={{ color: '#8b4513' }}>{ldProgress.timeouts}⏱</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full transition-all"
                        style={{ width: `${Math.round((ldProgress.idx / ldProgress.total) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-muted">{tr('locate.streak')}: <span className="text-cream font-mono">{ldProgress.streak}</span></p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.segment')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LOCATE_SCOPES.map(s => (
                      <button key={s.id} onClick={() => setLdScope(s.id)}
                        className={['px-2.5 py-1 rounded text-xs font-mono transition-colors',
                          ldScope === s.id ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted'].join(' ')}>
                        {tr(s.trKey)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.round_size')}</p>
                  <div className="flex gap-1">
                    {[10, 20, 50, 'whole'].map(n => (
                      <button key={n} onClick={() => setLdLimit(n === 'whole' ? null : n)}
                        className={['px-2 py-0.5 rounded text-xs font-mono transition-colors',
                          (n === 'whole' ? ldLimit === null : ldLimit === n)
                            ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream'].join(' ')}>
                        {n === 'whole' ? tr('spot.whole') : n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('locate.timer')}</p>
                  <div className="flex gap-1">
                    {LOCATE_TIMER_OPTIONS.map(n => (
                      <button key={n ?? 'off'} onClick={() => setLdTimer(n)}
                        className={['px-2 py-0.5 rounded text-xs font-mono transition-colors',
                          ldTimer === n ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted hover:text-cream'].join(' ')}>
                        {n == null ? tr('locate.timer_off') : `${n}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* iPad-only: collapse hint for Location Match — collapses BOTH the left
                nav and the right controls panel (Chris, 2026-08-25), unlike the
                single-panel hint everywhere else. Location Match's yantra has the
                Nitya/Guru insets flanking it on desktop, so it needs more reclaimed
                width than a single panel gives. Hidden once both are already
                collapsed — nothing left to do. */}
            {activeTab === 'locate' && (!navCollapsed || rightPanelOpen) && (
              <div className="ipad-collapse-hint hidden md:hidden flex-shrink-0 px-4 pb-2 pt-1">
                <button
                  onClick={() => { setNavCollapsed(true); setRightPanelOpen(false) }}
                  className="w-full py-1.5 rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-600 transition-colors text-xs text-center font-mono"
                >
                  {tr('nav.collapse_enlarge_both')}
                </button>
              </div>
            )}

            {/* ── Mobile Spot Check controls — mirrors right panel, hidden on desktop ── */}
            {activeTab === 'spotcheck' && (() => {
              const activeFilt = SC_FILTERS.find(f => f.id === scFilter)
              const roundPct   = scProgress.idx > 0 ? Math.round((scProgress.correct / scProgress.idx) * 100) : null
              const sesCorrect = sessionStats.correct + scProgress.correct
              const sesTotal   = sessionStats.total   + scProgress.idx
              const sesPct     = sesTotal > 0 ? Math.round((sesCorrect / sesTotal) * 100) : null
              const setFilter  = (id) => {
                setScFilter(id)
                const filt = SC_FILTERS.find(f => f.id === id)
                const def = 'defaultSubFilter' in (filt ?? {}) ? filt.defaultSubFilter : (filt?.subFilters?.find(s => s.groupIds !== null)?.id ?? null)
                setScSubFilter(def)
              }
              return (
                <div className="md:hidden px-4 pb-4 space-y-4">

                  {/* Progress */}
                  {scProgress.total > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted">
                        <span>{scProgress.idx} / {scProgress.total}</span>
                        <span>
                          <span className="text-red-400">{scProgress.correct}✓</span>
                          {' '}
                          <span className="text-gold-400">{scProgress.wrong}✗</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-400 rounded-full transition-all"
                          style={{ width: `${Math.round((scProgress.idx / scProgress.total) * 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Scores */}
                  {(scProgress.idx > 0 || sesTotal > 0) && (
                    <div className="space-y-1.5 pb-1 border-b border-surface-800">
                      <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold" style={{ fontSize: '9px' }}>{tr('score.scores')}</p>
                      {scProgress.idx > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">{tr('score.round')}</span>
                          <span>
                            <span className="text-cream font-mono">{scProgress.correct}/{scProgress.idx}</span>
                            <span className="text-muted ml-1.5">{roundPct}%</span>
                          </span>
                        </div>
                      )}
                      {sesTotal > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">{tr('score.session')}</span>
                          <span>
                            <span className="text-cream font-mono">{sesCorrect}/{sesTotal}</span>
                            <span className="text-muted ml-1.5">{sesPct}%</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Segment */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.segment')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SC_FILTERS.map(f => (
                        <button key={f.id} onClick={() => setFilter(f.id)}
                          className={['px-2.5 py-1 rounded text-xs font-mono transition-colors',
                            scFilter === f.id ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted'].join(' ')}>
                          {f.trKey && uiLang !== 'en' ? tr(f.trKey) : (script === 'english' ? (f.labelEn || f.label) : f.label)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-filter */}
                  {activeFilt?.subFilters && (
                    <div className="flex gap-1">
                      {activeFilt.subFilters.map(s => (
                        <button key={s.id}
                          onClick={() => setScSubFilter(s.groupIds === null ? null : s.id)}
                          className={['flex-1 py-1 rounded text-xs font-mono transition-colors text-center',
                            (s.groupIds === null ? scSubFilter === null : scSubFilter === s.id)
                              ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted'].join(' ')}>
                          {s.trKey && uiLang !== 'en' ? tr(s.trKey) : (script === 'english' ? (s.labelEn || s.label) : s.label)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Round size */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.round_size')}</p>
                    <div className="flex gap-1.5">
                      {[10, 20, 50, 'whole'].map(n => (
                        <button key={n} onClick={() => setScLimit(n === 'whole' ? null : n)}
                          className={['px-2.5 py-1 rounded text-xs font-mono transition-colors',
                            (n === 'whole' ? scLimit === null : scLimit === n)
                              ? 'bg-gold-400 text-surface-900 font-bold' : 'bg-surface-800 text-muted'].join(' ')}>
                          {n === 'whole' ? tr('spot.whole') : n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skip */}
                  <button onClick={() => scSkipRef.current?.()}
                    className="w-full py-1.5 rounded bg-surface-800 text-xs text-muted font-mono">
                    {tr('btn.skip')}
                  </button>

                </div>
              )
            })()}
            {activeTab === 'browser'      && <CircuitBrowser script="devanagari" />}
            {activeTab === 'intro'        && <IntroView script={script} uiLang={usEnglish && uiLang === 'en' ? 'en-us' : uiLang} onStartTour={startTour} />}
            {activeTab === 'references'   && <ReferencesView />}
            {activeTab === 'linedrill'    && (
              <LineDrillView
                script={script}
                lineId={ldLineId}
                phase={ldPhase}
                previewStage={ldPreviewStage}
                currentIndex={ldIndex}
                results={ldResults}
                stops={ldStops}
                geometry={ldGeometry}
                revealed={ldRevealed}
                onActiveTap={ldHandleActiveTap}
                onPastTap={ldHandlePastTap}
                onPastRightClick={ldHandleRightClick}
                SriYantraSVG={SriYantraSVG}
                tr={tr}
              />
            )}
            {/* Mobile Line Drill controls — mirrors right panel, hidden on desktop */}
            {activeTab === 'linedrill' && (
              <div className="md:hidden">
                {renderLineDrillControls()}
              </div>
            )}
            {activeTab === 'segmentdrill' && (
              <SegmentDrillView
                script={script}
                segmentId={sdSegmentId}
                phase={sdPhase}
                previewStage={sdPreviewStage}
                currentIndex={sdIndex}
                results={sdResults}
                stops={sdStops}
                geometry={sdGeometry}
                revealed={sdRevealed}
                onActiveTap={sdHandleActiveTap}
                onPastTap={sdHandlePastTap}
                onPastRightClick={sdHandleRightClick}
                SriYantraSVG={SriYantraSVG}
                tr={tr}
              />
            )}
            {/* Mobile Segment Drill controls — mirrors right panel, hidden on desktop */}
            {activeTab === 'segmentdrill' && (
              <div className="md:hidden">
                {renderSegmentDrillControls()}
              </div>
            )}
            {activeTab === 'triangledrill' && (
              <TriangleDrillView
                script={script}
                triangleId={tdTriangleId}
                triangleLabel={triangleDrillData.DISPLAY_NAMES[tdTriangleId] || tdTriangleId}
                phase={tdPhase}
                previewStage={tdPreviewStage}
                currentIndex={tdIndex}
                results={tdResults}
                stops={tdStops}
                geometry={tdGeometry}
                revealed={tdRevealed}
                onActiveTap={tdHandleActiveTap}
                onPastTap={tdHandlePastTap}
                onPastRightClick={tdHandleRightClick}
                SriYantraSVG={SriYantraSVG}
                tr={tr}
              />
            )}
            {/* Mobile Triangle Drill controls — mirrors right panel, hidden on desktop */}
            {activeTab === 'triangledrill' && (
              <div className="md:hidden">
                {renderTriangleDrillControls()}
              </div>
            )}

            {/* iPad-only: collapse hint shown below diagram when sidebar is open on
                explore tabs — also covers Triangle/Segment/Line Drill (Chris,
                2026-08-25: "replicate the iPad view Spot Check button and
                function" for these three), which get the same single-panel
                (left nav only) collapse as Spot Check and the circuit views. */}
            {!navCollapsed && (EXPLORE_TAB_IDS.includes(activeTab) || DRILL_TAB_IDS.includes(activeTab)) && (
              <div className="ipad-collapse-hint hidden md:hidden px-4 pb-3 pt-1">
                <button
                  onClick={() => setNavCollapsed(true)}
                  className="w-full py-2 rounded-lg border border-surface-700 text-muted hover:text-cream hover:border-gold-600 transition-colors text-xs text-center"
                  style={{ fontSize: '12px' }}
                >
                  {tr('nav.collapse_enlarge')}
                </button>
              </div>
            )}
          </div>

          {/* Memomap renders outside the w-full wrapper so flex-1 min-h-0 gives
              MemoMapView a real defined height for its internal h-full flex-col layout */}
          {activeTab === 'memomap' && (
            <div className="flex-1 min-h-0 w-full flex flex-col">
              <MemoMapView
                script={script}
                navCollapsed={navCollapsed}
                allResults={{
                  nyasa:   nyasaResults,
                  inner:   innerResults,
                  gurava:  guravaResults,
                  bhupura: bhupuraResults,
                  c2: c2Results, c3: c3Results, c4: c4Results,
                  c5: c5Results, c6: c6Results, c7: c7Results,
                  c8: c8Results, c9: c9Results,
                  nc:      ncResults,
                  closing: closingResults,
                }}
                tr={tr}
              />
            </div>
          )}
          {activeTab === 'activity-log' && (
            <div className="flex-1 min-h-0 w-full flex flex-col">
              <ActivityLogView tr={tr} script={script} />
            </div>
          )}
          {activeTab === 'sync' && (
            <div className="flex-1 min-h-0 w-full flex flex-col">
              <SyncView tr={tr} />
            </div>
          )}
        </div>

        {/* ── Desktop/iPad memorise instructions (hidden on mobile — mobile has its own strip) */}
        {footerInstruction && (
          <div className="hidden md:flex flex-shrink-0 justify-center items-center px-4 py-2 border-t border-surface-800">
            {footerInstruction}
          </div>
        )}

        {/* ── Mobile Explore / Memorise bar ────────────────────────────────── */}
        {mobileCtrl && (
          <div className="flex md:hidden flex-shrink-0 border-t border-surface-800 px-3 py-1 gap-2">
            <button onClick={mobileCtrl.onExplore}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors
                ${!mobileCtrl.isMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}>
              {tr('mode.explore')}
            </button>
            <button onClick={mobileCtrl.onMemorise}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors
                ${mobileCtrl.isMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}>
              {tr('mode.memorise')}
            </button>
          </div>
        )}

        {/* ── Mobile explore section segments (14) — hidden on Spot Check ──── */}
        <div className={`${['spotcheck', 'locate', 'activity-log', 'memomap', 'linedrill', 'segmentdrill', 'triangledrill', 'sync'].includes(activeTab) ? 'hidden' : 'flex'} md:hidden ipad-segment-bar flex-shrink-0 px-2 py-1 gap-1`}>
          {EXPLORE_NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 h-2 rounded-full transition-colors
                ${tab.id === activeTab ? 'bg-gold-400' : 'bg-surface-600'}`}
              aria-label={tab.footerLabel}
            />
          ))}
        </div>

        {/* ── Sequential navigation footer ─────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-surface-800 flex items-center px-2 py-1.5 gap-1"
             style={{
               display: activeTab === 'yantra' ? 'none' : undefined,
               paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
             }}>
          <button
            onClick={() => prevTab && handleTabChange(prevTab.id)}
            disabled={!prevTab}
            className="nav-footer-btn flex-1 min-w-0 text-left text-xs py-1.5 px-2 rounded-md
              text-muted hover:text-gold-300 hover:bg-surface-800/60
              disabled:opacity-20 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted
              transition-colors overflow-hidden"
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="flex-shrink-0 text-base leading-none">←</span>
              <span className="truncate">{prevTab ? (prevTab.trKey ? tr(prevTab.trKey) : uiLang === 'hi' || uiLang === 'mr' ? (prevTab.navLabelDev || prevTab.footerLabel) : uiLang === 'te' ? (prevTab.navLabelTe || prevTab.footerLabel) : uiLang === 'ta' ? (prevTab.navLabelTa || prevTab.footerLabel) : uiLang === 'kn' ? (prevTab.navLabelKn || prevTab.footerLabel) : uiLang === 'ml' ? (prevTab.navLabelMl || prevTab.footerLabel) : uiLang === 'en' || uiLang === 'fr' || uiLang === 'es' || uiLang === 'it' || uiLang === 'pt' || uiLang === 'de' ? (prevTab.navLabelEn || prevTab.footerLabel) : prevTab.footerLabel) : ''}</span>
            </span>
          </button>
          {/* Centre: section title — iPad only via CSS class */}
          {(() => {
            const tab = TABS.find(t => t.id === activeTab)
            if (!tab) return null
            const label = tab.trKey ? tr(tab.trKey)
              : uiLang === 'hi' || uiLang === 'mr' || uiLang === 'ne' ? (tab.navLabelDev || tab.navLabel)
              : uiLang === 'te' ? (tab.navLabelTe  || tab.navLabel)
              : uiLang === 'ta' ? (tab.navLabelTa  || tab.navLabel)
              : uiLang === 'kn' ? (tab.navLabelKn  || tab.navLabel)
              : uiLang === 'ml' ? (tab.navLabelMl  || tab.navLabel)
              : uiLang === 'bn' ? (tab.navLabelBn  || tab.navLabel)
              : uiLang === 'gu' ? (tab.navLabelGu  || tab.navLabel)
              : uiLang === 'ja' ? (tab.navLabelJa  || tab.navLabel)
              : uiLang === 'en' || uiLang === 'fr' || uiLang === 'es' || uiLang === 'it' || uiLang === 'pt' || uiLang === 'de' || uiLang === 'ru' ? (tab.navLabelEn  || tab.navLabel)
              : tab.navLabel
            return (
              <span className={`hidden md:flex ipad-nav-title flex-shrink-0 px-3 text-center select-none text-sm text-gold-400 items-center gap-2 ${uiLang === 'en' ? 'font-bold' : 'font-medium iast'} tracking-wide`}>
                {label}
                {(() => {
                  const parts = geomParts(activeTab, uiLang)
                  if (!parts) return null
                  if (uiLang === 'ja' && AVARANA_KANA[activeTab]) {
                    return (
                      <span className="iast text-xs text-muted font-normal tracking-normal">
                        <ruby>{parts.name}<rt style={{ fontSize: '9px', opacity: 0.75 }}>{AVARANA_KANA[activeTab]}</rt></ruby>
                        {parts.desc && <> ({parts.desc})</>}
                      </span>
                    )
                  }
                  return (
                    <span className="iast text-xs text-muted font-normal tracking-normal">
                      {parts.name}{parts.desc && ` (${parts.desc})`}
                    </span>
                  )
                })()}
              </span>
            )
          })()}
          <button
            onClick={() => nextTab && handleTabChange(nextTab.id)}
            disabled={!nextTab}
            className="nav-footer-btn flex-1 min-w-0 text-right text-xs py-1.5 px-2 rounded-md
              text-muted hover:text-gold-300 hover:bg-surface-800/60
              disabled:opacity-20 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted
              transition-colors overflow-hidden"
          >
            <span className="flex items-center justify-end gap-1.5 min-w-0">
              <span className="truncate">{nextTab ? (nextTab.trKey ? tr(nextTab.trKey) : uiLang === 'hi' || uiLang === 'mr' ? (nextTab.navLabelDev || nextTab.footerLabel) : uiLang === 'te' ? (nextTab.navLabelTe || nextTab.footerLabel) : uiLang === 'ta' ? (nextTab.navLabelTa || nextTab.footerLabel) : uiLang === 'kn' ? (nextTab.navLabelKn || nextTab.footerLabel) : uiLang === 'ml' ? (nextTab.navLabelMl || nextTab.footerLabel) : uiLang === 'en' || uiLang === 'fr' || uiLang === 'es' || uiLang === 'it' || uiLang === 'pt' || uiLang === 'de' ? (nextTab.navLabelEn || nextTab.footerLabel) : nextTab.footerLabel) : ''}</span>
              <span className="flex-shrink-0 text-base leading-none">→</span>
            </span>
          </button>
        </div>

      </main>

      {/* ── Right panel toggle strip — desktop only; hidden on intro ── */}
      {activeTab !== 'intro' && (
        <button
          className="hidden md:flex items-center justify-center w-5 flex-shrink-0 bg-surface-900 border-l border-surface-800 text-muted hover:text-cream hover:bg-surface-800 transition-colors"
          onClick={() => setRightPanelOpen(o => !o)}
          title={rightPanelOpen ? tr('nav.info_close') : tr('nav.info_open')}
          style={{ fontSize: 10 }}
        >{rightPanelOpen ? '»' : '«'}</button>
      )}

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-shrink-0 flex-col border-l border-surface-800 overflow-hidden transition-all duration-300 ${(rightPanelOpen && !['intro', 'memomap', 'activity-log', 'sync'].includes(activeTab)) ? 'w-64' : 'w-0'}`}
             style={{ visibility: activeTab === 'intro' ? 'hidden' : undefined }}>

        {/* Scrollable info area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {rightPanel}
        </div>

        {/* Nyasa Memorise controls */}
        {activeTab === 'nyasa' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">
            <div className="flex gap-1.5">
              <button
                onClick={handleNyasaExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !nyasaMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleNyasaStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  nyasaMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {nyasaMemorise && (
                <button onClick={handleNyasaStartMemorise} title={tr('btn.reset')} className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors">↺</button>
              )}
            </div>
            {nyasaMemorise && nyasaCurrentSeq <= 6 && (() => {
              const correctCount = Object.values(nyasaResults).filter(v => v === 'correct').length
              return (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gold-600 transition-all duration-300"
                         style={{ width: `${((nyasaCurrentSeq - 1) / 6) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted font-mono whitespace-nowrap">
                    {nyasaCurrentSeq - 1} / 6
                    {correctCount > 0 && <span className="text-red-400"> · {correctCount}✓</span>}
                  </span>
                </div>
              )
            })()}
            {nyasaPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(nyasaPrevResults).filter(v => v === 'correct').length
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(6,uiLang)} {tr('misc.memorised')}</span>
                      {6 - correct > 0 && <span className="text-muted"> · {localNum(6 - correct,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}
            {nyasaPrevResults !== null && (() => {
              const notMem = deities
                .filter(d => d.sectionId === 'nyasa')
                .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
                .filter(d => nyasaPrevResults[d.sequenceInSection] !== 'correct')
                .map(d => displayName(d, script))
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.not_memorised')} ({notMem.length})</span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* Inner (Tithi Nitya) Memorise controls */}
        {activeTab === 'inner' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">
            <div className="flex gap-1.5">
              <button
                onClick={handleInnerExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !innerMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleInnerStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  innerMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {innerMemorise && (
                <button onClick={handleInnerStartMemorise} title={tr('btn.reset')} className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors">↺</button>
              )}
            </div>
            {innerMemorise && innerCurrentSeq <= 16 && (() => {
              const correctCount = Object.values(innerResults).filter(v => v === 'correct').length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gold-600 transition-all duration-300"
                           style={{ width: `${((innerCurrentSeq - 1) / 16) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {innerCurrentSeq - 1} / 16
                      {correctCount > 0 && <span className="text-red-400"> · {correctCount}✓</span>}
                    </span>
                  </div>
                </div>
              )
            })()}
            {innerPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(innerPrevResults).filter(v => v === 'correct').length
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(16,uiLang)} {tr('misc.memorised')}</span>
                      {16 - correct > 0 && <span className="text-muted"> · {localNum(16 - correct,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}
            {innerPrevResults !== null && (() => {
              const notMem = deities
                .filter(d => d.sectionId === 'nitya')
                .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
                .filter(d => innerPrevResults[d.sequenceInSection] !== 'correct')
                .map(d => displayName(d, script))
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.not_memorised')} ({notMem.length})</span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}
            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gurava Memorise controls */}
        {activeTab === 'gurava' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">
            <div className="flex gap-1.5">
              <button
                onClick={handleGuravaExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !guravaMemorse ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleGuravaStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  guravaMemorse ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {guravaMemorse && (
                <button onClick={handleGuravaStartMemorise} title={tr('btn.reset')} className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors">↺</button>
              )}
            </div>
            {guravaMemorse && guravaCurrentSeq <= 19 && (() => {
              const correctCount = Object.values(guravaResults).filter(v => v === 'correct').length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gold-600 transition-all duration-300"
                           style={{ width: `${((guravaCurrentSeq - 1) / 19) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {guravaCurrentSeq - 1} / 19
                      {correctCount > 0 && <span className="text-red-400"> · {correctCount}✓</span>}
                    </span>
                  </div>
                </div>
              )
            })()}
            {guravaPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(guravaPrevResults).filter(v => v === 'correct').length
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(19,uiLang)} {tr('misc.memorised')}</span>
                      {19 - correct > 0 && <span className="text-muted"> · {localNum(19 - correct,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}
            {guravaPrevResults !== null && (() => {
              const guruSections = ['guru-divya', 'guru-siddha', 'guru-manava']
              const guruAll = deities
                .filter(d => guruSections.includes(d.sectionId))
                .sort((a, b) => a.sequenceInChant - b.sequenceInChant)
              const notMem = guruAll
                .map((d, idx) => ({ d, seq: idx + 1 }))
                .filter(({ seq }) => guravaPrevResults[seq] !== 'correct')
                .map(({ d }) => displayName(d, script))
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.not_memorised')} ({notMem.length})</span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}
            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bhupura (Circuit 1) Memorise controls */}
        {activeTab === 'bhupura' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">
            {bhupuraMemorise && (
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all',          label: tr('misc.all'),             title: null           },
                  { id: 'siddhiShakti', label: tr('bhupura.outer_band'),  title: 'Outer level'  },
                  { id: 'ashtaMatrika', label: tr('bhupura.middle_band'), title: 'Middle level' },
                  { id: 'mudraShakti',  label: tr('bhupura.inner_band'),  title: 'Inner level'  },
                ].map(g => (
                  <button key={g.id}
                    title={g.title ?? undefined}
                    className={`py-1 rounded-lg text-xs font-medium transition-colors ${bhupuraMemoGroup === g.id ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'}`}
                    onClick={() => handleBhupuraSetMemoGroup(g.id)}
                  >{g.label}</button>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <button
                onClick={handleBhupuraExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !bhupuraMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleBhupuraStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  bhupuraMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {bhupuraMemorise && (
                <button onClick={handleBhupuraStartMemorise} title={tr('btn.reset')} className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors">↺</button>
              )}
            </div>
            {bhupuraMemorise && (() => {
              const memoTotal = (bhupuraMemoGroup === 'all' ? BHUPURA_C1_TOTAL
                : bhupuraMemoGroup === 'siddhiShakti' ? BHUPURA_SIDDHI_TOTAL
                : bhupuraMemoGroup === 'ashtaMatrika' ? 8
                : 10) + 2
              const correctCount = Object.values(bhupuraResults).filter(v => v === 'correct').length
              if (bhupuraCurrentSeq > memoTotal) return null
              return (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gold-600 transition-all duration-300"
                         style={{ width: `${((bhupuraCurrentSeq - 1) / memoTotal) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted font-mono whitespace-nowrap">
                    {bhupuraCurrentSeq - 1} / {memoTotal}
                    {correctCount > 0 && <span className="text-red-400"> · {correctCount}✓</span>}
                  </span>
                </div>
              )
            })()}
            {bhupuraPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(bhupuraPrevResults).filter(v => v === 'correct').length
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(30,uiLang)} {tr('misc.memorised')}</span>
                      {30 - correct > 0 && <span className="text-muted"> · {localNum(30 - correct,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}
            {bhupuraPrevResults !== null && (() => {
              const c1Section = circuitSections.find(s => s.circuitNumber === 1)
              const notMem = [
                ...deities
                  .filter(d => d.sectionId === 'circuit-1')
                  .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
                  .filter(d => bhupuraPrevResults[d.sequenceInSection] !== 'correct')
                  .map(d => displayName(d, script)),
                ...(bhupuraPrevResults[29] !== 'correct' && c1Section ? [sectionName(c1Section, 'chakraSvamini', script)] : []),
                ...(bhupuraPrevResults[30] !== 'correct' && c1Section ? [sectionName(c1Section, 'yoginiType',    script)] : []),
              ]
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.not_memorised')} ({notMem.length})</span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}
            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* C2 Memorise controls — pinned to the bottom */}
        {activeTab === 'c2' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            {/* Explore / Memorise toggle + Reset */}
            <div className="flex gap-1.5">
              <button
                onClick={handleC2ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c2Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC2StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c2Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c2Memorise && (
                <button
                  onClick={handleC2StartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {/* Progress bar — visible during an active round */}
            {c2Memorise && c2CurrentSeq <= 17 && (() => {
              const correctCount = Object.values(c2Results).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((c2CurrentSeq - 1) / 16) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c2CurrentSeq - 1} / 16
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Previous attempt summary */}
            {c2PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(c2PrevResults).filter(v => v === 'correct').length
                  const skipped = 18 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(18,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {/* Not memorised list */}
            {c2PrevResults !== null && (() => {
              const notMem = getNotMemorisedNames(2, c2PrevResults, 18, script)
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      {tr('score.not_memorised')} ({notMem.length})
                    </span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

            {/* Session counter */}
            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* C4 Memorise controls — pinned to the bottom */}
        {activeTab === 'c4' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleC4ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c4Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC4StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c4Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c4Memorise && (
                <button
                  onClick={handleC4StartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c4Memorise && c4CurrentSeq <= 15 && (() => {
              const correctCount = Object.values(c4Results).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((c4CurrentSeq - 1) / 14) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c4CurrentSeq - 1} / 14
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {c4PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(c4PrevResults).filter(v => v === 'correct').length
                  const skipped = 16 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(16,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}
            {c4PrevResults !== null && (() => {
              const notMem = getNotMemorisedNames(4, c4PrevResults, 16, script)
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      {tr('score.not_memorised')} ({notMem.length})
                    </span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* C5 Memorise controls — pinned to the bottom */}
        {activeTab === 'c5' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleC5ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c5Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC5StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c5Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c5Memorise && (
                <button
                  onClick={handleC5StartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c5Memorise && c5CurrentSeq <= 11 && (() => {
              const correctCount = Object.values(c5Results).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((c5CurrentSeq - 1) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c5CurrentSeq - 1} / 10
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {c5PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(c5PrevResults).filter(v => v === 'correct').length
                  const skipped = 12 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(12,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {c5PrevResults !== null && (() => {
              const notMem = getNotMemorisedNames(5, c5PrevResults, 12, script)
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      {tr('score.not_memorised')} ({notMem.length})
                    </span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* C6 Memorise controls — pinned to the bottom */}
        {activeTab === 'c6' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleC6ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c6Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC6StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c6Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c6Memorise && (
                <button
                  onClick={handleC6StartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c6Memorise && c6CurrentSeq <= 11 && (() => {
              const correctCount = Object.values(c6Results).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((c6CurrentSeq - 1) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c6CurrentSeq - 1} / 10
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {c6PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(c6PrevResults).filter(v => v === 'correct').length
                  const skipped = 12 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(12,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {c6PrevResults !== null && (() => {
              const notMem = getNotMemorisedNames(6, c6PrevResults, 12, script)
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      {tr('score.not_memorised')} ({notMem.length})
                    </span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* C7 Memorise controls — pinned to the bottom */}
        {activeTab === 'c7' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleC7ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c7Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC7StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c7Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c7Memorise && (
                <button
                  onClick={handleC7StartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c7Memorise && c7CurrentSeq <= 9 && (() => {
              const correctCount = Object.values(c7Results).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((c7CurrentSeq - 1) / 8) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c7CurrentSeq - 1} / 8
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {c7PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(c7PrevResults).filter(v => v === 'correct').length
                  const skipped = 10 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(10,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {c7PrevResults !== null && (() => {
              const notMem = getNotMemorisedNames(7, c7PrevResults, 10, script)
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      {tr('score.not_memorised')} ({notMem.length})
                    </span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* C8 Memorise controls — pinned to the bottom */}
        {activeTab === 'c8' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleC8ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c8Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC8StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c8Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c8Memorise && (
                <button
                  onClick={handleC8StartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c8Memorise && c8CurrentSeq <= 7 && (() => {
              const correctCount = Object.values(c8Results).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((c8CurrentSeq - 1) / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c8CurrentSeq - 1} / 9
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {c8PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(c8PrevResults).filter(v => v === 'correct').length
                  const skipped = 9 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(9,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {c8PrevResults !== null && (() => {
              const c8Deities = deities
                .filter(d => d.sectionId === 'circuit-8' && d.role === 'deity')
                .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
              const notMem = c8Deities
                .filter(d => c8PrevResults[d.sequenceInSection] !== 'correct')
                .map(d => displayName(d, script))
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      {tr('score.not_memorised')} ({notMem.length})
                    </span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* C9 Memorise controls — pinned to the bottom */}
        {activeTab === 'c9' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleC9ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c9Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC9StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c9Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c9Memorise && (
                <button
                  onClick={handleC9StartMemorise}
                  title={tr('btn.reset')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c9PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                <p className="text-xs">
                  <span className="text-red-400">
                    {c9PrevResults[1] === 'correct' ? '1/1' : '0/1'} memorised
                  </span>
                </p>
              </div>
            )}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* Nava Chakreshvari Memorise controls — pinned to the bottom */}
        {activeTab === 'chakreshvari' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleNcExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !ncMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleNcStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  ncMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {ncMemorise && (
                <button
                  onClick={handleNcStartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {ncMemorise && ncCurrentSeq <= 9 && (() => {
              const correctCount = Object.values(ncResults).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((ncCurrentSeq - 1) / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {ncCurrentSeq - 1} / 9
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {ncPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(ncPrevResults).filter(v => v === 'correct').length
                  const skipped = 9 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(9,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* Closing Memorise controls — pinned to the bottom */}
        {activeTab === 'closing' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleClosingExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !closingMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleClosingStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  closingMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {closingMemorise && (
                <button
                  onClick={handleClosingStartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {closingMemorise && closingCurrentSeq <= 10 && (() => {
              const correctCount = Object.values(closingResults).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((closingCurrentSeq - 1) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {closingCurrentSeq - 1} / 10
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {closingPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(closingPrevResults).filter(v => v === 'correct').length
                  const skipped = 10 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(10,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* C3 Memorise controls — pinned to the bottom */}
        {activeTab === 'c3' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            <div className="flex gap-1.5">
              <button
                onClick={handleC3ExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !c3Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.explore')}</button>
              <button
                onClick={handleC3StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c3Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >{tr('mode.memorise')}</button>
              {c3Memorise && (
                <button
                  onClick={handleC3StartMemorise}
                  title={tr('btn.reset_level')}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c3Memorise && c3CurrentSeq <= 9 && (() => {
              const correctCount = Object.values(c3Results).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((c3CurrentSeq - 1) / 8) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c3CurrentSeq - 1} / 8
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}

            {c3PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.last_attempt')}</p>
                {(() => {
                  const correct = Object.values(c3PrevResults).filter(v => v === 'correct').length
                  const skipped = 10 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{localNum(correct,uiLang)}/{localNum(10,uiLang)} {tr('misc.memorised')}</span>
                      {skipped > 0 && <span className="text-muted"> · {localNum(skipped,uiLang)} {tr('score.not_memorised')}</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {c3PrevResults !== null && (() => {
              const notMem = getNotMemorisedNames(3, c3PrevResults, 10, script)
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      {tr('score.not_memorised')} ({notMem.length})
                    </span>
                    <span className="text-xs text-muted">{showErrors ? '↑' : '↓'}</span>
                  </button>
                  {showErrors && (
                    <ul className="space-y-0.5 pt-0.5">
                      {notMem.map((name, i) => (
                        <li key={i} className={`text-xs leading-snug ${script !== 'english' ? 'iast ' : ''}text-amber-300`}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

            {sessionStats.rounds > 0 && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">{tr('score.session')}</p>
                  <button onClick={handleResetSession} title={tr('btn.reset_session')} className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {uiLang === 'en' ? `${sessionStats.rounds} round${sessionStats.rounds !== 1 ? 's' : ''}` : `${localNum(sessionStats.rounds,uiLang)} ${tr('score.round')}`}</span>
                </p>
              </div>
            )}

          </div>
        )}

        {/* Śrī Yantra colour theme controls — pinned to the bottom */}
        {activeTab === 'yantra' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleYantraThemePrev}
                title={tr('yantra.theme_prev_title')}
                className="w-7 h-7 flex items-center justify-center rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-500 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono text-gold-400 flex-1 text-center truncate select-none">
                {allThemes[yantraThemeIdx].label}
              </span>
              <button
                onClick={handleYantraThemeNext}
                title={tr('yantra.theme_next_title')}
                className="w-7 h-7 flex items-center justify-center rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-500 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleYantraThemeShuffle}
                title={tr('yantra.theme_shuffle_title')}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors flex items-center justify-center gap-1.5"
              >
                <Shuffle size={13} />
                {tr('yantra.theme_shuffle')}
              </button>
              <button
                onClick={handleYantraCustomise}
                title={tr('yantra.theme_customise_title')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isOnCustomSlot
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                {tr('yantra.theme_customise')}
              </button>
            </div>
          </div>
        )}

      </aside>

      </div>{/* end 3-column content row */}

    </div>
  )
}
