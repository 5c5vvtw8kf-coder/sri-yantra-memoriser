import { useState } from 'react'
import data from '../data/khadgamala-canonical.json'

const { sections, deities } = data

// ── Helpers ────────────────────────────────────────────────────────────────

function groupDeities(sectionDeities) {
  const groups = []
  let current = null
  for (const deity of sectionDeities) {
    const g = deity.group ?? '__none'
    if (!current || current.key !== g) {
      current = { key: g, label: formatGroupLabel(g), deities: [] }
      groups.push(current)
    }
    current.deities.push(deity)
  }
  return groups
}

function formatGroupLabel(key) {
  if (!key || key === '__none') return null
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

function sectionTypeLabel(type) {
  if (type === 'circuit') return 'Circuit'
  if (type === 'preamble') return 'Preamble'
  if (type === 'closing') return 'Closing'
  return type
}

function sectionAccent(type) {
  if (type === 'circuit') return 'text-gold-400'
  if (type === 'closing') return 'text-gold-600'
  return 'text-muted'
}

const YOGINI_SECRECY = {
  'Prakata Yogini': 'Manifest',
  'Gupta Yogini': 'Hidden',
  'Guptatara Yogini': 'More Hidden',
  'Sampradaya Yogini': 'Transmitted',
  'Kulottirna Yogini': 'Beyond Kula',
  'Nigarbha Yogini': 'Concealed',
  'Rahasya Yogini': 'Secret',
  'Ati Rahasya Yogini': 'Most Secret',
  'Para Para Rahasya Yogini': 'Supreme Secret',
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NavItem({ id, label, circuitNumber, description, count, isSelected, onClick }) {
  return (
    <button
      className={`section-item iast ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(id)}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono w-5 text-right flex-shrink-0">
          {circuitNumber ?? ''}
        </span>
        <span className="font-medium">
          {label}
        </span>
      </div>
      {description && count != null && (
        <p className="text-xs text-muted mt-0.5 pl-7">
          {description} · {count} names
        </p>
      )}
    </button>
  )
}

function CircuitMeta({ section }) {
  if (section.type !== 'circuit') return null
  const secrecy = YOGINI_SECRECY[section.yoginiType]
  return (
    <div className="border border-surface-600 rounded-lg p-4 mb-4 bg-surface-800 space-y-1.5">
      {section.avarana && (
        <div className="meta-row">
          <span className="meta-label">Āvaraṇa</span>
          <span className="meta-value">{section.avaranaIast || section.avarana}</span>
        </div>
      )}
      {section.chakraSvamini && (
        <div className="meta-row">
          <span className="meta-label">Chakra Svāminī</span>
          <span className="meta-value text-sm">{section.chakraSvaminiIast || section.chakraSvamini}</span>
        </div>
      )}
      {section.yoginiType && (
        <div className="meta-row">
          <span className="meta-label">Yoginī type</span>
          <span className="meta-value text-sm">
            {section.yoginiType}
            {secrecy && <span className="text-muted text-xs ml-2">({secrecy})</span>}
          </span>
        </div>
      )}
      {section.chakreshvari && (
        <div className="meta-row">
          <span className="meta-label">Chakreshvarī</span>
          <span className="meta-value">{section.chakreshvariIast || section.chakreshvari}</span>
        </div>
      )}
      {section.geometry && (
        <div className="meta-row">
          <span className="meta-label">Geometry</span>
          <span className="text-sm text-muted">{section.description}</span>
        </div>
      )}
    </div>
  )
}

function DeityEntry({ deity, script = 'iast' }) {
  const primary = script === 'devanagari'
    ? (deity.scripts.devanagari || deity.scripts.iast)
    : script === 'english'
    ? (deity.scripts.english || deity.scripts.iast)
    : deity.scripts.iast
  const showIastAlt = script !== 'iast' && deity.scripts.iast
  const sub = deity.scripts.translation || (script !== 'english' && deity.scripts.english && deity.scripts.english !== deity.scripts.iast ? deity.scripts.english : null)
  return (
    <div className="mb-3">
      <div className="bg-surface-800 rounded-lg px-3 py-2 border border-surface-700">
        <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>{primary}</p>
        {script === 'devanagari' && showIastAlt && (
          <p className="iast text-gold-600 text-xs mt-0.5">{deity.scripts.iast}</p>
        )}
      </div>
      {sub && <p className="iast text-muted text-[15px] leading-relaxed pl-3 mt-1">{sub}</p>}
    </div>
  )
}

function SectionDetail({ section, script = 'iast' }) {
  const sectionDeities = deities
    .filter(d => d.sectionId === section.id)
    .sort((a, b) => a.sequenceInSection - b.sequenceInSection)
  const grouped = groupDeities(sectionDeities)
  const hasGroups = grouped.some(g => g.label !== null)
  return (
    <div>
      <div className="mb-4">
        <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">
          {section.labelIast || section.label}{section.description ? `, ${section.description}` : ''}
        </p>
      </div>

      {hasGroups ? (
        grouped.map(group => (
          <div key={group.key}>

            {group.deities.map(deity => (
              <DeityEntry key={deity.id} deity={deity} script={script} />
            ))}
          </div>
        ))
      ) : (
        sectionDeities.map(deity => (
          <DeityEntry key={deity.id} deity={deity} script={script} />
        ))
      )}
    </div>
  )
}

function SecrecyBar({ selectedSection }) {
  const circuitSections = sections.filter(s => s.type === 'circuit')
  if (!selectedSection || selectedSection.type !== 'circuit') return null
  const idx = circuitSections.findIndex(s => s.id === selectedSection.id)
  const total = circuitSections.length
  return (
    <div className="flex items-center gap-1 mb-4">
      {circuitSections.map((s, i) => (
        <div
          key={s.id}
          className="h-1 flex-1 rounded-full transition-all duration-200"
          style={{
            backgroundColor: i === idx ? '#c9a84c' : i < idx ? '#4a3420' : '#251810',
          }}
          title={s.label}
        />
      ))}
      <span className="text-xs text-muted ml-2 flex-shrink-0">{idx + 1}/{total}</span>
    </div>
  )
}

// ── NityaSection ───────────────────────────────────────────────────────────

const NITYA_DEITIES = [
  { iast: 'kāmēśvarī', dev: 'कामेश्वरी',      translation: 'Goddess of Desire' },
  { iast: 'bhagamālinī', dev: 'भगमालिनी',    translation: 'Garlanded with Splendour' },
  { iast: 'nityaklinnē', dev: 'नित्यक्लिन्ने',    translation: 'Ever Moist (with Mercy)' },
  { iast: 'bhēruṇḍē', dev: 'भेरुण्डे',      translation: 'The Terrible' },
  { iast: 'vahnivāsinī', dev: 'वह्निवासिनी',    translation: 'Dwelling in Fire' },
  { iast: 'mahāvajrēśvarī', dev: 'महावज्रेश्वरी', translation: 'Great Goddess of the Vajra' },
  { iast: 'śivadūtī', dev: 'शिवदूती',       translation: "Shiva's Messenger" },
  { iast: 'tvaritē', dev: 'त्वरिते',        translation: 'The Swift One' },
  { iast: 'kulasundarī', dev: 'कुलसुन्दरी',    translation: 'Beautiful One of the Kula' },
  { iast: 'nityē', dev: 'नित्ये',          translation: 'The Eternal' },
  { iast: 'nīlapatākē', dev: 'नीलपताके',     translation: 'Blue Banner' },
  { iast: 'vijayē', dev: 'विजये',         translation: 'The Victorious' },
  { iast: 'sarvamaṅgaḻē', dev: 'सर्वमङ्गले',   translation: 'All Auspicious' },
  { iast: 'jvālāmālinī', dev: 'ज्वालामालिनी',    translation: 'Garlanded with Flames' },
  { iast: 'chitrē', dev: 'चित्रे',         translation: 'The Variegated' },
]
const NITYA_LAST = { iast: 'mahānityē', dev: 'महानित्ये', translation: 'The Great Eternal' }

function NityaSection({ script = 'iast' }) {
  const [waxing, setWaxing] = useState(true)
  const ordered = waxing ? NITYA_DEITIES : [...NITYA_DEITIES].reverse()
  const all = [...ordered, NITYA_LAST]
  return (
    <div className="space-y-3">
      <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">tithinityādēvatāḥ, Lunar Goddesses of Time</p>
      <div className="flex gap-2">
        <button
          onClick={() => setWaxing(false)}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${!waxing ? 'text-gold-300 border-gold-700/50 bg-gold-900/20' : 'text-muted border-surface-600 hover:text-cream'}`}
        >
          ☾ Waning
        </button>
        <button
          onClick={() => setWaxing(true)}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${waxing ? 'text-gold-300 border-gold-700/50 bg-gold-900/20' : 'text-muted border-surface-600 hover:text-cream'}`}
        >
          ☽ Waxing
        </button>
      </div>
      {all.map((d, i) => (
        <div key={i}>
          <div className="bg-surface-800 rounded-lg px-3 py-2 border border-surface-700">
            <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>{script === 'devanagari' ? (d.dev || d.iast) : script === 'english' ? d.translation : d.iast}</p>
            {script === 'devanagari' && <p className="iast text-gold-600 text-xs mt-0.5">{d.iast}</p>}
          </div>
          <p className="iast text-muted text-[15px] leading-relaxed pl-3 mt-1">{d.translation}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

const INTRO_ITEMS = [
  { id: 'prarthana', label: 'Prārthana' },
  { id: 'dhyanam',   label: 'Dhyānam'   },
]

const ALL_NAV_IDS = [...INTRO_ITEMS.map(i => i.id), ...sections.map(s => s.id)]

export default function CircuitBrowser({ script = 'iast' }) {
  const [selectedId, setSelectedId] = useState('prarthana')
  const selectedSection = sections.find(s => s.id === selectedId)
  const currentIdx = ALL_NAV_IDS.indexOf(selectedId)
  const canPrev = currentIdx > 0
  const canNext = currentIdx < ALL_NAV_IDS.length - 1
  const navigate = (dir) => {
    const next = ALL_NAV_IDS[currentIdx + dir]
    if (next) setSelectedId(next)
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left panel: flat nav list ── */}
      <div className="w-64 flex-shrink-0 border-r border-surface-700 overflow-y-auto hidden md:block">
        {INTRO_ITEMS.map(item => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            isSelected={selectedId === item.id}
            onClick={setSelectedId}
          />
        ))}
        {sections.map(s => (
          <NavItem
            key={s.id}
            id={s.id}
            label={s.label}
            circuitNumber={s.type === 'circuit' ? s.circuitNumber : undefined}
            description={s.type === 'circuit' ? s.description : undefined}
            count={s.type === 'circuit' ? s.count : undefined}
            isSelected={selectedId === s.id}
            onClick={setSelectedId}
          />
        ))}
      </div>

      {/* ── Right panel: section detail ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 md:p-3 max-w-none">

          {/* Mobile: section picker */}
          <div className="md:hidden mb-4">
            <select
              className="w-full bg-surface-700 border border-surface-600 text-cream rounded-lg px-3 py-2 text-sm"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              {INTRO_ITEMS.map(i => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Prārthana */}
          {selectedId === 'prarthana' && (
            <div className="space-y-3">
              <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">Prārthana, Prayer</p>
              <div className="bg-surface-800 rounded-lg p-3 border border-surface-700">
                <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed whitespace-pre-line`}>{
script === 'devanagari'
                  ? `ह्रीङ्कारासनगर्भितानलशिखां सौः क्लीं कलां बिभ्रतीं
सौवर्णाम्बरधारिणीं वरसुधाधौतां त्रिनेत्रोज्ज्वलाम् ।
वन्दे पुस्तकपाशमङ्कुशधरां स्रग्भूषितामुज्ज्वलां
त्वां गौरीं त्रिपुरां परात्परकलां श्रीचक्रसञ्चारिणीम् ॥`
                  : `hrīṅkārāsanagarbhitānalaśikhāṃ sauḥ klīṃ kalāṃ bibhratīṃ
sauvarṇāmbaradhāriṇīṃ varasudhādhautāṃ triṇētrōjjvalām |
vandē pustakapāśamaṅkuśadharāṃ sragbhūṣitāmujjvalāṃ
tvāṃ gaurīṃ tripurāṃ parātparakalāṃ śrīcakrasañcāriṇīm ||`
                }</p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs leading-relaxed whitespace-pre-line mt-1">{`hrīṅkārāsanagarbhitānalaśikhāṃ sauḥ klīṃ kalāṃ bibhratīṃ
sauvarṇāmbaradhāriṇīṃ varasudhādhautāṃ triṇētrōjjvalām |
vandē pustakapāśamaṅkuśadharāṃ sragbhūṣitāmujjvalāṃ
tvāṃ gaurīṃ tripurāṃ parātparakalāṃ śrīcakrasañcāriṇīm ||`}</p>}
              </div>
              <p className="iast text-muted text-[15px] leading-relaxed pl-3">
                I worship You, Gaurī, Tripurā, the supreme transcendent art, who moves through the Śrīcakra, blazing on Hrīṃ's seat, bearing the flame and the digits of Sauḥ and Klīṃ; robed in gold; gleaming with nectar divine; resplendent with three eyes; holding the book, the noose, and the goad; adorned with garlands.
              </p>
              <div className="bg-surface-800 rounded-lg p-3 border border-surface-700">
                <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>
                  {script === 'devanagari'
                  ? 'अस्य श्री शुद्धशक्तिमालामहामन्त्रस्य, उपस्थेन्द्रियाधिष्ठायी वरुणादित्य ऋषयः देवी गायत्री छन्दः सात्विक ककारभट्टारकपीठस्थित कामेश्वराङ्कनिलया महाकामेश्वरी श्री ललिता भट्टारिका देवता, ऐं बीजं क्लीं शक्तिः सौः कीलकं मम खड्गसिद्ध्यर्थे सर्वाभीष्टसिद्ध्यर्थे जपे विनियोगः । मूलमन्त्रेण षडङ्गन्यासं कुर्यात् ॥'
                  : 'asya śrīśuddhaśaktimālāmahāmantrasya, upasthēndriyādhiṣṭhāyī varuṇāditya ṛṣiḥ, daivī gāyatrī chandaḥ, sāttvika kakārabhaṭṭārakapīṭhasthita kāmēśvarāṅkanilayā mahākāmēśvarī śrī lalitā bhaṭṭārikā dēvatā, aiṃ bījaṃ klīṃ śaktiḥ sauḥ kīlakaṃ mama khaḍgasiddhyarthē sarvābhīṣṭasiddhyarthē japē viniyōgaḥ | mūlamantrēṇa ṣaḍaṅganyāsaṃ kuryāt ||'}
                </p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs leading-relaxed mt-1">asya śrīśuddhaśaktimālāmahāmantrasya, upasthēndriyādhiṣṭhāyī varuṇāditya ṛṣiḥ, daivī gāyatrī chandaḥ, sāttvika kakārabhaṭṭārakapīṭhasthita kāmēśvarāṅkanilayā mahākāmēśvarī śrī lalitā bhaṭṭārikā dēvatā, aiṃ bījaṃ klīṃ śaktiḥ sauḥ kīlakaṃ mama khaḍgasiddhyarthē sarvābhīṣṭasiddhyarthē japē viniyōgaḥ | mūlamantrēṇa ṣaḍaṅganyāsaṃ kuryāt ||</p>}
              </div>
              <p className="iast text-muted text-[15px] leading-relaxed pl-3">
                Of this Śrī Śuddha Śakti Mālā Mahāmantra: Varuṇāditya, presiding over the organ of generation, is the seer (ṛṣi); the divine Gāyatrī is the metre (chandas); the sattvic Mahākāmēśvarī, Śrī Lalitā Bhaṭṭārikā, who abides on the lap of Kāmēśvara enthroned at the Kakāra shrine, is the presiding deity (dēvatā); Aiṃ is the seed (bīja); Klīṃ is the power (śakti); Sauḥ is the pin (kīlaka). For the purpose of japa, for attaining Khaḍga-siddhi and the fulfilment of all desires, the application (viniyōga) is declared. The six-limbed nyāsa is to be performed with the root mantra.
              </p>
            </div>
          )}

          {/* Dhyānam */}
          {selectedId === 'dhyanam' && (
            <div className="space-y-3">
              <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">Dhyānam, Meditation</p>
              <div className="bg-surface-800 rounded-lg p-3 border border-surface-700">
                <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>
                  {script === 'devanagari'
                  ? 'तादृशं खड्गमाप्नोति येन हस्तस्थितेनवै । अष्टादश महाद्वीप सम्राट् भोक्ता भविष्यति ॥'
                  : 'tādṛśaṃ khaḍgamāpnoti yēna hastasthitēna vai | aṣṭādaśa mahādvīpa samrāḍ bhoktā bhaviṣyati ||'}
                </p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs leading-relaxed mt-1">tādṛśaṃ khaḍgamāpnoti yēna hastasthitēna vai | aṣṭādaśa mahādvīpa samrāḍ bhoktā bhaviṣyati ||</p>}
              </div>
              <p className="iast text-muted text-[15px] leading-relaxed pl-3">
                One who obtains such a sword as this, bearing it in hand, shall become the sovereign enjoyer of all eighteen great island-continents.
              </p>
              <div className="bg-surface-800 rounded-lg px-2 py-2 border border-surface-700">
                <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed whitespace-pre-line`}>{
script === 'devanagari'
                  ? `आरक्ताभां त्रिणेत्रामरुणिमवसनां रत्नताटङ्करम्यां
हस्ताम्भोजैस्सपाशाङ्कुश मदन धनुस्सायकैर्विस्फुरन्तीम् ।
आपीनोत्तुङ्ग वक्षोरुह कलशलुठत्तार हारोज्ज्वलाङ्गीं
ध्यायेदम्भोरुहस्थामरुणिमवसनामीश्वरीमीश्वराणाम् ॥`
                  : `āraktābhāṃ triṇetrāmaruṇimavasanāṃ ratnatāṭaṅkaramyāṃ |
hastāmbhōjaissapāśāṅkuśamadanadhanussāyakairvisphurantīm |
āpīnōttuṅgavakṣōruhakalaśaluṭhattārahārōjjvalāṅgīṃ |
dhyāyēdambhōruhasthāmaruṇimavasanāmīśvarīmīśvarāṇām ||`
                }</p>
              </div>
              <p className="iast text-muted text-[15px] leading-relaxed pl-3">
                Meditate on the Goddess of goddesses, red as the rising sun, three-eyed, beautiful with jewelled earrings; her lotus hands bearing the noose, the goad, and Kāmadeva's bow and arrows; her body radiant, a garland of gems hanging over her full, high breasts; clad in red.
              </p>
              <div className="bg-surface-800 rounded-lg p-3 border border-surface-700">
                <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed whitespace-pre-line`}>{
script === 'devanagari'
                  ? `लमित्यादिपञ्च पूजां कुर्यात्, यथाशक्ति मूलमन्त्रं जपेत् ।
लं - पृथिवीतत्त्वात्मिकायै श्री ललितात्रिपुरसुन्दरी पराभट्टारिकायै गन्धं परिकल्पयामि - नमः
हं - आकाशतत्त्वात्मिकायै श्री ललितात्रिपुरसुन्दरी पराभट्टारिकायै पुष्पं परिकल्पयामि - नमः
यं - वायुतत्त्वात्मिकायै श्री ललितात्रिपुरसुन्दरी पराभट्टारिकायै धूपं परिकल्पयामि - नमः
रं - तेजस्तत्त्वात्मिकायै श्री ललितात्रिपुरसुन्दरी पराभट्टारिकायै दीपं परिकल्पयामि - नमः
वं - अमृततत्त्वात्मिकायै श्री ललितात्रिपुरसुन्दरी पराभट्टारिकायै अमृतनैवेद्यं परिकल्पयामि - नमः
सं - सर्वतत्त्वात्मिकायै श्री ललितात्रिपुरसुन्दरी पराभट्टारिकायै ताम्बूलादिसर्वोपचारान् परिकल्पयामि - नमः`
                  : `laṃ ityādi pañca pūjāṃ kuryāt, yathāśakti mūlamantraṃ japēt |
laṃ pṛthivītattvātmikāyai śrīlalitātripurasundarī parābhaṭṭārikāyai gandhaṃ parikalpayāmi namaḥ
haṃ ākāśatattvātmikāyai śrīlalitātripurasundarī parābhaṭṭārikāyai puṣpaṃ parikalpayāmi namaḥ
yaṃ vāyutattvātmikāyai śrīlalitātripurasundarī parābhaṭṭārikāyai dhūpaṃ parikalpayāmi namaḥ
raṃ tējastattvātmikāyai śrīlalitātripurasundarī parābhaṭṭārikāyai dīpaṃ parikalpayāmi namaḥ
vaṃ amṛtatattvātmikāyai śrīlalitātripurasundarī parābhaṭṭārikāyai amṛtanaivēdyaṃ parikalpayāmi namaḥ
saṃ sarvatattvātmikāyai śrīlalitātripurasundarī parābhaṭṭārikāyai tāmbūlādisarvōpacārān parikalpayāmi namaḥ`
                }</p>
              </div>
              <p className="iast text-muted text-[15px] leading-relaxed pl-3">
                Perform the sixfold worship beginning with Laṃ; chant the root mantra as many times as possible.
                Laṃ — to Śrī Lalitā Tripurasundarī Parābhaṭṭārikā, embodiment of the earth element, I offer fragrance — salutations.
                Haṃ — embodiment of the ether element, I offer flowers — salutations.
                Yaṃ — embodiment of the wind element, I offer incense — salutations.
                Raṃ — embodiment of the fire element, I offer light — salutations.
                Vaṃ — embodiment of the nectar element, I offer nectar as food — salutations.
                Saṃ — embodiment of all elements, I offer all ritual services beginning with betel — salutations.
              </p>
            </div>
          )}

          {/* Tithi Nitya Devatās — custom render */}
          {selectedId === 'nitya' && <NityaSection script={script} />}

          {/* Divyaugha Gurus — custom render */}
          {selectedId === 'guru-divya' && (() => {
            const deities = [
              { iast: 'paramēśvara-paramēśvarī', dev: 'परमेश्वर-परमेश्वरी', english: 'Parameshvara-Parameshvari', translation: 'The Divine God and Divine Goddess' },
              { iast: 'mitrēśamayī', dev: 'मित्रेशमयी',             english: 'Mitreshamayi' },
              { iast: 'ṣaṣṭhīśamayī', dev: 'षष्ठीशमयी',           english: 'Shashtishamayi' },
              { iast: 'uddīśamayī', dev: 'उद्दीशमयी',              english: 'Uddiishamayi' },
              { iast: 'charyānāthamayī', dev: 'चर्यानाथमयी',         english: 'Charyanathamayi' },
              { iast: 'lōpāmudramayī', dev: 'लोपामुद्रमयी',           english: 'Lopamudramayi' },
              { iast: 'agastyamayī', dev: 'अगस्त्यमयी',             english: 'Agastyamayi' },
            ]
            return (
              <div className="space-y-3">
                <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">divyaughaguravaḥ, Divine Gurus</p>
                {deities.map((d, i) => (
                  <div key={i}>
                    <div className="bg-surface-800 rounded-lg px-3 py-2 border border-surface-700">
                      <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>{script === 'devanagari' ? (d.dev || d.iast) : script === 'english' ? (d.translation || d.english || d.iast) : d.iast}</p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs mt-0.5">{d.iast}</p>}
                    </div>
                    <p className="iast text-muted text-[15px] leading-relaxed pl-3 mt-1">{d.translation || d.english}</p>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Siddyaugha Gurus — custom render */}
          {selectedId === 'guru-siddha' && (() => {
            const deities = [
              { iast: 'kālatāpanamayī', dev: 'कालतापनमयी',      english: 'Kaalataapanamayi' },
              { iast: 'dharmāchāryamayī', dev: 'धर्माचार्यमयी',    english: 'Dharmacharamayi' },
              { iast: 'muktakēśīśvaramayī', dev: 'मुक्तकेशीश्वरमयी',  english: 'Muktakeshishvaramayi' },
              { iast: 'dīpakalānāthamayī', dev: 'दीपकलानाथमयी',   english: 'Dipakalanatamayi' },
            ]
            return (
              <div className="space-y-3">
                <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">siddhaughaguravaḥ, Siddha Gurus</p>
                {deities.map((d, i) => (
                  <div key={i}>
                    <div className="bg-surface-800 rounded-lg px-3 py-2 border border-surface-700">
                      <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>{script === 'devanagari' ? (d.dev || d.iast) : script === 'english' ? (d.translation || d.english || d.iast) : d.iast}</p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs mt-0.5">{d.iast}</p>}
                    </div>
                    <p className="iast text-muted text-[15px] leading-relaxed pl-3 mt-1">{d.english}</p>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Maanavaugha Gurus — custom render */}
          {selectedId === 'guru-manava' && (() => {
            const deities = [
              { iast: 'viṣṇudēvamayī', dev: 'विष्णुदेवमयी',         english: 'Vishnu Devamayi' },
              { iast: 'prabhākaradēvamayī', dev: 'प्रभाकरदेवमयी',     english: 'Prabhakara Devamayi' },
              { iast: 'tējōdēvamayī', dev: 'तेजोदेवमयी',           english: 'Tejo Devamayi' },
              { iast: 'manōjadēvamayī', dev: 'मनोजदेवमयी',         english: 'Manoja Devamayi' },
              { iast: 'kaḻyāṇadēvamayī', dev: 'कल्याणदेवमयी',        english: 'Kalyana Devamayi' },
              { iast: 'vāsudēvamayī', dev: 'वासुदेवमयी',           english: 'Vasudeva Devamayi' },
              { iast: 'ratnadēvamayī', dev: 'रत्नदेवमयी',          english: 'Ratna Devamayi' },
              { iast: 'śrīrāmānandamayī', dev: 'श्रीरामानन्दमयी',       english: 'Shri Ramananda Mayi' },
            ]
            return (
              <div className="space-y-3">
                <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">mānavaughaguravaḥ, Human Gurus</p>
                {deities.map((d, i) => (
                  <div key={i}>
                    <div className="bg-surface-800 rounded-lg px-3 py-2 border border-surface-700">
                      <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>{script === 'devanagari' ? (d.dev || d.iast) : script === 'english' ? (d.translation || d.english || d.iast) : d.iast}</p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs mt-0.5">{d.iast}</p>}
                    </div>
                    <p className="iast text-muted text-[15px] leading-relaxed pl-3 mt-1">{d.english}</p>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Nyāsa Devatās — custom render */}
          {selectedId === 'nyasa' && (() => {
            const nyasaDeities = [
              { iast: 'hṛdayadēvī', dev: 'हृदयदेवी',   translation: 'Heart Goddess',  note: 'Nyāsa of the heart' },
              { iast: 'śirōdēvī', dev: 'शिरोदेवी',     translation: 'Head Goddess',   note: 'Nyāsa of the head' },
              { iast: 'śikhādēvī', dev: 'शिखादेवी',    translation: 'Crown Goddess',  note: 'Nyāsa of the crown' },
              { iast: 'kavachadēvī', dev: 'कवचदेवी',  translation: 'Armour Goddess', note: 'Nyāsa of the armour' },
              { iast: 'nētradēvī', dev: 'नेत्रदेवी',    translation: 'Eye Goddess',    note: 'Nyāsa of the eyes' },
              { iast: 'astradēvī', dev: 'अस्त्रदेवी',    translation: 'Weapon Goddess', note: 'Nyāsa of the weapon' },
            ]
            return (
              <div className="space-y-3">
                <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">Nyāsāṅgadēvatāḥ, Limb Deities</p>
                {nyasaDeities.map((d, i) => (
                  <div key={i}>
                    <div className="bg-surface-800 rounded-lg px-3 py-2 border border-surface-700">
                      <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>{script === 'devanagari' ? (d.dev || d.iast) : script === 'english' ? (d.translation || d.english || d.iast) : d.iast}</p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs mt-0.5">{d.iast}</p>}
                    </div>
                    <p className="iast text-muted text-[15px] leading-relaxed pl-3 mt-1">{d.translation} · {d.note}</p>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Devī Sambodhanam — custom render */}
          {selectedId === 'invocation' && (
            <div className="space-y-3">
              <p className="text-[12px] font-mono text-muted uppercase tracking-[0.12em]">Devī Sambodhanam, Goddess Address</p>
              <div className="bg-surface-800 rounded-lg p-3 border border-surface-700">
                <p className={`${script !== 'devanagari' ? 'iast' : ''} text-gold-400 text-sm leading-relaxed`}>
                  {script === 'devanagari' ? 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः ॐ नमस्त्रिपुरसुन्दरी' : script === 'english' ? 'Om Aim Hrim Shrim Aim Klim Sauh Om Namas Tripura Sundari' : 'ōṃ aiṃ hrīṃ śrīṃ aiṃ klīṃ sauḥ ōṃ namastripurasundarī'}
                </p>
                {script === 'devanagari' && <p className="iast text-gold-600 text-xs mt-0.5">ōṃ aiṃ hrīṃ śrīṃ aiṃ klīṃ sauḥ ōṃ namastripurasundarī</p>}
              </div>
              <p className="iast text-muted text-[15px] leading-relaxed pl-3">
                Om. Aim Hrīm Śrīm Aim Klīm Sauḥ Om — salutations to Tripura Sundarī.
              </p>
            </div>
          )}

          {/* Depth indicator for circuits */}
          <SecrecyBar selectedSection={selectedSection} />

          {/* Section content */}
          {selectedSection && !['invocation','nyasa','nitya','guru-divya','guru-siddha','guru-manava'].includes(selectedId) && <SectionDetail section={selectedSection} script={script} />}

          {/* Prev / Next navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-surface-700">
            <button
              onClick={() => navigate(-1)}
              disabled={!canPrev}
              className="px-4 py-2 text-sm text-muted hover:text-cream disabled:opacity-30 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => navigate(1)}
              disabled={!canNext}
              className="px-4 py-2 text-sm text-muted hover:text-cream disabled:opacity-30 transition-colors"
            >
              →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
