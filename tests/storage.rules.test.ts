/** @jest-environment node */

// was 60 000
jest.setTimeout(180000);

import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { ref, uploadString, getBytes } from "firebase/storage";
import {
  parseHostPort,
  getProjectId,
  ensureReachable,
} from "./utils/emulator";

describe("storage security rules", () => {
  let testEnv: any;

  beforeAll(async () => {
    const firestore = parseHostPort(
      "FIRESTORE_EMULATOR_HOST",
      "127.0.0.1",
      8080,
    );
    const storage = parseHostPort(
      "FIREBASE_STORAGE_EMULATOR_HOST",
      "127.0.0.1",
      9199,
    );

    try {
      await Promise.all([
        ensureReachable(firestore.host, firestore.port, "Firestore"),
        ensureReachable(storage.host, storage.port, "Storage"),
      ]);
    } catch (err) {
      console.error("Emulator unreachable", err);
      throw err;
    }

    const projectId = getProjectId();
    process.env.FIREBASE_PROJECT_ID = projectId;
    process.env.GCLOUD_PROJECT = projectId;

    const initTimeoutMs = 10000;
    const maxInitAttempts = 2;
    for (let attempt = 0; attempt < maxInitAttempts; attempt++) {
      try {
        const initPromise = initializeTestEnvironment({
          projectId,
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
        testEnv = await Promise.race([
          initPromise,
          new Promise((_, reject) => {
            const timer = setTimeout(() => {
              const msg = `initializeTestEnvironment timed out after ${initTimeoutMs}ms. Check Firestore emulator at ${firestore.host}:${firestore.port} and Storage emulator at ${storage.host}:${storage.port}`;
              console.error(msg);
              reject(new Error(msg));
            }, initTimeoutMs);
            initPromise.finally(() => clearTimeout(timer));
          }),
        ]);
        break;
      } catch (err) {
        if (attempt === maxInitAttempts - 1) {
          console.error("Failed to init test env", err);
          throw err;
        }
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }

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

    const storage = testEnv
      .authenticatedContext("firestoreAdmin")
      .storage();
    await assertSucceeds(uploadString(ref(storage, "test/fs.txt"), "hi"));
    await assertSucceeds(getBytes(ref(storage, "test/fs.txt")));
  });
});