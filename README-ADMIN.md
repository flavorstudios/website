# Admin Environment Guide

## Setup

Either `ADMIN_EMAILS` (preferred) or `ADMIN_EMAIL` must be defined for builds and runtime. A non-empty `ADMIN_EMAILS` always takes precedence over `ADMIN_EMAIL`. If both variables are empty or undefined, the allowed admin list is empty and all admin logins will fail.

`ADMIN_EMAILS` (comma-separated) overrides `ADMIN_EMAIL`. **If `ADMIN_EMAILS` is defined—even as an empty string—`ADMIN_EMAIL` is ignored.**

After updating `ADMIN_EMAILS` or `ADMIN_EMAIL` in Vercel, trigger a new deployment; existing builds continue using the old values.

* The admin password must be provided as `ADMIN_PASSWORD_HASH` (bcrypt). `ADMIN_PASSWORD` is ignored.

## Firebase email login (recommended)

The admin UI now surfaces Firebase email/password login by default. The full onboarding flow is:

1. Configure `ADMIN_EMAILS`/`ADMIN_EMAIL` with the addresses you want to allow.
2. Direct the admin to `/admin/signup`. The form calls `POST /api/admin/signup`, which creates a Firebase Auth user, provisions the session cookie, and (optionally) triggers email verification.
3. The user can immediately access `/admin/dashboard` if verification is not required. Otherwise, they are routed to `/admin/verify-email` until their Firebase mailbox is confirmed.
4. Subsequent logins happen at `/admin/login`. The “Sign in with email” form uses Firebase Auth on the client, then exchanges the ID token with `POST /api/admin/email-login` to set the server `admin-session` cookie.
5. If Google SSO is enabled, users can link providers after signing in with email/password. Attempting Google sign-in on an account that already exists now prompts the user to complete the email login and link their providers from settings.

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

