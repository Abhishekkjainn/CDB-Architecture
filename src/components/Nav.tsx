import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { site, projects } from '@/content'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { useActiveSection } from '@/lib/useActiveSection'
import { onScrollProgress } from '@/lib/scrollSignal'
import { cn } from '@/lib/cn'

/* The island's resting pill height. Also exported as --nav-h in styles.css so
 * sticky offsets elsewhere stay in agreement with it. */
const PILL = 52

/** What the collapsed island says when no section has claimed the viewport. */
function pageLabel(pathname: string) {
  if (pathname === '/') return 'Home'
  if (pathname === '/work') return 'Selected Work'
  if (pathname === '/about') return 'The Studio'
  if (pathname === '/contact') return 'Start a Project'
  const project = projects.find((p) => pathname === `/work/${p.slug}`)
  return project ? project.title : 'Not Found'
}

/**
 * Ring that fills with reading progress. It subscribes to the scroll ticker and
 * writes `strokeDashoffset` straight onto the node — no React state and no CSS
 * transition, both of which left it visibly trailing the scroll.
 */
function ProgressRing() {
  const arc = useRef<SVGCircleElement>(null)
  const r = 9
  const c = 2 * Math.PI * r

  useEffect(
    () =>
      onScrollProgress((p) => {
        if (arc.current) arc.current.style.strokeDashoffset = String(c * (1 - p))
      }),
    [c],
  )

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-90" aria-hidden="true">
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15" />
      <circle
        ref={arc}
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c}
        className="text-white/85"
      />
    </svg>
  )
}

