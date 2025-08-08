import { getStorage } from "firebase-admin/storage";
import { adminDb } from "@/lib/firebase-admin";
import type { MediaDoc, MediaVariant } from "@/types/media";
import crypto from "node:crypto";
import sharp from "sharp"; // used in new helpers
import { addStorageUsage, reduceStorageUsage } from "@/lib/storage-usage";
import { FieldValue } from "firebase-admin/firestore"; // for detach field delete

/**
 * Lazily resolve the storage bucket so builds don't require FIREBASE_STORAGE_BUCKET.
 * Throws only when an operation actually needs the bucket.
 */
function getBucket() {
  const name =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!name) {
    throw new Error(
      "FIREBASE_STORAGE_BUCKET env var is required for media operations"
    );
  }
  return getStorage().bucket(name);
}

/**
 * Lazily resolve Firestore. Avoids build-time crashes where adminDb
 * might not be initialized yet. We defer access until route/function use.
 */
function getDb(): FirebaseFirestore.Firestore {
  const db = adminDb as FirebaseFirestore.Firestore | undefined;
  if (!db) {
    throw new Error("Firestore admin is not initialized");
  }
  return db;
}

/**
 * Proxies so existing code continues to use `bucket.file(...)`, `bucket.name`,
 * and `collection.doc(...)` without eager initialization.
 */
const bucket = new Proxy({} as ReturnType<typeof getBucket>, {
  get(_t, p) {
    // @ts-expect-error dynamic pass-through to live bucket
    return (getBucket() as any)[p];
  },
}) as unknown as ReturnType<typeof getBucket>;

const collection = new Proxy({} as FirebaseFirestore.CollectionReference, {
  get(_t, p) {
    // @ts-expect-error dynamic pass-through to real collection
    return (getDb().collection("media") as any)[p];
  },
}) as unknown as FirebaseFirestore.CollectionReference;

const trashCollection = new Proxy({} as FirebaseFirestore.CollectionReference, {
  get(_t, p) {
    // @ts-expect-error dynamic pass-through to real collection
    return (getDb().collection("media_trash") as any)[p];
  },
}) as unknown as FirebaseFirestore.CollectionReference;

function genId() {
  return crypto.randomBytes(8).toString("hex");
}

// --- helper: safe storage path from url when storagePath is missing ---
function getStoragePathFromDoc(doc: any): string {
  if (doc?.storagePath) return doc.storagePath as string;
  // fallback: derive from URL (works with GCS public URLs)
  const prefix = `https://storage.googleapis.com/${getBucket().name}/`;
  if (!doc?.url?.startsWith(prefix)) {
    throw new Error("Cannot derive storage path from url; missing storagePath");
  }
  return doc.url.slice(prefix.length);
}

// Public helper used by routes
export async function getMediaById(id: string): Promise<MediaDoc | null> {
  const snap = await collection.doc(id).get();
  return snap.exists ? (snap.data() as MediaDoc) : null;
}

// --- New types for paginated/media search listing ---
export interface ListMediaOptions {
  limit?: number;
  search?: string;                 // multi-field search (applied in-memory)
  type?: string;                   // mime prefix, e.g. "image", "video"
  order?: "asc" | "desc";
  startAfter?: number;

  // Advanced filters
  month?: number;                  // 1..12 (optional)
  year?: number;                   // e.g., 2025 (optional)
  size?: "small" | "medium" | "large";     // <1MB, 1–5MB, >5MB
  attached?: "attached" | "unattached";    // boolean-like flag on doc
  tags?: string[];                 // all must be present

  // Folders / favorites
  folderId?: string;               // "root" or specific folder id
  starred?: boolean;               // favorites filter
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
  let search: string | undefined;
  let type: string | undefined;
  let order: "asc" | "desc" = "desc";
  let startAfter: number | undefined;

  // New advanced filters (optional)
  let month: number | undefined;
  let year: number | undefined;
  let size: "small" | "medium" | "large" | undefined;
  let attached: "attached" | "unattached" | undefined;
  let tags: string[] | undefined;

  // New: folders / favorites
  let folderId: string | undefined;
  let starred: boolean | undefined;

