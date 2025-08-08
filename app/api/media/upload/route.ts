export const runtime = "nodejs"; // needed for Buffer/fs

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { uploadMedia, validateFile, suggestAltText, scanBuffer } from "@/lib/media";
import { getAdminDb } from "@/lib/firebase-admin";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { logRouteAudit } from "@/lib/audit";

const TMP_DIR = "/tmp/uploads";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

export async function POST(request: NextRequest) {
  // ---- Auth ----
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

  let admin: { uid: string; role?: string };
  try {
    admin = await verifyAdminSession(sessionCookie);
  } catch {
    // prefer proxy header over request.ip in serverless
    await logAdminAuditFailure(null, ip, "media_upload_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Detect Uppy/XHR chunked uploads via headers
  const headers = request.headers;
  const uploadId = headers.get("x-upload-id");
  const hasChunkHeaders =
    uploadId ||
    headers.get("x-chunk-index") ||
    headers.get("x-total-chunks") ||
    headers.get("x-file-name");

  if (hasChunkHeaders) {
    // ---- Chunked/resumable path (Uppy XHRUpload) ----
    const id = uploadId || crypto.randomUUID();
    const chunkIndex = parseInt(headers.get("x-chunk-index") || "0", 10);
    const totalChunks = parseInt(headers.get("x-total-chunks") || "1", 10);
    const fileName = headers.get("x-file-name") || "file";
    const fileType = headers.get("x-file-type") || "application/octet-stream";
    const declaredSize = parseInt(headers.get("x-file-size") || "0", 10);
    const declaredHash = headers.get("x-file-hash") || "";

    // Append chunk to temp file
    const bodyBuf = Buffer.from(await request.arrayBuffer());
    const tmpPath = path.join(TMP_DIR, id);
    await fs.promises.appendFile(tmpPath, bodyBuf);

    // If not last chunk, acknowledge and return
    if (chunkIndex + 1 < totalChunks) {
      return NextResponse.json({ received: chunkIndex });
    }

    // Finalize: read, unlink
    const finalBuffer = await fs.promises.readFile(tmpPath);
    await fs.promises.unlink(tmpPath).catch(() => {});

    // Validate
    if (
      !validateFile(fileType, finalBuffer.length) ||
      (declaredSize && finalBuffer.length !== declaredSize)
    ) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    // AV scan hook
    const clean = await scanBuffer(finalBuffer);
    if (!clean) {
      return NextResponse.json({ error: "AV scan failed" }, { status: 400 });
    }

    // Compute & verify hash
    const computedHash = crypto.createHash("sha256").update(finalBuffer).digest("hex");
    if (declaredHash && declaredHash !== computedHash) {
      return NextResponse.json({ error: "Hash mismatch" }, { status: 400 });
    }

    // Duplicate detection by hash
    const db = getAdminDb();
    const dupSnap = await db.collection("media").where("hash", "==", computedHash).limit(1).get();
    if (!dupSnap.empty) {
      return NextResponse.json({ error: "Duplicate file" }, { status: 409 });
    }

    // Store (associate with uploader)
    const doc = await uploadMedia(finalBuffer, fileName, fileType, admin.uid);

    // Friendly default alt + persist hash for future dedupe
    const alt = suggestAltText(fileName);
    await (await import("@/lib/media")).updateMedia(
      doc.id,
      { alt, hash: computedHash as any },
      admin.uid
    );

    // Audit
    await logRouteAudit({ uid: admin.uid, action: "upload", target: doc.id, req: request });

    // Quota warning passthrough
    const res: any = { media: { ...doc, alt } };
    if ((doc as any).quotaExceeded) res.warning = "quota-exceeded";
    return NextResponse.json(res);
  }

  // ---- Fallback: original form-data single-file path (backward compatible) ----
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!validateFile(file.type, file.size)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Optional AV on legacy path
  const clean = await scanBuffer(buffer);
  if (!clean) {
    return NextResponse.json({ error: "AV scan failed" }, { status: 400 });
  }

  // Best-effort hash for legacy path (helps future dedupe)
  const computedHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Store (associate with uploader)
  const doc = await uploadMedia(buffer, file.name, file.type, admin.uid);

  // Friendly default alt + persist hash
  const alt = suggestAltText(file.name);
  await (await import("@/lib/media")).updateMedia(
    doc.id,
    { alt, hash: computedHash as any },
    admin.uid
  );

  // Audit
  await logRouteAudit({ uid: admin.uid, action: "upload", target: doc.id, req: request });

  // Quota warning passthrough
  const res: any = { media: { ...doc, alt } };
  if ((doc as any).quotaExceeded) res.warning = "quota-exceeded";
  return NextResponse.json(res);
}
