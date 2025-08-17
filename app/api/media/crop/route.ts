import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Auth gate
  const sessionCookie = request.cookies.get("admin-session")?.value || "";
  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, request.ip ?? "", "media_crop_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read input
  const { id, rect } = await request.json();

  // ⚠️ Lazy-load anything that touches Firebase so it doesn't execute during build
  const { cropMedia } = await import("@/lib/media");

  try {
    const ok = await cropMedia(id, rect);
    return NextResponse.json({ success: !!ok });
  } catch (err: unknown) {
    // If your lib throws a custom message when admin isn’t configured,
    // downgrade to 503 so CI/build doesn’t crash.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ADMIN_DB_UNAVAILABLE") || msg.includes("FIREBASE_ADMIN_NOT_CONFIGURED")) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Crop failed" }, { status: 500 });
  }
}
