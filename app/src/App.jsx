import { useState, useRef, useEffect } from 'react'
import { useTour } from './components/TourGuide'
import CircuitBrowser from './components/CircuitBrowser'
import ReferencesView from './components/ReferencesView'
import IntroView from './components/IntroView'
import SriYantraSVG from './components/SriYantraSVG'
import NyasaView from './components/NyasaView'
import InnerView from './components/InnerView'
import GuravaView from './components/GuravaView'
import BhupuraView from './components/BhupuraView'
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
import MemoMapView from './components/MemoMapView'
import ActivityLogView from './components/ActivityLogView'
import data from './data/khadgamala-canonical.json'
import { displayName, loadMemoStorage, saveMemoStorage, saveSessionLog, recordHistoryEntry } from './utils.js'
import { translate, LOCALE_ORDER, LOCALE_CONFIG } from './translations.js'
import { Globe, Plane } from 'lucide-react'

const { sections, deities } = data
const circuitSections = sections.filter(s => s.type === 'circuit')

const YOGINI_SECRECY = {
  'Prakata Yogini':           'Manifest',
  'Gupta Yogini':             'Hidden',
  'Guptatara Yogini':         'More Hidden',
  'Sampradaya Yogini':        'Transmitted',
  'Kulottirna Yogini':        'Beyond Kula',
  'Nigarbha Yogini':          'Concealed',
  'Rahasya Yogini':           'Secret',
  'Ati Rahasya Yogini':       'Most Secret',
  'Para Para Rahasya Yogini': 'Supreme Secret',
}

const TABS = [
  { id: 'intro',        navLabel: 'Welcome and Introduction',      navLabelEn: 'Welcome and Introduction',              navLabelDev: 'Welcome and Introduction', footerLabel: 'Introduction'        },
  { id: 'h-explore-memorise', heading: 'EXPLORE AND MEMORISE' },
  { id: 'nyasa',        navLabel: 'nyāsāṅga-devatāḥ',             navLabelEn: 'Nyāsa Deities',                         navLabelDev: 'न्यासांगदेवताः',        footerLabel: 'Nyāsa Deities'        },
  { id: 'inner',        navLabel: 'tithi-nitya-devatāḥ',           navLabelEn: 'Tithi Nitya Deities',                   navLabelDev: 'तिथिनित्यदेवताः',      footerLabel: 'Tithi Nitya'          },
  { id: 'gurava',       navLabel: 'guravaḥ',                       navLabelEn: 'Gurus',                                 navLabelDev: 'गुरवः',                 footerLabel: 'Guravaḥ'              },
  { id: 'bhupura',      navLabel: '1. cakra-prathamāvaraṇa-devatāḥ', navLabelEn: '1st Enclosure Deities', navLabelDev: '१. चक्रप्रथमावरणदेवताः', footerLabel: '1st Āvaraṇa' },
  { id: 'c2',           navLabel: '2. cakra-dvitīyāvaraṇa-devatāḥ',  navLabelEn: '2nd Enclosure Deities', navLabelDev: '२. चक्रद्वितीयावरणदेवताः',footerLabel: '2nd Āvaraṇa' },
  { id: 'c3',           navLabel: '3. cakra-tṛtīyāvaraṇa-devatāḥ',   navLabelEn: '3rd Enclosure Deities', navLabelDev: '३. चक्रतृतीयावरणदेवताः', footerLabel: '3rd Āvaraṇa' },
  { id: 'c4',           navLabel: '4. cakra-caturthāvaraṇa-devatāḥ', navLabelEn: '4th Enclosure Deities', navLabelDev: '४. चक्रचतुर्थावरणदेवताः',footerLabel: '4th Āvaraṇa' },
  { id: 'c5',           navLabel: '5. cakra-pañcamāvaraṇa-devatāḥ',  navLabelEn: '5th Enclosure Deities', navLabelDev: '५. चक्रपञ्चमावरणदेवताः', footerLabel: '5th Āvaraṇa' },
  { id: 'c6',           navLabel: '6. cakra-ṣaṣṭhāvaraṇa-devatāḥ',  navLabelEn: '6th Enclosure Deities', navLabelDev: '६. चक्रषष्ठावरणदेवताः',  footerLabel: '6th Āvaraṇa' },
  { id: 'c7',           navLabel: '7. cakra-saptamāvaraṇa-devatāḥ',   navLabelEn: '7th Enclosure Deities', navLabelDev: '७. चक्रसप्तमावरणदेवताः', footerLabel: '7th Āvaraṇa' },
  { id: 'c8',           navLabel: '8. cakra-aṣṭamāvaraṇa-devatāḥ',   navLabelEn: '8th Enclosure Deities', navLabelDev: '८. चक्राष्टमावरणदेवताः', footerLabel: '8th Āvaraṇa' },
  { id: 'c9',           navLabel: '9. cakra-navamāvaraṇa-devatāḥ',    navLabelEn: '9th Enclosure Deity', navLabelDev: '९. चक्रनवमावरणदेवताः',   footerLabel: '9th Āvaraṇa' },
  { id: 'chakreshvari', navLabel: 'navacakrēśvarī nāmāni',         navLabelEn: 'Names of the Nine Chakras',            navLabelDev: 'नवचक्रेश्वरी नामानि', footerLabel: 'Nava Chakreshvarī'   },
  { id: 'closing',      navLabel: 'śrīdevī-viśēṣaṇāni',           navLabelEn: 'Śrīdevī Epithets and Namaskāra',        navLabelDev: 'श्रीदेवी विशेषणानि',   footerLabel: 'Śrīdevī Epithets'    },
  { id: 'h-spotcheck',  heading: 'SPOT CHECK AND MEMORY MAP' },
  { id: 'spotcheck',    navLabel: 'Spot Check',                    navLabelEn: 'Spot Check',                           navLabelDev: 'Spot Check',            footerLabel: 'Spot Check'           },
  { id: 'memomap',      navLabel: 'Memory Map',                      navLabelEn: 'Memory Map',                              navLabelDev: 'Memory Map',              footerLabel: 'Memory Map'             },
  { id: 'activity-log', navLabel: 'Activity Log',                  navLabelEn: 'Activity Log',                          navLabelDev: 'Activity Log',          footerLabel: 'Activity Log'         },
  { id: 'h-references', heading: 'RESOURCES' },
  { id: 'yantra',       navLabel: 'śrī yantra',                    navLabelEn: 'Śrī Yantra',                            navLabelDev: 'श्री यन्त्र',           footerLabel: 'Śrī Yantra'           },
  { id: 'browser',      navLabel: 'śrī devī khaḍgamālā stōtram',  navLabelEn: 'Sri Devi Khadgamala Stotram',          navLabelDev: 'श्री देवी खड्गमाला स्तोत्रम्', footerLabel: 'Khadgamala Stotram'   },
  { id: 'references',   navLabel: 'References',                    navLabelEn: 'References',                           navLabelDev: 'References',            footerLabel: 'References'           },
]

