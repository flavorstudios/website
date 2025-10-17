import { test, expect } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test.describe('Blog CRUD', () => {
  test('create, edit, save flow works on desktop', async ({ page }) => {
    await page.goto('/admin/dashboard/blog');
    await awaitAppReady(page);
    const newPost = page.getByTestId('new-post');
    await expect(newPost).toBeVisible();
    await newPost.click();
    await page.getByLabel(/title/i).fill('Playwright Test Post');
    const contentEditor = page.getByLabel(/content/i);
    await expect(contentEditor).toBeVisible();
    await contentEditor.fill('Hello world');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test.use({ viewport: { width: 390, height: 844 } });
  test('list renders as cards on mobile without horizontal scroll', async ({ page }) => {
    await page.goto('/admin/dashboard/blog');
    await awaitAppReady(page);
    // No horizontal scroll
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasScroll).toBeFalsy();

    // Cards exist at small breakpoints
    expect(await page.locator('[data-testid="blog-card"]').count()).toBeGreaterThan(0);
  });
});
