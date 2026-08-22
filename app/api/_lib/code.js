// api/_lib/code.js
//
// Sync-code generation and validation. The code is the *only* thing standing
// between a stranger and someone's practice history (per the "anonymous code,
// no accounts" design decision) — see PERSISTENCE-AND-SYNC-DESIGN.md Part B.
// Two properties matter here and both are deliberate, not incidental:
//   1. Cryptographic randomness (crypto.randomBytes, not Math.random).
//   2. Unbiased sampling from the alphabet — see the rejection-sampling loop
//      below, since 256 isn't a clean multiple of the alphabet length and a
//      naive `byte % alphabet.length` would make some characters very slightly
//      more likely than others.

import { randomBytes } from 'crypto'

// Unambiguous alphabet: no 0/O, 1/I/l — hard to mis-type or mis-read when a
// user copies a code by hand or reads it off one device to type into another.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz' // 58 chars
const CODE_LENGTH = 12 // 58^12 ≈ 1.3 × 10^21 possible codes

export function generateSyncCode() {
  const alphabetLen = ALPHABET.length
  const maxValid = 256 - (256 % alphabetLen) // reject bytes above this to avoid modulo bias
  let code = ''
  while (code.length < CODE_LENGTH) {
    const buf = randomBytes(CODE_LENGTH - code.length)
    for (const b of buf) {
      if (code.length >= CODE_LENGTH) break
      if (b < maxValid) code += ALPHABET[b % alphabetLen]
    }
  }
  return code
}

// Matches generateSyncCode()'s shape — used to reject malformed codes before
// they ever reach Redis. Cheap rejection, and deliberately doesn't distinguish
// "wrong shape" from "not found" to callers in a way that would help enumeration.
export function isValidSyncCode(code) {
  if (typeof code !== 'string') return false
  if (code.length !== CODE_LENGTH) return false
  for (const ch of code) {
    if (!ALPHABET.includes(ch)) return false
  }
  return true
}
