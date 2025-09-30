/**
 * @jest-environment node
 */

import { blogStore, getFallbackBlogPosts } from "@/lib/content-store";
import { formatPublicBlogSummary } from "@/lib/formatters";

jest.mock("@/lib/content-store", () => ({
  __esModule: true,
  blogStore: { getAll: jest.fn() },
  getFallbackBlogPosts: jest.fn(),
  isFallbackResult: jest.fn(),
}));

jest.mock("@/lib/formatters", () => ({
  __esModule: true,
  formatPublicBlogSummary: jest.fn(async (blog: any) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
  })),
}));

describe("GET /api/blogs", () => {
  beforeEach(() => {
    (blogStore.getAll as jest.Mock).mockReset();
    (getFallbackBlogPosts as jest.Mock).mockReset();
    (formatPublicBlogSummary as jest.Mock).mockClear();
    (getFallbackBlogPosts as jest.Mock).mockReturnValue([]);
  });

  it("returns formatted fallback summaries when the store throws", async () => {
    const fallbackPost = {
      id: "fallback-1",
      title: "Fallback Post",
      slug: "fallback-post",
      excerpt: "Fallback excerpt",
      status: "published",
    };

    (blogStore.getAll as jest.Mock).mockRejectedValue(new Error("store down"));
    (getFallbackBlogPosts as jest.Mock).mockReturnValue([fallbackPost]);

    const { GET } = await import("./route");

    const request = {
      nextUrl: new URL("https://example.com/api/blogs"),
    } as any;

    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(formatPublicBlogSummary).toHaveBeenCalledWith(fallbackPost);
    expect(data).toEqual([
      expect.objectContaining({
        id: "fallback-1",
        slug: "fallback-post",
        title: "Fallback Post",
        excerpt: "Fallback excerpt",
      }),
    ]);
  });
});