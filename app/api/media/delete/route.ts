import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { trashMedia } from "@/lib/media";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

  let admin: { uid: string };
  try {
    admin = await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, ip, "media_delete_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Basic payload validation
  let id: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.id === "string" && body.id.trim().length > 0) {
      id = body.id.trim();
    }
  } catch {
    // fallthrough to 400 below
  }
  if (!id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Soft-delete (move to Trash)
  const success = await trashMedia(id, admin.uid);
  return NextResponse.json({ success });
}
