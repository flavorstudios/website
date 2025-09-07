/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import type { Firestore } from "firebase-admin/firestore";

// Type helper for mocked requireAdmin
type RequireAdminFn = typeof import("@/lib/admin-auth")["requireAdmin"];

jest.mock("@/lib/admin-auth", () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: "tester", role: "admin" }),
}));

let mockAdminDb: unknown;
jest.mock("@/lib/firebase-admin", () => ({
  get adminDb() {
    // Narrow at the module boundary so production code sees what it expects.
    return mockAdminDb as Firestore;
  },
}));

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    // Fresh module state and clean mocks for each test
    jest.resetModules();
    jest.clearAllMocks();
    mockAdminDb = undefined;
  });

  // Helper to build a deterministic Firestore Admin mock
  function buildDb(counts = {
    blogs: 5,
    videos: 2,
    comments: 7,
    viewsBlogs: 100,
    viewsVideos: 50,
    pending: 1,
    published: 4,
    featured: 3,
    currentMonthPosts: 2,
    previousMonthPosts: 1,
    currentMonthVideos: 0,
    previousMonthVideos: 0,
  }) {
    const count = (n: number) => ({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: n }) }),
    });
    const sum = (n: number) => ({
      get: jest.fn().mockResolvedValue({ data: () => ({ views: n }) }),
    });

    const query = (n: number) => ({
      where: () => query(n),
      count: () => count(n),
    });

    let publishedAtCall = 0;
    let publishedAtCallVideos = 0;

    const collection = (name: string) => {
      if (name === "blogs") {
        const queryWithCount = (n: number) => ({
          where: () => queryWithCount(n),
          count: () => count(n),
        });
        return {
          count: () => count(counts.blogs),
          aggregate: () => sum(counts.viewsBlogs),
          where: (field: string) => {
            if (field === "status") return query(counts.published);
            if (field === "publishedAt") {
              publishedAtCall++;
              const n =
                publishedAtCall === 1
                  ? counts.currentMonthPosts
                  : publishedAtCall === 2
                  ? 0
                  : publishedAtCall === 3
                  ? counts.previousMonthPosts
                  : publishedAtCall === 4
                  ? 0
                  : counts.blogs;
              return queryWithCount(n);
            }
            return query(counts.blogs);
          },
        };
      }
      if (name === "videos") {
        const queryWithCount = (n: number) => ({
          where: () => queryWithCount(n),
          count: () => count(n),
        });
        return {
          count: () => count(counts.videos),
          aggregate: () => sum(counts.viewsVideos),
          where: (field: string) => {
            if (field === "featured") return query(counts.featured);
            if (field === "publishedAt") {
              publishedAtCallVideos++;
              const n =
                  publishedAtCallVideos === 1
                    ? counts.currentMonthVideos
                    : publishedAtCallVideos === 2
                    ? 0
                    : publishedAtCallVideos === 3
                    ? counts.previousMonthVideos
                    : publishedAtCallVideos === 4
                    ? 0
                    : counts.videos;
              return queryWithCount(n);
            }
            return query(counts.videos);
          },
        };
      }
      // No direct "comments" collection access in stats; handled via collectionGroup
      return { count: () => count(0), where: () => query(0) };
    };

    const collectionGroup = (name: string) => {
      if (name === "entries") {
        return {
          count: () => count(counts.comments),
          where: (field: string) =>
            field === "status" ? query(counts.pending) : query(counts.comments),
        };
      }
      return { count: () => count(0), where: () => query(0) };
    };

    return { collection, collectionGroup };
  }

  const ranges = ["7d", "30d", "3mo", "6mo", "12mo"] as const;

  it.each(ranges)("returns 200 and a consistent shape for %s", async (range) => {
    mockAdminDb = buildDb();
    const { GET } = await import("./route");
    const req = new NextRequest(`http://test/api/admin/stats?range=${range}`);
    const res = await GET(req);

    expect(res.status).toBe(200);
    // Route sets "Cache-Control": "no-cache"
    expect(res.headers.get("cache-control")).toBe("no-cache");

    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.range).toBe(range);
    expect(typeof json.from).toBe("string");
    expect(typeof json.to).toBe("string");

    // Deterministic totals from our mock
    expect(json.totalPosts).toBe(5);
    expect(json.totalVideos).toBe(2);
    expect(json.totalComments).toBe(7);
    expect(json.totalViews).toBe(150); // 100 + 50
    expect(json.pendingComments).toBe(1);
    expect(json.publishedPosts).toBe(4);
    expect(json.featuredVideos).toBe(3);
    expect(typeof json.monthlyGrowth).toBe("number");

    if (range === "12mo") {
      expect(Array.isArray(json.history)).toBe(true);
      expect(json.history).toHaveLength(12);
      (json.history as Array<{
        month: string;
        posts: number;
        videos: number;
        comments: number;
      }>).forEach((h) => {
        expect(typeof h.month).toBe("string");
        expect(typeof h.posts).toBe("number");
        expect(typeof h.videos).toBe("number");
        expect(typeof h.comments).toBe("number");
      });
    }
  });

  it("rejects invalid range with 400", async () => {
    mockAdminDb = buildDb();
    const { GET } = await import("./route");
    const req = new NextRequest("http://test/api/admin/stats?range=bad");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("denies unauthorized", async () => {
    // Flip the auth mock for this test only
    const adminAuth = await import("@/lib/admin-auth");
    const mockedRequireAdmin = adminAuth
      .requireAdmin as jest.MockedFunction<RequireAdminFn>;
    mockedRequireAdmin.mockResolvedValue(false);

    const { GET } = await import("./route");
    const req = new NextRequest("http://test/api/admin/stats");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns typed 503 when the database call fails", async () => {
    mockAdminDb = {
      collection: () => {
        throw new Error("boom");
      },
      collectionGroup: () => ({}),
    };

    const { GET } = await import("./route");
    const req = new NextRequest("http://test/api/admin/stats?range=30d");
    const res = await GET(req);

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe("Stats unavailable");
  });
  it.each([
    { label: "positive", current: 3, previous: 1, expected: 200 },
    { label: "negative", current: 1, previous: 3, expected: -67 },
    { label: "zero", current: 2, previous: 2, expected: 0 },
  ])(
    "computes %s month-over-month growth",
    async ({ current, previous, expected }) => {
      const baseCounts = {
        blogs: 5,
        videos: 2,
        comments: 7,
        viewsBlogs: 100,
        viewsVideos: 50,
        pending: 1,
        published: 4,
        featured: 3,
      };

      mockAdminDb = buildDb({
        ...baseCounts,
        currentMonthPosts: current,
        previousMonthPosts: previous,
        currentMonthVideos: 0,
        previousMonthVideos: 0,
      });

      const { GET } = await import("./route");
      const req = new NextRequest("http://test/api/admin/stats?range=30d");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.monthlyGrowth).toBe(expected);
    }
  );
});
