import type { BlogPost } from "../types";

describe("content-store blog normalization", () => {
  const basePost: BlogPost = {
    id: "post_1",
    title: "Title",
    slug: "title",
    content: "<p>Body</p>",
    excerpt: "Body",
    status: "published",
    category: "General",
    tags: [],
    featuredImage: "/image.jpg",
    seoTitle: "SEO",
    seoDescription: "Desc",
    author: "Author",
    publishedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    views: 0,
    readTime: "2 min",
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_TEST_MODE = "1";
  });

  function mockFirestore(posts: BlogPost[]) {
    const get = jest.fn().mockResolvedValue({
      docs: posts.map((post) => ({
        data: () => post,
      })),
    });
    const orderBy = jest.fn().mockReturnValue({ get });
    const collection = jest.fn().mockReturnValue({ orderBy });
    return { collection };
  }

  function setupMocks(posts: BlogPost[]) {
    jest.doMock("@/lib/firebase-admin", () => ({
      getAdminDb: jest.fn(() => mockFirestore(posts)),
    }));

    jest.doMock("@/lib/media", () => ({
      ensureFreshMediaUrl: jest.fn(async (url: string | null | undefined) => url ?? undefined),
      extractMediaIds: jest.fn(() => []),
      linkMediaToPost: jest.fn(),
      unlinkMediaFromPost: jest.fn(),
    }));
  }

  it("trims and filters categories read from Firestore", async () => {
    const messyCategoriesPost: BlogPost = {
      ...basePost,
      categories: ["  Engineering  ", "", null as unknown as string] as unknown as string[],
      category: "  Engineering  ",
    };

    setupMocks([messyCategoriesPost]);

    const { blogStore } = await import("@/lib/content-store");
    const posts = await blogStore.getAll();

    expect(posts[0].categories).toEqual(["Engineering"]);
  });

  it("returns an empty array when no category values are usable", async () => {
    const noCategoryPost: BlogPost = {
      ...basePost,
      categories: ["", "   "] as unknown as string[],
      category: "   ",
    };

    setupMocks([noCategoryPost]);

    const { blogStore } = await import("@/lib/content-store");
    const posts = await blogStore.getAll();

    expect(posts[0].categories).toEqual([]);
  });
});