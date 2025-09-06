import { test, expect } from '@playwright/test';

test('progress bars clamp values between 0 and 100', async ({ page }) => {
  await page.route('**/api/admin/stats?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalPosts: 1,
        publishedPosts: 5,
        totalVideos: 1,
        featuredVideos: 5,
        totalComments: 1,
        pendingComments: 5,
        totalViews: 0,
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
  await expect(page.getByText('Content Performance')).toBeVisible();

  const bars = page.getByRole('progressbar');
  await expect(bars).toHaveCount(3);
  await expect(bars.nth(0)).toHaveAttribute('aria-valuenow', '100');
  await expect(bars.nth(0)).toHaveAttribute('aria-valuemax', '100');
  await expect(bars.nth(1)).toHaveAttribute('aria-valuenow', '100');
  await expect(bars.nth(1)).toHaveAttribute('aria-valuemax', '100');
  await expect(bars.nth(2)).toHaveAttribute('aria-valuenow', '0');
  await expect(bars.nth(2)).toHaveAttribute('aria-valuemax', '100');

  // All progress bars should report integer percentages
  const values = await Promise.all([
    bars.nth(0).getAttribute('aria-valuenow'),
    bars.nth(1).getAttribute('aria-valuenow'),
    bars.nth(2).getAttribute('aria-valuenow'),
  ]);
  for (const val of values) {
    expect(val).not.toBeNull();
    expect(Number(val)).toBe(Math.round(Number(val)));
  }
});