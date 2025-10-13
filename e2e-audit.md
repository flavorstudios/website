# E2E Audit – Admin Playwright Fixes

## Failure Analysis
- **admin-login-legal-visual.spec.ts** (tablet + desktop viewport snapshot)
  - **Root cause:** The flex wrapper around the legal notice lacked `min-width: 0`, so the copy wrapped to two lines before the ellipsis styles could take effect.
  - **Fix:** Applied `min-w-0` on the wrapper and an explicit `block max-w-full overflow-hidden text-ellipsis whitespace-nowrap` on the paragraph. File: `app/admin/login/AdminLoginForm.tsx`.
  - **Before → After:** Multiline disclaimer at wider breakpoints → single-line string that truncates with an ellipsis.
  - **Before → After:** From multiline wrapping that broke the snapshot to a stable single-line string with ellipsis.
- **admin-quick-actions.spec.ts**
  - **Root cause:** The dashboard quick-action buttons relied on implicit navigation and occasionally performed a no-op click in tests.
  - **Fix:** Marked each quick-action `Button` as `type="button"`, added deterministic `aria-label`s, and kept the explicit `router.push` handler. File: `app/admin/dashboard/components/dashboard-overview.tsx`.
  - **Before → After:** Indeterminate click behaviour → explicit client-side navigation to `/admin/dashboard/*` routes.
- **admin-sidebar-overlay.spec.ts**
  - **Root cause:** The mobile drawer rendered beneath a higher z-index wrapper, so Playwright’s top-element probe never resolved to `#app-sidebar`.
  - **Fix:** Raised the sidebar’s stacking context, tagged it with `data-state`, and elevated the sheet content to `z-[1000]`. Files: `app/admin/dashboard/components/admin-sidebar.tsx`, `app/admin/dashboard/components/admin-layout.tsx`.
  - **Before → After:** Overlay wrapper intercepted hit testing → `#app-sidebar` is the uppermost element while open.
- **admin-signup-flow.spec.ts** (unverified redirect + “I have verified” CTA)
  - **Root cause:** The guards ignored `NEXT_PUBLIC_E2E=1`, so unverified users reached the dashboard and the verify CTA failed to persist the test flag.
  - **Fix:** Added a client-side guard in `app/admin/dashboard/layout.tsx` that honours the flag and redirects to `/admin/verify-email` until `admin-test-email-verified` is `true`, and updated the verify screen to initialise and flip that key in test mode. Files: `app/admin/dashboard/layout.tsx`, `app/admin/verify-email/VerifyEmailClient.tsx`.
  - **Before → After:** E2E runs bypassed verification → deterministic redirect loop that clears once the CTA stores `true`.
- **admin-tabs.spec.ts**
  - **Root cause:** The drawer’s stacking context prevented reliable link activation while the sidebar was open on mobile.
  - **Fix:** The same z-index adjustments above ensure each `Link` receives the click and updates the URL. Files: `app/admin/dashboard/components/admin-sidebar.tsx`, `app/admin/dashboard/components/admin-layout.tsx`.
  - **Before → After:** Drawer container consumed taps → sidebar links navigate to their `/admin/dashboard/*` destinations.
- **blog-crud.spec.ts**
  - **Root cause:** The TipTap editor exposed only generated IDs, so `getByLabel(/content/i)` could not find a stable association.
  - **Fix:** Introduced deterministic IDs (`blog-post-content-editor`) and wired the `<label>`/`aria-labelledby` pair accordingly. File: `app/admin/dashboard/components/blog-editor.tsx`.
  - **Before → After:** Anonymous contenteditable → labelled editor discoverable via `label=Content`.
- **login.spec.ts** (a11y assertion)
  - **Root cause:** The auth provider rendered an extra `<Alert role="alert">`, and the login form surfaced varying error messages, violating the “single alert with “Authentication failed.”” requirement.
  - **Fix:** Demoted the provider alert to `role="status"`, constrained the login alert to a constant message, and moved detailed errors into a polite region. Files: `components/AdminAuthProvider.tsx`, `app/admin/login/AdminLoginForm.tsx`.
  - **Before → After:** Multiple assertive regions with varying copy → one assertive alert containing exactly “Authentication failed.”.
- **skip-link.spec.tsx**
  - **Root cause:** The skip link relied on default hash navigation, which didn’t always transfer focus into `<main>` under automation.
  - **Fix:** Force-focus the link on initial Tab and move focus to `#main-content` on the next animation frame. File: `components/skip-link.tsx`.
  - **Before → After:** Hash jump without guaranteed focus → predictable focus transition into the main landmark.

## Test Run
- `pnpm e2e` *(fails in this sandbox because `playwright install --with-deps` cannot reach the Ubuntu mirrors; apt returns HTTP 403 so the browsers never install).* Logs: `a1b479†L1-L24`.

## Notes
- `app/admin/verify-email/VerifyEmailClient.tsx` seeds `admin-test-email-verified` in localStorage when missing so repeated runs begin unverified.
- The skip link tweak keeps the link hidden by default yet guarantees visibility and focus management on Tab.