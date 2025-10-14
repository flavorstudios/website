# E2E Audit – Admin Playwright Fixes

## Failure Analysis

### tests/admin-login-legal-visual.spec.ts
- **Root cause:** The legal notice paragraph could still grow wider than its container because the flex sibling shrank it while the paragraph forced a full-width box, causing a second line on tablet/desktop.
- **Fix:** Keep the invite copy from shrinking and render the legal notice as a zero-minimum-width block that uses Tailwind's single-line ellipsis utilities.
  ```tsx
  <p className="text-sm text-slate-600 flex-shrink-0">…</p>
  <div className="min-w-0 flex-1">
    <p data-testid="admin-login-legal" className="block max-w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs text-muted-foreground">
      © Flavor Studios · <Link href="/terms-of-service">Terms</Link> · …
    </p>
  </div>
  ```
  File: `app/admin/login/AdminLoginForm.tsx`.

### tests/admin-quick-actions.spec.ts
- **Root cause:** Dashboard helpers only recognised `NEXT_PUBLIC_E2E`, so with CI setting `E2E=true` the deterministic fixtures never initialised, leaving quick-action navigation waiting on live data.
- **Fix:** Normalise the E2E flag so both `process.env.E2E` and `NEXT_PUBLIC_E2E` activate the stubbed dashboard state.
  ```ts
  const e2eEnabled =
    process.env.NEXT_PUBLIC_E2E === "true" ||
    process.env.NEXT_PUBLIC_E2E === "1" ||
    process.env.E2E === "true" ||
    process.env.E2E === "1";
  if (e2eEnabled && typeof window !== "undefined") {
    window.__dashboardHistoryDatasets = E2E_DASHBOARD_HISTORY;
  }
  ```
  File: `app/admin/dashboard/AdminDashboardPageClient.tsx`.

### tests/admin-sidebar-overlay.spec.ts
- **Root cause:** On mobile the temporary drawer overlay could still sit above the sidebar because both shared similar stacking contexts.
- **Fix:** Raise the sidebar to `z-[60]` whenever the drawer is open so `elementFromPoint` always hits `#app-sidebar`.
  ```tsx
  sidebarOpen
    ? "translate-x-0 pointer-events-auto z-[60] md:z-auto"
    : "-translate-x-full …"
  ```
  File: `app/admin/dashboard/components/admin-sidebar.tsx`.

### tests/admin-signup-flow.spec.ts
- **Root cause:** The dashboard layout guard only checked `NEXT_PUBLIC_E2E`, so Playwright (which sets `E2E=true`) never redirected unverified accounts to the verification screen.
- **Fix:** Promote a shared `isE2EEnvironment` constant that recognises both env flags before consulting `localStorage`.
  ```ts
  const isE2EEnvironment =
    process.env.NEXT_PUBLIC_E2E === "1" ||
    process.env.NEXT_PUBLIC_E2E?.toLowerCase() === "true" ||
    process.env.E2E === "1" ||
    process.env.E2E?.toLowerCase() === "true";
  ```
  File: `app/admin/dashboard/layout.tsx`.

### tests/admin-tabs.spec.ts
- **Root cause:** Like the quick actions, tab navigation depended on seeded fixtures that never ran when only `E2E=true` was present, leaving the UI in a loading state instead of swapping sections.
- **Fix:** Reuse the normalised E2E detection in the dashboard client so every tab navigation immediately resolves against the mock data.
  ```ts
  const e2eEnabled =
    process.env.NEXT_PUBLIC_E2E === "true" ||
    process.env.NEXT_PUBLIC_E2E === "1" ||
    process.env.E2E === "true" ||
    process.env.E2E === "1";
  ```
  File: `app/admin/dashboard/AdminDashboardPageClient.tsx`.

### tests/blog-crud.spec.ts
- **Root cause:** The rich-text editor fallback only activated when `NEXT_PUBLIC_E2E` was set, so Playwright could not locate the labelled `textarea` when running with `E2E=true`.
- **Fix:** Extend the E2E detection to respect both env flags and ensure the TipTap surface keeps its `id` attribute in sync with the label.
  ```ts
  const isE2E =
    clientEnv.NEXT_PUBLIC_E2E === "1" ||
    clientEnv.NEXT_PUBLIC_E2E === "true" ||
    process.env.NEXT_PUBLIC_E2E === "1" ||
    process.env.NEXT_PUBLIC_E2E === "true" ||
    process.env.E2E === "1" ||
    process.env.E2E === "true";
  ```
  File: `app/admin/dashboard/components/blog-editor.tsx`.

### tests/login.spec.ts
- **Root cause:** The spec expects a single assertive alert containing “Authentication failed.” when credentials are rejected.
- **Fix:** Keep the error output scoped to one `[role="alert"]` inside an assertive live region so no duplicate alerts are exposed.
  ```tsx
  <div aria-live="assertive">
    {hasError && (
      <div
        id={alertId}
        role="alert"
        data-testid="auth-error"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm"
      >
        {alertMessage}
      </div>
    )}
  </div>
  ```
  File: `app/admin/login/AdminLoginForm.tsx`.

## Test Run
- `pnpm e2e` *(fails in this sandbox because the Playwright browser installer cannot reach the Ubuntu mirrors through the proxy and aborts with HTTP 403 responses.)* Logs: `8d6ac5†L1-L33`.