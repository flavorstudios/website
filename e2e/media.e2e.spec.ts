import { test, expect } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test('media row exposes action when backend returns no media', async ({ page }) => {
  await page.route('**/api/media/list**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ media: [], cursor: null }),
    });
  });

  await page.goto('/admin/dashboard/media');
  await awaitAppReady(page);

  const uploadFallback = page.getByRole('button', { name: /upload media/i });
  await expect(uploadFallback).toBeVisible();
  await uploadFallback.focus();
  await uploadFallback.press('Enter');
  await expect(uploadFallback).toBeVisible();
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
  await awaitAppReady(page);

  const rows = page.getByTestId('media-row');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(1);

  const loadMore = page.getByRole('button', { name: /load more/i });
  await expect(loadMore).toBeEnabled();
  await loadMore.click();
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(1)).toContainText('Second Media Item');
});
