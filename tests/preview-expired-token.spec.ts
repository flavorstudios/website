import { test, expect } from '@playwright/test';
import { createPreviewToken } from '@/lib/preview-token';
import { serverEnv } from '@/env/server';

// Ensure secret is available for token creation and server validation
serverEnv.PREVIEW_SECRET = process.env.PREVIEW_SECRET || 'test-secret';

// Intercept external font requests to avoid network access during tests
// and return an empty stylesheet.
test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/css',
      body: '',
    })
  );
});

test('shows message for expired preview token', async ({ page }) => {
  const token = createPreviewToken('1', 'bypass', -60);
  await page.goto(`/admin/preview/1?token=${token}`);
  await expect(page.getByText('Preview token expired.')).toBeVisible();
});