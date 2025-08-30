import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsService } from "@/lib/notifications"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageUsers"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Resolve the user whose notifications we’re fetching.
    // Replace this with your real session/user resolution.
    const userId =
      request.headers.get("x-admin-user") ||
      request.headers.get("x-user-id") ||
      "admin"

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor") ?? undefined
    const limit = Number(searchParams.get("limit") ?? "20")

    const svc = getNotificationsService()
    const list = await svc.list(userId, { cursor, limit })

    // Conditional GET with ETag
    const ifNoneMatch = request.headers.get("if-none-match")
    if (ifNoneMatch && ifNoneMatch === list.etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: list.etag } })
    }

    // Map service items to your UI shape
    const notifications = list.items.map((n) => {
      const meta = n.metadata as Record<string, unknown> | undefined
      const metaType = typeof meta?.type === "string" ? (meta.type as string) : undefined

      // Keep the legacy "type" for compatibility with your UI
      const type =
        metaType === "comment" || metaType === "contact" || metaType === "flagged"
          ? metaType
          : "comment" // fallback to keep icons/colors stable

      // New fields used by the enhanced UI
      const category =
        typeof meta?.category === "string" ? (meta.category as string) : type
      const priority =
        typeof meta?.priority === "string" ? (meta.priority as string) : "normal"
      const href =
        typeof meta?.href === "string" ? (meta.href as string) : undefined

      return {
        id: n.id,
        type,        // legacy/compat
        category,    // new
        priority,    // new
        href,        // new
        title: n.title,
        message: n.body ?? "",
        timestamp: n.createdAt,
        read: Boolean(n.readAt),
        data: n.metadata ?? undefined,
      }
    })

    return NextResponse.json(
      {
        notifications, // kept for compatibility with your existing UI
        unreadCount: list.unreadCount,
        nextCursor: list.nextCursor,
        success: true,
      },
      {
        headers: {
          ETag: list.etag,
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
