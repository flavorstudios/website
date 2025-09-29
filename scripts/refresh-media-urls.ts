import "dotenv/config";

import { getAdminDb } from "@/lib/firebase-admin";
import { refreshMediaUrl } from "@/lib/media";
import type { MediaDoc } from "@/types/media";

const REFRESH_THRESHOLD_MS = 1000 * 60 * 60; // 1 hour buffer before expiry

function coerceExpiresAt(value: MediaDoc["urlExpiresAt"]): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main() {
  const db = getAdminDb();
  const snapshot = await db.collection("media").get();

  let refreshed = 0;
  let skipped = 0;
  let failures = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as MediaDoc;
    const expiresAt = coerceExpiresAt(data.urlExpiresAt);

    // Skip documents that already have a fresh, non-expired URL.
    if (expiresAt && expiresAt > Date.now() + REFRESH_THRESHOLD_MS) {
      skipped += 1;
      continue;
    }

    try {
      await refreshMediaUrl(doc.id);
      refreshed += 1;
      console.log(`[refresh-media] refreshed ${doc.id}`);
    } catch (error) {
      failures += 1;
      console.error(`[refresh-media] failed to refresh ${doc.id}`, error);
    }
  }

  console.log(
    `[refresh-media] Completed. Refreshed: ${refreshed}, skipped: ${skipped}, failures: ${failures}`,
  );

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[refresh-media] Unhandled error", error);
  process.exit(1);
});