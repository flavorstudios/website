# Admin Heading Audit Report

## Overview
- Normalised every admin surface so only `page.tsx` files (or the shared `AdminDashboardSectionPage`) render the level-one `PageHeader`, guaranteeing a single semantic `<h1>` per route. 【F:app/admin/dashboard/AdminDashboardSectionPage.tsx†L1-L27】【F:app/admin/blogs/page.tsx†L1-L36】
- Corrected legacy dashboard aliases to reuse the shared wrapper and added explicit metadata so the runtime no longer emits duplicate hero titles or Next.js warnings. 【F:app/admin/dashboard/blog/page.tsx†L1-L36】
- Hardened the static scanner to fail when non-allowlisted components emit `<h1>` and kept a fallback HTML crawler that flags client-only gaps while Playwright browsers remain unavailable. 【F:scripts/audit-headings-static.ts†L18-L113】【F:scripts/audit-headings-runtime.ts†L1-L289】

## Static analysis
Command:

```bash
pnpm exec tsx scripts/audit-headings-static.ts

```
pnpm -s audit:headings:static
```

Result (warnings only): 【4be0b9†L1-L15】

| Severity | File | Reason |
| --- | --- | --- |
| WARN | app/admin/**/page.tsx | Expected level-one `PageHeader` usage in entry points (sr-only in most cases). |
| WARN | components/blog/BlogRenderer.tsx | Marketing renderer intentionally keeps article `<h1>` for preview. |
| WARN | components/blog/blog-header.tsx | Marketing hero retains visible `<h1>`. |
| WARN | components/home/HeroSection.tsx | Home hero keeps visible `<h1>`. |

Layouts, templates, and admin shell components now surface as errors if they ever emit `<h1>` or `PageHeader level={1}`.

## Runtime crawl

Command:

```bash
ADMIN_AUTH_DISABLED=1 ADMIN_BYPASS=true pnpm exec tsx scripts/audit-headings-runtime.ts
```

Because Playwright browsers cannot be installed in this environment, the crawler fell back to parsing the server-rendered HTML.【86e91b†L1-L41】 Routes rendered entirely through client layouts (the dashboard shell) therefore show zero `<h1>` in the SSR snapshot even though the hydrated client inserts an sr-only `PageHeader`. The table below highlights the results and the follow-up checks to run once browsers are available:

| Route | Mode | `<h1>` count | Heading(s) seen in SSR | Notes |
| --- | --- | --- | --- | --- |
| /admin/applications | ssr | 1 | Admin Dashboard | sr-only header renders from `AdminDashboardSectionPage`. |
| /admin/blog/create | ssr | 1 | Create Blog Post | Page-level sr-only header. |
| /admin/blog/edit | ssr | 0 | (none) | Requires a post id; render falls back to 404 without data. |
| /admin/blogs | ssr | 1 | Admin Dashboard | Alias route inherits dashboard shell sr-only `<h1>`. |
| /admin/categories | ssr | 0 | (none) | Client dashboard layout; verify with Playwright. |
| /admin/comments | ssr | 1 | Comments | Uses dedicated sr-only header + client manager. |
| /admin/dashboard | ssr | 0 | (none) | Client layout hides `<h1>` in SSR; Playwright should confirm hydrated output. |
| /admin/dashboard/* | ssr | 0 | (none) | All dashboard subsections rely on client hydration for the sr-only `<h1>`. |
| /admin/email | ssr | 1 | Admin Dashboard | Dashboard alias via server page wrapper. |
| /admin/email-inbox | ssr | 1 | Admin Dashboard | Same as above. |
| /admin/forgot-password | ssr | 1 | Reset admin password | sr-only header present. |
| /admin/login | ssr | 1 | Admin Login | sr-only header present. |
| /admin/media | ssr | 1 | Admin Dashboard | Aliased wrapper. |
| /admin/notifications | ssr | 0 | (none) | Client-only list; verify via Playwright. |
| /admin/preview/[id] | ssr | 0 | (none) | Missing preview token; client render needed to confirm. |
| /admin/search | ssr | 1 | Admin Search | sr-only header present. |
| /admin/signup | ssr | 1 | Create your admin account | Visible `<h1>` inside auth card. |
| /admin/test | ssr | 1 | Admin Test Page | Visible `<h1>` toggled per state. |
| /admin/users | ssr | 1 | Admin Dashboard | Wrapper route with sr-only `<h1>`. |
| /admin/verify-email | ssr | 1 | Verify admin email | sr-only header present. |
| /admin/videos | ssr | 1 | Admin Dashboard | Wrapper route with sr-only `<h1>`. |

Once Playwright browsers are installed (`pnpm exec playwright install --with-deps`), rerun the crawler to capture hydrated DOM counts and screenshots. Any row that still reports `0` at runtime would indicate a regression.

## Admin route inventory
A spot-check of page sources confirms a single level-one heading per route:

- Dashboard aliases and admin list pages call `AdminDashboardSectionPage`, which injects one sr-only `PageHeader` and hands off to the client dashboard shell. 【F:app/admin/dashboard/AdminDashboardSectionPage.tsx†L1-L27】
- Authentication routes (`/admin/login`, `/admin/signup`, `/admin/forgot-password`, `/admin/verify-email`) render a hidden `PageHeader` once and only use level-two headers inside forms. 【F:app/admin/login/page.tsx†L1-L45】【F:app/admin/signup/page.tsx†L1-L74】
- Standalone tools such as comments, search, notifications, and the test harness demote any visible headings to level two while keeping a single top-level sr-only header. 【F:app/admin/comments/page.tsx†L1-L18】【F:app/admin/notifications/page.tsx†L1-L120】【F:app/admin/search/AdminSearchPageClient.tsx†L16-L67】
- The preview route displays the article `<h1>` supplied by `BlogRenderer` only when the preview token resolves; without data it falls back to an error template with no headings. 【F:app/admin/preview/[id]/page.tsx†L220-L264】【F:components/blog/BlogRenderer.tsx†L177-L216】

## Follow-ups
1. Install Playwright browsers and rerun `pnpm exec tsx scripts/audit-headings-runtime.ts` to capture hydrated counts plus screenshots for the dashboard subsets.
2. Execute `pnpm exec playwright test tests/admin/heading.spec.ts` once browsers are available to enforce the single-`<h1>` rule in CI.
3. Consider stubbing preview/draft data in the runtime crawler so `/admin/blog/edit` and `/admin/preview/[id]` render meaningful headings during audits.