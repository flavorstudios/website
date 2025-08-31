import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import { uploadMedia, validateFile, suggestAltText } from "@/lib/media";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, getClientIp(request), "media_upload_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!validateFile(file.type, file.size)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const doc = await uploadMedia(buffer, file.name, file.type);
  doc.alt = suggestAltText(file.name);
  await (await import("@/lib/media")).updateMedia(doc.id, { alt: doc.alt });
  return NextResponse.json({ media: doc });
}