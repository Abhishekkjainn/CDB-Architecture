# CDB — Architecture & Interiors

Static marketing site. React + Vite, prerendered to real HTML at build time so
every page is indexable without JavaScript.

## Editing the site

**`src/content.config.ts` is the only file you need.** Text, images, projects,
reviews, SEO, form fields, analytics and the enquiry sheet all live there, in
eleven numbered sections. Edit, commit, push — the deploy rebuilds.

## Commands

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Local dev server                                           |
| `npm run build`   | Typecheck, bundle, prerender every route, write sitemap    |
| `npm run preview` | Serve the built site                                       |
| `npm run smoke`   | Render every route and check it produced markup and a title |
| `npm run lint`    | Lint                                                       |

## How the contact form works

1. The browser appends a row to the Google Sheet through SheetDB, stamped with
   the time and flagged `pending`. No server involved — see section 11 of the
   content config for the one-time sheet setup.
2. It then pings `/api/contact`, which sends the WhatsApp or email alert. That
   function is optional; its tokens cannot live in a browser, so it only runs
   once deployed. See `.env.example`.

If step 1 fails the visitor is shown the studio email address instead, rather
than being told the enquiry was received.

## Analytics

Section 10 of the content config. Paste an Umami Cloud website ID and deploy;
with it empty, nothing is loaded or tracked.

## Deploying

Any static host. The `api/` folder is picked up automatically by Vercel and
Netlify; on a host without functions the site still works, minus the alerts.

Set the production origin in `site.url` (section 1) before deploying — canonical
URLs, the sitemap and Open Graph tags are all built from it.
