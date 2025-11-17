import type { ServiceAccount } from "firebase-admin";

import { restoreEnv, setEnv, snapshotEnv } from '@/test-utils/env';

// Mocks for firebase-admin functions to avoid requiring valid credentials
jest.mock("firebase-admin/app", () => ({
  cert: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
}));
jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(() => ({})),
}));
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
}));

describe("firebase-admin env loading", () => {
  const serviceAccount: ServiceAccount = {
    projectId: "demo",
    privateKey: "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n",
    clientEmail: "demo@demo.iam.gserviceaccount.com",
  } as unknown as ServiceAccount;

  const originalEnv = snapshotEnv([
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'FIREBASE_SERVICE_ACCOUNT_JSON',
    'ADMIN_BYPASS',
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear env vars before each run
    restoreEnv(originalEnv);
    setEnv('FIREBASE_SERVICE_ACCOUNT_KEY', undefined);
    setEnv('FIREBASE_SERVICE_ACCOUNT_JSON', undefined);
    setEnv('ADMIN_BYPASS', undefined);
  });

  it("initializes with FIREBASE_SERVICE_ACCOUNT_KEY", async () => {
    setEnv('FIREBASE_SERVICE_ACCOUNT_KEY', JSON.stringify(serviceAccount));
    jest.resetModules();
    const { isAdminSdkAvailable } = await import("../firebase-admin");
    expect(isAdminSdkAvailable()).toBe(true);
  });

  it("initializes with FIREBASE_SERVICE_ACCOUNT_JSON", async () => {
    setEnv('FIREBASE_SERVICE_ACCOUNT_JSON', JSON.stringify(serviceAccount));
    jest.resetModules();
    const { isAdminSdkAvailable } = await import("../firebase-admin");
    expect(isAdminSdkAvailable()).toBe(true);
  });

  it("returns admin auth and db instances when credentials are set", async () => {
    setEnv('FIREBASE_SERVICE_ACCOUNT_KEY', JSON.stringify(serviceAccount));
    jest.resetModules();
    const { getAdminAuth, getAdminDb } = await import("../firebase-admin");
    const auth = getAdminAuth();
    const db = getAdminDb();
    expect(typeof auth).toBe("object");
    expect(typeof db).toBe("object");
  });

  it("throws descriptive errors when credentials are missing", async () => {
    jest.resetModules();
    const { getAdminAuth, getAdminDb } = await import("../firebase-admin");
    expect(() => getAdminAuth()).toThrow(
      /Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY\/FIREBASE_SERVICE_ACCOUNT_JSON missing\/invalid or ADMIN_BYPASS enabled\./
    );
    expect(() => getAdminDb()).toThrow(
      /Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY\/FIREBASE_SERVICE_ACCOUNT_JSON missing\/invalid or ADMIN_BYPASS enabled\./
    );
  });

  it("throws descriptive errors when ADMIN_BYPASS is enabled", async () => {
    setEnv('FIREBASE_SERVICE_ACCOUNT_KEY', JSON.stringify(serviceAccount));
    jest.resetModules();
    jest.doMock("@/env/server", () => ({
      serverEnv: {
        FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        FIREBASE_SERVICE_ACCOUNT_JSON: undefined,
        ADMIN_BYPASS: "true",
        DEBUG_ADMIN: "false",
        NODE_ENV: "test",
        ADMIN_EMAIL: undefined,
        ADMIN_EMAILS: undefined,
        FIREBASE_STORAGE_BUCKET: undefined,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
      },
    }));
    const { getAdminAuth, getAdminDb } = await import("../firebase-admin");
    expect(() => getAdminAuth()).toThrow(
      /Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY\/FIREBASE_SERVICE_ACCOUNT_JSON missing\/invalid or ADMIN_BYPASS enabled\./
    );
    expect(() => getAdminDb()).toThrow(
      /Admin features unavailable: FIREBASE_SERVICE_ACCOUNT_KEY\/FIREBASE_SERVICE_ACCOUNT_JSON missing\/invalid or ADMIN_BYPASS enabled\./
    );
  });
  afterAll(() => {
    restoreEnv(originalEnv);
  });
});