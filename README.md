# CDB — Architecture & Interiors

React + Vite single-page site.

## Editing the site

**`src/content.config.ts` is the only file you need.** Text, images, projects,
reviews, SEO copy, form fields and the enquiry sheet all live there, in numbered
sections. Edit, commit, push — Vercel rebuilds.

## Commands

| Command           | What it does        |
| ----------------- | ------------------- |
| `npm run dev`     | Local dev server    |
| `npm run build`   | Build to `dist/`    |
| `npm run preview` | Serve the build     |
| `npm run typecheck` | TypeScript check  |
| `npm run lint`    | Lint                |

## Deploying

Vercel auto-detects Vite. `vercel.json` only adds the single-page rewrite, so a
deep link like `/work/canyon-ridge-residence` serves `index.html` instead of a
404.

## Contact form

The browser appends a row to the Google Sheet through SheetDB — no server
needed. See section 11 of the content config for the one-time sheet setup
(the header row must exist or submissions fail).

`api/contact.ts` is optional: it sends a WhatsApp/email alert when the
corresponding environment variables are set. Without them the form still
records every enquiry to the sheet.