// Navigable tabs only (excludes heading entries — used for footer prev/next)
const NAVIGABLE_TABS = TABS.filter(t => !t.heading)

// The 14 Explore & Memorise sections — used for swipe navigation and segment bar
const EXPLORE_TAB_IDS  = ['nyasa','inner','gurava','bhupura','c2','c3','c4','c5','c6','c7','c8','c9','chakreshvari','closing']
const EXPLORE_NAV_TABS = NAVIGABLE_TABS.filter(t => EXPLORE_TAB_IDS.includes(t.id))

// data-tour IDs for the site tour (TourGuide.jsx)
const TOUR_NAV_IDS = {
  yantra:    'nav-yantra',
  bhupura:   'nav-bhupura',
  spotcheck: 'nav-spotcheck',
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

// ── Model yantra initial fills ────────────────────────────────────────────────

const MODEL_YANTRA_FILLS = {
  'c1-outer':    'rgba(201,168,76,0.85)',
  'c1-mid':      'rgba(255,235,60,0.85)',
  'c1-inner':    'rgba(80,200,80,0.85)',
  'outer-rings': 'rgba(215,220,228,0.90)',
  'c2':          'rgba(201,168,76,0.85)',
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) =>
    [`petal-c2-${String(i + 1).padStart(2, '0')}`, 'rgba(255,235,60,0.85)']
  )),
  'c3':          'rgba(215,220,228,0.90)',
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
    [`petal-c3-${String(i + 1).padStart(2, '0')}`, 'rgba(235,45,45,0.92)']
  )),
  'inner-circle': 'rgba(255,255,255,1.0)',
  // C4–C9 fills added as each avarana's geometry is verified.
  ...Object.fromEntries(Array.from({ length: 14 }, (_, i) =>
    [`tri-c4-${String(i + 1).padStart(2, '0')}`, 'rgba(35,65,185,0.92)']
  )),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c5-${String(i + 1).padStart(2, '0')}`, 'rgba(235,45,45,0.92)']
  )),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c6-${String(i + 1).padStart(2, '0')}`, 'rgba(20,20,20,0.92)']
  )),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) =>
    [`tri-c7-${String(i + 1).padStart(2, '0')}`, 'rgba(50,170,80,0.90)']
  )),
  'tri-c8-01':       'rgba(255,230,50,0.92)',
  'tri-c8-bg-01':   'rgba(255,255,255,1.0)',
  'tri-c8-bg-02':   'rgba(255,255,255,1.0)',
  'c9':        'rgba(235,45,45,0.95)',
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) =>
    [`tri-c5-${String(i + 1).padStart(2, '0')}`, 'rgba(235,45,45,0.92)']
  )),
}

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
  if (script === 'english') return `${ordinal(circuitNumber)} Āvaraṇa`
  const labels = CIRCUIT_LABELS[circuitNumber]
  if (!labels) return `Circuit ${circuitNumber}`
  return script === 'devanagari' ? labels.dev : labels.iast
}

