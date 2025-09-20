import { expect, test } from '@playwright/test';

test.describe('Admin password reset', () => {
  test('completes the happy path flow', async ({ page }) => {
    await page.goto('/admin/forgot-password');

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

    await page.goto(body.emailLink);

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