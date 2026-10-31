import { useLayoutEffect, useEffect, useRef, type RefObject } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

/** useLayoutEffect on the client, useEffect during prerender (no DOM). */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Scope a GSAP context to an element. Everything created inside `fn` is
 * reverted automatically on unmount, which is what keeps ScrollTrigger from
 * leaking across client-side route changes.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  fn: (ctx: { self: T; gsap: typeof gsap }) => void,
  deps: unknown[] = [],
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useIsomorphicLayoutEffect(() => {
    const self = ref.current
    if (!self || prefersReducedMotion()) return
    const ctx = gsap.context(() => fn({ self, gsap }), self)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

/** Refresh ScrollTrigger once images and fonts have settled. */
export function useScrollTriggerRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    const t = window.setTimeout(refresh, 300)
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('load', refresh)
    }
  }, [])
}
