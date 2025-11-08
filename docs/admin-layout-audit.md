# Admin layout audit

## Layout ownership
- **Global admin shell**: `app/admin/layout.tsx` bootstraps shared providers (`LayoutSlots`, `AdminAuthProvider`, `ReactQueryProvider`, `TooltipProvider`) and exposes the slot system that downstream layouts rely on.
- **Dashboard chrome**: `app/admin/dashboard/(dashboard)/layout.tsx` wraps dashboard routes in `AdminShellProvider` and the client shell inside `app/admin/dashboard/AdminDashboardPageClient.tsx`, which renders the sidebar, top bar, and dynamic section content.
- **Sidebar navigation**: `app/admin/dashboard/components/admin-sidebar.tsx` controls the permanent/drawer navigation, item highlighting, and responsive behaviour.
- **Page heading + breadcrumbs**: `app/admin/dashboard/AdminDashboardPageClient.tsx` renders the visible `<PageHeader>` for dashboard sections, while many child components (e.g. `blog-manager.tsx`) also mount their own headings.
- **Settings shell and tabs**: `app/admin/dashboard/(settings)/layout.tsx` + `.../settings/SettingsClient.tsx` render the full-width settings experience and querystring-synchronised tab list.

## Root causes
- **Settings inherits the sidebar**: the sidebar click handler prevents the default `<Link>` navigation and relies on the dashboard client shell to drive route changes. When navigating to `/admin/dashboard/settings?tab=profile`, the dashboard shell stays mounted long enough to render its grid (with the sidebar) because no settings-specific layout unmounts it. The CSS grid column reserved for the sidebar is applied globally via `--sidebar-w`, so even the settings layout receives the sidebar column.
- **Duplicate page headings**: dashboard route files already render a `<PageHeader>` for the H1, but their associated client components (blog, videos, media, etc.) render another `<PageHeader>` with the same copy. This double rendering causes two visible headings and two semantic headings in accessibility trees.