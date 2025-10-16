import { test, expect } from '@playwright/test';

const DASHBOARD_HTML = `
<html>
  <body>
    <h1>Dashboard</h1>
    <button id="logout-button">Log out</button>
    <script>
      document.getElementById('logout-button').addEventListener('click', async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
      });
    </script>
  </body>
</html>
`;

test.describe('Admin onboarding flow', () => {
  test('signup, logout, and login with Firebase email flow', async ({ page }) => {
    await page.route('**/api/admin/signup', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, redirectTo: '/admin/dashboard', requiresVerification: false }),
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/admin/dashboard', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: DASHBOARD_HTML,
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/api/admin/logout', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
        return;
      }
      await route.continue();
    });

    let loginRequests = 0;
    await page.route('**/api/admin/email-login', async (route) => {
      if (route.request().method() === 'POST') {
        loginRequests += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/admin/signup');

    await page.getByLabel('Full name').fill('Test Admin');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('StrongPassw0rd!');
    await page.getByRole('button', { name: 'Create admin account' }).click();

    await page.waitForURL('**/admin/dashboard');

    await page.getByRole('button', { name: 'Log out' }).click();
    await page.waitForURL('**/admin/login');

    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('StrongPassw0rd!');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await page.waitForURL('**/admin/dashboard');

    expect(loginRequests).toBe(1);
  });
});