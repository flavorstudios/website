// app/api/media/delete/route.ts
import { NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { deleteMedia } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie =
    cookieHeader
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("admin-session="))
      ?.split("=")[1] ?? "";

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, ip, "media_delete_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let id: string | undefined;
  try {
    const body = await request.json();
    id = body?.id;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const success = await deleteMedia(id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
