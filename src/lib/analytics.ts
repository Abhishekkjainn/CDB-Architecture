import { analytics } from '@/content'

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void
    }
  }
}

const SCRIPT_ID = 'umami-tracker'

function enabled() {
  if (typeof window === 'undefined') return false
  if (!analytics.websiteId) return false
  return !(analytics.ignoreHosts as readonly string[]).includes(window.location.hostname)
}

/**
 * Loads the analytics tracker once.
 *
 * The tracker follows History API navigation on its own, so client-side route
 * changes are counted without anything further from us.
 */
export function loadAnalytics() {
  if (!enabled() || document.getElementById(SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.defer = true
  script.src = analytics.scriptUrl
  script.dataset.websiteId = analytics.websiteId
  document.head.appendChild(script)
}

/**
 * Record a custom event, e.g. a submitted enquiry.
 *
 * A no-op when analytics is unconfigured or the tracker was blocked, so call
 * sites never need to guard it and an ad blocker can never break a form.
 */
export function track(name: string, data?: Record<string, unknown>) {
  if (!enabled()) return
  try {
    window.umami?.track(name, data)
  } catch {
    // Analytics must never interfere with the thing being measured.
  }
}
