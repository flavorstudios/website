# Admin Heading Audit Report

## Overview
- Ensured each admin route renders exactly one semantic `<h1>` by standardising on `PageHeader` level 1 inside `page.tsx` entry points or the reusable `AdminDashboardSectionPage` wrapper.
- Demoted all dashboard/client `PageHeader` usages to `level={2}` so chrome, cards, and modals no longer emit additional H1s.
- Added dedicated static and runtime audit scripts plus strengthened ESLint and Playwright checks to guard against regressions.

## Static analysis
The static scan now focuses on admin routes and chrome components. The latest run produced only warnings for intentional level-1 `PageHeader` instances in entry files and known marketing components that intentionally render `<h1>` outside the admin scope.

```
pnpm -s audit:headings:static
```

| Severity | File | Notes |
| --- | --- | --- |
| WARN | app/admin/**/*/page.tsx | Expected level 1 PageHeaders in entry files (screen-reader only in most cases). |
| WARN | components/blog/**, components/home/HeroSection.tsx | Non-admin marketing components that legitimately render `<h1>`; retained as warnings for visibility. |

## Runtime crawl
`pnpm -s audit:headings:runtime` starts the dev server, screenshots each admin route, and logs every `<h1>` it encounters. Chromium binaries are not bundled in this environment, so the crawl currently fails with the Playwright download hint. Install browsers via `pnpm exec playwright install --with-deps` before re-running.

## Admin route inventory
Manual verification against the updated page sources confirms a single semantic `<h1>` per route. Runtime screenshots will be attached once the crawler can execute.

| Route | `<h1>` text at runtime | Source component |
| --- | --- | --- |
| /admin/applications | Applications (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`applications`] |
| /admin/blog/create | Create Blog Post (sr-only) | app/admin/blog/create/page.tsx |
| /admin/blog/edit | Edit Blog Post: `<post title>` (sr-only) | app/admin/blog/edit/page.tsx |
| /admin/blogs | Blog Posts (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`blogs`] |
| /admin/categories | Categories (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`categories`] |
| /admin/comments | Comments (sr-only) | app/admin/comments/page.tsx |
| /admin/dashboard | Admin Dashboard (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`overview`] |
| /admin/dashboard/applications | Applications (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`applications`] |
| /admin/dashboard/blog | Blog Posts (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`blogs`] |
| /admin/dashboard/blog-posts | Blog Posts (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`blogs`] |
| /admin/dashboard/categories | Categories (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`categories`] |
| /admin/dashboard/comments | Comments & Reviews (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`comments`] |
| /admin/dashboard/inbox | Email Inbox (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`inbox`] |
| /admin/dashboard/media | Media Manager (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`media`] |
| /admin/dashboard/settings | Settings (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`settings`] |
| /admin/dashboard/system | System Tools (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`system`] |
| /admin/dashboard/users | Users (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`users`] |
| /admin/dashboard/videos | Videos (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`videos`] |
| /admin/email | Email Inbox (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`inbox`] |
| /admin/email-inbox | Email Inbox (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`inbox`] |
| /admin/forgot-password | Reset admin password (sr-only) | app/admin/forgot-password/page.tsx |
| /admin/login | Admin Login (sr-only) | app/admin/login/page.tsx |
| /admin/media | Media Manager (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`media`] |
| /admin/notifications | Notifications | app/admin/notifications/page.tsx |
| /admin/preview/[id] | `<post title>` (rendered by BlogRenderer) | app/admin/preview/[id]/page.tsx → components/blog/BlogRenderer.tsx |
| /admin/search | Admin Search (sr-only) | app/admin/search/page.tsx |
| /admin/signup | Create your admin account | app/admin/signup/page.tsx |
| /admin/test | Admin Test Page | app/admin/test/page.tsx |
| /admin/users | Users (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`users`] |
| /admin/verify-email | Verify admin email (sr-only) | app/admin/verify-email/page.tsx |
| /admin/videos | Videos (sr-only) | AdminDashboardSectionPage → SECTION_HEADINGS[`videos`] |

## Follow-ups
1. Install Playwright browsers (`pnpm exec playwright install --with-deps`) so the runtime audit and Playwright test suite can execute in CI.
2. Decide whether to promote the static warnings for non-admin marketing components to errors or suppress them explicitly if they remain acceptable.
3. Re-run the runtime crawler to capture screenshots and attach them alongside this report once browsers are available.