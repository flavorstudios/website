import { getBlogPosts, getVideos } from "../data";

describe("data category normalization", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it("trims and filters blog post categories", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          title: "Post",
          slug: "post",
          excerpt: "Excerpt",
          category: " General ",
          categories: ["  Tech  ", "", "   "],
          tags: [],
          featuredImage: "/img.jpg",
          author: "Author",
          publishedAt: "2024-01-01T00:00:00.000Z",
          views: 0,
        },
      ],
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const posts = await getBlogPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].categories).toEqual(["Tech"]);
  });

  it("handles blog API responses nested under a posts key", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        posts: [
          {
            id: "1",
            title: "Post",
            slug: "post",
            excerpt: "Excerpt",
            category: "General",
            categories: [],
            tags: [],
            featuredImage: "/img.jpg",
            author: "Author",
            publishedAt: "2024-01-01T00:00:00.000Z",
            views: 0,
          },
        ],
      }),
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const posts = await getBlogPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("post");
  });

  it("uses a trimmed fallback blog category when list is empty", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          title: "Post",
          slug: "post",
          excerpt: "Excerpt",
          category: "  General  ",
          categories: ["", "  "],
          tags: [],
          featuredImage: "/img.jpg",
          author: "Author",
          publishedAt: "2024-01-01T00:00:00.000Z",
          views: 0,
        },
      ],
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const posts = await getBlogPosts();
    expect(posts[0].categories).toEqual(["General"]);
  });

  it("returns an empty array when no blog categories are available", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          title: "Post",
          slug: "post",
          excerpt: "Excerpt",
          category: "   ",
          categories: null,
          tags: [],
          featuredImage: "/img.jpg",
          author: "Author",
          publishedAt: "2024-01-01T00:00:00.000Z",
          views: 0,
        },
      ],
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const posts = await getBlogPosts();
    expect(posts[0].categories).toEqual([]);
  });

  it("normalizes video categories the same way", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "v1",
          title: "Video",
          slug: "video",
          description: "",
          category: "  Highlights  ",
          categories: ["", " Clips "],
          tags: [],
          publishedAt: "2024-01-01T00:00:00.000Z",
          thumbnailUrl: "/thumb.jpg",
          videoUrl: "https://example.com",
          duration: "1:00",
          featured: false,
        },
      ],
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const videos = await getVideos();
    expect(videos[0].categories).toEqual(["Clips"]);
  });

  it("handles video API responses nested under a videos key", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        videos: [
          {
            id: "v1",
            title: "Video",
            slug: "video",
            description: "",
            category: "Highlights",
            categories: [],
            tags: [],
            publishedAt: "2024-01-01T00:00:00.000Z",
            thumbnailUrl: "/thumb.jpg",
            videoUrl: "https://example.com",
            duration: "1:00",
            featured: false,
          },
        ],
      }),
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const videos = await getVideos();
    expect(videos).toHaveLength(1);
    expect(videos[0].slug).toBe("video");
  });
});