import { test, expect } from '@playwright/test';
import { runA11yScan } from './axe-helper';

test.describe('Login form', () => {
  test('invalid login announces error via aria-live', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('fake@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();

    const error = page.getByRole('alert');
    await expect(error).toBeVisible();
    // Check that it sits within an aria-live region
    await expect(error.locator('xpath=ancestor::*[@aria-live="assertive"]')).toHaveCount(1);

    await runA11yScan(page, 'login page after error');
  });
});
