import type { Page } from '@playwright/test';
import { test, expect } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Admin signup flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/admin/signup');
    await awaitAppReady(page);
    await page.evaluate(() => {
      window.localStorage.setItem('admin-test-email-verified', 'false');
    });
  });

  async function completeSignup(page: Page) {
    await page.getByLabel('Full name').fill('Test Admin');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('StrongPassw0rd!');
    await page.getByRole('checkbox', { name: /Keep me up to date/i }).check();
    await page.getByRole('button', { name: /Create admin account/i }).click();
  }

  test('happy path redirects to verification screen', async ({ page }) => {
    await completeSignup(page);
    await page.waitForURL(/\/admin\/verify-email/);
    await expect(page).toHaveURL(/\/admin\/verify-email/);
    await expect(page.getByRole('heading', { name: /Verify your email/i })).toBeVisible();
    await expect(page.getByTestId('verify-status')).toBeVisible();
  });

  test('unverified admin is redirected away from dashboard', async ({ page }) => {
    await completeSignup(page);
    await page.waitForURL(/\/admin\/verify-email/);
    await page.goto('/admin/dashboard');
    await awaitAppReady(page);
    await expect(page).toHaveURL(/\/admin\/verify-email/);
    await expect(page.getByRole('button', { name: /Resend verification email/i })).toBeVisible();
  });

  test('marking verification complete unlocks dashboard', async ({ page }) => {
    await completeSignup(page);
    await page.waitForURL(/\/admin\/verify-email/);
    await page.evaluate(() => {
      window.localStorage.setItem('admin-test-email-verified', 'true');
    });
    const verifiedButton = page.getByRole('button', { name: /I have verified/i });
    await expect(verifiedButton).toBeAttached();
    await verifiedButton.click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});