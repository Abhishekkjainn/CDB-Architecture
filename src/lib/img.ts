/**
 * Image URL helpers. These are code, not content — the pictures themselves all
 * live in the IMAGES section of src/content.config.ts.
 */

type ImgOpts = { w?: number; h?: number; q?: number }

/** Build a sized image URL. Local paths (/img/x.jpg) are returned as-is. */
export function img(src: string, { w = 1600, h, q = 78 }: ImgOpts = {}) {
  if (!src.startsWith('http')) return src
  const p = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    w: String(w),
    q: String(q),
  })
  if (h) p.set('h', String(h))
  return src + '?' + p.toString()
}

/** Low-quality placeholder used for the blur-up transition. */
export function imgBlur(src: string) {
  if (!src.startsWith('http')) return undefined
  return src + '?auto=format&fit=crop&w=24&q=20&blur=40'
}
