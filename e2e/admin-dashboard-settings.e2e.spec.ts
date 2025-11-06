import { expect, test } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test('settings page renders a graceful fallback when admin SDK is unavailable', async ({ page }) => {
  await page.goto('/admin/dashboard/settings');
  await awaitAppReady(page);

  await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  await expect(page.getByText(/Admin settings are currently unavailable/i)).toBeVisible();
  await expect(page.getByText('Unable to render admin settings.')).toHaveCount(0);
});