import { type NextRequest, NextResponse } from "next/server"
import { pageStore } from "@/lib/content-store"

export async function GET() {
  try {
    const pages = await pageStore.getAll()
    return NextResponse.json(pages)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { page, section, content } = await request.json()
    const updatedPage = await pageStore.update(page, section, content, "Admin")
    return NextResponse.json(updatedPage)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
}
