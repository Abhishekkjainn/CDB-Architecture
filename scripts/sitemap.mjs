/**
 * Writes dist/sitemap.xml and dist/robots.txt after the build.
 * Routes come straight from src/content, so adding a project to projects.ts is
 * all it takes to get it indexed.
 */
import { writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
const SITE = process.env.SITE_URL || readSiteUrl()

/** Read the canonical origin out of the content config so there is one source
 *  of truth. Override with SITE_URL in CI if you need a staging origin. */
function readSiteUrl() {
  const m = readFileSync('src/content.config.ts', 'utf8').match(/url:\s*'([^']+)'/)
  return m ? m[1] : 'https://example.com'
}

/** Every prerendered index.html in dist becomes a URL. */
function routes(dir = dist, base = '') {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...routes(full, `${base}/${entry}`))
    else if (entry === 'index.html') out.push(base === '' ? '/' : base)
  }
  return out
}

const priority = (r) => (r === '/' ? '1.0' : r === '/work' || r === '/contact' ? '0.9' : '0.7')

const urls = routes()
  .filter((r) => r !== '/404')
  .sort()
  .map(
    (r) => `  <url>
    <loc>${SITE}${r === '/' ? '/' : r}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority(r)}</priority>
  </url>`,
  )
  .join('\n')

writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
)

writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
)

console.log(`sitemap.xml — ${routes().length - 1} routes`)
