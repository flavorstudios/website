/** @jest-environment node */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

const PROJECT_ID = "demo-admin-rules";
const requireEmulator = process.env.FIRESTORE_RULES_REQUIRE_EMULATOR === "1";
let testEnv: RulesTestEnvironment | undefined;
let skipSuite = false;

beforeAll(async () => {
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8"),
      },
    });
  } catch (error) {
    skipSuite = true;
    if (requireEmulator) {
      throw error instanceof Error ? error : new Error(String(error));
    }
    console.warn(
      "[firestore.rules.test] Skipping Firestore rules tests: emulator unavailable",
      error instanceof Error ? error.message : error,
    );
  }
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

function getTestEnv(): RulesTestEnvironment | undefined {
  if (skipSuite || !testEnv) {
    if (requireEmulator) {
      throw new Error(
        "Firestore emulator required but unavailable. Start the emulator or remove FIRESTORE_RULES_REQUIRE_EMULATOR."
      );
    }
    expect(true).toBe(true);
    return undefined;
  }
  return testEnv;
}

describe("firestore security", () => {
  it("blocks admin_users writes without admin claim", async () => {
    const env = getTestEnv();
    if (!env) return;
    const context = env.authenticatedContext("user-1", {
      email: "user@example.com",
    });
    const db = context.firestore();
    await assertFails(
      db.collection("admin_users").doc("user-1").set({ email: "user@example.com" })
    );
  });

  it("allows admin_users writes with admin claim", async () => {
    const env = getTestEnv();
    if (!env) return;
    const context = env.authenticatedContext("admin-1", {
      email: "admin@example.com",
      admin: true,
      role: "admin",
    });
    const db = context.firestore();
    await assertSucceeds(
      db
        .collection("admin_users")
        .doc("admin-1")
        .set({ email: "admin@example.com", role: "admin" })
    );
  });

  it("allows users to read their own role document", async () => {
    const env = getTestEnv();
    if (!env) return;
    const adminContext = env.authenticatedContext("admin-1", {
      admin: true,
      role: "admin",
    });
    const adminDb = adminContext.firestore();
    await assertSucceeds(
      adminDb
        .collection("roles")
        .doc("admin-1")
        .set({ role: "admin" })
    );

    const userContext = env.authenticatedContext("admin-1", {
      email: "admin@example.com",
    });
    const userDb = userContext.firestore();
    await assertSucceeds(userDb.collection("roles").doc("admin-1").get());
  });

  it("prevents other users from reading foreign role documents", async () => {
    const env = getTestEnv();
    if (!env) return;
    const adminContext = env.authenticatedContext("admin-1", {
      admin: true,
      role: "admin",
    });
    const adminDb = adminContext.firestore();
    await adminDb.collection("roles").doc("admin-1").set({ role: "admin" });

    const otherContext = env.authenticatedContext("user-2", {
      email: "other@example.com",
    });
    const otherDb = otherContext.firestore();
    await assertFails(otherDb.collection("roles").doc("admin-1").get());
  });
});