# Persistence, Drill Linking & Cross-Device Sync — Design (DRAFT v4)

**Status: DRAFT v4. Chris has now confirmed all major open items from v1–v3. Not yet actioned — implementation has not started.**

This document was produced using a five-phase requirement → industry review → design → production → challenge process, at Chris's request, ahead of moving Sri Yantra Memoriser toward public launch. v2 and v3 incorporated Chris's 2026-08-16 review feedback in two rounds; v4 closes out the three remaining open ambiguities plus a Stage 2 audience correction, also 2026-08-16.

**Decisions confirmed by Chris, 2026-08-16:**

1. Sync code is system-generated, not user-chosen.
2. Memory Map **distinguishes** Memorise-mode (sequential, per-circuit) results from Drill-mode (Segment/Line/Triangle/Spot Check) results, via a toggle to include/exclude drill results. **Toggle default: off (Memorise-only)** — confirmed, matches this document's proposal.
3. Chris will personally pay for domain registration and hosting — infra choice is not free-tier-constrained, though free tier remains the default.
4. Build Part A and Part B **together**, not sequenced.
5. **Target launch date: 1 November 2026**, with an early-October checkpoint and a fallback to ship Part A alone if Part B isn't ready.
6. **Lost sync-code handling: must be stated to the user in-product** — confirmed as a requirement, not left as an open question. (Exact copy/placement is still an implementation detail, not a design blocker.)
7. **Backend confirmed: Upstash Redis + `@upstash/ratelimit` on Vercel** — no longer just a recommendation.
8. **Stage 2 audience widened beyond "Western practitioners"** — see revised "Who for" in Phase 1. Flagged as needing a CLAUDE.md-level follow-up, not fully resolved here.

---

## Phase 1 — Requirement Analysis

**What is being designed**

Two related but separable problems, both raised in the same request:

1. **Drill linking.** Spot Check, Segment Drill, Line Drill, and Triangle Drill results currently do not feed the Memory Map (per-deity colouring) or, in three of the four cases, the Activity Log (session history). Only Explore/Memorise mode (the per-circuit views) currently write to `memo-history-{key}`.
2. **Cross-device persistence.** Progress currently lives only in `localStorage` on one browser, on one device. Chris wants it retained across Desktop, Mobile, and iPad, and surviving app updates.

**Who for**

Chris first (he already uses the app across devices). Then Stage 2 practitioners — **revised 2026-08-16: no longer scoped to "Western practitioners" specifically.** Chris's own point: now that the app carries many Indic-language translations alongside IAST/Devanagari (not just an English-first tool), the original Stage 2 framing — people underserved *because* existing resources assume Devanagari literacy or Indian cultural context — no longer maps cleanly onto "Western." The real Stage 2 audience is better described as *motivated global practitioners without an in-person teacher or community*, regardless of which script or language they read in. For this document, this just means: cross-device sync matters to a broader group than originally scoped, not a narrower one — losing progress on a phone-to-laptop switch is still a real churn risk for the same reasons, just for more people.

**Flag, not yet resolved here:** this broadens who Stage 2 is, but CLAUDE.md's own Target Users section still frames Stage 2 explicitly as "Western practitioners" and Stage 3 (Indian practitioners globally) explicitly as a separate, deliberately-not-optimised-for-yet stage, "to avoid diluting focus." Worth Chris confirming whether this is (a) a description fix — Stage 2 was always meant to be "no-teacher, no-community, any language," and "Western" was just imprecise shorthand — or (b) an actual scope change that now overlaps with what CLAUDE.md called Stage 3. This document doesn't resolve that; it's a CLAUDE.md-level decision, not a persistence/sync design decision.

**Why now**

Stated goal: get the app to a stage where it can be launched publicly.

**What success looks like, concretely**

- Every mode that produces a right/wrong result (Spot Check, Segment/Line/Triangle Drill, Explore/Memorise) writes to the same per-deity history store that Memory Map reads from, so Memory Map reflects the user's full practice history regardless of which mode they used.
- Every mode also writes an entry to the Activity Log, so the session history is complete.
- A user can start a session on one device and pick up the same progress on another, without an account, email, or password.
- If the sync mechanism is unreachable, the app still works fully offline on local data — sync is additive, not a dependency.

**Explicitly out of scope for this document**

