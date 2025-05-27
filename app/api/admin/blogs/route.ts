import { type NextRequest, NextResponse } from "next/server"
import { blogStore } from "@/lib/content-store"

export async function GET() {
  try {
    const blogs = await blogStore.getAll()
    return NextResponse.json({ posts: blogs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const blog = await blogStore.create(data)
    return NextResponse.json(blog)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}
