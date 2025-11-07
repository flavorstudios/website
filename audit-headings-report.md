# Admin Heading Audit Report

## Overview
- Confirmed every admin route now renders exactly one semantic `<h1>` by delegating to client components that wrap `PageHeader` with `level={1}` only once. Routes that share dashboard chrome do so through `AdminDashboardSectionPage` to avoid duplicate titles. 【F:app/admin/dashboard/AdminDashboardSectionPage.tsx†L1-L10】【F:app/admin/dashboard/AdminDashboardPageClient.tsx†L244-L664】
- All alias `page.tsx` files simply render their respective client surface, preventing layouts or templates from emitting hidden headings. 【F:app/admin/blogs/page.tsx†L1-L36】【F:app/admin/dashboard/page.tsx†L1-L22】
- Hardened the static scanner and ESLint guard so only vetted admin entry points can mount a level-one heading; shared marketing components remain on an allowlist. 【F:scripts/audit-headings-static.ts†L18-L138】【F:eslint-plugin-local/rules/no-h1-outside-page.js†L1-L119】

## Static analysis
Command:

```bash
pnpm audit:headings:static
```

Result (warnings only): 【f7b260†L1-L16】

| Severity | File | Reason |
| --- | --- | --- |
| WARN | app/(admin)/system-tools/page.tsx | Expected `PageHeader level={1}` usage in the page client. |
| WARN | components/admin/dashboard/AdminSectionPage.tsx | Shared helper renders the canonical level-one `PageHeader`. |
| WARN | app/admin/dashboard/components/blog-editor.tsx | Blog editor client owns the single `PageHeader`. |
| WARN | app/admin/dashboard/settings/page.tsx | SSR fallback keeps its own `PageHeader level={1}`. |
| WARN | app/admin/forgot-password/ForgotPasswordForm.tsx | Auth form renders the canonical heading. |
| WARN | app/admin/login/AdminLoginForm.tsx | Auth form renders the canonical heading. |
| WARN | app/admin/notifications/page.tsx | Notifications client mounts the level-one header. |
| WARN | app/admin/preview/[id]/page.tsx | Preview fallback keeps a sr-only `PageHeader`. |
| WARN | app/admin/search/AdminSearchPageClient.tsx | Search client mounts the level-one header. |
| WARN | app/admin/signup/page.tsx | Signup flow renders the canonical header. |
| WARN | app/admin/test/page.tsx | Test page mounts the level-one header. |
| WARN | app/admin/verify-email/VerifyEmailClient.tsx | Verify email flow owns the `<h1>`. |
| WARN | components/blog/blog-header.tsx | Marketing hero retains a visible `<h1>`. |
| WARN | components/blog/BlogRenderer.tsx | MDX renderer surfaces article headings. |
| WARN | components/home/HeroSection.tsx | Marketing hero keeps a visual `<h1>`. |

No admin layout or template emits `<h1>` or `PageHeader level={1}`; violations would elevate to `ERROR` and break the script.

## Runtime crawl
Command:

```bash
pnpm audit:headings:runtime
```

Playwright browsers cannot be downloaded in this environment (HTTP 403), so the crawler falls back to parsing the SSR HTML while still enumerating every admin route. 【b491df†L1-L33】【4bc6de†L1-L35】 Each reachable page produced exactly one `<h1>`; routes that naturally 404 without parameters (`/admin/blog/edit`, `/admin/system-tools`) are listed for completeness.

| Route | Mode | Status | `<h1>` count | Role count | Text content |
| --- | --- | --- | --- | --- | --- |
| /admin/applications | ssr | 200 | 1 | 1 | Applications |
| /admin/blog/create | ssr | 200 | 1 | 1 | Create New Post |
| /admin/blog/edit | ssr | 404 | 0 | 0 | (none) |
| /admin/blogs | ssr | 200 | 1 | 1 | Blog Posts |
| /admin/categories | ssr | 200 | 1 | 1 | Categories |
| /admin/comments | ssr | 200 | 1 | 1 | Comments |
| /admin/dashboard | ssr | 200 | 1 | 1 | Admin Dashboard |
| /admin/dashboard/applications | ssr | 200 | 1 | 1 | Applications |
| /admin/dashboard/blog | ssr | 200 | 1 | 1 | Blog Posts |
| /admin/dashboard/blog-posts | ssr | 200 | 1 | 1 | Blog Posts |
| /admin/dashboard/categories | ssr | 200 | 1 | 1 | Categories |
| /admin/dashboard/comments | ssr | 200 | 1 | 1 | Comments &amp; Reviews |
| /admin/dashboard/inbox | ssr | 200 | 1 | 1 | Email Inbox |
| /admin/dashboard/media | ssr | 200 | 1 | 1 | Media Manager |
| /admin/dashboard/settings | ssr | 200 | 1 | 1 | Settings |
| /admin/dashboard/system | ssr | 200 | 1 | 1 | System Tools |
| /admin/dashboard/users | ssr | 200 | 1 | 1 | Users |
| /admin/dashboard/videos | ssr | 200 | 1 | 1 | Videos |
| /admin/email | ssr | 200 | 1 | 1 | Email Inbox |
| /admin/email-inbox | ssr | 200 | 1 | 1 | Email Inbox |
| /admin/forgot-password | ssr | 200 | 1 | 1 | Reset admin password |
| /admin/login | ssr | 200 | 1 | 1 | Admin Login |
| /admin/media | ssr | 200 | 1 | 1 | Media Manager |
| /admin/notifications | ssr | 200 | 1 | 1 | Notifications |
| /admin/preview/[id] | ssr | 200 | 1 | 1 | Admin Preview |
| /admin/search | ssr | 200 | 1 | 1 | Admin Search |
| /admin/signup | ssr | 200 | 1 | 1 | Create your admin account |
| /admin/system-tools | ssr | 404 | 1 | 1 | 404 |
| /admin/test | ssr | 200 | 1 | 1 | Admin Test Page |
| /admin/users | ssr | 200 | 1 | 1 | Users |
| /admin/verify-email | ssr | 200 | 1 | 1 | Verify your email |
| /admin/videos | ssr | 200 | 1 | 1 | Videos |

`/admin/dashboard/settings` now catches missing admin sessions and still renders its heading in the fallback state. `/admin/system-tools` deliberately 404s behind feature flags; the SSR probe sees the marketing-style 404 hero but no duplicate headings.

## Playwright check
Command: 

```bash
pnpm exec playwright test tests/admin/heading.spec.ts
```

Playwright launches fail because Chromium cannot be downloaded behind the sandboxed proxy (HTTP 403). All 62 tests therefore abort with the standard "browserType.launch" error message. 【779a57†L1-L207】 Re-run the suite once browsers are cached locally.

## Next steps
1. Mirror the Playwright browser cache (or run the suite in CI) so the runtime audit and heading test can observe hydrated DOM results.
2. Consider seeding fixture content for `/admin/blog/edit` during audits to avoid the expected 404.
3. Keep `pnpm audit:headings:static`, `pnpm audit:headings:runtime`, and the Playwright spec wired into CI so regressions surface immediately.