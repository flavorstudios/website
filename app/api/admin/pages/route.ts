import { requireAdmin } from "@/lib/admin-auth"
import { type NextRequest, NextResponse } from "next/server"
import { pageStore } from "@/lib/content-store"

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const pages = await pageStore.getAll()
    return NextResponse.json(pages)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { page, section, content } = await request.json()
    const updatedPage = await pageStore.update(page, section, content, "Admin")
    return NextResponse.json(updatedPage)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
}
