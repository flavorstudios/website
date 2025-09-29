# Visual Snapshot Update Workflow

Keeping the admin login legal notice visual snapshot up to date ensures that CI only fails when a real UI regression occurs. Follow this checklist whenever the layout changes.

## 1. Verify the UI change locally
1. Run the admin app locally (for example with `pnpm dev`) and navigate to `http://localhost:3000/admin/login`.
2. Confirm the legal notice looks correct across the breakpoints covered by the test (mobile 320×720, tablet 768×1024, desktop 1280×720).
3. Double-check that the legal notice text stays on a single line and truncates with an ellipsis when necessary.

## 2. Rebuild the production bundle for Playwright
The Playwright test suite boots the production server, so rebuild before generating snapshots:

```bash
pnpm -s e2e:build
```

If fonts are blocked in your environment, the build script automatically mocks Google Font downloads.

## 3. Install or update Playwright browsers (first run only)
When running on a fresh machine, download the Playwright browser binaries:

```bash
pnpm exec playwright install chromium
```

> The CI containers already have the browsers cached, but local environments need this step. If network egress is restricted you may need to run this command through the company proxy or re-use a cached Playwright folder.

## 4. Update the snapshots
Run the targeted visual test with snapshot updates enabled:

```bash
pnpm playwright test tests/admin-login-legal-visual.spec.ts --update-snapshots
```

The command runs the test against the production build, generates new PNG snapshots for each viewport, and saves them in `tests/admin-login-legal-visual.spec.ts-snapshots/`.

## 5. Review and commit the artifacts
1. Inspect the generated images under `tests/admin-login-legal-visual.spec.ts-snapshots/`.
2. Stage the new or updated PNGs and commit them with a meaningful message, for example:

   ```bash
   git add tests/admin-login-legal-visual.spec.ts-snapshots/
   git commit -m "chore(e2e): refresh admin login legal notice snapshots"
   ```

3. Push the branch and open a pull request. Mention why the visual change is expected so reviewers know the CI diff is intentional.

Following these steps keeps the snapshot baseline intentional and prevents surprise visual regressions in CI.