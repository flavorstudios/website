import { test, expect } from '@playwright/test';

test.describe('Blog CRUD', () => {
  test('create, edit, save flow works on desktop', async ({ page }) => {
    await page.goto('/admin/dashboard/blog');
    await page.getByRole('button', { name: /new post/i }).click();
    await page.getByLabel(/title/i).fill('Playwright Test Post');
    await page.getByLabel(/content/i).fill('Hello world');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test.use({ viewport: { width: 390, height: 844 } });
  test('list renders as cards on mobile without horizontal scroll', async ({ page }) => {
    await page.goto('/admin/dashboard/blog');
    // No horizontal scroll
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasScroll).toBeFalsy();

    // Cards exist at small breakpoints
    await expect(page.locator('[data-testid="blog-card"]')).toHaveCountGreaterThan(0);
  });
});
