import { test, expect } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

const SETTINGS_PATH = '/admin/dashboard/settings?tab=profile';

test('settings page shows the dashboard sidebar', async ({ page }) => {
  await page.goto(SETTINGS_PATH);
  await awaitAppReady(page);

  const sidebar = page.getByTestId('admin-sidebar');
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByRole('link', { name: /settings/i })).toBeVisible();

  await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /profile/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /notifications/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /appearance/i })).toBeVisible();
});