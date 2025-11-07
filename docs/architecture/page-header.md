# Admin Page Heading Policy

The admin app renders a single semantic `<h1>` per route. This keeps the
dashboard accessible, maintains predictable SEO semantics, and aligns all admin
pages with the same page header layout.

## Rendering the page title

- Use `<PageHeader>` for the visible page title. It defaults to `h1` and accepts
  optional `level` when a section needs an `h2+`.
- `AdminDashboardSectionPage` renders the canonical `<PageHeader>` when
  `suppressHeading` is not set. This is the recommended path for most admin
  pages.
- When you need to manage the heading yourself (for example to wrap the page in
  Suspense or to customise spacing), render `<PageHeader>` directly in the
  route and pass `suppressHeading` plus `headingId` through to
  `AdminDashboardSectionPage`:

```tsx
const HEADING_ID = "my-page-title";

<PageHeader headingId={HEADING_ID} title="Media Library" />
<AdminDashboardSectionPage
  section="media"
  suppressHeading
  headingId={HEADING_ID}
/>
```

The `headingId` wire-up keeps `aria-labelledby` accurate while avoiding a
second `<h1>` inside the dashboard shell.

## Secondary headings

- Secondary panels within the dashboard should demote their headings to `h2` or
  lower using the `level` prop: `<PageHeader level={2} ... />`.
- Avoid introducing standalone `<h1>` tags in child components. If visual
  styling requires a larger heading, use Tailwind classes without changing the
  semantic level.

## Tests and CI guard

- `__tests__/admin-dashboard-heading.test.tsx` renders the dashboard shell and
  asserts the overview page exposes a single `<h1>`.
- Playwright checks `/admin/dashboard` for exactly one `<h1>` and confirms the
  visible title text.
- CI runs `pnpm check:single-h1` after every build. The script inspects the
  compiled admin HTML and fails the build if any page emits zero or multiple
  `<h1>` elements.

Following this convention keeps the admin layout predictable and prevents new
double-heading regressions.