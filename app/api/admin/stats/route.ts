import { type NextRequest, NextResponse } from "next/server"
import { statsStore } from "@/lib/content-store"

export async function GET() {
  try {
    const stats = await statsStore.get()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const stats = await statsStore.update(data)
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 })
  }
}
