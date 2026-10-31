import { home } from '@/content'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/Button'
import { useGsap } from '@/lib/useGsap'

export function Manifesto() {
  const { manifesto } = home
  const words = manifesto.statement.split(' ')

  // Words brighten one by one as the block crosses the viewport. Scrubbed, so
  // the reader controls the pace and nothing animates off-screen.
  const ref = useGsap<HTMLElement>(({ self, gsap }) => {
    gsap.fromTo(
      self.querySelectorAll('[data-word]'),
      { opacity: 0.18 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.5,
        scrollTrigger: {
          trigger: self,
          start: 'top 72%',
          end: 'bottom 72%',
          scrub: 0.4,
        },
      },
    )
  })

  return (
    <section
      id="manifesto"
      ref={ref}
      data-nav-label={manifesto.label}
      className="container-page py-24 md:py-40"
    >
      <Reveal className="label text-stone mb-10 flex items-center gap-3">
        <span className="h-px w-8 bg-line" aria-hidden="true" />
        {manifesto.label}
      </Reveal>

      <p className="display text-[length:var(--text-fluid-2xl)] max-w-[18ch] md:max-w-[20ch]">
        {words.map((w, i) => (
          <span key={i} data-word className="inline-block mr-[0.24em]">
            {w}
          </span>
        ))}
      </p>

      <div className="mt-16 grid gap-10 md:grid-cols-12">
        <div className="md:col-start-6 md:col-span-7 space-y-6">
          {manifesto.body.map((p, i) => (
            <Reveal key={i} as="p" delay={i * 0.08} className="text-stone max-w-2xl">
              {p}
            </Reveal>
          ))}
          <Reveal delay={0.15}>
            <Button href={manifesto.link.href} variant="text">
              {manifesto.link.label}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
