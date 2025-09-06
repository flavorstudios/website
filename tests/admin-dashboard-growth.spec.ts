import { test, expect } from '@playwright/test';

test('displays combined posts and videos growth', async ({ page }) => {
  await page.route('**/api/admin/stats?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalPosts: 5,
        totalVideos: 5,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 10,
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
  await expect(page.getByText('+10% posts+videos growth this month')).toBeVisible();
});