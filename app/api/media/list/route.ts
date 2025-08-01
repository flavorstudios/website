import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { listMedia } from "@/lib/media";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, request.ip ?? "", "media_list_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const media = await listMedia();
  return NextResponse.json({ media });
}