import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // In a real application, this would fetch from Firestore notifications collection
    // For now, return empty array to show no fake data
    return NextResponse.json({
      notifications: [], // Real notifications will come from Firestore
      success: true,
    })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
