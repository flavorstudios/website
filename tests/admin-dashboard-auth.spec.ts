import { test, expect } from '@playwright/test';

test('logs in via cookie and loads dashboard without console errors', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Fake login by setting the admin-session cookie
  await context.addCookies([
    { name: 'admin-session', value: 'playwright', domain: '127.0.0.1', path: '/' },
  ]);

  await page.goto('/admin/dashboard');
  await expect(page.getByText('Total Posts')).toBeVisible();

  expect(errors).toEqual([]);
});