  if (typeof options === "number") {
    limit = options;
  } else {
    limit = options.limit ?? 50;
    search = options.search;
    type = options.type;
    order = options.order ?? "desc";
    startAfter = options.startAfter;

    month = options.month;
    year = options.year;
    size = options.size;
    attached = options.attached;
    tags = options.tags;

    folderId = options.folderId;
    starred = options.starred;
  }

  // Base query (Firestore constraints kept minimal; complex filters applied in-memory)
  let query: FirebaseFirestore.Query = collection.orderBy("createdAt", order);

  // Narrow by folderId if provided
  if (folderId) {
    query = query.where("folderId", "==", folderId);
  }

  // Narrow by starred if explicitly provided
  if (typeof starred === "boolean") {
    query = query.where("starred", "==", starred);
  }

  // For search, keep the original basename prefix optimization (helps when available)
  if (search) {
    const term = search.toLowerCase();
    // Use best-effort prefix search on basename when present
    query = query.where("basename", ">=", term).where("basename", "<=", term + "\uf8ff");
  }

  if (startAfter) {
    query = query.startAfter(startAfter);
  }

  // Fetch one page
  const snap = await query.limit(limit).get();

  // Snapshot → docs with **backfill** for legacy fields
  const media: MediaDoc[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() as MediaDoc & Partial<Record<string, any>>;
    const updates: Partial<MediaDoc> = {};

    if ((data as any).folderId === undefined) (updates as any).folderId = "root";
    if ((data as any).starred === undefined) (updates as any).starred = false;
    if ((data as any).lastAccessed === undefined) {
      const created = (data as any).createdAt as number | undefined;
      (updates as any).lastAccessed = created ?? Date.now();
    }

    if (Object.keys(updates).length > 0) {
      await doc.ref.set(updates, { merge: true });
      Object.assign(data, updates);
    }
    media.push(data);
  }

  // In-memory filters for fields not easily indexed together

  // Type prefix (mime)
  if (type) {
    (media as any[]).splice(
      0,
      media.length,
      ...media.filter((m: any) => (m.mime || m.mimeType || "").startsWith(type))
    );
  }

  // Month/Year window
  if (typeof month === "number" && typeof year === "number" && month >= 1 && month <= 12) {
    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 1).getTime();
    (media as any[]).splice(
      0,
      media.length,
      ...media.filter((m: any) => (m.createdAt as any || 0) >= start && (m.createdAt as any || 0) < end)
    );
  } else if (typeof year === "number") {
    const start = new Date(year, 0, 1).getTime();
    const end = new Date(year + 1, 0, 1).getTime();
    (media as any[]).splice(
      0,
      media.length,
      ...media.filter((m: any) => (m.createdAt as any || 0) >= start && (m.createdAt as any || 0) < end)
    );
  }

  // Size buckets
  if (size === "small") {
    (media as any[]).splice(0, media.length, ...media.filter((m) => (m.size || 0) < 1 * 1024 * 1024));
  } else if (size === "medium") {
    (media as any[]).splice(
      0,
      media.length,
      ...media.filter((m) => (m.size || 0) >= 1 * 1024 * 1024 && (m.size || 0) <= 5 * 1024 * 1024)
    );
  } else if (size === "large") {
    (media as any[]).splice(0, media.length, ...media.filter((m) => (m.size || 0) > 5 * 1024 * 1024));
  }

  // Attached/unattached flag
  if (attached === "attached") {
    (media as any[]).splice(0, media.length, ...media.filter((m: any) => !!(m as any).attached));
  } else if (attached === "unattached") {
    (media as any[]).splice(0, media.length, ...media.filter((m: any) => !(m as any).attached));
  }

  // Require all tags present if tags provided
  if (tags && tags.length) {
    (media as any[]).splice(
      0,
      media.length,
      ...media.filter((m) => tags!.every((t) => (m.tags || []).includes(t)))
    );
  }

  // Multi-field search: filename, title, caption, description, tags, createdBy
  if (search) {
    const term = search.toLowerCase();
    (media as any[]).splice(
      0,
      media.length,
      ...media.filter((m: any) => {
        const fields = [
          m.filename,
          m.title,
          m.caption,
          m.description,
          m.createdBy,
        ].map((v) => (v || "").toLowerCase());

        const tagMatch = (m.tags || []).some((t: string) => t.toLowerCase().includes(term));
        return fields.some((f) => f.includes(term)) || tagMatch;
      })
    );
  }

  const last = snap.docs[snap.docs.length - 1];
  const cursor = last ? (last.get("createdAt") as number) : null;

  return { media, cursor };
}

