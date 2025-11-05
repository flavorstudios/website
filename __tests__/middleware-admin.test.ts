/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

type MiddlewareFn = typeof import("@/middleware")["middleware"];

const serverEnvMock: Record<string, string | undefined> = {
  ADMIN_AUTH_DISABLED: "0",
  ADMIN_BYPASS: "false",
  DEBUG_ADMIN: "false",
  NODE_ENV: "test",
};

const mockIncrementAttempts = jest.fn(async () => {});
const mockIsRateLimited = jest.fn(async () => false);
const mockResetAttempts = jest.fn(async () => {});

jest.mock("@/env/server", () => ({
  serverEnv: serverEnvMock,
}));

jest.mock("@/lib/rate-limit", () => ({
  incrementAttempts: mockIncrementAttempts,
  isRateLimited: mockIsRateLimited,
  resetAttempts: mockResetAttempts,
}));

async function loadMiddleware(): Promise<MiddlewareFn> {
  let loaded: MiddlewareFn | undefined;
  await jest.isolateModulesAsync(async () => {
    const mod = await import("@/middleware");
    loaded = mod.middleware;
  });
  if (!loaded) throw new Error("Failed to load middleware");
  return loaded;
}

describe("middleware admin route protection", () => {
  beforeEach(() => {
    jest.resetModules();
    mockIncrementAttempts.mockClear();
    mockIsRateLimited.mockClear();
    mockResetAttempts.mockClear();
    mockIsRateLimited.mockResolvedValue(false);
    serverEnvMock.ADMIN_AUTH_DISABLED = "0";
    serverEnvMock.ADMIN_BYPASS = "false";
    process.env.E2E = "false";
  });

  afterAll(() => {
    delete process.env.E2E;
  });

  it("redirects anonymous admin requests to the login page", async () => {
    const middleware = await loadMiddleware();
    const request = new NextRequest("http://example.com/admin/dashboard");

    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://example.com/admin/login");
    expect(response.headers.get("x-route-type")).toBe("admin");
    expect(mockIncrementAttempts).toHaveBeenCalled();
  });

  it("allows admin routes when a session cookie is present", async () => {
    const middleware = await loadMiddleware();
    const request = new NextRequest("http://example.com/admin/dashboard", {
      headers: {
        cookie: "admin-session=token", // mimic authenticated cookie
      },
    });

    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(mockResetAttempts).toHaveBeenCalled();
  });

  it("redirects authenticated users away from the login page", async () => {
    const middleware = await loadMiddleware();
    const request = new NextRequest("http://example.com/admin/login", {
      headers: {
        cookie: "admin-session=token",
      },
    });

    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://example.com/admin/dashboard");
  });

  it("blocks media API calls without a session", async () => {
    const middleware = await loadMiddleware();
    const request = new NextRequest("http://example.com/api/media/upload");

    const response = await middleware(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
    expect(mockIncrementAttempts).toHaveBeenCalled();
  });
});