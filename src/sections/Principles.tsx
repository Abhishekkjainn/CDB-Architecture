import { useEffect, useRef, useState } from 'react'
import { about } from '@/content'
import { Reveal, MaskText } from '@/components/Reveal'
import { useGsap } from '@/lib/useGsap'
import { gsap as gsapCore, prefersReducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

/**
 * The studio's positions. A giant sticky numeral tracks whichever principle
 * owns the viewport while the rows themselves hinge in from the top edge, so
 * the list reads as pages being turned rather than text fading in.
 */
export function Principles() {
  const [active, setActive] = useState(0)
  const numberRef = useRef<HTMLSpanElement>(null)

  const ref = useGsap<HTMLDivElement>(({ self, gsap }) => {
    const rows = gsap.utils.toArray<HTMLElement>('[data-principle]', self)

    rows.forEach((rowEl, i) => {
      // Hinge: each row rotates up from its top edge into place.
      gsap.fromTo(
        rowEl.querySelector('[data-principle-inner]'),
        { rotateX: -14, y: 42, opacity: 0 },
        {
          rotateX: 0,
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: rowEl, start: 'top 88%', once: true },
        },
      )

      // The rule above each row draws itself across.
      gsap.fromTo(
        rowEl.querySelector('[data-principle-rule]'),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: rowEl, start: 'top 92%', once: true },
        },
      )

      // Whichever row owns the middle of the screen drives the big numeral.
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: rowEl,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: ({ isActive }) => {
              if (isActive) setActive(i)
            },
          },
        },
      )
    })
  })

  // Swap the big numeral with a short slide whenever the active row changes.
  useEffect(() => {
    if (!numberRef.current || prefersReducedMotion()) return
    gsapCore.fromTo(
      numberRef.current,
      { yPercent: 40, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
    )
  }, [active])

  return (
    <div ref={ref} className="container-page grid lg:grid-cols-[minmax(0,34%)_1fr] lg:gap-16">
      {/* Sticky counter */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--nav-h)+3rem)] pb-10">
          <span className="block overflow-hidden">
            <span
              ref={numberRef}
              className="display block text-[clamp(6rem,14vw,13rem)] leading-[0.8] tabular-nums text-ink"
            >
              {String(active + 1).padStart(2, '0')}
            </span>
          </span>
          <p className="label mt-6 text-stone">
            {about.principles[active]!.title}
          </p>
          <div className="mt-6 flex gap-1.5" aria-hidden="true">
            {about.principles.map((p, i) => (
              <span
                key={p.title}
                className={cn(
                  'h-px flex-1 transition-colors duration-500',
                  i <= active ? 'bg-ink' : 'bg-line',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rows */}
      <ol style={{ perspective: '1200px' }}>
        {about.principles.map((p, i) => (
          <li key={p.title} data-principle className="pt-8 md:pt-12">
            <span
              data-principle-rule
              className="mb-8 block h-px w-full origin-left bg-line"
              aria-hidden="true"
            />
            <div data-principle-inner style={{ transformOrigin: 'top center' }}>
              <div className="flex gap-5 md:gap-8">
                <span className="label shrink-0 pt-2 tabular-nums text-stone lg:hidden">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <MaskText
                    as="h3"
                    text={p.title}
                    className="display text-[length:var(--text-fluid-lg)]"
                  />
                  <Reveal as="p" delay={0.05} className="mt-4 max-w-prose text-stone">
                    {p.body}
                  </Reveal>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
