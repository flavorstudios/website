import { test } from './test-setup';
import { expectNoAxeViolations } from './axe-helper';

const publicRoutes: Array<{ path: string; label: string; include?: string }> = [
  { path: '/', label: 'home page' },
  { path: '/blog', label: 'blog index' },
  { path: '/watch', label: 'watch index' },
];

test.describe('accessibility smoke tests', () => {
  for (const route of publicRoutes) {
    test(`${route.label} has no detectable accessibility violations`, async ({ page }) => {
      await page.goto(route.path);
      await expectNoAxeViolations(page, { include: route.include ?? 'body' });
    });
  }

  test('admin dashboard landing passes axe-core scan', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expectNoAxeViolations(page, { include: 'main' });
  });
});