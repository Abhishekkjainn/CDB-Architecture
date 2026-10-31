import { useRef, useState } from 'react'
import { home } from '@/content'
import { BuildingScene, STAGE_RANGES, stageFor } from '@/components/BuildingScene'
import { Reveal, MaskText } from '@/components/Reveal'
import { useGsap } from '@/lib/useGsap'
import { cn } from '@/lib/cn'

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const smooth = (t: number) => t * t * (3 - 2 * t)
const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

/** Section palette at each end of the build. Matches the scene's own two states. */
const NIGHT = { bg: [4, 6, 11], fg: [245, 243, 239] }
const DAY = { bg: [232, 229, 223], fg: [18, 17, 16] }

export function Method() {
  const { method } = home
  const progress = useRef(0)
  const [active, setActive] = useState(0)
  /* Full-screen finale. A boolean with a CSS transition, deliberately not a
   * scroll-linked value: driving width and height off scroll progress rewrote
   * layout properties every frame, which reflowed the page and made the canvas
   * reallocate its drawing buffer on each one. */
  const [expanded, setExpanded] = useState(false)
  const barRef = useRef<HTMLSpanElement>(null)

  /* A sticky canvas beside a tall list rather than a pinned section: no pin
   * spacer to measure, nothing that can desync from the scrollbar, and the
   * same behaviour on touch devices.
   *
   * The section's own colours are written straight to CSS custom properties on
   * every frame, so the surrounding page turns from blueprint night to daylight
   * along with the model instead of framing it in a mismatched box. */
  const ref = useGsap<HTMLElement>(({ self, gsap }) => {
    const exterior = STAGE_RANGES[3]

    gsap.to(
      {},
      {
        scrollTrigger: {
          trigger: self,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (st) => {
            const p = st.progress
            progress.current = p
            setActive(stageFor(p))

            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${p})`
            }

            const built = smooth(
              clamp01((p - (exterior[0] + 0.1)) / (exterior[1] - exterior[0] - 0.1)),
            )

            /* Once the interior is finished the model takes the whole screen.
             * The two thresholds are deliberately apart: a single one would
             * flip the state back and forth while hovering on the boundary. */
            setExpanded((on) => (p >= 0.93 ? true : p < 0.87 ? false : on))
            const bg = NIGHT.bg.map((c, i) => mix(c, DAY.bg[i]!, built))
            const fg = NIGHT.fg.map((c, i) => mix(c, DAY.fg[i]!, built))
            self.style.setProperty('--mbg', `rgb(${bg.join(' ')})`)
            self.style.setProperty('--mfg', `rgb(${fg.join(' ')})`)
            self.style.setProperty('--mline', `rgb(${fg.join(' ')} / 0.16)`)
            self.style.setProperty('--mmuted', `rgb(${fg.join(' ')} / 0.6)`)
            self.style.setProperty('--mfaint', `rgb(${fg.join(' ')} / 0.38)`)
          },
        },
      },
    )
  })

  return (
    <section
      ref={ref}
      data-nav-label={method.label}
      className="relative bg-[var(--mbg)] text-[var(--mfg)]"
      style={
        {
          '--mbg': 'rgb(4 6 11)',
          '--mfg': 'rgb(245 243 239)',
          '--mline': 'rgb(245 243 239 / 0.16)',
          '--mmuted': 'rgb(245 243 239 / 0.6)',
          '--mfaint': 'rgb(245 243 239 / 0.38)',
        } as React.CSSProperties
      }
    >
      <div className="container-page pt-20 md:pt-28">
        <Reveal className="label mb-6 flex items-center gap-3 text-[var(--mfaint)]">
          <span className="h-px w-8 bg-[var(--mline)]" aria-hidden="true" />
          {method.label}
        </Reveal>
        <MaskText
          as="h2"
          text={method.title}
          className="display text-[length:var(--text-fluid-xl)] max-w-[18ch]"
        />
        <Reveal as="p" className="mt-8 max-w-2xl text-[var(--mmuted)]">
          {method.intro}
        </Reveal>
      </div>

      {/* The model is a direct child of the section, not a grid item: a sticky
          grid item is bounded by its grid area, which ends where the written
          stages end — so the finale would un-stick and scroll away exactly as it
          went full screen. Bounded by the section, it holds through the tail. */}
      <div
        className={cn(
          'sticky z-20 mt-12 w-full lg:mt-0',
          expanded
            ? 'top-0 h-[100svh]'
            : 'top-[var(--nav-h)] h-[52svh] sm:h-[58svh] lg:top-0 lg:h-[100svh] lg:w-[52%]',
        )}
        /* Inline rather than a utility class: this is the one transition the
           whole finale depends on, so it should not rely on an arbitrary-value
           class being generated. */
        style={{
          transitionProperty: 'width, height, top',
          transitionDuration: '900ms',
          transitionTimingFunction: 'var(--ease-out-expo)',
        }}
      >
        <BuildingScene progressRef={progress} className="h-full w-full" />

          {/* Stage read-out, framed like a site notice. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="flex items-end justify-between gap-4 px-[clamp(1.25rem,5vw,5rem)] pb-5 lg:pb-14">
              <div>
                <p className="label text-[var(--mfaint)]">
                  Stage {method.steps[active]!.n} /{' '}
                  {String(method.steps.length).padStart(2, '0')}
                </p>
                <p className="display mt-1 text-[length:var(--text-fluid-lg)] leading-none">
                  {method.steps[active]!.title}
                </p>
              </div>
              <p className="label hidden text-right text-[var(--mfaint)] sm:block">
                {method.steps[active]!.stage}
              </p>
            </div>
            <span className="block h-px w-full bg-[var(--mline)]">
              <span
                ref={barRef}
                className="block h-px origin-left bg-[var(--mfg)]"
                style={{ transform: 'scaleX(0)' }}
              />
            </span>
          </div>
      </div>

      {/* On desktop the stages flow back up alongside the sticky model by
          exactly its height, which keeps them in one scroll context with it. */}
      <ol
        className={cn(
          'relative z-10 px-[clamp(1.25rem,5vw,5rem)] pb-20 transition-opacity duration-500 lg:-mt-[100svh] lg:ml-[52%] lg:w-[48%] lg:pb-40 lg:pl-12 lg:pt-28',
          expanded && 'pointer-events-none opacity-0',
        )}
      >
          {method.steps.map((step, i) => {
            const current = i === active
            return (
              <li
                key={step.n}
                className={cn(
                  'relative border-t border-[var(--mline)] py-10 transition-opacity duration-500 md:py-14',
                  current ? 'opacity-100' : 'opacity-40',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-0 h-px w-full origin-left bg-[var(--mfg)] transition-transform duration-700 ease-[var(--ease-out-expo)]',
                    current ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
                <div className="flex gap-6 md:gap-10">
                  <span className="label shrink-0 pt-2 tabular-nums text-[var(--mfaint)]">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="display text-[length:var(--text-fluid-lg)]">{step.title}</h3>
                    <p className="label mt-2 text-[var(--mfaint)]">{step.stage}</p>
                    <p className="mt-4 max-w-prose text-[var(--mmuted)]">{step.body}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

      {/* Scroll room for the finale: the model holds the screen on its own
          while the camera pulls back to the finished house. */}
      <div aria-hidden="true" className="h-[45svh] lg:h-[70svh]" />
    </section>
  )
}
