import { test, expect } from '@playwright/test';

test('refresh updates data without page reload', async ({ page }) => {
  let call = 0;
  await page.route('**/api/admin/stats?**', async (route) => {
    call++;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalPosts: call,
        totalVideos: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
      }),
    });
  });
  await page.route('**/api/admin/activity', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ activities: [] }),
    });
  });
  await page.goto('/admin/dashboard');
  await expect(page.getByText('Total Posts')).toBeVisible();
  await expect(page.getByTestId('total-posts-value')).toHaveText('1');
  const before = await page.locator('text=Last updated').textContent();
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByTestId('total-posts-value')).toHaveText('2');
  const after = await page.locator('text=Last updated').textContent();
  expect(before).not.toBe(after);
});