import { home } from '@/content'
import { Reveal, MaskText } from '@/components/Reveal'
import { useGsap } from '@/lib/useGsap'

/**
 * The numbers, treated as an editorial ledger rather than a row of badges:
 * each figure sits over a rule that draws itself, with a line of context
 * underneath so the number actually means something.
 */
export function Stats() {
  const ref = useGsap<HTMLElement>(({ self, gsap }) => {
    // Counters run from a tweened object rather than a timer, so they share
    // the easing and clock of everything else on the page.
    self.querySelectorAll<HTMLElement>('[data-count]').forEach((el, i) => {
      const target = Number(el.dataset.count)
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 1.9,
        delay: i * 0.08,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v))
        },
        scrollTrigger: { trigger: self, start: 'top 78%', once: true },
      })
    })

    gsap.fromTo(
      self.querySelectorAll('[data-stat-rule]'),
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.1,
        stagger: 0.09,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: self, start: 'top 82%', once: true },
      },
    )

    gsap.fromTo(
      self.querySelectorAll('[data-stat-body]'),
      { y: 22, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: self, start: 'top 82%', once: true },
      },
    )
  })

  return (
    <section
      ref={ref}
      data-nav-label={home.stats.label}
      className="border-y border-line bg-paper-dim/40"
    >
      <div className="container-page py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal className="label mb-6 flex items-center gap-3 text-stone">
              <span className="h-px w-8 bg-line" aria-hidden="true" />
              {home.stats.label}
            </Reveal>
            <MaskText
              as="h2"
              text={home.stats.title}
              className="display text-[length:var(--text-fluid-lg)] max-w-[18ch]"
            />
          </div>
        </div>

        <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {home.stats.items.map((s) => (
            <div key={s.label}>
              <span
                data-stat-rule
                className="mb-5 block h-px w-full origin-left bg-line-dark/25"
                aria-hidden="true"
              />
              <div data-stat-body>
                <dd className="display text-[clamp(3rem,7vw,5.5rem)] leading-[0.85] tabular-nums">
                  <span data-count={s.value}>0</span>
                  {s.suffix}
                </dd>
                <dt className="label mt-4 text-ink">{s.label}</dt>
                <p className="mt-2 max-w-[26ch] text-[length:var(--text-fluid-sm)] text-stone">
                  {s.note}
                </p>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
