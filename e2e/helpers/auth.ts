import { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.context().addCookies([
    {
      name: 'e2e-admin',
      value: 'true',
      domain: 'localhost',
      path: '/',
    },
  ]);
}
