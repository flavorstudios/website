const mockRequireAdmin = jest.fn<Promise<boolean>, unknown[]>(async () => true);
const mockHeaders = jest.fn(() => new Headers({ cookie: "admin-session=test", host: "localhost:3000" }));
const mockIsAdminSdkAvailable = jest.fn(() => false);

jest.mock("@/lib/admin-auth", () => ({
  requireAdmin: mockRequireAdmin,
}));

jest.mock("@/app/admin/dashboard/AdminDashboardPageClient", () => () => null);

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}));

jest.mock("next/server", () => ({
  NextRequest: class {
    headers: Headers;
    cookies = {
      get: () => undefined,
    };
    url: string;
    constructor(input: URL, init?: { headers?: Headers }) {
      this.headers = init?.headers ?? new Headers();
      this.url = input.toString();
    }
  },
}));

jest.mock("@/lib/firebase-admin", () => ({
  __esModule: true,
  isAdminSdkAvailable: () => mockIsAdminSdkAvailable(),
  ADMIN_BYPASS: false,
}));

jest.mock("@/lib/env/is-ci-like", () => ({
  isCiLike: () => false,
}));

describe("Admin dashboard prefetch fallback", () => {
  const originalFetch = global.fetch;
  const originalEnv = {
    E2E: process.env.E2E,
    TEST_MODE: process.env.TEST_MODE,
    ADMIN_DISABLE_SSR_PREFETCH: process.env.ADMIN_DISABLE_SSR_PREFETCH,
  };

  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockRequireAdmin.mockResolvedValue(true);
    mockHeaders.mockReset();
    mockHeaders.mockImplementation(
      () => new Headers({ cookie: "admin-session=test", host: "localhost:3000" })
    );
    mockIsAdminSdkAvailable.mockReset();
    mockIsAdminSdkAvailable.mockReturnValue(false);
    (global.fetch as unknown) = jest.fn();
    process.env.E2E = "false";
    process.env.TEST_MODE = "false";
    process.env.ADMIN_DISABLE_SSR_PREFETCH = "false";
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalEnv.E2E === undefined) delete process.env.E2E;
    else process.env.E2E = originalEnv.E2E;
    if (originalEnv.TEST_MODE === undefined) delete process.env.TEST_MODE;
    else process.env.TEST_MODE = originalEnv.TEST_MODE;
    if (originalEnv.ADMIN_DISABLE_SSR_PREFETCH === undefined)
      delete process.env.ADMIN_DISABLE_SSR_PREFETCH;
    else
      process.env.ADMIN_DISABLE_SSR_PREFETCH = originalEnv.ADMIN_DISABLE_SSR_PREFETCH;
  });

  it("defers dashboard query to the client when Admin SDK is unavailable", async () => {
    const { default: AdminDashboardPage } = await import("@/app/admin/dashboard/(dashboard)/page");

    const element = await AdminDashboardPage();
    const state = (element as { props: { state: any } }).props.state;

    expect(mockIsAdminSdkAvailable).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(Array.isArray(state?.queries)).toBe(true);
    expect(state.queries).toHaveLength(0);
  });
});