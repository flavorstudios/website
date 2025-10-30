import type { Page } from '@playwright/test';
import { test, expect } from './test-setup';
import { expectNoAxeViolations } from './axe-helper';
import { awaitAppReady } from './utils/awaitAppReady';

// Ensure user-role request succeeds so dashboard can render
const mockUserRole = async (page: Page) => {
  await page.route('**/api/admin/user-role**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ role: 'admin' }),
    });
  });
};

// CI actually calls a bunch of admin endpoints, not just /stats or /activity.
// When we want to force the dashboard into "error" mode, we have to fail all
// the real ones the page hits in CI (settings, init, notifications, etc.)
const mockDashboardDataFailure = async (page: Page) => {
  const endpointsToFail = [
    '**/api/admin/stats**',
    '**/api/admin/activity**',
    '**/api/admin/settings**',
    '**/api/admin/init**',
    '**/api/admin/notifications**',
  ];

  for (const pattern of endpointsToFail) {
    await page.route(pattern, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'error' }),
      });
    });
  }

  // the dashboard keeps an SSE/stream open in CI — abort it so the page
  // clearly thinks "admin data failed"
  await page.route('**/api/admin/notifications/stream**', async (route) => {
    await route.abort();
  });
};

test('shows network error when dashboard data fails to load', async ({ page }) => {
  await mockUserRole(page);
  await mockDashboardDataFailure(page);

  // Simulate small screen
  await page.setViewportSize({ width: 375, height: 800 });

  await page.goto('/admin/dashboard');
  await awaitAppReady(page);

  // this is what the test was always trying to assert — now the routes above
  // actually make the component render the error panel in CI too
  await expect(page.getByTestId('dashboard-error')).toBeVisible();
  await expect(page.getByText('Retry Dashboard')).toBeVisible();
  // Diagnostic code should surface for 5xx
  await expect(page.getByTestId('dashboard-error-code')).toHaveText('DASHLOAD_5XX');

  // Open sidebar (button is expected elsewhere in the layout)
  const openSidebarButton = page.getByLabel('Open sidebar');
  await expect(openSidebarButton).toBeVisible();
  await openSidebarButton.click();

  await page.waitForSelector('#app-sidebar', { state: 'visible' });
  await page.waitForTimeout(50);

  // Ensure no overlay dims or blocks the sidebar
  const opacity = await page
    .locator('#app-sidebar')
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe('1');

  const withinSidebar = await page.evaluate(() => {
    const el = document.elementFromPoint(10, 200);
    return !!el && !!el.closest('#app-sidebar');
  });
  expect(withinSidebar).toBe(true);
});

test('does not duplicate landmarks when analytics endpoints fail', async ({ page }) => {
  await mockUserRole(page);

  // still fail the analytics endpoints like before…
  await page.route('**/api/admin/stats**', async (route) => {
    await route.fulfill({ status: 500, body: 'error' });
  });
  await page.route('**/api/admin/activity**', async (route) => {
    await route.fulfill({ status: 500, body: 'error' });
  });

  // …but also fail the real dashboard data endpoints CI actually hits,
  // so the page reliably shows the "dashboard-error" panel
  await page.route('**/api/admin/settings**', async (route) => {
    await route.fulfill({ status: 500, body: 'error' });
  });
  await page.route('**/api/admin/init**', async (route) => {
    await route.fulfill({ status: 500, body: 'error' });
  });

  await page.goto('/admin/dashboard');
  await awaitAppReady(page);

  await expect(page.getByTestId('dashboard-error')).toBeVisible();

  await page.waitForFunction(() => {
    const bannerCount = document.querySelectorAll('[role="banner"]').length;
    const mainCount = document.querySelectorAll('[role="main"]').length;
    return bannerCount === 1 && mainCount === 1;
  });

  const bannerCount = await page.$$eval('[role="banner"]', (els) => els.length);
  expect(bannerCount).toBe(1);

  const mainCount = await page.$$eval('[role="main"]', (els) => els.length);
  expect(mainCount).toBe(1);

  await expectNoAxeViolations(page, { include: 'body' });
});

test("shows permission message when unauthorized", async ({ page }) => {
  await mockUserRole(page);

  // Match with or without query params
  await page.route('**/api/admin/stats**', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    });
  });
  await page.route('**/api/admin/activity**', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    });
  });

  // keep settings/init happy here so the page can actually render the
  // "you don't have permission" message
  await page.route('**/api/admin/settings**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
  await page.route('**/api/admin/init**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.goto('/admin/dashboard');
  await awaitAppReady(page);
  await expect(page.getByTestId('analytics-permission-block')).toBeVisible();
  await expect(
    page.getByText("You don't have permission to view analytics.")
  ).toBeVisible();
});
