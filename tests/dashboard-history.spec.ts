import { test, expect, type Page, type Route } from '@playwright/test';

async function stubDashboard(page: Page, stats: Record<string, unknown>) {
  await page.route('**/api/admin/stats?**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(stats),
    });
  });
  await page.route('**/api/admin/activity', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ activities: [] }),
    });
  });
}

const baseStats = {
  totalPosts: 0,
  totalVideos: 0,
  totalComments: 0,
  totalViews: 0,
  pendingComments: 0,
  publishedPosts: 0,
  featuredVideos: 0,
  monthlyGrowth: 0,
  history: [],
};

test('renders posts-only history with correct bars', async ({ page }) => {
  await stubDashboard(page, {
    ...baseStats,
    totalPosts: 5,
    history: [{ month: 'Jan', posts: 5, videos: 0, comments: 0 }],
  });
  await page.goto('/admin/dashboard');
  await page.waitForSelector('text=Posts, Videos & Comments (12 months)');
  await page.waitForFunction(() => (window as any).__dashboardHistoryDatasets);
  const datasets = await page.evaluate(() =>
    (window as any).__dashboardHistoryDatasets.map((d: any) => ({
      label: d.label,
      data: d.data,
    })),
  );
  expect(datasets).toEqual([
    { label: 'Posts', data: [5] },
    { label: 'Videos', data: [0] },
    { label: 'Comments', data: [0] },
  ]);
});

test('renders videos-only history with correct bars', async ({ page }) => {
  await stubDashboard(page, {
    ...baseStats,
    totalVideos: 7,
    history: [{ month: 'Jan', posts: 0, videos: 7, comments: 0 }],
  });
  await page.goto('/admin/dashboard');
  await page.waitForSelector('text=Posts, Videos & Comments (12 months)');
  await page.waitForFunction(() => (window as any).__dashboardHistoryDatasets);
  const datasets = await page.evaluate(() =>
    (window as any).__dashboardHistoryDatasets.map((d: any) => ({
      label: d.label,
      data: d.data,
    })),
  );
  expect(datasets).toEqual([
    { label: 'Posts', data: [0] },
    { label: 'Videos', data: [7] },
    { label: 'Comments', data: [0] },
  ]);
});

test('history card hides when all totals are zero', async ({ page }) => {
  await stubDashboard(page, baseStats);
  await page.goto('/admin/dashboard');
  await expect(page.getByText('Posts, Videos & Comments (12 months)')).toHaveCount(0);
});

test('history card hides when entries exist but all metrics are zero', async ({ page }) => {
  await stubDashboard(page, {
    ...baseStats,
    history: [{ month: 'Jan', posts: 0, videos: 0, comments: 0 }],
  });
  await page.goto('/admin/dashboard');
  await expect(page.getByText('Posts, Videos & Comments (12 months)')).toHaveCount(0);
});

test('history card shows when any metric nonzero', async ({ page }) => {
  await stubDashboard(page, {
    ...baseStats,
    totalComments: 3,
    history: [{ month: 'Jan', posts: 0, videos: 0, comments: 3 }],
  });
  await page.goto('/admin/dashboard');
  await expect(page.getByText('Posts, Videos & Comments (12 months)')).toBeVisible();
});