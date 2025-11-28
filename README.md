# Flavor Studios Website

This is the official website of **Flavor Studios** | Your source for Anime News & Original Stories That Inspire.

> New to this project? Jump straight to the [Quick Start](#quick-start).

---

## Quick Start

1. Copy the example environment file:

   ```bash
   cp env.example .env.local
   ```

2. Set the required environment variables in `.env.local` (the build fails fast when any are missing):

   | Scope | Variable(s) | Purpose |
   | ----- | ----------- | ------- |
   | Server | `BASE_URL` | Canonical site origin used by RSS, webhooks, and metadata helpers. |
   | Client | `NEXT_PUBLIC_BASE_URL` | Exposes the canonical origin to the app router. |
   | Client | `NEXT_PUBLIC_API_BASE_URL` | Points server components and client fetchers to the Cloud Run backend. |
   | Server | `CRON_SECRET` | Shared secret for scheduled job routes. |
   | Server | `PREVIEW_SECRET` | Protects unpublished preview routes. |
   | Server | `ADMIN_JWT_SECRET` | Signs and verifies password-based admin sessions. |
    | Server | `FIREBASE_SERVICE_ACCOUNT_KEY` **or** `FIREBASE_SERVICE_ACCOUNT_JSON` | Loads Firebase Admin credentials; provide exactly one. |
   | Server | `FIREBASE_STORAGE_BUCKET` | Primary Cloud Storage bucket (must match the public bucket). |
   | Client | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public bucket used by client SDKs; must equal the server value. |
   | Server | `ADMIN_EMAILS` **or** `ADMIN_EMAIL` | Allowed admin login addresses (comma-separated). |

   Optional public keys (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) remain optional but should be filled for production deployments.

---

## Features

- Lightning-fast, SEO-optimized Next.js site
- Full PWA (Progressive Web App) support: offline, installable, works across mobile & desktop
- Clean, modern UI with custom animations and accessibility
- Anime news, original videos, blog, and more

## Standalone backend & deployment

The `backend/` folder hosts a lightweight Express server that exposes the shared `GET /posts` endpoint used by the web app.

1. Install dependencies and build the shared package:

   ```bash
   pnpm install
   pnpm --filter @website/shared run build
   pnpm --dir backend run build
   ```

2. Containerize the backend with the provided multi-stage Dockerfile:

   ```bash
   docker build -t gcr.io/<project>/next-backend -f Dockerfile .
   ```

3. Deploy to Cloud Run (replace `<project>` and `<region>` with your values):

   ```bash
   gcloud builds submit --tag gcr.io/<project>/next-backend
   gcloud run deploy next-backend \
     --image gcr.io/<project>/next-backend \
     --region=<region> \
     --allow-unauthenticated
   ```

4. Expose the URL via `NEXT_PUBLIC_API_BASE_URL` in Vercel (or your hosting provider) so that every fetch to `/posts` is routed through Cloud Run.
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

This project requires **Node.js 22**. The root `.nvmrc` pins the version locally and `vercel.json` ensures Vercel builds on Node 22.x.

1. **Clone the repo:**
   ```bash
   git clone https://github.com/flavorstudios/flavorstudios-website.git
   cd flavorstudios-website
   ```

2. **Set up your environment and install dependencies:**

   ```bash
   cp .env.local.example .env.local  # create local env file (ignored by Git)
   pnpm install  # or `npm install`
   ```

   > Server-only variables (no `NEXT_PUBLIC_` prefix) stay on the server, while `NEXT_PUBLIC_*` variables are exposed to the client bundle. Both live together in `.env.local`, and `.env.local.example` lists the expected keys.

3. **Common development scripts:**

   ```bash
   pnpm dev             # start the local development server
   pnpm lint            # run eslint checks
   pnpm test:unit       # run Jest unit/integration tests (e.g. validate session)
   pnpm test:functions  # run Firebase Functions tests in Node
   pnpm e2e             # run end-to-end Playwright tests (admin dashboard login). Installs browsers and builds automatically.
   pnpm build           # create an optimized production build
   pnpm start           # run the production server
   ```

> Tip: set `SKIP_ENV_VALIDATION=true` or `ADMIN_BYPASS=true` to bypass the
> Firebase Admin env check when admin features aren't needed. This also
> disables cron features that rely on `CRON_SECRET`.

### End-to-end testing workflow

- `pnpm dev:test` spins up the production build with the CI-friendly configuration used by Playwright. It disables Firebase Admin and applies deterministic admin fixtures.
- `pnpm e2e --project=chromium-light` runs the Playwright suite against the running server. Pass `--headed` to observe the run locally.
- Use `pnpm exec playwright show-trace <path-to-trace.zip>` to inspect artifacts generated from CI failures.
- When iterating on a single spec, run `pnpm e2e e2e/admin-dashboard-blog-fallback.e2e.spec.ts --project=chromium-light` to avoid rebuilding every time.

To run a single test file:

pnpm test:unit -- __tests__/validate-session.test.ts
pnpm e2e e2e/admin-dashboard-auth.e2e.spec.ts  # build + start the production server automatically
> For tests that access Firestore or Storage emulators (e.g. `__tests__/storage.rules.test.ts`), start the emulators and set `FIRESTORE_EMULATOR_HOST` and `FIREBASE_STORAGE_EMULATOR_HOST` (defaults `127.0.0.1:8080` and `127.0.0.1:9199`) before running `pnpm test:unit`.
Firebase configuration
Firebase powers features like authentication and Firestore. The client SDK
requires several environment variables, all of which must be present in your
.env.local (for local development) or your hosting platform's environment
settings:
In production these values are provided via Vercel, and any `.env*`
files are git-ignored so they can't override the deployed configuration. Use
`.env.local.example` as a template for local development:

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
Use `.env.local.example` as a reference for the correct variable names and structure.

### Firebase Admin configuration (server only)

To use admin-only features (e.g., the dashboard or preview pages) in production,
you must also supply Firebase Admin credentials:

`FIREBASE_SERVICE_ACCOUNT_KEY` – service account JSON as a single-line string. `FIREBASE_SERVICE_ACCOUNT_JSON` may be used instead; only one is required.
- `FIREBASE_STORAGE_BUCKET` – must match the client `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`.
- `ADMIN_EMAIL` or `ADMIN_EMAILS` – comma-separated list of allowed admin logins.
`ADMIN_API_KEY` (optional) – server-only key for programmatic access to `/api/admin/*` routes. Browser requests rely on session cookies and do **not** require an API key.

Without these variables the Firebase Admin SDK remains disabled, and preview pages
will show a friendly message instead of crashing.

If these admin features aren't needed (for example in CI), set
`SKIP_ENV_VALIDATION=true` or `ADMIN_BYPASS=true` to skip the service-account
environment check during build. Cron features are disabled when validation is
skipped.

`pnpm build` runs `scripts/validate-env.ts` to verify this configuration. The build
fails unless either `FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_SERVICE_ACCOUNT_JSON`
is set and `FIREBASE_STORAGE_BUCKET` matches `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`.

Add them to `.env.local`, for example:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"project_id":"my-project","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@my-project.iam.gserviceaccount.com"}'
FIREBASE_STORAGE_BUCKET=my-project.appspot.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
```

### CI deployment

Create a Google Cloud service account with access to your Firebase project and save
its JSON key in a CI secret named `FIREBASE_SERVICE_ACCOUNT`.

In your GitHub Actions workflow, write the secret to a file and point
`GOOGLE_APPLICATION_CREDENTIALS` at it so Firebase commands can authenticate:

```yaml
env:
  GOOGLE_APPLICATION_CREDENTIALS: ${{ runner.temp }}/firebase-service-account.json

