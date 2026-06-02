/**
 * ReferencesView.jsx
 *
 * References and source materials for the Śrī Yantra Memoriser.
 */


function SectionHeading({ children }) {
  return (
    <h2 className="text-cream text-sm font-medium tracking-wide mb-4 pb-2 border-b border-surface-700">
      {children}
    </h2>
  )
}

function ResourceCard({ title, subtitle, description, url, urlLabel }) {
  return (
    <div className="border border-surface-700 rounded-lg p-4 space-y-1.5">
      <div>
        <p className="iast text-gold-400 text-sm font-medium leading-snug">{title}</p>
        {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      {description && <p className="text-muted text-xs leading-relaxed">{description}</p>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gold-600 hover:text-gold-400 transition-colors break-all"
        >
          {urlLabel || url}
        </a>
      )}
    </div>
  )
}

// Main component

export default function ReferencesView() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-10">

      {/* ── Recordings ───────────────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Recordings</SectionHeading>

        <ResourceCard
          title="Khaḍgamālā Stotram authentic"
          subtitle="Sri Vidyalay · YouTube"
          description="Reference recording used for this app."
          url="https://youtu.be/Ro701GJzg4c?si=YPV1Uwy-B8VFCHoD"
          urlLabel="youtu.be/Ro701GJzg4c"
        />
      </section>

      {/* ── Text Source ───────────────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Canonical Text Source</SectionHeading>

        <ResourceCard
          title="Vaidika Vignanam"
          subtitle="vignanam.org"
          description="Source for the canonical deity names in this app. Khaḍgamālā Stotram in IAST, Devanāgarī, Telugu, Tamil, Kannada, Malayalam and more."
          url="https://vignanam.org/english/sri-devi-khadgamala-stotram.html"
          urlLabel="vignanam.org, Śrī Devī Khaḍgamālā Stotram"
        />
      </section>

      {/* Sri Yantra Geometry */}
      <section>
        <SectionHeading>Śrī Yantra Geometry</SectionHeading>

        <div className="space-y-3">
          <ResourceCard
            title="Zak Korvin, Sri Yantra Construction"
            subtitle="YouTube · geometerscircle.com"
            description="Step-by-step video tutorials on constructing the Sri Yantra geometrically. The mathematical construction method used in this app is derived from Korvin's work."
            url="https://www.youtube.com/@zakkorvin"
            urlLabel="youtube.com/@zakkorvin"
          />

          <ResourceCard
            title="Sri Yantra Research"
            subtitle="sriyantraresearch.com"
            description="Mathematical analysis of Sri Yantra construction, covering the 18 marma-point constraint (three lines must meet exactly), optimal geometry, and why most hand-drawn Yantras contain measurable errors."
            url="https://sriyantraresearch.com"
            urlLabel="sriyantraresearch.com"
          />
        </div>
      </section>

      {/* Study Resources */}
      <section>
        <SectionHeading>Courses</SectionHeading>

        <div className="space-y-3">
          <ResourceCard
            title="Śrīvidyā: Tantric Wisdom of the Goddess"
            subtitle="Dr. Anya Golovkova · Yogic Studies · YS 133"
            description="4-week self-study course. Covers the Vāmakeśvarīmata and Yoginīhṛdaya tantras, the historical development of Śrīvidyā, and the Śrīcakra's ritual structure. Dr. Golovkova (Cornell PhD) is the leading English-language academic on Śrīvidyā."
            url="https://www.yogicstudies.com/ys-133"
            urlLabel="yogicstudies.com/ys-133"
          />

          <ResourceCard
            title="Elementary Sanskrit I, II, III"
            subtitle="Dr. Antonia M. Ruppel · Yogic Studies · SKT 101, 102, 103"
            description="Based on her Cambridge Introduction to Sanskrit (CUP, 2017). Dr. Ruppel has taught Sanskrit at Cornell, Oxford, and LMU Munich for over 20 years. Intermediate and advanced courses also available."
            url="https://www.yogicstudies.com/faculty/antonia-ruppel"
            urlLabel="yogicstudies.com/faculty/antonia-ruppel"
          />
        </div>
      </section>

      <div className="h-4" />

    </div>
  )
}
