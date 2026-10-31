import { useRef, useState, type FormEvent } from 'react'
import { analytics, contact, type Field } from '@/content'
import { track } from '@/lib/analytics'
import { sendEnquiry, notifyStudio } from '@/lib/sheet'
import { cn } from '@/lib/cn'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/** Light sits on paper, dark sits on the ink sections. Same markup either way. */
export type Tone = 'light' | 'dark'

const tones: Record<Tone, { input: string; label: string; button: string; muted: string }> = {
  light: {
    input: 'border-line focus:border-ink placeholder:text-stone-light',
    label: 'text-stone',
    button: 'border-ink bg-ink text-paper hover:bg-ink-soft',
    muted: 'text-stone',
  },
  dark: {
    input:
      'border-white/20 text-paper focus:border-paper placeholder:text-white/35 [color-scheme:dark]',
    label: 'text-white/50',
    button: 'border-paper bg-paper text-ink hover:bg-white',
    muted: 'text-white/50',
  },
}

const inputBase =
  'w-full border-b bg-transparent py-3 text-[length:var(--text-fluid-sm)] outline-none transition-colors duration-300'

function Control({
  field,
  invalid,
  tone,
  idPrefix,
}: {
  field: Field
  invalid: boolean
  tone: Tone
  idPrefix: string
}) {
  const t = tones[tone]
  const id = `${idPrefix}-${field.name}`
  const common = {
    id,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder,
    'aria-invalid': invalid || undefined,
    className: cn(inputBase, t.input, invalid && 'border-accent'),
  }

  return (
    <div className={cn(field.half ? 'md:col-span-1' : 'md:col-span-2')}>
      <label htmlFor={id} className={cn('label mb-1 block', t.label)}>
        {field.label}
        {field.required && <span className="text-accent"> *</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea {...common} rows={5} className={cn(common.className, 'resize-y')} />
      ) : field.type === 'select' ? (
        <select {...common} defaultValue="">
          <option value="" disabled>
            Select&hellip;
          </option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={field.type}
          autoComplete={
            field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'on'
          }
        />
      )}
    </div>
  )
}

type FormProps = {
  /** Field names to render, in order. Defaults to the full set from content. */
  only?: readonly string[]
  tone?: Tone
  submitLabel?: string
  /** Distinguishes input ids when two forms share a page. */
  idPrefix?: string
  className?: string
}

export function ContactForm({
  only,
  tone = 'light',
  submitLabel = contact.submitLabel,
  idPrefix = 'f',
  className,
}: FormProps = {}) {
  const [status, setStatus] = useState<Status>('idle')
  const [invalid, setInvalid] = useState<string[]>([])
  const mountedAt = useRef(Date.now())
  const started = useRef(false)
  const t = tones[tone]

  /** Counted once per form, so the dashboard shows starts against completions. */
  const onFirstInput = () => {
    if (started.current) return
    started.current = true
    track(analytics.events.enquiryStarted, { form: idPrefix })
  }

  const fields: Field[] = only
    ? (only
        .map((name) => contact.fields.find((f) => f.name === name))
        .filter(Boolean) as Field[])
    : [...contact.fields]

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    // Client-side validation mirrors the server; the server is the one that counts.
    const missing = fields
      .filter((f) => f.required && !data[f.name]?.trim())
      .map((f) => f.name)
    if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email)) {
      missing.push('email')
    }
    setInvalid(missing)
    if (missing.length) {
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus()
      return
    }

    // Bots fill the hidden field, and nobody completes this form in under two
    // seconds. Both checks are client-side now that there is no server in the
    // path, so they deter rather than prevent — see the note in the config.
    const trap = (data.company ?? '').trim()
    const tooFast = Date.now() - mountedAt.current < 2000
    if (trap || tooFast) {
      // Report success and discard: a bot that sees an error simply retries.
      setStatus('sent')
      form.reset()
      return
    }

    setStatus('sending')
    const source = `${idPrefix}:${window.location.pathname}`

    try {
      await sendEnquiry(data, source)
      setStatus('sent')
      form.reset()
      // The enquiry is recorded by this point; the alert is a courtesy on top.
      notifyStudio(data, source)
      track(analytics.events.enquirySent, {
        form: idPrefix,
        projectType: data.projectType,
        budget: data.budget,
      })
    } catch {
      setStatus('error')
      track(analytics.events.enquiryFailed, { form: idPrefix })
    }
  }

  if (status === 'sent') {
    return (
      <div
        className={cn(
          'border p-8 md:p-12',
          tone === 'dark' ? 'border-white/20' : 'border-line',
          className,
        )}
        role="status"
      >
        <h3 className="display text-[length:var(--text-fluid-lg)]">
          {contact.successTitle}
        </h3>
        <p className={cn('mt-4 max-w-md', t.muted)}>{contact.successBody}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="label mt-8 underline underline-offset-[6px]"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      onInput={onFirstInput}
      noValidate
      className={cn('grid gap-x-8 gap-y-7 md:grid-cols-2', className)}
    >
      {fields.map((f) => (
        <Control
          key={f.name}
          field={f}
          tone={tone}
          idPrefix={idPrefix}
          invalid={invalid.includes(f.name)}
        />
      ))}

      {/* Honeypot: real people never see it, bots fill it in. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${idPrefix}-company`}>Company</label>
        <input id={`${idPrefix}-company`} name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="md:col-span-2 flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === 'sending'}
          className={cn(
            'label inline-flex items-center gap-3 border px-7 py-4 transition-colors duration-300 disabled:opacity-50',
            t.button,
          )}
        >
          {status === 'sending' ? 'Sending…' : submitLabel}
          <span aria-hidden="true">&#8594;</span>
        </button>
        <p className={cn('label max-w-xs', t.muted)}>{contact.consent}</p>
      </div>

      {invalid.length > 0 && (
        <p className="md:col-span-2 label text-accent" role="alert">
          Please complete the highlighted fields.
        </p>
      )}
      {status === 'error' && (
        <p className="md:col-span-2 label text-accent" role="alert">
          {contact.errorBody}
        </p>
      )}
    </form>
  )
}
