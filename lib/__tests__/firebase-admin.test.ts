import type { ServiceAccount } from "firebase-admin";

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

  beforeEach(() => {
    jest.resetModules();
    // Clear env vars before each run
    delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  });

  it("initializes with FIREBASE_SERVICE_ACCOUNT_KEY", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify(serviceAccount);
    const { isAdminSdkAvailable } = await import("../firebase-admin");
    expect(isAdminSdkAvailable()).toBe(true);
  });

  it("initializes with FIREBASE_SERVICE_ACCOUNT_JSON", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify(serviceAccount);
    const { isAdminSdkAvailable } = await import("../firebase-admin");
    expect(isAdminSdkAvailable()).toBe(true);
  });
});