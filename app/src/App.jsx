import { useState, useRef } from 'react'
import CircuitBrowser from './components/CircuitBrowser'
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
import data from './data/khadgamala-canonical.json'

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
  { id: 'yantra',       navLabel: 'śrī yantra',                    navLabelEn: 'Śrī Yantra',                            navLabelDev: 'श्री यन्त्र',           footerLabel: 'Śrī Yantra'           },
  { id: 'nyasa',        navLabel: 'nyāsāṅga-devatāḥ',             navLabelEn: 'Nyāsa Deities',                         navLabelDev: 'न्यासांगदेवताः',        footerLabel: 'Nyāsa Deities'        },
  { id: 'inner',        navLabel: 'tithi-nitya-devatāḥ',           navLabelEn: 'Tithi Nitya Deities',                   navLabelDev: 'तिथिनित्यदेवताः',      footerLabel: 'Tithi Nitya'          },
  { id: 'gurava',       navLabel: 'guravaḥ',                       navLabelEn: 'Gurus',                                 navLabelDev: 'गुरवः',                 footerLabel: 'Guravaḥ'              },
  { id: 'bhupura',      navLabel: 'cakra-prathamāvaraṇa-devatāḥ', navLabelEn: 'Deities of the Wheel of the 1st Veil', navLabelDev: 'चक्रप्रथमावरणदेवताः', footerLabel: 'Circuit 1 · Bhūpura' },
  { id: 'c2',           navLabel: 'cakra-dvitīyāvaraṇa-devatāḥ',  navLabelEn: 'Deities of the Wheel of the 2nd Veil', navLabelDev: 'चक्रद्वितीयावरणदेवताः',footerLabel: 'Circuit 2 · 16 petals'},
  { id: 'c3',           navLabel: 'cakra-tṛtīyāvaraṇa-devatāḥ',   navLabelEn: 'Deities of the Wheel of the 3rd Veil', navLabelDev: 'चक्रतृतीयावरणदेवताः', footerLabel: 'Circuit 3 · 8 petals' },
  { id: 'c4',           navLabel: 'cakra-caturthāvaraṇa-devatāḥ', navLabelEn: 'Deities of the Wheel of the 4th Veil', navLabelDev: 'चक्रचतुर्थावरणदेवताः',footerLabel: 'Circuit 4 · 14 △'    },
  { id: 'c5',           navLabel: 'cakra-pañcamāvaraṇa-devatāḥ',  navLabelEn: 'Deities of the Wheel of the 5th Veil', navLabelDev: 'चक्रपञ्चमावरणदेवताः', footerLabel: 'Circuit 5 · 10 △'    },
  { id: 'c6',           navLabel: 'cakra-ṣaṣṭhāvaraṇa-devatāḥ',  navLabelEn: 'Deities of the Wheel of the 6th Veil', navLabelDev: 'चक्रषष्ठावरणदेवताः',  footerLabel: 'Circuit 6 · 10 △'    },
  { id: 'c7',           navLabel: 'cakra-saptamāvaraṇa-devatāḥ',   navLabelEn: 'Deities of the Wheel of the 7th Veil', navLabelDev: 'चक्रसप्तमावरणदेवताः', footerLabel: 'Circuit 7 · 8 △'     },
  { id: 'c8',           navLabel: 'cakra-aṣṭamāvaraṇa-devatāḥ',   navLabelEn: 'Deities of the Wheel of the 8th Veil', navLabelDev: 'चक्राष्टमावरणदेवताः', footerLabel: 'Circuit 8 · Triangle' },
  { id: 'c9',           navLabel: 'cakra-navamāvaraṇa-devatāḥ',    navLabelEn: 'Deities of the Wheel of the 9th Veil', navLabelDev: 'चक्रनवमावरणदेवताः',   footerLabel: 'Circuit 9 · Bindu'    },
  { id: 'chakreshvari', navLabel: 'navacakrēśvarī nāmāni',         navLabelEn: 'Names of the Nine Chakras',            navLabelDev: 'नवचक्रेश्वरी नामानि', footerLabel: 'Nava Chakreshvarī'   },
  { id: 'closing',      navLabel: 'śrīdevī-viśēṣaṇāni',           navLabelEn: 'Śrīdevī Epithets and Namaskāra',        navLabelDev: 'श्रीदेवी विशेषणानि',   footerLabel: 'Śrīdevī Epithets'    },
  { id: 'browser',      navLabel: 'Circuit Browser',               navLabelEn: 'Circuit Browser',                      navLabelDev: 'Circuit Browser',       footerLabel: 'Circuit Browser'      },
]

// Maps tab id → circuit number (for right-panel SectionInfo)
const TAB_TO_CIRCUIT = {
  bhupura: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7, c8: 8, c9: 9
}

// Maps circuit number → tab id (for "Go to circuit" button)
const CIRCUIT_TO_TAB = {
  1: 'bhupura', 2: 'c2', 3: 'c3', 4: 'c4', 5: 'c5', 6: 'c6', 7: 'c7', 8: 'c8', 9: 'c9'
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

function displayName(deity, script) {
  if (!deity) return ''
  const s = deity.scripts
  if (script === 'devanagari') return s.devanagari || s.iast
  if (script === 'english')    return s.english    || s.iast
  return s.iast
}

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
  if (script === 'english') return `Wheel of the ${ordinal(circuitNumber)} Veil`
  const labels = CIRCUIT_LABELS[circuitNumber]
  if (!labels) return `Circuit ${circuitNumber}`
  return script === 'devanagari' ? labels.dev : labels.iast
}

