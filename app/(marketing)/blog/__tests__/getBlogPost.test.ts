/**
 * @jest-environment node
 */

import { restoreEnv, snapshotEnv, withEnv } from '@/test-utils/env';

describe('getBlogPost server fetch', () => {
  const slug = 'demo';
  const originalEnv = snapshotEnv(['NEXT_PUBLIC_BASE_URL']);

  beforeEach(() => {
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ slug }) })
    );
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    restoreEnv(originalEnv);
  });

  it.each([undefined, 'https://example.com'])(
    'fetches URL with NEXT_PUBLIC_BASE_URL %s',
    async (base) => {
      await withEnv({ NEXT_PUBLIC_BASE_URL: base }, async () => {
        const { getBlogPost } = await import('@/lib/blog');
        const post = await getBlogPost(slug);
        expect(post).toEqual({ slug });
        const expectedPath = `/api/blogs/${encodeURIComponent(slug)}`;
        const expected = base
          ? `${base}${expectedPath}`
          : expect.stringContaining(expectedPath);
        expect(global.fetch).toHaveBeenCalledWith(
          expected,
          expect.any(Object)
        );
      });
    },
  );
});