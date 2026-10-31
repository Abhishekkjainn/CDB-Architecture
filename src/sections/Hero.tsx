import { home, site } from '@/content'
import { Image } from '@/components/Image'
import { MaskText } from '@/components/Reveal'
import { useGsap } from '@/lib/useGsap'
import { scrollTo } from '@/lib/SmoothScroll'

export function Hero() {
  const { hero } = home

  const ref = useGsap<HTMLElement>(({ self, gsap }) => {
    // The frame lifts and dims as the next section arrives, so the hero reads
    // as one continuous move rather than two sections meeting.
    gsap.to(self.querySelector('[data-hero-media]'), {
      yPercent: 12,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: self, start: 'top top', end: 'bottom top', scrub: true },
    })
    gsap.to(self.querySelector('[data-hero-copy]'), {
      yPercent: -28,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: self, start: 'top top', end: 'bottom top', scrub: true },
    })
  })

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden"
    >
      <div data-hero-media className="absolute inset-0 -z-10">
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          priority
          reveal={false}
          ratio="auto"
          width={2000}
          sizes="100vw"
          className="h-full w-full"
        />
        {/* Legibility scrim — kept light so the photograph still reads. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/35"
        />
      </div>

      <div data-hero-copy className="container-page relative pb-14 pt-32 md:pb-20 text-paper">
        <p className="label text-paper/70 mb-8 overflow-hidden">
          <MaskText text={hero.eyebrow} delay={0.1} stagger={0.02} />
        </p>

        <h1 className="display text-[length:var(--text-fluid-3xl)] max-w-[14ch]">
          <MaskText text={hero.headlines} delay={0.25} stagger={0.06} />
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-paper/80 text-[length:var(--text-fluid-base)]">
            {hero.subhead}
          </p>

          <button
            type="button"
            onClick={() => scrollTo('#manifesto', -80)}
            className="group flex items-center gap-3 label text-paper/70 hover:text-paper transition-colors self-start md:self-auto"
          >
            <span className="relative block h-10 w-px overflow-hidden bg-paper/25" aria-hidden="true">
              <span className="absolute inset-x-0 top-0 h-4 bg-paper animate-[hero-cue_2s_ease-in-out_infinite]" />
            </span>
            {hero.scrollCue}
          </button>
        </div>
      </div>

      {/* Locations strip doubles as a local-search signal. */}
      <div className="relative border-t border-paper/15">
        <div className="container-page py-4 flex flex-wrap gap-x-6 gap-y-1 label text-paper/55">
          {site.serviceAreas.slice(0, 6).map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
