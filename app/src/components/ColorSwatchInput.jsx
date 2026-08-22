import { useState, useRef, useEffect } from 'react'

/**
 * ColorSwatchInput.jsx
 *
 * A single labelled colour control: a swatch button that opens a small
 * popover offering three ways to pick a colour, same spirit as the
 * "More Colors" dialog in Office/Windows apps —
 *   1. The browser's native <input type="color"> (on desktop this opens the
 *      OS colour picker, which already has RGB/hex fields built in — no
 *      need to hand-roll a hue/saturation canvas for that).
 *   2. A hex text field, for typing an exact value.
 *   3. Three R/G/B number fields (0–255), for people who think in RGB.
 *   4. A small curated preset swatch grid for one-click picks.
 *
 * Values are always solid hex (#rrggbb) — no alpha channel. Kept simple
 * because that's what was asked for; the built-in theme presets still use
 * rgba internally, this control just isn't one of them.
 */

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function rgbToHex(r, g, b) {
  const c = n => Math.max(0, Math.min(255, Math.round(Number(n) || 0))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

const PRESET_SWATCHES = [
  '#c9a84c', '#ffeb3c', '#50c850', '#d7dce4', '#ffffff',
  '#eb2d2d', '#7ea6d8', '#b4a0e6', '#5a6ebe', '#28327a',
  '#e8a35c', '#f0b43c', '#d66e32', '#be2828', '#961e0a',
  '#7fbf8f', '#b4c850', '#3c8c5a', '#146e50', '#0a1e14',
  '#d9d9d9', '#8c8c8c', '#464646', '#1e1e1e', '#000000',
]

export default function ColorSwatchInput({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    const onEsc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const rgb = hexToRgb(value)
  const setRgbChannel = (channel, raw) => {
    const n = Math.max(0, Math.min(255, parseInt(raw, 10) || 0))
    const next = { ...rgb, [channel]: n }
    onChange(rgbToHex(next.r, next.g, next.b))
  }
  const handleHexInput = raw => {
    let v = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
  }

  return (
    <div ref={wrapRef} className="relative flex items-center justify-between gap-2 py-1">
      <span className="text-xs text-muted iast">{label}</span>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-6 h-6 rounded border border-surface-600 flex-shrink-0 shadow-inner hover:border-gold-500 transition-colors"
        style={{ background: value }}
        title={value}
      />
      {open && (
        <div className="absolute right-0 top-8 z-50 w-56 bg-surface-800 border border-surface-600 rounded-lg shadow-xl p-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-9 h-9 rounded border border-surface-600 bg-transparent cursor-pointer"
              title="Open system colour picker"
            />
            <input
              type="text"
              value={value}
              onChange={e => handleHexInput(e.target.value)}
              className="flex-1 min-w-0 text-xs font-mono bg-surface-900 border border-surface-700 rounded px-2 py-1.5 text-cream focus:outline-none focus:border-gold-700"
              maxLength={7}
              spellCheck={false}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {['r', 'g', 'b'].map(ch => (
              <label key={ch} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-[9px] uppercase text-muted">{ch}</span>
                <input
                  type="number" min={0} max={255} value={rgb[ch]}
                  onChange={e => setRgbChannel(ch, e.target.value)}
                  className="w-full text-xs font-mono bg-surface-900 border border-surface-700 rounded px-1 py-1 text-cream text-center focus:outline-none focus:border-gold-700"
                />
              </label>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_SWATCHES.map(sw => (
              <button
                key={sw}
                onClick={() => { onChange(sw); setOpen(false) }}
                className="w-full aspect-square rounded border border-surface-600 hover:border-gold-500 transition-colors"
                style={{ background: sw }}
                title={sw}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
