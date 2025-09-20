# Admin Environment Guide

## Setup

Either `ADMIN_EMAILS` (preferred) or `ADMIN_EMAIL` must be defined for builds and runtime. A non-empty `ADMIN_EMAILS` always takes precedence over `ADMIN_EMAIL`. If both variables are empty or undefined, the allowed admin list is empty and all admin logins will fail.

`ADMIN_EMAILS` (comma-separated) overrides `ADMIN_EMAIL`. **If `ADMIN_EMAILS` is defined—even as an empty string—`ADMIN_EMAIL` is ignored.**

After updating `ADMIN_EMAILS` or `ADMIN_EMAIL` in Vercel, trigger a new deployment; existing builds continue using the old values.

* The admin password must be provided as `ADMIN_PASSWORD_HASH` (bcrypt). `ADMIN_PASSWORD` is ignored.

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
