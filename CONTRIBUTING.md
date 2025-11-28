# Contributing

Flavor Studios welcomes contributions that keep the site secure, accessible, and fast. This guide summarises the expectations for local development and the CI signals that your pull request must keep green.

## Environment & tooling

- **Node.js / pnpm** – We support Node.js `22.x` (see `.nvmrc`) and pnpm `10.x`. Install Node via [nvm](https://github.com/nvm-sh/nvm), run `nvm use`, and execute `corepack enable` so `pnpm` resolves to the project-pinned version declared in `package.json`.
- **Tooling verification** – After switching Node versions run `node -v` and `pnpm -v` to confirm the toolchain matches CI. The GitHub workflow enables Corepack to guarantee the same versions.
- **Environment variables** – Copy `.env.local.example` to `.env.local` and populate the values you need. Secrets must never be committed; the `.gitignore` rules already block accidental check-ins. The `scripts/validate-env.ts` script runs automatically during `pnpm build` to ensure required variables are present without failing on optional ones.
- **Firebase emulators** – Run `pnpm dlx firebase-tools emulators:start` to launch local services when exercising Firestore/Storage flows.

## Common tasks

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Lint all packages | `pnpm lint` |
| Type-check TypeScript | `pnpm typecheck` |
| Unit tests (web) | `pnpm test:unit` |
| Cloud functions tests | `pnpm test:functions` |
| E2E smoke tests | `pnpm e2e` |
| Build production bundle | `pnpm build` |
| Run Storybook locally | `pnpm storybook` |
| Visual regression tests | `pnpm visual:test` |

The `Makefile` mirrors these commands so CI and developers execute the same entry points. Run `make help` to list available targets.

## Pull request checklist

1. **Run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.** Fix any failures before pushing.
2. **Execute automated tests** (`pnpm test:unit`, `pnpm test:functions`, `pnpm e2e` where applicable) and update them to cover regressions.
3. **Update documentation** (`README.md`, `docs/ci.md`, `docs/architecture.md`) when behaviour changes.
4. **Request review** from `@flavor-studios/web` and ensure the GitHub Actions suite is green before merging. CI installs with `pnpm install --frozen-lockfile`, caches pnpm’s store, and runs lint, type-check, and build in that order.

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