/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

// Type helper for mocked requireAdmin
type RequireAdminFn = typeof import("@/lib/admin-auth")["requireAdmin"];

jest.mock("@/lib/admin-auth", () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
}));

// Mock Prisma count to a deterministic value
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    post: { count: jest.fn().mockResolvedValue(5) },
  },
}));

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    // Fresh module state and clean mocks for each test
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("returns stats with validated range", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://test/api/admin/stats?range=12mo");
    const res = await GET(req as any);

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.range).toBe("12mo");
    expect(json.count).toBe(5);
    expect(typeof json.from).toBe("string");
    expect(typeof json.to).toBe("string");
  });

  it("defaults invalid range to 30d", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://test/api/admin/stats?range=bad");
    const res = await GET(req as any);

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.range).toBe("30d");
    expect(typeof json.count).toBe("number");
  });

  it("denies unauthorized", async () => {
    // Flip the auth mock for this test only
    const adminAuth = await import("@/lib/admin-auth");
    const mockedRequireAdmin = adminAuth
      .requireAdmin as jest.MockedFunction<RequireAdminFn>;
    mockedRequireAdmin.mockResolvedValue(false);

    const { GET } = await import("./route");
    const req = new NextRequest("http://test/api/admin/stats");
    const res = await GET(req as any);

    expect(res.status).toBe(401);
  });
});
