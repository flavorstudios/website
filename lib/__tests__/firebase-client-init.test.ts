/**
 * @jest-environment jsdom
 */
import type { FirebaseApp } from "firebase/app";

type FirebaseModule = typeof import("firebase/app");

const mockInitializeApp = jest.fn(() => ({ name: "initialized-app" } as unknown as FirebaseApp));
const mockGetApps = jest.fn<ReturnType<FirebaseModule["getApps"]>, Parameters<FirebaseModule["getApps"]>>(() => []);
const mockGetApp = jest.fn(() => ({ name: "existing-app" } as unknown as FirebaseApp));

const mockAssertClientEnv = jest.fn();

jest.mock("firebase/app", () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
}));

jest.mock("@/lib/firebase-client-env", () => ({
  assertClientEnv: mockAssertClientEnv,
  }));

describe("lib/firebase client bootstrap", () => {
  const originalEnv = process.env;

  const baseEnv: Partial<NodeJS.ProcessEnv> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: "test-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456:web:abc",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-TEST",
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({ name: "initialized-app" } as unknown as FirebaseApp);
    process.env = { ...originalEnv, ...baseEnv } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("initialises exactly once when no apps exist", async () => {
    const mod = await import("../firebase");

    const first = mod.getFirebaseApp();
    const second = mod.getFirebaseApp();

    expect(mockGetApps).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockAssertClientEnv).toHaveBeenCalled();
    expect(first).toBe(second);
    expect(mod.firebaseInitError).toBeNull();
  });

  it("reuses an existing Firebase app when already initialised elsewhere", async () => {
    mockGetApps.mockReturnValueOnce([{} as FirebaseApp]);
    const mod = await import("../firebase");

    const app = mod.getFirebaseApp();

    expect(mockGetApps).toHaveBeenCalled();
    expect(mockGetApp).toHaveBeenCalled();
    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(app).toEqual({ name: "existing-app" });
  });

  it("throws a descriptive error when required env vars are missing", async () => {
    expect(mockAssertClientEnv).toHaveBeenCalled();
    const mod = await import("../firebase");

    expect(() => mod.getFirebaseApp()).toThrow(
      /\[Firebase\] Missing env: NEXT_PUBLIC_FIREBASE_API_KEY/,
    );
    expect(mod.firebaseInitError).toBeInstanceOf(Error);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it("prevents re-initialisation after an env error until values are fixed", async () => {
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const mod = await import("../firebase");

    expect(() => mod.getFirebaseApp()).toThrow();

    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    mockGetApps.mockReturnValue([]);

    expect(() => mod.getFirebaseApp()).toThrow(/Missing env/);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });
});