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
```

2. **Set up your environment and install dependencies:**
   ```bash
   cp env.example .env.local
   pnpm install  # or `npm install`
   ```

3. **Common development scripts:**
   ```bash
   pnpm dev    # start the local development server
   pnpm lint   # run eslint checks
   pnpm test   # execute unit tests
   pnpm build  # create an optimized production build
   pnpm start  # run the production server
      ```

---

## Cookie Consent Banner

The cookie consent banner is loaded only on public pages for visitors on the
live site who have not previously granted consent.

- **Environment**: Rendered only when `NODE_ENV` is `production` or the
  request's hostname matches one in `NEXT_PUBLIC_COOKIE_ALLOWED_DOMAINS`.
- **Routes**: Admin surfaces such as `/admin`, `/wp-admin`, `/dashboard` and
  `/backend` never load the banner. You can override the prefixes via
  `NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES`.
- **Admin Users**: Authenticated admins (detected via a valid
  `admin-session` cookie) never see the banner, even on public routes.
- **Consent State**: If a `cookieyes-consent`/`cky-consent` cookie is present,
  the banner is skipped on subsequent visits.

Configure the domains and prefixes in `.env.local` using the variables shown in
`env.example`. If `NEXT_PUBLIC_COOKIEYES_SCRIPT_URL` is not set, the banner is
disabled.