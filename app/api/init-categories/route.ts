import { NextResponse } from "next/server"
import { initializeCleanData } from "@/lib/content-store"

export async function GET() {
  try {
    await initializeCleanData()
    return NextResponse.json({
      success: true,
      message: "All content-data files initialized successfully.",
    })
  } catch (error) {
    console.error("Failed to initialize data files:", error)
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    )
  }
}
