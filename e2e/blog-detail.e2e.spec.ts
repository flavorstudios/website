import { test, expect } from '@playwright/test';

// Navigate from blog list to first post detail
// and verify the detail page loads with matching title.
test('blog detail navigation', async ({ page }) => {
  const listResponse = await page.goto('/blog');
  expect(listResponse?.status()).toBe(200);

  const firstCard = page.locator('a[href^="/blog/"]').first();
  const title = (await firstCard.innerText()).trim();

  const [detailResponse] = await Promise.all([
    page.waitForNavigation(),
    firstCard.click(),
  ]);

  expect(detailResponse?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText(title);
});