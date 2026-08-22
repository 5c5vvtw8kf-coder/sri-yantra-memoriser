import { useState, useRef, useEffect } from 'react'

/**
 * ColorSwatchInput.jsx
 *
 * A single labelled colour control: a swatch button that opens a popover
 * modelled on the Windows/Office "Colors" dialog — a Standard tab (colour
 * wheel + greyscale strip, click-to-pick) and a Custom tab (saturation/value
 * square + hue bar + RGB/hex fields), both with a New-vs-Current comparison
 * swatch like the original dialog's OK/Cancel preview.
 *
 * There's no OK/Cancel here — every change applies live, consistent with the
 * rest of this app's "changes apply live" custom-theme editor. "Current"
 * shows what the colour was when this popover was opened, purely so you can
 * compare before/after; committing is implicit (and Undo, at the panel
 * level, covers changing your mind).
 *
 * Values are always solid hex (#rrggbb) — no alpha channel, matching what
 * was asked for (RGB or hex).
 */

// ── Hex / RGB / HSV conversions ─────────────────────────────────────────────

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function rgbToHex(r, g, b) {
  const c = n => Math.max(0, Math.min(255, Math.round(Number(n) || 0))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r)      h = 60 * (((g - b) / d) % 6)
    else if (max === g) h = 60 * ((b - r) / d + 2)
    else                 h = 60 * ((r - g) / d + 4)
  }
  if (h < 0) h += 360
  const s = max === 0 ? 0 : d / max
  const v = max
  return [h, s, v]
}

function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0, g = 0, b = 0
  if      (h < 60)  [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else               [r, g, b] = [c, 0, x]
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}

function hexToHsv(hex) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHsv(r, g, b)
}

function hsvToHex(h, s, v) {
  const { r, g, b } = hsvToRgb(h, s, v)
  return rgbToHex(r, g, b)
}

// ── Greyscale strip (Standard tab) ──────────────────────────────────────────

const GREY_STEPS = Array.from({ length: 10 }, (_, i) => {
  const v = Math.round(255 * (1 - i / 9))
  return rgbToHex(v, v, v)
})

// ── Drag helper — mouse + touch, attaches/detaches window listeners ────────

