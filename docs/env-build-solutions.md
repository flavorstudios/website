# Environment Validation Fix Guide

This document outlines practical steps to satisfy the environment validation that blocks `pnpm build`. The goal is to supply the required variables **without modifying application code**, preserving previous work.

## 1. Minimum Variable Set

Validation fails because the following variables are mandatory in [`env/server-validation.ts`](../env/server-validation.ts) and [`scripts/validate-env.ts`](../scripts/validate-env.ts):

| Scope | Variable | Purpose |
| --- | --- | --- |
| Server | `BASE_URL` | Absolute site URL used by API routes and redirects. |
| Shared | `NEXT_PUBLIC_BASE_URL` | Client-side URL companion for `BASE_URL`. |
| Server | `CRON_SECRET` | Authenticates scheduled API routes. |
| Server | `PREVIEW_SECRET` | Secures Next.js preview mode. |
| Shared | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Required for Firebase public config. |
| Server (paired) | `FIREBASE_STORAGE_BUCKET` | Must match the public bucket when provided. |

All values must be **non-empty strings**. Empty strings trigger the additional guards inside `scripts/validate-env.ts`.

## 2. Local Development Setup

Create `.env.local` (copy from [`env.example`](../env.example) if desired) and paste the minimal values:

```ini
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=dev-cron-secret
PREVIEW_SECRET=dev-preview-secret
FIREBASE_STORAGE_BUCKET=dev-example.appspot.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dev-example.appspot.com
```

Optional helpers:

- Set `SKIP_ENV_VALIDATION=true` if you need to bypass Firebase admin checks temporarily (for example, before real service account JSON is available). This flag is already respected by both validation modules.
- Provide the real Firebase config when available so local behaviour matches production.

## 3. Continuous Integration (GitHub Actions Example)

Add the six variables above as **repository-level secrets**. Then expose them to the build job. For example:

```yaml
# .github/workflows/build.yml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      BASE_URL: ${{ secrets.BASE_URL }}
      NEXT_PUBLIC_BASE_URL: ${{ secrets.NEXT_PUBLIC_BASE_URL }}
      CRON_SECRET: ${{ secrets.CRON_SECRET }}
      PREVIEW_SECRET: ${{ secrets.PREVIEW_SECRET }}
      FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm build
```

Tips:

- Populate the secrets with either production or staging values; they just need to be non-empty and consistent across server/client buckets.
- If the workflow only compiles the app (no Firebase admin calls), you may include `SKIP_ENV_VALIDATION: true` in the `env` block above. Keep validation enabled for deploy jobs to catch misconfiguration early.

## 4. Optional: Monorepo Scripts

If you use other tooling (e.g., Vercel CLI, Docker), ensure these variables flow through the respective environment configuration. For Docker, you can pass them via `--env-file` pointing to a production-safe file.

## 5. Verification Checklist

1. Ensure `.env.local` or CI secrets contain the six variables with non-empty values.
2. (Optional) Add `SKIP_ENV_VALIDATION=true` when you deliberately want to bypass admin checks.
3. Run `pnpm build`.
4. Confirm the command no longer throws `Invalid server environment variables`.

These steps satisfy the validators defined in the repository while keeping existing code untouched.