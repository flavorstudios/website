# Admin flag reference

This project exposes a small set of flags to coordinate E2E behavior without leaking synthetic data into production.

## `NEXT_PUBLIC_TEST_MODE`

* Only the literal value `1` enables test mode.
* `isTestMode()` enforces that the flag is ignored when `NODE_ENV === 'production'`.
* When active, the dashboard renders the legacy admin flows, hides Firebase login, and swaps the media library to its sample dataset.
* Leave the variable undefined in production (the build will fail if it is set) and only export it for local development or CI preview runs.

## `NEXT_PUBLIC_E2E`

* Still used by Playwright to remove animations and enable bypass flows.
* Unlike `NEXT_PUBLIC_TEST_MODE`, the flag has no production guard, so double-check environment variables before deploying.

## Server-side shortcuts

* `ADMIN_BYPASS` and `ADMIN_AUTH_DISABLED` remain server-only and should never be set in production.
* The cleanup script (`scripts/cleanupTestMedia.ts`) relies on authenticated Firebase Admin access and will refuse to run unless the configured project ID is allowlisted.

## Local checklist

1. Avoid committing `NEXT_PUBLIC_TEST_MODE` to production Vercel environments.
2. Prefer scoped `.env.local` files or CI-only exports when you need the flag.
3. Run the cleanup script after migrating off test mode to remove seeded media from production storage.