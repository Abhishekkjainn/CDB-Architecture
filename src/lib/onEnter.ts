/**
 * Run a callback once, when an element first appears on screen.
 *
 * Entrance reveals used to hang off ScrollTrigger, which exists to scrub
 * animations against scroll position and has to measure the document to do it.
 * When that measurement was off, the trigger never fired and the content it was
 * meant to reveal stayed hidden for good. IntersectionObserver has no
 * measurement step, fires immediately for anything already on screen, and is
 * the right primitive for a one-shot entrance.
 */
export function onEnter(el: Element, cb: () => void) {
  if (typeof IntersectionObserver === 'undefined') {
    cb()
    return () => {}
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      cb()
    },
    // Starts slightly before the element is fully in view, so the reveal is
    // already underway by the time the reader reaches it.
    { threshold: 0.01, rootMargin: '0px 0px -6% 0px' },
  )

  io.observe(el)
  return () => io.disconnect()
}
