// Ensure server-only (prevents client bundling of firebase-admin & node: modules)
import "server-only";

import { getStorage } from "firebase-admin/storage";
import { FieldValue } from "firebase-admin/firestore";
import { safeAdminDb } from "@/lib/firebase-admin"; // value (Firestore | undefined)
import type { MediaDoc, MediaVariant } from "@/types/media";
import crypto from "node:crypto";
import type { Sharp } from "sharp";
import { serverEnv } from "@/env/server";

const FALLBACK_MEDIA: MediaDoc[] = [
  {
    id: "fallback-image",
    filename: "placeholder.png",
    basename: "placeholder",
    ext: ".png",
    mime: "image/png",
    size: 24576,
    url: "/placeholder.png",
    createdAt: 1704067200000, // 2024-01-01
    updatedAt: 1704067200000,
    width: 1600,
    height: 900,
    alt: "Placeholder image used for demo media",
    tags: ["sample"],
    createdBy: "system",
    variants: [],
    favorite: false,
  },
  {
    id: "fallback-video",
    filename: "placeholder-video.mp4",
    basename: "placeholder-video",
    ext: ".mp4",
    mime: "video/mp4",
    size: 1048576,
    url: "/placeholder.png",
    createdAt: 1706745600000, // 2024-02-01
    updatedAt: 1706745600000,
    width: 1280,
    height: 720,
    alt: "Placeholder video thumbnail",
    tags: ["demo"],
    createdBy: "system",
    variants: [],
    favorite: false,
  },
  {
    id: "fallback-audio",
    filename: "placeholder-audio.mp3",
    basename: "placeholder-audio",
    ext: ".mp3",
    mime: "audio/mpeg",
    size: 512000,
    url: "/placeholder.png",
    createdAt: 1709251200000, // 2024-03-01
    updatedAt: 1709251200000,
    alt: "Placeholder audio artwork",
    tags: ["demo"],
    createdBy: "system",
    variants: [],
    favorite: false,
  },
];

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

/**
 * Resolve a readable URL for a Storage file.
 *
 * If the bucket or object is public, returns the public URL. Otherwise a
 * signed URL is generated that expires in one hour. The expiration timestamp
 * is returned so callers can refresh URLs for long-lived dashboard sessions.
 */
async function fileUrl(file: any): Promise<{ url: string; expiresAt?: number }> {
  try {
    const [isPublic] = await file.isPublic();
    if (isPublic) {
      return { url: file.publicUrl() };
    }
  } catch {
    // If we can't determine public status, fall back to a signed URL.
  }

  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: expiresAt,
  });
  return { url: signedUrl, expiresAt };
}

/** Derive the object path from a stored URL; fall back to a best guess. */
function derivePathFromUrlOrGuess(url: string, bucketName: string, fallbackPath: string) {
  const prefix = `https://storage.googleapis.com/${bucketName}/`;
  if (url?.startsWith(prefix)) return url.slice(prefix.length).split("?")[0];
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

/** Extract media IDs from any strings containing Storage paths or URLs. */
export function extractMediaIds(...inputs: Array<string | undefined | null>): string[] {
  const ids = new Set<string>();
  const patterns = [
    /media\/(\w{16})\//g, // raw paths
    /media%2F(\w{16})%2F/g, // encoded paths
  ];
  for (const input of inputs) {
    if (!input) continue;
    for (const pattern of patterns) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(input))) {
        ids.add(m[1]);
      }
    }
  }
  return Array.from(ids);
}

/** Add postId to attachedTo for each media ID. */
export async function linkMediaToPost(mediaIds: string[], postId: string): Promise<void> {
  if (!mediaIds.length) return;
  const col = requireCollection();
  await Promise.all(
    mediaIds.map((id) =>
      col.doc(id).update({ attachedTo: FieldValue.arrayUnion(postId) })
    )
  );
}

