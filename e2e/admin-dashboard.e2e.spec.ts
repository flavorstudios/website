import { test, expect } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test('admin dashboard renders', async ({ page }) => {
  await page.route('**/api/admin/stats?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalPosts: 1,
        totalVideos: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
      })
    });
  });
  await page.route('**/api/admin/activity', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ activities: [] })
    });
  });
  await page.goto('/admin/dashboard');
  await awaitAppReady(page);
  await expect(page.getByTestId('app-main')).toBeVisible();
  await expect(page.getByTestId('dashboard-loading')).toBeVisible();
  await expect(page.getByText('Total Posts')).toBeVisible();
  await expect(page.getByText('Total Views')).toBeVisible();
  await expect(page.getByText('All time')).toBeVisible();
});