# Admin Page Header Guidelines

The admin area uses a single-owner policy for `<h1>` elements so each route exposes exactly one level-one heading for SEO and accessibility. Use the utilities described below whenever you add or update admin pages.

## Default pattern for dashboard sections

For dashboard-style routes (blog posts, videos, media, etc.) render the [`AdminSectionPage`](../components/admin/dashboard/AdminSectionPage.tsx) component and pass the section identifier:

```tsx
import { AdminSectionPage } from "@/components/admin/dashboard/AdminSectionPage";
import type { SectionId } from "@/app/admin/dashboard/sections";

const SECTION: SectionId = "blogs";

export default function AdminBlogsPage() {
  return <AdminSectionPage section={SECTION} />;
}
```

`AdminSectionPage` renders the canonical `<PageHeader>` as an `<h1>` and forwards the identifier to `AdminDashboardSectionPage` with `suppressHeading` so the underlying dashboard shell does not emit a second `<h1>`. The helper also wires `aria-labelledby` to keep the main region accessible.

## Customising the heading

`AdminSectionPage` reads the title and description from `SECTION_HEADINGS` and `SECTION_DESCRIPTIONS`. Override them only when you have a real content change:

```tsx
<AdminSectionPage
  section="media"
  title="Asset Review"
  description="Moderate uploads before publishing."
/>
```

Avoid duplicating `<PageHeader>` manually—doing so will reintroduce multiple `<h1>` elements.

## Secondary sections

Inside dashboard widgets use `<PageHeader level={2}>` or native `<h2>`/`<h3>` tags. The [`PageHeader`](../components/admin/page-header.tsx) component accepts a `level` prop that defaults to `1`; always set `level={2}` (or higher) for nested sections.

## Adding new pages

1. Import `AdminSectionPage` and supply the `SectionId` for the area you are exposing.
2. If the page needs bespoke actions, render them via the `actions` slot on `PageHeader` inside the section component—not by creating another `<h1>`.
3. Run `pnpm lint`, `pnpm test`, and the Playwright heading spec to ensure the guardrail scripts remain green.

Following this pattern keeps the admin shell accessible and prevents regressions that would surface in the single-H1 checks that run in CI (`pnpm check:single-h1`).