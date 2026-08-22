import ColorSwatchInput from './ColorSwatchInput'

/**
 * YantraThemeCustomiser.jsx
 *
 * Full colour customiser for the Śrī Yantra page's "Custom" theme slot.
 * One row per named component of the diagram, in the order Chris gave them,
 * plus two rows he didn't list but which are already theme-level parameters
 * on every built-in preset — Line colour (accentColor) and Background
 * (bgColor) — left out of the customiser would mean "customise everything
 * except the two things that most change the mood of the whole image."
 *
 * Row keys map to the compact palette shape buildFills() expects (see
 * App.jsx's YANTRA_THEMES) — '__accent' / '__bg' are handled specially
 * since they live outside the palette object.
 */

const ROWS = [
  { key: '__accent',   label: 'Line colour' },
  { key: '__bg',       label: 'Background' },
  { key: 'c1Outer',    label: 'Outer bhupura' },
  { key: 'c1Mid',      label: 'Inner bhupura' },
  { key: 'c1Inner',    label: 'Bhupura void / space' },
  { key: 'outerRings', label: 'Valayam circles' },
  { key: 'c2Petals',   label: 'Ṣoḍaśadalapadma (16-petal lotus)' },
  { key: 'c2Ring',     label: 'Outer ṣoḍaśadalapadma' },
  { key: 'c3Petals',   label: 'Aṣṭadalapadma (8-petal lotus)' },
  { key: 'c3Ring',     label: 'Outer aṣṭadalapadma' },
  { key: 'innerCircle', label: 'Triangles background' },
  { key: 'c4',         label: 'Caturdaśa (14 triangles)' },
  { key: 'c5',         label: 'Bahirdaśa (10 outer triangles)' },
  { key: 'c6',         label: 'Antaradaśa (10 inner triangles)' },
  { key: 'c7',         label: 'Aṣṭakoṇa (8 triangles)' },
  { key: 'c8',         label: 'Trikoṇa (primary triangle)' },
  { key: 'c9',         label: 'Bindu' },
]

export default function YantraThemeCustomiser({
  palette, accentColor, bgColor,
  onPaletteChange, onAccentChange, onBgChange,
  onReset, onClose,
  variant = 'panel',   // 'panel' — inside the desktop right-hand aside (no card chrome, aside supplies it)
                       // 'inline' — mobile fallback rendered below the diagram (self-contained card)
}) {
  const valueFor = key => {
    if (key === '__accent') return accentColor
    if (key === '__bg')     return bgColor
    return palette[key]
  }
  const handleChange = (key, hex) => {
    if (key === '__accent') { onAccentChange(hex); return }
    if (key === '__bg')     { onBgChange(hex); return }
    onPaletteChange({ ...palette, [key]: hex })
  }

  const outerClass = variant === 'inline'
    ? 'w-full max-w-md mx-auto mt-3 bg-surface-900 border border-surface-700 rounded-xl p-4'
    : 'w-full p-4'

  return (
    <div className={outerClass}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-gold-400 font-medium">Customise colours</h3>
        <div className="flex items-center gap-3">
          <button onClick={onReset} className="text-[11px] text-muted hover:text-cream transition-colors">
            Reset
          </button>
          {variant === 'inline' && (
            <button onClick={onClose} className="text-[11px] text-muted hover:text-cream transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
      <p className="text-[11px] text-muted mb-2">
        Changes apply live. Saved on this device only — not part of Device Sync.
      </p>
      <div className="divide-y divide-surface-800 max-h-[70vh] overflow-y-auto pr-1">
        {ROWS.map(({ key, label }) => (
          <ColorSwatchInput
            key={key}
            label={label}
            value={valueFor(key)}
            onChange={hex => handleChange(key, hex)}
          />
        ))}
      </div>
    </div>
  )
}
