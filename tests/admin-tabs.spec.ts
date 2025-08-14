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
      body = JSON.stringify({ posts: [] });
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

test('admin nav tabs render correct content', async ({ page }) => {
  await page.goto('/admin/dashboard');

  const sections = [
    { label: 'Dashboard', expected: /Welcome back/i },
    { label: 'Blog Posts', expected: /Blog Management/i },
    { label: 'Videos', expected: /Video Manager/i },
    { label: 'Media', expected: /Media Library/i },
    { label: 'Categories', expected: /^Categories$/i },
    { label: 'Comments', expected: /Comments & Reviews/i },
    { label: 'Applications', expected: /^Applications$/i },
    { label: 'Email Inbox', expected: /Email Inbox/i },
    { label: 'Users', expected: /^Users$/i },
    { label: 'Settings', expected: /^Settings$/i },
    { label: 'System Tools', expected: /Revalidate Entire Website/i },
  ];

  for (const { label, expected } of sections) {
    await page.getByRole('link', { name: label }).click();
    await expect(page.getByText(expected)).toBeVisible();
    await expect(page.getByText('Loading Admin Dashboard...')).not.toBeVisible();
  }
});

test('theme toggle persists after reload', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await page.getByLabel('Toggle theme').click();

  let isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(isDark).toBe(true);

  await page.reload();
  isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(isDark).toBe(true);
});