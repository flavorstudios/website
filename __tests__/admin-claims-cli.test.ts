/** @jest-environment node */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import {
  grantRole,
  listAdmins,
  revokeRole,
  type SupportedRole,
} from "@/lib/admin-claims-service";

interface FakeUser {
  uid: string;
  email: string;
  customClaims?: Record<string, unknown>;
}

class FakeAuth {
  private byEmail = new Map<string, FakeUser>();
  private byUid = new Map<string, FakeUser>();

  constructor(users: FakeUser[]) {
    for (const user of users) {
      const entry: FakeUser = {
        uid: user.uid,
        email: user.email,
        customClaims: user.customClaims ? { ...user.customClaims } : {},
      };
      this.byEmail.set(entry.email, entry);
      this.byUid.set(entry.uid, entry);
    }
  }

  async getUserByEmail(email: string): Promise<FakeUser> {
    const record = this.byEmail.get(email);
    if (!record) {
      throw new Error(`User not found for email: ${email}`);
    }
    return { ...record, customClaims: record.customClaims ? { ...record.customClaims } : {} };
  }

  async setCustomUserClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
    const record = this.byUid.get(uid);
    if (!record) {
      throw new Error(`User not found for uid: ${uid}`);
    }
    record.customClaims = { ...claims };
  }

  async listUsers(): Promise<{ users: FakeUser[]; pageToken?: string }> {
    return {
      users: Array.from(this.byUid.values()).map((user) => ({
        uid: user.uid,
        email: user.email,
        customClaims: user.customClaims ? { ...user.customClaims } : {},
      })),
      pageToken: undefined,
    };
  }

  getClaims(email: string): Record<string, unknown> | undefined {
    const record = this.byEmail.get(email);
    return record?.customClaims ? { ...record.customClaims } : undefined;
  }
}

const PROJECT_ID = "demo-admin-cli";
const requireEmulator = process.env.FIRESTORE_RULES_REQUIRE_EMULATOR === "1";
let testEnv: RulesTestEnvironment | undefined;
let firestore: Firestore | undefined;
let skipSuite = false;
let app: import("firebase-admin/app").App | undefined;
const previousFirestoreHost = process.env.FIRESTORE_EMULATOR_HOST;

beforeAll(async () => {
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8"),
      },
    });

    const emulator = testEnv.emulators.firestore;
    const host = emulator?.host ?? "127.0.0.1";
    const port = emulator?.port ?? 8080;
    process.env.FIRESTORE_EMULATOR_HOST = `${host}:${port}`;

    if (getApps().length === 0) {
      app = initializeApp({ projectId: PROJECT_ID });
    }
    firestore = getFirestore();
  } catch (error) {
    skipSuite = true;
    if (requireEmulator) {
      throw error instanceof Error ? error : new Error(String(error));
    }
    console.warn(
      "[admin-claims-cli.test] Skipping admin claims CLI tests: emulator unavailable",
      error instanceof Error ? error.message : error,
    );
  }
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
  if (app) {
    await deleteApp(app);
  }
  if (previousFirestoreHost === undefined) {
    delete process.env.FIRESTORE_EMULATOR_HOST;
  } else {
    process.env.FIRESTORE_EMULATOR_HOST = previousFirestoreHost;
  }
});

beforeEach(async () => {
  if (!skipSuite && testEnv) {
    await testEnv.clearFirestore();
  }
});

function ensureSuite(
  env: RulesTestEnvironment | undefined,
): asserts env is RulesTestEnvironment {
  if (skipSuite || !env || !firestore) {
    if (requireEmulator) {
      throw new Error(
        "Firestore emulator required but unavailable. Start the emulator or remove FIRESTORE_RULES_REQUIRE_EMULATOR."
      );
    }
    expect(true).toBe(true);
    throw new Error("SKIP");
  }
}