/** Remove postId from attachedTo for each media ID. */
export async function unlinkMediaFromPost(mediaIds: string[], postId: string): Promise<void> {
  if (!mediaIds.length) return;
  const col = requireCollection();
  await Promise.all(
    mediaIds.map((id) =>
      col.doc(id).update({ attachedTo: FieldValue.arrayRemove(postId) })
    )
  );
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
function listFallbackMedia(
  params: Pick<ListMediaOptions, "limit" | "search" | "type" | "order" | "startAfter">
): ListMediaResult {
  const { limit = 50, search, type, order = "desc", startAfter } = params;

  let media = FALLBACK_MEDIA.slice();

  if (type) {
    media = media.filter((item) => item.mime === type || item.mimeType === type);
  }

  if (search) {
    const term = search.toLowerCase();
    media = media.filter((item) => {
      const haystack = (item.basename || item.filename || item.name || "").toLowerCase();
      return haystack.includes(term);
    });
  }

  media.sort((a, b) => {
    const aDate = typeof a.createdAt === "number" ? a.createdAt : Number(a.createdAt) || 0;
    const bDate = typeof b.createdAt === "number" ? b.createdAt : Number(b.createdAt) || 0;
    return order === "asc" ? aDate - bDate : bDate - aDate;
  });

  if (typeof startAfter === "number") {
    media = media.filter((item) => {
      const createdAt = typeof item.createdAt === "number" ? item.createdAt : Number(item.createdAt) || 0;
      return order === "asc" ? createdAt > startAfter : createdAt < startAfter;
    });
  }

  const hasMore = media.length > limit;
  const limited = media.slice(0, limit);
  const last = limited[limited.length - 1];
  const lastCreatedAtValue =
    typeof last?.createdAt === "number" ? last.createdAt : last?.createdAt ?? NaN;
  const numericLastCreatedAt = Number(lastCreatedAtValue);
  const cursor = hasMore && Number.isFinite(numericLastCreatedAt) ? numericLastCreatedAt : null;

  return { media: limited, cursor };
}

export async function listMedia(options: ListMediaOptions | number = 50): Promise<ListMediaResult> {

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

  const collection = tryGetCollection();
  if (!collection) {
    return listFallbackMedia({ limit, search, type, order, startAfter });
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
  await file.save(buffer, { contentType: mimeType });

  const { url, expiresAt } = await fileUrl(file);

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

  if (expiresAt) {
    // Store expiry so the dashboard can refresh signed URLs before they lapse.
    doc.urlExpiresAt = expiresAt;
  }

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
 * Refresh the signed URL for a media object and persist the new values.
 */
export async function refreshMediaUrl(id: string): Promise<MediaDoc | null> {
  const bucket = requireBucket();
  const collection = requireCollection();

  const snap = await collection.doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as MediaDoc;

  const guessPath = `media/${id}/${data.filename}`;
  const filePath = derivePathFromUrlOrGuess(data.url, bucket.name, guessPath);
  const file = bucket.file(filePath);

  const { url, expiresAt } = await fileUrl(file);

  const updates: Partial<MediaDoc> = {
    url,
    urlExpiresAt: expiresAt,
    updatedAt: Date.now(),
  };

  await collection.doc(id).set(updates, { merge: true });
  return { ...data, ...updates } as MediaDoc;
}

/**
 * Delete a media object from Storage (if possible) and remove its Firestore doc.
 * If the bucket is not configured, still remove the Firestore doc to avoid blocking.
 */
export async function deleteMedia(id: string, force = false): Promise<boolean> {
  const collection = requireCollection();
  const doc = await collection.doc(id).get();
  if (!doc.exists) return false;

  const data = doc.data() as MediaDoc;

  if (data.attachedTo?.length && !force) {
    throw new Error("MEDIA_IN_USE");
  }

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

  const { url: variantUrl, expiresAt: variantExpiresAt } = await fileUrl(variantFile);

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
  if (variantExpiresAt) {
    // Allow admin UI to refresh signed URLs for variants as well.
    variant.urlExpiresAt = variantExpiresAt;
  }

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
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
export function validateFile(mimeType: string, size: number): boolean {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) return false;
  return size <= 10 * 1024 * 1024;
}
