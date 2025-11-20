import { expect, type Locator, type Page, type Response } from "@playwright/test";

function isBlogResponse(response: Response): boolean {
  try {
    return (
      response.url().includes("/api/admin/blogs") &&
      response.request().method() === "GET"
    );
  } catch {
    return false;
  }
}

export async function waitForAdminBlogTableToLoad(page: Page): Promise<Locator> {

  const rows = page.locator(
    '[data-testid="blog-table-row"], [data-testid="blog-card"]',
  );

  await Promise.race([
    page.waitForResponse(
      (response) => isBlogResponse(response) && response.status() === 200,
      { timeout: 15_000 },
    ),
    rows.first().waitFor({ state: "attached", timeout: 15_000 }),
  ]);
  
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  return rows;
}