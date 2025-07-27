import { NextResponse, NextRequest } from "next/server"
import { initializeSampleData } from "@/lib/content-store"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  // Protect this route: only allow if admin session is valid
  if (!(await requireAdmin(request as NextRequest))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await initializeSampleData()
    return NextResponse.json({ success: true, message: "Sample data initialized successfully" })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to initialize sample data" }, { status: 500 })
  }
}
