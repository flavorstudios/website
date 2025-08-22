import { test, expect } from '@playwright/test';

const stubResponses = async (page) => {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    let body = '{}';
    if (url.includes('/api/admin/stats')) {
      body = JSON.stringify({
        totalPosts: 0,
        totalVideos: 0,
        totalComments: 0,
        totalViews: 0,
        pendingComments: 0,
        publishedPosts: 0,
        featuredVideos: 0,
        monthlyGrowth: 0,
        history: [],
      });
    } else if (url.includes('/api/admin/activity')) {
      body = JSON.stringify({ activities: [] });
    } else if (url.includes('/api/admin/blogs')) {
      body = JSON.stringify({ posts: [], total: 0 });
    } else if (url.includes('/api/admin/videos')) {
      body = JSON.stringify({ videos: [] });
    } else if (url.includes('/api/admin/categories')) {
      body = JSON.stringify({ categories: [] });
    } else if (url.includes('/api/admin/comments')) {
      body = JSON.stringify({ comments: [] });
    } else if (url.includes('/api/admin/career-submissions')) {
      body = JSON.stringify({ submissions: [] });
    } else if (url.includes('/api/admin/contact-messages')) {
      body = JSON.stringify({ messages: [] });
    } else if (url.includes('/api/admin/from-addresses')) {
      body = JSON.stringify({ addresses: [] });
    } else if (url.includes('/api/admin/users')) {
      body = JSON.stringify({ users: [] });
    } else if (url.includes('/api/admin/settings')) {
      body = JSON.stringify({
        settings: {
          profile: {},
          notifications: { email: true, inApp: true },
          appearance: { theme: 'light', accentColor: '#000' },
        },
      });
    } else if (url.includes('/api/media/')) {
      body = JSON.stringify({ media: [] });
    } else if (url.includes('/api/admin/notifications')) {
      body = JSON.stringify({ notifications: [] });
    }
    await route.fulfill({ contentType: 'application/json', body });
  });
};

test.beforeEach(async ({ page }) => {
  await stubResponses(page);
});

test('single theme toggle switches and persists', async ({ page }) => {
  await page.goto('/admin/dashboard');
  const toggle = page.getByLabel('Toggle theme');
  await expect(toggle).toHaveCount(1);

  await toggle.click();
  let isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(isDark).toBe(true);

  await page.reload();
  isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(isDark).toBe(true);
});

test('respects system preference on first load', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('theme'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/admin/dashboard');
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(isDark).toBe(true);
});
