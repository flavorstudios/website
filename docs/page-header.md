# Admin Page Heading Guidelines

The admin surface owns **exactly one** semantic `<h1>` per route. To make that
simple and consistent we standardize on the `PageHeader` component and the
`HeadingLevelBoundary` context helpers.

## Owning the `<h1>`

- Route files (`app/admin/.../page.tsx`) render the canonical `<PageHeader>`
  with no `level` prop. The surrounding layout provides the base heading level
  and `PageHeader` automatically resolves to `<h1>` for the first heading.
- After the top-level header, wrap the remainder of the page in
  `<HeadingLevelBoundary>`. Any nested `PageHeader` (or components that rely on
  the heading context) will automatically render as `<h2>` without additional
  props.

## Secondary headings

- Inside page sections, call `PageHeader` without a `level` prop. The heading
  context demotes it to the next semantic level (usually `<h2>`).
- For plain HTML headings, read the current level via `useHeadingLevel()` and
  increment it manually if you are not using `PageHeader`.

## Adding new pages

1. Import and render `PageHeader` at the top of the page component for the
   visible title.
2. Immediately wrap the rest of the layout in `<HeadingLevelBoundary>` so
   subsections default to `<h2>`.
3. Avoid hard-coding `<h1>` in reusable widgets. If you need a prominent title
   inside a card or dialog, use `PageHeader` or `<h2>`/`<h3>` depending on the
   inherited level.

Following this pattern keeps the DOM accessible, prevents duplicate level-one
headings, and ensures the admin shell looks consistent across routes.