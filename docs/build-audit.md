# Build Failure Audit: Missing Server Environment Variables

## Summary of Failure
During `pnpm build`, the Next.js compilation phase aborts with `Invalid environment variables` errors for `CRON_SECRET` and `BASE_URL`. The error is thrown by `lib/env.ts`, which validates runtime configuration and terminates the process when required variables are absent in production builds. 【F:lib/env.ts†L1-L41】

Although the prebuild script applies fallback values when running in CI, those defaults only modify the environment of the validation process. When Next.js spawns workers for the production build, `lib/env.ts` executes without the fallbacks, so `process.env.CRON_SECRET` and `process.env.BASE_URL` are still undefined and the build fails. 【F:scripts/validate-env.ts†L1-L55】【F:lib/env.ts†L1-L41】

## Root Causes
1. **Strict validation in `lib/env.ts`:** The module terminates the process if `CRON_SECRET` or `BASE_URL` are missing. 【F:lib/env.ts†L1-L41】
2. **Fallback scope limited to the prebuild script:** `scripts/validate-env.ts` calls `applyDefaultEnv`, but those defaults are not re-applied inside the Next.js build workers where `lib/env.ts` runs. 【F:scripts/validate-env.ts†L1-L27】

## Recommended Solutions
The following approaches preserve the existing validation logic while ensuring builds succeed:

1. **Provide real secrets in CI:** Update the build pipeline (e.g., GitHub Actions, Vercel, or your deployment platform) to inject `CRON_SECRET` and `BASE_URL`. This is the safest option for production because it keeps validation intact.

2. **Opt-in to defaults for builds:** If real secrets are not available in CI, set `USE_DEFAULT_ENV=true` (or `CI=false`) before invoking `pnpm build` so that `applyDefaultEnv` runs in the same process as Next.js. You can do this by prefixing the command: `USE_DEFAULT_ENV=true pnpm build`.

3. **Load defaults within `lib/env.ts`:** Import and execute `applyDefaultEnv` at the top of `lib/env.ts` before validating the schema. This ensures the same fallback values are available in every process that consumes the module.

4. **Skip validation when appropriate:** As a last resort for non-production builds, export `SKIP_ENV_VALIDATION=true` or `ADMIN_BYPASS=true` in CI so that both the prebuild script and `lib/env.ts` bypass the strict checks. This should only be used when you understand the risks, because it suppresses real misconfiguration errors.

## Next Steps
Choose the solution that best fits your deployment workflow. Option 1 is recommended for production reliability; Option 3 is a code-level safeguard; Options 2 and 4 are temporary mitigations when secrets cannot be provided. Document the chosen approach in your deployment configuration to prevent recurring build failures.