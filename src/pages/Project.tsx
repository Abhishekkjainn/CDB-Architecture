import { useParams, Link } from 'react-router-dom'
import { getProject, projects, type GalleryItem } from '@/content'
import { Image } from '@/components/Image'
import { Reveal, MaskText } from '@/components/Reveal'
import { Button } from '@/components/Button'
import { useGsap } from '@/lib/useGsap'
import { cn } from '@/lib/cn'
import NotFound from './NotFound'

const ratios: Record<NonNullable<GalleryItem['shape']>, string> = {
  wide: '3 / 2',
  tall: '4 / 5',
  square: '1 / 1',
}

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)

  // Next project in the list, wrapping around — keeps people moving.
  const next =
    projects[(projects.findIndex((p) => p.slug === slug) + 1) % projects.length]!

  // Scroll-linked zoom-out on the cover photograph.
  const coverRef = useGsap<HTMLDivElement>(({ self, gsap }) => {
    gsap.fromTo(
      self.querySelector('img'),
      { scale: 1.12 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: self, start: 'top top', end: 'bottom top', scrub: true },
      },
    )
  }, [slug])

  if (!project) return <NotFound />

  return (
    <article>
      {/* Cover */}
      <header className="relative">
        <div ref={coverRef} className="relative h-[72svh] md:h-[88svh] overflow-hidden">
          <Image
            src={project.cover}
            alt={`${project.title}, ${project.location}`}
            ratio="auto"
            width={2000}
            priority
            reveal={false}
            sizes="100vw"
            className="h-full w-full"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/75 to-ink/10" />
        </div>

        <div className="container-page absolute inset-x-0 bottom-0 pb-12 md:pb-16 text-paper">
          <Reveal className="label text-paper/70 mb-5">
            {project.category} &mdash; {project.status}
          </Reveal>
          <MaskText
            as="h1"
            text={project.title}
            className="display text-[length:var(--text-fluid-2xl)] max-w-[14ch]"
          />
          <Reveal as="p" className="label text-paper/70 mt-5">
            {project.location} &mdash; {project.year}
          </Reveal>
        </div>
      </header>

      {/* Summary + facts */}
      <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <Reveal as="p" className="display text-[length:var(--text-fluid-lg)] max-w-[28ch]">
            {project.summary}
          </Reveal>
          <div className="mt-10 space-y-6">
            {project.narrative.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 0.05} className="text-stone max-w-prose">
                {p}
              </Reveal>
            ))}
          </div>
        </div>

        <aside className="md:col-span-4 md:col-start-9">
          <Reveal as="h2" className="label text-stone mb-5">
            Project facts
          </Reveal>
          <dl className="divide-y divide-line border-y border-line">
            {project.facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-6 py-3.5">
                <dt className="label text-stone shrink-0">{f.label}</dt>
                <dd className="text-right text-[length:var(--text-fluid-sm)]">{f.value}</dd>
              </div>
            ))}
          </dl>
          {project.credits && (
            <>
              <h2 className="label text-stone mt-10 mb-5">Credits</h2>
              <dl className="divide-y divide-line border-y border-line">
                {project.credits.map((c) => (
                  <div key={c.label} className="flex justify-between gap-6 py-3.5">
                    <dt className="label text-stone shrink-0">{c.label}</dt>
                    <dd className="text-right text-[length:var(--text-fluid-sm)]">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </aside>
      </div>

      {/* Gallery */}
      <div className="container-page grid gap-x-8 gap-y-10 md:grid-cols-12 pb-16 md:pb-24">
        {project.gallery.map((item, i) => {
          const shape = item.shape ?? 'wide'
          // Wide images run full width; tall ones pair up two to a row.
          const span = shape === 'wide' ? 'md:col-span-12' : 'md:col-span-6'
          return (
            <figure key={i} className={cn(span, shape !== 'wide' && 'self-start')}>
              <Image
                src={item.src}
                alt={item.alt}
                ratio={ratios[shape]}
                width={shape === 'wide' ? 1800 : 1200}
                parallax={shape === 'wide'}
                sizes={shape === 'wide' ? '(max-width: 768px) 100vw, 88vw' : '(max-width: 768px) 100vw, 44vw'}
              />
              {item.caption && (
                <figcaption className="label text-stone mt-3 max-w-prose">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>

      {/* Pull quote */}
      {project.quote && (
        <aside className="border-y border-line bg-paper-dim/50">
          <div className="container-page py-20 md:py-28 text-center">
            <Reveal as="blockquote" className="display text-[length:var(--text-fluid-xl)] mx-auto max-w-[20ch]">
              &ldquo;{project.quote.text}&rdquo;
            </Reveal>
            <Reveal as="p" className="label text-stone mt-8">
              {project.quote.attribution}
            </Reveal>
          </div>
        </aside>
      )}

      {/* Next project */}
      <nav className="container-page py-16 md:py-24" aria-label="Next project">
        <Reveal className="label text-stone mb-8">Next project</Reveal>
        <Link to={`/work/${next.slug}`} className="group grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5 overflow-hidden">
            <Image
              src={next.cover}
              alt={next.title}
              ratio="3 / 2"
              width={1000}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
          </div>
          <div className="md:col-span-7">
            <MaskText
              as="h2"
              text={next.title}
              className="display text-[length:var(--text-fluid-xl)]"
            />
            <p className="label text-stone mt-3">
              {next.location} &mdash; {next.year}
            </p>
          </div>
        </Link>
        <div className="mt-12 border-t border-line pt-8">
          <Button href="/work" variant="text">
            All projects
          </Button>
        </div>
      </nav>
    </article>
  )
}
