import { getStorage } from "firebase-admin/storage";
import { adminDb } from "@/lib/firebase-admin";
import type { MediaDoc, MediaVariant } from "@/types/media";
import crypto from "node:crypto";

/**
 * IMPORTANT:
 * - Do NOT throw at import time. Many routes import this module even when they
 *   don't touch Cloud Storage (e.g., listing media from Firestore).
 * - We resolve the bucket lazily in the functions that actually require it.
 */

// Firestore collection (safe at import time)
const collection = adminDb.collection("media");

// --- Helpers ---------------------------------------------------------------

function genId() {
  return crypto.randomBytes(8).toString("hex");
}

/** Read bucket name from env (server preferred, then public). */
function getConfiguredBucketName(): string | undefined {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  );
}

/** Try to get a bucket instance; return null if not configured or not available. */
function tryGetBucket() {
  try {
    const name = getConfiguredBucketName();
    // If app options have a default bucket, getStorage().bucket() (no args) will use it.
    return name ? getStorage().bucket(name) : getStorage().bucket();
  } catch {
    return null;
  }
}

/** Require a bucket for operations that truly need it; throw a helpful error otherwise. */
function requireBucket() {
  const bucket = tryGetBucket();
  if (!bucket) {
    throw new Error(
      "Cloud Storage bucket not configured. Set FIREBASE_STORAGE_BUCKET (and keep NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in sync) to your bucket, e.g. my-project.appspot.com."
    );
  }
  return bucket;
}

/** Generate a public URL for a gs:// file path. */
function publicUrlFor(bucketName: string, path: string) {
  // Ensure encoded path; Storage serves via storage.googleapis.com/<bucket>/<path>
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `https://storage.googleapis.com/${bucketName}/${encoded}`;
}

/** Derive the object path from a stored URL; fall back to a best guess. */
function derivePathFromUrlOrGuess(
  url: string,
  bucketName: string,
  fallbackPath: string
) {
  const prefix = `https://storage.googleapis.com/${bucketName}/`;
  if (url?.startsWith(prefix)) {
    return url.slice(prefix.length);
  }
  // Fallback to the known convention we use on upload
  return fallbackPath;
}

// --- Public API ------------------------------------------------------------

export interface ListMediaOptions {
  limit?: number;
  search?: string;
  type?: string;
  order?: "asc" | "desc";
  startAfter?: number;
}

export interface ListMediaResult {
  media: MediaDoc[];
  cursor: number | null;
}

/**
 * List media from Firestore. This does NOT require a storage bucket,
 * so it remains usable even if the bucket is misconfigured.
 */
export async function listMedia(
  options: ListMediaOptions | number = 50
): Promise<ListMediaResult> {
  // Legacy signature support: listMedia(25)
  let limit = 50;
  let search: string | undefined;
  let type: string | undefined;
  let order: "asc" | "desc" = "desc";
  let startAfter: number | undefined;

  if (typeof options === "number") {
    limit = options;
  } else {
    limit = options.limit ?? 50;
    search = options.search;
    type = options.type;
    order = options.order ?? "desc";
    startAfter = options.startAfter;
  }

  let query: FirebaseFirestore.Query<MediaDoc> =
    collection.orderBy("createdAt", order);

  if (type) {
    query = query.where("mime", "==", type) as FirebaseFirestore.Query<MediaDoc>;
  }

  if (search) {
    // Case-insensitive basename prefix search (Firestore-safe)
    const term = search.toLowerCase();
    query = query
      .where("basename", ">=", term)
      .where("basename", "<=", term + "\uf8ff") as FirebaseFirestore.Query<MediaDoc>;
  }

  if (startAfter != null) {
    query = query.startAfter(startAfter) as FirebaseFirestore.Query<MediaDoc>;
  }

  const snap = await query.limit(limit).get();
  const media = snap.docs.map((d) => d.data() as MediaDoc);
  const last = snap.docs[snap.docs.length - 1];
  const cursor = last ? (last.get("createdAt") as number) : null;

  return { media, cursor };
}

/**
 * Upload a media file to Storage and create a Firestore doc.
 * Requires bucket configuration (enforced lazily here).
 */
