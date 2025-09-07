// app/api/media/delete/route.ts
import { NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
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

  // Accept ID and optional force flag from JSON body or query string
  let id: string | undefined;
  let force = false;
  try {
    const body = await request.json().catch(() => null);
    if (body) {
      id = typeof body.id === "string" ? body.id : undefined;
      force = body.force === true;
    }
  } catch {
    // ignore
  }
  const url = new URL(request.url);
  if (!id) {
    const q = url.searchParams.get("id");
    if (q) id = q;
  }
  if (!force) {
    force = url.searchParams.get("force") === "true";
  }

  id = typeof id === "string" ? id.trim() : "";

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const success = await deleteMedia(id, force);
    return NextResponse.json({ success }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "delete failed";
    const status = message === "MEDIA_IN_USE" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
