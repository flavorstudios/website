# Next.js Build Failure Audit — Missing `BASE_URL` and `CRON_SECRET`

## What failed
- **Command**: `pnpm build`
- **Failure stage**: Next.js build worker exits while validating required environment variables.
- **Observed error**: `Invalid environment variables` with `CRON_SECRET: Required` and `BASE_URL: Required`.

During the `prebuild` step the project runs `scripts/validate-env.ts`. That script loads `.env.local`, applies fallback values via `applyDefaultEnv`, and validates the merged environment using the server schema in `env/server-validation.ts`.【F:scripts/validate-env.ts†L1-L74】【F:env/server-validation.ts†L1-L64】 The schema marks both `BASE_URL` and `CRON_SECRET` as required strings, so the build stops when either key is missing.【F:env/server-validation.ts†L4-L13】

## Why the defaults did not rescue the build
`applyDefaultEnv` defines demo-friendly defaults for `BASE_URL`, `CRON_SECRET`, and related keys when running in CI, development, or tests.【F:env/defaults.ts†L20-L66】 However, those values only exist in the Node.js process that calls `applyDefaultEnv`. The subsequent `next build` command runs in a fresh process where the variables are still empty, so Next.js fails the validation despite the earlier fallback log message.

## Remediation options (choose one)
1. **Set real CI secrets (best for production):** Configure your CI or hosting provider to export `BASE_URL` (e.g., `https://example.com`) and a secure `CRON_SECRET` before invoking `pnpm build`. This keeps the build aligned with production expectations.
2. **Check in a development `.env.local`:** Provide a repository-safe `.env.local` template (or generate one during CI) containing non-sensitive placeholders for `BASE_URL` and `CRON_SECRET`. Ensure the file is present whenever builds run.
3. **Opt-in to defaults for automated runs:** If you intentionally rely on the fallback demo values, propagate them to the build by setting `USE_DEFAULT_ENV=true` (or `CI=false`) on the same command, for example `USE_DEFAULT_ENV=true pnpm build`. That forces the defaults to be applied inside the `next build` process as well.

## Validation step
After applying one of the options above, rerun:
```bash
pnpm build
```
The command should now complete without the missing environment variable error as the schema requirements will be satisfied.【F:env/server-validation.ts†L4-L13】