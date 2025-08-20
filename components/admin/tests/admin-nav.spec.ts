import { test, expect } from '@playwright/test';

const cases = [
  { label: 'Blog Posts', path: '/admin/posts', heading: /Blog Posts/i },
  { label: 'Videos', path: '/admin/videos', heading: /Videos/i },
  { label: 'Media', path: '/admin/media', heading: /Media/i },
  { label: 'Categories', path: '/admin/categories', heading: /Categories/i },
  { label: 'Comments', path: '/admin/comments', heading: /Comments/i },
  { label: 'Applications', path: '/admin/applications', heading: /Applications/i },
  { label: 'Email Inbox', path: '/admin/email-inbox', heading: /Email Inbox/i },
  { label: 'Users', path: '/admin/users', heading: /Users/i },
];

test.describe('Admin sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
  });

  for (const c of cases) {
    test(`navigates to ${c.label}`, async ({ page }) => {
      await page.getByRole('navigation', { name: 'Admin' }).getByRole('link', { name: c.label }).click();
      await expect(page).toHaveURL(new RegExp(`${c.path}$`));
      await expect(page.getByRole('heading', { name: c.heading })).toBeVisible();
    });
  }
});