import { useState } from 'react'
import data from '../data/khadgamala-canonical.json'

const { sections, deities } = data

// ── Helpers ────────────────────────────────────────────────────────────────

/** Group deities by their `group` field, preserving chant order. */
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
  // Convert camelCase → readable label
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

function SectionListItem({ section, isSelected, onClick }) {
  const isCircuit = section.type === 'circuit'
  return (
    <button
      className={`section-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(section.id)}
    >
      <div className="flex items-center gap-2">
        {isCircuit && (
          <span className="text-xs font-mono text-gold-700 w-5 text-right flex-shrink-0">
            {section.circuitNumber}
          </span>
        )}
        {!isCircuit && <span className="w-5 flex-shrink-0" />}
        <span className={`${sectionAccent(section.type)} font-medium`}>
          {section.label}
        </span>
      </div>
      {isCircuit && (
        <p className="text-xs text-muted mt-0.5 pl-7">
          {section.description} · {section.count} names
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
            {secrecy && (
              <span className="text-muted text-xs ml-2">({secrecy})</span>
            )}
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

  const showIastAlt  = script !== 'iast' && deity.scripts.iast
  const showEngAlt   = script !== 'english' && deity.scripts.english && deity.scripts.english !== deity.scripts.iast

  return (
    <div className="deity-row">
      <span className="seq-num">{deity.sequenceInSection}</span>
      <div className="flex-1 min-w-0">
        <div className={script !== 'english' ? 'deity-iast' : 'text-sm text-cream'}>
          {primary}
        </div>
        {script === 'devanagari' && showIastAlt && (
          <div className="deity-iast text-xs text-muted mt-0.5">{deity.scripts.iast}</div>
        )}
        {deity.scripts.translation && (
          <div className="text-xs text-muted mt-0.5">{deity.scripts.translation}</div>
        )}
        {deity.note && (
          <div className="text-xs text-surface-500 mt-0.5 italic">{deity.note}</div>
        )}
      </div>
      {showEngAlt && script !== 'english' && (
        <span className="deity-english hidden sm:block">{deity.scripts.english}</span>
      )}
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
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold text-cream">{section.label}</h2>
          <span className="text-xs text-muted">{sectionDeities.length} names</span>
        </div>
        <p className="text-xs text-muted mt-0.5">{sectionTypeLabel(section.type)}</p>
      </div>

      {/* Circuit metadata */}
      <CircuitMeta section={section} />

      {/* Deity list */}
      {hasGroups ? (
        grouped.map(group => (
          <div key={group.key}>
            {group.label && (
              <div className="group-label">{group.label}</div>
            )}
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

// ── SecrecyBar ──────────────────────────────────────────────────────────────
// Visual indicator of how deep into the yantra we are.

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
            backgroundColor: i === idx
              ? '#c9a84c'
              : i < idx
              ? '#4a3420'
              : '#251810',
          }}
          title={s.label}
        />
      ))}
      <span className="text-xs text-muted ml-2 flex-shrink-0">
        {idx + 1}/{total}
      </span>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function CircuitBrowser({ script = 'iast' }) {
  const [selectedId, setSelectedId] = useState('circuit-1')

  const selectedSection = sections.find(s => s.id === selectedId)

  // Navigate between sections
  const sectionIds = sections.map(s => s.id)
  const currentIdx = sectionIds.indexOf(selectedId)
  const canPrev = currentIdx > 0
  const canNext = currentIdx < sectionIds.length - 1

  const navigate = (dir) => {
    const next = sectionIds[currentIdx + dir]
    if (next) setSelectedId(next)
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left panel: section list ── */}
      <div className="w-64 flex-shrink-0 border-r border-surface-700 overflow-y-auto hidden md:block">
        <div className="p-3 text-xs font-medium uppercase tracking-widest text-muted border-b border-surface-700">
          Preamble
        </div>
        {sections.filter(s => s.type === 'preamble').map(s => (
          <SectionListItem
            key={s.id}
            section={s}
            isSelected={selectedId === s.id}
            onClick={setSelectedId}
          />
        ))}

        <div className="p-3 text-xs font-medium uppercase tracking-widest text-muted border-b border-surface-700 mt-2">
          Nine Circuits
        </div>
        {sections.filter(s => s.type === 'circuit').map(s => (
          <SectionListItem
            key={s.id}
            section={s}
            isSelected={selectedId === s.id}
            onClick={setSelectedId}
          />
        ))}

        <div className="p-3 text-xs font-medium uppercase tracking-widest text-muted border-b border-surface-700 mt-2">
          Closing
        </div>
        {sections.filter(s => s.type === 'closing').map(s => (
          <SectionListItem
            key={s.id}
            section={s}
            isSelected={selectedId === s.id}
            onClick={setSelectedId}
          />
        ))}
      </div>

      {/* ── Right panel: section detail ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-2xl mx-auto">

          {/* Mobile: section picker */}
          <div className="md:hidden mb-4">
            <select
              className="w-full bg-surface-700 border border-surface-600 text-cream rounded-lg px-3 py-2 text-sm"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              <optgroup label="Preamble">
                {sections.filter(s => s.type === 'preamble').map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </optgroup>
              <optgroup label="Nine Circuits">
                {sections.filter(s => s.type === 'circuit').map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </optgroup>
              <optgroup label="Closing">
                {sections.filter(s => s.type === 'closing').map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Depth indicator for circuits */}
          <SecrecyBar selectedSection={selectedSection} />

          {/* Section content */}
          {selectedSection && <SectionDetail section={selectedSection} script={script} />}

          {/* Prev / Next navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-surface-700">
            <button
              onClick={() => navigate(-1)}
              disabled={!canPrev}
              className="px-4 py-2 text-sm text-muted hover:text-cream disabled:opacity-30 transition-colors"
            >
              ← {canPrev ? sections[currentIdx - 1]?.label : ''}
            </button>
            <button
              onClick={() => navigate(1)}
              disabled={!canNext}
              className="px-4 py-2 text-sm text-muted hover:text-cream disabled:opacity-30 transition-colors"
            >
              {canNext ? sections[currentIdx + 1]?.label : ''} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
