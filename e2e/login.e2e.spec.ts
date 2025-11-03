import { test, expect } from './test-setup';
import { runA11yScan } from './axe-helper';
import { awaitAppReady } from './utils/awaitAppReady';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login form', () => {
  test('invalid login announces error via aria-live', async ({ page }) => {
    await page.route('**/api/admin/email-login', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Email not allowed for admin access.' }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/admin/login');
    await awaitAppReady(page);
    await page.getByLabel('Email').fill('fake@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    const error = page.getByRole('alert', { name: 'Authentication failed.' });
    await expect(error).toBeVisible();
    await expect(
      page.getByText('Email not allowed for admin access.')
    ).toBeVisible();
    await expect(page.locator('[role="alert"]')).toHaveCount(1);
    // Check that it sits within an aria-live region
    await expect(error.locator('xpath=ancestor::*[@aria-live="assertive"]')).toHaveCount(1);

    await runA11yScan(page, { include: 'login page after error' });
  });
  test('non-MFA users do not see verification code controls', async ({ page }) => {
    await page.route('**/api/admin/email-session', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mfaRequired: false }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/admin/login');
    await awaitAppReady(page);

    const legacyToggle = page.getByTestId('legacy-login-toggle');
    if (await legacyToggle.count()) {
      await legacyToggle.click();
    }

    await expect(page.getByRole('button', { name: /verification code/i })).toHaveCount(0);
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('MFA-enabled users can submit a verification code', async ({ page }) => {
    await page.route('**/api/admin/email-session', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mfaRequired: true }),
        });
        return;
      }

      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
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
          body: '<html><body>Dashboard</body></html>',
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/admin/login');
    await awaitAppReady(page);

    const legacyToggle = page.getByTestId('legacy-login-toggle');
    if (await legacyToggle.count()) {
      await legacyToggle.click();
    }

    const verificationInput = page.getByLabel('Verification code');
    await expect(verificationInput).toBeVisible();
    await expect(page.getByRole('link', { name: /having trouble\?/i })).toBeVisible();

    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('super-secret');
    await verificationInput.fill('123456');

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('/api/admin/email-session') &&
        response.request().method() === 'POST' &&
        response.status() === 200
      ),
      page.getByRole('button', { name: /^login$/i }).click(),
    ]);

    await page.waitForURL('**/admin/dashboard');
  });
});
