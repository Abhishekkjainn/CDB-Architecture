/**
 * POST /api/contact — receives an enquiry and notifies the studio.
 *
 * Runs as a serverless function (Vercel/Netlify pick up this folder with no
 * configuration). The static site itself stays a pure front end; this is the
 * only server-side code in the project.
 *
 * The enquiry itself is recorded in the Google Sheet by the browser, directly
 * against SheetDB (see src/lib/sheet.ts) — this endpoint only sends the alerts,
 * because their access tokens cannot be shipped to a browser. It is optional:
 * without it the form still works, you just do not get notified.
 *
 * Channels, each enabled only if its env vars are present:
 *   - WhatsApp via the Meta Cloud API  (WHATSAPP_* below)
 *   - Email via Resend                 (RESEND_API_KEY, NOTIFY_EMAIL)
 * With none configured the enquiry is logged and still returns 200, so the
 * form works from the first deploy.
 *
 * Required env for WhatsApp:
 *   WHATSAPP_TOKEN            Permanent access token for the WhatsApp app
 *   WHATSAPP_PHONE_NUMBER_ID  Sender's phone number ID from Meta
 *   WHATSAPP_TO               Recipient in E.164, no '+', e.g. 15125550184
 *   WHATSAPP_TEMPLATE         Approved template name (see note below)
 *
 * Note: Meta only allows free-form WhatsApp messages inside a 24-hour window
 * after the recipient last messaged the business. For an unprompted
 * notification you need an approved message template; set WHATSAPP_TEMPLATE to
 * its name. Without it this sends a plain text message, which Meta will reject
 * outside that window.
 */

type Payload = Record<string, string | number | undefined>

const FIELDS = [
  'name',
  'email',
  'phone',
  'location',
  'projectType',
  'budget',
  'message',
] as const

const clean = (v: unknown, max = 2000) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)

function buildSummary(data: Record<string, string>) {
  const lines = [
    `New enquiry from ${data.name}`,
    data.source && `Form: ${data.source}`,
    data.location && `Location: ${data.location}`,
    data.projectType && `Type: ${data.projectType}`,
    data.budget && `Budget: ${data.budget}`,
    `Email: ${data.email}`,
    data.phone && `Phone: ${data.phone}`,
    '',
    data.message,
  ].filter(Boolean)
  return lines.join('\n')
}

async function sendWhatsApp(summary: string, data: Record<string, string>) {
  const token = process.env.WHATSAPP_TOKEN
  const from = process.env.WHATSAPP_PHONE_NUMBER_ID
  const to = process.env.WHATSAPP_TO
  if (!token || !from || !to) return { skipped: 'whatsapp' }

  const template = process.env.WHATSAPP_TEMPLATE
  const body = template
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: data.name },
                { type: 'text', text: data.location || 'Not given' },
                { type: 'text', text: data.projectType || 'Not given' },
                { type: 'text', text: data.email },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { preview_url: false, body: summary.slice(0, 4000) },
      }

  const res = await fetch(`https://graph.facebook.com/v21.0/${from}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${await res.text()}`)
  return { sent: 'whatsapp' }
}

async function sendEmail(summary: string, data: Record<string, string>) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.NOTIFY_EMAIL
  if (!key || !to) return { skipped: 'email' }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM || 'CDB Website <onboarding@resend.dev>',
      to: [to],
      reply_to: data.email,
      subject: `Enquiry — ${data.name}${data.location ? ` (${data.location})` : ''}`,
      text: summary,
    }),
  })

  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
  return { sent: 'email' }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let payload: Payload
  try {
    payload = (await req.json()) as Payload
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot and submit-speed checks. Both are silent: a bot gets a 200 and
  // learns nothing, which stops the retry loop.
  const trap = clean(payload.company)
  const elapsed = Number(payload.elapsedMs ?? 0)
  if (trap || (elapsed > 0 && elapsed < 2000)) {
    return Response.json({ ok: true })
  }

  const data: Record<string, string> = {}
  for (const f of FIELDS) data[f] = clean(payload[f], f === 'message' ? 4000 : 200)
  data.source = clean(payload.source, 80)

  if (!data.name || !data.message || !isEmail(data.email!)) {
    return Response.json({ error: 'Missing or invalid fields' }, { status: 422 })
  }

  const summary = buildSummary(data)

  const results = await Promise.allSettled([
    sendWhatsApp(summary, data),
    sendEmail(summary, data),
  ])

  const failures = results.filter((r) => r.status === 'rejected')
  const delivered = results.some(
    (r) => r.status === 'fulfilled' && 'sent' in r.value,
  )

  if (failures.length) {
    for (const f of failures) console.error('[contact]', (f as PromiseRejectedResult).reason)
  }

  // Nothing configured yet: log it so the enquiry is not lost, and still
  // report success to the visitor.
  if (!delivered && !failures.length) {
    console.log('[contact] no destination configured. Enquiry:\n' + summary)
  }

  if (!delivered && failures.length) {
    return Response.json({ error: 'Delivery failed' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
