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

  // Limit with sane caps
  const rawLimit = Number.parseInt(searchParams.get("limit") || "50", 10);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 100)) : 50;

  const search = searchParams.get("search") || undefined; // filename, title, caption, description, tags, uploader (handled in lib)
  const type = searchParams.get("type") || undefined;     // mime prefix, e.g. "image"
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  // Cursor
  const cursorParam = searchParams.get("cursor");
  const startAfter = cursorParam && /^\d+$/.test(cursorParam) ? Number.parseInt(cursorParam, 10) : undefined;

  // New advanced filters
  const monthParam = searchParams.get("month"); // "1".."12"
  const yearParam = searchParams.get("year");   // "2023", etc.
  const sizeParam = searchParams.get("size");
  const attachedParam = searchParams.get("attached");
  const tagsParam = searchParams.get("tags");   // comma-separated

  // Optional folder/favorites (for folders sidebar & quick favorites)
  const folderId = searchParams.get("folderId") || undefined;
  const starred =
    searchParams.get("starred") === "true"
      ? true
      : searchParams.get("starred") === "false"
      ? false
      : undefined;

  // Validate numeric filters
  const monthNum = monthParam ? Number.parseInt(monthParam, 10) : undefined;
  const month =
    monthNum && Number.isFinite(monthNum) && monthNum >= 1 && monthNum <= 12
      ? monthNum
      : undefined;

  const yearNum = yearParam ? Number.parseInt(yearParam, 10) : undefined;
  const year =
    yearNum && Number.isFinite(yearNum) && yearNum >= 1970 && yearNum <= 2100
      ? yearNum
      : undefined;

  // Validate enums
  const size = (["small", "medium", "large"].includes(sizeParam || "") ? (sizeParam as "small" | "medium" | "large") : undefined);
  const attached = (["attached", "unattached"].includes(attachedParam || "") ? (attachedParam as "attached" | "unattached") : undefined);

  // Tags list (trim + dedupe)
  const tags =
    tagsParam
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i) || undefined;

  // Fetch paginated media list with options
  const result = await listMedia({
    limit,
    search,
    type,
    order,
    startAfter,
    month,
    year,
    size,
    attached,
    tags,
    folderId,
    starred,
  });

  return NextResponse.json(result);
}
