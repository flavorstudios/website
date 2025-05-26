import { NextResponse } from "next/server"
import { initializeSampleData } from "@/lib/admin-store"

export async function POST() {
  try {
    await initializeSampleData()
    return NextResponse.json({ success: true, message: "Sample data initialized successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to initialize sample data" }, { status: 500 })
  }
}
