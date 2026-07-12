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

  const kana = deity.scripts?.kana
  const isJapanese = uiLang === 'ja' || script === 'ja' || script === 'kana'

  if (isJapanese && kana) {
    // Always use IAST as the base text with kana as ruby annotation
    const iastName = displayName(deity, 'iast')
    return (
      <ruby className={className} style={style}>
        {iastName}
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

  const name = displayName(deity, script)
  return <span className={className} style={style}>{name}</span>
}
