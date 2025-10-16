import { test, expect } from '@playwright/test';

test('media row exposes action when backend returns no media', async ({ page }) => {
  await page.route('**/api/media/list**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ media: [], cursor: null }),
    });
  });

  await page.goto('/admin/dashboard/media');

  // Expect a link or button per row, even when fallback data is rendered
  const firstAction = page.locator('table tbody tr >> :is(a,button)').first();
  await expect(firstAction).toBeVisible();
  await firstAction.focus();
  await firstAction.press('Enter');

  await expect(
    page.locator(':is([role="dialog"], [data-testid="media-details"], main h1:has-text("Media"))')
  ).toBeVisible();
});

test('media pagination loads additional rows', async ({ page }) => {
  await page.route('**/api/media/list**', async (route, request) => {
    const url = new URL(request.url());
    const cursor = url.searchParams.get('cursor');

    if (!cursor) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          media: [
            {
              id: 'media-1',
              url: '/placeholder.png',
              filename: 'placeholder.png',
              name: 'First Media Item',
              alt: 'First Media Item',
              mime: 'image/png',
              size: 1024,
              attachedTo: [],
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
          cursor: 42,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        media: [
          {
            id: 'media-2',
            url: '/placeholder.png',
            filename: 'placeholder.png',
            name: 'Second Media Item',
            alt: 'Second Media Item',
            mime: 'image/png',
            size: 2048,
            attachedTo: [],
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
        ],
        cursor: null,
      }),
    });
  });

  await page.goto('/admin/dashboard/media');

  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(1);

  await page.getByRole('button', { name: 'Load More' }).click();
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(1)).toContainText('Second Media Item');
});
