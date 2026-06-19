/**
 * IntroView.jsx
 *
 * Welcome and Introduction page.
 * The full Sri Yantra is rendered as a faint watermark behind the text,
 * matching the low-opacity geometry style used in GuravaView.
 * Responds to the `script` prop for Sanskrit display (IAST / Devanagari).
 */

import SriYantraSVG from './SriYantraSVG'

export default function IntroView({ script = 'iast' }) {
  const isDev = script === 'devanagari'
  const skt   = isDev ? '' : 'iast'

  const mantraText = isDev
    ? 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः'
    : 'Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ'

  const salutText = isDev
    ? 'नमस्त्रिपुरसुन्दरि'
    : 'Namastripurasundari'

  return (
    <div className="relative w-full">

      {/* ── Watermark — full Sri Yantra at low opacity ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.07 }}
        aria-hidden="true"
      >
        <div style={{ width: '160%', position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)' }}>
          <SriYantraSVG
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative max-w-xl mx-auto px-6 py-10 space-y-8">

        {/* Opening invocation */}
        <div className="text-center space-y-2 pb-6 border-b border-surface-800">
          <p
            className={`${isDev ? '' : 'iast'} text-gold-300 leading-relaxed tracking-wide`}
            style={{ fontSize: '22px' }}
          >
            {mantraText}
          </p>
          <p className={`${isDev ? '' : 'iast'} text-gold-600 text-lg`}>
            {salutText}
          </p>
        </div>

        {/* Welcome */}
        <section className="space-y-3">
          <p className={`${skt} text-gold-400 text-sm leading-relaxed`}>
            Namaskaram and welcome to the Śrī Yantra Memoriser,
            a tool for learning and internalising the Khadgamala Stotram through the sacred
            geometry of the Śrī Yantra.
          </p>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            This is a memorisation and internalisation tool, not a guide to the philosophy or
            theology of the Śrī Yantra or the Khadgamala Stotram.
            Many excellent resources exist for that, some are listed in the References page of the Resources section.
          </p>
        </section>

        {/* The Śrī Yantra */}
        <section className="space-y-2">
          <h2 className={`${skt} text-gold-700 text-xs font-mono uppercase tracking-widest`}>
            The Śrī Yantra
          </h2>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            The Śrī Yantra (also called the Śrī Cakra) is one of the most revered sacred geometric
            mandalas in Hindu, especially within the{' '}
            <span className={skt}>Śrī Vidyā</span> school, and Buddhist tantric traditions. Nine interlocking triangles, four pointing upward
            and five pointing downward, radiate from a central point, the Bindu, surrounded
            by lotus petals and an outer square enclosure with four gates. Together they form
            nine enclosures or 'veils' (<span className={skt}>āvaraṇas</span>), progressing from the
            outermost expression of manifest reality inward to the point of pure awareness.
          </p>
        </section>

        {/* The Khadgamala Stotram */}
        <section className="space-y-2">
          <h2 className="text-gold-700 text-xs font-mono uppercase tracking-widest">
            The Khadgamala Stotram
          </h2>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            The Khadgamala Stotram, the Garland of the Sword, invokes by name the deities
            residing in each of the nine <span className={skt}>āvaraṇas</span>, moving from the outermost{' '}
            <span className={skt}>Bhūpura</span> inward, with increasing secrecy, to the Bindu. The nine <span className={skt}>āvaraṇas</span> contain
            102 deity names. The full stotram also includes the{' '}
            <span className={skt}>Nyāsa Devatāḥ</span>, the{' '}
            <span className={skt}>Tithi Nitya Devatāḥ</span>, the <span className={skt}>Divyaugha</span>,{' '}
            <span className={skt}>Siddaugha</span> and <span className={skt}>Mānavaugha</span> gurus, the Nava (nine){' '}
            <span className={skt}>Cakreśvarī</span>, and closing epithets, around 160 names in
            total, varying slightly by lineage. Chanting the complete stotram with the{' '}
            <span className={skt}>Śrī Yantra</span> clearly in mind is considered equivalent to
            a full <span className={skt}>Śrī Cakra pūjā</span>.
          </p>
        </section>

        {/* How this app works */}
        <section className="space-y-2">
          <h2 className="text-gold-700 text-xs font-mono uppercase tracking-widest">
            How this app works
          </h2>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            Most approaches to memorising the Khadgamala Stotram rely on rote sequential
            repetition. This app offers a different approach as an aid. The foundation is spatial memory,
            learning not just the order of the names, but{' '}
            <em>where each deity lives</em> within the geometry of the{' '}
            <span className={skt}>Śrī Yantra</span>. When the geometry is genuinely
            internalised, the sequential chant follows naturally.
          </p>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            Work through the <span className="text-gold-400">Explore and Memorise</span> section
            level by level. <span className="text-gold-400">Explore</span> mode is there to review
            the content and <span className="text-gold-400">Memorise</span> mode to recall the
            focus object in your mind before hovering over it to reveal the deity and recording
            whether it is memorised or not, by clicking or double-clicking respectively. Then further test your recall with the random{' '}
            <span className="text-gold-400">Spot Check</span> feature. The{' '}
            <span className="text-gold-400">Memory Map</span> exists to map out your strengths and
            weaknesses and where to focus further efforts.
          </p>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            Before you begin, it is worth listening to a full chanting of the Khadgamala Stotram
            to familiarise yourself with the sound and rhythm of the names.{' '}
            You may find that{' '}
            <a
              href="https://youtu.be/Ro701GJzg4c?si=YPV1Uwy-B8VFCHoD"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
            >
              this recording
            </a>{' '}
            is a good starting point. We hope you enjoy this app and find it useful.
          </p>
        </section>


        <div className="h-4" />
      </div>
    </div>
  )
}
