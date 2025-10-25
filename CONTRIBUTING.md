# Contributing

Flavor Studios welcomes contributions that keep the site secure, accessible, and fast. This guide summarises the expectations for local development and the CI signals that your pull request must keep green.

## Environment & tooling

- **Node.js / pnpm** – We support Node.js `20.x` and pnpm `10.x`. Install Node via [nvm](https://github.com/nvm-sh/nvm) and run `corepack enable` to activate pnpm.
- **Environment variables** – Copy `.env.example` to `.env.local` and populate the values you need. Secrets must never be committed; the `.gitignore` rules already block accidental check-ins.
- **Firebase emulators** – Run `pnpm dlx firebase-tools emulators:start` to launch local services when exercising Firestore/Storage flows.

## Common tasks

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Lint all packages | `pnpm lint` |
| Unit tests (web) | `pnpm test:unit` |
| Cloud functions tests | `pnpm test:functions` |
| E2E smoke tests | `pnpm e2e` |
| Build production bundle | `pnpm build` |

The `Makefile` mirrors these commands so CI and developers execute the same entry points. Run `make help` to list available targets.

## Pull request checklist

1. **Run `pnpm lint` and `pnpm test:unit`.** Fix lint failures or add documentation for intentional suppressions.
2. **Add or update tests** that demonstrate the fix or regression protection.
3. **Update documentation** (`README.md`, `docs/ci.md`, `docs/architecture.md`) when behaviour changes.
4. **Request review** from `@flavor-studios/web` and ensure the GitHub Actions suite is green before merging.

## Refreshing admin login visual snapshots

Playwright stores baselines for the admin login legal footer at `tests/admin-login-legal-visual.spec.ts-snapshots/`. Update these images whenever layout or typography changes affect that area so that visual regression tests stay reliable.

1. Install the Playwright browsers (only needed once per development machine):
   ```bash
   pnpm exec playwright install
   ```
2. Build the production bundle that the Playwright suite launches:
   ```bash
   pnpm -s e2e:build
   ```
   The script sets the required environment variables, mocks Google Fonts, and verifies the `.next` build output before starting the server.
3. Regenerate the snapshots for the admin login legal footer:
   ```bash
   pnpm playwright test tests/admin-login-legal-visual.spec.ts --update-snapshots
   ```
4. Commit the updated `*-linux.png` files under `tests/admin-login-legal-visual.spec.ts-snapshots/` along with any relevant code changes.

If the Playwright command fails because cached browsers are missing, rerun step 1 before rebuilding and testing.