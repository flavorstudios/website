/**
 * @jest-environment node
 */
import { blogStore } from "@/lib/content-store";

jest.mock("@/lib/content-store", () => ({
  blogStore: { getBySlug: jest.fn() },
}));

describe("GET /api/blogs/:slug", () => {
  it("returns content and author", async () => {
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

    (blogStore.getBySlug as jest.Mock).mockResolvedValue(mockPost);

    const { GET } = await import("./route");

    const res = await GET({} as Request, { params: Promise.resolve({ slug: "test" }) });
    const data = await res.json();

    expect(data.content).toBe("Hello world");
    expect(data.author).toBe("Jane Doe");
  });
});