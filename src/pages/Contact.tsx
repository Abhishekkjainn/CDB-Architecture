import { about, contact, faq, site } from '@/content'
import { ContactForm } from '@/components/ContactForm'
import { Reveal, MaskText } from '@/components/Reveal'
import { Image } from '@/components/Image'

export default function Contact() {
  return (
    <>
      <header className="container-page pt-32 md:pt-48 pb-12">
        <Reveal className="label text-stone mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          {contact.eyebrow}
        </Reveal>
        <MaskText
          as="h1"
          text={contact.title}
          className="display text-[length:var(--text-fluid-2xl)]"
        />
        <Reveal as="p" className="mt-8 max-w-2xl text-stone">
          {contact.lede}
        </Reveal>
      </header>

      <div className="container-page grid gap-14 pb-20 md:grid-cols-12 md:pb-28">
        <div className="md:col-span-7">
          <ContactForm />
        </div>

        <aside className="md:col-span-4 md:col-start-9">
          <dl className="divide-y divide-line border-y border-line">
            {contact.details.map((d) => (
              <div key={d.label} className="py-4">
                <dt className="label text-stone">{d.label}</dt>
                <dd className="mt-1 text-[length:var(--text-fluid-sm)] whitespace-pre-line">
                  {d.href ? (
                    <a href={d.href} className="underline-offset-[6px] hover:underline">
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10">
            <Image
              src={about.closing.image}
              alt={about.closing.imageAlt}
              ratio="4 / 5"
              width={900}
              sizes="(max-width: 768px) 100vw, 30vw"
            />
          </div>

          <h2 className="label text-stone mt-10 mb-4">Where we work</h2>
          <p className="text-stone text-[length:var(--text-fluid-sm)]">
            {site.serviceAreas.join(' · ')}
          </p>
        </aside>
      </div>

      {/* FAQ — native <details>, so it works before JavaScript loads and is
          what Google reads for the FAQ rich result. */}
      <section className="border-t border-line">
        <div className="container-page py-20 md:py-28">
          <Reveal className="label text-stone mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-line" aria-hidden="true" />
            {contact.faqTitle}
          </Reveal>
          <MaskText
            as="h2"
            text="Questions we are asked before every project."
            className="display text-[length:var(--text-fluid-xl)] max-w-[16ch]"
          />

          <div className="mt-12 grid gap-x-16 lg:grid-cols-2">
            {faq.map((f) => (
              <details key={f.q} className="group border-b border-line py-5">
                <summary className="flex cursor-pointer items-start justify-between gap-6 list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[length:var(--text-fluid-sm)] font-medium">{f.q}</h3>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-stone transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-10 text-stone text-[length:var(--text-fluid-sm)]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
