/**
 * @jest-environment node
 */
import type { PublicBlogDetail } from "@/lib/types";

jest.mock("@/lib/blog", () => ({
  getBlogPost: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/components/StructuredData", () => ({
  StructuredData: () => null,
}));

jest.mock("@/components/blog/BlogRenderer", () => ({
  __esModule: true,
  default: () => null,
}));

describe("/blog/[slug] scheduled post rendering", () => {
  const mockPost: PublicBlogDetail = {
    id: "scheduled-1",
    title: "Scheduled story",
    slug: "scheduled-story",
    content: "<p>Ready to go</p>",
    excerpt: "Soon",
    featuredImage: "/img.jpg",
    category: "news",
    categories: ["news"],
    tags: ["launch"],
    author: "Editor",
    publishedAt: "2024-04-01T09:00:00.000Z",
    scheduledFor: "2024-04-01T09:00:00.000Z",
    createdAt: "2024-03-25T09:00:00.000Z",
    updatedAt: "2024-04-01T09:00:00.000Z",
    readTime: "3 min",
    views: 0,
    seoTitle: "Scheduled story",
    seoDescription: "Scheduled", 
    featured: false,
    commentCount: 0,
    shareCount: 0,
    schemaType: "Article",
    openGraphImage: "/img.jpg",
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("does not invoke notFound when the scheduled post is available", async () => {
    const { getBlogPost } = await import("@/lib/blog");
    (getBlogPost as jest.Mock).mockResolvedValue(mockPost);
    const { notFound } = await import("next/navigation");

    const pageModule = await import("../[slug]/page");
    const result = await pageModule.default({
      params: Promise.resolve({ slug: mockPost.slug }),
    });

    expect(getBlogPost).toHaveBeenCalledWith(mockPost.slug);
    expect(notFound).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});