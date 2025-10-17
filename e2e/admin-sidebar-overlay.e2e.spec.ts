import { expect, test } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test.use({ viewport: { width: 390, height: 844 } });

test('mobile sidebar stays topmost when drawer is open', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await awaitAppReady(page);

  const toggle = page.getByRole('button', { name: /open sidebar/i });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const sidebar = page.locator('#app-sidebar');
  await expect(sidebar).toBeVisible();

  const probePoint = await sidebar.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + Math.min(rect.width / 2, 40),
      y: rect.top + Math.min(rect.height / 2, 40),
    };
  });

  const elementId = await page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y);
    const container = element?.closest('#app-sidebar');
    return container ? container.id : element?.id ?? null;
  }, probePoint);

  expect(elementId).toBe('app-sidebar');
});