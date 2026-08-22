/**
 * PullLatestButton.jsx
 *
 * A small "Pull latest" affordance for pages whose data doesn't otherwise
 * refresh after a sync — Memory Map and Activity Log both read from state
 * that's only initialised once at page load (App.jsx's memo-* useState
 * calls, or a view's own useState(() => load...()) that only re-reads on
 * remount). Rather than wire a refresh callback through every one of those,
 * this button pulls then does a full page reload — guaranteed-correct
 * everywhere, at the cost of a visible reload for what's already an
 * explicit, infrequent, confirmed action.
 *
 * Renders nothing if no device is linked (Device Sync tab is the place to
 * get a code in the first place).
 */

import { getSyncCode, pullNow } from '../sync.js'

export default function PullLatestButton({ tr = k => k, className = '' }) {
  if (!getSyncCode()) return null

  const handleClick = async () => {
    if (!window.confirm(tr('sync.sync_now_confirm'))) return
    try {
      await pullNow()
      window.location.reload()
    } catch (err) {
      window.alert(tr('sync.error_generic'))
      console.error('sync: pullNow failed (PullLatestButton)', err)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={className || 'text-xs text-surface-500 hover:text-gold-400 border border-surface-700 hover:border-gold-600 rounded px-2 py-1 transition-colors flex-shrink-0'}
    >
      {tr('sync.sync_now')}
    </button>
  )
}
