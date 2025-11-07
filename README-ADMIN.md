# Admin Environment Guide

## Setup

Either `ADMIN_EMAILS` (preferred) or `ADMIN_EMAIL` must be defined for builds and runtime. A non-empty `ADMIN_EMAILS` always takes precedence over `ADMIN_EMAIL`. If both variables are empty or undefined, the allowed admin list is empty and all admin logins will fail.

`ADMIN_EMAILS` (comma-separated) overrides `ADMIN_EMAIL`. **If `ADMIN_EMAILS` is defined—even as an empty string—`ADMIN_EMAIL` is ignored.**

After updating `ADMIN_EMAILS` or `ADMIN_EMAIL` in Vercel, trigger a new deployment; existing builds continue using the old values.

* The admin password must be provided as `ADMIN_PASSWORD_HASH` (bcrypt). `ADMIN_PASSWORD` is ignored.

## E2E admin authentication (CI & local)

Playwright runs with `NEXT_PUBLIC_E2E=1`, `ADMIN_AUTH_DISABLED=1`, and `ADMIN_BYPASS=true` so the server can mint a synthetic admin session when Firebase Admin credentials are unavailable. The bypass keeps admin pages rendering in CI while still exercising the dashboard shell.

* Server logic returns a deterministic `uid: "bypass"` admin whenever the bypass flags are set or when E2E helpers detect the test environment.
* The E2E harness writes a storage state in `e2e/.auth/admin.json` and primes the `admin-session=playwright` cookie using the Playwright `baseURL` hostname. This prevents domain mismatches between `localhost` and `127.0.0.1` during CI runs.
* When running locally without Firebase Admin, export `ADMIN_BYPASS=true` (or `E2E=1`) and start Playwright with the dashboard-focused commands below. The UI will show non-fatal banners instead of throwing when Firestore is missing.

Common Playwright commands while iterating on the admin dashboard:

```bash
pnpm exec playwright test -g "admin dashboard" --headed --project=chromium-light --trace on
pnpm exec playwright show-trace test-results/**/trace.zip
```

### Running the chromium-light suite locally

1. Ensure the app is built and running with the same flags CI uses:

   ```bash
   pnpm -s build
   NEXT_PUBLIC_E2E=1 ADMIN_AUTH_DISABLED=1 ADMIN_BYPASS=true pnpm -s start:test:prod
   ```

2. In another terminal, execute the Playwright project that fails in CI:

   ```bash
   pnpm exec playwright test --project=chromium-light --max-failures=1 --reporter=list
   ```

   The `pnpm e2e --project=chromium-light --max-failures=1 --reporter=list` shortcut is equivalent.

3. To iterate on a single spec, append the file path:

   ```bash
   pnpm exec playwright test e2e/admin-dashboard-error.e2e.spec.ts --project=chromium-light --headed
   ```

### Motion-free E2E runs

When `NEXT_PUBLIC_E2E`, `E2E`, or `TEST_MODE` is truthy the root `<html>` element receives the `e2e-no-motion` class and all CSS animations/transitions collapse to zero duration. The Playwright harness also wraps the app in a Framer Motion `MotionConfig` with `reducedMotion="always"` so animated mounts keep a stable DOM for mobile viewport tests.

The class is applied globally by `app/layout.tsx` and styled in `app/globals.css`. You can inspect the DOM in the running app to confirm the flag is active (`document.documentElement.dataset.e2eMotion === 'true'`).

Unset the bypass flags and provide real Firebase credentials to exercise end-to-end auth flows.

## Firebase email login (recommended)

The admin UI now surfaces Firebase email/password login by default. The full onboarding flow is:

1. Configure `ADMIN_EMAILS`/`ADMIN_EMAIL` with the addresses you want to allow.
2. Direct the admin to `/admin/signup`. The form calls `POST /api/admin/signup`, which creates a Firebase Auth user, provisions the session cookie, and (optionally) triggers email verification.
3. The user can immediately access `/admin/dashboard` if verification is not required. Otherwise, they are routed to `/admin/verify-email` until their Firebase mailbox is confirmed.
4. Subsequent logins happen at `/admin/login`. The “Sign in with email” form uses Firebase Auth on the client, then exchanges the ID token with `POST /api/admin/email-login` to set the server `admin-session` cookie.
5. If Google SSO is enabled, users can link providers after signing in with email/password. Attempting Google sign-in on an account that already exists now prompts the user to complete the email login and link their providers from settings.

### Firebase-less / test mode

