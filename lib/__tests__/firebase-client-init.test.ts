/**
 * @jest-environment jsdom
 */
import type { FirebaseApp } from "firebase/app";

type FirebaseModule = typeof import("firebase/app");

type FirebaseEnvModule = typeof import("@/lib/firebase-client-env");

const mockInitializeApp = jest.fn(() => ({ name: "initialized-app" } as unknown as FirebaseApp));
const mockGetApps = jest.fn<ReturnType<FirebaseModule["getApps"]>, Parameters<FirebaseModule["getApps"]>>(() => []);
const mockGetApp = jest.fn(() => ({ name: "existing-app" } as unknown as FirebaseApp));

const mockAssertClientEnv = jest.fn();
const mockGetMissingFirebaseEnv = jest.fn<string[], []>(() => []);

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
  PUBLIC_FIREBASE_CONFIG: {
    apiKey: "test-key",
    authDomain: "test.firebaseapp.com",
    projectId: "demo",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456",
    appId: "1:123456:web:abc",
    measurementId: "G-TEST",
  },
  assertClientEnv: mockAssertClientEnv,
  getMissingFirebaseEnv: mockGetMissingFirebaseEnv,
  formatMissingFirebaseEnvMessage: (missing: string[]) =>
    `[Firebase] Missing env: ${missing.join(", ")} → Populate these NEXT_PUBLIC_* values in .env.local for local development or in the Vercel project settings (Environment Variables) before deploying.`,
} satisfies Partial<FirebaseEnvModule>));

describe("lib/firebase client bootstrap", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockGetMissingFirebaseEnv.mockReturnValue([]);
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({ name: "initialized-app" } as unknown as FirebaseApp);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("initialises exactly once when no apps exist", async () => {
    const mod = await import("../firebase");

    const first = mod.getFirebaseApp();
    const second = mod.getFirebaseApp();

    expect(mockGetApps).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
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
    mockGetMissingFirebaseEnv.mockReturnValue(["NEXT_PUBLIC_FIREBASE_API_KEY"]);
    const mod = await import("../firebase");

    expect(() => mod.getFirebaseApp()).toThrow(
      /\[Firebase\] Missing env: NEXT_PUBLIC_FIREBASE_API_KEY → Populate these NEXT_PUBLIC_/,
    );
    expect(mod.firebaseInitError).toBeInstanceOf(Error);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it("prevents re-initialisation after an env error until values are fixed", async () => {
    mockGetMissingFirebaseEnv.mockReturnValue(["NEXT_PUBLIC_FIREBASE_API_KEY"]);
    const mod = await import("../firebase");

    expect(() => mod.getFirebaseApp()).toThrow();

    mockGetMissingFirebaseEnv.mockReturnValue([]);
    mockGetApps.mockReturnValue([]);

    expect(() => mod.getFirebaseApp()).toThrow(/Missing env/);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });
});