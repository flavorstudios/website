import { expect, test } from '@playwright/test';

test('blog fallback cards render before data resolves on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  let blogRequestResolved = false;

  await page.route('**/api/admin/blogs?**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    blogRequestResolved = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ posts: [], total: 0 })
    });
  });

  await page.route('**/api/admin/categories?type=blog**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ categories: [] })
    });
  });

  await page.route('**/api/admin/blogs/stream', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'text/event-stream'
      },
      body: ''
    });
  });

  await page.goto('/admin/dashboard/blog');

  await expect(page.getByRole('heading', { name: 'Blog Manager' })).toBeVisible();

  const cards = page.getByTestId('blog-card');
  await expect(cards.first()).toBeVisible();

  expect(blogRequestResolved).toBeFalsy();

  await expect.poll(() => blogRequestResolved, { timeout: 7000 }).toBe(true);
});