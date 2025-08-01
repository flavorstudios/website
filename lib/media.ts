import { getStorage } from "firebase-admin/storage";
import { adminDb } from "@/lib/firebase-admin";
import type { MediaDoc, MediaVariant } from "@/types/media";
import sharp from "sharp";
import crypto from "node:crypto";

const bucket = getStorage().bucket();
const collection = adminDb.collection("media");

function genId() {
  return crypto.randomBytes(8).toString("hex");
}

export async function listMedia(limit = 50): Promise<MediaDoc[]> {
  const snap = await collection.orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => d.data() as MediaDoc);
}

export async function uploadMedia(buffer: Buffer, name: string, mimeType: string): Promise<MediaDoc> {
  const id = genId();
  const file = bucket.file(`media/${id}/${name}`);
  await file.save(buffer, { contentType: mimeType });
  const url = `https://storage.googleapis.com/${bucket.name}/media/${id}/${name}`;
  const doc: MediaDoc = {
    id,
    name,
    mimeType,
    size: buffer.length,
    url,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await collection.doc(id).set(doc);
  return doc;
}

export async function updateMedia(id: string, updates: Partial<MediaDoc>): Promise<MediaDoc | null> {
  await collection.doc(id).set({ ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  const doc = await collection.doc(id).get();
  return doc.exists ? (doc.data() as MediaDoc) : null;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return false;
  const data = doc.data() as MediaDoc;
  const filePath = data.url.split(`https://storage.googleapis.com/${bucket.name}/`)[1];
  await bucket.file(filePath).delete().catch(() => {});
  await collection.doc(id).delete();
  return true;
}

export async function cropMedia(id: string, variantName: string, options: { width: number; height: number; x: number; y: number }) {
  const docSnap = await collection.doc(id).get();
  if (!docSnap.exists) return null;
  const data = docSnap.data() as MediaDoc;
  const filePath = data.url.split(`https://storage.googleapis.com/${bucket.name}/`)[1];
  const origBuffer = await bucket.file(filePath).download();
  const outBuffer = await sharp(origBuffer[0])
    .extract({ width: options.width, height: options.height, left: options.x, top: options.y })
    .toBuffer();
  const variantFile = bucket.file(`media/${id}/${variantName}`);
  await variantFile.save(outBuffer, { contentType: data.mimeType });
  const variantUrl = `https://storage.googleapis.com/${bucket.name}/media/${id}/${variantName}`;
  const variant: MediaVariant = { url: variantUrl, width: options.width, height: options.height };
  const variants = data.variants ? [...data.variants, variant] : [variant];
  await collection.doc(id).set({ variants, updatedAt: new Date().toISOString() }, { merge: true });
  return variant;
}

export function suggestAltText(name: string): string {
  return name.replace(/[-_]/g, " ").split(".")[0];
}

export function validateFile(mimeType: string, size: number): boolean {
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowed.includes(mimeType)) return false;
  return size <= 10 * 1024 * 1024;
}