import { Fragment } from 'react'
import type { ElementType, ReactNode } from 'react'
import { useGsap } from '@/lib/useGsap'
import { ease, revealDuration } from '@/lib/gsap'
import { onEnter } from '@/lib/onEnter'
import { cn } from '@/lib/cn'

type RevealProps = {
  children: ReactNode
  className?: string
  as?: ElementType
  /** Seconds to wait after the element enters the viewport. */
  delay?: number
  /** Stagger between direct children. 0 animates the block as one. */
  stagger?: number
  /** Distance in px the element rises from. */
  y?: number
}

/**
 * The one reveal used across the whole site: a short rise and fade, triggered
 * once when the element enters the viewport. Keeping a single implementation
 * is what makes the scroll feel like one continuous system rather than a pile
 * of unrelated effects.
 */
export function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  stagger = 0,
  y = 28,
}: RevealProps) {
  const ref = useGsap<HTMLDivElement>(({ self, gsap }) =>
    onEnter(self, () => {
      const targets = stagger ? Array.from(self.children) : self
      if (stagger) gsap.set(self, { opacity: 1 })
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        { y: 0, opacity: 1, duration: revealDuration, ease, delay, stagger },
      )
    }),
  )

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  )
}

type MaskTextProps = {
  /** A single string, or one string per line if you want manual line breaks. */
  text: string | readonly string[]
  as?: ElementType
  className?: string
  delay?: number
  /** Stagger between words. Lower it for long headlines. */
  stagger?: number
}

/**
 * Headline animation: every word rises out from behind its own mask.
 * Word-level masking survives any line wrap, so it behaves identically at
 * 360px and 2560px without measuring anything.
 */
export function MaskText({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  stagger = 0.045,
}: MaskTextProps) {
  const lines: readonly string[] = typeof text === 'string' ? [text] : text

  const ref = useGsap<HTMLDivElement>(({ self, gsap }) =>
    onEnter(self, () => {
      const words = self.querySelectorAll('[data-reveal-word]')
      if (!words.length) return
      gsap.set(words, { yPercent: 115, opacity: 1 })
      gsap.to(words, {
        yPercent: 0,
        duration: 1.15,
        ease: 'power4.out',
        delay,
        stagger,
      })
    }),
  )

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line.split(' ').map((word, j) => (
            // Each word is followed by a real space rather than a right margin.
            // A margin looks the same but leaves no whitespace in the markup,
            // so the heading selects, copies and is read aloud as one run-on
            // word — and crawlers tokenise it that way too.
            <Fragment key={j}>
              {/* The mask needs enough height to clear ascenders and
                  descenders, but must still contribute exactly one line of
                  leading or wrapped lines overlap: extra leading in, the same
                  amount back out. */}
              <span className="inline-block overflow-hidden leading-[1.3] -my-[0.175em]">
                <span data-reveal-word className="inline-block">
                  {word}
                </span>
              </span>{' '}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  )
}

/**
 * Section heading used on every page — a small uppercase label with a rule,
 * then the title. One component so the rhythm never drifts between pages.
 */
export function SectionHeading({
  label,
  title,
  className,
  align = 'left',
}: {
  label?: string
  title: string | readonly string[]
  className?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {label && (
        <Reveal className="label text-stone mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          {label}
        </Reveal>
      )}
      <MaskText
        as="h2"
        text={title}
        className="display text-[length:var(--text-fluid-xl)] max-w-[22ch]"
      />
    </div>
  )
}
