import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { SmoothScroll } from '@/lib/SmoothScroll'
import { useMeta } from '@/lib/useMeta'
import { useScrollTriggerRefresh } from '@/lib/useGsap'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { loadAnalytics } from '@/lib/analytics'

/** Full-bleed wipe that covers the old page and lifts off the new one. */
function PageTransition() {
  const el = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!el.current || prefersReducedMotion()) return
    gsap.fromTo(
      el.current,
      { scaleY: 1 },
      { scaleY: 0, duration: 0.8, ease: 'power4.inOut', transformOrigin: 'top' },
    )
  }, [pathname])

  return (
    <div
      ref={el}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] origin-top bg-ink"
      style={{ transform: 'scaleY(0)' }}
    />
  )
}

export function Layout({ children }: { children: ReactNode }) {
  useMeta()
  useScrollTriggerRefresh()

  useEffect(() => {
    loadAnalytics()
  }, [])

  return (
    <SmoothScroll>
      <Nav />
      <PageTransition />
      <main id="main">{children}</main>
      <Footer />
    </SmoothScroll>
  )
}
