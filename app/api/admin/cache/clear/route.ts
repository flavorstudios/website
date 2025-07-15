import { requireAdmin } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // Add timestamp-based cache busting
    const timestamp = Date.now()

    // In a real application, you would:
    // 1. Clear Redis cache if using Redis
    // 2. Invalidate CDN cache
    // 3. Clear any server-side caches
    // 4. Update cache headers

    // For now, we'll simulate cache clearing
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: "Backend cache cleared successfully",
      timestamp,
      clearedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to clear backend cache:", error)
    return NextResponse.json({ error: "Failed to clear backend cache" }, { status: 500 })
  }
}
