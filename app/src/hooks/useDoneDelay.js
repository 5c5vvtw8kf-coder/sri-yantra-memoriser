import { useState, useEffect } from 'react'

/**
 * Delays the "done" signal by `delay` ms so the user has time to
 * toggle the final dot's result before the completion overlay appears.
 *
 * @param {boolean} done   - immediate done flag
 * @param {number}  delay  - ms before overlay shows (default 1500)
 * @returns {boolean}      - true only after the delay has elapsed
 */
export function useDoneDelay(done, delay = 1500) {
  const [showDone, setShowDone] = useState(false)

  useEffect(() => {
    if (!done) {
      setShowDone(false)
      return
    }
    const t = setTimeout(() => setShowDone(true), delay)
    return () => clearTimeout(t)
  }, [done, delay])

  return showDone
}