/** Label that slides out and back in whenever the text changes. */
function MorphLabel({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const previous = useRef(text)

  useEffect(() => {
    if (previous.current === text) return
    previous.current = text
    if (!ref.current || prefersReducedMotion()) return
    gsap.fromTo(
      ref.current,
      { yPercent: 55, opacity: 0, filter: 'blur(3px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' },
    )
  }, [text])

  return (
    <span className="block overflow-hidden">
      <span ref={ref} className="block whitespace-nowrap">
        {text}
      </span>
    </span>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const label = useActiveSection(pageLabel(pathname))

  const shell = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const firstPaint = useRef(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  // Close on Escape, on an outside click, and as soon as the page scrolls —
  // the island should never be left hanging open over content.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (!shell.current?.contains(e.target as Node)) setOpen(false)
    }
    const onScroll = () => setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])

  /* The morph. Height and width are tweened to measured pixel values rather
   * than to `auto`, so the easing curve is honest and nothing jumps on the
   * final frame. Only this element animates its box; everything inside it
   * moves on transform and opacity alone. */
  useLayoutEffect(() => {
    const el = shell.current
    const body = panel.current
    if (!el || !body) return

    const rowH = row.current?.offsetHeight ?? PILL
    const expandedH = rowH + body.scrollHeight
    const expandedW = Math.min(window.innerWidth - 32, 380)
    const collapsedW = row.current?.scrollWidth ?? 280

    // First paint is set, not animated: there is nothing to animate from.
    if (prefersReducedMotion() || firstPaint.current) {
      firstPaint.current = false
      gsap.set(el, {
        height: open ? expandedH : rowH,
        width: open ? expandedW : collapsedW,
      })
      gsap.set(body, { opacity: open ? 1 : 0 })
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

    if (open) {
      tl.to(el, { width: expandedW, duration: 0.5 }, 0)
        .to(el, { height: expandedH, duration: 0.62 }, 0.04)
        .to(body, { opacity: 1, duration: 0.3, ease: 'none' }, 0.12)
        .fromTo(
          body.querySelectorAll('[data-island-item]'),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.045 },
          0.14,
        )
    } else {
      tl.to(body, { opacity: 0, duration: 0.18, ease: 'none' }, 0)
        .to(el, { height: rowH, duration: 0.5, ease: 'expo.inOut' }, 0)
        .to(el, { width: collapsedW, duration: 0.55 }, 0.06)
    }

    return () => {
      tl.kill()
    }
    // Only the open state drives the morph. Label changes resize the collapsed
    // pill through the observer below, which is a width tween on its own.
  }, [open])

  // Keep the collapsed width honest when the label text or viewport changes.
  useEffect(() => {
    if (open) return
    const el = shell.current
    const r = row.current
    if (!el || !r) return
    const sync = () => {
      if (!open) gsap.to(el, { width: r.scrollWidth, duration: 0.45, ease: 'expo.out' })
    }
    const ro = new ResizeObserver(sync)
    ro.observe(r)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [open])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper label"
      >
        Skip to content
      </a>

      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-4">
        <div
          ref={shell}
          className={cn(
            'pointer-events-auto relative overflow-hidden rounded-[26px] border border-white/15 bg-[#0c0b0a]/88 text-paper',
            'shadow-[0_18px_50px_-18px_rgba(0,0,0,0.75)] backdrop-blur-xl backdrop-saturate-150',
            'transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-out-expo)]',
            scrolled && !open && 'border-white/25 scale-[0.975]',
          )}
          style={{ height: PILL }}
        >
          {/* Collapsed row — always mounted, always the island's top edge. */}
          <div
            ref={row}
            className="flex h-[52px] w-max items-center gap-3 pl-4 pr-2.5 sm:gap-4 sm:pl-5"
          >
            <Link
              to="/"
              className="display text-xl leading-none tracking-tight"
              aria-label={`${site.legalName} — home`}
            >
              {site.name}
            </Link>

            <span className="h-4 w-px shrink-0 bg-white/20" aria-hidden="true" />

            <div className="label min-w-0 max-w-[34vw] text-white/75 sm:max-w-[22ch]">
              <MorphLabel text={label} />
            </div>

            <span className="hidden text-white/60 sm:block">
              <ProgressRing />
            </span>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="island-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="group relative ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 transition-colors duration-300 hover:border-white/40"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={cn(
                    'absolute left-0 block h-px w-4 bg-paper transition-transform duration-500 ease-[var(--ease-out-expo)]',
                    open ? 'top-1.5 rotate-45' : 'top-0.5',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 block h-px w-4 bg-paper transition-transform duration-500 ease-[var(--ease-out-expo)]',
                    open ? 'top-1.5 -rotate-45' : 'top-2.5',
                  )}
                />
              </span>
            </button>
          </div>

          {/* Expanded sheet — clipped by the shell until the morph runs. */}
          <div
            id="island-menu"
            ref={panel}
            className="px-4 pb-4 opacity-0 sm:px-5"
            aria-hidden={!open}
          >
            <nav aria-label="Primary">
              <ul>
                {site.nav.map((item) => {
                  const current = pathname === item.href
                  return (
                    <li key={item.href} data-island-item>
                      <Link
                        to={item.href}
                        tabIndex={open ? 0 : -1}
                        onClick={(e) => {
                          e.preventDefault()
                          setOpen(false)
                          // Let the island begin closing before the route swaps.
                          window.setTimeout(() => navigate(item.href), 160)
                        }}
                        className={cn(
                          'group flex items-baseline justify-between gap-6 border-t border-white/10 py-3',
                          current ? 'text-paper' : 'text-white/65 hover:text-paper',
                        )}
                      >
                        <span className="display text-[1.6rem] leading-none">{item.label}</span>
                        <span
                          aria-hidden="true"
                          className="label text-white/35 transition-transform duration-300 group-hover:translate-x-0.5"
                        >
                          {current ? 'Current' : '→'}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div
              data-island-item
              className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-3"
            >
              <a
                href={`tel:${site.contact.phoneE164}`}
                tabIndex={open ? 0 : -1}
                className="label text-white/60 transition-colors hover:text-paper"
              >
                {site.contact.phone}
              </a>
              <Link
                to="/contact"
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  window.setTimeout(() => navigate('/contact'), 160)
                }}
                className="label rounded-full bg-paper px-4 py-2 text-ink transition-colors hover:bg-white"
              >
                Enquire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
