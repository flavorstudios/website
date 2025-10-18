# PR Plan

1. **ci: align pnpm toolchain and caches**
   - **Rationale:** Unblock all workflows by activating the pinned pnpm version and preventing "pnpm not found" regressions.
   - **Scope:** Update `ci.yml` and `e2e.yml` to enable Corepack, activate `pnpm@10.6.2`, and wire `cache-dependency-path` to `pnpm-lock.yaml`. Remove redundant cache steps and keep the version assertion script.
   - **Test plan:** Trigger CI on the branch, ensure install/lint/build/test steps complete, and verify the pnpm version log.
   - **Rollback plan:** Revert the workflow edits; no data migration.

2. **chore: enforce pnpm and dependency scanning**
   - **Rationale:** Prevent drift between lockfiles and surface vulnerable packages early.
   - **Scope:** Remove `package-lock.json`, add a lint or CI step that fails if npm/yarn locks are introduced, run `pnpm audit --json` with `audit-ci` (warn-only for now), and pin any critical CVE fixes.
   - **Test plan:** Run `pnpm install --frozen-lockfile`, `pnpm audit`, and ensure the new CI job passes locally.
   - **Rollback plan:** Restore removed files and CI steps via `git revert`.

3. **chore: tighten TypeScript & lint configuration**
   - **Rationale:** Restore Next.js defaults and catch unsafe patterns before runtime.
   - **Scope:** Disable `allowJs`, restore `moduleResolution: "bundler"`, gradually enable `skipLibCheck: false`, add missing ESLint plugins/rules (e.g., hooks), and add a `pnpm lint` gate in CI (promoting existing step to fail-on-error).
   - **Test plan:** Run `pnpm lint`, `pnpm test:unit`, and `pnpm build` locally to confirm type safety.
   - **Rollback plan:** Revert `tsconfig.json` and lint config changes.

4. **feat(api): harden public endpoints and error contracts**
   - **Rationale:** Close unauthenticated access to sensitive endpoints and deliver consistent responses.
   - **Scope:** Introduce a shared request validator, secure `indexnow` and `log-client-error` with secrets/rate limits, apply structured error helpers across `/api/contact` and cron routes, and add regression tests.
   - **Test plan:** Run `pnpm test:unit`, targeted integration tests for hardened routes, and manual smoke via `pnpm dev` curl checks.
   - **Rollback plan:** Revert affected route modules and helper utilities.

5. **feat(logging): add redaction-aware logger middleware**
   - **Rationale:** Prevent secrets/PII from leaking into logs and add correlation IDs.
   - **Scope:** Implement a logger utility with redaction, wrap API handlers, and add request IDs in responses/logs. Update cron and admin auth flows to use it.
   - **Test plan:** Run unit tests for logger helpers and smoke API routes to confirm headers/log output.
   - **Rollback plan:** Revert logger modules and API wiring.

6. **perf(next): analyze bundles and optimize critical paths**
   - **Rationale:** Reduce bundle size and improve LCP on marketing pages.
   - **Scope:** Enable the Next.js bundle analyzer behind an env flag, lazy-load heavy admin/editor chunks, audit `next/image` usage, and document results.
   - **Test plan:** Run `ANALYZE=true pnpm build`, capture before/after stats, and run Lighthouse locally.
   - **Rollback plan:** Revert performance tuning commits.

7. **test: establish unit/integration harness with coverage gates**
   - **Rationale:** Ensure critical API and component behavior stays covered.
   - **Scope:** Configure Jest/Playwright coverage thresholds, add sample integration tests for admin auth and media APIs, and wire coverage uploads to CI artifacts.
   - **Test plan:** Run `pnpm test`, `pnpm e2e`, and confirm coverage summary meets thresholds.
   - **Rollback plan:** Revert test configuration changes.

8. **docs: refresh contributor onboarding and security guidance**
   - **Rationale:** Make environment setup deterministic and communicate CI expectations.
   - **Scope:** Update `README.md` with pnpm/corepack instructions, add `CONTRIBUTING.md`/`SECURITY.md` sections on reporting and env vars, and document new CI steps.
   - **Test plan:** Markdown lint (if available) or manual proofread; ensure links resolve.
   - **Rollback plan:** Revert documentation files.