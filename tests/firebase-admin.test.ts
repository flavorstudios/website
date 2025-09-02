import type { ServiceAccount } from "firebase-admin";

// Mock firebase-admin modules to avoid real initialization
const mockAuth = { mock: "auth" };
const mockDb = { mock: "db" };

jest.mock("firebase-admin/app", () => ({
  cert: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(() => mockAuth),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => mockDb),
}));

describe("firebase-admin getters", () => {
  const serviceAccount: ServiceAccount = {
    projectId: "demo",
    privateKey: "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n",
    clientEmail: "demo@demo.iam.gserviceaccount.com",
  } as unknown as ServiceAccount;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("returns auth and db instances when initialized", () => {
    jest.doMock("@/env/server", () => ({
      serverEnv: {
        FIREBASE_SERVICE_ACCOUNT_KEY: JSON.stringify(serviceAccount),
        FIREBASE_SERVICE_ACCOUNT_JSON: undefined,
        ADMIN_BYPASS: undefined,
        ADMIN_EMAIL: undefined,
        ADMIN_EMAILS: undefined,
        FIREBASE_STORAGE_BUCKET: undefined,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
        DEBUG_ADMIN: "false",
        NODE_ENV: "test",
      },
    }));
    const { getAdminAuth, getAdminDb } = require("@/lib/firebase-admin");
    expect(getAdminAuth()).toBe(mockAuth);
    expect(getAdminDb()).toBe(mockDb);
  });

  it("throws when credentials are missing", () => {
    jest.doMock("@/env/server", () => ({
      serverEnv: {
        FIREBASE_SERVICE_ACCOUNT_KEY: undefined,
        FIREBASE_SERVICE_ACCOUNT_JSON: undefined,
        ADMIN_BYPASS: undefined,
        ADMIN_EMAIL: undefined,
        ADMIN_EMAILS: undefined,
        FIREBASE_STORAGE_BUCKET: undefined,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
        DEBUG_ADMIN: "false",
        NODE_ENV: "test",
      },
    }));
    const { getAdminAuth, getAdminDb } = require("@/lib/firebase-admin");
    expect(() => getAdminAuth()).toThrow("Admin features unavailable");
    expect(() => getAdminDb()).toThrow("Admin features unavailable");
  });

  it("throws when ADMIN_BYPASS is true", () => {
    jest.doMock("@/env/server", () => ({
      serverEnv: {
        FIREBASE_SERVICE_ACCOUNT_KEY: JSON.stringify(serviceAccount),
        FIREBASE_SERVICE_ACCOUNT_JSON: undefined,
        ADMIN_BYPASS: "true",
        ADMIN_EMAIL: undefined,
        ADMIN_EMAILS: undefined,
        FIREBASE_STORAGE_BUCKET: undefined,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
        DEBUG_ADMIN: "false",
        NODE_ENV: "test",
      },
    }));
    const { getAdminAuth, getAdminDb } = require("@/lib/firebase-admin");
    expect(() => getAdminAuth()).toThrow("ADMIN_BYPASS");
    expect(() => getAdminDb()).toThrow("ADMIN_BYPASS");
  });
});