function startDrag(onMove) {
  return e => {
    e.preventDefault()
    const point0 = e.touches ? e.touches[0] : e
    onMove(point0.clientX, point0.clientY)
    const move = ev => {
      const p = ev.touches ? ev.touches[0] : ev
      onMove(p.clientX, p.clientY)
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', up)
  }
}

export default function ColorSwatchInput({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('standard')   // 'standard' | 'custom'
  const wrapRef = useRef(null)
  const squareRef = useRef(null)
  const hueRef = useRef(null)
  const wheelRef = useRef(null)
  const openedValueRef = useRef(value)
  const lastEmitted = useRef(value)

  const [h, setH] = useState(0)
  const [s, setS] = useState(0)
  const [v, setV] = useState(0)

  // Sync internal h/s/v from the value prop — but skip it when the incoming
  // value is one we just emitted ourselves, so dragging near s=0 or v=0
  // (where hue is mathematically undefined) doesn't make the hue pointer
  // jump to red on every render.
  useEffect(() => {
    if (value === lastEmitted.current) return
    const [nh, ns, nv] = hexToHsv(value)
    setH(nh); setS(ns); setV(nv)
  }, [value])

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

  const handleToggleOpen = () => {
    setOpen(o => {
      const next = !o
      if (next) openedValueRef.current = value
      return next
    })
  }

  const commit = (nh, ns, nv) => {
    setH(nh); setS(ns); setV(nv)
    const hex = hsvToHex(nh, ns, nv)
    lastEmitted.current = hex
    onChange(hex)
  }
  const commitHex = hex => {
    const [nh, ns, nv] = hexToHsv(hex)
    commit(nh, ns, nv)
  }

  const rgb = hexToRgb(value)
  const setRgbChannel = (channel, raw) => {
    const n = Math.max(0, Math.min(255, parseInt(raw, 10) || 0))
    const next = { ...rgb, [channel]: n }
    commitHex(rgbToHex(next.r, next.g, next.b))
  }
  const handleHexInput = raw => {
    let hex = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9a-fA-F]{0,6}$/.test(hex)) commitHex(hex)
  }

  const updateFromSquare = (clientX, clientY) => {
    if (!squareRef.current) return
    const rect = squareRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    commit(h, x, 1 - y)
  }
  const updateFromHue = clientX => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    commit(x * 360, s, v)
  }
  const updateFromWheel = (clientX, clientY) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const radius = rect.width / 2
    const dx = clientX - cx, dy = clientY - cy
    const dist = Math.min(radius, Math.sqrt(dx * dx + dy * dy))
    let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI
    const nh = ((angleDeg) + 360) % 360
    const ns = dist / radius
    commit(nh, ns, 1)
  }

  const squareStyle = {
    backgroundColor: `hsl(${h}, 100%, 50%)`,
    backgroundImage: 'linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0))',
  }
  const hueStyle = {
    backgroundImage: 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
  }
  const wheelStyle = {
    backgroundImage: 'radial-gradient(circle, #fff 0%, rgba(255,255,255,0) 100%), conic-gradient(from 90deg, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
  }

  return (
    <div ref={wrapRef} className="relative flex items-center justify-between gap-2 py-1">
      <span className="text-xs text-muted iast">{label}</span>
      <button
        onClick={handleToggleOpen}
        className="w-6 h-6 rounded border border-surface-600 flex-shrink-0 shadow-inner hover:border-gold-500 transition-colors"
        style={{ background: value }}
        title={value}
      />
      {open && (
        <div className="absolute right-0 top-8 z-50 w-56 bg-surface-800 border border-surface-600 rounded-lg shadow-xl p-3 space-y-2.5">

          {/* Tabs + New/Current preview */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 text-[10px] font-mono">
              <button
                onClick={() => setTab('standard')}
                className={`px-2 py-0.5 rounded transition-colors ${tab === 'standard' ? 'bg-gold-700 text-black' : 'text-muted hover:text-cream'}`}
              >Standard</button>
              <button
                onClick={() => setTab('custom')}
                className={`px-2 py-0.5 rounded transition-colors ${tab === 'custom' ? 'bg-gold-700 text-black' : 'text-muted hover:text-cream'}`}
              >Custom</button>
            </div>
            <div className="flex flex-col items-center gap-0.5" title={`New ${value} / current ${openedValueRef.current}`}>
              <div className="flex rounded overflow-hidden border border-surface-600">
                <div className="w-5 h-4" style={{ background: value }} />
                <div className="w-5 h-4" style={{ background: openedValueRef.current }} />
              </div>
              <div className="flex text-[7px] text-muted leading-none gap-1">
                <span className="w-5 text-center">New</span>
                <span className="w-5 text-center">Cur.</span>
              </div>
            </div>
          </div>

          {tab === 'standard' ? (
            <div className="space-y-2">
              <div
                ref={wheelRef}
                onMouseDown={startDrag(updateFromWheel)}
                onTouchStart={startDrag(updateFromWheel)}
                className="relative w-full rounded-full cursor-crosshair"
                style={{ ...wheelStyle, paddingBottom: '100%' }}
              >
                <div
                  className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 border-white shadow pointer-events-none"
                  style={{
                    left: `${50 + 50 * Math.min(1, s) * Math.cos(h * Math.PI / 180)}%`,
                    top:  `${50 + 50 * Math.min(1, s) * Math.sin(h * Math.PI / 180)}%`,
                    background: value,
                  }}
                />
              </div>
              <div className="flex gap-1">
                {GREY_STEPS.map(sw => (
                  <button
                    key={sw}
                    onClick={() => commitHex(sw)}
                    className="flex-1 aspect-square rounded-sm border border-surface-600 hover:border-gold-500 transition-colors"
                    style={{ background: sw }}
                    title={sw}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div
                ref={squareRef}
                onMouseDown={startDrag(updateFromSquare)}
                onTouchStart={startDrag(updateFromSquare)}
                className="relative w-full h-32 rounded cursor-crosshair"
                style={squareStyle}
              >
                <div
                  className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 border-white shadow pointer-events-none"
                  style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }}
                />
              </div>
              <div
                ref={hueRef}
                onMouseDown={startDrag(x => updateFromHue(x))}
                onTouchStart={startDrag(x => updateFromHue(x))}
                className="relative w-full h-3 rounded cursor-pointer"
                style={hueStyle}
              >
                <div
                  className="absolute top-0 bottom-0 w-1 -ml-0.5 bg-white border border-surface-900 rounded-sm pointer-events-none"
                  style={{ left: `${(h / 360) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
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
            </div>
          )}

        </div>
      )}
    </div>
  )
}
