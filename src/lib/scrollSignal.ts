import { gsap } from './gsap'

type Listener = (progress: number) => void

const listeners = new Set<Listener>()
let last = -1
let running = false

function read() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  // Only notify on real change, but never debounce or defer: subscribers paint
  // on the same frame as the scroll itself.
  if (Math.abs(p - last) > 0.0004) {
    last = p
    for (const fn of listeners) fn(p)
  }
}

/**
 * Document scroll progress, delivered every frame from GSAP's ticker — the
 * same clock that drives Lenis and ScrollTrigger, so a subscriber can never
 * be a frame behind the scroll position.
 *
 * Subscribers write to the DOM directly. Routing this through React state is
 * what made the progress ring trail the scroll.
 */
export function onScrollProgress(fn: Listener) {
  listeners.add(fn)
  fn(last < 0 ? 0 : last)

  if (!running) {
    running = true
    gsap.ticker.add(read)
  }

  return () => {
    listeners.delete(fn)
    if (!listeners.size) {
      gsap.ticker.remove(read)
      running = false
    }
  }
}
