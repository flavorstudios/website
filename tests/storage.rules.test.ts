/** @jest-environment node */

// was 60 000
jest.setTimeout(180000);

import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { ref, uploadString, uploadBytes, getBytes } from "firebase/storage";
import {
  parseHostPort,
  getProjectId,
  ensureReachable,
} from "./utils/emulator";

describe("storage security rules", () => {
  let testEnv: any;

  // Ensure the emulator bucket exists (Storage emulator JSON API)
  async function ensureEmulatorBucket(hostWithPort: string, bucket: string, projectId: string) {
    const getRes = await fetch(`http://${hostWithPort}/storage/v1/b/${encodeURIComponent(bucket)}`);
    if (getRes.ok) return;

    const createRes = await fetch(`http://${hostWithPort}/storage/v1/b?project=${encodeURIComponent(projectId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: bucket }),
    });

    if (!createRes.ok && createRes.status !== 409) {
      const text = await createRes.text().catch(() => "");
      throw new Error(`Failed to create emulator bucket "${bucket}" (status ${createRes.status}): ${text}`);
    }
  }

  // Seed an object using the emulator's JSON API (avoids client SDK retries)
  async function seedViaJsonApi(
    hostWithPort: string,
    bucket: string,
    objectName: string,
    data: Uint8Array,
    contentType: string,
  ) {
    const url =
      `http://${hostWithPort}/upload/storage/v1/b/${encodeURIComponent(bucket)}/o` +
      `?uploadType=media&name=${encodeURIComponent(objectName)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: Buffer.from(data),
    });
    return res.ok;
  }

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
    const bucket = `${projectId}.appspot.com`;

    process.env.FIREBASE_PROJECT_ID = projectId;
    process.env.GCLOUD_PROJECT = projectId;

    // Ensure SDKs also see explicit emulator hosts in CI where resolution may lag
    process.env.FIRESTORE_EMULATOR_HOST = `${firestore.host}:${firestore.port}`;
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${storage.host}:${storage.port}`;

    // Give CI more breathing room to download emulators & start up
    const initTimeoutMs = 90000;
    const maxInitAttempts = 3;

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
            storageBucket: bucket,
          },
        });

        testEnv = await Promise.race([
          initPromise,
          new Promise((_, reject) => {
            const timer = setTimeout(() => {
              const msg =
                `initializeTestEnvironment timed out after ${initTimeoutMs}ms. Ensure the Firestore emulator at ${firestore.host}:${firestore.port} and the Storage emulator at ${storage.host}:${storage.port} are running and reachable.`;
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
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }

    // Slightly longer settle delay: ports may be open but rules/runtime not fully ready yet
    await new Promise((r) => setTimeout(r, 2000));

    // Ensure the bucket is created in the emulator before first write
    const storageHostWithPort = `${storage.host}:${storage.port}`;
    await ensureEmulatorBucket(storageHostWithPort, bucket, projectId);

    // Seed a test file for read tests
    const seedTimeoutMs = 150000; // was 120000; CI can still be slow on first write
    const maxBackoffMs = 5000;
    const start = Date.now();
    let attempt = 0;

    while (true) {
      try {
        // First try JSON API (bypasses SDK retry behavior)
        const keepData = new Uint8Array([0x6b]); // "k"
        const seedData = new Uint8Array([0x73, 0x65, 0x65, 0x64]); // "seed"

        const keepOk = await seedViaJsonApi(
          storageHostWithPort,
          bucket,
          "test/.keep",
          keepData,
          "application/octet-stream",
        );

        const seedOk = keepOk
          ? await seedViaJsonApi(
              storageHostWithPort,
              bucket,
              "test/seed.txt",
              seedData,
              "text/plain",
            )
          : false;

        if (keepOk && seedOk) break;

        // Fallback: use SDK with rules disabled
        await testEnv.withSecurityRulesDisabled(async (context: any) => {
          const s = context.storage(bucket);
          s.setMaxUploadRetryTime(seedTimeoutMs);
          s.setMaxOperationRetryTime(seedTimeoutMs);

          await uploadBytes(ref(s, "test/.keep"), keepData, {
            contentType: "application/octet-stream",
          });

          const uploadPromise = uploadBytes(ref(s, "test/seed.txt"), seedData, {
            contentType: "text/plain",
          });

          await Promise.race([
            uploadPromise,
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error(`uploadBytes timed out after ${seedTimeoutMs}ms`)),
                seedTimeoutMs,
              ),
            ),
          ]);
        });

        break;
      } catch (err) {
        if (Date.now() - start >= seedTimeoutMs) {
          console.error("Failed to seed test file", err);
          throw new Error(
            `Seeding test file timed out after ${seedTimeoutMs}ms. Is the Storage emulator running?`,
          );
        }
        const backoff = Math.min(500 * 2 ** attempt, maxBackoffMs);
        attempt++;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  });

  afterAll(async () => {
    try {
      await testEnv?.cleanup?.();
    } finally {
      await new Promise((r) => setTimeout(r, 100));
    }
  });

  it("denies unauthenticated access", async () => {
    const bucket = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const s = testEnv.unauthenticatedContext().storage(bucket);
    const fileRef = ref(s, "test/seed.txt");
    await assertFails(getBytes(fileRef));
    await assertFails(
      uploadString(ref(s, "test/blocked.txt"), "hi", { contentType: "text/plain" }),
    );
  });

  it("denies non-admin users", async () => {
    const bucket = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const s = testEnv.authenticatedContext("user").storage(bucket);
    await assertFails(getBytes(ref(s, "test/seed.txt")));
    await assertFails(
      uploadString(ref(s, "test/blocked.txt"), "hi", { contentType: "text/plain" }),
    );
  });

  it("allows admins via custom claims", async () => {
    const bucket = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const s = testEnv.authenticatedContext("admin", { role: "admin" }).storage(bucket);
    await assertSucceeds(
      uploadString(ref(s, "test/ok.txt"), "hi", { contentType: "text/plain" }),
    );
    await assertSucceeds(getBytes(ref(s, "test/ok.txt")));
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

    const bucket = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const s = testEnv.authenticatedContext("firestoreAdmin").storage(bucket);
    await assertSucceeds(
      uploadString(ref(s, "test/fs.txt"), "hi", { contentType: "text/plain" }),
    );
    await assertSucceeds(getBytes(ref(s, "test/fs.txt")));
  });
});
