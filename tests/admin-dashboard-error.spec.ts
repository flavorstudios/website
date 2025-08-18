import { test, expect, Page } from '@playwright/test';

// Ensure user-role request succeeds so dashboard can render
const mockUserRole = async (page: Page) => {
  await page.route('**/api/admin/user-role', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ role: 'admin' }),
    });
  });
};

test('shows network error when dashboard data fails to load', async ({ page }) => {
  await mockUserRole(page);
  await page.route('**/api/admin/stats?**', async (route) => {
    await route.fulfill({ status: 500, body: 'error' });
  });
  await page.route('**/api/admin/activity', async (route) => {
    await route.fulfill({ status: 500, body: 'error' });
  });

  await page.goto('/admin/dashboard');
  await expect(page.getByTestId('dashboard-error')).toBeVisible();
  await expect(page.getByText('Retry Dashboard')).toBeVisible();
  // Diagnostic code should surface for 5xx
  await expect(page.getByTestId('dashboard-error-code')).toHaveText('DASHLOAD_5XX');
});

test("shows permission message when unauthorized", async ({ page }) => {
  await mockUserRole(page);
  await page.route('**/api/admin/stats?**', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    });
  });
  await page.route('**/api/admin/activity', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    });
  });

  await page.goto('/admin/dashboard');
  await expect(page.getByTestId('analytics-permission-block')).toBeVisible();
  await expect(
    page.getByText("You don't have permission to view analytics.")
  ).toBeVisible();
});

// Happy-path recovery: a single 5xx should retry and the dashboard should render
test('recovers after a single 5xx and renders data', async ({ page }) => {
  await mockUserRole(page);

  let statsHit = 0;
  await page.route('**/api/admin/stats?**', async (route) => {
    statsHit += 1;
    if (statsHit === 1) {
      await route.fulfill({ status: 500, body: 'oops' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalPosts: 5,
        totalVideos: 2,
        totalComments: 10,
        totalViews: 1234,
        pendingComments: 1,
        publishedPosts: 4,
        featuredVideos: 1,
        monthlyGrowth: 8,
        history: [
          { month: 'Jan', posts: 2, videos: 1, comments: 3 },
          { month: 'Feb', posts: 3, videos: 1, comments: 7 },
        ],
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

  // Should not show the error overlay after retry succeeds
  await expect(page.getByTestId('dashboard-error')).toHaveCount(0);

  // Basic sanity checks that real data rendered
  await expect(page.getByText('Total Posts')).toBeVisible();
  await expect(page.getByText('Videos')).toBeVisible();
  await expect(page.getByText('Comments')).toBeVisible();
});
