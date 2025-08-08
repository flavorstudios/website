import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession, logAdminAuditFailure } from "@/lib/admin-auth"
import { restoreMedia } from "@/lib/media"

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin-session")?.value || ""
  let admin
  try {
    admin = await verifyAdminSession(sessionCookie)
  } catch {
    await logAdminAuditFailure(null, request.ip ?? "", "media_restore_denied")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await request.json()
  const success = await restoreMedia(id, admin.uid)
  return NextResponse.json({ success })
}