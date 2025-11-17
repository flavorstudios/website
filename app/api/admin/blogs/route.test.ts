/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { restoreEnv, setEnv, snapshotEnv } from '@/test-utils/env';
import { logActivity } from "@/lib/activity-log";

jest.mock("@/lib/activity-log", () => ({ logActivity: jest.fn() }));

jest.mock("@/lib/admin-auth", () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest
    .fn()
    .mockResolvedValue({ uid: "admin", email: "admin@test.com" }),
}));

jest.mock("@/lib/content-store", () => ({
  blogStore: {
    create: jest
      .fn()
      .mockResolvedValue({
        id: "1",
        title: "Test",
        commentCount: 0,
        shareCount: 0,
      }),
    getAll: jest.fn(),
  },
  ADMIN_DB_UNAVAILABLE: "ADMIN_DB_UNAVAILABLE",
}));

jest.mock("@/lib/e2e-fixtures", () => ({
  getE2EBlogPosts: jest.fn(() => []),
}));

jest.mock("@/lib/e2e-utils", () => ({
  hasE2EBypass: jest.fn(() => false),
}));

jest.mock("@/lib/sse-broker", () => ({ publishToUser: jest.fn() }));

let infoSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

const mockPosts = [
  {
    id: "a",
    title: "Alpha launch",
    slug: "alpha-launch",
    content: "<p>Alpha</p>",
    excerpt: "Alpha",
    status: "published",
    category: "news",
    categories: ["news"],
    tags: ["feature"],
    featuredImage: "/alpha.png",
    seoTitle: "Alpha",
    seoDescription: "Alpha description",
    author: "Alice",
    publishedAt: "2024-03-01T00:00:00.000Z",
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
    commentCount: 2,
    shareCount: 1,
    views: 10,
    readTime: "5 min",
  },
  {
    id: "b",
    title: "Beta draft",
    slug: "beta-draft",
    content: "<p>Beta</p>",
    excerpt: "Beta",
    status: "draft",
    category: "news",
    categories: ["news"],
    tags: ["internal"],
    featuredImage: "/beta.png",
    seoTitle: "Beta",
    seoDescription: "Beta description",
    author: "Bob",
    publishedAt: "2024-02-01T00:00:00.000Z",
    createdAt: "2024-01-30T00:00:00.000Z",
    updatedAt: "2024-02-01T00:00:00.000Z",
    commentCount: 0,
    shareCount: 0,
    views: 5,
    readTime: "3 min",
  },
  {
    id: "c",
    title: "Gamma update",
    slug: "gamma-update",
    content: "<p>Gamma</p>",
    excerpt: "Gamma",
    status: "published",
    category: "updates",
    categories: ["updates"],
    tags: ["release"],
    featuredImage: "/gamma.png",
    seoTitle: "Gamma",
    seoDescription: "Gamma description",
    author: "Alice",
    publishedAt: "2024-02-15T00:00:00.000Z",
    createdAt: "2024-02-10T00:00:00.000Z",
    updatedAt: "2024-02-15T00:00:00.000Z",
    commentCount: 1,
    shareCount: 0,
    views: 7,
    readTime: "4 min",
  },
];

const originalEnv = snapshotEnv(['USE_DEMO_CONTENT']);

beforeEach(() => {
  if (!process.env.DEBUG) {
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  }

  const contentStore = require("@/lib/content-store");
  contentStore.blogStore.getAll.mockResolvedValue(mockPosts);

  const { getE2EBlogPosts } = require("@/lib/e2e-fixtures");
  getE2EBlogPosts.mockReturnValue(mockPosts);

  const { hasE2EBypass } = require("@/lib/e2e-utils");
  hasE2EBypass.mockReturnValue(false);

  restoreEnv(originalEnv);
  setEnv('USE_DEMO_CONTENT', undefined);
});

afterEach(() => {
  infoSpy?.mockRestore();
  errorSpy?.mockRestore();
});

afterAll(() => {
  restoreEnv(originalEnv);
});

describe("POST /api/admin/blogs", () => {
  it("logs activity on create", async () => {
    const { POST } = await import("./route");
    const req = {
      json: async () => ({ title: "Test", content: "body" }),
    } as any;
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: "blog.create", user: "admin@test.com" }),
    );
  });
});

describe("GET /api/admin/blogs", () => {
  it("returns published posts by default with cursor pagination", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost/api/admin/blogs?limit=1");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe("a");
    expect(body.nextCursor).toBeTruthy();

    const nextRequest = new NextRequest(
      `http://localhost/api/admin/blogs?limit=1&cursor=${body.nextCursor}`,
    );
    const nextResponse = await GET(nextRequest);
    expect(nextResponse.status).toBe(200);
    const nextBody = await nextResponse.json();
    expect(nextBody.items).toHaveLength(1);
    expect(nextBody.items[0].id).toBe("c");
    expect(nextBody.nextCursor).toBeUndefined();
  });

  it("respects search and author filters", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/admin/blogs?q=gamma&author=alice",
    );
    const response = await GET(request);
    const body = await response.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe("c");
  });

  it("allows requesting all statuses explicitly", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/admin/blogs?status=all&limit=10",
    );
    const response = await GET(request);
    const body = await response.json();
    const ids = body.items.map((item: { id: string }) => item.id);
    expect(ids).toContain("a");
    expect(ids).toContain("b");
    expect(ids).toContain("c");
  });

  it("returns 400 for an invalid cursor", async () => {
    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost/api/admin/blogs?cursor=invalid",
    );
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("does not use demo posts unless USE_DEMO_CONTENT is true", async () => {
    const { GET } = await import("./route");
    const { blogStore } = require("@/lib/content-store");
    const { getE2EBlogPosts } = require("@/lib/e2e-fixtures");
    const { hasE2EBypass } = require("@/lib/e2e-utils");

    hasE2EBypass.mockReturnValue(true);
    const response = await GET(
      new NextRequest("http://localhost/api/admin/blogs"),
    );
    expect(response.status).toBe(200);
    expect(blogStore.getAll).toHaveBeenCalled();
    expect(getE2EBlogPosts).not.toHaveBeenCalled();
  });

  it("serves demo posts when bypass is allowed and flag enabled", async () => {
    const { GET } = await import("./route");
    const { blogStore } = require("@/lib/content-store");
    const { getE2EBlogPosts } = require("@/lib/e2e-fixtures");
    const { hasE2EBypass } = require("@/lib/e2e-utils");

    setEnv('USE_DEMO_CONTENT', 'true');
    hasE2EBypass.mockReturnValue(true);
    blogStore.getAll.mockResolvedValue([]);
    getE2EBlogPosts.mockReturnValue([mockPosts[0]]);

    const response = await GET(
      new NextRequest("http://localhost/api/admin/blogs"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe("a");
  });
});