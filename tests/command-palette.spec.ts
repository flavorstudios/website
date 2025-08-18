import { test, expect } from '@playwright/test';

// helper to open command palette
async function openPalette(page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('open-command-palette'))
  });
  await page.waitForSelector('[data-radix-dialog-overlay]');
}

test('command palette overlay respects sidebar on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/admin/dashboard');
  await openPalette(page);

  const sidebar = page.locator('#app-sidebar');
  const overlay = page.locator('[data-radix-dialog-overlay]');

  const sidebarOpacity = await sidebar.evaluate((el) => getComputedStyle(el).opacity);
  expect(sidebarOpacity).toBe('1');

  const sidebarBox = await sidebar.boundingBox();
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox!.left).toBeGreaterThanOrEqual(sidebarBox!.width - 1);
});

test('command palette overlay covers full screen on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/admin/dashboard');
  await openPalette(page);

  const overlayBox = await page.locator('[data-radix-dialog-overlay]').boundingBox();
  expect(overlayBox!.left).toBe(0);
});