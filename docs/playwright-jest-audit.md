# Playwright vs. Jest Test Runner Audit

## Summary
* `pnpm test` runs Jest, but Jest currently picks up Playwright suites (for example `tests/admin-dashboard-auth.spec.ts` and `e2e/blog-detail.spec.ts`) because they share the default `.spec.ts` naming convention. When Jest loads these suites it throws because Playwright's `test` function refuses to execute inside Jest.
* The continuous integration log shows 39 suites failing for this reason, confirming that Jest is traversing every Playwright file during its discovery phase.

## Root Cause Details
* `jest.config.mjs` relies on the default Jest `testMatch`, which includes `**/*.spec.[jt]s?(x)`. There are many Playwright files living under `tests/` and `e2e/` that match this glob and import `@playwright/test`. 【F:jest.config.mjs†L1-L19】【F:tests/admin-dashboard-auth.spec.ts†L1-L18】【F:e2e/blog-detail.spec.ts†L1-L18】
* At the same time there are real Jest suites that still use the `.spec.tsx` suffix (for example `tests/admin-dashboard-prefetch.spec.tsx`). That means we cannot simply drop `.spec` from the glob without migrating those Jest suites. 【F:tests/admin-dashboard-prefetch.spec.tsx†L1-L48】

## Recommended Remediation (preserving existing test logic)

### 1. Adopt an explicit naming convention for Playwright files
* **Option A (rename Playwright files):** Rename Playwright suites to a dedicated suffix such as `*.pw.spec.ts` or move them under `e2e/` with that suffix. Update `playwright.config.ts` so its `testMatch` only includes that suffix. Doing so isolates the files without touching their contents.
* **Option B (folder segregation):** Move every Playwright suite out of `tests/` into `e2e/` (or a similar directory) and keep Jest-only files in `tests/`. Again, update `playwright.config.ts` to match the new paths.

### 2. Narrow Jest's discovery patterns
Once the Playwright files have been renamed or relocated, add an explicit `testMatch` to `jest.config.mjs` that includes both the Jest `.test` files **and** any remaining Jest `.spec` files, while ignoring the new Playwright naming pattern. For example:

```ts
const config = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(spec|test).[tj]s?(x)',
    '<rootDir>/**/*.(test).[tj]s?(x)',
    '<rootDir>/tests/**/*.(spec).[tj]s?(x)', // keep legacy Jest specs
  ],
  testPathIgnorePatterns: ['<rootDir>/**/?(*.)+pw.spec.[tj]s?(x)', '<rootDir>/e2e/'],
};
```

This keeps all existing Jest suites runnable without modification, while guaranteeing that anything following the Playwright naming convention is skipped.

### 3. Guard CI commands
* Ensure the CI script that runs Jest (`pnpm test`) does **not** execute `pnpm exec playwright test`. Conversely, keep the Playwright run in a separate workflow step invoking `pnpm exec playwright test` directly. This prevents future regressions where Jest and Playwright overlap.

### 4. Backfill documentation
* Document the naming convention in `README-ADMIN.md` or the contributor guide so future contributors understand which suffix to pick for Jest vs. Playwright suites.

Following the steps above maintains all current test logic while resolving the Playwright/Jest runner conflict that is breaking `pnpm test` in CI.