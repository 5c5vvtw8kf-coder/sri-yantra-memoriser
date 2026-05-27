/**
 * add_scripts.mjs — Add Telugu, Tamil, Marathi, Hindi to khadgamala-canonical.json
 *
 * No external dependencies — uses built-in Node.js only.
 *
 * Run from the project root:
 *   node scripts/add_scripts.mjs
 *
 * To overwrite existing fields:
 *   node scripts/add_scripts.mjs --force
 */

import { readFileSync, writeFileSync } from 'fs'

const DATA_FILE = 'app/src/data/khadgamala-canonical.json'
const FORCE = process.argv.includes('--force')

// ── Devanagari → Telugu ───────────────────────────────────────────────────────
// Telugu Unicode block is offset +0x300 from Devanagari for virtually all
// core characters (vowels, vowel signs, consonants, anusvara, visarga, virama).
// Exceptions handled explicitly below.

const DEVA_TO_TELUGU_EXCEPTIONS = {
  'ऀ': 'ఀ', // inverted chandrabindu
  'ँ': 'ఁ', // chandrabindu
  'ं': 'ం', // anusvara
  'ः': 'ః', // visarga
  '़': null,     // nukta — no Telugu equivalent, drop it
  'ॎ': null,     // vowel sign OE — no Telugu equivalent
  'ॏ': null,     // vowel sign OOE — no Telugu equivalent
  'ॐ': '౦౦', // OM — approximate
}

function devanagariToTelugu(text) {
  if (!text) return null
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0)
    if (ch in DEVA_TO_TELUGU_EXCEPTIONS) {
      const mapped = DEVA_TO_TELUGU_EXCEPTIONS[ch]
      if (mapped !== null) out += mapped
    } else if (code >= 0x0900 && code <= 0x097F) {
      out += String.fromCodePoint(code + 0x0300)
    } else {
      out += ch // spaces, punctuation, non-Devanagari pass through
    }
  }
  return out
}

// ── Devanagari → Tamil ────────────────────────────────────────────────────────
// Tamil script does not have all Sanskrit consonants. This mapping follows
// the standard used in Tamil religious texts (Tamil + Grantha conventions).
// Aspirated stops are mapped to their unaspirated Tamil equivalents.

const DEVA_TO_TAMIL = {
  // Independent vowels
  'अ': 'அ',  'आ': 'ஆ',  'इ': 'இ',  'ई': 'ஈ',
  'उ': 'உ',  'ऊ': 'ஊ',  'ऋ': 'ரு', 'ॠ': 'ரூ',
  'ए': 'ஏ',  'ऐ': 'ஐ',  'ओ': 'ஓ',  'औ': 'ஔ',
  'ऎ': 'எ',  'ऒ': 'ஒ',
  // Vowel signs (matras)
  'ा': 'ா',  'ि': 'ி',  'ी': 'ீ',
  'ु': 'ு',  'ू': 'ூ',  'ृ': 'ரு',
  'े': 'ே',  'ै': 'ை',  'ो': 'ோ',  'ौ': 'ௌ',
  'ॆ': 'ெ',  'ॊ': 'ொ',
  // Virama (vowel suppressor)
  '्': '்',
  // Anusvara, visarga
  'ं': 'ம்', 'ः': 'ஃ',
  // Consonants — ka varga
  'क': 'க',  'ख': 'க',  'ग': 'க',  'घ': 'க',  'ङ': 'ங',
  // ca varga
  'च': 'ச',  'छ': 'ச',  'ज': 'ஜ',  'झ': 'ஜ',  'ञ': 'ஞ',
  // ta varga (retroflex)
  'ट': 'ட',  'ठ': 'ட',  'ड': 'ட',  'ढ': 'ட',  'ण': 'ண',
  // ta varga (dental)
  'त': 'த',  'थ': 'த',  'द': 'த',  'ध': 'த',  'न': 'ந',
  // pa varga
  'प': 'ப',  'फ': 'ப',  'ब': 'ப',  'भ': 'ப',  'म': 'ம',
  // semivowels
  'य': 'ய',  'र': 'ர',  'ल': 'ல',  'व': 'வ',
  // sibilants + ha
  'श': 'ஶ',  'ष': 'ஷ',  'स': 'ஸ',  'ह': 'ஹ',
  // additional
  'ळ': 'ள',  'क्ष': 'க்ஷ',
  // chandrabindu, nukta — drop
  'ँ': '',    '़': '',
  // om
  'ॐ': 'ஓம்',
}

// Build a character-by-character map for single-char entries
const DEVA_TAMIL_CHAR = {}
for (const [k, v] of Object.entries(DEVA_TO_TAMIL)) {
  if ([...k].length === 1) DEVA_TAMIL_CHAR[k] = v
}

function devanagariToTamil(text) {
  if (!text) return null
  let out = ''
  for (const ch of text) {
    if (ch in DEVA_TAMIL_CHAR) {
      out += DEVA_TAMIL_CHAR[ch]
    } else {
      out += ch
    }
  }
  return out
}

// ── Main ──────────────────────────────────────────────────────────────────────

const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'))

let updated = 0
let skipped = 0

for (const deity of data.deities) {
  const s = deity.scripts
  if (!s || !s.iast) { skipped++; continue }

  let changed = false
  const deva = s.devanagari || null

  if (!s.marathi || FORCE) { s.marathi = deva;                        changed = true }
  if (!s.hindi   || FORCE) { s.hindi   = deva;                        changed = true }
  if (!s.telugu  || FORCE) { s.telugu  = devanagariToTelugu(deva);    changed = true }
  if (!s.tamil   || FORCE) { s.tamil   = devanagariToTamil(deva);     changed = true }

  if (changed) updated++
}

writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')

console.log(`Done. ${updated} entries updated, ${skipped} skipped.`)
console.log(`File written: ${DATA_FILE}\n`)

// Spot check
console.log('Spot check — first 3 deity entries:')
for (const deity of data.deities.slice(0, 3)) {
  const s = deity.scripts
  console.log(`\n  IAST:      ${s.iast}`)
  console.log(`  Devanagari:${s.devanagari}`)
  console.log(`  Telugu:    ${s.telugu}`)
  console.log(`  Tamil:     ${s.tamil}`)
  console.log(`  Marathi:   ${s.marathi}`)
  console.log(`  Hindi:     ${s.hindi}`)
}
