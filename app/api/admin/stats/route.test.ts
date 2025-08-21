/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

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
    return mockAdminDb as any;
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
  }) {
    const count = (n: number) => ({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: n }) }),
    });
    const sum = (n: number) => ({
      get: jest.fn().mockResolvedValue({ data: () => ({ views: n }) }),
    });

    const collection = (name: string) => {
      if (name === "blogs") {
        return {
          count: () => count(counts.blogs),
          aggregate: () => sum(counts.viewsBlogs),
          where: () => ({ count: () => count(counts.published) }),
        };
      }
      if (name === "videos") {
        return {
          count: () => count(counts.videos),
          aggregate: () => sum(counts.viewsVideos),
          where: () => ({ count: () => count(counts.featured) }),
        };
      }
      if (name === "comments") {
        return {
          count: () => count(counts.comments),
          where: () => ({ count: () => count(counts.pending) }),
        };
      }
      return { count: () => count(0) };
    };

    const collectionGroup = () => ({
      where: () => ({ count: () => count(0) }),
    });

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

    if (range === "12mo") {
      expect(Array.isArray(json.history)).toBe(true);
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
});
