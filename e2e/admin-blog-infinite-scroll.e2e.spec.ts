import { test, expect } from "./test-setup";
import { awaitAppReady } from "./utils/awaitAppReady";

const encodeCursor = (index: number) =>
  Buffer.from(JSON.stringify({ i: index }), "utf8").toString("base64url");

const decodeCursor = (cursor: string | null): number => {
  if (!cursor) return 0;
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as { i?: number };
    if (typeof parsed.i === "number" && parsed.i >= 0) {
      return parsed.i;
    }
  } catch {
    // ignore
  }
  return 0;
};

const posts = Array.from({ length: 60 }, (_, idx) => {
  const index = idx + 1;
  const status = index % 15 === 0 ? "draft" : "published";
  const category = index % 2 === 0 ? "news" : "updates";
  const author = index % 3 === 0 ? "Jordan" : "Alex";
  const publishedAt = new Date(Date.UTC(2024, 0, 1 + idx)).toISOString();
  const createdAt = new Date(Date.UTC(2023, 11, 1 + idx)).toISOString();
  return {
    id: `post-${index}`,
    title: `Post ${index}`,
    slug: `post-${index}`,
    content: `<p>Post ${index} content</p>`,
    excerpt: `Excerpt ${index}`,
    status,
    category,
    categories: [category],
    tags: [index % 4 === 0 ? "feature" : "general"],
    featuredImage: "",
    seoTitle: `SEO ${index}`,
    seoDescription: `SEO description ${index}`,
    author,
    publishedAt,
    createdAt,
    updatedAt: publishedAt,
    commentCount: index % 5,
    shareCount: index % 3,
    views: 100 + index,
    readTime: `${3 + (index % 5)} min`,
  };
});

test.use({ useGlobalMocks: false });

test("blog manager supports infinite scroll with filters", async ({ page }) => {
  await page.route("**/api/admin/blogs*", async (route) => {
    const url = new URL(route.request().url());
    const params = url.searchParams;
    const q = (params.get("q") || "").toLowerCase();
    const author = (params.get("author") || "").toLowerCase();
    const status = (params.get("status") || "published").toLowerCase();
    const category = (params.get("category") || "all").toLowerCase();
    const sort = (params.get("sort") || "date").toLowerCase();
    const sortDir = (params.get("sortDir") || "desc").toLowerCase();
    const cursor = params.get("cursor");
    const limit = Math.max(
      1,
      Math.min(50, Number.parseInt(params.get("limit") || "25", 10)),
    );

    let filtered = posts.slice();

    if (status !== "all") {
      filtered = filtered.filter(
        (post) => post.status.toLowerCase() === status,
      );
    }
    if (category !== "all") {
      filtered = filtered.filter(
        (post) => post.category.toLowerCase() === category,
      );
    }
    if (author) {
      filtered = filtered.filter((post) =>
        post.author.toLowerCase().includes(author),
      );
    }
    if (q) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sort === "title") {
        return dir * a.title.localeCompare(b.title);
      }
      if (sort === "status") {
        return dir * a.status.localeCompare(b.status);
      }
      const aDate = Date.parse(a.publishedAt || a.createdAt);
      const bDate = Date.parse(b.publishedAt || b.createdAt);
      return dir * (aDate - bDate);
    });

    const start = decodeCursor(cursor);
    const items = filtered.slice(start, start + limit);
    const nextIndex = start + limit;
    const nextCursor =
      nextIndex < filtered.length ? encodeCursor(nextIndex) : null;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items, nextCursor, total: filtered.length }),
    });
  });

  await page.route("**/api/admin/categories?type=blog**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        categories: [
          { name: "News", slug: "news", count: 30 },
          { name: "Updates", slug: "updates", count: 30 },
        ],
      }),
    });
  });

  await page.route("**/api/admin/blogs/stream", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: "",
    });
  });

  await page.route("**/api/admin/notifications/stream", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: "",
    });
  });

  await page.route("**/api/admin/user-role**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ role: "admin" }),
    });
  });

  await page.goto("/admin/dashboard/blog-posts");
  await awaitAppReady(page);

  await expect(page.getByRole("combobox", { name: /per page/i })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("From date")).toHaveCount(0);

  const rows = page.locator("table tbody tr");
  await expect(rows).toHaveCount(25);
  await expect(
    rows.first().getByRole("link", { name: "Post 1" }),
  ).toBeVisible();

  const loadMoreButton = page.getByRole("button", { name: /Load more posts/i });
  await expect(loadMoreButton).toBeVisible();
  await loadMoreButton.click();
  await expect(rows).toHaveCount(50);

  await loadMoreButton.click();
  await expect(rows).toHaveCount(60);
  await expect(
    page.getByText("You’ve reached the end of the results."),
  ).toBeVisible();

  const searchInput = page.getByPlaceholder("Search title...");
  await searchInput.fill("Post 45");
  await expect(rows).toHaveCount(1);
  await expect(
    rows.first().getByRole("link", { name: "Post 45" }),
  ).toBeVisible();

  const clearButton = page.getByRole("button", { name: "Clear" });
  await clearButton.click();
  await expect(rows).toHaveCount(25);

  const statusSelect = page.getByRole("combobox", { name: "Status" });
  await statusSelect.click();
  await page.getByRole("option", { name: "Draft" }).click();
  await expect(rows).toHaveCount(
    posts.filter((post) => post.status === "draft").length,
  );
  await expect(rows.first().getByRole("link", { name: /Post/ })).toBeVisible();
});