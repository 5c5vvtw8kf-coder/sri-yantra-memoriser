/**
 * activeDeities.js
 *
 * Every view component imports canonical deity data through this file
 * instead of importing khadgamala-canonical.json directly. It re-exports the
 * exact same shape ({ meta, sections, deities, lines }) but filters out any
 * deity flagged `optional: true` (currently just garimāsiddhē — excluded by
 * some lineages, included by others) unless the user has switched optional
 * deities on.
 *
 * The setting is read once, at module load. That keeps every one of the
 * ~25 components that import this file simple (no context, no props
 * threading) at the cost of needing a page reload for a toggle to take
 * effect — see setIncludeOptionalDeities's caller in ReferencesView.jsx,
 * which reloads immediately after writing the setting.
 */
import raw from './khadgamala-canonical.json'
import { getIncludeOptionalDeities } from '../utils.js'

const includeOptional = getIncludeOptionalDeities()

const deities = includeOptional
  ? raw.deities
  : raw.deities.filter(d => !d.optional)

const data = { ...raw, deities }

export default data
