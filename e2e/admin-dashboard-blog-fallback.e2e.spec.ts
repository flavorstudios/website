import { expect, test } from "./test-setup";
import { awaitAppReady } from "./utils/awaitAppReady";

test("blog fallback cards render before data resolves on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });

  // we still use this flag so we can assert pre-/post- states
  let blogRequestResolved = false;

  // Some environments call /api/admin/blogs (no "?") and some call /api/admin/blogs?...,
  // so match BOTH.
  const BLOGS_API_GLOB = "**/api/admin/blogs*";

  // slow down ONLY the first blogs request to simulate "data still loading"
  await page.route(BLOGS_API_GLOB, async (route) => {
    if (!blogRequestResolved) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      blogRequestResolved = true;
      const realResponse = await route.fetch();
      const body = await realResponse.body();
      await route.fulfill({
        status: realResponse.status(),
        headers: realResponse.headers(),
        body,
      });
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/admin/categories?type=blog**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ categories: [] }),
    });
  });

  await page.route("**/api/admin/blogs/stream", async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
      },
      body: "",
    });
  });

  await page.route("**/api/admin/notifications/stream", async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
      },
      body: "",
    });
  });

  await page.goto("/admin/dashboard/blog");
  await awaitAppReady(page);

  const heading = page.getByRole("heading", { level: 1, name: /Blog/i });
  const fallbackTitle = page.getByTestId("page-title").first();
  await expect(heading.or(fallbackTitle)).toBeVisible();
  await expect(fallbackTitle).toHaveText(/Blog/i);

  const cards = page.getByTestId("blog-card");
  await expect(cards.first()).toBeVisible();

  // at THIS moment we still expect the slow request to be in flight
  // (in CI the request sometimes fires a bit earlier, but we keep the check)
  expect(blogRequestResolved).toBeFalsy();

  // extra safety for CI: wait for the real network response so the poll below
  // never hangs just because the route pattern didn’t match
  await page.waitForResponse(
    (res) => res.url().includes("/api/admin/blogs") && res.status() === 200,
    { timeout: 12_000 },
  );

  // keep your original intent, just give CI more time
  await expect.poll(() => blogRequestResolved, { timeout: 12_000 }).toBe(true);
});
