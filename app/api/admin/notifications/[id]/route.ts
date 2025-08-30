import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { getNotificationsService } from "@/lib/notifications";
import { publishToUser } from "@/lib/sse-broker";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/notifications/[id]
 * Body: { read?: boolean }
 * - Marks a single notification as read (default) or toggles read=false if explicitly sent.
 * - Delegates to NotificationsService (DB baseline; push providers optional).
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  // Admin gate
  if (!(await requireAdmin(request))) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    // Resolve ID from route params or URL as a fallback
    let id = context.params.id;
    if (!id) {
      const pathname = new URL(request.url).pathname;
      const parts = pathname.split("/").filter(Boolean);
      id = parts[parts.length - 1];
    }
    if (!id) {
      return NextResponse.json(
        { error: "Missing notification id", code: "MISSING_ID" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Parse body (optional). Default to read=true if absent or invalid.
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      // ignore parse errors; treat as empty body
    }
    const parsed = (body && typeof body === "object" ? (body as { read?: boolean }) : null) || null;
    const read = typeof parsed?.read === "boolean" ? parsed.read : true;

    // Get a user context. In many admin dashboards this will be the admin user.
    // If you have a real session, replace this with your user-id lookup.
    const userId =
      request.headers.get("x-admin-user") ||
      request.headers.get("x-user-id") ||
      "admin";

    const svc = getNotificationsService();

    // Our service exposes markRead (no markUnread). If read=false, do a no-op.
    if (read) {
      await svc.markRead(userId, id);
      // Notify live clients via SSE (badge/popover updates)
      publishToUser(userId, "read", { id });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notification updated",
        id,
        read,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update notification", code: "SERVER_ERROR" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
