import "dotenv/config";

import { getAdminDb } from "@/lib/firebase-admin";
import type { MediaDoc, MediaVariant } from "@/types/media";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

interface AuditIssue {
  code:
    | "missing_url"
    | "http_error"
    | "expired_url"
    | "missing_storage_path"
    | "missing_object"
    | "bucket_mismatch"
    | "variant_missing_object"
    | "variant_http_error";
  details?: string;
}

interface AuditEntry {
  id: string;
  filename?: string;
  issues: AuditIssue[];
}

function requireBucketName(): string {
  const bucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error(
      "FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET must be set before running the media audit.",
    );
  }
  return bucket;
}

function decodeStoragePath(
  input: string | undefined | null,
  fallbackPath: string | undefined,
  expectedBucket: string,
): { bucket: string; path: string } | null {
  if (!input) {
    return fallbackPath
      ? { bucket: expectedBucket, path: fallbackPath }
      : null;
  }

  try {
    const url = new URL(input);
    const host = url.hostname;
    if (host === "firebasestorage.googleapis.com") {
      // URL shape: /v0/b/<bucket>/o/<encoded path>
      const parts = url.pathname.split("/").filter(Boolean);
      const bucketIndex = parts.indexOf("b");
      const objectIndex = parts.indexOf("o");
      if (bucketIndex >= 0 && objectIndex >= 0 && objectIndex === bucketIndex + 2) {
        const bucket = parts[bucketIndex + 1];
        const encoded = parts.slice(objectIndex + 1).join("/");
        if (encoded) {
          return { bucket, path: decodeURIComponent(encoded) };
        }
      }
    } else if (host === "storage.googleapis.com") {
      // URL shape: /<bucket>/<object>
      const pathname = url.pathname.replace(/^\/+/, "");
      const [bucket, ...rest] = pathname.split("/");
      if (rest.length) {
        return { bucket, path: rest.join("/") };
      }
    }

    // Signed URLs may place the object path in the "name" query parameter.
    const nameParam = url.searchParams.get("name");
    if (nameParam) {
      return { bucket: url.searchParams.get("bucket") || expectedBucket, path: decodeURIComponent(nameParam) };
    }
  } catch (error) {
    // Non-URL string, fall through to regex handling.
  }

  const encodedMatch = input.match(/media%2F[^&?]+/);
  if (encodedMatch) {
    return { bucket: expectedBucket, path: decodeURIComponent(encodedMatch[0]) };
  }
  const plainMatch = input.match(/media\/[\w-]+\/[^?&]+/);
  if (plainMatch) {
    return { bucket: expectedBucket, path: plainMatch[0] };
  }

  if (fallbackPath) {
    return { bucket: expectedBucket, path: fallbackPath };
  }

  return null;
}

async function headStatus(url: string | undefined | null): Promise<number | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.status;
  } catch (error) {
    return 0; // Network failure
  }
}

async function auditVariant(
  variant: MediaVariant,
  bucketName: string,
): Promise<AuditIssue[] | null> {
  const issues: AuditIssue[] = [];
  const derived = decodeStoragePath(variant.url, variant.path, bucketName);
  if (derived) {
    if (derived.bucket !== bucketName) {
      issues.push({
        code: "bucket_mismatch",
        details: `Variant stored in bucket ${derived.bucket} (expected ${bucketName})`,
      });
    }
    const [exists] = await getStorage().bucket(derived.bucket).file(derived.path).exists();
    if (!exists) {
      issues.push({
        code: "variant_missing_object",
        details: `Object not found at ${derived.path}`,
      });
    }
  } else {
    issues.push({ code: "missing_storage_path", details: "Unable to determine Storage path for variant." });
  }

  const status = await headStatus(variant.url);
  if (status && status >= 400) {
    issues.push({
      code: "variant_http_error",
      details: `HEAD request returned status ${status}`,
    });
  } else if (status === 0) {
    issues.push({
      code: "variant_http_error",
      details: "Network error while checking variant URL",
    });
  }

  return issues.length ? issues : null;
}

