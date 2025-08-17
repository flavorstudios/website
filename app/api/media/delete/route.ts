// app/api/media/delete/route.ts
import { NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { deleteMedia } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// — Helpers -----------------------------------------------------------------

function getSessionCookie(req: Request): string {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("admin-session="))
    ?.split("=")[1];
  return raw ? decodeURIComponent(raw) : "";
}

function getClientIp(req: Request): string {
  // Common proxy headers; fall back to unknown
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() || "unknown";
  const xreal = req.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  const forwarded = req.headers.get("forwarded");
  if (forwarded) {
    const m = forwarded.match(/for="?([^;"]+)"?/i);
    if (m?.[1]) return m[1];
  }
  return "unknown";
}

// — Route -------------------------------------------------------------------

export async function POST(request: Request) {
  const sessionCookie = getSessionCookie(request);
  const ip = getClientIp(request);

  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    await logAdminAuditFailure(null, ip, "media_delete_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept ID from JSON body (primary) or query string (fallback)
  let id: string | undefined;
  try {
    const body = await request.json().catch(() => null);
    id = typeof body?.id === "string" ? body.id : undefined;
  } catch {
    // ignore, we'll check query param below
  }
  if (!id) {
    const url = new URL(request.url);
    const q = url.searchParams.get("id");
    if (q) id = q;
  }

  id = typeof id === "string" ? id.trim() : "";

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const success = await deleteMedia(id);
    return NextResponse.json({ success }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
