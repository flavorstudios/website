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
  await page.waitForResponse(
    (response) => isBlogResponse(response) && response.status() === 200,
    { timeout: 15_000 },
  );

  const rows = page.locator("table tbody tr");
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });
  return rows;
}