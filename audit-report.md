# Audit Report

## Key Findings

### Lint & Type Safety
- TypeScript flagged missing optional chaining in the admin search API and several outdated tests that mutated read-only `process.env` fields or used stale fixtures. These issues caused `pnpm typecheck` to fail and blocked the build. 【F:app/api/admin/search/route.ts†L33-L77】【F:lib/__tests__/blog.test.ts†L1-L36】【F:lib/__tests__/cookie-consent.test.ts†L19-L45】【F:lib/__tests__/formatters.test.ts†L59-L118】【F:lib/__tests__/media.test.ts†L1-L37】【F:lib/__tests__/settings.test.ts†L80-L109】
- Jest suites regressed after the preview flow refactor; mocks targeted the old `validatePreviewTokenOrThrow` helper and direct autosave hook imports, leading to runtime failures. 【F:app/admin/preview/__tests__/preview-route.test.ts†L1-L204】【F:app/admin/dashboard/components/__tests__/blog-editor.test.tsx†L1-L78】

### Performance & DX
- The marketing blog renderer still used a raw `<img>` fallback, bypassing Next.js image optimization and violating lint rules. This also risked layout shifts on unsupported domains. 【F:components/blog/BlogRenderer.tsx†L116-L140】
- Several server-only modules lacked `server-only` barriers, allowing the bundler to attempt client-side evaluation. This inflated bundles and risked leaking Node-only logic. 【F:lib/cron.ts†L1-L6】【F:lib/system-store.ts†L1-L6】【F:lib/activity-log.ts†L1-L6】

### Accessibility & QA
- The new Playwright accessibility smoke test existed but was not integrated with CI. Ensuring it runs regularly guards against regressions in public and admin surfaces. 【F:e2e/accessibility-smoke.e2e.spec.ts†L1-L21】

### Security & Environment
- Hardened environment validation now rejects missing critical secrets, but the build requires explicit env wiring or the `USE_DEFAULT_ENV` escape hatch. Documentation and CI needed updates to reflect the stricter contract. 【F:scripts/validate-env.ts†L1-L132】【F:README.md†L36-L122】

## Actions Taken
- Restored type safety by applying optional chaining/guards in search results, cloning mutable fixtures, and aligning tests with the new preview validator and env helpers so `pnpm typecheck` passes cleanly. 【F:app/api/admin/search/route.ts†L33-L77】【F:lib/__tests__/blog.test.ts†L1-L36】【F:lib/__tests__/formatters.test.ts†L59-L118】【F:app/admin/preview/__tests__/preview-route.test.ts†L1-L204】
- Modernized the blog renderer to rely exclusively on `next/image`, automatically toggling `unoptimized` for external domains to satisfy lint and improve CLS. 【F:components/blog/BlogRenderer.tsx†L116-L140】
- Updated Jest suites to use resilient mocks (`jest.requireMock`) and pass-through guards, preventing hoist ordering issues and ensuring preview errors render deterministically. 【F:app/admin/dashboard/components/__tests__/blog-editor.test.tsx†L1-L78】【F:app/admin/preview/__tests__/preview-route.test.ts†L1-L204】
- Verified accessibility by wiring the axe-core Playwright smoke test into the repo and ensuring it exercises key public/admin routes. 【F:e2e/accessibility-smoke.e2e.spec.ts†L1-L21】
- Documented the stricter env requirements and Node 22 toolchain in the README while keeping `scripts/validate-env` fail-fast for missing secrets. 【F:README.md†L36-L122】【F:scripts/validate-env.ts†L1-L132】

## Follow-ups
1. Investigate bundling or vendoring Google Fonts (or set `NEXT_FONT_IGNORE_FAILED_DOWNLOADS`) so `pnpm build` succeeds without external network access. 【dc57c6†L1-L18】
2. Ensure CI/Vercel environment variables (`BASE_URL`, `CRON_SECRET`, `PREVIEW_SECRET`, `ADMIN_JWT_SECRET`, `NEXT_PUBLIC_BASE_URL`, Firebase config) are populated with non-placeholder values to satisfy the stricter validation. 【F:scripts/validate-env.ts†L1-L132】
3. Monitor bundle output once the analyzer runs; additional dynamic imports may be warranted for rarely used admin widgets. 【F:package.json†L11-L76】