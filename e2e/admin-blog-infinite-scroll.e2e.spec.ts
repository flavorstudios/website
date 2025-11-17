import { getAdminBlogFixtures } from "@/lib/admin/blog-fixtures";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { test, expect } from "./test-setup";
import { awaitAppReady } from "./utils/awaitAppReady";

const fixtures = getAdminBlogFixtures();
const totalDrafts = fixtures.filter((post) => post.status === "draft").length;

test.use({ useGlobalMocks: false });

test("blog manager supports infinite scroll with filters", async ({ page }) => {
  const pageSize = DEFAULT_PAGE_SIZE;
  const secondPageCount = Math.min(fixtures.length, pageSize * 2);

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
  await expect(rows).toHaveCount(Math.min(pageSize, fixtures.length));
  await expect(
    rows.first().getByRole("link", { name: "Post 1" }),
  ).toBeVisible();

  const loadMoreButton = page.getByRole("button", { name: /Load more posts/i });
  await expect(loadMoreButton).toBeVisible();
  await loadMoreButton.click();
  await expect(rows).toHaveCount(secondPageCount);

  await loadMoreButton.click();
  await expect(rows).toHaveCount(fixtures.length);
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
  await expect(rows).toHaveCount(Math.min(pageSize, fixtures.length));

  const statusSelect = page.getByRole("combobox", { name: "Status" });
  await statusSelect.click();
  await page.getByRole("option", { name: "Draft" }).click();
  await expect(rows).toHaveCount(totalDrafts);
  await expect(rows.first().getByRole("link", { name: /Post/ })).toBeVisible();
});