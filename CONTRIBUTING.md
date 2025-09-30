# Contributing

## Refreshing admin login visual snapshots

Playwright stores baselines for the admin login legal footer at
`tests/admin-login-legal-visual.spec.ts-snapshots/`. Update these images whenever
layout or typography changes affect that area so that visual regression tests stay
reliable.

1. Install the Playwright browsers (only needed once per development machine):
   ```bash
   pnpm exec playwright install
   ```
2. Build the production bundle that the Playwright suite launches:
   ```bash
   pnpm -s tsx scripts/build-e2e.ts
   ```
   The script sets the required environment variables, mocks Google Fonts, and
   verifies the `.next` build output.
3. Regenerate the snapshots for the admin login legal footer:
   ```bash
   pnpm playwright test tests/admin-login-legal-visual.spec.ts --update-snapshots
   ```
4. Commit the updated `*-linux.png` files under
   `tests/admin-login-legal-visual.spec.ts-snapshots/` along with any relevant code
   changes.

If the Playwright command fails because cached browsers are missing, rerun step 1
before rebuilding and testing.