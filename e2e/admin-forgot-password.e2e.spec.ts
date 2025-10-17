import { expect, test } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test.describe('Admin password reset', () => {
  test('completes the happy path flow', async ({ page }) => {
    await page.goto('/admin/forgot-password');
    await awaitAppReady(page);

    await page.getByLabel('Email').fill('admin@example.com');

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/admin/password-reset') &&
          res.request().method() === 'POST',
      ),
      page.getByRole('button', { name: /continue/i }).click(),
    ]);

    await expect(
      page.getByText('If the email matches an admin account, you\'ll receive password reset instructions shortly.'),
    ).toBeVisible();

    const body = await response.json();
    expect(body.emailLink).toBeTruthy();

    expect(['http:', 'https:']).toContain(new URL(body.emailLink).protocol);

    const [openResponse] = await Promise.all([
      page.waitForResponse((res) =>
        res.url().includes('/api/admin/password-reset/open') && res.request().method() === 'GET',
      ),
      page.goto(body.emailLink),
    ]);

    expect(openResponse.status()).toBe(303);
    expect(openResponse.headers()['location']).toContain('/admin/login?reset=1');

    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText('Your password has been updated. Please sign in.')).toBeVisible();
  });

  test('handles expired reset tokens by directing back to the request form', async ({ page }) => {
    await page.goto(
      '/api/admin/password-reset/completed?request=test&errorCode=auth/expired-action-code',
    );

    await expect(page).toHaveURL(/\/admin\/forgot-password\?status=expired/);
    await expect(
      page.getByText('Your reset link expired or was already used. Please request a new one.'),
    ).toBeVisible();
  });
});