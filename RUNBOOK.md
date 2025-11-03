# Admin Operations Runbook

## Required environment variables

| Variable | Purpose | Where to configure |
| --- | --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_SERVICE_ACCOUNT_JSON` | Initializes Firebase Admin SDK for auth, Firestore, and Storage. | Vercel project settings (Production / Preview) and `.env.local` for local development. |
| `FIREBASE_STORAGE_BUCKET` and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Ensures Storage uploads and signed URLs point at the same bucket. | Vercel & `.env.local`. |
| `ADMIN_EMAILS` (preferred) or `ADMIN_EMAIL` | Seeds the initial allowlist used until custom claims are applied. | Vercel & `.env.local`. |
| `ADMIN_JWT_SECRET` | Required for the legacy session fallback; keep set even if unused so builds pass. | Vercel & `.env.local`. |
| `ADMIN_SESSION_EXPIRY_DAYS` | Controls cookie lifetime (defaults to 1 day). | Optional; Vercel & `.env.local`. |
| `NEXT_PUBLIC_ENABLE_LEGACY_ADMIN_LOGIN` | Exposes the env-based login toggle when you intentionally enable it. Defaults to `false`. | `.env.local` only; avoid enabling in production. |
| `ADMIN_BYPASS` | Global kill switch for admin auth. Must be `true` to allow the legacy env password; keep `false` otherwise. | `.env.local` (temporary enablement only). |

> Tip: run `pnpm exec tsx scripts/validate-env.ts` after editing `.env.local` to confirm the configuration.

## Adding or removing an admin

1. **Confirm prerequisites**
   - Verify the user already exists in Firebase Auth (create them via `/admin/signup` or the Firebase console).
   - Ensure you have a local `.env.local` with service-account credentials loaded (see above).
2. **Grant admin or editor access**
   ```bash
   pnpm exec tsx scripts/admin-claims.ts grant user@example.com admin
   # or for a limited editor role
   pnpm exec tsx scripts/admin-claims.ts grant editor@example.com editor
   ```
   - The script sets custom claims (`admin`, `role`, and `roles`), writes to `admin_users`, and syncs the `/roles/{uid}` document.
3. **Revoke access**
   ```bash
   pnpm exec tsx scripts/admin-claims.ts revoke user@example.com
   ```
   - Removes Firestore records and resets claims to `support`.
4. **Audit**
   ```bash
   pnpm exec tsx scripts/admin-claims.ts list
   ```
   - Prints the Firestore admin directory plus Firebase users with an admin claim.

## Migrating off the legacy env password

1. Keep `NEXT_PUBLIC_ENABLE_LEGACY_ADMIN_LOGIN=false` and `ADMIN_BYPASS=false` in production.
2. For staged rollouts, temporarily enable both flags in `.env.local` only, test the legacy flow, then revert.
3. Monitor logs for `legacy-admin-login:used` breadcrumbs; any occurrence indicates fallback usage.
4. Remove `ADMIN_PASSWORD_HASH` once all operators authenticate via Firebase.

## Local development

```bash
pnpm install
pnpm exec tsx scripts/validate-env.ts   # loads defaults, checks for missing secrets
pnpm dev                                 # start Next.js dev server
```

- To bypass auth entirely for component work, set `ADMIN_BYPASS=true` in `.env.local`.
- For end-to-end tests, run `pnpm e2e --project=chromium-light --max-failures=1 --reporter=list` (server must be running via `pnpm e2e:serve`).

## Build, test, deploy checklist

```bash
pnpm typecheck
pnpm lint
pnpm test            # Jest projects
pnpm test:rules      # Firestore security & admin-claims helpers (requires emulator/Java)
pnpm e2e --project=chromium-light --max-failures=1 --reporter=list
pnpm build
```

- Push changes and verify Vercel preview builds succeed before promoting to production.
- Deploy with `vercel deploy --prod` once tests are green.

## Incident response

- A surge of `legacy-admin-login:blocked` breadcrumbs implies users attempted the disabled env password. Confirm claims are correct with the `list` command above and communicate the migration plan.
- Unauthorized attempts are logged to `admin_audit_logs` (see `/api/admin/google-session` and `lib/admin-auth`). Export the collection via Firebase console if you need to share evidence with security.