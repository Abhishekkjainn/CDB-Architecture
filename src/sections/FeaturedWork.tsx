import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { home, featuredProjects, type Project } from '@/content'
import { Image } from '@/components/Image'
import { Reveal, MaskText } from '@/components/Reveal'
import { Button } from '@/components/Button'
import { useGsap } from '@/lib/useGsap'
import { ScrollTrigger } from '@/lib/gsap'

function Card({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      /* Width is capped against viewport *height* as well as width. While the
         section is held on screen, height is the binding constraint: a card
         sized only in vw overflows the moment the window is short. */
      className="group block w-[70vw] shrink-0 sm:w-[46vw] md:w-[38vw] lg:w-[min(30vw,40svh)]"
    >
      <div className="overflow-hidden">
        <Image
          src={project.cover}
          alt={`${project.title} — ${project.summary}`}
          ratio="4 / 5"
          width={1400}
          reveal={false}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 38vw, 30vw"
          className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h3 className="display text-[length:var(--text-fluid-lg)] leading-tight">
            {project.title}
          </h3>
          <p className="label mt-2 text-stone">
            {project.location} &mdash; {project.year}
          </p>
        </div>
        <span className="label shrink-0 pt-1 tabular-nums text-stone">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </Link>
  )
}

export function FeaturedWork() {
  const bar = useRef<HTMLSpanElement>(null)
  /* Extra scroll distance the section adds below the held screen. It is the
   * row's horizontal overflow, so vertical scroll maps 1:1 onto horizontal
   * travel and the row finishes exactly as the section releases. */
  const [distance, setDistance] = useState(0)

  /* The section is held on screen by a sticky child of exactly one viewport
   * height, rather than by ScrollTrigger's pin. Sticky needs no pin spacer, is
   * immune to the measurement races that come with one, and — because the held
   * element is exactly the height of the screen — it cannot crop itself the way
   * pinning a taller section did. */
  const ref = useGsap<HTMLElement>(({ self, gsap }) => {
    const track = self.querySelector<HTMLElement>('[data-track]')
    const viewport = self.querySelector<HTMLElement>('[data-viewport]')
    if (!track || !viewport) return

    const travel = () => Math.max(0, track.scrollWidth - viewport.clientWidth)

    const measure = () => setDistance(travel())
    measure()

    gsap.fromTo(
      track,
      { x: 0 },
      {
        x: () => -travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: self,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: (st) => {
            if (bar.current) {
              bar.current.style.transform = `scaleX(${Math.max(0.03, st.progress)})`
            }
          },
        },
      },
    )

    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  })

  // The section only reaches its full height once measured, so the trigger has
  // to re-read it afterwards.
  useEffect(() => {
    if (distance) ScrollTrigger.refresh()
  }, [distance])

  return (
    <section
      ref={ref}
      data-nav-label={home.work.label}
      className="relative"
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden py-10">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal className="label mb-5 flex items-center gap-3 text-stone">
              <span className="h-px w-8 bg-line" aria-hidden="true" />
              {home.work.label}
            </Reveal>
            <MaskText
              as="h2"
              text={home.work.title}
              className="display text-[length:var(--text-fluid-xl)] max-w-[16ch]"
            />
          </div>
          <Reveal>
            <Button href={home.work.link.href} variant="text">
              {home.work.link.label}
            </Button>
          </Reveal>
        </div>

        {/* Clipped at the page gutter, so the row carries the same margins as
            every other section instead of bleeding to the screen edges. */}
        <div className="container-page mt-8 md:mt-10">
          <div
            data-viewport
            /* Without the scroll animation nothing moves the row, so it falls
               back to being scrolled by hand. */
            className="overflow-hidden motion-reduce:overflow-x-auto"
          >
            <div data-track className="flex w-max gap-5 md:gap-8">
              {featuredProjects.map((p, i) => (
                <Card key={p.slug} project={p} index={i} />
              ))}
            </div>
          </div>

          <span aria-hidden="true" className="mt-7 block h-px w-full bg-line">
            <span
              ref={bar}
              className="block h-px origin-left bg-ink"
              style={{ transform: 'scaleX(0.03)' }}
            />
          </span>
        </div>
      </div>
    </section>
  )
}
