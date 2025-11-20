import { expect, type Page } from "@playwright/test";

type AwaitAppReadyOptions = {
  selector?: string;
  admin?: boolean;
};

const ADMIN_ROOT_SELECTOR = "main [data-testid=\"admin-dashboard-root\"]";
const MAIN_FALLBACK_SELECTOR = "[data-testid='app-main'], main, [role='main']";

export async function awaitAppReady(page: Page, opts: AwaitAppReadyOptions = {}) {
  await page.waitForLoadState("domcontentloaded");

  const mainLandmark = page.locator(MAIN_FALLBACK_SELECTOR).first();
  await mainLandmark.waitFor({ state: "attached", timeout: 15_000 }).catch(() => {});

  const isAdminPage = opts.admin ?? page.url().includes("/admin");
  if (isAdminPage) {
    await page.waitForSelector(ADMIN_ROOT_SELECTOR, { state: "attached", timeout: 15_000 });
    const uiReady = page.locator("[data-testid='ui-ready']").first();
    await uiReady.waitFor({ state: "attached", timeout: 15_000 });
    await expect(uiReady).toHaveAttribute("data-ready", "1", { timeout: 15_000 });
  }

  if (opts.selector) {
    await page.waitForSelector(opts.selector, { timeout: 15_000 });
  }

  await page
    .evaluate(() => {
      const fonts = (document as Document & {
        fonts?: { ready?: Promise<unknown> };
      }).fonts;
      return fonts?.ready ?? null;
    })
    .catch(() => {});
}
