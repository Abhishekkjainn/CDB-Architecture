/**
 * Post-build steps:
 *   1. Write dist/sitemap.xml and dist/robots.txt. Routes are read from the
 *      prerendered output, so adding a project to the content config is all it
 *      takes to get it indexed.
 *   2. Delete orphaned JavaScript chunks. The prerender entry pulls in
 *      react-dom/server and the plugin's HTML parser, which are build-time only
 *      — roughly 400 kB that nothing ever requests but which would otherwise be
 *      deployed.
 */
import {
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs'
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


/* ---------------------------------------------------------------------------
 * Prune unreachable chunks.
 *
 * Reachability is walked from the HTML rather than matched by filename: lazily
 * imported chunks (three.js, for one) are referenced only from inside other
 * JavaScript, and a name-based rule would happily delete them.
 * ------------------------------------------------------------------------- */
function pruneOrphanChunks() {
  const assetDir = join(dist, 'assets')
  let names
  try {
    names = readdirSync(assetDir)
  } catch {
    return
  }

  const js = new Set(names.filter((n) => n.endsWith('.js')))
  const html = []
  const collectHtml = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) collectHtml(full)
      else if (entry.endsWith('.html')) html.push(full)
    }
  }
  collectHtml(dist)

  // Seed from every chunk named in the prerendered pages.
  const reachable = new Set()
  const queue = []
  const seed = (text) => {
    for (const name of js) {
      if (text.includes(name) && !reachable.has(name)) {
        reachable.add(name)
        queue.push(name)
      }
    }
  }
  for (const page of html) seed(readFileSync(page, 'utf8'))

  // Then follow references from chunk to chunk.
  while (queue.length) {
    const current = queue.pop()
    seed(readFileSync(join(assetDir, current), 'utf8'))
  }

  const orphans = [...js].filter((n) => !reachable.has(n))
  let freed = 0
  for (const name of orphans) {
    const full = join(assetDir, name)
    freed += statSync(full).size
    unlinkSync(full)
  }

  if (orphans.length) {
    console.log(
      `pruned ${orphans.length} build-only chunk(s), ${Math.round(freed / 1024)} kB: ${orphans.join(', ')}`,
    )
  }
}

pruneOrphanChunks()
