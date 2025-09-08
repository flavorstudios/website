/** @jest-environment node */

import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { ref, uploadString, getBytes } from "firebase/storage";

function parseHostPort(envVar: string, defaultValue: string) {
  const value = process.env[envVar] || defaultValue;
  const [host, port] = value.split(":");
  return { host, port: Number(port) };
}

describe("storage security rules", () => {
  let testEnv: any;

  beforeAll(async () => {
    const firestore = parseHostPort(
      "FIRESTORE_EMULATOR_HOST",
      "127.0.0.1:8080",
    );
    const storage = parseHostPort(
      "FIREBASE_STORAGE_EMULATOR_HOST",
      "127.0.0.1:9199",
    );

    testEnv = await initializeTestEnvironment({
      projectId: "demo-storage-rules",
      firestore: {
        rules: readFileSync("firestore.rules", "utf8"),
        host: firestore.host,
        port: firestore.port,
      },
      storage: {
        rules: readFileSync("storage.rules", "utf8"),
        host: storage.host,
        port: storage.port,
      },
    });

    // Seed a test file for read tests
    await testEnv.withSecurityRulesDisabled(async (context: any) => {
      const storage = context.storage();
      await uploadString(ref(storage, "test/seed.txt"), "seed");
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  it("denies unauthenticated access", async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const fileRef = ref(storage, "test/seed.txt");
    await assertFails(getBytes(fileRef));
    await assertFails(uploadString(ref(storage, "test/blocked.txt"), "hi"));
  });

  it("denies non-admin users", async () => {
    const userStorage = testEnv.authenticatedContext("user").storage();
    await assertFails(getBytes(ref(userStorage, "test/seed.txt")));
    await assertFails(uploadString(ref(userStorage, "test/blocked.txt"), "hi"));
  });

  it("allows admins via custom claims", async () => {
    const adminStorage = testEnv
      .authenticatedContext("admin", { role: "admin" })
      .storage();
    await assertSucceeds(uploadString(ref(adminStorage, "test/ok.txt"), "hi"));
    await assertSucceeds(getBytes(ref(adminStorage, "test/ok.txt")));
  });

  it("allows admins flagged in Firestore", async () => {
    // Create Firestore user doc with isAdmin true
    await testEnv.withSecurityRulesDisabled(async (context: any) => {
      await context
        .firestore()
        .collection("users")
        .doc("firestoreAdmin")
        .set({ isAdmin: true });
    });

    const storage = testEnv.authenticatedContext("firestoreAdmin").storage();
    await assertSucceeds(uploadString(ref(storage, "test/fs.txt"), "hi"));
    await assertSucceeds(getBytes(ref(storage, "test/fs.txt")));
  });
});