# E2E Audit – Admin Playwright Fixes

## Failure Analysis

### tests/admin-dashboard.spec.ts · tests/admin-dashboard-auth.spec.ts · tests/admin-dashboard-refresh.spec.ts
- **Root cause:** The dashboard client gated the entire shell behind a hydration check, so Playwright never saw the SSR headings while `data-testid="dashboard-loading"` was present, and the value fields disappeared whenever the React Query cache was empty.
- **Change:** Removed the hydration early-return, kept the overview section mounted with placeholder stats, and introduced an inline loading banner that lives alongside the metric cards so the headings/tests stay visible while data resolves.
  ```tsx
  if (showInitialSpinner || (statsLoading && !stats)) {
-    return (
-      <div className="flex items-center justify-center h-64" data-testid="dashboard-loading">…</div>
-    );
-  }
+  const isInitialLoading = showInitialSpinner || (statsLoading && !stats);
+  return (
+    <div className="space-y-6" aria-busy={isInitialLoading || statsQuery.isFetching}>
+      {isInitialLoading && (
+        <div data-testid="dashboard-loading">Loading Admin Dashboard…</div>
+      )}
+      …
+      <p data-testid="total-posts-value">{effectiveStats.totalPosts}</p>
  ```
  Files: `app/admin/dashboard/AdminDashboardPageClient.tsx`, `app/admin/dashboard/components/dashboard-overview.tsx`.

### tests/admin-dashboard-error.spec.ts
- **Root cause:** 5xx responses bubbled into a generic spinner that never surfaced the diagnostic code or retry affordance, so the test could not find `dashboard-error` nor `dashboard-error-code`.
- **Change:** Added a dedicated fatal error block with assertive messaging, the `DASHLOAD_5XX` code, and the “Retry Dashboard” button that triggers a client-side refetch.
  ```tsx
  if (fatalError) {
+    const code = diagnosticCode || "DASHLOAD_NETWORK";
+    return (
+      <div data-testid="dashboard-error">
+        <div role="status" aria-live="assertive">
+          …
+          <p data-testid="dashboard-error-code">{code}</p>
+          <Button onClick={refresh}>Retry Dashboard</Button>
+        </div>
+      </div>
+    );
+  }
  ```
  File: `app/admin/dashboard/components/dashboard-overview.tsx`.

### tests/admin-dashboard-growth.spec.ts · tests/admin-dashboard-progress.spec.ts
- **Root cause:** The growth copy disappeared while data loaded and the Radix progress root echoed out-of-range floating values, so the assertions for `+10% …` and clamped `aria-valuenow` failed.
- **Change:** Reused the computed `monthlyGrowth` for display even during placeholders and clamped the UI progress component to integer percentages with explicit `aria-valuemin/max` attributes.
  ```tsx
  -  const sign = stats.monthlyGrowth > 0 ? "+" : …;
+  const monthlyGrowth = effectiveStats.monthlyGrowth;
+  const sign = monthlyGrowth > 0 ? "+" : …;
  …
-  style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
+  const percentage = Math.round((clampedValue / numericMax) * 100);
+  style={{ transform: `translateX(-${100 - percentage}%)` }}
  ```
  Files: `app/admin/dashboard/components/dashboard-overview.tsx`, `components/ui/progress.tsx`.

### tests/dashboard-history.spec.ts
- **Root cause:** Returning early with the full-screen loader prevented the chart container from mounting when the first response arrived, so `window.__dashboardHistoryDatasets` was never populated for the probe.
- **Change:** Kept the overview card rendered with placeholder stats while the inline loader is visible, letting the history effect emit datasets as soon as any non-zero metric appears.
  ```tsx
  if (showInitialSpinner || (statsLoading && !stats)) return <div data-testid="dashboard-loading">…</div>;
+  const isInitialLoading = showInitialSpinner || (statsLoading && !stats);
+  return (
+    <div aria-busy={isInitialLoading || statsQuery.isFetching}>
+      {isInitialLoading && <div data-testid="dashboard-loading">…</div>}
+      …
+    </div>
+  );
  ```
  File: `app/admin/dashboard/components/dashboard-overview.tsx`.

  ### tests/admin-dashboard-blog-fallback.spec.ts
- **Root cause:** The suspense fallback only rendered animated skeletons without a heading, so the spec never observed “Blog Manager” before SWR finished.
- **Change:** Injected a semantic heading/subtitle into the fallback and renamed the manager header to “Blog Manager” in both loading and hydrated states so the locator can succeed immediately.
  ```tsx
+  <header className="space-y-1">
+    <h2 className="text-2xl font-semibold text-foreground">Blog Manager</h2>
+    <p className="text-sm text-muted-foreground">Blog Management</p>
+  </header>
  ```
  Files: `app/admin/dashboard/AdminDashboardPageClient.tsx`, `app/admin/dashboard/components/blog-manager.tsx`.

### tests/admin-quick-actions.spec.ts
- **Root cause:** Because the whole dashboard DOM vanished during hydration, the “Loading Admin Dashboard…” banner remained mounted across navigations, so the quick-actions assertion never cleared.
- **Change:** Switched to an inline loader that unmounts once the first query settles, allowing the quick-action routes to render without the stale banner.
  ```tsx
  {isInitialLoading && (
+        <div data-testid="dashboard-loading">Loading Admin Dashboard...</div>
+      )}
  ```
  File: `app/admin/dashboard/components/dashboard-overview.tsx`.

### tests/media.spec.ts
- **Root cause:** The E2E flag only checked `NEXT_PUBLIC_E2E`, so CI (which sets `E2E=true`) skipped the deterministic fallback table, leaving no rows or “Load More” behaviour for the spec.
- **Change:** Reused the shared `isClientE2EEnabled()` detector so the media library always serves the fixture rows in CI, including the accessible action and pagination stub.
  ```tsx
-  if (clientEnv.NEXT_PUBLIC_E2E === "true" || clientEnv.NEXT_PUBLIC_E2E === "1") {
+  if (isClientE2EEnabled()) {
     return <MediaLibraryE2ETable … />;
   }
  ```
  File: `app/admin/dashboard/components/media/MediaLibrary.tsx`.

## Test Run
- `pnpm e2e` *(fails in this environment – Playwright cannot install system dependencies behind the sandbox proxy and aborts with apt 403 errors.)* Logs: `c13554†L1-L24`.