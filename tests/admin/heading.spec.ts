import { test, expect } from "@playwright/test";

const routes = [
  "/admin/dashboard",
  "/admin/blogs",
  "/admin/videos",
  "/admin/media",
  "/admin/categories",
  "/admin/comments",
  "/admin/applications",
  "/admin/email",
  "/admin/users",
];

for (const route of routes) {
  test(`exactly one H1 on ${route}`, async ({ page }) => {
    await page.goto(route);
    const h1Count = await page.locator("h1").count();
    expect(h1Count, `Duplicate <h1> on ${route}`).toBe(1);
  });
}