function sectionName(section, field, script) {
  if (!section) return ''
  const iastKey = field + 'Iast'
  if (script === 'english') {
    if (field === 'avarana' && section.circuitNumber)
      return `${ordinal(section.circuitNumber)} Āvaraṇa`
    return section[field] || section[iastKey] || ''
  }
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

function DeityDetail({ deity, script = 'iast' }) {
  if (!deity) return null
  const { scripts, sequenceInSection, sectionId, sequenceInChant, note } = deity
  const section   = circuitSections.find(s => `circuit-${s.circuitNumber}` === sectionId)
  const primary   = displayName(deity, script)
  const isDevPrim = script === 'devanagari'
  const secrecy   = section ? YOGINI_SECRECY[section.yoginiType] : null

  let subtitle = ''
  if (section)              subtitle = `Circuit ${section.circuitNumber} · ${sequenceInSection} of ${section.triangleCount || section.petalCount || '?'}`
  else if (sectionId === 'nyasa')       subtitle = `Nyāsāṅga · ${sequenceInSection} of 6`
  else if (sectionId === 'nitya')       subtitle = `Tithi Nitya · ${sequenceInSection} of 16`
  else if (sectionId === 'guru-divya')  subtitle = `Divyaugha Guravaḥ · ${sequenceInSection} of 7`
  else if (sectionId === 'guru-siddha') subtitle = `Siddhaugha Guravaḥ · ${sequenceInSection} of 4`
  else if (sectionId === 'guru-manava') subtitle = `Mānavaugha Guravaḥ · ${sequenceInSection} of 8`
  else                                  subtitle = sectionId?.replace('circuit-', 'Circuit ') ?? ''

  return (
    <div className="p-4 space-y-2">
      <p className="text-xs font-mono text-gold-700 uppercase tracking-widest leading-tight">
        {subtitle}
      </p>
      <h2 className={`${isDevPrim ? '' : 'iast'} text-gold-400 text-sm font-medium leading-snug`}>
        {primary}
      </h2>
      {script !== 'iast' && scripts.iast && (
        <p className="iast text-gold-600 text-xs">{scripts.iast}</p>
      )}
      {script !== 'english' && scripts.english && (
        <p className="text-cream text-xs">{scripts.english}</p>
      )}
      {scripts.translation && (
        <p className="text-muted text-xs italic mt-1">{scripts.translation}</p>
      )}
      {note && (
        <p className="text-muted text-xs mt-1">{note}</p>
      )}
    </div>
  )
}

function CircuitDetail({ circuitNumber, script = 'iast', onNavigate, tr = k => k }) {
  const section = circuitSections.find(s => s.circuitNumber === circuitNumber)
  if (!section) return null
  const secrecy = YOGINI_SECRECY[section.yoginiType]
  const targetTab = CIRCUIT_TO_TAB[circuitNumber]

  return (
    <div className="p-4 space-y-2">
      <p className={`text-xs font-mono text-gold-700 uppercase tracking-widest${script === 'iast' ? ' iast' : ''}`}>
        {circuitLabel(circuitNumber, script)}
      </p>
      <h2 className="iast text-gold-400 text-sm font-medium leading-snug">
        {section.avaranaIast}
      </h2>
      {script !== 'english' && (
        <p className="text-cream text-xs">{section.avarana}</p>
      )}
      <div className="pt-3 border-t border-surface-700 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakra_svamini')}</span>
          <span className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-500`}>{sectionName(section, 'chakraSvamini', script)}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.yogini')}</span>
          <span className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-500`}>
            {sectionName(section, 'yoginiType', script)}
            {secrecy && <span className="text-muted ml-1">· {secrecy}</span>}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakreshvari')}</span>
          <span className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-500`}>{sectionName(section, 'chakreshvari', script)}</span>
        </div>
      </div>
      {onNavigate && targetTab && (
        <button
          onClick={() => onNavigate(targetTab)}
          className="mt-3 w-full text-left text-xs text-gold-500 hover:text-gold-300 py-2 px-3 border border-gold-800/40 hover:border-gold-700/60 rounded-lg transition-colors bg-gold-900/10 hover:bg-gold-900/20"
        >
          Explore Circuit {circuitNumber} →
        </button>
      )}
    </div>
  )
}

function CircuitRows({ circuitNumber, script, onHoverFill = null, tr = k => k }) {
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
        <span className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-500`}>{sectionName(section, 'chakraSvamini', script)}</span>
      </div>
      <div className="flex gap-2 rounded px-1 -mx-1 hover:bg-surface-700 transition-colors" {...fillProps}>
        <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.yogini')}</span>
        <span className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-500`}>
          {sectionName(section, 'yoginiType', script)}
          {secrecy && <span className="text-muted ml-1">· {secrecy}</span>}
        </span>
      </div>
      <div className="flex gap-2 rounded px-1 -mx-1 hover:bg-surface-700 transition-colors" {...fillProps}>
        <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakreshvari')}</span>
        <span className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-500`}>{sectionName(section, 'chakreshvari', script)}</span>
      </div>
    </div>
  )
}

