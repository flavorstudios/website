import { test, expect, Page } from '@playwright/test';

async function stubBanner(page: Page) {
  await page.addInitScript(() => {
    // stub GTM banner injection
    window.dataLayer = window.dataLayer || [];
    const originalPush = Array.prototype.push;
    window.dataLayer.push = function (...args: any[]) {
      const result = originalPush.apply(this, args);
      const data = args[0] || {};
      if (
        (data.event === 'app_boot' || data.event === 'router_change') &&
        !data.isAdminRoute &&
        !data.isAdminUser &&
        !data.consentGiven &&
        (data.appEnv === 'production' || data.enableGtmCookieBanner === true) &&
        !document.querySelector('[data-cookie-banner]')
      ) {
        setTimeout(() => {
          const banner = document.createElement('div');
          banner.setAttribute('data-cookie-banner', '');
          banner.textContent = 'banner';
          banner.style.position = 'fixed';
          banner.style.bottom = '0';
          document.body.appendChild(banner);
        }, 0);
      }
      return result;
    } as any;
  });
}

test('public page shows banner when no consent', async ({ page }) => {
  await stubBanner(page);
  await page.addInitScript(() => {
    (window as any).__USER__ = { role: 'guest', isAdmin: false };
  });
  await page.goto('/');
  await expect(page.locator('[data-cookie-banner]')).toBeVisible();
});

test('admin page never shows banner', async ({ page }) => {
  await stubBanner(page);
  await page.addInitScript(() => {
    (window as any).__USER__ = { role: 'admin', isAdmin: true };
  });
  await page.goto('/admin');
  await expect(page.locator('[data-cookie-banner]')).toHaveCount(0);
});

test('banner hidden after consent granted', async ({ page }) => {
  await stubBanner(page);
  await page.addInitScript(() => {
    (window as any).__USER__ = { role: 'guest', isAdmin: false };
    try {
      localStorage.setItem('cookie_consent', 'granted');
      document.cookie = 'cookie_consent=granted';
    } catch {}
  });
  await page.goto('/');
  await expect(page.locator('[data-cookie-banner]')).toHaveCount(0);
});