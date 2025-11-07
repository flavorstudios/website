import { test, expect } from "@playwright/test";

const ADMIN_ROUTES = [
  { path: "/admin/blogs", title: "Blog Posts" },
  { path: "/admin/videos", title: "Videos" },
  { path: "/admin/media", title: "Media Manager" },
  { path: "/admin/categories", title: "Categories" },
  { path: "/admin/comments", title: "Comments" },
  { path: "/admin/applications", title: "Applications" },
  { path: "/admin/email", title: "Email Inbox" },
  { path: "/admin/users", title: "Users" },
  { path: "/admin/system-tools", title: "System Tools" },
];

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("admin routes have a single <h1>", () => {
  for (const { path, title } of ADMIN_ROUTES) {
    test(`renders one h1 on ${path}`, async ({ page }) => {
      await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
      const h1s = page.getByRole("heading", { level: 1 });
      await expect(h1s).toHaveCount(1);
      await expect(h1s.first()).toBeVisible();
      await expect(h1s.first()).toHaveText(title, { useInnerText: true });
    });
  }
});