import { useState } from 'react'
import { testimonials, averageRating } from '@/content'
import { Reveal, MaskText } from '@/components/Reveal'
import { cn } from '@/lib/cn'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-accent tracking-[0.2em]" aria-label={`${rating} out of 5`}>
      {'★'.repeat(rating)}
    </span>
  )
}

export function Testimonials() {
  const [index, setIndex] = useState(0)
  const active = testimonials[index]!

  return (
    <section data-nav-label="Clients" className="border-t border-line py-20 md:py-28">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal className="label text-stone mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-line" aria-hidden="true" />
              Clients
            </Reveal>
            <MaskText
              as="h2"
              text="What it is like to build with us."
              className="display text-[length:var(--text-fluid-xl)] max-w-[15ch]"
            />
          </div>
          <Reveal className="label text-stone">
            {averageRating} / 5 average &middot; {testimonials.length} reviews
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          {/* Quote */}
          <figure className="lg:col-span-7">
            <Stars rating={active.rating} />
            <blockquote
              key={index}
              className="display text-[length:var(--text-fluid-lg)] mt-5 animate-[quote-in_0.6s_var(--ease-out-expo)_both]"
            >
              &ldquo;{active.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-7">
              <p className="font-medium">{active.name}</p>
              <p className="label text-stone mt-1">{active.context}</p>
            </figcaption>
          </figure>

          {/* Selector */}
          <ul className="lg:col-span-5 lg:pl-10 lg:border-l border-line">
            {testimonials.map((t, i) => (
              <li key={t.name}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  className={cn(
                    'group w-full border-b border-line py-4 text-left transition-colors duration-300',
                    i === index ? 'text-ink' : 'text-stone hover:text-ink',
                  )}
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-[length:var(--text-fluid-sm)]">{t.name}</span>
                    <span className="label shrink-0">{t.context.split(' — ')[1]}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
