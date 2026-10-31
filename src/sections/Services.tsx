import { useState } from 'react'
import { home } from '@/content'
import { Image } from '@/components/Image'
import { Reveal, MaskText } from '@/components/Reveal'
import { useGsap } from '@/lib/useGsap'
import { cn } from '@/lib/cn'

/** Infinite marquee. Duplicated once and translated by exactly -50%, so the
 *  loop is seamless at any width without measuring anything. */
function Marquee({ items }: { items: readonly string[] }) {
  const ref = useGsap<HTMLDivElement>(({ self, gsap }) => {
    gsap.to(self.querySelector('[data-marquee]'), {
      xPercent: -50,
      duration: 32,
      ease: 'none',
      repeat: -1,
    })
  })

  return (
    <div ref={ref} className="overflow-hidden border-y border-line py-4" aria-hidden="true">
      <div data-marquee className="flex w-max">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="label flex items-center whitespace-nowrap text-stone"
          >
            {item}
            <span className="mx-6 h-1 w-1 rounded-full bg-line md:mx-10" />
          </span>
        ))}
      </div>
    </div>
  )
}

/** What lands in the client's hands. Ticks rather than bullets — it reads as
 *  a checklist of things received, which is what it is. */
function Deliverables({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((d) => (
        <li key={d} className="flex gap-3 text-[length:var(--text-fluid-sm)] text-stone">
          <span aria-hidden="true" className="mt-[0.55em] h-px w-3 shrink-0 bg-accent" />
          {d}
        </li>
      ))}
    </ul>
  )
}

export function Services() {
  const { services } = home
  const [active, setActive] = useState(0)
  const current = services.items[active]!

  return (
    <section data-nav-label={services.label} className="py-20 md:py-28">
      <div className="container-page">
        <Reveal className="label text-stone mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          {services.label}
        </Reveal>
        <MaskText
          as="h2"
          text={services.title}
          className="display text-[length:var(--text-fluid-xl)] max-w-[18ch]"
        />
        <Reveal as="p" className="mt-8 max-w-2xl text-stone">
          {services.intro}
        </Reveal>
      </div>

      <div className="mt-14">
        <Marquee items={services.marquee} />
      </div>

      <div className="container-page mt-10 grid lg:grid-cols-[1fr_minmax(0,38%)] lg:gap-16">
        {/* Index */}
        <ul>
          {services.items.map((item, i) => {
            const isActive = i === active
            return (
              <li key={item.title} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-expanded={isActive}
                  className="group block w-full py-7 text-left md:py-9"
                >
                  <span className="flex items-baseline gap-5 md:gap-8">
                    <span
                      className={cn(
                        'label shrink-0 tabular-nums transition-colors duration-300',
                        isActive ? 'text-accent' : 'text-stone',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'display block text-[length:var(--text-fluid-lg)] transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]',
                          isActive ? 'opacity-100 lg:translate-x-1.5' : 'opacity-55',
                        )}
                      >
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          'mt-2 block max-w-xl text-[length:var(--text-fluid-sm)] text-stone transition-opacity duration-500',
                          isActive ? 'opacity-100' : 'opacity-0 lg:opacity-0',
                        )}
                      >
                        {item.body}
                      </span>
                    </span>
                    <span className="label hidden shrink-0 text-stone sm:block">
                      {item.duration}
                    </span>
                  </span>
                </button>

                {/* Mobile and tablet: the active row carries its own detail,
                    so the sticky panel is never needed below lg. The grid-rows
                    trick animates to the content's real height with no
                    measuring and no max-height guesswork. */}
                <div
                  className={cn(
                    'grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] lg:hidden',
                    isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                  aria-hidden={!isActive}
                >
                  <div className="min-h-0">
                    <div className="pb-8">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        ratio="3 / 2"
                        width={900}
                        reveal={false}
                        sizes="100vw"
                      />
                      <div className="mt-5 flex items-start justify-between gap-6">
                        <Deliverables items={item.deliverables} />
                        <span className="label shrink-0 text-stone sm:hidden">
                          {item.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Desktop panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-h)+2rem)]">
            <Image
              key={current.image}
              src={current.image}
              alt={current.imageAlt}
              ratio="4 / 5"
              width={1000}
              reveal={false}
              sizes="34vw"
              className="animate-[panel-in_0.6s_var(--ease-out-expo)_both]"
            />
            <div key={current.title} className="mt-6 animate-[panel-in_0.5s_var(--ease-out-expo)_both]">
              <p className="label text-stone mb-4">What you receive</p>
              <Deliverables items={current.deliverables} />
              <p className="label text-stone mt-6 border-t border-line pt-4">
                Typical duration &mdash; {current.duration}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
