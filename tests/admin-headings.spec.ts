import { test, expect } from "@playwright/test";

import { SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const ROUTES: Array<[string, string]> = [
  ["/admin/blogs", SECTION_HEADINGS.blogs],
  ["/admin/videos", SECTION_HEADINGS.videos],
  ["/admin/media", SECTION_HEADINGS.media],
  ["/admin/categories", SECTION_HEADINGS.categories],
  ["/admin/comments", SECTION_HEADINGS.comments],
  ["/admin/applications", SECTION_HEADINGS.applications],
  ["/admin/email", SECTION_HEADINGS.inbox],
  ["/admin/email-inbox", SECTION_HEADINGS.inbox],
  ["/admin/users", SECTION_HEADINGS.users],
  ["/admin/system-tools", SECTION_HEADINGS.system],
  ["/admin/dashboard/settings", SECTION_HEADINGS.settings],
];

test.describe("admin routes expose a single level-one heading", () => {
  for (const [path, expected] of ROUTES) {
    test(`renders one h1 on ${path}`, async ({ page }) => {
      await page.goto(`${baseUrl}${path}`);
      const h1s = page.getByRole("heading", { level: 1 });
      await expect(h1s).toHaveCount(1);
      await expect(h1s.first()).toBeVisible();
      await expect(h1s.first()).toHaveText(expected, { useInnerText: true });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("[role='heading'][aria-level='1']")).toHaveCount(0);
    });
  }
});