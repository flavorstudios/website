import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request, "canManageSystem"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // In a real application, you would clear various caches here
    // For now, we'll simulate cache clearing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to clear cache:", error)
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
  }
}
