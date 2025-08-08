import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { replaceMedia } from "@/lib/media";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, request.ip ?? "", "media_replace_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  const file = form.get("file") as File | null;
  if (!id || !file) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const media = await replaceMedia(id, buffer, file.name, file.type);
  return NextResponse.json({ media });
}