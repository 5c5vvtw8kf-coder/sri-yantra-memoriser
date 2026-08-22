import { useState } from 'react'
import { getSyncCode, getLastSyncedAt, createSyncCode, linkSyncCode, pullNow, clearSyncCode } from '../sync.js'

/**
 * SyncView.jsx — "Device Sync" tab.
 *
 * Thin UI over sync.js. No polling, no background magic visible here — the
 * actual invisible sync (pull-on-load, debounced push-on-change) lives in
 * App.jsx's mount effect and utils.js's write functions respectively. This
 * view is just the explicit, user-initiated actions: get a code, link a
 * code, see when it last synced, unlink.
 *
 * The lost-code warning is a hard requirement (Chris, 2026-08-16 design
 * review) — shown unconditionally, not just on first use, since there's no
 * account to fall back on if the code is ever lost.
 */

function fmtTimestamp(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    })
  } catch { return iso }
}

export default function SyncView({ tr = k => k }) {
  const [code, setCode] = useState(() => getSyncCode())
  const [lastSynced, setLastSynced] = useState(() => getLastSyncedAt())
  const [inputCode, setInputCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { kind: 'success'|'error', text }
  const [copied, setCopied] = useState(false)

  const refresh = () => {
    setCode(getSyncCode())
    setLastSynced(getLastSyncedAt())
  }

  const handleGetCode = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await createSyncCode()
      refresh()
      setMessage({ kind: 'success', text: tr('sync.success_created') })
    } catch (err) {
      setMessage({ kind: 'error', text: tr('sync.error_generic') })
      console.error('sync: createSyncCode failed', err)
    } finally {
      setBusy(false)
    }
  }

  const handleLink = async () => {
    const trimmed = inputCode.trim()
    if (!trimmed) return
    if (!window.confirm(tr('sync.link_confirm'))) return
    setBusy(true)
    setMessage(null)
    try {
      await linkSyncCode(trimmed)
      refresh()
      setInputCode('')
      setMessage({ kind: 'success', text: tr('sync.success_linked') })
    } catch (err) {
      const isNotFound = /not found/i.test(err?.message || '')
      const isInvalid = /invalid/i.test(err?.message || '')
      setMessage({
        kind: 'error',
        text: isNotFound ? tr('sync.error_not_found') : isInvalid ? tr('sync.error_invalid') : tr('sync.error_generic'),
      })
      console.error('sync: linkSyncCode failed', err)
    } finally {
      setBusy(false)
    }
  }

  const handleSyncNow = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await pullNow()
      refresh()
      setMessage({ kind: 'success', text: tr('sync.success_synced') })
    } catch (err) {
      setMessage({ kind: 'error', text: tr('sync.error_generic') })
      console.error('sync: pullNow failed', err)
    } finally {
      setBusy(false)
    }
  }

  const handleUnlink = () => {
    if (!window.confirm(tr('sync.unlink_confirm'))) return
    clearSyncCode()
    refresh()
    setMessage(null)
  }

  const handleCopy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard API unavailable — silently ignore, code is still visible to copy manually */ }
  }

  return (
    <div className="h-full overflow-y-auto px-4 pt-6 pb-8">
      <h1 className="text-cream text-sm font-medium">{tr('sync.title')}</h1>
      <p className="text-muted text-xs mt-1.5 max-w-md">{tr('sync.intro')}</p>

      <div className="mt-4 max-w-md rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2.5">
        <p className="text-amber-400/90 text-xs leading-relaxed">{tr('sync.warning')}</p>
      </div>

      {message && (
        <div
          className={`mt-4 max-w-md rounded-lg border px-3 py-2 text-xs ${
            message.kind === 'success'
              ? 'border-gold-700/60 bg-gold-900/10 text-gold-400'
              : 'border-red-900/60 bg-red-950/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {code ? (
        <div className="mt-5 max-w-md space-y-4">
          <div>
            <p className="text-muted text-xs mb-1">{tr('sync.linked_as')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-cream text-sm font-mono tracking-wide">
                {code}
              </code>
              <button
                onClick={handleCopy}
                className="text-xs text-gold-400 hover:text-gold-300 border border-surface-700 hover:border-gold-600 rounded px-2.5 py-2 transition-colors flex-shrink-0"
              >
                {copied ? tr('sync.copied') : tr('sync.copy')}
              </button>
            </div>
            <p className="text-muted text-[11px] mt-1.5">
              {tr('sync.last_synced')}: {lastSynced ? fmtTimestamp(lastSynced) : tr('sync.never_synced')}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSyncNow}
              disabled={busy}
              className="text-xs bg-gold-400 text-surface-900 font-bold rounded px-3 py-1.5 disabled:opacity-50 transition-opacity"
            >
              {busy ? tr('sync.working') : tr('sync.sync_now')}
            </button>
            <button
              onClick={handleUnlink}
              disabled={busy}
              className="text-xs text-surface-500 hover:text-red-400 border border-surface-700 hover:border-red-900/60 rounded px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {tr('sync.unlink')}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 max-w-md space-y-6">
          <div>
            <p className="text-cream text-xs font-medium mb-1">{tr('sync.get_code')}</p>
            <p className="text-muted text-xs mb-2">{tr('sync.get_code_desc')}</p>
            <button
              onClick={handleGetCode}
              disabled={busy}
              className="text-xs bg-gold-400 text-surface-900 font-bold rounded px-3 py-1.5 disabled:opacity-50 transition-opacity"
            >
              {busy ? tr('sync.working') : tr('sync.get_code')}
            </button>
          </div>

          <div>
            <p className="text-cream text-xs font-medium mb-1">{tr('sync.have_code')}</p>
            <p className="text-muted text-xs mb-2">{tr('sync.have_code_desc')}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder={tr('sync.code_placeholder')}
                className="flex-1 text-xs bg-surface-800 border border-surface-700 text-cream rounded-lg px-2.5 py-2 placeholder:text-surface-500 focus:outline-none focus:border-gold-700 transition-colors font-mono"
              />
              <button
                onClick={handleLink}
                disabled={busy || !inputCode.trim()}
                className="text-xs bg-surface-800 text-gold-400 border border-surface-700 hover:border-gold-600 rounded px-3 py-2 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {busy ? tr('sync.working') : tr('sync.link')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
