import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

/** Programmatic scrolling that respects Lenis when it is running. */
export function scrollTo(target: string | number, offset = 0) {
  if (lenis) lenis.scrollTo(target, { offset })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}

/**
 * Lenis smooth scroll, driven by GSAP's ticker so that ScrollTrigger and the
 * scroll position never disagree. Disabled entirely under reduce-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  useEffect(() => {
    if (prefersReducedMotion()) return

    lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      // Native momentum on touch devices feels better than an emulated one.
      syncTouch: false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  // New route starts at the top, and ScrollTrigger re-measures the new DOM.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(t)
  }, [pathname])

  return <>{children}</>
}
