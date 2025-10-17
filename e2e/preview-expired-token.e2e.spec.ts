import { test, expect } from './test-setup';
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
  const response = await page.request.get(
    '/api/admin/preview-token?postId=1&uid=bypass&expired=1'
  );
  expect(response.ok()).toBeTruthy();
  const { token } = await response.json();
  let validateSessionCalled = false;

  await page.route('**/api/admin/validate-session', async (route) => {
    validateSessionCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto(`/admin/preview/1?token=${token}`);
  await expect(page.getByText('Preview token expired.')).toBeVisible();
  expect(validateSessionCalled).toBe(true);
});