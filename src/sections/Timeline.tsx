import { about } from '@/content'
import { MaskText } from '@/components/Reveal'
import { useGsap } from '@/lib/useGsap'

/**
 * Studio history on a rail that draws itself as you scroll past. The line is a
 * single scaled element and each marker is a transform — no layout work during
 * the scrub, so it stays smooth on a phone.
 */
export function Timeline() {
  const ref = useGsap<HTMLDivElement>(({ self, gsap }) => {
    gsap.fromTo(
      self.querySelector('[data-rail]'),
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: self,
          start: 'top 72%',
          end: 'bottom 72%',
          scrub: 0.4,
        },
      },
    )

    gsap.utils.toArray<HTMLElement>('[data-milestone]', self).forEach((node) => {
      gsap.fromTo(
        node.querySelector('[data-dot]'),
        { scale: 0.2, backgroundColor: '#d9d4cc' },
        {
          scale: 1,
          backgroundColor: '#121110',
          duration: 0.5,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: node, start: 'top 72%', once: true },
        },
      )
      gsap.fromTo(
        node.querySelector('[data-milestone-body]'),
        { x: 24, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 78%', once: true },
        },
      )
    })
  })

  return (
    <div ref={ref} className="relative">
      {/* Rail */}
      <span
        aria-hidden="true"
        className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-line md:left-[calc(7rem+7px)]"
      />
      <span
        data-rail
        aria-hidden="true"
        className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-ink md:left-[calc(7rem+7px)]"
      />

      <ol>
        {about.timeline.map((t) => (
          <li key={t.year} data-milestone className="relative py-7 md:py-9">
            <div className="flex items-start gap-6 md:gap-0">
              <span className="label hidden w-28 shrink-0 pt-1 tabular-nums text-stone md:block">
                {t.year}
              </span>
              <span
                data-dot
                aria-hidden="true"
                className="mt-[0.45rem] block h-[15px] w-[15px] shrink-0 rounded-full border-4 border-paper bg-line"
              />
              <div data-milestone-body className="pl-6 md:pl-8">
                <span className="label block tabular-nums text-stone md:hidden">{t.year}</span>
                <p className="mt-1 max-w-prose text-[length:var(--text-fluid-sm)] md:mt-0">
                  {t.text}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="label mt-6 pl-10 text-stone md:pl-[calc(7rem+2.5rem)]">
        <MaskText text="Still here. Still small." />
      </p>
    </div>
  )
}
