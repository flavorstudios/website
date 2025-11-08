# Admin Page Heading Policy

The admin app renders a single semantic `<h1>` per route. This keeps the
dashboard accessible, maintains predictable SEO semantics, and aligns all admin
pages with the same page header layout.

## Rendering the page title

- Use `<PageHeader>` for the visible page title. It defaults to `h1` and accepts
  optional `level` when a section needs an `h2+`.
- Wrap the route body in `<HeadingRoot>` (or rely on the layout-provided
  `<HeadingLevelRoot>`) and immediately render the canonical `<PageHeader>`.
- After the header, wrap interactive content in `<HeadingLevelBoundary>` and
  pass `suppressHeading` plus `headingId` through to
  `AdminDashboardSectionPage`:

```tsx
const HEADING_ID = "admin-media-heading";

return (
  <HeadingRoot>
    <PageHeader headingId={HEADING_ID} title="Media Library" />
    <AdminShellProvider variant="dashboard">
      <HeadingLevelBoundary>
        <AdminDashboardSectionPage
          section="media"
          suppressHeading
          headingId={HEADING_ID}
        />
      </HeadingLevelBoundary>
    </AdminShellProvider>
  </HeadingRoot>
);
```

The `headingId` wire-up keeps `aria-labelledby` accurate while avoiding a
second `<h1>` inside the dashboard shell.

- The dashboard overview section inherits the layout heading inside
  `AdminDashboardPageClient`. If you render `DashboardOverview` in isolation
  (for example in Storybook or a custom shell), pass `showHeading` so it can
  render its own `<PageHeader>` without reintroducing duplicates in production.

## Secondary headings

- Secondary panels within the dashboard should demote their headings to `h2` or
  lower using the `level` prop: `<PageHeader level={2} ... />`.
- Avoid introducing standalone `<h1>` tags in child components. If visual
  styling requires a larger heading, use Tailwind classes without changing the
  semantic level.

## Tests and CI guard

- `__tests__/admin-dashboard-heading.test.tsx` renders the dashboard shell and
  asserts the overview page exposes a single `<h1>`.
- `src/__tests__/admin-single-h1.test.tsx` renders each admin route and confirms
  that exactly one level-one heading is present, including hidden headings.
- Playwright checks `/admin/dashboard` for exactly one `<h1>` and confirms the
  visible title text.
- CI runs `pnpm check:single-h1` after every build. The script renders the admin
  routes on the server and fails if a page emits zero or multiple `<h1>` or any
  `role="heading" aria-level="1"` duplicates.

Following this convention keeps the admin layout predictable and prevents new
double-heading regressions.