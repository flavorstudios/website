// Ensure server-only (prevents client bundling of firebase-admin & node: modules)
import "server-only";

import { getStorage } from "firebase-admin/storage";
import { safeAdminDb } from "@/lib/firebase-admin"; // value (Firestore | undefined)
import type { MediaDoc, MediaVariant } from "@/types/media";
import crypto from "node:crypto";
import type { Sharp } from "sharp";
import { serverEnv } from "@/env/server";

/**
 * IMPORTANT:
 * - Nothing here should touch Firebase at import time.
 * - Firestore/Storage are resolved inside functions only.
 */

// --- Firestore helpers (lazy) ------------------------------------------------
function tryGetCollection() {
  const db = safeAdminDb; // ✅ use value, not a function
  return db ? (db.collection("media") as FirebaseFirestore.CollectionReference<MediaDoc>) : null;
}

function requireCollection() {
  const col = tryGetCollection();
  if (!col) {
    throw new Error("ADMIN_DB_UNAVAILABLE");
  }
  return col;
}

// --- Misc helpers -------------------------------------------------------------
function genId() {
  return crypto.randomBytes(8).toString("hex");
}

/** Read bucket name from env (server preferred, then public). */
function getConfiguredBucketName(): string {
  const serverBucket = serverEnv.FIREBASE_STORAGE_BUCKET;
  const publicBucket = serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!serverBucket && !publicBucket) {
    throw new Error(
      "FIREBASE_STORAGE_BUCKET and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET must be set."
    );
  }

  if (serverBucket && publicBucket && serverBucket !== publicBucket) {
    throw new Error(
      "FIREBASE_STORAGE_BUCKET and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET must match."
    );
  }

  return serverBucket || publicBucket!;
}

/** Try to get a bucket instance; return null if not configured or not available. */
function tryGetBucket() {
  try {
    const name = getConfiguredBucketName();
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
      "Cloud Storage bucket not configured. Set FIREBASE_STORAGE_BUCKET (and keep NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in sync), e.g. my-project.appspot.com."
    );
  }
  return bucket;
}

/** Generate a public URL for a gs:// file path. */
function publicUrlFor(bucketName: string, path: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `https://storage.googleapis.com/${bucketName}/${encoded}`;
}

/** Derive the object path from a stored URL; fall back to a best guess. */
function derivePathFromUrlOrGuess(url: string, bucketName: string, fallbackPath: string) {
  const prefix = `https://storage.googleapis.com/${bucketName}/`;
  if (url?.startsWith(prefix)) return url.slice(prefix.length);
  return fallbackPath;
}

// Exposed health helpers (non-throwing) so UI/routes can show warnings gracefully
export function isStorageConfigured(): boolean {
  return !!tryGetBucket();
}

export function storageInfo(): { configured: boolean; bucket?: string } {
  const b = tryGetBucket();
  return { configured: !!b, bucket: b?.name };
}

// --- Public API --------------------------------------------------------------

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
 * List media from Firestore. If admin is not configured, return an empty result
 * instead of throwing (keeps builds/preview envs stable).
 */
export async function listMedia(options: ListMediaOptions | number = 50): Promise<ListMediaResult> {
  const collection = tryGetCollection();
  if (!collection) {
    return { media: [], cursor: null };
  }

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

  let query: FirebaseFirestore.Query<MediaDoc> = collection.orderBy("createdAt", order);

  if (type) {
    query = query.where("mime", "==", type) as FirebaseFirestore.Query<MediaDoc>;
  }

  if (search) {
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
 * Requires bucket & admin Firestore (enforced lazily here).
 */
export async function uploadMedia(buffer: Buffer, name: string, mimeType: string): Promise<MediaDoc> {
  const bucket = requireBucket();
  const collection = requireCollection();

  const id = genId();
  const objectPath = `media/${id}/${name}`;
  const file = bucket.file(objectPath);
  await file.save(buffer, { contentType: mimeType, predefinedAcl: "publicRead" });

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
    favorite: false, // ✅ default favorite flag
  };

  // Dynamically import sharp to avoid cold-start penalties and guard for non-images
  try {
    type SharpFactory = (input?: Buffer | ArrayBufferView | string) => Sharp;
    const { default: sharp } = (await import("sharp")) as { default: SharpFactory };
    const meta = await sharp(buffer).metadata();
    doc.width = meta.width || 0;
    doc.height = meta.height || 0;
  } catch {
    // If sharp is unavailable or the file isn't an image, leave 0×0
  }

  await collection.doc(id).set(doc);
  return doc;
}

/** Update a media document (Firestore only). */
export async function updateMedia(id: string, updates: Partial<MediaDoc>): Promise<MediaDoc | null> {
  const collection = requireCollection();
  await collection.doc(id).set({ ...updates, updatedAt: Date.now() }, { merge: true });
  const doc = await collection.doc(id).get();
  return doc.exists ? (doc.data() as MediaDoc) : null;
}

/**
 * Delete a media object from Storage (if possible) and remove its Firestore doc.
 * If the bucket is not configured, still remove the Firestore doc to avoid blocking.
 */
export async function deleteMedia(id: string): Promise<boolean> {
  const collection = requireCollection();
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
  const collection = requireCollection();

  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;

  const data = docSnap.data() as MediaDoc;
  const guessPath = `media/${id}/${data.filename}`;
  const origPath = derivePathFromUrlOrGuess(data.url, bucket.name, guessPath);

  const origBuffer = await bucket.file(origPath).download();

  // Dynamically import sharp here too
  type SharpFactory = (input?: Buffer | ArrayBufferView | string) => Sharp;
  const { default: sharp } = (await import("sharp")) as { default: SharpFactory };

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

  const variantUrl = publicUrlFor(bucket.name, variantObjectPath);

  const variant: MediaVariant = {
    id: genId(),
    // include url for consumers that expect it
    url: variantUrl,
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

  const variants = Array.isArray(data.variants) ? [...data.variants, variant] : [variant];

  await collection.doc(id).set({ variants, updatedAt: Date.now() }, { merge: true });

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
