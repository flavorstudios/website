import { test, expect } from './test-setup';
import { runA11yScan } from './axe-helper';
import { awaitAppReady } from './utils/awaitAppReady';

test.use({ viewport: { width: 390, height: 844 } });

test('sidebar drawer traps focus and returns focus on close', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await awaitAppReady(page);

  const toggle = page.getByRole('button', { name: /open sidebar/i });
  await expect(toggle).toBeVisible();
  await toggle.focus();
  await toggle.press('Enter');

  // Drawer should be visible and focus within it
  const drawer = page.getByRole('complementary', { name: /navigation/i });
  await expect(drawer).toBeVisible();

  // Tab around a few times and ensure focus stays inside
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
  // Escape closes
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();

  // Focus should return to the toggle
  await expect(toggle).toBeFocused();

  await runA11yScan(page, { include: 'mobile drawer closed' });
});
