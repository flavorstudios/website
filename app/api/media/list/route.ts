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

  // Read query params for filtering, search, ordering, pagination
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const cursorParam = searchParams.get("cursor");
  const startAfter = cursorParam ? parseInt(cursorParam, 10) : undefined;

  // Fetch paginated media list with options
  const result = await listMedia({ limit, search, type, order, startAfter });

  return NextResponse.json(result);
}
