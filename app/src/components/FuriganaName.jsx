import { displayName } from '../utils.js'

/**
 * FuriganaName — renders a deity name with katakana furigana (ruby text)
 * when uiLang === 'ja'. Falls back to a plain <span> for all other languages.
 *
 * Usage:
 *   <FuriganaName deity={d} script={script} uiLang={uiLang} className="iast" />
 *
 * The component is inline, so it can sit inside any block element (<h2>, <p>, etc.).
 */
export default function FuriganaName({ deity, script, uiLang, className = '', style }) {
  if (!deity) return null

  const name = displayName(deity, script)
  const kana = deity.scripts?.kana

  if (uiLang !== 'ja' || !kana) {
    return <span className={className} style={style}>{name}</span>
  }

  return (
    <ruby className={className} style={style}>
      {name}
      <rt style={{
        fontSize: '0.6em',
        letterSpacing: '0.08em',
        color: 'rgba(201,168,76,0.75)',
        fontFamily: 'sans-serif',
        fontStyle: 'normal',
      }}>
        {kana}
      </rt>
    </ruby>
  )
}
