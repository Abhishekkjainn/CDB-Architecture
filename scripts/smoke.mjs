/**
 * Renders every route through the real prerender entry and checks that each one
 * produced markup and a title. Catches render-time breakage in seconds, without
 * waiting for a full production build.
 *
 *   npm run smoke
 */
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
})

let failed = 0
try {
  const mod = await server.ssrLoadModule('/src/prerender.tsx')
  const { projects } = await server.ssrLoadModule('/src/content/index.ts')
  const routes = [
    '/',
    '/work',
    '/about',
    '/contact',
    '/404',
    ...projects.map((p) => `/work/${p.slug}`),
  ]

  for (const url of routes) {
    try {
      const out = await mod.prerender({ url })
      const html = out.html ?? ''
      const title = out.head?.title ?? ''
      // Thin markup means the route rendered empty rather than erroring.
      const ok = html.length > 2000 && title.length > 10
      if (!ok) failed++
      console.log(
        `${ok ? 'ok  ' : 'FAIL'} ${url.padEnd(28)} html=${String(html.length).padStart(6)}  "${title.slice(0, 52)}"`,
      )
    } catch (e) {
      failed++
      console.log(`FAIL ${url} -> ${String(e.message).split('\n')[0]}`)
    }
  }
} finally {
  await server.close()
}

console.log(failed ? `\n${failed} route(s) failed` : '\nall routes rendered')
process.exit(failed ? 1 : 0)
