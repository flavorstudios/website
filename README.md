# Flavor Studios Website

This is the official website of **Flavor Studios** — your source for Anime News & Original Stories That Inspire.

---

## Features

- Lightning-fast, SEO-optimized Next.js site
- Full PWA (Progressive Web App) support: offline, installable, works across mobile & desktop
- Clean, modern UI with custom animations and accessibility
- Anime news, original videos, blog, and more
- Built with OCD-level organization and best coding practices

---
## Theme

Light and dark modes are managed with [`next-themes`](https://github.com/pacocoursey/next-themes).
The provider lives in `components/theme-provider.tsx` and a single toggle button
is rendered in the admin dashboard header (`components/theme-toggle.tsx`).
The chosen theme is saved in `localStorage` and falls back to the system
preference on first visit.

---

## Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/flavorstudios/flavorstudios-website.git
   cd flavorstudios-website
Set up your environment and install dependencies:

bash
Copy
Edit
cp .env.example .env.local  # create local env file (ignored by Git)
pnpm install  # or `npm install`
Common development scripts:

bash
Copy
Edit
pnpm dev    # start the local development server
pnpm lint   # run eslint checks
pnpm test   # run Jest unit/integration tests (e.g. validate session)
pnpm exec playwright install  # install Playwright browsers before running e2e tests
pnpm e2e    # run end-to-end Playwright tests (admin dashboard login)
pnpm build  # create an optimized production build
pnpm start  # run the production server

To run a single test file:

pnpm test tests/validate-session.spec.ts
pnpm exec playwright install  # install Playwright browsers before running e2e tests
pnpm e2e tests/admin-dashboard-auth.spec.ts
Firebase configuration
Firebase powers features like authentication and Firestore. The client SDK
requires several environment variables, all of which must be present in your
.env.local (for local development) or your hosting platform's environment
settings:
In production these values are provided via Vercel, and any `.env*`
files are git-ignored so they can't override the deployed configuration. Use
`.env.example` as a template for local development:

NEXT_PUBLIC_FIREBASE_API_KEY

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

NEXT_PUBLIC_FIREBASE_PROJECT_ID

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

NEXT_PUBLIC_FIREBASE_APP_ID

If any of these are missing at runtime, Firebase will not initialize and you'll
see an error similar to:

scss
Copy
Edit
[Firebase] Missing Firebase environment variable(s): NEXT_PUBLIC_FIREBASE_API_KEY, ...
Use `.env.example` as a reference for the correct variable names and structure.

### Firebase Admin configuration (server only)

To use admin-only features (e.g., the dashboard or preview pages) in production,
you must also supply Firebase Admin credentials:

- `FIREBASE_SERVICE_ACCOUNT_KEY` – service account JSON as a single-line string.
- `FIREBASE_STORAGE_BUCKET` – must match the client `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`.
- `ADMIN_EMAIL` or `ADMIN_EMAILS` – comma-separated list of allowed admin logins.

Without these variables the Firebase Admin SDK remains disabled, and preview pages
will show a friendly message instead of crashing.

Cookie Consent Banner

The CookieYes banner loads on all pages by default.

---

### Autosave pipeline

The admin blog editor now uses a dedicated autosave pipeline. Drafts are saved through `/api/admin/blog/drafts` with optimistic concurrency and persisted in IndexedDB while offline. A small status chip near the save button reflects states such as "Saving…", "Saved", "Offline" or "Sync failed" and banners clear once a sync succeeds.

`/api/admin/blog/drafts` requires an active admin session. When developing locally, either sign in with an authorized admin account or set `ADMIN_BYPASS=true` in your environment to skip authentication. Without authorization the chip shows **Sync failed**.

