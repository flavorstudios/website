# Runtime Toaster Error Audit

## Summary
A client-side `TypeError` was triggered by the global `Toaster` component while rendering the application shell. The error message (`Cannot read properties of null (reading 'useState')`) originated from the `sonner` package that powers toast notifications. The failure occurred before the rest of the page could hydrate, so the experience regressed for all routes.

## Root Cause Analysis
- The `components/ui/toaster.tsx` module imported `sonner` directly. Although the file is marked with `'use client'`, Next.js still attempts to evaluate the module graph on the server during the build and initial render phase.
- `sonner`'s ESM bundle expects to run in a fully client-side React runtime. When it is eagerly evaluated on the server it falls back to a stubbed `react` export whose default value is `null`, so any call to `React.useState` inside `sonner` throws.
- Because the `Toaster` component sits inside `app/layout.tsx`, the failure happens for every page load and completely blocks hydration.

## Solutions That Preserve Existing Behavior
1. **Lazy-load the Sonner Toaster only on the client.**
   - Wrap the `sonner` import in a dynamic, client-only boundary (`next/dynamic` with `ssr: false`).
   - Continue forwarding the existing toast configuration (`position`, `toastOptions`, `richColors`) so the previously tuned UX is unchanged.
2. **Keep the `toast` helper available without duplicating configuration.**
   - Re-export the `toast` function from `components/ui/toast.tsx` while reusing the safe default export from `components/ui/toaster.tsx`.
3. **Testing guidance.**
   - After the lazy import is in place, run `pnpm dev` and hit any route; confirm the layout renders and toasts can be triggered without console errors.
   - Optionally add an automated smoke test that mounts the layout in a Jest/RTL environment to catch regressions earlier.

These steps avoid rolling back prior customization work while ensuring the notification system no longer breaks hydration.