function sectionName(section, field, script) {
  if (!section) return ''
  const iastKey = field + 'Iast'
  if (script === 'english') {
    if (field === 'avarana' && section.circuitNumber)
      return `Wheel of the ${ordinal(section.circuitNumber)} Veil`
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
  else if (sectionId === 'nyasa')  subtitle = `Nyāsāṅga · ${sequenceInSection} of 6`
  else if (sectionId === 'inner')  subtitle = `Tithi Nitya · ${sequenceInSection} of 16`
  else if (sectionId === 'gurava') subtitle = `Gurava · ${sequenceInSection}`
  else                             subtitle = sectionId?.replace('circuit-', 'Circuit ') ?? ''

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

function CircuitDetail({ circuitNumber, script = 'iast', onNavigate }) {
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
          <span className="text-muted w-24 flex-shrink-0 pt-px">Chakra Svāminī</span>
          <span className="text-gold-500">{sectionName(section, 'chakraSvamini', script)}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">Yoginī</span>
          <span className="text-gold-500">
            {sectionName(section, 'yoginiType', script)}
            {secrecy && <span className="text-muted ml-1">· {secrecy}</span>}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">Chakreshvarī</span>
          <span className="text-gold-500">{sectionName(section, 'chakreshvari', script)}</span>
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

function SectionInfo({ tabId, script = 'iast' }) {
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
          <div className="pt-3 border-t border-surface-700 space-y-1.5 text-xs">
            <div className="flex gap-2">
              <span className="text-muted w-24 flex-shrink-0 pt-px">Position</span>
              <span className="text-cream">After the Nava Chakreshvarī</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted w-24 flex-shrink-0 pt-px">Count</span>
              <span className="text-cream">9 epithets + Namaskāra</span>
            </div>
          </div>
          <p className="text-muted text-xs italic pt-2 leading-relaxed">
            Hover a number to illuminate the Yantra · tap to reveal the name
          </p>
        </div>
      )
    }

    const hints = {
      nyasa:   'Tap a dot to reveal one of the six Nyāsāṅga Devatāḥ',
      inner:   'Tap a dot to reveal one of the 16 Tithi Nitya Devatāḥ',
      gurava:  'Tap a dot to reveal a guru from the divine lineage',
      c8:           'Tap a position to reveal one of the 7 deities of Circuit 8',
      c9:           'Tap the bindu to reveal the deity of Circuit 9',
      chakreshvari: 'Tap a dot to reveal the Tripura form presiding over that circuit',
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
      <div className="pt-3 border-t border-surface-700 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">Deities</span>
          <span className="text-muted">{deityCount}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">Chakra Svāminī</span>
          <span className="text-gold-500">{sectionName(section, 'chakraSvamini', script)}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">Yoginī</span>
          <span className="text-gold-500">{sectionName(section, 'yoginiType', script)}</span>
        </div>
        {secrecy && (
          <div className="flex gap-2">
            <span className="text-muted w-24 flex-shrink-0 pt-px">Secrecy</span>
            <span className="text-muted">{secrecy}</span>
          </div>
        )}
        <div className="flex gap-2">
          <span className="text-muted w-24 flex-shrink-0 pt-px">Chakreshvarī</span>
          <span className="text-gold-500">{sectionName(section, 'chakreshvari', script)}</span>
        </div>
      </div>
      <p className="text-muted text-xs pt-1 italic">Tap a dot to reveal a deity</p>
    </div>
  )
}

function CircuitTable({ selectedCircuit, onCircuitSelect }) {
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
        <p className="text-muted text-xs text-center mt-2 italic">Tap a circuit to explore</p>
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

function BhupuraMemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [contextMenu,  setContextMenu]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 1)
  if (!section) return null

  const dotsDone = currentSeq > 28

  const handleItemClick = (seq) => {
    if (extraTimer.current) return
    extraTimer.current = setTimeout(() => {
      extraTimer.current = null
      if (currentSeq === seq)              onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleItemDoubleClick = (seq) => {
    if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
    if (currentSeq === seq)              onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isHovered = hoveredField === fieldKey
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!dotsDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isHovered) {
      valueContent = <span className="text-gold-300 italic text-xs">hover to reveal</span>
    } else if (isActive && isHovered) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-muted">{value}</span>
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
        onDoubleClick={interactive ? () => handleItemDoubleClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) }
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
        {renderRow('Chakra Svāminī', 'chakraSvamini', 29)}
        {renderRow('Yoginī',         'yoginiType',    30)}
      </div>

      {(currentSeq === 29 || currentSeq === 30) && (
        <p className="text-xs text-muted italic leading-snug pt-1">
          hover to reveal<br />
          dbl-click = memorised · click = not memorised
        </p>
      )}

      {currentSeq > 30 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 30
              ? 'All memorised — well done!'
              : 'Round complete.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('c2')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              Next circuit →
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="fixed z-50 bg-surface-900 border border-surface-600 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, minWidth: '11rem' }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}
            >
              {results[contextMenu.seq] === 'correct' ? 'Unmark as memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
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

function C2MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [contextMenu,  setContextMenu]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 2)
  if (!section) return null

  const petalsDone = currentSeq > 16

  // Single-click: skip if active, unmark if past-correct
  const handleItemClick = (seq) => {
    if (extraTimer.current) return
    extraTimer.current = setTimeout(() => {
      extraTimer.current = null
      if (currentSeq === seq)              onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  // Double-click: mark if active or past-skipped
  const handleItemDoubleClick = (seq) => {
    if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
    if (currentSeq === seq)              onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isHovered = hoveredField === fieldKey
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!petalsDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isHovered) {
      valueContent = <span className="text-gold-300 italic text-xs">hover to reveal</span>
    } else if (isActive && isHovered) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-muted">{value}</span>
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
        onDoubleClick={interactive ? () => handleItemDoubleClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) }
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
        {renderRow('Chakra Svāminī', 'chakraSvamini', 17)}
        {renderRow('Yoginī',         'yoginiType',    18)}
      </div>

      {/* Hint during active extra phases */}
      {(currentSeq === 17 || currentSeq === 18) && (
        <p className="text-xs text-muted italic leading-snug pt-1">
          hover to reveal<br />
          dbl-click = memorised · click = not memorised
        </p>
      )}

      {/* Completion — show once all 18 items have been attempted */}
      {currentSeq > 18 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 18
              ? 'All memorised — well done!'
              : 'Round complete.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('c3')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              Next circuit →
            </button>
          </div>
        </div>
      )}

      {/* Context menu for past-item correction */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="fixed z-50 bg-surface-900 border border-surface-600 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, minWidth: '11rem' }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}
            >
              {results[contextMenu.seq] === 'correct' ? 'Unmark as memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
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

function C3MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [contextMenu,  setContextMenu]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 3)
  if (!section) return null

  const petalsDone = currentSeq > 8

  const handleItemClick = (seq) => {
    if (extraTimer.current) return
    extraTimer.current = setTimeout(() => {
      extraTimer.current = null
      if (currentSeq === seq)              onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleItemDoubleClick = (seq) => {
    if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
    if (currentSeq === seq)              onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isHovered = hoveredField === fieldKey
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!petalsDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isHovered) {
      valueContent = <span className="text-gold-300 italic text-xs">hover to reveal</span>
    } else if (isActive && isHovered) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-muted">{value}</span>
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
        onDoubleClick={interactive ? () => handleItemDoubleClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) }
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
        {renderRow('Chakra Svāminī', 'chakraSvamini', 9)}
        {renderRow('Yoginī',         'yoginiType',    10)}
      </div>

      {(currentSeq === 9 || currentSeq === 10) && (
        <p className="text-xs text-muted italic leading-snug pt-1">
          hover to reveal<br />
          dbl-click = memorised · click = not memorised
        </p>
      )}

      {currentSeq > 10 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 10
              ? 'All memorised — well done!'
              : 'Round complete.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('c4')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              Next circuit →
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="fixed z-50 bg-surface-900 border border-surface-600 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, minWidth: '11rem' }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}
            >
              {results[contextMenu.seq] === 'correct' ? 'Unmark as memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
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

function C4MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [contextMenu,  setContextMenu]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 4)
  if (!section) return null

  const trianglesDone = currentSeq > 14

  const handleItemClick = (seq) => {
    if (extraTimer.current) return
    extraTimer.current = setTimeout(() => {
      extraTimer.current = null
      if (currentSeq === seq)              onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleItemDoubleClick = (seq) => {
    if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
    if (currentSeq === seq)              onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isHovered = hoveredField === fieldKey
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isHovered) {
      valueContent = <span className="text-gold-300 italic text-xs">hover to reveal</span>
    } else if (isActive && isHovered) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-muted">{value}</span>
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
        onDoubleClick={interactive ? () => handleItemDoubleClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) }
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
        {renderRow('Chakra Svāminī', 'chakraSvamini', 15)}
        {renderRow('Yoginī',         'yoginiType',    16)}
      </div>

      {(currentSeq === 15 || currentSeq === 16) && (
        <p className="text-xs text-muted italic leading-snug pt-1">
          hover to reveal<br />
          dbl-click = memorised · click = not memorised
        </p>
      )}

      {currentSeq > 16 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 16
              ? 'All memorised — well done!'
              : 'Round complete.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('c5')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              Next circuit →
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="fixed z-50 bg-surface-900 border border-surface-600 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, minWidth: '11rem' }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}
            >
              {results[contextMenu.seq] === 'correct' ? 'Unmark as memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
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

function C5MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [contextMenu,  setContextMenu]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 5)
  if (!section) return null

  const trianglesDone = currentSeq > 10

  const handleItemClick = (seq) => {
    if (extraTimer.current) return
    extraTimer.current = setTimeout(() => {
      extraTimer.current = null
      if (currentSeq === seq)              onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleItemDoubleClick = (seq) => {
    if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
    if (currentSeq === seq)              onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isHovered = hoveredField === fieldKey
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isHovered) {
      valueContent = <span className="text-gold-300 italic text-xs">hover to reveal</span>
    } else if (isActive && isHovered) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-muted">{value}</span>
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
        onDoubleClick={interactive ? () => handleItemDoubleClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) }
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
        {renderRow('Chakra Svāminī', 'chakraSvamini', 11)}
        {renderRow('Yoginī',         'yoginiType',    12)}
      </div>

      {(currentSeq === 11 || currentSeq === 12) && (
        <p className="text-xs text-muted italic leading-snug pt-1">
          hover to reveal<br />
          dbl-click = memorised · click = not memorised
        </p>
      )}

      {currentSeq > 12 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 12
              ? 'All memorised — well done!'
              : 'Round complete.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('c6')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              Next circuit →
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="fixed z-50 bg-surface-900 border border-surface-600 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, minWidth: '11rem' }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}
            >
              {results[contextMenu.seq] === 'correct' ? 'Unmark as memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
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

function C6MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [contextMenu,  setContextMenu]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 6)
  if (!section) return null

  const trianglesDone = currentSeq > 10

  const handleItemClick = (seq) => {
    if (extraTimer.current) return
    extraTimer.current = setTimeout(() => {
      extraTimer.current = null
      if (currentSeq === seq)              onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleItemDoubleClick = (seq) => {
    if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
    if (currentSeq === seq)              onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isHovered = hoveredField === fieldKey
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isHovered) {
      valueContent = <span className="text-gold-300 italic text-xs">hover to reveal</span>
    } else if (isActive && isHovered) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-muted">{value}</span>
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
        onDoubleClick={interactive ? () => handleItemDoubleClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) }
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
        {renderRow('Chakra Svāminī', 'chakraSvamini', 11)}
        {renderRow('Yoginī',         'yoginiType',    12)}
      </div>

      {(currentSeq === 11 || currentSeq === 12) && (
        <p className="text-xs text-muted italic leading-snug pt-1">
          hover to reveal<br />
          dbl-click = memorised · click = not memorised
        </p>
      )}

      {currentSeq > 12 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 12
              ? 'All memorised — well done!'
              : 'Round complete.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('c7')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              Next circuit →
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="fixed z-50 bg-surface-900 border border-surface-600 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, minWidth: '11rem' }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}
            >
              {results[contextMenu.seq] === 'correct' ? 'Unmark as memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
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

function C7MemoriseInfo({ currentSeq, results, onMarkResult, onToggleResult, onRestart, onNavigate, script }) {
  const [hoveredField, setHoveredField] = useState(null)
  const [contextMenu,  setContextMenu]  = useState(null)
  const extraTimer = useRef(null)

  const section = circuitSections.find(s => s.circuitNumber === 7)
  if (!section) return null

  const trianglesDone = currentSeq > 8

  const handleItemClick = (seq) => {
    if (extraTimer.current) return
    extraTimer.current = setTimeout(() => {
      extraTimer.current = null
      if (currentSeq === seq)              onMarkResult(seq, 'wrong')
      else if (results[seq] === 'correct') onToggleResult(seq)
    }, 280)
  }

  const handleItemDoubleClick = (seq) => {
    if (extraTimer.current) { clearTimeout(extraTimer.current); extraTimer.current = null }
    if (currentSeq === seq)              onMarkResult(seq, 'correct')
    else if (results[seq] !== 'correct') onToggleResult(seq)
  }

  const renderRow = (labelText, fieldKey, seq) => {
    const isActive  = currentSeq === seq
    const isPast    = currentSeq > seq
    const isCorrect = results[seq] === 'correct'
    const isHovered = hoveredField === fieldKey
    const value     = sectionName(section, fieldKey, script)

    let valueContent
    if (!trianglesDone && !isActive) {
      valueContent = <span className="text-surface-600 tracking-widest">···</span>
    } else if (isActive && !isHovered) {
      valueContent = <span className="text-gold-300 italic text-xs">hover to reveal</span>
    } else if (isActive && isHovered) {
      valueContent = <span className="text-gold-800">{value}</span>
    } else if (isPast && isCorrect) {
      valueContent = <span className="text-red-400">{value}</span>
    } else if (isPast) {
      valueContent = <span className="text-muted">{value}</span>
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
        onDoubleClick={interactive ? () => handleItemDoubleClick(seq) : undefined}
        onMouseEnter={isActive ? () => setHoveredField(fieldKey) : undefined}
        onMouseLeave={isActive ? () => setHoveredField(null) : undefined}
        onContextMenu={interactive && isPast
          ? e => { e.preventDefault(); setContextMenu({ seq, x: e.clientX, y: e.clientY }) }
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
        {renderRow('Chakra Svāminī', 'chakraSvamini', 9)}
        {renderRow('Yoginī',         'yoginiType',    10)}
      </div>

      {(currentSeq === 9 || currentSeq === 10) && (
        <p className="text-xs text-muted italic leading-snug pt-1">
          hover to reveal<br />
          dbl-click = memorised · click = not memorised
        </p>
      )}

      {currentSeq > 10 && (
        <div className="pt-3 border-t border-surface-700 space-y-2">
          <p className="text-xs text-muted italic leading-snug">
            {Object.values(results).filter(v => v === 'correct').length === 10
              ? 'All memorised — well done!'
              : 'Round complete.'}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onRestart}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-cream transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => onNavigate('c8')}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gold-800/20 hover:bg-gold-700/30 text-gold-400 hover:text-gold-300 border border-gold-800/40 hover:border-gold-700/50 transition-colors"
            >
              Next circuit →
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="fixed z-50 bg-surface-900 border border-surface-600 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, minWidth: '11rem' }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-cream hover:bg-surface-700 transition-colors"
              onClick={() => { onToggleResult(contextMenu.seq); setContextMenu(null) }}
            >
              {results[contextMenu.seq] === 'correct' ? 'Unmark as memorised' : 'Mark as memorised'}
            </button>
          </div>
        </>
      )}

    </div>
  )
}

// ── Simplified Yantra view (props driven) ─────────────────────────────────────

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

export default function App() {
  const [activeTab, setActiveTab] = useState('yantra')
  const [script,    setScript]    = useState('iast')

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

  // ── Global deity selection ─────────────────────────────────────────────────
  const [selectedDeity, setSelectedDeity] = useState(null)

  // ── C2 Memorise mode (lifted so right panel can render controls) ───────────
  const [c2Memorise,    setC2Memorise]    = useState(false)
  const [c2CurrentSeq,  setC2CurrentSeq]  = useState(1)
  const [c2Results,     setC2Results]     = useState({})    // seq → 'correct'
  const [c2PrevResults, setC2PrevResults] = useState(null)  // null = no attempt yet
  const [c2Flash,       setC2Flash]       = useState(false)  // true during all-correct flash

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
    const nextSeq = seq + 1
    setC2CurrentSeq(nextSeq)
    if (nextSeq > 18) {
      setC2PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 18, rounds: prev.rounds + 1 }))
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
  const [c3Memorise,    setC3Memorise]    = useState(false)
  const [c3CurrentSeq,  setC3CurrentSeq]  = useState(1)
  const [c3Results,     setC3Results]     = useState({})
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
    const nextSeq = seq + 1
    setC3CurrentSeq(nextSeq)
    if (nextSeq > 10) {
      setC3PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 10, rounds: prev.rounds + 1 }))
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
  const [c4Memorise,    setC4Memorise]    = useState(false)
  const [c4CurrentSeq,  setC4CurrentSeq]  = useState(1)
  const [c4Results,     setC4Results]     = useState({})
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
    const nextSeq = seq + 1
    setC4CurrentSeq(nextSeq)
    if (nextSeq > 16) {
      setC4PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 16, rounds: prev.rounds + 1 }))
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
  const [c5Memorise,    setC5Memorise]    = useState(false)
  const [c5CurrentSeq,  setC5CurrentSeq]  = useState(1)
  const [c5Results,     setC5Results]     = useState({})
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
    const nextSeq = seq + 1
    setC5CurrentSeq(nextSeq)
    if (nextSeq > 12) {
      setC5PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 12, rounds: prev.rounds + 1 }))
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
  const [c6Memorise,    setC6Memorise]    = useState(false)
  const [c6CurrentSeq,  setC6CurrentSeq]  = useState(1)
  const [c6Results,     setC6Results]     = useState({})
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
    const nextSeq = seq + 1
    setC6CurrentSeq(nextSeq)
    if (nextSeq > 12) {
      setC6PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 12, rounds: prev.rounds + 1 }))
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
  const [c7Memorise,    setC7Memorise]    = useState(false)
  const [c7CurrentSeq,  setC7CurrentSeq]  = useState(1)
  const [c7Results,     setC7Results]     = useState({})
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
    const nextSeq = seq + 1
    setC7CurrentSeq(nextSeq)
    if (nextSeq > 10) {
      setC7PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 10, rounds: prev.rounds + 1 }))
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
  const [c8Memorise,    setC8Memorise]    = useState(false)
  const [c8CurrentSeq,  setC8CurrentSeq]  = useState(1)
  const [c8Results,     setC8Results]     = useState({})
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
    const nextSeq = seq + 1
    setC8CurrentSeq(nextSeq)
    if (nextSeq > 7) {
      setC8PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 7, rounds: prev.rounds + 1 }))
      const allCorrect = Array.from({ length: 7 }, (_, i) => i + 1).every(s => newResults[s] === 'correct')
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
  const [c9Results,     setC9Results]     = useState({})
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
    const nextSeq = seq + 1
    setC9CurrentSeq(nextSeq)
    if (nextSeq > 1) {
      setC9PrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 1, rounds: prev.rounds + 1 }))
      const allCorrect = newResults[1] === 'correct'
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
  const [ncMemorise,    setNcMemorise]    = useState(false)
  const [ncCurrentSeq,  setNcCurrentSeq]  = useState(1)
  const [ncResults,     setNcResults]     = useState({})
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
    const nextSeq = seq + 1
    setNcCurrentSeq(nextSeq)
    if (nextSeq > 9) {
      setNcPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 9, rounds: prev.rounds + 1 }))
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
  const [closingMemorise,    setClosingMemorise]    = useState(false)
  const [closingCurrentSeq,  setClosingCurrentSeq]  = useState(1)
  const [closingResults,     setClosingResults]     = useState({})
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
    const nextSeq = seq + 1
    setClosingCurrentSeq(nextSeq)
    if (nextSeq > 10) {
      setClosingPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 10, rounds: prev.rounds + 1 }))
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
  const [nyasaResults,     setNyasaResults]     = useState({})
  const [nyasaPrevResults, setNyasaPrevResults] = useState(null)
  const [nyasaFlash,       setNyasaFlash]       = useState(false)

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
    const nextSeq = seq + 1
    setNyasaCurrentSeq(nextSeq)
    if (nextSeq > 6) {
      setNyasaPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 6, rounds: prev.rounds + 1 }))
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
  const [innerResults,     setInnerResults]     = useState({})
  const [innerPrevResults, setInnerPrevResults] = useState(null)
  const [innerFlash,       setInnerFlash]       = useState(false)

  const handleInnerStartMemorise = () => {
    setInnerMemorise(true)
    setInnerCurrentSeq(1)
    setInnerResults({})
    setInnerFlash(false)
  }
  const handleInnerExitMemorise = () => setInnerMemorise(false)
  const handleInnerMarkResult = (seq, result) => {
    const newResults = result === 'correct'
      ? { ...innerResults, [seq]: 'correct' }
      : { ...innerResults }
    if (result === 'correct') setInnerResults(newResults)
    const nextSeq = seq + 1
    setInnerCurrentSeq(nextSeq)
    if (nextSeq > 16) {
      setInnerPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 16, rounds: prev.rounds + 1 }))
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

  // ── Gurava (Guru lineage) Memorise mode ────────────────────────────────────
  const [guravaMemorse,    setGuravaMemorse]    = useState(false)
  const [guravaCurrentSeq, setGuravaCurrentSeq] = useState(1)
  const [guravaResults,    setGuravaResults]    = useState({})
  const [guravaPrevResults,setGuravaPrevResults] = useState(null)
  const [guravaFlash,      setGuravaFlash]      = useState(false)

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
    const nextSeq = seq + 1
    setGuravaCurrentSeq(nextSeq)
    if (nextSeq > 19) {
      setGuravaPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 19, rounds: prev.rounds + 1 }))
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
  const [bhupuraResults,     setBhupuraResults]     = useState({})
  const [bhupuraPrevResults, setBhupuraPrevResults] = useState(null)
  const [bhupuraFlash,       setBhupuraFlash]       = useState(false)

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
    const nextSeq = seq + 1
    setBhupuraCurrentSeq(nextSeq)
    if (nextSeq > 30) {
      setBhupuraPrevResults(newResults)
      setSessionStats(prev => ({ correct: prev.correct + Object.keys(newResults).length, total: prev.total + 30, rounds: prev.rounds + 1 }))
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

  // ── Show not-memorised list toggle (shared; reset on tab change) ──────────
  const [showErrors, setShowErrors] = useState(false)

  // ── Session stats (cumulative across all circuits and rounds) ──────────────
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, rounds: 0 })
  const handleResetSession = () => setSessionStats({ correct: 0, total: 0, rounds: 0 })

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
  const currentTabIdx = TABS.findIndex(t => t.id === activeTab)
  const prevTab = currentTabIdx > 0 ? TABS[currentTabIdx - 1] : null
  const nextTab = currentTabIdx < TABS.length - 1 ? TABS[currentTabIdx + 1] : null

  // ── Right panel ────────────────────────────────────────────────────────────
  const rightPanel = (() => {
    if (activeTab === 'yantra') {
      if (selectedCircuit) return <CircuitDetail circuitNumber={selectedCircuit} script={script} onNavigate={handleTabChange} />
      return <CircuitTable selectedCircuit={selectedCircuit} onCircuitSelect={handleCircuitSelect} />
    }
    if (activeTab === 'bhupura' && bhupuraMemorise) return (
      <BhupuraMemoriseInfo
        currentSeq={bhupuraCurrentSeq}
        results={bhupuraResults}
        onMarkResult={handleBhupuraMarkResult}
        onToggleResult={handleBhupuraToggleResult}
        onRestart={handleBhupuraStartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
      />
    )
    if (activeTab === 'c2' && c2Memorise) return (
      <C2MemoriseInfo
        currentSeq={c2CurrentSeq}
        results={c2Results}
        onMarkResult={handleC2MarkResult}
        onToggleResult={handleC2ToggleResult}
        onRestart={handleC2StartMemorise}
        onNavigate={handleNavigateToMemorise}
        script={script}
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
      />
    )
    if (selectedDeity) return <DeityDetail deity={selectedDeity} script={script} />
    return <SectionInfo tabId={activeTab} script={script} />
  })()

  // ── Yantra-tab sidebar controls ────────────────────────────────────────────
  const yantraControls = activeTab === 'yantra' && (
    <div className="border-t border-surface-800 flex-shrink-0">
      {/* Collapsible header */}
      <button
        onClick={() => setControlsOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-2 text-xs text-muted uppercase tracking-widest font-mono hover:text-cream transition-colors"
      >
        <span>Controls</span>
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
          <ToggleRow label="Triangles" active={showTriangles}
            onClick={() => setShowTriangles(t => !t)} />
          <ToggleRow label="Numbers" active={showNumbers}
            onClick={() => { setShowNumbers(n => !n); setLastTapped(null); if (selectedCircuit) setSelectedCircuit(null) }} />
          <ToggleRow label="Labels" active={showLabels}
            onClick={() => setShowLabels(l => !l)} />
          <ToggleRow label="Seed of Life" active={showSeedOfLife} colour="blue"
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

  return (
    <div className="h-screen flex bg-surface-950 text-cream overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-52 flex-shrink-0 flex flex-col border-r border-surface-800 overflow-hidden">

        {/* Title block */}
        <div className="px-4 pt-4 pb-3 border-b border-surface-800 flex-shrink-0">
          <h1 className="iast text-gold-400 text-sm font-medium tracking-wide leading-tight">
            śrī yantra memoriser
          </h1>
          <p className="mt-1" style={{ fontFamily: 'serif', color: '#c9a84c', opacity: 0.65, fontSize: '13px', letterSpacing: '0.04em' }}>
            ॐ ऐं ह्रीं श्रीं
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 min-h-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors
                ${script !== 'devanagari' ? 'iast' : ''}
                ${activeTab === tab.id
                  ? 'text-gold-300 bg-gold-900/30'
                  : 'text-muted hover:text-cream'}`}
            >
              {script === 'devanagari'
                ? (tab.navLabelDev || tab.navLabel)
                : script === 'english'
                ? (tab.navLabelEn || tab.navLabel)
                : tab.navLabel}
            </button>
          ))}
        </nav>

        {/* Yantra controls (yantra tab only) */}
        {yantraControls}

        {/* Script selector */}
        <div className="px-3 py-3 border-t border-surface-800 flex-shrink-0">
          <p className="text-xs text-muted uppercase tracking-widest font-mono px-2 mb-1.5">Script</p>
          <div className="flex gap-1 px-1">
            {[
              { id: 'iast',       label: 'IAST' },
              { id: 'devanagari', label: 'देव'  },
              { id: 'english',    label: 'En'   },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setScript(s.id)}
                className={`flex-1 text-xs py-1 rounded-md transition-colors border
                  ${script === s.id
                    ? 'text-gold-300 bg-gold-900/30 border-gold-700/50'
                    : 'text-muted border-surface-700 hover:text-cream'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

      </aside>

      {/* ── Centre (active view) ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto pt-8">
          <div className="w-full" style={{ maxWidth: 'min(100%, calc(100vh - 6rem))' }}>
            {activeTab === 'yantra'  && (
              <YantraView
                showTriangles={showTriangles}
                showNumbers={showNumbers}
                showLabels={showLabels}
                showSeedOfLife={showSeedOfLife}
                seedR={seedR}
                selectedCircuit={selectedCircuit}
                onCircuitSelect={handleCircuitSelect}
                filledRegions={filledRegions}
                onRegionClick={handleRegionClick}
                lastTapped={lastTapped}
              />
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
              />
            )}
            {activeTab === 'browser'      && <CircuitBrowser script={script} />}
          </div>
        </div>

        {/* ── Sequential navigation footer ─────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-surface-800 flex items-center px-2 py-1.5 gap-1">
          <button
            onClick={() => prevTab && handleTabChange(prevTab.id)}
            disabled={!prevTab}
            className="flex-1 min-w-0 text-left text-xs py-1.5 px-2 rounded-md
              text-muted hover:text-gold-300 hover:bg-surface-800/60
              disabled:opacity-20 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted
              transition-colors overflow-hidden"
          >
            <span className="flex items-center gap-1 min-w-0">
              <span className="flex-shrink-0">←</span>
              <span className="truncate">{prevTab?.footerLabel ?? ''}</span>
            </span>
          </button>
          <span className="flex-shrink-0 text-xs font-mono text-surface-600 px-2 select-none">
            {currentTabIdx + 1}/{TABS.length}
          </span>
          <button
            onClick={() => nextTab && handleTabChange(nextTab.id)}
            disabled={!nextTab}
            className="flex-1 min-w-0 text-right text-xs py-1.5 px-2 rounded-md
              text-muted hover:text-gold-300 hover:bg-surface-800/60
              disabled:opacity-20 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted
              transition-colors overflow-hidden"
          >
            <span className="flex items-center justify-end gap-1 min-w-0">
              <span className="truncate">{nextTab?.footerLabel ?? ''}</span>
              <span className="flex-shrink-0">→</span>
            </span>
          </button>
        </div>

      </main>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-l border-surface-800 flex flex-col">

        {/* Scrollable info area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {rightPanel}
        </div>

        {/* Nyasa Memorise controls — pinned to the bottom */}
        {activeTab === 'nyasa' && (
          <div className="flex-shrink-0 border-t border-surface-800 p-3 space-y-2.5">

            {/* Explore / Memorise toggle + Reset */}
            <div className="flex gap-1.5">
              <button
                onClick={handleNyasaExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !nyasaMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Explore
              </button>
              <button
                onClick={handleNyasaStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  nyasaMemorise
                    ? 'bg-gold-700 text-black'
                    : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >
                Memorise
              </button>
              {nyasaMemorise && (
                <button
                  onClick={handleNyasaStartMemorise}
                  title="Reset whole level"
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {/* Progress bar — visible during an active round */}
            {nyasaMemorise && nyasaCurrentSeq <= 6 && (() => {
              const correctCount = Object.values(nyasaResults).length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-600 transition-all duration-300"
                        style={{ width: `${((nyasaCurrentSeq - 1) / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {nyasaCurrentSeq - 1} / 6
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted italic text-center leading-snug">
                    double-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {/* Previous attempt summary */}
            {nyasaPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
                {(() => {
                  const correct = Object.values(nyasaPrevResults).filter(v => v === 'correct').length
                  const missed  = 6 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{correct}/6 memorised</span>
                      {missed > 0 && <span className="text-muted"> · {missed} not memorised</span>}
                    </p>
                  )
                })()}
              </div>
            )}

            {/* Not memorised list */}
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
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
                </p>
              </div>
            )}

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
              >Explore</button>
              <button
                onClick={handleInnerStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  innerMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >Memorise</button>
              {innerMemorise && (
                <button onClick={handleInnerStartMemorise} title="Reset" className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors">↺</button>
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    double-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}
            {innerPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Not memorised ({notMem.length})</span>
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
              >Explore</button>
              <button
                onClick={handleGuravaStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  guravaMemorse ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >Memorise</button>
              {guravaMemorse && (
                <button onClick={handleGuravaStartMemorise} title="Reset" className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors">↺</button>
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    double-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}
            {guravaPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Not memorised ({notMem.length})</span>
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
            <div className="flex gap-1.5">
              <button
                onClick={handleBhupuraExitMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !bhupuraMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >Explore</button>
              <button
                onClick={handleBhupuraStartMemorise}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  bhupuraMemorise ? 'bg-gold-700 text-black' : 'bg-surface-700 text-muted hover:text-cream'
                }`}
              >Memorise</button>
              {bhupuraMemorise && (
                <button onClick={handleBhupuraStartMemorise} title="Reset" className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors">↺</button>
              )}
            </div>
            {bhupuraMemorise && bhupuraCurrentSeq <= 30 && (() => {
              const correctCount = Object.values(bhupuraResults).filter(v => v === 'correct').length
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gold-600 transition-all duration-300"
                           style={{ width: `${((bhupuraCurrentSeq - 1) / 30) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {bhupuraCurrentSeq - 1} / 30
                      {correctCount > 0 && <span className="text-red-400"> · {correctCount}✓</span>}
                    </span>
                  </div>
                  <p className="text-xs text-muted italic text-center leading-snug">
                    double-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}
            {bhupuraPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Not memorised ({notMem.length})</span>
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {/* Previous attempt summary */}
            {c2PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {c4PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {c5PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {c6PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {c7PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                        style={{ width: `${((c8CurrentSeq - 1) / 7) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono whitespace-nowrap">
                      {c8CurrentSeq - 1} / 7
                      {correctCount > 0 && (
                        <span className="text-red-400"> · {correctCount}✓</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {c8PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
                {(() => {
                  const correct = Object.values(c8PrevResults).filter(v => v === 'correct').length
                  const skipped = 7 - correct
                  return (
                    <p className="text-xs">
                      <span className="text-red-400">{correct}/7 memorised</span>
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
                .map(d => script === 'devanagari' ? (d.scripts.devanagari || d.scripts.iast) : script === 'english' ? (d.scripts.english || d.scripts.iast) : d.scripts.iast)
              if (notMem.length === 0) return null
              return (
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset"
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-surface-700 text-muted hover:text-cream transition-colors"
                >
                  ↺
                </button>
              )}
            </div>

            {c9Memorise && c9CurrentSeq <= 1 && (
              <p className="text-xs text-muted italic text-center leading-snug">
                dbl-click the bindu = memorised<br />
                single-click = not yet
              </p>
            )}

            {c9PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {ncPrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
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
                  title="Reset whole level"
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
                  <p className="text-xs text-muted italic text-center leading-snug">
                    hover to reveal<br />
                    dbl-click = memorised · click = not memorised
                  </p>
                </div>
              )
            })()}

            {c3PrevResults !== null && (
              <div className="pt-1 border-t border-surface-700 space-y-1">
                <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Last attempt</p>
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
                <div className="pt-1 border-t border-surface-700 space-y-1">
                  <button className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowErrors(e => !e)}>
                    <span className="text-xs text-muted font-mono uppercase tracking-widest leading-none">
                      Not memorised ({notMem.length})
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
                  <p className="text-xs text-muted font-mono uppercase tracking-widest leading-none">Session</p>
                  <button onClick={handleResetSession} title="Reset session" className="text-xs text-muted hover:text-cream transition-colors">↺</button>
                </div>
                <p className="text-xs">
                  <span className="text-gold-400">{sessionStats.correct}/{sessionStats.total}</span>
                  <span className="text-muted"> · {sessionStats.rounds} round{sessionStats.rounds !== 1 ? 's' : ''}</span>
                </p>
              </div>
            )}

          </div>
        )}

      </aside>

    </div>
  )
}
