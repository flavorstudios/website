import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // In a real application, this would fetch from Firestore
    // For now, return empty array to show no dummy data
    return NextResponse.json({
      activities: [], // Real activities will come from Firestore
      success: true,
    })
  } catch (error) {
    console.error("Failed to fetch activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
