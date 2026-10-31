import { useEffect, useState } from 'react'

/**
 * Reports the label of the section currently filling most of the viewport.
 * Any element carrying `data-nav-label` takes part, so sections opt in with a
 * single attribute and the navigation needs no per-page configuration.
 */
export function useActiveSection(fallback: string) {
  const [label, setLabel] = useState(fallback)

  useEffect(() => {
    setLabel(fallback)
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-nav-label]'),
    )
    if (!nodes.length) return

    // Track ratios rather than reacting to each crossing: with tall sections
    // several are intersecting at once and only the dominant one should win.
    const ratios = new Map<Element, number>()

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target, e.intersectionRatio)
        let best: Element | null = null
        let bestRatio = 0
        for (const [el, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r
            best = el
          }
        }
        const next = best?.getAttribute('data-nav-label')
        setLabel(bestRatio > 0.12 && next ? next : fallback)
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    )

    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [fallback])

  return label
}
