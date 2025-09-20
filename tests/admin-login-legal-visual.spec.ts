import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 320, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
] as const;

test.describe('Admin login legal footer', () => {
  for (const viewport of viewports) {
    test(`legal notice remains single-line (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/admin/login');

      const legalNotice = page.getByTestId('admin-login-legal');
      await expect(legalNotice).toBeVisible();
      await expect(legalNotice).toHaveCSS('white-space', 'nowrap');
      await expect(legalNotice).toHaveCSS('overflow', 'hidden');
      await expect(legalNotice).toHaveCSS('text-overflow', 'ellipsis');

      await expect(legalNotice).toHaveScreenshot(`admin-login-legal-${viewport.name}.png`, {
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
      });
    });
  }
});