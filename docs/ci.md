# Continuous Integration

Flavor Studios uses GitHub Actions to lint, test, and audit every change. This document summarises the workflows, the permissions each job runs with, and how caching keeps runtimes predictable.

## Workflow overview

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `CI` | Push / PR to `main` or `develop` | Lint, unit tests, Firebase emulator tests, Playwright smoke, Next.js build |
| `E2E` | Push to `main`, any PR | Production-like Playwright suite running on the hosted runner |
| `Visual snapshots` | Manual dispatch, PR label | Update or verify Playwright image snapshots |
| `Lockfile Check` | Push / PR to `main` or `develop` | Ensures the pnpm lockfile is committed when dependencies change |
| `Search Engine Ping & Audit` | Push to `main`, manual dispatch | Notify search engines and capture SEO audit logs |
| `CodeQL` | Push / PR to `main` or `develop`, weekly cron | Static analysis for JavaScript/TypeScript code |

## Permissions

All workflows default to `contents: read`. Jobs elevate permissions only when required:

- `Visual snapshots` → `contents: write` to push approved snapshot updates back to the PR branch.
- `CodeQL` → `security-events: write` to upload alerts to the code scanning dashboard.

No workflow requests repository-wide write access; release jobs authenticate with dedicated deploy keys or secrets.

## Caching

- `actions/setup-node@v4` enables pnpm caching using `cache: pnpm` and locks to the Node version defined in `.nvmrc`.
- `actions/cache@v4` restores the Next.js build cache and Firebase emulators.
- pnpm’s global store directory is pinned to `~/.pnpm-store` for deterministic cache keys.

## Environment & secrets

Secrets are injected with `permissions: contents: read` tokens. Forked pull requests run without Firebase credentials; those steps are guarded so tests that require secrets are skipped or use stub values. Rotate secrets via the repository settings when you see audit warnings or credential leaks.

## Local parity

Use the `Makefile` targets to mirror CI locally:

```bash
make ci        # lint + unit + functions tests
pnpm e2e       # run Playwright smoke tests
```

For emulator-heavy scenarios run `pnpm dlx firebase-tools emulators:start` in a separate terminal before invoking Jest.

## Troubleshooting

- **pnpm audit fails with 403** – npm blocks anonymous audit calls from CI runners without tokens. Authenticate with an npm token locally if you need the full report.
- **Emulator cache misses** – Delete `~/.cache/firebase/emulators` locally to force a fresh download if your cache becomes corrupted.
- **Playwright browsers missing** – Run `pnpm exec playwright install --with-deps` to align with the CI container image.