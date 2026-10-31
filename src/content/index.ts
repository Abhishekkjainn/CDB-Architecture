/**
 * The import surface for everything editable.
 *
 * All content lives in one file — src/content.config.ts. This module only
 * re-exports it and adds the handful of values derived from it, so components
 * can `import { projects, site } from '@/content'` without caring which.
 */
export * from '../content.config'

import { projects } from '../content.config'
import { testimonials } from '../content.config'

/** Projects flagged `featured: true`, for the homepage carousel. */
export const featuredProjects = projects.filter((p) => p.featured)

/** Filter options on the work index, in the order the projects define them. */
export const projectCategories = [
  'All',
  ...Array.from(new Set(projects.map((p) => p.category))),
]

export const getProject = (slug?: string) => projects.find((p) => p.slug === slug)

/** Average star rating, used in the reviews summary and structured data. */
export const averageRating =
  Math.round(
    (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length) * 10,
  ) / 10

export { img, imgBlur } from '../lib/img'
