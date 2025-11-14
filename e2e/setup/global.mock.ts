import type { Page } from "@playwright/test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR4nGNgYGBgAAAABAABJzQnCgAAAABJRU5ErkJggg==",
  "base64",
);

const jsonResponse = (data: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(data),
});

export async function applyGlobalMocks(page: Page) {
  await page.route("**/*firebasestorage.app/**", (route) =>
    route.fulfill({
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "max-age=600",
      },
      body: tinyPng,
    }),
  );

  await page.route("**/*storage.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "max-age=600",
      },
      body: tinyPng,
    }),
  );

  await page.route("**/api/cron/**", (route) =>
    route.fulfill(jsonResponse({ ok: true })),
  );

  await page.route("**/api/admin/user-role**", (route) =>
    route.fulfill(jsonResponse({ role: "admin" })),
  );

  await page.route("**/api/admin/stats**", (route) =>
    route.fulfill(
      jsonResponse({
        totalPosts: 12,
        totalVideos: 4,
        totalComments: 18,
        totalViews: 2500,
        pendingComments: 3,
        publishedPosts: 7,
        featuredVideos: 2,
        monthlyGrowth: 6,
      }),
    ),
  );

  await page.route("**/api/admin/activity**", (route) =>
    route.fulfill(jsonResponse({ activities: [] })),
  );

  await page.route("**/api/admin/analytics/**", (route) =>
    route.fulfill(
      jsonResponse({
        posts: 2,
        videos: 1,
        totals: { posts: 2, videos: 1 },
      }),
    ),
  );

  await page.route("**/api/admin/blog/list**", (route) =>
    route.fulfill(
      jsonResponse({
        items: [
          {
            id: "b1",
            title: "Hello from E2E",
            slug: "hello-from-e2e",
            status: "published",
          },
        ],
      }),
    ),
  );

  await page.route("**/api/admin/blogs*", async (route) => {
    const url = new URL(route.request().url());
    if (!url.pathname.endsWith("/api/admin/blogs")) {
      return route.fallback();
    }

    await route.fulfill(
      jsonResponse({
        items: [
          {
            id: "b1",
            title: "Hello from E2E",
            slug: "hello-from-e2e",
            status: "published",
            author: "Playwright",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        nextCursor: null,
        total: 1,
      }),
    );
  });

  await page.route("**/api/admin/categories**", (route) =>
    route.fulfill(
      jsonResponse({
        categories: [
          { id: "cat-1", name: "All", slug: "all" },
          { id: "cat-2", name: "News", slug: "news" },
        ],
      }),
    ),
  );

  await page.route("**/api/admin/media**", (route) => {
    const url = new URL(route.request().url());
    const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);

    const baseItems = [
      { id: "media-1", name: "cover.webp", contentType: "image/webp" },
      { id: "media-2", name: "thumbnail.webp", contentType: "image/webp" },
    ];

    const pagedItems =
      pageParam <= 1
        ? baseItems
        : baseItems.map((item, index) => ({
            ...item,
            id: `${item.id}-p${pageParam}-${index}`,
          }));

    route.fulfill(
      jsonResponse({
        items: pagedItems,
        nextPage: pageParam >= 2 ? null : pageParam + 1,
      }),
    );
  });

  await page.route("**/api/admin/media/presign**", (route) =>
    route.fulfill(jsonResponse({ url: "https://example.com/upload" })),
  );

  await page.route("**/api/admin/media/upload**", (route) =>
    route.fulfill(jsonResponse({ success: true })),
  );

  await page.route("**/api/media/list**", (route) =>
    route.fulfill(
      jsonResponse({
        media: [
          {
            id: "media-1",
            url: "/placeholder.png",
            filename: "placeholder.png",
            name: "Placeholder",
            alt: "Placeholder image",
            mime: "image/png",
            size: 1024,
            attachedTo: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        cursor: null,
      }),
    ),
  );

  await page.route("**/api/admin/notifications**", (route) =>
    route.fulfill(jsonResponse({ notifications: [] })),
  );

  await page.route("**/api/admin/blogs/stream", (route) =>
    route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: "",
    }),
  );
  
  await page.route("**/api/admin/notifications/stream", (route) =>
    route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: "",
    }),
  );
}