steps:
  - name: Write Firebase service account key
    run: |
      cat <<'EOF' > "$GOOGLE_APPLICATION_CREDENTIALS"
      ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
      EOF
```   

Firebase CLI commands then pick up the credentials automatically:

```bash
firebase deploy
firebase projects:list # optional validation
```

Cookie Consent Banner

The CookieYes banner loads on all pages by default.

---

### Autosave pipeline

The admin blog editor now uses a dedicated autosave pipeline. Drafts are saved through `/api/admin/blog/drafts` with optimistic concurrency and persisted in IndexedDB while offline. A small status chip near the save button reflects states such as "Saving…", "Saved", "Offline" or "Sync failed" and banners clear once a sync succeeds.

`/api/admin/blog/drafts` requires an active admin session. When developing locally, either sign in with an authorized admin account or set `ADMIN_BYPASS=true` in your environment to skip authentication. Without authorization the chip shows **Sync failed**.


## Cron Jobs

Authenticated cron endpoints keep cache and feeds fresh.

### Environment variables

- `CRON_SECRET` – shared bearer token used to authenticate requests.
- `BASE_URL` – full URL (including protocol) pointing at the deployed site so scheduled functions can call back into the app.

See [.env.local.example](.env.local.example) for other related settings.

### Jobs
| Job | Endpoint | Schedule | Code |
| --- | --- | --- | --- |
| Revalidate | `POST /api/cron/revalidate` | every 60 minutes | [`app/api/cron/revalidate/route.ts`](app/api/cron/revalidate/route.ts) |
| Build sitemap | `POST /api/internal/build-sitemap` | 02:00 Asia/Kolkata daily | [`app/api/internal/build-sitemap/route.ts`](app/api/internal/build-sitemap/route.ts) |
| Build RSS | `POST /api/internal/build-rss` | 02:00 Asia/Kolkata daily | [`app/api/internal/build-rss/route.ts`](app/api/internal/build-rss/route.ts) |
| Analytics rollup | `POST /api/internal/analytics-rollup` | 02:30 Asia/Kolkata daily | [`app/api/internal/analytics-rollup/route.ts`](app/api/internal/analytics-rollup/route.ts) |
| Backup | `POST /api/internal/backup` | 03:00 Asia/Kolkata daily | [`app/api/internal/backup/route.ts`](app/api/internal/backup/route.ts) |

### Backup configuration
`POST /api/internal/backup` writes artifacts to the directory specified by `BACKUP_DIR` and
uses credentials from `GOOGLE_APPLICATION_CREDENTIALS` for privileged exports. Ensure
`BACKUP_DIR` is writable and the service account JSON exists before running the job.

### Hosting schedules

Cron schedules are defined in [`functions/src/scheduler.ts`](functions/src/scheduler.ts). Adjust the cron strings there to change cadence. If deploying on Vercel, configure matching Vercel Cron Jobs hitting the same routes.

### Secret rotation

Update `CRON_SECRET` in your host's env settings and redeploy. Rotate regularly and update local `.env.local` files as needed.

### Local testing
Run `pnpm test:cron` to send signed requests to each endpoint, or `pnpm test tests/cron.spec.ts` for Jest coverage.

### Troubleshooting

401 errors usually mean a missing or mismatched `CRON_SECRET`. For Cloud Scheduler, check Cloud Function logs; for Vercel Cron Jobs, inspect deployment logs and ensure the secret is configured.

### Cron logging

Each cron job writes an entry to the Firestore `cronLog` collection with fields `{ job, ok, durationMs, error?, timestamp }` for basic monitoring. Logs older than 30 days are trimmed by a scheduled cleanup job (configurable via `CRON_LOG_RETENTION_DAYS`).

To view recent log entries locally:

```bash
pnpm cron:logs
```

The script [`scripts/query-cron-logs.ts`](scripts/query-cron-logs.ts) requires Firebase Admin credentials in your environment. Logs can also be viewed in the Firebase console under **Firestore → cronLog**.
