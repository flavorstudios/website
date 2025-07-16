import { NextResponse } from "next/server"
import { initializeSampleData } from "@/lib/admin-store"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(request: Request) {
  // Protect this route: only allow if admin session is valid
  if (!(await requireAdmin(request as any))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await initializeSampleData()
    return NextResponse.json({ success: true, message: "Sample data initialized successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to initialize sample data" }, { status: 500 })
  }
}