// --- Unchanged: updateMedia, deleteMedia, cropMedia, suggestAltText, validateFile ---

export async function uploadMedia(
  buffer: Buffer,
  name: string,
  mimeType: string,
  uid: string,
  hash?: string
): Promise<MediaDoc & { quotaExceeded?: boolean }> {
  // Compute hash if not provided
  const finalHash = hash || crypto.createHash("sha256").update(buffer).digest("hex");

  const id = genId();
  const file = bucket.file(`media/${id}/${name}`);
  await file.save(buffer, { contentType: mimeType });
  const url = `https://storage.googleapis.com/${bucket.name}/media/${id}/${name}`;

  const doc: any = {
    id,
    filename: name,
    mime: mimeType,             // keep alias for listMedia type filtering
    mimeType,
    size: buffer.length,
    url,
    hash: finalHash,            // stored for duplicates/integrity
    createdAt: Date.now(),
    updatedAt: Date.now(),
    width: 0,
    height: 0,
    basename: name.replace(/\.[^.]+$/, ""),
    ext: name.includes(".") ? name.slice(name.lastIndexOf(".")) : "",
    alt: "",
    tags: [],
    createdBy: uid,
    variants: [],
    // ensure focalPoint exists for smart-crop flows
    focalPoint: { x: 0.5, y: 0.5 },

    // Backfill-friendly defaults for new docs
    folderId: "root",
    starred: false,
    lastAccessed: Date.now(),
    storagePath: `media/${id}/${name}`,
  };

  // Dimensions (best-effort)
  try {
    if (mimeType.startsWith("image/") && mimeType !== "image/svg+xml") {
      const sharpDyn = (await import("sharp")).default;
      const meta = await sharpDyn(buffer).metadata();
      doc.width = meta.width || 0;
      doc.height = meta.height || 0;
    }
  } catch {
    // best-effort; non-fatal
  }

  await collection.doc(id).set(doc);

  // Quota tracking (persistent)
  const { overQuota } = await addStorageUsage(uid, buffer.length);

  return { ...(doc as MediaDoc), quotaExceeded: overQuota };
}

