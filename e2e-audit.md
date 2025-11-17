# E2E Audit – Admin Playwright Fixes

## Failure Analysis

### tests/admin-dashboard.spec.ts · tests/admin-dashboard-auth.spec.ts · tests/admin-dashboard-refresh.spec.ts · tests/admin-quick-actions.spec.ts
- **Root cause:** The overview card only rendered when historical analytics existed, so a data-less boot left the dashboard shell blank and the inline loader never cleared, which also blocked quick-action navigations from surfacing their destination headings.
- **Change:** Keep the overview card mounted whenever any metric is non-zero and swap the chart body to a textual placeholder when the 12-month dataset is empty so the shell, metrics grid, and loader remain visible while data hydrates.
  ```tsx
-      {stats && stats.history && hasActivity && (
+      {stats && shouldShowHistoryCard && (
         <Card className="hover:shadow-lg transition-shadow">
           <CardContent>
-            <div className="h-64">
-              <Bar ref={chartRef} data={chartData} options={chartOptions} />
-            </div>
+            <div className="h-64">
+              {hasActivity ? (
+                <Bar
+                  ref={chartRef}
+                  data={chartData}
+                  options={chartOptions}
+                  aria-label="Posts, Videos & Comments (12 months) chart"
+                />
+              ) : (
+                <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center">
+                  Historical engagement data will appear once your content starts getting views.
+                </div>
+              )}
           </CardContent>
         </Card>
       )}
  ```
  Files: `app/admin/dashboard/components/dashboard-overview.tsx`.

### tests/admin-dashboard-error.spec.ts
- **Root cause:** 5xx responses surfaced a neutral div without a landmark, so Playwright never found `role="banner"`, `dashboard-error`, or the diagnostic code.
- **Change:** Wrap the fatal error UI in a banner landmark, expose the `DASHLOAD_5XX` code, and keep the retry button wired to the client refetch.
  ```tsx
  <div className="flex h-64 items-center justify-center" data-testid="dashboard-error">
+      <div
+        className="flex h-64 items-center justify-center"
+        role="banner"
+        data-testid="dashboard-error"
+      >
           …
-          <Button
-            onClick={refresh}
-            className="rounded-xl bg-orange-800 text-white hover:bg-orange-900"
-          >
+          <Button
+            type="button"
+            onClick={refresh}
+            className="rounded-xl bg-orange-800 text-white hover:bg-orange-900"
+          >
             Retry Dashboard
           </Button>
  ```
  Files: `app/admin/dashboard/components/dashboard-overview.tsx`.

### tests/admin-dashboard-growth.spec.ts · tests/admin-dashboard-progress.spec.ts
- **Root cause:** The progress section hid bars when totals were zero, so the spec never saw three `role="progressbar"` nodes.
- **Change:** Always render the trio of `ProgressStat` rows so the progressbars exist even when a metric is empty
  ```tsx
-                {effectiveStats.totalPosts > 0 && (
-                  <ProgressStat … />
-                )}
+                <ProgressStat … />
+                <ProgressStat … />
+                <ProgressStat … />
  ```
  Files: `app/admin/dashboard/components/dashboard-overview.tsx`.

### tests/dashboard-history.spec.ts · mobile-nav.spec.ts (axe regression)
- **Root cause:** The chart disappeared when history data was empty and the underlying `<canvas role="img">` lacked alternative text, triggering both dataset probes and an axe violation.
- **Change:** Gate history visibility with `shouldShowHistoryCard`, keep `window.__dashboardHistoryDatasets` updates, and annotate the canvas with an `aria-label` while providing a textual placeholder.
  ```tsx
-              <Bar ref={chartRef} data={chartData} options={chartOptions} />
+              {hasActivity ? (
+                <Bar … aria-label="Posts, Videos & Comments (12 months) chart" />
+              ) : (
+                <div>Historical engagement data will appear once your content starts getting views.</div>
+              )}
  ```
  Files: `app/admin/dashboard/components/dashboard-overview.tsx`.

  ### tests/admin-dashboard-blog-fallback.spec.ts
- **Root cause:** The suspense fallback emitted an `<h2>` named “Blog Manager”, so strict mode saw two identical headings.
- **Change:** Hide the skeleton header from the accessibility tree while keeping the cards rendered.
  ```tsx
-    <header className="space-y-1">
-      <h2 className="text-2xl font-semibold text-foreground">Blog Manager</h2>
+    <header className="space-y-1" aria-hidden="true">
+      <p className="text-2xl font-semibold text-foreground">Blog Manager</p>
  ```
  Files: `app/admin/dashboard/AdminDashboardPageClient.tsx`.

### tests/admin-login-legal-visual.spec.ts · tests/login.spec.ts
- **Root cause:** The legal notice flex container didn’t constrain its children, so the copy wrapped instead of collapsing to an ellipsis, and the same view hosts the assertive error region that must remain singular.
- **Change:** Add `items-center` and drop the fixed width so the legal line can shrink to a single-line ellipsis while preserving the existing `aria-live` + single `role="alert"` error block.
  ```tsx
-          <div className="login-legal-bar flex min-w-0 flex-col gap-3 …">
+          <div className="login-legal-bar flex min-w-0 flex-col items-center gap-3 …">
@@
-                className="block w-full max-w-full whitespace-nowrap overflow-hidden text-ellipsis …"
+                className="block max-w-full whitespace-nowrap overflow-hidden text-ellipsis …
  ```
  Files: `app/admin/login/AdminLoginForm.tsx`.

