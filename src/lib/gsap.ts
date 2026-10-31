import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* Registered once, on the client only. Imported by every animated component. */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }

/** Honour the OS "reduce motion" setting — all animations check this. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Shared easing + timing so every reveal on the site feels like one system. */
export const ease = 'power3.out'
export const revealDuration = 1.1
