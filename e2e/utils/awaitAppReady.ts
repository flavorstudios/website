import type { Page } from "@playwright/test";

export async function awaitAppReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("main, [role='main']", {
    state: "visible",
    timeout: 15_000,
  });
  await page.waitForTimeout(50);
}