/**
 * @jest-environment node
 */
import {
  blogStore,
  getFallbackBlogPostBySlug,
  getFallbackBlogPostById,
  isFallbackResult,
} from "@/lib/content-store";

jest.mock("@/lib/content-store", () => {
  const actual = jest.requireActual<typeof import("@/lib/content-store")>(
    "@/lib/content-store",
  );
  return {
    ...actual,
    blogStore: { getBySlug: jest.fn(), getById: jest.fn() },
    getFallbackBlogPostBySlug: jest.fn(),
    getFallbackBlogPostById: jest.fn(),
    isFallbackResult: jest.fn(),
  };
});

describe("GET /api/blogs/:key", () => {
  const mockPost = {
    id: "1",
    title: "Test",
    slug: "test",
    content: "Hello world",
    excerpt: "Hello",
    status: "published",
    category: "tech",
    categories: ["tech"],
    tags: [],
    featuredImage: "/img.jpg",
    seoTitle: "SEO",
    seoDescription: "Desc",
    author: "Jane Doe",
    publishedAt: "2024-01-01",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    views: 0,
    readTime: "1 min",
    commentCount: 0,
    shareCount: 0,
    openGraphImage: "/og.jpg",
    schemaType: "Article",
  };

  beforeEach(() => {
    (blogStore.getBySlug as jest.Mock).mockReset();
    (blogStore.getById as jest.Mock).mockReset();
    (getFallbackBlogPostBySlug as jest.Mock).mockReset();
    (getFallbackBlogPostById as jest.Mock).mockReset();
    (isFallbackResult as jest.Mock).mockReset();
    (getFallbackBlogPostBySlug as jest.Mock).mockReturnValue(null);
    (getFallbackBlogPostById as jest.Mock).mockReturnValue(null);
    (isFallbackResult as jest.Mock).mockReturnValue(false);
    delete process.env.ACCEPT_ID_FALLBACK;
  });

  it("returns content for slug", async () => {
    (blogStore.getBySlug as jest.Mock).mockResolvedValue(mockPost);

    const { GET } = await import("./route");

    const res = await GET({} as Request, { params: Promise.resolve({ key: "test" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Hello world");
  });

  it("falls back to id when allowed", async () => {
    (blogStore.getBySlug as jest.Mock).mockResolvedValue(null);
    (blogStore.getById as jest.Mock).mockResolvedValue(mockPost);
    process.env.ACCEPT_ID_FALLBACK = "true";

    const { GET } = await import("./route");

    const res = await GET({} as Request, { params: Promise.resolve({ key: "1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.author).toBe("Jane Doe");
  });

  it("returns 404 for id when fallback disabled", async () => {
    (blogStore.getBySlug as jest.Mock).mockResolvedValue(null);
    (blogStore.getById as jest.Mock).mockResolvedValue(mockPost);
    process.env.ACCEPT_ID_FALLBACK = "false";

    const { GET } = await import("./route");

    const res = await GET({} as Request, { params: Promise.resolve({ key: "1" }) });
    expect(res.status).toBe(404);
    expect(blogStore.getById).not.toHaveBeenCalled();
  });
  
  it("returns formatted fallback content when handler throws", async () => {
    (blogStore.getBySlug as jest.Mock).mockImplementation(() => {
      throw new Error("store failure");
    });
    const fallbackPost = { ...mockPost, content: "Fallback content" };
    (getFallbackBlogPostBySlug as jest.Mock).mockReturnValue(fallbackPost);

    const { GET } = await import("./route");

    const res = await GET({} as Request, {
      params: Promise.resolve({ key: "test" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Fallback content");
    expect(data.slug).toBe("test");
  });
});