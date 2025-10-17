import { test, expect } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

// Navigate from blog list to first post detail
// and verify the detail page loads with matching title.
test('blog detail navigation', async ({ page }) => {
  const listResponse = await page.goto('/blog');
  await awaitAppReady(page);
  expect(listResponse?.status()).toBe(200);

  const firstCard = page.locator('a[href^="/blog/"]').first();
  const title = (await firstCard.innerText()).trim();
  const targetPath = await firstCard.getAttribute('href');
  expect(targetPath).toBeTruthy();

  const [detailResponse] = await Promise.all([
    page.waitForResponse((response) =>
      targetPath ? response.url().includes(targetPath) && response.status() === 200 : false,
    ),
    page.waitForURL(`**${targetPath}`),
    firstCard.click(),
  ]);

  expect(detailResponse?.status()).toBe(200);
  await awaitAppReady(page);
  await expect(page.locator('h1')).toHaveText(title);
});