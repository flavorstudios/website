import { restoreEnv, setEnv, snapshotEnv } from '@/test-utils/env';

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
  const originalEnv = snapshotEnv([
    'E2E',
    'NEXT_PUBLIC_TEST_MODE',
    'ADMIN_DISABLE_SSR_PREFETCH',
  ]);

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
    setEnv('E2E', 'false');
    setEnv('NEXT_PUBLIC_TEST_MODE', '0');
    setEnv('ADMIN_DISABLE_SSR_PREFETCH', 'false');
  });

  afterAll(() => {
    global.fetch = originalFetch;
    restoreEnv(originalEnv);
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