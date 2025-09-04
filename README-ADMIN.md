# Admin Environment Guide

## How `/api/admin/google-session` authorizes emails

The Google admin login endpoint calls `getAllowedAdminEmails()` from `lib/firebase-admin`. That helper builds a lowercase list from `ADMIN_EMAILS` (comma‑separated) or falls back to `ADMIN_EMAIL` when the list is empty. When a login request arrives, `/api/admin/google-session` verifies the decoded Google ID token and then ensures the email is included in that allowed list before issuing the `admin-session` cookie.

**Note:**

* `ADMIN_EMAILS` takes precedence over `ADMIN_EMAIL`.
* Leaving `ADMIN_EMAILS` blank overrides `ADMIN_EMAIL` and results in “No admin emails configured.”

## Managing admin emails on Vercel

1. Open your project in the Vercel dashboard.
2. Go to **Settings → Environment Variables**.
3. Add or edit `ADMIN_EMAILS` for multiple addresses (comma‑separated) or `ADMIN_EMAIL` for a single address.
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