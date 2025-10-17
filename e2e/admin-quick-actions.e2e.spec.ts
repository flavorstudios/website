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

test('quick action buttons navigate to expected sections', async ({ page }) => {
  const actions = [
    {
      button: 'Create New Post',
      expected: 'Blog Posts',
      url: '/admin/dashboard/blog-posts',
    },
    { button: 'Add Video', expected: 'Videos', url: '/admin/dashboard/videos' },
    {
      button: 'Moderate Comments',
      expected: 'Comments & Reviews',
      url: '/admin/dashboard/comments',
    },
    { button: 'Manage Users', expected: 'Users', url: '/admin/dashboard/users' },
  ];

  for (const { button, expected, url } of actions) {
    await awaitAppReady(page);
    const actionButton = page.getByRole('button', { name: button });
    await expect(actionButton).toBeVisible();
    await actionButton.click();
    await page.getByRole('button', { name: button }).click();
    await expect(page).toHaveURL(url);
    await awaitAppReady(page);
    await expect(page.getByTestId('dashboard-title')).toHaveText(expected);
    await expect(page.getByText('Loading Admin Dashboard...')).not.toBeVisible();
  }
});