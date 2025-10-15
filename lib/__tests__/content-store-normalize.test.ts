const mockPosts: any[] = [];

jest.mock("@/lib/media", () => ({
  ensureFreshMediaUrl: jest.fn(async (url: string | null | undefined) => url),
  extractMediaIds: jest.fn(() => []),
  linkMediaToPost: jest.fn(),
  unlinkMediaFromPost: jest.fn(),
}));

jest.mock("@/lib/firebase-admin", () => {
  const collectionResult = {
    orderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    })),
    get: jest.fn(async () => ({
      docs: mockPosts.map((data, index) => ({
        id: data.id ?? `post-${index}`,
        data: () => data,
      })),
    })),
  };

  const db = {
    collection: jest.fn(() => collectionResult),
  };

  return {
    getAdminDb: () => db,
    __setMockPosts: (posts: any[]) => {
      mockPosts.splice(0, mockPosts.length, ...posts);
    },
  };
});

const { __setMockPosts } = jest.requireMock("@/lib/firebase-admin") as {
  __setMockPosts: (posts: any[]) => void;
};

const basePost = {
  title: "Title",
  slug: "slug",
  content: "<p>content</p>",
  excerpt: "excerpt",
  status: "published" as const,
  tags: ["tag"],
  featuredImage: "img.jpg",
  seoTitle: "seo",
  seoDescription: "desc",
  author: "author",
  publishedAt: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  views: 0,
};

const { blogStore } = require("@/lib/content-store") as typeof import("@/lib/content-store");

describe("blogStore category normalization", () => {
  beforeEach(() => {
    __setMockPosts([
      {
        ...basePost,
        id: "one",
        category: "  Primary  ",
        categories: ["  Primary  ", "", "Secondary", null as unknown as string],
        commentCount: undefined,
        shareCount: undefined,
      },
      {
        ...basePost,
        id: "two",
        category: "",
        categories: ["   ", null as unknown as string],
      },
    ]);
  });

  afterEach(() => {
    __setMockPosts([]);
  });

  it("filters invalid categories and trims the primary category", async () => {
    const posts = await blogStore.getAll();

    expect(posts[0].categories).toEqual(["Primary", "Secondary"]);
    expect(posts[0].category).toBe("Primary");
    expect(posts[0].commentCount).toBe(0);
    expect(posts[0].shareCount).toBe(0);

    expect(posts[1].categories).toEqual([]);
    expect(posts[1].category).toBe("");
  });
});