function SectionInfo({ tabId, script = 'iast', showRows = true, tr = k => k }) {
  const circuitNumber = TAB_TO_CIRCUIT[tabId]
  const section       = circuitNumber
    ? circuitSections.find(s => s.circuitNumber === circuitNumber)
    : null

  if (!section) {
    // Closing tab gets a dedicated description panel
    if (tabId === 'closing') {
      return (
        <div className="p-4 space-y-2">
          <p className="iast text-xs font-mono text-gold-700 uppercase tracking-widest">
            śrīdevī viśēṣaṇāni
          </p>
          <h2 className="iast text-gold-400 text-sm font-medium leading-snug">
            namaskāra-navākṣarī ca
          </h2>
          <p className="text-cream text-xs leading-relaxed">
            Nine special epithets of Śrīdevī, followed by the closing Namaskāra Navākṣarī.
          </p>
        </div>
      )
    }

    if (tabId === 'inner') {
      return (
        <div className="p-4 space-y-2">
          <p className="iast text-xs font-mono text-gold-700 uppercase tracking-widest">
            tithi nitya dēvatāḥ
          </p>
          <h2 className="iast text-gold-400 text-sm font-medium leading-snug">
            ṣoḍaśa nitya dēvī
          </h2>
          <p className="text-cream text-xs leading-relaxed">
            The devis representing the 15 lunar phases of the moon's cycle plus Mahānityē.
          </p>
        </div>
      )
    }

    if (tabId === 'gurava') {
      return (
        <div className="p-4 space-y-2">
          <p className="iast text-xs font-mono text-gold-700 uppercase tracking-widest">
            guravaḥ
          </p>
          <h2 className="iast text-gold-400 text-sm font-medium leading-snug">
            divyaugha · siddhaugha · mānavaugha
          </h2>
          <p className="text-cream text-xs leading-relaxed">
            Three classes of spiritual masters representing the divine, perfected and human currents of transmission.
          </p>
        </div>
      )
    }

    if (tabId === 'nyasa') {
      return (
        <div className="p-4 space-y-2">
          <p className="iast text-xs font-mono text-gold-700 uppercase tracking-widest">
            nyāsāṅga dēvatāḥ
          </p>
          <h2 className="iast text-gold-400 text-sm font-medium leading-snug">
            ṣaḍ-aṅga nyāsa
          </h2>
          <p className="text-cream text-xs leading-relaxed">
            Six limb-deities invoked at the opening of the stotra, each consecrates a part of the body and the subtle body before worship begins.
          </p>
        </div>
      )
    }

    if (tabId === 'chakreshvari') {
      return (
        <div className="p-4 space-y-2">
          <p className="iast text-xs font-mono text-gold-700 uppercase tracking-widest">
            navacakrēśvarī nāmāni
          </p>
          <h2 className="iast text-gold-400 text-sm font-medium leading-snug">
            nava tripurā rūpāṇi
          </h2>
          <p className="text-cream text-xs leading-relaxed">
            Nine Tripurā forms, one presiding deity for each of the nine circuits, from the outermost bhupura to the bindu.
          </p>
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
      <h2 className="iast text-gold-400 text-sm font-medium leading-snug">
        {section.avaranaIast}
      </h2>
      {script !== 'english' && (
        <p className="text-cream text-xs">{section.avarana}</p>
      )}
      {showRows && (
        <div className="pt-3 border-t border-surface-700 space-y-1.5 text-xs">
          <div className="flex gap-2">
            <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakra_svamini')}</span>
            <span className="text-gold-500">{sectionName(section, 'chakraSvamini', script)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.yogini')}</span>
            <span className="text-gold-500">{sectionName(section, 'yoginiType', script)}</span>
          </div>
          {secrecy && (
            <div className="flex gap-2">
              <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.secrecy')}</span>
              <span className="text-muted">{secrecy}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-muted w-24 flex-shrink-0 pt-px">{tr('deity.chakreshvari')}</span>
            <span className="text-gold-500">{sectionName(section, 'chakreshvari', script)}</span>
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

export default function App() {
  const [activeTab, setActiveTab] = useState('intro')
  const [script,   setScript]   = useState('iast') // script key for deity name display
  const [uiLang,   setUiLang]   = useState('en')   // UI language (future use)
  const [showLangMenu,    setShowLangMenu]    = useState(false)
  const [showScriptMenu,  setShowScriptMenu]  = useState(false)
  const tr = key => translate('en', key)            // UI string helper (always English for now)
  const [openSections, setOpenSections] = useState({
    'h-explore-memorise': true,
    'h-spotcheck':        true,
    'h-references':       true,
  })

  // ── Site tour ──────────────────────────────────────────────────────────────
  const { startTour, tourElement } = useTour({
    onBeforeStart: () => setOpenSections({
      'h-explore-memorise': true,
      'h-spotcheck':        true,
      'h-references':       true,
    }),
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

  // ── Sidebar UI state ───────────────────────────────────────────────────────
  const [controlsOpen, setControlsOpen] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
    if (nextSeq > 30) {
      setBhupuraPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 30, rounds: prev.rounds + 1 }))
      saveSessionLog({ ts: Date.now(), section: 'bhupura', correct: Object.keys(newResults).length, total: 30 })
      const allCorrect = Array.from({ length: 30 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
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

  const scSkipRef      = useRef(null)
  const swipeStartX    = useRef(null)
  const swipeStartY    = useRef(null)

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
    browser:      null,
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSelectedDeity(null)
    setSelectedCircuit(null)
    setShowErrors(false)
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
  const currentTabIdx = NAVIGABLE_TABS.findIndex(t => t.id === activeTab)
  const prevTab = currentTabIdx > 0 ? NAVIGABLE_TABS[currentTabIdx - 1] : null
  const nextTab = currentTabIdx < NAVIGABLE_TABS.length - 1 ? NAVIGABLE_TABS[currentTabIdx + 1] : null

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
  const memoInstr = (
    <span className="text-muted" style={INSTR_STYLE}>
      {tr('instr.hover_reveal')} ·{' '}
      <span className="text-red-400">click</span> = {tr('instr.click_correct').replace('click = ', '')} ·{' '}
      <span className="text-gold-400">dbl-click</span> = {tr('instr.dblclick_wrong').replace('dbl-click = ', '')} ·{' '}
      {tr('instr.right_click_toggle')}
    </span>
  )
  const footerInstruction = !EXPLORE_TABS.has(activeTab) ? null
    : isInMemoriseMode
      ? activeTab === 'chakreshvari'
        ? <span className="text-center flex flex-col gap-0.5" style={INSTR_STYLE}>
            <span className="text-muted">Proceed from the outer Bhūpura to the inner Bindu</span>
            <span className="text-muted">
              {tr('instr.hover_reveal')} ·{' '}
              <span className="text-red-400">click</span> = {tr('instr.click_correct').replace('click = ', '')} ·{' '}
              <span className="text-gold-400">dbl-click</span> = {tr('instr.dblclick_wrong').replace('dbl-click = ', '')}
            </span>
          </span>
        : activeTab === 'spotcheck'
          ? <span className="hidden md:inline">{memoInstr}</span>
          : memoInstr
      : null

  // ── Right panel ────────────────────────────────────────────────────────────
  const rightPanel = (() => {
    if (['yantra', 'intro', 'memomap', 'references'].includes(activeTab)) return null
    if (activeTab === 'bhupura' && bhupuraMemorise) {
      const bhupuraDotCount = bhupuraMemoGroup === 'all' ? 29
        : bhupuraMemoGroup === 'siddhiShakti' ? 11
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
    if (activeTab === 'spotcheck') return (
      <div className="px-5 py-6 space-y-5">
        <p className="text-xs font-mono text-muted uppercase tracking-widest font-bold">{tr('spot.title')}</p>

        {/* Filter buttons */}
        <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.segment')}</p>
        <div className="flex flex-wrap gap-1.5">
          {SC_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => { setScFilter(f.id); const filt = SC_FILTERS.find(sf => sf.id === f.id); const def = 'defaultSubFilter' in (filt ?? {}) ? filt.defaultSubFilter : (filt?.subFilters?.find(s => s.groupIds !== null)?.id ?? null); setScSubFilter(def) }}
              className={[
                'px-2.5 py-1 rounded text-xs font-mono transition-colors',
                scFilter === f.id
                  ? 'bg-gold-400 text-surface-900 font-bold'
                  : 'bg-surface-800 text-muted hover:text-cream',
              ].join(' ')}
            >
              {f.label}
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
                    'flex-1 py-1 rounded text-xs font-mono transition-colors text-center',
                    (s.groupIds === null ? scSubFilter === null : scSubFilter === s.id)
                      ? 'bg-gold-400 text-surface-900 font-bold'
                      : 'bg-surface-800 text-muted hover:text-cream',
                  ].join(' ')}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )
        })()}

        {/* Limit buttons */}
        <div className="space-y-1.5">
          <p className="text-xs font-mono text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>{tr('spot.round_size')}</p>
          <div className="flex gap-1.5">
            {[10, 20, 50, 'whole'].map(n => (
              <button
                key={n}
                onClick={() => setScLimit(n === 'whole' ? null : n)}
                className={[
                  'px-2.5 py-1 rounded text-xs font-mono transition-colors',
                  (n === 'whole' ? scLimit === null : scLimit === n)
                    ? 'bg-gold-400 text-surface-900 font-bold'
                    : 'bg-surface-800 text-muted hover:text-cream',
                ].join(' ')}
              >
                {n === 'whole' ? 'Whole' : n}
              </button>
            ))}
          </div>
        </div>

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
          className="w-full py-1.5 rounded bg-surface-800 text-xs text-muted hover:text-cream hover:bg-surface-700 transition-colors font-mono"
        >
          skip →
        </button>

        {/* Scores */}
        {(scProgress.idx > 0 || sessionStats.total > 0) && (() => {
          const roundPct  = scProgress.idx > 0 ? Math.round((scProgress.correct / scProgress.idx) * 100) : null
          const sesCorrect = sessionStats.correct + scProgress.correct
          const sesTotal   = sessionStats.total   + scProgress.idx
          const sesPct     = sesTotal > 0 ? Math.round((sesCorrect / sesTotal) * 100) : null
          return (
            <div className="space-y-1.5 pt-1 border-t border-surface-800">
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
    if (selectedDeity) return <DeityDetail deity={selectedDeity} script={script} />

    // Inner (Tithi Nitya) memo — moon toggle in same position as explore
    if (activeTab === 'inner' && innerMemorise) {
      return (
        <div className="overflow-y-auto">
          <SectionInfo tabId="inner" script={script} tr={tr} />
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
          <SectionInfo tabId="inner" script={script} tr={tr} />
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
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{i + 1}.</span>
                    <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                      {displayName(d, script)}
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
          <SectionInfo tabId="gurava" script={script} tr={tr} />
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
                            <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{n}.</span>
                            <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                              {displayName(d, script)}
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
          <SectionInfo tabId="nyasa" script={script} tr={tr} />
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
                    <span className="text-muted font-mono w-4 flex-shrink-0 text-right text-xs">{d.sequenceInSection}.</span>
                    <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                      {displayName(d, script)}
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
            <SectionInfo tabId={tab} script={script} showRows={false} tr={tr} />
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
                      <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{i + 1}.</span>
                      <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                        {displayName(d, script)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <CircuitRows circuitNumber={cNum} script={script} onHoverFill={setCircuitFillAll} tr={tr} />
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
          <SectionInfo tabId="c2" script={script} showRows={false} tr={tr} />
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
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{i + 1}.</span>
                    <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                      {displayName(d, script)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CircuitRows circuitNumber={2} script={script} onHoverFill={setCircuitFillAll} tr={tr} />
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
          <SectionInfo tabId="chakreshvari" script={script} tr={tr} />
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
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{i + 1}.</span>
                    <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                      {displayName(d, script)}
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
          <SectionInfo tabId="c9" script={script} showRows={false} tr={tr} />
          <div className="border-t border-surface-700 px-3 pb-3 pt-2">
            <p className="font-mono uppercase tracking-widest text-xs text-muted pb-1.5">{tr('deity.singular')}</p>
            {c9d && (
              <p
                className={`${script !== 'devanagari' ? 'iast ' : ''}text-sm text-gold-400 rounded px-1 -mx-1 hover:bg-surface-700 transition-colors cursor-default`}
                onMouseEnter={() => setCircuitFillAll(true)}
                onMouseLeave={() => setCircuitFillAll(false)}
              >
                {displayName(c9d, script)}
              </p>
            )}
          </div>
          <CircuitRows circuitNumber={9} script={script} onHoverFill={setCircuitFillAll} tr={tr} />
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
          <SectionInfo tabId="c8" script={script} showRows={false} tr={tr} />
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
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{i + 1}.</span>
                    <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                      {displayName(d, script)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CircuitRows circuitNumber={8} script={script} onHoverFill={setCircuitFillAll} tr={tr} />
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
          <SectionInfo tabId="bhupura" script={script} showRows={false} tr={tr} />
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
                          <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{d.sequenceInSection}.</span>
                          <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                            {displayName(d, script)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CircuitRows circuitNumber={1} script={script} onHoverFill={setCircuitFillAll} tr={tr} />
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
          <SectionInfo tabId="closing" script={script} tr={tr} />
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
                    <span className="text-muted font-mono w-5 flex-shrink-0 text-right text-xs">{i + 1}.</span>
                    <span className={`${script !== 'devanagari' ? 'iast text-base ' : 'text-sm '}text-gold-400`}>
                      {displayName(d, script)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    return <SectionInfo tabId={activeTab} script={script} tr={tr} />
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
    <div className="h-screen flex flex-col bg-surface-950 text-cream overflow-hidden">

      {/* ── Site tour portal (renders to document.body via createPortal) ──── */}
      {tourElement}

      {/* ── Landscape lock overlay (mobile only) ────────────────────────── */}
      <div className="hidden landscape:flex md:!hidden fixed inset-0 z-[9999] bg-surface-900 flex-col items-center justify-center gap-4 px-8 text-center">
        <svg viewBox="0 0 64 64" className="w-16 h-16 text-gold-500" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="8" y="16" width="48" height="32" rx="4" />
          <path d="M38 8 L56 26 L38 44" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </svg>
        <p className="iast text-gold-400 text-lg font-medium">Please rotate your device</p>
        <p className="text-muted text-sm">{tr('device.portrait')}</p>
      </div>

      {/* ── Mobile drawer backdrop ───────────────────────────────────────── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden"
             onClick={() => setMobileNavOpen(false)} />
      )}

      {/* ── Mobile top bar (portrait only) ──────────────────────────────── */}
      <div className="flex md:hidden flex-shrink-0 h-11 items-center px-3 gap-2 bg-surface-950 border-b border-surface-800 z-30">
        <button
          onClick={() => setMobileNavOpen(o => !o)}
          className="w-8 h-8 flex items-center justify-center text-muted hover:text-cream transition-colors"
          style={{ fontSize: 20 }}
          aria-label={tr('nav.open')}
        >
          ☰
        </button>
        <span className={`flex-1 text-sm font-medium truncate ${script !== 'devanagari' ? 'iast' : ''} text-gold-400`}>
          {(() => {
            const FOOTER_TR = { intro: tr('tab.intro'), spotcheck: tr('tab.spotcheck'), memomap: tr('tab.memomap'), 'activity-log': tr('tab.actlog'), references: tr('tab.references') }
            return FOOTER_TR[activeTab] ?? TABS.find(t => t.id === activeTab)?.footerLabel ?? ''
          })()}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(m => !m)}
              title="UI Language"
              className="w-7 h-7 flex items-center justify-center rounded border border-surface-700 text-muted hover:text-cream hover:border-gold-500 transition-colors"
            >
              <Globe size={13} />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-8 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50 py-1 min-w-[130px]">
                <button
                  onClick={() => { setUiLang('en'); setShowLangMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs text-cream hover:bg-surface-700 flex items-center justify-between"
                >
                  English <span className="text-gold-400">✓</span>
                </button>
                {['हिन्दी','తెలుగు','தமிழ்','ಕನ್ನಡ','മലയാളം'].map(lang => (
                  <button key={lang} disabled
                    className="w-full text-left px-3 py-1.5 text-xs text-muted opacity-40 cursor-not-allowed"
                  >{lang}</button>
                ))}
              </div>
            )}
          </div>
          <select
            value={script}
            onChange={e => { setScript(e.target.value); setShowLangMenu(false) }}
            className="text-xs rounded border border-surface-700 bg-surface-900 text-gold-300 px-1.5 py-0.5"
          >
            {LOCALE_ORDER.map(id => (
              <option key={id} value={id}>{LOCALE_CONFIG[id].shortLabel}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3-column content row ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside data-tour="sidebar"
        className={`w-72 flex-shrink-0 flex flex-col border-r border-surface-800 overflow-hidden bg-surface-900
          fixed inset-y-0 left-0 z-50 transition-transform duration-300
          md:relative md:translate-x-0 md:transition-none md:z-auto
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Title block */}
        <div className="px-4 pt-4 pb-3 border-b border-surface-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <h1 className="iast text-gold-400 text-base font-semibold tracking-wide leading-tight">
                śrī yantra memoriser
              </h1>
              {!navCollapsed && (
                <p className="iast mt-1 text-muted italic" style={{ fontSize: '13px', letterSpacing: '0.03em' }}>
                  for the Khadgamala Stotram
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              {!navCollapsed && (<>
                {/* Language picker */}
                <div className="relative group/lang">
                  <button
                    onClick={() => setShowLangMenu(m => !m)}
                    className="w-5 h-5 rounded-full border border-surface-600 text-muted hover:text-cream hover:border-gold-500 transition-colors flex items-center justify-center"
                  >
                    <Globe size={11} />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-6 px-1.5 py-0.5 rounded text-[10px] bg-surface-700 text-cream whitespace-nowrap opacity-0 group-hover/lang:opacity-100 transition-opacity z-50">
                    Language
                  </div>
                  {showLangMenu && (
                    <div className="absolute left-0 top-6 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50 py-1 min-w-[130px]">
                      <button
                        onClick={() => { setUiLang('en'); setShowLangMenu(false) }}
                        className="w-full text-left px-3 py-1.5 text-xs text-cream hover:bg-surface-700 flex items-center justify-between"
                      >
                        English <span className="text-gold-400">✓</span>
                      </button>
                      {['हिन्दी','తెలుగు','தமிழ்','ಕನ್ನಡ','മലയാളം'].map(lang => (
                        <button key={lang} disabled
                          className="w-full text-left px-3 py-1.5 text-xs text-muted opacity-40 cursor-not-allowed"
                        >{lang}</button>
                      ))}
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
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-6 px-1.5 py-0.5 rounded text-[10px] bg-surface-700 text-cream whitespace-nowrap opacity-0 group-hover/collapse:opacity-100 transition-opacity z-50">
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
                    <span className="text-[11px] font-mono text-cream uppercase tracking-[0.12em]">
                      {tab.heading}
                    </span>
                    <span className="text-cream text-[11px]">{isOpen ? '▾' : '▸'}</span>
                  </button>
                )
              }
              if (currentHeadingId !== null && !openSections[currentHeadingId]) return null
              const dot = tabDotMap[tab.id]
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors flex items-center justify-between gap-1
                    ${script !== 'devanagari' ? 'iast' : ''}
                    ${activeTab === tab.id
                      ? 'text-gold-300 bg-gold-900/30'
                      : 'text-muted hover:text-cream'}`}
                  {...(TOUR_NAV_IDS[tab.id] ? { 'data-tour': TOUR_NAV_IDS[tab.id] } : {})}
                >
                  <span className="flex-1 min-w-0">
                    {script === 'devanagari'
                      ? (tab.navLabelDev || tab.navLabel)
                      : script === 'english'
                      ? (tab.navLabelEn || tab.navLabel)
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

        {/* Script selector — always visible; label hidden when collapsed; mt-auto pins to bottom */}
        <div className="mt-auto px-3 py-3 border-t border-surface-800 flex-shrink-0">
          {!navCollapsed && (
            <p className="text-[11px] font-mono text-cream uppercase tracking-[0.12em] px-2 mb-1.5">Script</p>
          )}
          <div className="relative">
            <button
              onClick={() => setShowScriptMenu(m => !m)}
              className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded border border-surface-700 bg-surface-800 hover:border-gold-600 transition-colors"
            >
              <span className="text-xs text-gold-300 font-mono">{LOCALE_CONFIG[script]?.label ?? script}</span>
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
                    {LOCALE_CONFIG[id].label}
                    {id === script && <span className="text-gold-400 text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* ── Centre (active view) ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}>

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto pt-2 relative">
          <div className="w-full" style={{ maxWidth: 'min(100%, calc(100vh - 6rem))' }}>
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
                      filledRegions={MODEL_YANTRA_FILLS}
                    />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'nyasa'   && <NyasaView
                                          script={script}
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
                                        />}
            {activeTab === 'inner'   && <InnerView
                                          script={script}
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
              />
            )}
            {activeTab === 'closing' && (
              <ClosingView
                script={script}
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
                          {f.label}
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
                          {s.label}
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
                          {n === 'whole' ? 'Whole' : n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skip */}
                  <button onClick={() => scSkipRef.current?.()}
                    className="w-full py-1.5 rounded bg-surface-800 text-xs text-muted font-mono">
                    skip →
                  </button>

                </div>
              )
            })()}
            {activeTab === 'browser'      && <CircuitBrowser script="devanagari" />}
            {activeTab === 'intro'        && <IntroView script={script} />}
            {activeTab === 'references'   && <ReferencesView />}
          </div>

          {/* Memomap renders outside the w-full wrapper so flex-1 min-h-0 gives
              MemoMapView a real defined height for its internal h-full flex-col layout */}
          {activeTab === 'memomap' && (
            <div className="flex-1 min-h-0 w-full max-w-lg flex flex-col">
              <MemoMapView
                script={script}
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
            <div className="flex-1 min-h-0 w-full max-w-lg flex flex-col">
              <ActivityLogView tr={tr} />
            </div>
          )}
        </div>

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
        <div className={`${['spotcheck', 'activity-log', 'memomap'].includes(activeTab) ? 'hidden' : 'flex'} md:hidden flex-shrink-0 px-2 py-1 gap-1`}>
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
            className="flex-1 min-w-0 text-left text-xs py-1.5 px-2 rounded-md
              text-muted hover:text-gold-300 hover:bg-surface-800/60
              disabled:opacity-20 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted
              transition-colors overflow-hidden"
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="flex-shrink-0 text-base leading-none">←</span>
              <span className="truncate">{prevTab?.footerLabel ?? ''}</span>
            </span>
          </button>
          {footerInstruction && (
            <span className="hidden md:flex flex-shrink-0 px-1 text-center select-none">
              {footerInstruction}
            </span>
          )}
          <button
            onClick={() => nextTab && handleTabChange(nextTab.id)}
            disabled={!nextTab}
            className="flex-1 min-w-0 text-right text-xs py-1.5 px-2 rounded-md
              text-muted hover:text-gold-300 hover:bg-surface-800/60
              disabled:opacity-20 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted
              transition-colors overflow-hidden"
          >
            <span className="flex items-center justify-end gap-1.5 min-w-0">
              <span className="truncate">{nextTab?.footerLabel ?? ''}</span>
              <span className="flex-shrink-0 text-base leading-none">→</span>
            </span>
          </button>
        </div>

      </main>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-l border-surface-800 flex-col"
             style={{ visibility: activeTab === 'yantra' ? 'hidden' : undefined }}>

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
                      <span className="text-red-400">{correct}/6 memorised</span>
                      {6 - correct > 0 && <span className="text-muted"> · {6 - correct} not memorised</span>}
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
                      <span className="text-red-400">{correct}/16 memorised</span>
                      {16 - correct > 0 && <span className="text-muted"> · {16 - correct} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
                      <span className="text-red-400">{correct}/19 memorised</span>
                      {19 - correct > 0 && <span className="text-muted"> · {19 - correct} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              const memoTotal = bhupuraMemoGroup === 'all' ? 31 : bhupuraMemoGroup === 'siddhiShakti' ? 13 : bhupuraMemoGroup === 'ashtaMatrika' ? 10 : 12
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
                      <span className="text-red-400">{correct}/30 memorised</span>
                      {30 - correct > 0 && <span className="text-muted"> · {30 - correct} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC2StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c2Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/18 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC4StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c4Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/16 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC5StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c5Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/12 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC6StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c6Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/12 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC7StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c7Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/10 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC8StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c8Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/9 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC9StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c9Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleNcStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  ncMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/9 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleClosingStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  closingMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/10 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
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
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
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
              >
                Explore
              </button>
              <button
                onClick={handleC3StartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c3Memorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
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
                      <span className="text-red-400">{correct}/10 memorised</span>
                      {skipped > 0 && <span className="text-muted"> · {skipped} not memorised</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {c3PrevResults !== null && (() => {
              const notMem = getNotMemorisedNames(3, c3PrevResults, 10, script)
              if (notMem.length === 0) return null
              return (
                <d