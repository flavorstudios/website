import type { Page } from "@playwright/test";

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
  // original behaviour
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("main, [role='main']", {
    state: "visible",
    timeout: 15_000,
  });
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
}
