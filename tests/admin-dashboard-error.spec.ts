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