export async function uploadMedia(
  buffer: Buffer,
  name: string,
  mimeType: string
): Promise<MediaDoc> {
  const bucket = requireBucket();

  const id = genId();
  const objectPath = `media/${id}/${name}`;
  const file = bucket.file(objectPath);
  await file.save(buffer, { contentType: mimeType });

  const url = publicUrlFor(bucket.name, objectPath);

  const doc: MediaDoc = {
    id,
    filename: name,
    mime: mimeType,
    size: buffer.length,
    url,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    width: 0,
    height: 0,
    basename: name.replace(/\.[^.]+$/, "").toLowerCase(),
    ext: name.includes(".") ? name.slice(name.lastIndexOf(".")) : "",
    alt: "",
    tags: [],
    createdBy: "",
    variants: [],
  };

  // Dynamically import sharp to avoid cold-start penalties
  const sharpMod = await import("sharp");
  const sharp = (sharpMod as any).default ?? sharpMod;
  const meta = await sharp(buffer).metadata();
  doc.width = meta.width || 0;
  doc.height = meta.height || 0;

  await collection.doc(id).set(doc);
  return doc;
}

/** Update a media document (Firestore only). */
export async function updateMedia(
  id: string,
  updates: Partial<MediaDoc>
): Promise<MediaDoc | null> {
  await collection
    .doc(id)
    .set({ ...updates, updatedAt: Date.now() }, { merge: true });
  const doc = await collection.doc(id).get();
  return doc.exists ? (doc.data() as MediaDoc) : null;
}

/**
 * Delete a media object from Storage (if possible) and remove its Firestore doc.
 * If the bucket is not configured, we still remove the Firestore doc to avoid blocking.
 */
export async function deleteMedia(id: string): Promise<boolean> {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return false;

  const data = doc.data() as MediaDoc;

  // Attempt to delete from Storage only if bucket is available.
  const bucket = tryGetBucket();
  if (bucket) {
    const guessPath = `media/${id}/${data.filename}`;
    const filePath = derivePathFromUrlOrGuess(data.url, bucket.name, guessPath);
    try {
      await bucket.file(filePath).delete();
    } catch {
      // Ignore storage delete errors to avoid blocking admin flows
    }
  }

  await collection.doc(id).delete();
  return true;
}

/**
 * Create a cropped variant and persist it as a new object;
 * also appends to `variants` in the doc.
 */
export async function cropMedia(
  id: string,
  variantName: string,
  options: { width: number; height: number; x: number; y: number }
) {
  const bucket = requireBucket();

  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;

  const data = docSnap.data() as MediaDoc;
  const guessPath = `media/${id}/${data.filename}`;
  const origPath = derivePathFromUrlOrGuess(data.url, bucket.name, guessPath);

  const origBuffer = await bucket.file(origPath).download();

  // Dynamically import sharp here too
  const sharpMod = await import("sharp");
  const sharp = (sharpMod as any).default ?? sharpMod;

  const outBuffer = await sharp(origBuffer[0])
    .extract({
      width: options.width,
      height: options.height,
      left: options.x,
      top: options.y,
    })
    .toBuffer();

  const variantObjectPath = `media/${id}/${variantName}`;
  const variantFile = bucket.file(variantObjectPath);
  await variantFile.save(outBuffer, { contentType: data.mime });

  const variant: MediaVariant = {
    id: genId(),
    path: variantObjectPath,
    width: options.width,
    height: options.height,
    size: outBuffer.length,
    mime: data.mime,
    createdAt: Date.now(),
    createdBy: data.createdBy || "",
    type: "crop",
    label: variantName,
  };

  const variants = Array.isArray(data.variants)
    ? [...data.variants, variant]
    : [variant];

  await collection
    .doc(id)
    .set({ variants, updatedAt: Date.now() }, { merge: true });

  return variant;
}

/** Suggest alt text based on filename. */
export function suggestAltText(filename: string): string {
  return filename
    .replace(/[-_]/g, " ")
    .replace(/\.[^.]+$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Validate file type and size (<= 10 MB). */
export function validateFile(mimeType: string, size: number): boolean {
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowed.includes(mimeType)) return false;
  return size <= 10 * 1024 * 1024;
}
