import { Link } from 'react-router-dom'
import { home, site } from '@/content'
import { Image } from '@/components/Image'
import { Reveal, MaskText } from '@/components/Reveal'
import { ContactForm } from '@/components/ContactForm'
import { useGsap } from '@/lib/useGsap'

export function CallToAction() {
  const { cta } = home

  // The photograph behind the panel drifts and brightens slightly as the
  // section arrives, so the block feels like it is being approached.
  const ref = useGsap<HTMLElement>(({ self, gsap }) => {
    gsap.fromTo(
      self.querySelector('[data-cta-veil]'),
      { opacity: 0.92 },
      {
        opacity: 0.74,
        ease: 'none',
        scrollTrigger: { trigger: self, start: 'top bottom', end: 'center center', scrub: true },
      },
    )
  })

  return (
    <section
      ref={ref}
      data-nav-label={cta.label}
      className="relative isolate overflow-hidden bg-ink text-paper"
    >
      <Image
        src={cta.image}
        alt={cta.imageAlt}
        ratio="auto"
        width={2000}
        parallax
        reveal={false}
        sizes="100vw"
        className="absolute inset-0 -z-20 h-full w-full"
      />
      <div data-cta-veil aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/85" />

      <div className="container-page grid gap-14 py-20 md:py-28 lg:grid-cols-[1fr_minmax(0,46%)] lg:gap-20">
        {/* The pitch */}
        <div>
          <Reveal className="label mb-6 flex items-center gap-3 text-white/55">
            <span className="h-px w-8 bg-white/25" aria-hidden="true" />
            {cta.label}
          </Reveal>
          <MaskText
            as="h2"
            text={cta.title}
            className="display text-[length:var(--text-fluid-2xl)] max-w-[12ch]"
          />
          <Reveal as="p" className="mt-7 max-w-xl text-white/70">
            {cta.body}
          </Reveal>

          <ol className="mt-12 space-y-0">
            {cta.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.n}
                delay={i * 0.07}
                className="flex gap-5 border-t border-white/12 py-5 md:gap-8"
              >
                <span className="label shrink-0 pt-1 tabular-nums text-white/35">{step.n}</span>
                <div>
                  <h3 className="text-[length:var(--text-fluid-sm)] font-medium">{step.title}</h3>
                  <p className="mt-1 text-[length:var(--text-fluid-sm)] text-white/55">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={`mailto:${site.contact.email}`}
              className="label text-white/70 underline-offset-[6px] transition-colors hover:text-paper hover:underline"
            >
              {site.contact.email}
            </a>
            <span className="h-3 w-px bg-white/20" aria-hidden="true" />
            <a
              href={`tel:${site.contact.phoneE164}`}
              className="label text-white/70 underline-offset-[6px] transition-colors hover:text-paper hover:underline"
            >
              {site.contact.phone}
            </a>
          </Reveal>
        </div>

        {/* The ask. Three fields, on the same page, posting to the same
            endpoint as the full form on /contact. */}
        <Reveal
          as="div"
          className="rounded-[2px] border border-white/15 bg-white/[0.04] p-6 backdrop-blur-sm md:p-9"
        >
          <h3 className="display text-[length:var(--text-fluid-lg)]">
            Sixty seconds. Three fields.
          </h3>
          <p className="label mt-3 text-white/50">
            Or{' '}
            <Link
              to={cta.fullFormLink.href}
              className="underline underline-offset-4 transition-colors hover:text-paper"
            >
              {cta.fullFormLink.label.toLowerCase()}
            </Link>{' '}
            if you would rather give us the detail now.
          </p>

          <ContactForm
            only={cta.quickFields}
            tone="dark"
            idPrefix="cta"
            submitLabel={cta.submitLabel}
            className="mt-8 md:grid-cols-1"
          />

          <ul className="mt-8 grid gap-x-6 gap-y-2 border-t border-white/12 pt-6 sm:grid-cols-2">
            {cta.reassurance.map((r) => (
              <li key={r} className="label flex items-start gap-2.5 text-white/55">
                <span aria-hidden="true" className="mt-[0.45em] h-px w-2.5 shrink-0 bg-accent" />
                {r}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
