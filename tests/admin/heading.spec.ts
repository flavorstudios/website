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
    await page.waitForLoadState("networkidle");
    const roleCount = await page.getByRole("heading", { level: 1 }).count();
    const tagCount = await page.locator("h1").count();

    const h1Texts: string[] = [];
    for (let i = 0; i < tagCount; i += 1) {
      h1Texts.push(await page.locator("h1").nth(i).innerText());
    }

    test.info().attach(`h1-on-${route}`, {
      body: Buffer.from(h1Texts.join("\n"), "utf-8"),
      contentType: "text/plain",
    });

    expect(roleCount, `Duplicate level 1 headings on ${route}.\nH1 texts:\n${h1Texts.join("\n")}`).toBe(1);
    expect(tagCount, `Duplicate <h1> tags on ${route}.\nH1 texts:\n${h1Texts.join("\n")}`).toBe(1);
  });
}