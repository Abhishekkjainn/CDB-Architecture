import { sheet } from '@/content'

/** The shape the form collects, before it becomes a spreadsheet row. */
export type Enquiry = Record<string, string | undefined>

/**
 * "01 Nov 2026, 3:42 PM CT" — readable at a glance in a spreadsheet cell, and
 * in the studio's timezone rather than whatever the visitor's device is set to,
 * which is what matters when you are deciding whether it is too late to call.
 */
function stamp(date = new Date()) {
  const text = new Intl.DateTimeFormat('en-GB', {
    timeZone: sheet.timezone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  return `${text} ${sheet.timezoneLabel}`
}

/**
 * Append an enquiry to the Google Sheet.
 *
 * Posted straight from the browser: SheetDB answers with
 * `Access-Control-Allow-Origin: *`, so no server of our own sits in between and
 * the form behaves identically in development and in production.
 *
 * Throws on failure, so the form can show the fallback email address rather
 * than telling someone their enquiry was received when it was not.
 */
export async function sendEnquiry(data: Enquiry, source: string) {
  const row = {
    submitted_at: stamp(),
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    location: data.location ?? '',
    project_type: data.projectType ?? '',
    budget: data.budget ?? '',
    message: data.message ?? '',
    call_status: sheet.initialCallStatus,
    notes: '',
    source,
  }

  const res = await fetch(sheet.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // SheetDB takes { data: [ ...rows ] } and answers 201 { created: n }.
    body: JSON.stringify({ data: [row] }),
  })

  if (!res.ok) {
    throw new Error(`SheetDB ${res.status}: ${await res.text().catch(() => '')}`)
  }

  return res.json() as Promise<{ created: number }>
}

/**
 * Ask the studio's notification function to send a WhatsApp or email alert.
 *
 * Entirely optional and deliberately not awaited: the enquiry is already safe
 * in the sheet by this point, and the tokens these notifications need cannot
 * live in the browser, so this only does anything once deployed somewhere that
 * runs /api/contact. A 404 locally is expected and harmless.
 */
export function notifyStudio(data: Enquiry, source: string) {
  void fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, source, elapsedMs: 10_000 }),
    keepalive: true,
  }).catch(() => {
    // Nothing to do: the row is recorded either way.
  })
}
