import { NextResponse } from "next/server"

// Redirect /feed.xml to /rss.xml for compatibility
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"

  return NextResponse.redirect(`${baseUrl}/rss.xml`, 301)
}
