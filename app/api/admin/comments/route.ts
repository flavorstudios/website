import { type NextRequest, NextResponse } from "next/server"
import { commentStore } from "@/lib/content-store"

export async function GET() {
  try {
    const comments = await commentStore.getAll()
    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const comment = await commentStore.create(data)
    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
