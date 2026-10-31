import {
  site,
  seo,
  faq,
  projects,
  testimonials,
  getProject,
  averageRating,
} from '@/content'
import { img } from '@/lib/img'

export type Meta = {
  title: string
  description: string
  canonical: string
  image: string
  /** JSON-LD objects to embed on the page. */
  jsonLd: unknown[]
}

const abs = (p: string) => new URL(p, site.url).toString()

/** The organisation node — referenced by every other schema via @id. */
const orgId = site.url + '/#organization'

function organizationSchema() {
  const a = site.contact.address
  return {
    '@context': 'https://schema.org',
    '@type': ['ArchitecturalService', 'LocalBusiness'],
    '@id': orgId,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    foundingDate: String(site.founded),
    email: site.contact.email,
    telephone: site.contact.phoneE164,
    image: abs(seo.ogImage),
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.zip,
      addressCountry: a.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.contact.geo.lat,
      longitude: site.contact.geo.lng,
    },
    areaServed: site.serviceAreas.map((name) => ({ '@type': 'Place', name })),
    sameAs: site.social.map((s) => s.href),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: testimonials.length,
      bestRating: 5,
    },
    review: testimonials.map((t) => ({
      '@type': 'Review',
      reviewBody: t.quote,
      datePublished: t.date,
      author: { '@type': 'Person', name: t.name },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: t.rating,
        bestRating: 5,
      },
    })),
  }
}

function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  }
}

function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/** Resolve title/description/canonical/JSON-LD for any pathname. */
export function metaFor(pathname: string): Meta {
  const path = pathname !== '/' ? pathname.replace(/\/+$/, '') || '/' : '/'
  const canonical = abs(path)
  const image = abs(seo.ogImage)

  // Project detail pages.
  const slug = path.startsWith('/work/') ? path.slice('/work/'.length) : null
  const project = slug ? getProject(slug) : undefined
  if (project) {
    const cover = img(project.cover, { w: 1200, h: 630 })
    return {
      title: `${project.title}, ${project.location} — CDB Architecture`,
      description: project.summary.slice(0, 158),
      canonical,
      image: cover,
      jsonLd: [
        organizationSchema(),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name: project.title, path: path },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: project.title,
          description: project.summary,
          image: cover,
          datePublished: `${project.year}-01-01`,
          author: { '@id': orgId },
          publisher: { '@id': orgId },
          mainEntityOfPage: canonical,
          about: {
            '@type': 'Residence',
            name: project.title,
            address: project.location,
          },
        },
      ],
    }
  }

  const page = seo.pages[path as keyof typeof seo.pages] as
    | { title: string; description: string }
    | undefined
  if (!page) {
    return {
      title: seo.pages['/404'].title,
      description: seo.pages['/404'].description,
      canonical,
      image,
      jsonLd: [organizationSchema()],
    }
  }

  const jsonLd: unknown[] = [organizationSchema()]

  if (path === '/') {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.legalName,
      url: site.url,
      publisher: { '@id': orgId },
    })
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Selected projects',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: abs(`/work/${p.slug}`),
        name: p.title,
      })),
    })
  }
  if (path === '/contact') jsonLd.push(faqSchema())
  if (path !== '/') {
    jsonLd.push(
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: page.title.split(' — ')[0]!, path },
      ]),
    )
  }

  return { title: page.title, description: page.description, canonical, image, jsonLd }
}

/** Every URL in the site, for the sitemap. */
export const allRoutes = [
  '/',
  '/work',
  '/about',
  '/contact',
  ...projects.map((p) => `/work/${p.slug}`),
]
