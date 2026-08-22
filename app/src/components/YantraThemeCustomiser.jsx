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
  { key: '__accent',   trKey: 'yantra.row_accent' },
  { key: '__bg',       trKey: 'yantra.row_bg' },
  { key: 'c1Outer',    trKey: 'yantra.row_c1outer' },
  { key: 'c1Mid',      trKey: 'yantra.row_c1mid' },
  { key: 'c1Inner',    trKey: 'yantra.row_c1inner' },
  { key: 'outerRings', trKey: 'yantra.row_outerrings' },
  { key: 'c2Petals',   trKey: 'yantra.row_c2petals' },
  { key: 'c2Ring',     trKey: 'yantra.row_c2ring' },
  { key: 'c3Petals',   trKey: 'yantra.row_c3petals' },
  { key: 'c3Ring',     trKey: 'yantra.row_c3ring' },
  { key: 'innerCircle', trKey: 'yantra.row_innercircle' },
  { key: 'c4',         trKey: 'yantra.row_c4' },
  { key: 'c5',         trKey: 'yantra.row_c5' },
  { key: 'c6',         trKey: 'yantra.row_c6' },
  { key: 'c7',         trKey: 'yantra.row_c7' },
  { key: 'c8',         trKey: 'yantra.row_c8' },
  { key: 'c9',         trKey: 'yantra.row_c9' },
]

export default function YantraThemeCustomiser({
  palette, accentColor, bgColor,
  onPaletteChange, onAccentChange, onBgChange,
  onReset, onClose,
  onUndo, canUndo = false,
  slotLabel = 'Custom',   // which of the 3 saved slots this is editing — e.g. "Custom 2"
  variant = 'panel',   // 'panel' — inside the desktop right-hand aside (no card chrome, aside supplies it)
                       // 'inline' — mobile fallback rendered below the diagram (self-contained card)
  tr = k => k,
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
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[13px] text-gold-400 font-medium">{tr('yantra.customiser_heading')} — {slotLabel}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="text-[10px] text-muted hover:text-cream disabled:opacity-30 disabled:hover:text-muted transition-colors"
          >
            {tr('yantra.customiser_undo')}
          </button>
          <button onClick={onReset} className="text-[10px] text-muted hover:text-cream transition-colors">
            {tr('yantra.customiser_reset')}
          </button>
          {variant === 'inline' && (
            <button onClick={onClose} className="text-[10px] text-muted hover:text-cream transition-colors">
              {tr('yantra.customiser_close')}
            </button>
          )}
        </div>
      </div>
      <p className="text-[9px] text-muted mb-1 leading-tight">
        {tr('yantra.customiser_sync_note')}
      </p>
      <div className="divide-y divide-surface-800/60">
        {ROWS.map(({ key, trKey }) => (
          <ColorSwatchInput
            key={key}
            label={tr(trKey)}
            value={valueFor(key)}
            onChange={hex => handleChange(key, hex)}
            tr={tr}
          />
        ))}
      </div>
    </div>
  )
}