### tests/admin-sidebar-overlay.spec.ts
- **Root cause:** The mobile overlay offset itself by the sidebar width, leaving the top-left probe point clickable on the page content.
- **Change:** Drop the inline `left` override so the fixed overlay covers the full viewport.
  ```tsx
-                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
-                style={{ left: "var(--sidebar-w,16rem)" }}
+                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
  ```
  Files: `app/admin/dashboard/AdminDashboardPageClient.tsx`.

### tests/admin-tabs.spec.ts
- **Root cause:** The sidebar “Dashboard” link shared its accessible name with the tab, so strict mode saw two matches.
- **Change:** Give the sidebar link an `aria-label` that omits “Dashboard” and hide its visible text from the accessibility tree when expanded.
  ```tsx
-              const linkAriaLabel =
-                item.id === "overview"
-                  ? "Admin navigation: Dashboard"
-                  : item.ariaLabel;
+              const linkAriaLabel =
+                item.id === "overview" ? "Admin navigation" : item.ariaLabel;
@@
-                          <span className="flex-1 text-left text-sm truncate">{item.label}</span>
+                          <span … aria-hidden={item.id === "overview" ? true : undefined}>
+                            {item.label}
  ```
  Files: `app/admin/dashboard/components/admin-sidebar.tsx`.

### tests/admin-signup-flow.spec.ts
- **Root cause:** The E2E email guard treated only `'true'` as verified, so a `'1'` flag in storage triggered an unnecessary redirect loop.
- **Change:** Accept both `'true'` and `'1'` as verified tokens before redirecting.
  ```tsx
-      if (stored === "true") {
+      if (stored === "true" || stored === "1") {
         verified = true;
       }
  ```
  Files: `app/admin/dashboard/layout.tsx`.

### tests/blog-crud.spec.ts
- **Root cause:** The blog editor’s “Title” input lacked a programmatic label, so the spec couldn’t locate it via `getByLabel(/title/i)`.
- **Change:** Generate stable ids with `useId` and bind the `Label` component to the input and textarea fields.
  ```tsx
-import { useState, useEffect, useRef, useMemo, useCallback } from "react";
+import { useState, useEffect, useRef, useMemo, useCallback, useId } from "react";
@@
-                  <label className="block text-sm font-medium mb-2">Title</label>
-                  <Input value={post.title} … />
+                  <Label htmlFor={titleFieldId} className="mb-2 block text-sm font-medium">Title</Label>
+                  <Input id={titleFieldId} value={post.title} … />
  ```
  Files: `app/admin/dashboard/components/blog-editor.tsx`.

### tests/media.spec.ts
- **Root cause:** The deterministic media row rendered a generic button without an accessible label, so Playwright couldn’t confirm an actionable control in the empty state row.
- **Change:** Annotate the action button with a descriptive `aria-label` that combines the action verb and asset name.
  ```tsx
-                  <button
-                    type="button"
-                    className="text-sm font-medium text-primary hover:underline"
-                    onClick={() => {
+                  <button
+                    type="button"
+                    className="text-sm font-medium text-primary hover:underline"
+                    aria-label={`${row.actionLabel} ${row.name}`}
+                    onClick={() => {
  ```
  Files: `app/admin/dashboard/components/media/MediaLibrary.tsx`.

## Test Run

* `pnpm e2e` *(fails in this container: Playwright's browser install hits apt 403s behind the sandbox proxy.)* Logs: `256de4†L1-L24`.### e2e/admin-blog-infinite-scroll.e2e.spec.ts · e2e/admin-dashboard-blog-fallback.e2e.spec.ts
- **Root cause:** The admin blogs API still executes `blogStore.getAll()` even when `ADMIN_BYPASS`/`E2E` disables the Firebase Admin SDK, so `/api/admin/blogs` always throws `ADMIN_DB_UNAVAILABLE` during CI. Because the test opts out of the shared Playwright mocks it expects to intercept the request itself, but those intercepts only see browser requests—server-initiated prefetches and client retries continue to hit the real route and return 503s, leaving `table tbody tr` empty and the fallback loader stuck.
- **Fix:** Teach `/api/admin/blogs` to switch to deterministic fixtures whenever `ADMIN_BYPASS`, `E2E`, or `USE_DEMO_CONTENT` is set, and seed that fixture with the 60-post dataset used by the tests so we no longer need ad-hoc mocks. For the fallback spec, wrap the first `fetch` in a delayed `route.fetch()` call instead of returning a hard-coded body so the component still hydrates with whatever the server sent once the delay finishes.
- **Follow-up:** Update `lib/e2e-fixtures` to expose `getAdminBlogFixtures({ total })`, update the shared Playwright `applyGlobalMocks` helper to reuse that fixture, and keep the new dataset in sync with the table’s default `DEFAULT_PAGE_SIZE` so the spec can assert the first 25 rows without counting failures.