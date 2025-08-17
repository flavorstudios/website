import { test, expect } from '@playwright/test';

test('media row uses semantic link/button to open details', async ({ page }) => {
  await page.goto('/admin/dashboard/media');

  // Expect a link or button per row, avoid row-level onClick only
  const firstAction = page.locator('table tbody tr >> :is(a,button)').first();
  await expect(firstAction).toBeVisible();
  await firstAction.focus();
  await firstAction.press('Enter');

  // Should navigate to details or open a dialog
  await expect(
    page.locator(':is([role="dialog"], [data-testid="media-details"], main h1:has-text("Media"))')
  ).toBeVisible();
});
