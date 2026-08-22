// api/_lib/mergeBlob.js
//
// Combines an incoming push with whatever's already stored for that code,
// instead of the old behaviour (sync-push.js pre-2026-08-22) of blindly
// replacing the whole stored blob with whatever the pushing device sent.
// That full-blob replace meant two devices independently completing
// *different* circuits between syncs would silently erase each other's
// work — whichever device pushed last "won" for everything, including
// sections it never touched. Confirmed live 2026-08-22 (Chris: complete C4
// on Desktop, C5 on Mobile, without pulling between — under the old logic
// one of the two would vanish from the cloud).
//
// Merge strategy, chosen to fix exactly that failure mode without building
// a full CRDT (rejected as unnecessary complexity in the design doc, and
// still true here — this app has at most a handful of devices for one
// person, not true concurrent multi-user editing):
//
//   memo / memoHistory — merged per SECTION KEY (e.g. 'c4', 'bhupura').
//     A section present in the incoming blob always replaces that section
//     in the stored blob (this device's own latest write for it). A
//     section absent from the incoming blob is left untouched from
//     whatever was already stored (this device simply never touched it,
//     so it has nothing current to say about it).
//     This does NOT merge within a section — if the same circuit is
//     genuinely memorised independently on two devices before either syncs,
//     whichever push arrives second still fully replaces that one
//     section's results. That's an accepted, much narrower edge case than
//     the bug this fixes (different sections on different devices, which
//     is the actual way Chris uses multiple devices).
//
//   sessionLog — union, deduplicated by exact entry match (ts+section+
//     correct+total), sorted chronologically. Activity Log entries are
//     pure history — there's never a good reason to drop one that exists
//     on either side. Capped at 500 to match the client's own cap
//     (utils.js's saveSessionLog).
//
//   preferences — incoming wins. A single small toggle; not worth merging.

const SESSION_LOG_CAP = 500

function mergeSessionLogs(existingLog, incomingLog) {
  const all = [
    ...(Array.isArray(existingLog) ? existingLog : []),
    ...(Array.isArray(incomingLog) ? incomingLog : []),
  ]
  const seen = new Set()
  const deduped = []
  for (const entry of all) {
    const key = JSON.stringify(entry)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(entry)
  }
  deduped.sort((a, b) => (a?.ts ?? 0) - (b?.ts ?? 0))
  if (deduped.length > SESSION_LOG_CAP) deduped.splice(0, deduped.length - SESSION_LOG_CAP)
  return deduped
}

export function mergeBlobs(existing, incoming) {
  if (!existing) return incoming
  if (!incoming) return existing
  return {
    memo:        { ...(existing.memo || {}), ...(incoming.memo || {}) },
    memoHistory: { ...(existing.memoHistory || {}), ...(incoming.memoHistory || {}) },
    sessionLog:  mergeSessionLogs(existing.sessionLog, incoming.sessionLog),
    preferences: { ...(existing.preferences || {}), ...(incoming.preferences || {}) },
  }
}
