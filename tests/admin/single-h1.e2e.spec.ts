import { test, expect } from "@playwright/test";

import { SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";
import type { SectionId } from "@/app/admin/dashboard/sections";

type AdminRoute = { path: string; section?: SectionId; heading?: string };

const ADMIN_ROUTES: AdminRoute[] = [
  { path: "/admin/blogs", section: "blogs" },
  { path: "/admin/videos", section: "videos" },
  { path: "/admin/media", section: "media" },
  { path: "/admin/categories", section: "categories" },
  { path: "/admin/comments", section: "comments" },
  { path: "/admin/applications", section: "applications" },
  { path: "/admin/email", section: "inbox" },
  { path: "/admin/email-inbox", section: "inbox" },
  { path: "/admin/users", section: "users" },
  { path: "/admin/system-tools", heading: "System Tools" },
];

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("admin routes have a single <h1>", () => {
  for (const { path, section, heading } of ADMIN_ROUTES) {
    test(`renders one h1 on ${path}`, async ({ page }) => {
      await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
      const h1s = page.getByRole("heading", { level: 1 });
      await expect(h1s).toHaveCount(1);
      await expect(h1s.first()).toBeVisible();
      const expectedHeading = section ? SECTION_HEADINGS[section] : heading;
      if (!expectedHeading) {
        throw new Error(`Missing expected heading for ${path}`);
      }
      await expect(h1s.first()).toHaveText(expectedHeading, { useInnerText: true });

      const tagH1s = page.locator("h1");
      await expect(tagH1s).toHaveCount(1);
      const ariaLevelOne = page.locator("[role='heading'][aria-level='1']");
      await expect(ariaLevelOne).toHaveCount(0);
    });
  }
});