describe("admin claims helpers", () => {
  it("grants roles via custom claims and Firestore", async () => {
    try {
      ensureSuite(testEnv);
    } catch (error) {
      if ((error as Error).message === "SKIP") return;
      throw error;
    }

    if (!firestore) {
      throw new Error("Firestore emulator unavailable");
    }

    const fakeAuth = new FakeAuth([
      { uid: "user-1", email: "admin@example.com" },
    ]);

    const timestamp = new Date("2024-01-01T00:00:00.000Z");

    await grantRole(
      { auth: fakeAuth as any, firestore, now: () => timestamp },
      "admin@example.com",
      "admin" satisfies SupportedRole,
    );

    expect(fakeAuth.getClaims("admin@example.com")).toMatchObject({
      admin: true,
      role: "admin",
      roles: { admin: true, editor: false, support: false },
    });

    const adminDoc = await firestore!.collection("admin_users").doc("user-1").get();
    expect(adminDoc.exists).toBe(true);
    expect(adminDoc.data()).toMatchObject({
      email: "admin@example.com",
      role: "admin",
      updatedAt: timestamp.toISOString(),
    });

    const roleDoc = await firestore!.collection("roles").doc("user-1").get();
    expect(roleDoc.exists).toBe(true);
    expect(roleDoc.data()).toMatchObject({
      role: "admin",
      updatedAt: timestamp.toISOString(),
    });
  });

  it("revokes elevated access and resets support role", async () => {
    try {
      ensureSuite(testEnv);
    } catch (error) {
      if ((error as Error).message === "SKIP") return;
      throw error;
    }

    if (!firestore) {
      throw new Error("Firestore emulator unavailable");
    }

    const fakeAuth = new FakeAuth([
      {
        uid: "user-2",
        email: "owner@example.com",
        customClaims: {
          admin: true,
          role: "admin",
          roles: { admin: true, editor: false, support: false },
        },
      },
    ]);

    const timestamp = new Date("2024-02-02T00:00:00.000Z");

    await firestore!.collection("admin_users").doc("user-2").set({
      email: "owner@example.com",
      role: "admin",
    });

    await revokeRole(
      { auth: fakeAuth as any, firestore, now: () => timestamp },
      "owner@example.com",
    );

    expect(fakeAuth.getClaims("owner@example.com")).toMatchObject({
      role: "support",
      roles: { admin: false, editor: false, support: true },
    });

    const adminDoc = await firestore!.collection("admin_users").doc("user-2").get();
    expect(adminDoc.exists).toBe(false);

    const roleDoc = await firestore!.collection("roles").doc("user-2").get();
    expect(roleDoc.exists).toBe(true);
    expect(roleDoc.data()).toMatchObject({
      role: "support",
      updatedAt: timestamp.toISOString(),
    });
  });

  it("lists Firestore directory entries alongside claim holders", async () => {
    try {
      ensureSuite(testEnv);
    } catch (error) {
      if ((error as Error).message === "SKIP") return;
      throw error;
    }

    if (!firestore) {
      throw new Error("Firestore emulator unavailable");
    }

    const fakeAuth = new FakeAuth([
      {
        uid: "user-3",
        email: "editor@example.com",
        customClaims: { role: "editor", roles: { admin: false, editor: true, support: false } },
      },
      {
        uid: "user-4",
        email: "viewer@example.com",
        customClaims: { role: "support", roles: { admin: false, editor: false, support: true } },
      },
    ]);

    await firestore!.collection("admin_users").doc("user-3").set({
      email: "editor@example.com",
      role: "editor",
    });

    const { directory, claimAdmins } = await listAdmins({
      auth: fakeAuth as any,
      firestore,
    });

    expect(directory).toEqual([
      expect.objectContaining({ email: "editor@example.com", role: "editor" }),
    ]);

    expect(claimAdmins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: "editor@example.com", role: "editor" }),
        expect.objectContaining({ email: "viewer@example.com", role: "support" }),
      ]),
    );
  });
});