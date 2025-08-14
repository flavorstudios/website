# Flavor Studios Website

This is the official website of **Flavor Studios** — your source for Anime News & Original Stories That Inspire.

---

## Features

- Lightning-fast, SEO-optimized Next.js site
- Full PWA (Progressive Web App) support: offline, installable, works across mobile & desktop
- Clean, modern UI with custom animations and accessibility
- Anime news, original videos, blog, and more
- Built with OCD-level organization and best coding practices

---

## Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/flavorstudios/flavorstudios-website.git
   cd flavorstudios-website
Set up your environment and install dependencies:

bash
Copy
Edit
cp env.example .env.local
pnpm install  # or `npm install`
Common development scripts:

bash
Copy
Edit
pnpm dev    # start the local development server
pnpm lint   # run eslint checks
pnpm test   # execute unit tests
pnpm build  # create an optimized production build
pnpm start  # run the production server
Firebase configuration
Firebase powers features like authentication and Firestore. The client SDK
requires several environment variables, all of which must be present in your
.env.local (for local development) or your hosting platform's environment
settings:

NEXT_PUBLIC_FIREBASE_API_KEY

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

NEXT_PUBLIC_FIREBASE_PROJECT_ID

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

NEXT_PUBLIC_FIREBASE_APP_ID

If any of these are missing at runtime, Firebase will not initialize and you'll
see an error similar to:

scss
Copy
Edit
[Firebase] Missing Firebase environment variable(s): NEXT_PUBLIC_FIREBASE_API_KEY, ...
Use env.example as a reference for the correct variable names and structure.

Cookie Consent Banner (via GTM)
The cookie consent banner is injected via Google Tag Manager and is shown only on public pages for visitors on live hostnames who have not previously granted consent. GTM is the single source of truth for injection and Consent Mode.

Gating rules

The banner appears only when all of the following are true:

Hostname is included in NEXT_PUBLIC_LIVE_HOSTNAMES.

Environment is production (NODE_ENV=production) or NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER=true (useful for local/staging tests).

Route is not under any admin prefix in NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES (defaults: /admin,/wp-admin,/dashboard,/backend).

User is not an authenticated admin (your app exposes window.__USER__ = { role: 'admin', isAdmin: true } on admin pages).

Consent has not been granted before (no cookie_consent=granted in cookie/localStorage).

Environment variables

Set these in .env.local (see env.example):

NEXT_PUBLIC_GTM_CONTAINER_ID — your GTM container ID (e.g., GTM-XXXXXXX).

NEXT_PUBLIC_LIVE_HOSTNAMES — comma-separated hostnames allowed to show the banner (e.g., flavorstudios.in,www.flavorstudios.in).

NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES — comma-separated admin route prefixes (e.g., /admin,/wp-admin,/dashboard,/backend).

NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER — set to true to allow banner on non-prod for testing; keep false in production unless needed.

How it works

A small inline bootstrap script runs before GTM, pushing appEnv, hostname, path, isAdminRoute, isAdminUser, consentGiven, and enableGtmCookieBanner to dataLayer as event: "app_boot".

On SPA navigation, the app pushes event: "router_change" with updated path and isAdminRoute.

In GTM, a custom trigger (e.g., Cookie Banner Allowed) listens to app_boot|router_change|gtm.js and checks the variables above to control the banner tag.

Admin routes and admin users have a blocking trigger to ensure the banner never appears on those surfaces.

Consent Mode v2 (in GTM)

Add a Consent Initialization tag that sets defaults to denied (except functionality/security).

Add a Consent Update tag that listens for your vendor’s consent callback (or your custom event) and updates consent to granted. It should mirror consent to localStorage/document.cookie and push event: "consent_granted".

Testing

Use GTM Preview to confirm app_boot and router_change data and verify whether the banner tag fires.

Run Playwright tests to assert:

Public pages (no prior consent) → banner visible.

Admin routes and logged-in admin → banner hidden.

After granting consent → banner remains hidden on reload.

No CLS or console errors should be introduced by the banner.