// Placeholder for optional antivirus scanning hooks. Always returns true for now.
export async function scanBuffer(_buffer: Buffer): Promise<boolean> {
  return true;
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

export async function deleteMedia(id: string, actingUid?: string): Promise<boolean> {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return false;
  const data = doc.data() as MediaDoc;
  const filePath = data.url.split(
    `https://storage.googleapis.com/${bucket.name}/`
  )[1];
  await bucket.file(filePath).delete().catch(() => {});
  await collection.doc(id).delete();
  // Reduce usage for owner (or acting user fallback)
  const owner = (data as any).createdBy || actingUid || "";
  if (owner) await reduceStorageUsage(owner, data.size || 0);
  return true;
}

/**
 * Soft-delete: move doc to media_trash.
 */
export async function trashMedia(id: string, uid: string): Promise<boolean> {
  return getDb().runTransaction(async (tx) => {
    const src = collection.doc(id);
    const dst = trashCollection.doc(id);
    const snap = await tx.get(src);
    if (!snap.exists) return false;
    const data = snap.data() as MediaDoc;
    tx.set(dst, { ...data, deletedAt: Date.now(), deletedBy: uid });
    tx.delete(src);
    return true;
  });
}

/**
 * Restore from trash back to media.
 */
export async function restoreMediaFromTrash(id: string): Promise<boolean> {
  return getDb().runTransaction(async (tx) => {
    const src = trashCollection.doc(id);
    const dst = collection.doc(id);
    const snap = await tx.get(src);
    if (!snap.exists) return false;
    const data = snap.data() as MediaDoc & { deletedAt?: number; deletedBy?: string };
    const { deletedAt, deletedBy, ...rest } = data as any;
    tx.set(dst, { ...rest, updatedAt: Date.now() }, { merge: false });
    tx.delete(src);
    return true;
  });
}

/**
 * Hard-delete from trash (also deletes storage object, updates quota).
 */
export async function hardDeleteFromTrash(id: string): Promise<boolean> {
  const snap = await trashCollection.doc(id).get();
  if (!snap.exists) return false;
  const data = snap.data() as MediaDoc;
  const filePath = data.url.split(
    `https://storage.googleapis.com/${bucket.name}/`
  )[1];
  await bucket.file(filePath).delete().catch(() => {});
  await trashCollection.doc(id).delete();
  const owner = (data as any).createdBy || "";
  if (owner) await reduceStorageUsage(owner, data.size || 0);
  return true;
}

export async function cropMedia(
  id: string,
  variantName: string,
  options: { width: number; height: number; x: number; y: number }
) {
  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;
  const data = docSnap.data() as any;
  const filePath = data.url.split(
    `https://storage.googleapis.com/${bucket.name}/`
  )[1];
  const origBuffer = await bucket.file(filePath).download();
  // Dynamically import sharp here too!
  const sharpDyn = (await import("sharp")).default;
  const outBuffer = await sharpDyn(origBuffer[0])
    .extract({
      width: options.width,
      height: options.height,
      left: options.x,
      top: options.y,
    })
    .toBuffer();
  const variantFile = bucket.file(`media/${id}/${variantName}`);
  await variantFile.save(outBuffer, { contentType: data.mime || data.mimeType });

  // Try to infer label and format for consistency with tests
  const dot = variantName.lastIndexOf(".");
  const label = dot > -1 ? variantName.slice(0, dot) : variantName;
  const format = dot > -1 ? variantName.slice(dot + 1) : (data.mime || "image/png").split("/")[1];

  const variant: MediaVariant = {
    url: `https://storage.googleapis.com/${bucket.name}/media/${id}/${variantName}`,
    width: options.width,
    height: options.height,
    // fields expected by tests / callers:
    // @ts-expect-error allow extra fields not in minimal type
    label,
    // @ts-expect-error allow extra fields not in minimal type
    format,
  } as any;

  const variants = Array.isArray(data.variants) ? [...data.variants, variant] : [variant];
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

/**
 * NEW: replaceMedia — keeps the same media ID, archives prior version,
 * updates dimensions, and writes audit-ish metadata, without changing your existing fields.
 * Non-invasive: no changes to existing functions or types.
 */
export async function replaceMedia(
  id: string,
  buffer: Buffer,
  name: string,
  mimeType: string,
  meta?: { replacedBy?: string }
): Promise<MediaDoc | null> {
  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;

  const data = docSnap.data() as any;

  // Content-addressable path to avoid CDN cache issues and support parallel versions
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const newPath = `media/${id}/${hash}_${name}`;
  const file = bucket.file(newPath);
  await file.save(buffer, { contentType: mimeType });

  // Gather new dimensions if image
  let width: number | undefined;
  let height: number | undefined;
  try {
    if (mimeType.startsWith("image/") && mimeType !== "image/svg+xml") {
      const sharpDyn = (await import("sharp")).default;
      const m = await sharpDyn(buffer).rotate().metadata();
      width = m.width;
      height = m.height;
    }
  } catch {
    // best-effort
  }

  const url = `https://storage.googleapis.com/${bucket.name}/${newPath}`;

  // Build prior version record
  const prior = {
    versionId: genId(),
    url: data.url,
    filename: data.filename || data.name || "unknown",
    mimeType: data.mime || data.mimeType || "application/octet-stream",
    size: data.size || 0,
    width: data.width,
    height: data.height,
    replacedAt: Date.now(),
    replacedBy: meta?.replacedBy || "",
  };

  const versions = Array.isArray(data.versions) ? [prior, ...data.versions] : [prior];

  await collection.doc(id).set(
    {
      url,
      filename: name,
      mime: mimeType,
      mimeType,
      size: buffer.length,
      width,
      height,
      versions,
      updatedAt: Date.now(),
      updatedBy: meta?.replacedBy || data.updatedBy || "",
      // store for future use
      storagePath: newPath,
    },
    { merge: true }
  );

  const updated = await collection.doc(id).get();
  return updated.exists ? (updated.data() as MediaDoc) : null;
}

/**
 * OPTIONAL helper (non-breaking): restore a previous version by versionId.
 * Wire via /api/media/restore if/when you add that route. Leaves current version in history.
 */
export async function restoreMedia(
  id: string,
  versionId: string,
  meta?: { restoredBy?: string }
): Promise<MediaDoc | null> {
  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;
  const data = docSnap.data() as any;
  const versions: any[] = Array.isArray(data.versions) ? data.versions : [];
  const target = versions.find((v: any) => v.versionId === versionId);
  if (!target) return null;

  // Current becomes a new version entry
  const currentAsVersion = {
    versionId: genId(),
    url: data.url,
    filename: data.filename || data.name || "unknown",
    mimeType: data.mime || data.mimeType || "application/octet-stream",
    size: data.size || 0,
    width: data.width,
    height: data.height,
    replacedAt: Date.now(),
    replacedBy: meta?.restoredBy || "",
  };

  const remaining = versions.filter((v: any) => v.versionId !== versionId);
  const nextVersions = [currentAsVersion, ...remaining];

  await collection.doc(id).set(
    {
      url: target.url,
      filename: target.filename || data.filename,
      mime: target.mimeType || data.mime,
      mimeType: target.mimeType || data.mimeType,
      size: target.size ?? data.size,
      width: target.width ?? data.width,
      height: target.height ?? data.height,
      versions: nextVersions,
      updatedAt: Date.now(),
      updatedBy: meta?.restoredBy || data.updatedBy || "",
      storagePath: getStoragePathFromDoc({ url: target.url }),
    },
    { merge: true }
  );

  const updated = await collection.doc(id).get();
  return updated.exists ? (updated.data() as MediaDoc) : null;
}

/* =========================
   NEW: responsive variants & edit endpoint helpers
   ========================= */

const VARIANT_SIZES: Record<"thumb" | "small" | "medium" | "large", number> = {
  thumb: 150,
  small: 320,
  medium: 640,
  large: 1024,
};

/**
 * Generate WebP/AVIF square variants around a focal point and store them under media/<id>/<label>.<format>
 */
export async function generateResponsiveVariants(
  buffer: Buffer,
  id: string,
  focal: { x: number; y: number }
): Promise<MediaVariant[]> {
  const out: MediaVariant[] = [];
  const meta = await sharp(buffer).metadata();
  const W = meta.width || 0;
  const H = meta.height || 0;

  for (const [label, size] of Object.entries(VARIANT_SIZES) as Array<[keyof typeof VARIANT_SIZES, number]>) {
    // center a square around focal
    let left = Math.max(0, Math.round(focal.x * W - size / 2));
    let top = Math.max(0, Math.round(focal.y * H - size / 2));
    if (left + size > W) left = Math.max(0, W - size);
    if (top + size > H) top = Math.max(0, H - size);

    // if image is smaller, just resize
    const base = (size <= W && size <= H)
      ? await sharp(buffer).extract({ left, top, width: Math.min(size, W), height: Math.min(size, H) }).toBuffer()
      : buffer;

    for (const format of ["webp", "avif"] as const) {
      const resized = await sharp(base)
        .resize(size, size, { fit: "cover" })
        .withMetadata()
        .toFormat(format)
        .toBuffer();

      const storagePath = `media/${id}/${label}.${format}`;
      await bucket.file(storagePath).save(resized, { contentType: `image/${format}` });

      out.push({
        url: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
        width: size,
        height: size,
        // @ts-expect-error allow extra fields not in minimal type
        format,
        // @ts-expect-error allow extra fields not in minimal type
        label,
      } as any);
    }
  }
  return out;
}

/**
 * Apply transforms (rotate/flip/flop/crop/scale), write back to original object,
 * update focal point, regenerate responsive variants.
 */
export async function editMedia(
  id: string,
  options: {
    crop?: { x: number; y: number; width: number; height: number };
    rotate?: number; // degrees
    flip?: boolean;  // vertical
    flop?: boolean;  // horizontal
    scale?: number;  // 0.1..2.0
    focalPoint?: { x: number; y: number };
  }
): Promise<MediaDoc | null> {
  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;
  const data = docSnap.data() as any;

  const storagePath = getStoragePathFromDoc(data);
  const [origBuffer] = await bucket.file(storagePath).download();

  let image = sharp(origBuffer).rotate(); // normalize EXIF
  if (typeof options.rotate === "number") image = image.rotate(options.rotate);
  if (options.flip) image = image.flip();
  if (options.flop) image = image.flop();

  if (options.crop) {
    const { x, y, width, height } = options.crop;
    image = image.extract({
      left: Math.max(0, Math.round(x)),
      top: Math.max(0, Math.round(y)),
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    });
  }

  if (typeof options.scale === "number") {
    const scl = Math.min(2, Math.max(0.1, options.scale));
    const m = await image.metadata();
    const w = Math.max(1, Math.round((m.width || 1) * scl));
    const h = Math.max(1, Math.round((m.height || 1) * scl));
    image = image.resize(w, h);
  }

  const processed = await image.withMetadata().toBuffer();
  await bucket.file(storagePath).save(processed, { contentType: data.mime || data.mimeType });

  const focal = options.focalPoint ?? data.focalPoint ?? { x: 0.5, y: 0.5 };
  const variants = await generateResponsiveVariants(processed, id, focal);

  const updates: Partial<MediaDoc> = {
    // keep your existing fields, only merging new/updated ones
    // @ts-expect-error timestamps are numbers in your code
    updatedAt: Date.now(),
    // @ts-expect-error focalPoint exists in your schema (added on upload)
    focalPoint: focal,
    variants,
    // store storagePath for future stability (non-breaking addition)
    // @ts-expect-error allow extra field
    storagePath,
  };

  await collection.doc(id).set(updates as any, { merge: true });

  const fresh = await collection.doc(id).get();
  return fresh.exists ? (fresh.data() as MediaDoc) : null;
}

/* =========================
   NEW: helpers required by new bulk actions
   ========================= */

/**
 * Move a set of media items into a folder (by folderId or name).
 * Writes folderId and bumps updatedAt. Non-destructive.
 */
export async function moveMedia(ids: string[], folderId: string): Promise<void> {
  const batch = getDb().batch();
  const now = Date.now();
  ids.forEach((id) => {
    const ref = collection.doc(id);
    batch.set(ref, { folderId, updatedAt: now }, { merge: true });
  });
  await batch.commit();
}

/**
 * Attach a set of media items to a target entity.
 * Sets both `attachedTo` and boolean `attached` for compatibility with filters.
 */
export async function attachMedia(ids: string[], targetId: string): Promise<void> {
  const batch = getDb().batch();
  const now = Date.now();
  ids.forEach((id) => {
    const ref = collection.doc(id);
    batch.set(
      ref,
      { attachedTo: targetId, attached: true, updatedAt: now },
      { merge: true }
    );
  });
  await batch.commit();
}

/**
 * Detach a set of media items from any target.
 * Clears `attachedTo` and flips `attached` to false.
 */
export async function detachMedia(ids: string[]): Promise<void> {
  const batch = getDb().batch();
  const now = Date.now();
  ids.forEach((id) => {
    const ref = collection.doc(id);
    batch.set(
      ref,
      { attachedTo: FieldValue.delete(), attached: false, updatedAt: now },
      { merge: true }
    );
  });
  await batch.commit();
}

/**
 * Get original file URLs for a list of media IDs.
 * Skips missing docs safely.
 */
export async function getOriginalUrls(ids: string[]): Promise<string[]> {
  const snaps = await Promise.all(ids.map((id) => collection.doc(id).get()));
  const urls: string[] = [];
  for (const s of snaps) {
    if (!s.exists) continue;
    const d = s.data() as MediaDoc & Partial<Record<string, any>>;
    if (d?.url) urls.push(d.url);
  }
  return urls;
}