Accounts/login of any kind, lineage-edit sync (lineage overlay sync can reuse the same mechanism later but isn't designed here), Sequence Drill, audio mode, PWA/offline caching, translation QA, and marketing/distribution.

**Constraints this design has to live inside**

- Solo operator, weekend-only sessions — the operational overhead of whatever is chosen has to be near-zero.
- No backend today. Vercel hosting, no database, no auth (per CLAUDE.md's resolved decisions).
- Donation-only monetisation — the *app* doesn't charge users. This is separate from infrastructure funding: **Chris will personally pay for domain registration and hosting** (confirmed 2026-08-16), so the design is not hard-constrained to a $0 free tier. Free tier remains the sensible default starting point — it comfortably covers projected usage and keeps operational complexity low — but paid tiers or a custom domain are available if/when needed, without that being a blocker.
- **2026-07-26 decision (reconfirmed today, 2026-08-16, via direct question):** cross-device linking is via an anonymous sync-code, not an account. No email, no password, no identifying fields.
- **2026-07-26 decision, explicit and not deferred:** the code must have sufficient entropy to resist guessing, and the lookup/sync endpoint must be rate-limited from day one — not added later. A full security review is required before public launch.

**Load-bearing ambiguity surfaced and resolved this session**

Chris's phrase "I suspect this will require some kind of user profile" could have meant reopening the accounts-vs-anonymous-code decision. I asked directly; Chris confirmed **sync-code only** — the "profile" is the code plus whatever data is stored against it, not an account.

**Ambiguities resolved by Chris, 2026-08-16** (see confirmed decisions above): code generation method, drill/memorise distinction on the Memory Map plus its default state, infra funding, A/B sequencing and launch date, lost-code in-product disclosure, backend choice, and the Stage 2 audience correction.

**Only one item remains genuinely open — not a design ambiguity, a pre-implementation check**

- The exact current shape of `memo-history-{key}` entries (what fields each history record holds today) needs to be checked against the live code before the `mode`-tagging described in Part A can be implemented — this document proposes the shape but hasn't verified it against `utils.js` as it stands. This is a "read the code before writing code" step, not a decision waiting on Chris.

---

## Phase 2 — Industry Review

*(External findings. These inform Phase 3; they do not override Chris's own prior decisions above.)*

**Cross-device linking without login: the device-code pairing pattern.** The pattern used by Netflix, Disney+, and most streaming/set-top-box apps — and standardised for OAuth as the [Device Authorization Grant, RFC 8628](https://www.rfc-editor.org/rfc/rfc8628) — shows a short human-typeable code on device A, which is entered (or scanned) on device B, and device A polls until the pairing completes. This is the closest recognised industry pattern to what an anonymous sync-code needs to do for a second-device link, even though this app's use case (progress sync, not session auth) doesn't need the full OAuth grant machinery — just the "short code, typed on the other device, then linked" UX shape.

**Local-first / CRDT sync engines exist but solve a different problem.** Automerge 3.0, Yjs, Loro, and hosted services built on similar ideas (ElectricSQL, PowerSync, Turso) are designed for real-time, multi-writer, conflict-resolving sync — e.g., two people editing the same document concurrently. This app has one user, on one device at a time, writing simple pass/fail results. There's no concurrent-write conflict to resolve. Adopting a CRDT engine here would import real complexity (a sync protocol, a merge model, a new dependency to keep updated) to solve a problem this app doesn't have. Noted so it's a deliberate rejection, not an oversight.

**Cloudflare Workers KV vs. Upstash Redis.** Workers KV's free tier (100K reads/day, 1K writes/day, 1GB storage) is comparable to Upstash's, but Cloudflare's own documentation advises against using KV directly for rate-limiting because it's eventually consistent, not built for real-time counters — Durable Objects are the Cloudflare-native answer, which is a heavier, paid-tier-oriented primitive. **Upstash Redis**, by contrast, is available as a native Vercel Marketplace integration (this project is already 100% on Vercel), is HTTP-based (works cleanly from serverless/edge functions with no connection pooling to manage), has a free tier of 500K commands/month and 200GB bandwidth, and has a purpose-built companion library, `@upstash/ratelimit`, that implements sliding-window/token-bucket rate limiting in a few lines. This directly satisfies the entropy-and-rate-limiting requirement Chris set on 2026-07-26 with almost no added operational surface.

**Industry review verdict:** thorough enough to be useful, not padded. The one clear "don't reinvent this" finding is the device-code UX pattern; the one clear "don't over-adopt this" finding is CRDT sync engines; the one clear infrastructure recommendation is Upstash Redis + `@upstash/ratelimit` on Vercel.

---

## Phase 3 — Design

### Part A — Drill linking (no backend required)

This is **backend-independent** and does not itself require Part B's infrastructure. (Chris has confirmed it should still be *built* alongside Part B — see Fork Resolution below — but the two remain technically independent, which is why the split is kept in this document.)

**The mechanism.** Memory Map already reads per-deity history from `memo-history-{key}` stores keyed by circuit (`bhupura`, `nyasa`, `inner`, `gurava`, `c2`…`c9`, `nc`, `closing`), written today only by each circuit's own Explore/Memorise view via `recordHistoryEntry(key, seq, result)`. A drill round (Segment, Line, Triangle) or a Spot Check question touches deities that belong to specific circuits — a Segment Drill wedge might span C4 through C8 in one round, for instance. The correct fix is **not** a new `memo-history-segmentdrill` style store; it's routing each individual deity result, at the moment it's marked correct/wrong inside a drill, into the *same* history store its home circuit already uses — via a lookup from the deity's own section/circuit id to the existing storage key. This part of v1 is unchanged.

**Revised per Chris's 2026-08-16 feedback: Memorise-mode and Drill-mode results must be distinguishable, not flatly merged.** v1 proposed a flat merge (any correct answer from any mode counts equally toward a deity's Memory Map colour). Chris pushed back: Memorise mode is sequential (the user works through a circuit in order, in context) while the Drills are "more advanced" (random spot-checks, cross-circuit segments, geometric lines) — a correct answer in a Drill is a different, arguably stronger, signal than one in sequential Memorise mode, and conflating them silently would make the Memory Map lie about *how* a deity was learned.

**Revised mechanism:** each history entry needs a `mode` tag (`'memorise'` or `'drill'`) alongside its existing result data, so entries can be filtered rather than only ever aggregated. `recordHistoryEntry` gains a `mode` parameter — `recordHistoryEntry(key, seq, result, mode)` — passed as `'memorise'` from the four existing per-circuit Explore/Memorise call sites (currently implicit, becomes explicit) and `'drill'` from Spot Check and the three Drill views' mark-result handlers. **This requires checking the actual current shape of a `memo-history-{key}` entry in `utils.js` before implementation** — the exact object structure (result value, rolling-window size, any existing fields) isn't re-verified in this document and shouldn't be assumed.

**Memory Map gets a new toggle** (e.g., "Include drill results" switch, likely in the same right-panel area as existing Memory Map controls): when off, Memory Map colouring is computed from `mode: 'memorise'` entries only — identical to today's behaviour, nothing changes for a user who never touches the toggle. When on, both `mode` values are included in the rolling-history calculation that drives each deity's colour. This is a display-time filter, not a storage-time split — both mode's entries always live in the same `memo-history-{key}` store, which keeps the sync (Part B) data model simple: one blob per code, no separate "drill store" to sync.

**Toggle default — confirmed by Chris, 2026-08-16: off (Memorise-only).** Existing behaviour is preserved unless a user actively opts in to seeing drill-derived progress.

**Activity Log is unaffected by this change** — it was already going to tag each entry by its originating mode (`'segmentdrill'`, `'linedrill'`, `'triangledrill'`, `'spotcheck'`, and presumably `'memorise'`/`'explore'` for the existing modes) via `saveSessionLog`'s existing `section` field and filter dropdown; the toggle is a Memory Map–specific concept, not an Activity Log one.

### Part B — Cross-device sync-code

**Confirmed already (Chris, 2026-07-26 and 2026-08-16):** anonymous code, no accounts, minimal backend, entropy + rate-limiting from day one, security review before public launch.

**Newly proposed here, informed by Phase 2:**

**Code generation and shape — confirmed by Chris, 2026-08-16: system-generated, not user-chosen.** (User-chosen codes are guessable and tend to be short and memorable, which is exactly wrong for this — Chris's confirmation matches v1's recommendation.) Suggest a 10–12 character code from an unambiguous alphabet (excluding 0/O, 1/I/l) — comparable to a Signal/AirDrop-style pairing code. This yields well over 10^15 possible codes at 12 characters, which combined with rate-limiting makes brute-force lookups impractical even on a free-tier budget (and Chris has confirmed he'll fund hosting if a paid tier is ever warranted — see Constraints).

**Pairing UX.** Borrowing the device-code pairing shape from Phase 2, not the full OAuth protocol: "Get a code" button generates and displays a code on the first device; on a second device, the user enters "Have a code?" and types it in. No polling loop is needed (unlike streaming-device pairing, both devices don't need to be online simultaneously) — the second device simply authenticates future reads/writes with that code directly.

**Backend.** Upstash Redis via the Vercel Marketplace integration, accessed from Vercel serverless/edge functions, with `@upstash/ratelimit` in front of the sync endpoint. This is the smallest possible addition to the current "no backend" posture: two or three small serverless functions (`/api/sync-push`, `/api/sync-pull`, maybe `/api/sync-new-code`), no ORM, no schema migrations in the traditional sense.

**Data model.** One Redis key per sync code, value = a JSON blob containing: all `memo-*` and `memo-history-*` localStorage contents, the session log, and a `schemaVersion` integer. Sync direction: pull-on-load (merge into local state) and push-on-change (debounced, not on every single tap) — not a manual "sync now" button, to keep the UX invisible. Conflict handling: last-write-wins is acceptable given the realistic usage pattern (one person, one code, rarely two devices writing in the same minute) — this is a deliberate simplification, not an oversight, and is the reason a CRDT engine (Phase 2) isn't warranted.

**Versioning.** The `schemaVersion` field lets the client detect and migrate old blobs when the local data shape changes between app releases, without needing a database migration step.

**Privacy note.** No PII is collected under this design — no email, no name, no device fingerprinting beyond the code itself. Still worth a one-line privacy statement in-product before public launch, given a third party (Chris) will be storing user progress data, however anonymous.

### Fork resolution: sequencing Part A and Part B — decided by Chris, 2026-08-16

v1 recommended shipping Part A first and treating Part B as a separate, later multi-session project, on the reasoning that it delivers visible value fastest with the least new risk surface. Chris reviewed this and chose differently: **build A and B together**, explicitly because there's no launch deadline and he'd rather the app be more complete before it goes public than ship in visible stages.

| Option | Description | Trade-off |
|---|---|---|
| A then B | Ship drill linking first, on its own. Sync as a later, separate project. | Fastest visible value, least risk per step — but ships in stages Chris doesn't need. |
| **A and B together (decided)** | Build both before either goes live. | Bigger combined scope, more sessions before anything ships — acceptable to Chris given no hurry. Still benefits from being worked as two internally-sequenced tracks within the same effort (Part A's mode-tagging needs to be locked in before Part B's sync data model is finalised, since the synced blob includes `memo-history-*` — see Phase 4). |
| B then A | Build sync first. | Still not recommended — there's nothing meaningful to sync from Drills until Part A's mode-tagged history exists, and Part A's schema affects Part B's blob shape either way. |

**Practical sequencing note (not a contradiction of the decision, just how the work should be ordered within "together"):** even building both before launch, Part A's data-shape changes (the `mode` field) should land in code *before* Part B's sync blob is finalised, since Part B syncs whatever `memo-history-*` looks like at that point. So the work is "both, before launch" at the project level, "A's schema first" at the implementation-sequencing level.

### Launch deadline and checkpoint — added 2026-08-16

"No hurry" turned out to have a date attached: **Chris's target launch date is 1 November 2026.** From today (2026-08-16) that's roughly 10–11 weekends, at the project's own 1–4 hour weekend-session scoping — call it 15–40 hours of available build time if every weekend gets used, which past sessions on this project suggest is optimistic (OneDrive/git sync issues alone cost real time in July).

Rough sizing against that runway: Part A (schema + four call sites + toggle UI) is 1–2 sessions. Part B (Upstash Redis setup, 2–3 serverless functions, rate limiting, pairing UI, domain/DNS, plus the security review Chris himself made a hard pre-launch gate on 2026-07-26) is realistically 4–8+ sessions. Combined, that's tight against ~10–11 weekends, not comfortable — flagged directly to Chris, who chose a **checkpoint-with-fallback** plan rather than proceeding on faith or reverting to strict A-then-B sequencing:

- Keep building A and B together as originally decided.
- **Checkpoint: early October 2026 (~Oct 3–4, roughly two-thirds of the way through the runway).** By that point, Part B's core sync loop (push/pull working end-to-end against a real sync code, even without the full pairing UI polish) should be functioning.
- **Fallback: if Part B isn't working by the checkpoint, ship Part A alone on 1 November** (a complete, fully-linked Memory Map + Activity Log, no cross-device sync yet) and continue Part B as a post-launch enhancement rather than let it block the date.

This checkpoint should be revisited explicitly in early October — not left to slip silently.

---

## Phase 4 — Production

This document is the Phase 4 deliverable for the design itself. No code has been written; per Chris's own project convention ("None of this should be started without Chris reviewing and approving the design first"), implementation is a follow-on task once this is reviewed. v2 reflects Chris's 2026-08-16 review of v1; implementation still hasn't started.

Concrete data shape for Part B, for reference when implementation starts — `memoHistory` entries now carry the `mode` tag from Part A, since whatever shape that lands in is what gets synced:

```json
{
  "schemaVersion": 1,
  "code": "generated-server-side-not-stored-in-blob",
  "updatedAt": "2026-08-16T00:00:00Z",
  "memo": {
    "bhupura": { "...": "current-round result data, per existing memo-{key} shape" },
    "c2": {},
    "...": {}
  },
  "memoHistory": {
    "bhupura": {
      "someDeityId": [
        { "result": "correct", "mode": "memorise", "timestamp": "..." },
        { "result": "correct", "mode": "drill", "timestamp": "..." }
      ]
    },
    "...": {}
  },
  "sessionLog": [],
  "preferences": {
    "memoryMapIncludeDrills": false
  }
}
```

Note: the exact current entry shape (rolling window size, existing field names) needs to be confirmed against `utils.js` before this is finalised — the sketch above shows the *addition* (`mode`), not a verified replacement of what's there today. `preferences.memoryMapIncludeDrills` is included in the synced blob so the toggle choice itself follows the user across devices, not just the underlying data.

---

## Phase 5 — Challenge & Review (v2)

**Against Phase 1 (requirements):** v2 satisfies the stated success criteria and now correctly distinguishes Memorise from Drill evidence per Chris's explicit feedback, rather than flattening it as v1 did. Three items remain genuinely open (lost-code recovery UX, toggle default, unverified current entry shape) — surfaced, not silently decided, which is correct for a draft even at v2.

**Against Phase 2 (industry review):** Unchanged from v1's assessment — all three findings (device-code pairing, CRDT rejection, Upstash Redis) are still used and still visibly labelled as external input, not silently absorbed into "the design."

**At actual scale — still true in v2, now with less schedule pressure to offset it:** combining A and B into one project, as Chris has now chosen, makes the "minimal" Part B (serverless functions, Redis, rate limiting, a pairing UI, a security review) even more clearly a multi-session undertaking, since it's no longer separable from A for the purpose of an early win. That's a reasonable trade given Chris said there's no hurry — but it does mean this shouldn't be picked up expecting a single 1–4 hour session to make a dent; the first session on this should probably be scoped to *just* Part A's mode-tagging (schema + the four call sites), which is itself a complete, testable, shippable unit even though it won't go live standalone under the "together" decision.

**Real risk, now confirmed as a requirement (was open in v1–v3, closed in v4):** a lost or never-recorded sync code still means permanent, unrecoverable data loss by design. Chris has now confirmed this must be stated to the user in-product — not just an internal accepted trade-off. Still not reflected in the data model or UX sketch above (exact copy/placement is an implementation detail for whoever builds the pairing UI), and it needs to ship *with* Part B, not be retrofitted after a user has already lost data.

**New in v2 — resolved, no longer a risk:** v1's flagged risk (silent "combined evidence" behaviour change to Memory Map) is resolved by Chris's explicit toggle decision. This is a good example of the process working as intended — the draft surfaced a real product ambiguity instead of guessing, and Chris corrected it before any code was written.

**New in v2 — a risk worth naming:** the toggle itself, and the `mode`-tagged history shape underneath it, is new surface area that v1 didn't have. It touches `recordHistoryEntry`'s call signature (four existing call sites plus four new ones), the Memory Map read path, and now the sync blob shape in Part B — a change in three places that all need to move together or the toggle silently breaks (e.g., old history entries written before this ships won't have a `mode` field at all, and the toggle/filter logic needs a defined fallback for those — untagged legacy entries should probably be treated as `'memorise'` for backward compatibility, since that's what they always meant before this change existed). This backward-compatibility handling isn't in the design above and should be added before implementation.

**Credibility check:** no leftover template language; the "confirmed by Chris" vs. "still proposed" distinction is kept explicit throughout v2, consistent with v1. Figures and citations are unchanged from v1 and still consistent.

**Unexamined recommendation check:** Upstash Redis is now a confirmed choice, not just a recommendation — Chris signed off on it directly rather than it surviving purely by not being argued with. Worth noting for the record: Chris's confirmation to fund hosting doesn't change the choice (Upstash's free tier still comfortably covers this app's realistic usage), it just means a paid tier is available as a release valve if free-tier limits are ever actually hit, not a forced fallback.

**Still open (not a Chris-decision — an implementation-time check):** the actual current shape of `memo-history-{key}` entries needs verifying against `utils.js` before the `mode` field is added, and backward-compatibility handling for pre-existing untagged entries (treat as `'memorise'`) still needs to be built, not just described here.

**Status:** Draft v4. All eight design decisions confirmed by Chris (see top of document). Not yet actioned. Recommended next step: scope a first implementation session to Part A's schema change alone (verify current `memo-history` shape, add the `mode` field + backward-compat handling, wire the four new call sites, add the toggle at its confirmed default) — a complete, testable unit and the fastest way to show progress against the early-October checkpoint.
