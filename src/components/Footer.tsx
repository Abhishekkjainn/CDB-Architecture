import { Link } from 'react-router-dom'
import { site, projects } from '@/content'

export function Footer() {
  const year = new Date().getFullYear()
  const a = site.contact.address

  return (
    <footer className="bg-ink text-paper">
      <div className="container-page py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="display text-5xl leading-none">
              {site.name}
            </Link>
            <p className="mt-6 max-w-sm text-stone-light text-[length:var(--text-fluid-sm)]">
              {site.description}
            </p>
          </div>

          <nav className="md:col-span-2" aria-label="Footer">
            <h2 className="label text-stone mb-5">Studio</h2>
            <ul className="space-y-2.5 text-[length:var(--text-fluid-sm)]">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-stone-light transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label="Projects">
            <h2 className="label text-stone mb-5">Work</h2>
            <ul className="space-y-2.5 text-[length:var(--text-fluid-sm)]">
              {projects.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/work/${p.slug}`}
                    className="hover:text-stone-light transition-colors"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="label text-stone mb-5">Contact</h2>
            <address className="not-italic space-y-2.5 text-[length:var(--text-fluid-sm)]">
              <a href={`mailto:${site.contact.email}`} className="block hover:text-stone-light transition-colors">
                {site.contact.email}
              </a>
              <a href={`tel:${site.contact.phoneE164}`} className="block hover:text-stone-light transition-colors">
                {site.contact.phone}
              </a>
              <p className="text-stone-light">
                {a.street}
                <br />
                {a.city}, {a.state} {a.zip}
              </p>
            </address>
            <ul className="mt-6 flex gap-5">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label text-stone hover:text-paper transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Service areas — also what tells Google where we work. */}
        <div className="mt-16 pt-8 border-t border-line-dark">
          <h2 className="label text-stone mb-4">Serving</h2>
          <p className="text-stone-light text-[length:var(--text-fluid-sm)] max-w-4xl">
            {site.serviceAreas.join(' · ')}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between label text-stone">
          <p>
            &copy; {year} {site.legalName}. All rights reserved.
          </p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
