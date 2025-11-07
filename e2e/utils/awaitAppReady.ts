import { type Page } from "@playwright/test";

type AwaitAppReadyOptions = {
  /**
   * Extra selector that this particular page must show
   * before we consider it "ready".
   */
  selector?: string;
  /**
   * Force the "admin" readiness path even if the URL
   * does not explicitly contain /admin.
   */
  admin?: boolean;
};

export async function awaitAppReady(
  page: Page,
  opts: AwaitAppReadyOptions = {},
) {
  // base load
  await page.waitForLoadState("domcontentloaded");
  // React/Next in CI often keeps a couple of in-flight requests; still worth trying
  await page.waitForLoadState("networkidle").catch(() => {
    // don't fail the whole helper in CI if "networkidle" never truly happens
  });

  // NEW: admin dashboard exposes a stable root in CI-like runs
  // If we can see it, we can return early (unless the caller asked for a custom selector)
  let adminRootReady = false;
  try {
    const adminRoot = page
      .getByRole("main")
      .locator('[data-testid="admin-dashboard-root"]')
      .first();
    await adminRoot.waitFor({ state: "attached", timeout: 15_000 });
    adminRootReady = true;

    // CI-specific marker rendered in the dashboard shell for deterministic readiness.
    await page
      .getByTestId("admin-dashboard-e2e-env")
      .waitFor({ state: "attached", timeout: 3_000 })
      .catch(() => {
        // fine: marker is only available in CI-like environments
      });
  } catch {
    // not an admin page or still hydrating — continue with the old flow
  }
  if (adminRootReady && !opts.selector) {
    return;
  }

  // original behaviour: make sure we have a main landmark
  const mainLandmark = await page
    .locator("[data-testid='app-main'], main, [role='main']")
    .first();
  await mainLandmark.waitFor({ state: "attached", timeout: 20_000 });
  await page.waitForTimeout(50);

  const url = page.url();
  const isAdminPage = opts.admin || url.includes("/admin");

  // collect "nice to have" selectors for specific screens
  const candidates: string[] = [];

  // user asked for something specific
  if (opts.selector) {
    candidates.push(opts.selector);
  }

  // admin shell often takes a moment to hydrate
  if (isAdminPage) {
    candidates.push(
      "[data-testid='admin-shell']",
      "[data-testid='admin-dashboard']",
      "text=Total Posts",
    );

    // admin blog sub-route (seen in your CI logs)
    if (url.includes("/admin/dashboard/blog")) {
      candidates.push(
        "[data-testid='admin-blog-grid']",
        "[data-testid='admin-blog-list']",
        "[data-testid='admin-blog-skeleton']",
        "[data-testid='blog-fallback']",
        "text=Blog Posts",
        "text=Recent Posts",
      );
    }
  }

  // try each candidate, but do not fail the whole helper if a selector is missing
  for (const sel of candidates) {
    try {
      await page.waitForSelector(sel, { timeout: 5_000 });
      // as soon as we find one, we can stop
      break;
    } catch {
      // ignore, some pages just won't have this selector
    }
  }

  // best-effort: let common loading markers settle down
  // this must not block forever, because admin keeps polling /api/admin/*
  try {
    await page.waitForFunction(() => {
      const loadingSelectors = [
        "[data-loading='true']",
        "[aria-busy='true']",
        "[data-testid='loading']",
        ".animate-pulse",
      ];
      return !loadingSelectors.some((s) => document.querySelector(s));
    }, { timeout: 3_000 });
  } catch {
    // ok to ignore: page is probably one of the "error" test pages
  }

  // Ensure custom web fonts have finished loading before assertions that depend on layout.
  await page
    .evaluate(() => {
      const fonts = (document as Document & {
        fonts?: { ready?: Promise<unknown> };
      }).fonts;
      return fonts?.ready ?? null;
    })
    .catch(() => {
      // Older browsers or test mocks may not expose document.fonts; ignore quietly.
    });
}
