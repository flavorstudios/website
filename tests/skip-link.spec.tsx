// tests/skip-link.spec.tsx
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Skip link + a11y", () => {
  test("page has working skip link", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).not.toBeVisible();

    // Focus the skip link via keyboard (Tab) and ensure it becomes visible
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeVisible();

    // Activate the skip link and ensure focus lands on the main region
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("has no obvious axe violations", async ({ page }) => {
    await page.goto("/");
    const { violations } = await new AxeBuilder({ page }).analyze();

    if (violations.length) {
      // Print helpful details in CI logs if something fails
      console.log("Axe violations:", JSON.stringify(violations, null, 2));
    }
    expect(violations).toEqual([]);
  });
});
