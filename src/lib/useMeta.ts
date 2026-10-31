import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metaFor } from './seo'

function setTag(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

/**
 * Keeps <title>, meta and JSON-LD in sync on client-side navigation.
 * The first render is already correct — the HTML was prerendered at build —
 * so this only matters once the router takes over.
 */
export function useMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const m = metaFor(pathname)
    document.title = m.title
    setTag('meta[name="description"]', { name: 'description', content: m.description })
    setTag('link[rel="canonical"]', { rel: 'canonical', href: m.canonical })
    setTag('meta[property="og:title"]', { property: 'og:title', content: m.title })
    setTag('meta[property="og:description"]', { property: 'og:description', content: m.description })
    setTag('meta[property="og:url"]', { property: 'og:url', content: m.canonical })
    setTag('meta[property="og:image"]', { property: 'og:image', content: m.image })

    const id = 'ld-json-route'
    document.getElementById(id)?.remove()
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.textContent = JSON.stringify(m.jsonLd)
    document.head.appendChild(script)
  }, [pathname])
}
