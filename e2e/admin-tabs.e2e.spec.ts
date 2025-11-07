import type { Page } from '@playwright/test';
import { test, expect } from './test-setup';
import { awaitAppReady } from './utils/awaitAppReady';

const stubResponses = async (page: Page) => {
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
      } else if (url.includes('/api/admin/user-role')) {
      body = JSON.stringify({ role: 'admin' });
    }
    await route.fulfill({ contentType: 'application/json', body });
  });
};

test.beforeEach(async ({ page }) => {
  await stubResponses(page);
});

test('admin nav tabs render correct content', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await awaitAppReady(page);

  const sections = [
    { label: 'Dashboard', expected: 'Dashboard Overview', path: '/admin/dashboard' },
    { label: 'Blog Posts', expected: 'Blog Posts', path: '/admin/dashboard/blog-posts' },
    { label: 'Videos', expected: 'Videos', path: '/admin/dashboard/videos' },
    { label: 'Media', expected: 'Media Manager', path: '/admin/dashboard/media' },
    { label: 'Categories', expected: 'Categories', path: '/admin/dashboard/categories' },
    { label: 'Comments', expected: 'Comments & Reviews', path: '/admin/dashboard/comments' },
    { label: 'Applications', expected: 'Applications', path: '/admin/dashboard/applications' },
    { label: 'Email Inbox', expected: 'Email Inbox', path: '/admin/dashboard/inbox' },
    { label: 'Users', expected: 'Users', path: '/admin/dashboard/users' },
    { label: 'Settings', expected: 'Settings', path: '/admin/dashboard/settings' },
    { label: 'System Tools', expected: 'System Tools', path: '/admin/dashboard/system' },
  ] as const;

  for (const { label, expected, path } of sections) {
    const navLink = page.getByRole('link', { name: label });
    await expect(navLink).toBeVisible();
    await navLink.click();
    await expect(page).toHaveURL(path);
    await awaitAppReady(page);
    await expect(page.getByTestId('dashboard-title')).toHaveText(expected);
    await expect(page.getByText('Loading Admin Dashboard...')).not.toBeVisible();
  }
});
