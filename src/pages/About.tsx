import { about, site } from '@/content'
import { Image } from '@/components/Image'
import { Reveal, MaskText } from '@/components/Reveal'
import { Method } from '@/sections/Method'
import { Principles } from '@/sections/Principles'
import { Timeline } from '@/sections/Timeline'
import { CallToAction } from '@/sections/CallToAction'

export default function About() {
  return (
    <>
      <header className="container-page pt-32 md:pt-48 pb-12">
        <Reveal className="label text-stone mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          {about.hero.eyebrow}
        </Reveal>
        <MaskText
          as="h1"
          text={about.hero.title}
          className="display text-[length:var(--text-fluid-2xl)] max-w-[14ch]"
        />
        <Reveal as="p" className="mt-8 max-w-2xl text-stone text-[length:var(--text-fluid-base)]">
          {about.hero.lede}
        </Reveal>
      </header>

      <div className="container-page pb-16 md:pb-24">
        <Image
          src={about.hero.image}
          alt={about.hero.imageAlt}
          ratio="16 / 9"
          width={2000}
          parallax
          sizes="(max-width: 768px) 100vw, 88vw"
        />
      </div>

      <section data-nav-label="What we believe" className="border-t border-line pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="container-page">
          <Reveal className="label text-stone mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-line" aria-hidden="true" />
            What we believe
          </Reveal>
          <MaskText
            as="h2"
            text="Six positions we do not negotiate on."
            className="display text-[length:var(--text-fluid-xl)] max-w-[16ch]"
          />
        </div>
        <Principles />
      </section>

      <Method />

      {/* Team */}
      <section data-nav-label="The studio" className="container-page py-20 md:py-28">
        <Reveal className="label text-stone mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          The studio
        </Reveal>
        <MaskText
          as="h2"
          text="Eleven people. One principal per project."
          className="display text-[length:var(--text-fluid-xl)] max-w-[16ch]"
        />
        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {about.team.map((m, i) => (
            <Reveal as="li" key={m.name} delay={(i % 4) * 0.06}>
              <div className="border-t border-line pt-5">
                <h3 className="display text-[length:var(--text-fluid-lg)] leading-tight">
                  {m.name}
                </h3>
                <p className="label text-stone mt-2">{m.role}</p>
                <p className="mt-4 text-stone text-[length:var(--text-fluid-sm)]">{m.bio}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Timeline + recognition */}
      <section data-nav-label="Studio timeline" className="border-y border-line bg-paper-dim/40">
        <div className="container-page grid gap-16 py-20 md:py-28 lg:grid-cols-[1fr_minmax(0,34%)] lg:gap-20">
          <div>
            <Reveal as="h2" className="label text-stone mb-10">
              Studio timeline
            </Reveal>
            <Timeline />
          </div>
          <div>
            <Reveal as="h2" className="label text-stone mb-10">
              Recognition
            </Reveal>
            <ol>
              {about.recognition.map((r) => (
                <Reveal as="li" key={r.text} className="flex gap-6 border-t border-line py-5">
                  <span className="label w-14 shrink-0 tabular-nums text-stone">{r.year}</span>
                  <p className="text-[length:var(--text-fluid-sm)]">{r.text}</p>
                </Reveal>
              ))}
            </ol>
            <Reveal as="p" className="label mt-10 text-stone">
              Licensed in TX, CA and NY &middot; Working in {site.serviceAreas.length - 1} markets
            </Reveal>
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  )
}
