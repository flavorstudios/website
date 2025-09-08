/**
 * @jest-environment node
 */
import { getBlogPost } from '@/lib/blog';

describe('getBlogPost server fetch', () => {
  const slug = 'demo';

  beforeEach(() => {
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ slug }) })
    );
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it.each([undefined, 'https://example.com'])('fetches relative URL with BASE_URL %s', async (base) => {
    process.env.BASE_URL = base;
    const post = await getBlogPost(slug);
    expect(post).toEqual({ slug });
    expect(global.fetch).toHaveBeenCalledWith(`/api/blogs/${slug}`, expect.any(Object));
  });
});