When any required public Firebase config (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`) is missing, or when `NODE_ENV === test`, the client automatically enters **test mode**. In this mode:

* `clientEnv.TEST_MODE` is forced to `'true'` so the UI can detect the degraded experience.
* The admin login defaults to the legacy env-based flow and hides the toggle that normally reveals it.
* Firebase email login short-circuits network calls to satisfy Playwright mocks without loading Firebase in the browser.

To restore the Firebase experience, provide the full set of `NEXT_PUBLIC_FIREBASE_*` variables (and their server-side counterparts) and deploy with `TEST_MODE` unset or explicitly set to `'false'`. The toggle will reappear once the config is complete.

### Legacy env-based login

The old environment-variable password flow is still available under the “Use legacy admin password (env-based)” disclosure on the login page. It relies on `ADMIN_PASSWORD_HASH` and `ADMIN_JWT_SECRET` and should only be used as a fallback while migrating existing operators.


## Email verification & signup hardening

* Set `ADMIN_REQUIRE_EMAIL_VERIFICATION=true` to force newly created admins to verify their mailbox before accessing privileged routes. Mirror the flag client-side with `NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION=true` so the UI surfaces the correct prompts.
* Define `ADMIN_DISPOSABLE_DOMAINS` with a comma-separated list (e.g. `mailinator.com,tempmail.com`) to block throwaway inboxes during signup. Domains are matched case-insensitively.

## How `/api/admin/google-session` authorizes emails

The Google admin login endpoint calls `getAllowedAdminEmails()` from `lib/firebase-admin`. That helper builds a lowercase list from `ADMIN_EMAILS` (comma-separated); if `ADMIN_EMAILS` is undefined or empty, it falls back to `ADMIN_EMAIL`. When a login request arrives, `/api/admin/google-session` verifies the decoded Google ID token and then ensures the email is included in that allowed list before issuing the `admin-session` cookie.

**Note:**

* Non-empty `ADMIN_EMAILS` takes precedence over `ADMIN_EMAIL`.
* If `ADMIN_EMAILS` is empty or undefined, `ADMIN_EMAIL` is used instead.
* If both variables are empty or undefined, the admin list is empty and all admin logins fail.

## Managing admin emails on Vercel

1. Open your project in the Vercel dashboard.
2. Go to **Settings → Environment Variables**.
3. Add or edit `ADMIN_EMAILS` for multiple addresses (comma-separated) or `ADMIN_EMAIL` for a single address.
4. To add an admin, append their email to `ADMIN_EMAILS`.
5. To remove an admin, delete their email from the list.

Any change requires a redeploy to apply.

## Rerun checks and redeploy

After updating environment variables:

```bash
vercel env pull .env.local   # sync the latest vars locally
pnpm tsx scripts/check-admin-env.ts  # verify admin env configuration
vercel deploy --prod          # redeploy with the updated vars
```

## Uploading media to Firebase Storage

Firebase Storage rules block all client-side reads and writes. Uploads must be
performed from trusted server environments using the Firebase Admin SDK. The
`lib/media.ts` module wraps common operations and is used by Next.js API routes
for media management.

Example server upload:

```ts
import { getStorage } from "firebase-admin/storage";

const bucket = getStorage().bucket();
await bucket.upload("./local-file.png", { destination: "media/local-file.png" });
```

Client code should never attempt direct writes; browser uploads will fail due to
the restrictive `storage.rules`.

## Refreshing signed media URLs

Storage reads are limited to authenticated admins (`allow read` in
[`storage.rules`](./storage.rules) checks for admin claims), so public media
must use either public ACLs or signed URLs. Legacy media documents that lack a
`urlExpiresAt` timestamp will eventually return 403/404 responses once their
signed URLs lapse.

To migrate older entries, run the helper script below. It iterates the `media`
collection, refreshes any expired or missing URLs via `refreshMediaUrl`, and
persists fresh `url`/`urlExpiresAt` values:

```bash
pnpm tsx scripts/refresh-media-urls.ts
```

The script logs each refreshed document and exits with a non-zero status if any
updates fail so you can rerun or investigate as needed.

### Restoring missing media objects

If a tile in the Media Library shows an **Error** badge, the signed URL in
Firestore likely points to an object that has been moved or renamed in Firebase
Storage. Use the following workflow to reconnect the document with its backing
file:

1. Locate the document in Firestore and note its `id` and `filename` fields.
2. Inspect the Storage bucket to confirm that an object exists at
   `media/<doc.id>/<doc.filename>` (for example, with the Firebase console or
   `gsutil ls gs://<bucket>/media/<doc.id>/`).
3. If the object is missing, search the bucket for the original upload. Move or
   copy it back into `media/<doc.id>/` and restore the original filename. If the
   stored filename has intentionally changed, update the document’s `filename`
   field in Firestore so it matches the object that now lives under
   `media/<doc.id>/`.
4. Once the storage layout is corrected, trigger a manual refresh by calling
   `POST /api/media/refresh` with the document ID (the admin Media Library can
   do this via the “Refresh URL” action). This step records a fresh signed
   download URL and clears any stale expiry metadata.
5. Reload the Media Library. The tile should render normally once the signed URL
   is valid again.

Keeping Storage and Firestore in sync avoids repeated refresh attempts and
prevents future uploads with the same basename from colliding.

