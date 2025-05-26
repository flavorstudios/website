import { type NextRequest, NextResponse } from "next/server"
import { videoStore } from "@/lib/content-store"

export async function GET() {
  try {
    const videos = await videoStore.getAll()
    return NextResponse.json(videos)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const video = await videoStore.create(data)
    return NextResponse.json(video)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
