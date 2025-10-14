# E2E Audit – Admin Playwright Fixes

## Failure Analysis

### tests/admin-login-legal-visual.spec.ts
- **Root cause:** The legal notice column could not shrink, so the paragraph wrapped across multiple lines on tablet and desktop snapshots.
- **Fix:** Allow the container to collapse with `min-w-0` and force the paragraph into a single truncated line with Tailwind's ellipsis utilities.
  ```diff
- <div className="legal-notice-wrapper min-w-0 flex-1">
-   <p className="legal-notice ...">By continuing you agree …</p>
- </div>
+ <div className="min-w-0 flex-1">
+   <p className="block max-w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs text-muted-foreground">
+     © Flavor Studios · <Link href="/terms-of-service">Terms</Link> · <Link href="/privacy-policy">Privacy</Link> · …
+   </p>
+ </div>
  ```
  File: `app/admin/login/AdminLoginForm.tsx`.

### tests/admin-quick-actions.spec.ts
- **Root cause:** The quick action shortcuts lived in a dropdown menu, so the visible buttons the test clicks never existed and no routes were pushed.
- **Fix:** Replace the dropdown with a button group that pushes the expected dashboard routes on click.
  ```diff
- <DropdownMenuItem onClick={() => navigate("/admin/dashboard/blog-posts")}>Create New Post</DropdownMenuItem>
+ <Button variant="outline" onClick={() => router.push("/admin/dashboard/blog-posts")}>Create New Post</Button>
  ```
  File: `app/admin/dashboard/components/quick-actions.tsx`.

### tests/admin-sidebar-overlay.spec.ts & tests/admin-tabs.spec.ts
- **Root cause:** The mobile sidebar relied on a template string that sometimes left the drawer at a lower stacking order than the overlay, so hit-testing and link clicks hit the backdrop instead of `#app-sidebar`.
- **Fix:** Consolidated the class logic with `cn`, always mounting the drawer as `fixed … z-50` when open while keeping the desktop sticky behaviour.
  ```diff
- className={`… ${sidebarOpen ? "translate-x-0 pointer-events-auto z-50" : "-translate-x-full … z-30"}`}
+ className={cn("flex …", sidebarOpen
+   ? "translate-x-0 pointer-events-auto z-50 md:z-auto"
+   : "-translate-x-full pointer-events-none z-40 md:translate-x-0 md:pointer-events-auto")}
  ```
  File: `app/admin/dashboard/components/admin-sidebar.tsx`.

### tests/admin-signup-flow.spec.ts
- **Root cause:** The dashboard layout allowed unverified admins through whenever `NEXT_PUBLIC_E2E` was set to anything truthy, so Playwright's `NEXT_PUBLIC_E2E=1` runs were not consistently redirected.
- **Fix:** Gate the redirect strictly on `NEXT_PUBLIC_E2E === "1"` before checking the `admin-test-email-verified` flag.
  ```diff
- if (!isE2EMode || typeof window === "undefined") return;
+ if (process.env.NEXT_PUBLIC_E2E !== "1" || typeof window === "undefined") return;
  ```
  File: `app/admin/dashboard/layout.tsx`.

### tests/login.spec.ts
- **Root cause:** The form needed to expose a single assertive alert containing the "Authentication failed." copy.
- **Fix:** Keep the error message inside one `aria-live="assertive"` wrapper with a single `<div role="alert">` (now also benefiting from the updated legal copy block above).
  ```tsx
  <div aria-live="assertive">
    {hasError && (
      <div role="alert" data-testid="auth-error">Authentication failed.</div>
    )}
  </div>
  ```
  File: `app/admin/login/AdminLoginForm.tsx`.

### tests/blog-crud.spec.ts
- **Root cause:** The rich text editor must remain discoverable via the "Content" label for Playwright's `getByLabel(/content/i)` locator.
- **Fix:** The editor keeps its labelled wiring via `aria-label="Content"` and `aria-labelledby`, enabling `Locator.fill` on the contenteditable node.
  ```tsx
  <RichTextEditor
    id={contentEditorId}
    ariaLabelledBy={contentLabelId}
    ariaLabel="Content"
  />
  ```
  File: `app/admin/dashboard/components/blog-editor.tsx`.

## Test Run
- `NEXT_PUBLIC_E2E=1 pnpm e2e` *(fails in this sandbox because the Playwright browser installation attempts to apt-get Chromium dependencies and every Ubuntu mirror returns HTTP 403 via the proxy.)* Logs: `9208af†L1-L27`.