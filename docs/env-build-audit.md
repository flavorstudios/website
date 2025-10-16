# Environment Validation Build Failure Audit

## Summary
- **Build command**: `pnpm build`
- **Failure point**: Next.js build worker exits during environment validation.
- **Error message**: `Invalid environment variables\nCRON_SECRET: Required\nBASE_URL: Required`

The project runs `scripts/validate-env.ts` during the `prebuild` step. That script loads `.env.local`, applies the default fallback map from `env/defaults.ts`, and validates values with Zod schemas defined in `env/client-validation.ts` and `env/server-validation.ts`.

## Key Observations
1. When the build runs in CI (`NODE_ENV=production` and `CI=true`), the fallback helper only back-fills missing variables that are marked as safe for automated environments (see `FALLBACK_ENV` in `env/defaults.ts`).
2. `BASE_URL` and `CRON_SECRET` are required by `serverEnvSchema` in `env/server-validation.ts`.
3. These two variables are missing from the environment where `pnpm build` was executed, so the validation step aborts before Next.js can finish building.

## Recommended Remediations (choose one)
### Option A — Define explicit CI secrets (recommended for production parity)
1. In your hosting provider (e.g., GitHub Actions, Vercel, Netlify), create secrets for:
   - `BASE_URL` – the fully qualified site URL, e.g. `https://example.com`.
   - `CRON_SECRET` – the private token you expect your cron jobs to supply.
2. Expose those secrets to the build job (e.g., `echo "BASE_URL=$BASE_URL" >> $GITHUB_ENV`).
3. Re-run `pnpm build`. The validation should now pass because the required keys are populated.

### Option B — Provide a `.env.local` for local/CI builds
1. Create an `.env.local` file at the repo root with at least the following:
   ```bash
   BASE_URL=http://localhost:3000
   CRON_SECRET=local-dev-cron-secret
   ```
2. Ensure the file is available when the build runs (for CI, you can upload it as an artifact or template one during the workflow).
3. Rerun `pnpm build`.

### Option C — Temporarily allow fallbacks for automation (not advised for production)
1. Export `USE_DEFAULT_ENV=true` or `NODE_ENV=development` before running the build to allow the fallback defaults defined in `env/defaults.ts` to populate required keys.
2. This should only be used for non-production environments because it injects demo credentials (`demo-project` Firebase account, example admin email, etc.).

## Verification
After applying any of the options above, run:
```bash
pnpm build
```
The command should complete without the `Invalid environment variables` error when the required values are set.
