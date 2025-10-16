# Environment Validation Audit

## Summary of Failure
Running `pnpm build` executes [`scripts/validate-env.ts`](../scripts/validate-env.ts), which loads `.env.local` and validates required variables through [`env/server-validation.ts`](../env/server-validation.ts). The build failed because several required server-side variables were undefined in the execution environment, triggering the guard that throws an `Invalid server environment variables` error.

The failing variables were:

- `BASE_URL`
- `NEXT_PUBLIC_BASE_URL`
- `CRON_SECRET`
- `PREVIEW_SECRET`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

## Root Causes
1. **No `.env.local` loaded in CI** – The validator calls `dotenv` with `path: ".env.local"`. If the file is absent in CI (which is typical), the required variables remain undefined, causing the validation error. [`serverEnvSchema`](../env/server-validation.ts) marks these fields as mandatory, so they must be supplied by the runtime environment.
2. **CI does not inject minimal secrets for validation** – The GitHub Action relied on defaults, but the validator explicitly refuses empty strings for `CRON_SECRET` and `PREVIEW_SECRET`, and the Firebase storage bucket must be present on both server and client configurations. Without overrides, validation aborts before the build starts.

## Recommended Remediations
To preserve existing code, provide the missing configuration through environment management instead of code changes.

### Local / Developer Machines
1. Copy [`env.example`](../env.example) to `.env.local`.
2. Populate at least the five required variables with non-empty dummy values:
   ```ini
   BASE_URL=http://localhost:3000
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   CRON_SECRET=local-dev-secret
   PREVIEW_SECRET=local-preview-secret
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dev-example.appspot.com
   FIREBASE_STORAGE_BUCKET=dev-example.appspot.com
   ```
3. If Firebase admin functionality is not needed locally, you can leave the remaining secrets blank. The validator only enforces that *one* of `FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_SERVICE_ACCOUNT_JSON` is supplied when validation is not skipped. For local smoke tests, set `SKIP_ENV_VALIDATION=true` in `.env.local` to bypass the Firebase requirement.

### Continuous Integration
1. **Add required secrets to the pipeline** – Define the five variables (plus `FIREBASE_STORAGE_BUCKET` so the client/server buckets match) as CI secrets. For GitHub Actions, add them under the repository’s *Settings → Secrets and variables → Actions* panel.
2. **Consider a validation bypass for build-only jobs** – If the build job does not exercise Firebase or cron endpoints, set the `SKIP_ENV_VALIDATION` secret to `true` before running `pnpm build`. This leverages the existing `skipValidation` flag in the validator while keeping production deployments strict.
3. **Keep secrets non-empty** – The validator rejects empty strings, so ensure the CI secrets are actual values (even dummy placeholders in non-production contexts).

### Optional Hardening
- Mirror `NEXT_PUBLIC_BASE_URL` into CI using the Vercel-provided `VERCEL_URL` fallback logic by exporting `VERCEL_ENV`/`VERCEL_URL` before the build. This allows staging builds to pick up fully qualified URLs automatically.
- Document the minimal required secret set in your deployment README so future contributors know which variables are mandatory for a successful build.

## Verification Plan
After supplying the environment variables (or enabling `SKIP_ENV_VALIDATION` for non-production builds), rerun:
```bash
pnpm build
```
The build should progress past `scripts/validate-env.ts` without throwing `Invalid server environment variables`.
