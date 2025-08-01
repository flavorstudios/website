import { getStorage } from "firebase-admin/storage";
import { adminDb } from "@/lib/firebase-admin";
import type { MediaDoc, MediaVariant } from "@/types/media";
import crypto from "node:crypto";

// --- Bucket name logic: pick server env, fallback to public, or error ---
const bucketName =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!bucketName) {
  throw new Error(
    "FIREBASE_STORAGE_BUCKET env var is required for media operations"
  );
}
const bucket = getStorage().bucket(bucketName);
const collection = adminDb.collection("media");

function genId() {
  return crypto.randomBytes(8).toString("hex");
}

// --- New types for paginated/media search listing ---
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

// --- Enhanced, backward-compatible listMedia() ---
export async function listMedia(
  options: ListMediaOptions | number = 50
): Promise<ListMediaResult> {
  // If called with just a number, act as legacy usage
  let limit = 50;
  let search, type, order, startAfter;

  if (typeof options === "number") {
    limit = options;
    order = "desc";
  } else {
    limit = options.limit ?? 50;
    search = options.search;
    type = options.type;
    order = options.order ?? "desc";
    startAfter = options.startAfter;
  }

  let query: FirebaseFirestore.Query = collection.orderBy("createdAt", order);

  if (type) {
    query = query.where("mime", "==", type);
  }

  if (search) {
    // Search by basename (case-insensitive, Firestore workaround)
    const term = search.toLowerCase();
    query = query
      .where("basename", ">=", term)
      .where("basename", "<=", term + "\uf8ff");
  }

  if (startAfter) {
    query = query.startAfter(startAfter);
  }

  const snap = await query.limit(limit).get();
  const media = snap.docs.map((d) => d.data() as MediaDoc);
  const last = snap.docs[snap.docs.length - 1];
  const cursor = last ? (last.get("createdAt") as number) : null;

  return { media, cursor };
}

// --- Unchanged: uploadMedia, updateMedia, deleteMedia, cropMedia, suggestAltText, validateFile ---

export async function uploadMedia(
  buffer: Buffer,
  name: string,
  mimeType: string
): Promise<MediaDoc> {
  const id = genId();
  const file = bucket.file(`media/${id}/${name}`);
  await file.save(buffer, { contentType: mimeType });
  const url = `https://storage.googleapis.com/${bucket.name}/media/${id}/${name}`;
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
    basename: name.replace(/\.[^.]+$/, ""),
    ext: name.includes(".") ? name.slice(name.lastIndexOf(".")) : "",
    alt: "",
    tags: [],
    createdBy: "",
    variants: [],
  };
  // Dynamically import sharp to avoid Vercel/serverless cold start issues
  const sharp = (await import("sharp")).default;
  const meta = await sharp(buffer).metadata();
  doc.width = meta.width || 0;
  doc.height = meta.height || 0;
  await collection.doc(id).set(doc);
  return doc;
}

export async function updateMedia(
  id: string,
  updates: Partial<MediaDoc>
): Promise<MediaDoc | null> {
  await collection.doc(id).set(
    { ...updates, updatedAt: Date.now() },
    { merge: true }
  );
  const doc = await collection.doc(id).get();
  return doc.exists ? (doc.data() as MediaDoc) : null;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return false;
  const data = doc.data() as MediaDoc;
  const filePath = data.url.split(
    `https://storage.googleapis.com/${bucket.name}/`
  )[1];
  await bucket.file(filePath).delete().catch(() => {});
  await collection.doc(id).delete();
  return true;
}

export async function cropMedia(
  id: string,
  variantName: string,
  options: { width: number; height: number; x: number; y: number }
) {
  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;
  const data = docSnap.data() as MediaDoc;
  const filePath = data.url.split(
    `https://storage.googleapis.com/${bucket.name}/`
  )[1];
  const origBuffer = await bucket.file(filePath).download();
  // Dynamically import sharp here too!
  const sharp = (await import("sharp")).default;
  const outBuffer = await sharp(origBuffer[0])
    .extract({
      width: options.width,
      height: options.height,
      left: options.x,
      top: options.y,
    })
    .toBuffer();
  const variantFile = bucket.file(`media/${id}/${variantName}`);
  await variantFile.save(outBuffer, { contentType: data.mime });
  const variantUrl = `https://storage.googleapis.com/${bucket.name}/media/${id}/${variantName}`;
  const variant: MediaVariant = {
    id: genId(),
    path: `media/${id}/${variantName}`,
    width: options.width,
    height: options.height,
    size: outBuffer.length,
    mime: data.mime,
    createdAt: Date.now(),
    createdBy: data.createdBy || "",
    type: "crop",
    label: variantName,
  };
  const variants = data.variants ? [...data.variants, variant] : [variant];
  await collection.doc(id).set({ variants, updatedAt: Date.now() }, { merge: true });
  return variant;
}

export function suggestAltText(filename: string): string {
  // Suggest alt based on filename (e.g., "my-hero-image.png" -> "My Hero Image")
  return filename
    .replace(/[-_]/g, " ")
    .replace(/\.[^.]+$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function validateFile(mimeType: string, size: number): boolean {
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowed.includes(mimeType)) return false;
  return size <= 10 * 1024 * 1024;
}
