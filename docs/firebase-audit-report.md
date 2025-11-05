# Firebase + Next.js Audit (April 2025)

## Executive summary
- Missing Firebase client envs currently crash `/admin/login`; new guard now surfaces a descriptive error and prevents duplicate initialisation. 
- Admin layout now blocks rendering during auth handshakes to avoid flashing protected dashboards to unauthenticated users.
- Storage rules previously trusted only `role`/`isAdmin`; expanded checks now align with Firestore claims and enforce a 20 MB upload ceiling.
- Push notification button now lazy-loads the Messaging SDK, trimming the default admin bundle and eliminating unused Firebase namespaces.
- Project-wide env templates were misaligned across docs; refreshed `.env.example` and new `.env.local.example` keep local and Vercel configuration in sync.
- Added regression tests for Firebase bootstrap and middleware routing to catch env and session regressions early.
- Vercel configuration documented for Development/Preview/Production along with CLI commands to guarantee deploy parity.

### Plan
- **Today:** Configure the Firebase env variables locally/Vercel using the new templates and rerun `pnpm env:check --strict` to confirm.
- **Next:** Roll out the auth provider and messaging changes, then execute `pnpm test:unit` to validate middleware/Firebase coverage.
- **Later:** Backfill remaining e2e coverage for login redirect flows and implement rate-limiter monitoring based on the outlined security recommendations.

## Root cause and fix for the env error
- `/admin/login` imports the client Firebase SDK via `lib/firebase.ts`. When required `NEXT_PUBLIC_FIREBASE_*` vars are unset, the old implementation silently stored an error and returned `undefined`, producing an opaque runtime failure.
- `lib/firebase.ts` now performs a hard guard: missing keys trigger a descriptive `[Firebase] Missing env: … → …` error, de-duplicate app initialisation, and ensure the module only runs in the browser. 【F:lib/firebase.ts†L1-L104】
- `lib/firebase-client-env.ts` emits the exact helper message used site-wide so logs and UI stay consistent. 【F:lib/firebase-client-env.ts†L35-L42】

### Environment templates
- `.env.example` and the new `.env.local.example` expose blank placeholders for all Firebase public/private keys so local dev mirrors Vercel. 【F:env.example†L73-L108】【F:.env.local.example†L1-L24】
- Keep measurement ID/VAPID optional; Storage bucket must match on client and server to satisfy deploy checks.

### Vercel environment variables
| Variable | Development | Preview | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key | Same as prod or staging key | Production key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `<project>.firebaseapp.com` | Same | Production |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Same | Production |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `<project>.appspot.com` | Same | Production |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | Same | Production |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client App ID | Same | Production |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web Push VAPID public key | Same | Production |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Analytics ID | Optional | Production if Analytics enabled |
| `FIREBASE_STORAGE_BUCKET` | Matches `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same | Production |
| `FIREBASE_SERVICE_ACCOUNT_KEY` *or* `_JSON`/`_JSON_B64` | Local SA JSON | Staging SA | Production SA |
| `ADMIN_JWT_SECRET` | Dev secret | Rotate per stage | Production secret |
| `ADMIN_EMAILS`/`ADMIN_EMAIL` | Allowed admins | Stage admins | Prod admins |

Vercel CLI commands:
```
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_FIREBASE_VAPID_KEY
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
vercel env add FIREBASE_STORAGE_BUCKET
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
vercel env add ADMIN_JWT_SECRET
vercel env add ADMIN_EMAILS
```

## Auth and route protection
- Middleware still enforces cookies for `/admin/*` but now tests cover redirect behaviour. `components/AdminAuthProvider` holds back guarded pages until Firebase confirms the session or verification passes, eliminating the flash of dashboard content. 【F:components/AdminAuthProvider.tsx†L174-L206】
- Sessions remain server-only: cookies are validated via Firebase Admin/JWT on API routes; no secrets leak to the browser.
- No Firebase Admin SDK imports occur in client components; the SDK lives in `lib/firebase-admin.ts` (server-only, unchanged).

## Security review
- **Secrets in repo:** No production secrets committed; env templates now blank. Confirmed there are no concrete keys in `public/`, `firebase/`, or git history for this branch.
- **Firestore rules:** Already locked to admin claims. Recommend adding rate-limit logging using `request.time` + Cloud Functions (future work).
- **Storage rules:** Hardened to reuse the same admin-claim logic as Firestore and cap uploads at 20 MB. 【F:storage.rules†L11-L32】
- **API hardening:** Middleware tests confirm anonymous users cannot reach `/admin` or `/api/media`. Future enhancement: add per-IP rate-limit telemetry (see `@/lib/rate-limit`).
- **Env usage:** Searches confirmed no `NEXT_PUBLIC_*` reads on the server beyond `serverEnv` hydration; Firebase Admin still uses server-only envs.

## Performance review
- Admin push notification button now lazy-loads `firebase/messaging`, removing ~40 kB from the initial admin bundle. 【F:components/EnableNotificationsButton.tsx†L1-L63】
- Firebase client bootstrap now throws early; Next.js tree-shakes unused SDK modules because only modular imports remain.
- Recommendation: run `pnpm analyze` to inspect other large bundles (unchanged in this patch).

## DX and CI/CD
- Scripts for lint/typecheck/test/build already exist (`pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm build`). Documented environment workflow now matches `scripts/validate-env.ts` expectations.
- Vercel uses Node 22 + pnpm via `vercel.json`; ensure the Firebase env vars are set for Development/Preview/Production to avoid runtime crashes.
- If using `next/image`, add remote domains to `next.config.mjs` (none changed here).

## Tests
- Added `lib/__tests__/firebase-client-init.test.ts` to ensure Firebase only initialises once and surfaces missing env errors. 【F:lib/__tests__/firebase-client-init.test.ts†L1-L129】
- Added `__tests__/middleware-admin.test.ts` to verify middleware redirects unauthenticated admin routes and allows authenticated requests. 【F:__tests__/middleware-admin.test.ts†L1-L128】
- Recommended future work: Playwright smoke tests for `/admin/login` redirect and API integration tests covering `/api/admin/validate-session` with missing cookies.

## Verification checklist
- [ ] Copy `.env.local.example` to `.env.local`, populate Firebase keys, and run `pnpm env:check --strict`.
- [ ] Run `pnpm test:unit` (or `pnpm test`) to execute the new coverage.
- [ ] Confirm `/admin/login` loads with populated envs and displays the descriptive error if any required key is missing.
- [ ] Validate Vercel env settings for all stages before deployment.