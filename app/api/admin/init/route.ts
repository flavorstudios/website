import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { initializeRealData } from "@/lib/content-store"

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    await initializeRealData()
    return NextResponse.json({ success: true, message: "Data initialized successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to initialize data" }, { status: 500 })
  }
}
