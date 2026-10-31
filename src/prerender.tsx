/**
 * Build-time entry. vite-prerender-plugin calls `prerender()` once per route,
 * crawling links as it goes, and writes a real HTML file for each one.
 * Nothing here ships to the browser.
 */
import { StaticRouter } from 'react-router'
import App from './App'
import { metaFor } from './lib/seo'
import { site, seo } from './content'
import './styles.css'

export async function prerender(data: { url: string }) {
  const { renderToString } = await import('react-dom/server')
  const { parseLinks } = await import('vite-prerender-plugin/parse')

  const html = renderToString(
    <StaticRouter location={data.url}>
      <App />
    </StaticRouter>,
  )

  const m = metaFor(data.url)
  const elements = new Set<{ type: string; props: Record<string, string> }>([
    { type: 'meta', props: { name: 'description', content: m.description } },
    { type: 'link', props: { rel: 'canonical', href: m.canonical } },
    { type: 'meta', props: { property: 'og:type', content: 'website' } },
    { type: 'meta', props: { property: 'og:site_name', content: site.legalName } },
    { type: 'meta', props: { property: 'og:title', content: m.title } },
    { type: 'meta', props: { property: 'og:description', content: m.description } },
    { type: 'meta', props: { property: 'og:url', content: m.canonical } },
    { type: 'meta', props: { property: 'og:image', content: m.image } },
    { type: 'meta', props: { property: 'og:locale', content: 'en_US' } },
    { type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } },
    { type: 'meta', props: { name: 'twitter:title', content: m.title } },
    { type: 'meta', props: { name: 'twitter:description', content: m.description } },
    { type: 'meta', props: { name: 'twitter:image', content: m.image } },
    { type: 'meta', props: { name: 'robots', content: 'index, follow, max-image-preview:large' } },
    { type: 'meta', props: { name: 'author', content: site.legalName } },
    { type: 'meta', props: { name: 'geo.region', content: `US-${site.contact.address.state}` } },
    { type: 'meta', props: { name: 'geo.placename', content: site.contact.address.city } },
  ])

  if (seo.twitterHandle) {
    elements.add({ type: 'meta', props: { name: 'twitter:site', content: seo.twitterHandle } })
  }

  // Structured data: one script tag holding the full graph for this page.
  // `<` is escaped so a stray "</script>" in content can never break out.
  elements.add({
    type: 'script',
    props: {
      type: 'application/ld+json',
      children: JSON.stringify(m.jsonLd).replace(/</g, '\\u003c'),
    },
  })

  return {
    html,
    links: new Set(parseLinks(html)),
    head: { lang: 'en', title: m.title, elements },
  }
}
