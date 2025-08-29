import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth";
import { listMedia } from "@/lib/media";
import { getClientIp } from "@/lib/ip";

// Ensure this API route is always executed at runtime
export const dynamic = "force-dynamic";

function toInt(val: string | null, fallback: number) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || "";

  try {
    await verifyAdminSession(sessionCookie);
  } catch {
    // Log the denial but do not leak details to the client
    await logAdminAuditFailure(null, getClientIp(request), "media_list_denied");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and sanitize query params
  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, Math.min(100, toInt(searchParams.get("limit"), 50)));
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const startAfter = searchParams.get("cursor")
    ? toInt(searchParams.get("cursor"), NaN)
    : undefined;

  try {
    const result = await listMedia({
      limit,
      search,
      type,
      order,
      startAfter: Number.isFinite(startAfter!) ? startAfter : undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch {
    // Defensive: never leak internal errors
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 },
    );
  }
}