async function auditMediaDoc(doc: QueryDocumentSnapshot<MediaDoc>, bucketName: string): Promise<AuditEntry> {
  const data = doc.data();
  const issues: AuditIssue[] = [];

  if (!data.url) {
    issues.push({ code: "missing_url", details: "Document does not contain a media URL." });
  }

  const derived = decodeStoragePath(
    data.url,
    data.filename ? `media/${doc.id}/${data.filename}` : undefined,
    bucketName,
  );

  if (!derived) {
    issues.push({
      code: "missing_storage_path",
      details: "Unable to derive Storage object path for this media item.",
    });
  } else {
    if (derived.bucket !== bucketName) {
      issues.push({
        code: "bucket_mismatch",
        details: `Referenced bucket ${derived.bucket} differs from configured bucket ${bucketName}.`,
      });
    }

    const storageBucket = getStorage().bucket(derived.bucket);
    const [exists] = await storageBucket.file(derived.path).exists();
    if (!exists) {
      issues.push({
        code: "missing_object",
        details: `Object not found at ${derived.path}`,
      });
    }
  }

  const status = await headStatus(data.url);
  if (status && status >= 400) {
    issues.push({ code: "http_error", details: `Media URL responded with status ${status}` });
  } else if (status === 0) {
    issues.push({ code: "http_error", details: "Network error while checking media URL" });
  }

  const expiresAt = typeof data.urlExpiresAt === "number" ? data.urlExpiresAt : Number(data.urlExpiresAt);
  if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
    issues.push({ code: "expired_url", details: "Signed URL expired" });
  }

  for (const variant of data.variants ?? []) {
    const variantIssues = await auditVariant(variant, bucketName);
    if (variantIssues) {
      issues.push(...variantIssues);
    }
  }

  return {
    id: doc.id,
    filename: data.filename || data.name,
    issues,
  };
}

async function main() {
  const bucketName = requireBucketName();
  const db = getAdminDb();
  const snapshot = await db.collection("media").get();

  if (snapshot.empty) {
    console.log("No media documents found.");
    return;
  }

  console.log(`Auditing ${snapshot.size} media documents using bucket ${bucketName}...`);

  const results: AuditEntry[] = [];
  for (const doc of snapshot.docs) {
    const entry = await auditMediaDoc(doc as any, bucketName);
    if (entry.issues.length > 0) {
      results.push(entry);
    }
  }

  if (!results.length) {
    console.log("\nAll media documents passed the audit. No issues detected.");
    return;
  }

  const issueCounts = new Map<string, number>();
  for (const entry of results) {
    for (const issue of entry.issues) {
      issueCounts.set(issue.code, (issueCounts.get(issue.code) ?? 0) + 1);
    }
  }

  console.log("\nAudit complete. Issues detected:");
  for (const [code, count] of issueCounts.entries()) {
    console.log(`  - ${code}: ${count}`);
  }

  console.log("\nDetailed report:");
  for (const entry of results) {
    console.log(`• ${entry.id}${entry.filename ? ` (${entry.filename})` : ""}`);
    for (const issue of entry.issues) {
      console.log(`   - ${issue.code}${issue.details ? ` → ${issue.details}` : ""}`);
    }
  }

  console.log(`\nNext steps:`);
  console.log("  • For missing_object issues, re-upload the file or restore it in Firebase Storage.");
  console.log(
    "  • For bucket_mismatch issues, verify FIREBASE_STORAGE_BUCKET and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET match the source bucket.",
  );
  console.log("  • For expired_url issues, run `pnpm tsx scripts/refresh-media-urls.ts` or refresh the media item from the admin panel.");
  console.log("  • For HTTP errors, confirm the signed URL is valid and Storage permissions allow read access.");
}

main().catch((error) => {
  console.error("[audit-media-storage] Unhandled error", error);
  process.exitCode = 1;
});