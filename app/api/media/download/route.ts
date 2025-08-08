import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { getOriginalUrls } from "@/lib/media";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, request.ip ?? "", "media_download_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { ids } = await request.json();
  const urls = await getOriginalUrls(ids);
  return NextResponse.json({ urls });
}