import { expect, test } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

test('blog fallback cards render before data resolves on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  // we still use this flag so we can assert pre-/post- states
  let blogRequestResolved = false;

  // Some environments call /api/admin/blogs (no "?") and some call /api/admin/blogs?...,
  // so match BOTH.
  const BLOGS_API_GLOB = '**/api/admin/blogs*';

  // slow down ONLY the first blogs request to simulate "data still loading"
  await page.route(BLOGS_API_GLOB, async (route) => {
    if (!blogRequestResolved) {
      // simulate slow backend
      await new Promise((resolve) => setTimeout(resolve, 4000));
      blogRequestResolved = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ posts: [], total: 0 }),
      });
      return;
    }

    // subsequent calls: return fast so the page can hydrate/retry
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ posts: [], total: 0 }),
    });
  });

  await page.route('**/api/admin/categories?type=blog**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ categories: [] }),
    });
  });

  await page.route('**/api/admin/blogs/stream', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'text/event-stream',
      },
      body: '',
    });
  });

  await page.route('**/api/admin/notifications/stream', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'text/event-stream',
      },
      body: '',
    });
  });

  await page.goto('/admin/dashboard/blog');
  await awaitAppReady(page);

  const blogHeading = page.getByRole('heading', { name: /blog/i });
  await expect(blogHeading).toBeVisible();

  const cards = page.getByTestId('blog-card');
  await expect(cards.first()).toBeVisible();

  // at THIS moment we still expect the slow request to be in flight
  // (in CI the request sometimes fires a bit earlier, but we keep the check)
  expect.soft(blogRequestResolved).toBeFalsy();

  // extra safety for CI: wait for the real network response so the poll below
  // never hangs just because the route pattern didn’t match
  await page.waitForResponse(
    (res) => res.url().includes('/api/admin/blogs') && res.status() === 200,
    { timeout: 12_000 }
  );

  // keep your original intent, just give CI more time
  await expect
    .poll(() => blogRequestResolved, { timeout: 12_000 })
    .toBe(true);
});
