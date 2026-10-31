import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { projects, projectCategories, seo, type Project } from '@/content'
import { Image } from '@/components/Image'
import { Reveal, MaskText } from '@/components/Reveal'
import { CallToAction } from '@/sections/CallToAction'
import { cn } from '@/lib/cn'

function WorkCard({ project, index }: { project: Project; index: number }) {
  // Alternating column offsets give the index an editorial rhythm instead of
  // a uniform grid.
  const offset = index % 2 === 1

  return (
    <Reveal
      as="article"
      className={cn('group', offset && 'lg:mt-28')}
      delay={(index % 2) * 0.06}
    >
      <Link to={`/work/${project.slug}`} className="block">
        <div className="overflow-hidden">
          <Image
            src={project.cover}
            alt={`${project.title}, ${project.location}`}
            ratio="4 / 5"
            width={1400}
            priority={index < 2}
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <h2 className="display text-[length:var(--text-fluid-lg)]">{project.title}</h2>
            <p className="label text-stone mt-2">
              {project.location} &mdash; {project.category} &mdash; {project.year}
            </p>
          </div>
          <span className="label text-stone shrink-0 pt-1">{project.status}</span>
        </div>
        <p className="mt-4 max-w-xl text-stone text-[length:var(--text-fluid-sm)]">
          {project.summary}
        </p>
      </Link>
    </Reveal>
  )
}

export default function Work() {
  const [filter, setFilter] = useState('All')
  const list = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  )

  return (
    <>
      <header className="container-page pt-32 md:pt-48 pb-12 md:pb-16">
        <Reveal className="label text-stone mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          Selected work
        </Reveal>
        <MaskText
          as="h1"
          text="Every project starts with the ground it sits on."
          className="display text-[length:var(--text-fluid-2xl)] max-w-[16ch]"
        />
        <Reveal as="p" className="mt-8 max-w-2xl text-stone">
          {seo.pages['/work'].description}
        </Reveal>
      </header>

      {/* Filter. Styled as a floating dark segmented control so it reads as a
          sibling of the nav island rather than a stray toolbar. */}
      <div className="sticky top-[calc(var(--nav-h)+0.5rem)] z-30 flex justify-center px-4">
        <div
          role="group"
          aria-label="Filter projects by type"
          className="flex max-w-full gap-1 overflow-x-auto rounded-[22px] border border-white/15 bg-[#0c0b0a]/88 p-1.5 shadow-[0_18px_50px_-22px_rgba(0,0,0,0.8)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {projectCategories.map((c) => {
            const count =
              c === 'All' ? projects.length : projects.filter((p) => p.category === c).length
            const selected = filter === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={selected}
                className={cn(
                  'label flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 transition-colors duration-300',
                  selected
                    ? 'bg-paper text-ink'
                    : 'text-white/60 hover:bg-white/8 hover:text-paper',
                )}
              >
                {c}
                <span className={cn('tabular-nums', selected ? 'text-stone' : 'text-white/35')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="container-page grid gap-x-10 gap-y-16 md:gap-y-24 lg:grid-cols-2 py-16 md:py-24">
        {list.map((p, i) => (
          <WorkCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <CallToAction />
    </>
  )
}
