import { test, expect } from "@playwright/test";

import { SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";
import type { SectionId } from "@/app/admin/dashboard/sections";

const routes: Array<{ route: string; section: SectionId }> = [
  { route: "/admin/blogs", section: "blogs" },
  { route: "/admin/videos", section: "videos" },
  { route: "/admin/media", section: "media" },
  { route: "/admin/categories", section: "categories" },
  { route: "/admin/comments", section: "comments" },
  { route: "/admin/applications", section: "applications" },
  { route: "/admin/email", section: "inbox" },
  { route: "/admin/users", section: "users" },
  { route: "/admin/dashboard/system", section: "system" },
];

for (const { route, section } of routes) {
  test(`single h1 on ${route}`, async ({ page }) => {
    await page.goto(route);
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s.first()).toBeVisible();
    await expect(h1s.first()).toHaveText(SECTION_HEADINGS[section]);
  });
}