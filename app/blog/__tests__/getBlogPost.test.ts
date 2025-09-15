/**
 * @jest-environment node
 */

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
    delete process.env["NEXT_PUBLIC_BASE_URL"];
  });

  it.each([undefined, 'https://example.com'])(
    'fetches URL with NEXT_PUBLIC_BASE_URL %s',
    async (base) => {
      if (base) {
        process.env["NEXT_PUBLIC_BASE_URL"] = base;
      } else {
        delete process.env["NEXT_PUBLIC_BASE_URL"];
      }
      const { getBlogPost } = await import('@/lib/blog');
      const post = await getBlogPost(slug);
      expect(post).toEqual({ slug });
      const expected = base
        ? `${base}/api/blogs/${encodeURIComponent(slug)}`
        : `/api/blogs/${encodeURIComponent(slug)}`;
      expect(global.fetch).toHaveBeenCalledWith(
        expected,
        expect.any(Object)
      );
    },
  );
});