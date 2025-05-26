import { NextResponse } from "next/server"
import { initializeRealData } from "@/lib/content-store"

export async function POST() {
  try {
    await initializeRealData()
    return NextResponse.json({ success: true, message: "Data initialized successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to initialize data" }, { status: 500 })
  }
}
